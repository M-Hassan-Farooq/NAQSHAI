// Purged all hardcoded MOCK_INVENTORY.
// NAQSHAI AI chatbot pipeline now pulls live data exclusively from Supabase via /api/chat.
import { POST as handleChat } from '../chat/route';

export const dynamic = 'force-dynamic';

export async function POST(req) {
    return handleChat(req);
}
