/**
 * Helper for conversational utilities.
 * Note: Fragile regex interceptors and canned responses have been completely removed
 * in favor of native Google Gemini function calling and dynamic LLM understanding.
 */

export function getFastConversationalReply() {
  // Deprecated: No longer intercepts user queries.
  // All messages now flow directly through the Gemini pipeline with full context.
  return null;
}
