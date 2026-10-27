import { getAdminClient } from './authServer';

/**
 * Records an immutable audit log entry for document actions (upload, download, view).
 * Gracefully logs to server console if the database table is pending execution.
 *
 * @param {object} params
 * @param {string} params.draftId
 * @param {string} params.fieldName
 * @param {string} params.filePath
 * @param {string} [params.fileHash]
 * @param {string} [params.actorId]
 * @param {string} [params.actorRole='owner'] 'owner' | 'operator' | 'system'
 * @param {string} [params.action='download'] 'upload' | 'download' | 'view'
 * @param {Request} [params.request] Incoming HTTP request to capture IP & User-Agent
 */
export async function logDocumentAccess({
  draftId,
  fieldName,
  filePath,
  fileHash = null,
  actorId = 'anonymous',
  actorRole = 'owner',
  action = 'download',
  request = null,
}) {
  const ip =
    request?.headers?.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request?.headers?.get('x-real-ip') ||
    '127.0.0.1';
  const userAgent = request?.headers?.get('user-agent') || 'Unknown';
  const now = new Date().toISOString();

  const logEntry = {
    draft_id: draftId || null,
    field_name: fieldName,
    file_path: filePath,
    file_hash: fileHash,
    actor_id: actorId,
    actor_role: actorRole,
    action,
    ip_address: ip,
    user_agent: userAgent,
    created_at: now,
  };

  try {
    const dbAdmin = getAdminClient();
    const { error } = await dbAdmin.from('document_access_logs').insert([logEntry]);
    if (error) {
      // If table has not yet been executed in Supabase SQL editor, fall back to console audit log
      console.log(`[AUDIT LOG - ${action.toUpperCase()}]`, JSON.stringify(logEntry));
    }
  } catch (err) {
    console.log(`[AUDIT LOG - ${action.toUpperCase()}]`, JSON.stringify(logEntry));
  }
}
