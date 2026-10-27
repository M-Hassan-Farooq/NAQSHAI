import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { getUserFromRequest, getAdminClient } from '@/lib/authServer';
import {
  validateDocumentFormatAndSize,
  computeFileHash,
  encryptDocument,
} from '@/lib/documentCipher';
import { logDocumentAccess } from '@/lib/documentLogger';

export const dynamic = 'force-dynamic';

const VALID_FIELDS = new Set(['allotmentLetter', 'cnicFront', 'cnicBack']);

/**
 * POST /api/documents/upload
 *
 * Secure backend document upload pipeline:
 * 1. Verifies caller authentication via Bearer token.
 * 2. Validates user ownership of the targeted listing draft.
 * 3. Enforces strict MIME & magic-byte inspection (PDF, JPEG, PNG, WEBP) and 10MB size limit.
 * 4. Computes deterministic SHA-256 cryptographic file hash.
 * 5. Generates an unguessable random UUID filename ([uuid].enc).
 * 6. Encrypts the file buffer with AES-256-GCM before uploading to private bucket.
 * 7. Records an immutable audit log entry.
 */
export async function POST(request) {
  try {
    const { user, error: authError } = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized. Please sign in to upload documents.', detail: authError },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const field = formData.get('field');
    const draftId = formData.get('draftId');

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing document file in request.' },
        { status: 400 }
      );
    }

    if (!field || typeof field !== 'string' || !VALID_FIELDS.has(field)) {
      return NextResponse.json(
        { success: false, error: `Invalid document field. Allowed fields: ${Array.from(VALID_FIELDS).join(', ')}.` },
        { status: 400 }
      );
    }

    if (!draftId || typeof draftId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing draftId for document association.' },
        { status: 400 }
      );
    }

    const dbAdmin = getAdminClient();

    // Verify draft ownership and status
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
        { success: false, error: 'Target draft not found.' },
        { status: 404 }
      );
    }

    if (draft.user_id !== user.id) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: You do not own this listing draft.' },
        { status: 403 }
      );
    }

    if (draft.status !== 'draft' && draft.status !== 'rejected') {
      return NextResponse.json(
        { success: false, error: 'This listing has already been submitted and cannot accept new document uploads.' },
        { status: 409 }
      );
    }

    // Read file bytes
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // Validate format & size via magic bytes
    const validation = validateDocumentFormatAndSize(fileBuffer, file.name);
    if (!validation.isValid) {
      return NextResponse.json(
        { success: false, error: validation.error || 'Invalid file format.' },
        { status: 400 }
      );
    }

    // Compute cryptographic SHA-256 hash before encryption
    const sha256 = computeFileHash(fileBuffer);

    // Generate random UUID for unguessable storage filename
    const fileUuid = crypto.randomUUID();
    const storagePath = `${user.id}/${draftId}/${fileUuid}.enc`;

    // Encrypt the file buffer with AES-256-GCM
    const encryptedBuffer = encryptDocument(fileBuffer);

    // Upload encrypted payload to private Supabase Storage bucket using service role
    const { error: uploadErr } = await dbAdmin.storage
      .from('plot-documents')
      .upload(storagePath, encryptedBuffer, {
        contentType: 'application/octet-stream',
        cacheControl: 'private, no-cache',
        upsert: true,
      });

    if (uploadErr) {
      console.error('[documents/upload] Storage write error:', uploadErr);
      return NextResponse.json(
        { success: false, error: `Storage upload failed: ${uploadErr.message}` },
        { status: 500 }
      );
    }

    // Clean safe original display name
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');

    const fileEntry = {
      path: storagePath,
      name: safeName,
      size: fileBuffer.length,
      mimeType: validation.mimeType,
      sha256,
      encrypted: true,
      uploadedAt: new Date().toISOString(),
    };

    // Update draft's uploadedFiles record in DB
    const existingUploaded = draft.form_data?.uploadedFiles || {};
    const updatedUploaded = { ...existingUploaded, [field]: fileEntry };
    const updatedFormData = { ...draft.form_data, uploadedFiles: updatedUploaded };

    await dbAdmin
      .from('listing_drafts')
      .update({ form_data: updatedFormData, updated_at: new Date().toISOString() })
      .eq('id', draftId);

    // Record immutable audit log
    await logDocumentAccess({
      draftId,
      fieldName: field,
      filePath: storagePath,
      fileHash: sha256,
      actorId: user.id,
      actorRole: 'owner',
      action: 'upload',
      request,
    });

    return NextResponse.json({
      success: true,
      file: fileEntry,
    });
  } catch (err) {
    console.error('[documents/upload] Unexpected exception:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
