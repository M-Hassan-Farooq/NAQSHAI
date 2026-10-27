import { NextResponse } from 'next/server';
import {
  getUserFromRequest,
  getBearerToken,
  isOperatorToken,
  getAdminClient,
} from '@/lib/authServer';
import {
  verifyDocumentAccessToken,
  decryptDocument,
} from '@/lib/documentCipher';
import { logDocumentAccess } from '@/lib/documentLogger';

export const dynamic = 'force-dynamic';

/**
 * GET /api/documents/download?draftId=<uuid>&field=<field>&token=<dat_token>
 *
 * Secure backend document streaming & download pipeline:
 * 1. Checks permissions (operator passphrase, owner bearer token, or signed access token).
 * 2. Fetches the ciphertext from private 'plot-documents' storage using privileged admin client.
 * 3. Decrypts AES-256-GCM authenticated payload in server memory.
 * 4. Logs immutable access event to public.document_access_logs.
 * 5. Streams decrypted document directly to the client with strict security headers.
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const draftId = searchParams.get('draftId');
    const field = searchParams.get('field');
    const queryToken = searchParams.get('token');

    if (!draftId || !field) {
      return NextResponse.json(
        { success: false, error: 'Missing required query parameters: draftId and field.' },
        { status: 400 }
      );
    }

    const dbAdmin = getAdminClient();

    // Load target draft
    const { data: draft, error: draftErr } = await dbAdmin
      .from('listing_drafts')
      .select('id, user_id, status, form_data')
      .eq('id', draftId)
      .maybeSingle();

    if (draftErr) {
      return NextResponse.json(
        { success: false, error: `Failed to load draft: ${draftErr.message}` },
        { status: 500 }
      );
    }

    if (!draft) {
      return NextResponse.json(
        { success: false, error: 'Listing draft not found.' },
        { status: 404 }
      );
    }

    // Verify Authorization
    let isAuthorized = false;
    let actorId = 'unknown';
    let actorRole = 'unauthorized';

    // Check Method A: Query String Signed Access Token (dat_...)
    if (queryToken) {
      const tokenVerification = verifyDocumentAccessToken(queryToken, draftId, field);
      if (tokenVerification.valid) {
        isAuthorized = true;
        if (tokenVerification.isOperator) {
          actorId = 'operator';
          actorRole = 'operator';
        } else {
          actorId = tokenVerification.userId || draft.user_id;
          actorRole = 'owner';
        }
      }
    }

    // Check Method B: Bearer Header Token (Operator Passphrase or User Auth JWT)
    if (!isAuthorized) {
      const rawBearer = getBearerToken(request);
      if (rawBearer && isOperatorToken(rawBearer)) {
        isAuthorized = true;
        actorId = 'operator';
        actorRole = 'operator';
      } else {
        const { user } = await getUserFromRequest(request);
        if (user && user.id === draft.user_id) {
          isAuthorized = true;
          actorId = user.id;
          actorRole = 'owner';
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not have permission to view or download this document.' },
        { status: 403 }
      );
    }

    // Extract file reference from draft
    const uploaded = draft.form_data?.uploadedFiles || {};
    const fileEntry = uploaded[field];
    if (!fileEntry) {
      return NextResponse.json(
        { success: false, error: `No document attached for field "${field}".` },
        { status: 404 }
      );
    }

    const filePath = typeof fileEntry === 'string' ? fileEntry : fileEntry.path;
    const originalName = typeof fileEntry === 'object' ? fileEntry.name : `${field}.pdf`;
    const mimeType = (typeof fileEntry === 'object' && fileEntry.mimeType) || 'application/pdf';
    const fileHash = typeof fileEntry === 'object' ? fileEntry.sha256 : null;

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: 'Document path missing from draft records.' },
        { status: 404 }
      );
    }

    // Download encrypted payload from private Supabase Storage bucket
    const { data: storageBlob, error: downloadErr } = await dbAdmin.storage
      .from('plot-documents')
      .download(filePath);

    if (downloadErr || !storageBlob) {
      console.error(`[documents/download] Failed to fetch "${filePath}":`, downloadErr);
      return NextResponse.json(
        { success: false, error: 'Document could not be retrieved from secure storage.' },
        { status: 404 }
      );
    }

    // Convert to Buffer
    const arrayBuffer = await storageBlob.arrayBuffer();
    const rawBuffer = Buffer.from(arrayBuffer);

    // Decrypt authenticated AES-256-GCM payload in server memory
    let decryptedBuffer;
    try {
      decryptedBuffer = decryptDocument(rawBuffer);
    } catch (decErr) {
      console.error('[documents/download] Decryption failed for', filePath, decErr);
      return NextResponse.json(
        { success: false, error: 'Document decryption failed. Integrity verification check failed.' },
        { status: 500 }
      );
    }

    // Log access event to audit table
    await logDocumentAccess({
      draftId,
      fieldName: field,
      filePath,
      fileHash,
      actorId,
      actorRole,
      action: 'download',
      request,
    });

    const safeFilename = encodeURIComponent(originalName.replace(/[^a-zA-Z0-9._-]/g, '_'));

    // Return decrypted file stream
    return new Response(decryptedBuffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `inline; filename="${safeFilename}"`,
        'Content-Length': String(decryptedBuffer.length),
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'X-Document-SHA256': fileHash || '',
      },
    });
  } catch (err) {
    console.error('[documents/download] Unexpected exception:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
