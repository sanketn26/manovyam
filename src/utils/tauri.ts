/**
 * Tauri Utilities
 * Detects if running in Tauri environment and provides safe invoke wrapper
 */

declare global {
  interface Window {
    __TAURI__?: {
      invoke: <T>(command: string, args?: Record<string, unknown>) => Promise<T>;
    };
  }
}

/**
 * Check if running in Tauri environment
 */
export const isTauri = (): boolean => {
  return typeof window !== "undefined" && window.__TAURI__ !== undefined;
};

/**
 * Safe invoke wrapper that falls back to mock in browser
 */
export async function tauriInvoke<T>(
  command: string,
  args?: Record<string, unknown>
): Promise<T> {
  if (isTauri() && window.__TAURI__) {
    return window.__TAURI__.invoke<T>(command, args);
  }
  
  // In browser environment, throw error to trigger fallback service
  throw new Error(
    `Tauri command '${command}' not available in browser environment`
  );
}

/**
 * Tauri Command Names
 * Centralized list of all backend commands
 */
export const TauriCommands = {
  // Notes
  GET_ALL_NOTES: "get_all_notes",
  GET_NOTE_BY_ID: "get_note_by_id",
  CREATE_NOTE: "create_note",
  UPDATE_NOTE: "update_note",
  DELETE_NOTE: "delete_note",
  SEARCH_NOTES: "search_notes",
  
  // Tags
  GET_ALL_TAGS: "get_all_tags",
  CREATE_TAG: "create_tag",
  UPDATE_TAG: "update_tag",
  DELETE_TAG: "delete_tag",
  ADD_TAG_TO_NOTE: "add_tag_to_note",
  REMOVE_TAG_FROM_NOTE: "remove_tag_from_note",
  
  // AI Chats
  GET_ALL_AI_CHATS: "get_all_ai_chats",
  GET_AI_CHAT_BY_ID: "get_ai_chat_by_id",
  CREATE_AI_CHAT: "create_ai_chat",
  UPDATE_AI_CHAT: "update_ai_chat",
  DELETE_AI_CHAT: "delete_ai_chat",
  
  // Highlights
  GET_ALL_HIGHLIGHTS: "get_all_highlights",
  CREATE_HIGHLIGHT: "create_highlight",
  DELETE_HIGHLIGHT: "delete_highlight",
  
  // Settings
  GET_SETTINGS: "get_settings",
  UPDATE_SETTINGS: "update_settings",
  
  // Sync
  GET_SYNC_METADATA: "get_sync_metadata",
  UPDATE_SYNC_METADATA: "update_sync_metadata",
  EXPORT_DATABASE: "export_database",
  IMPORT_DATABASE: "import_database",
  
  // Search
  FULL_TEXT_SEARCH: "full_text_search",
} as const;
