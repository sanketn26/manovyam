/**
 * Jotai Atoms
 * Global state management using atomic state
 */
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Note } from "../models/Note";
import { AIMessage } from "../models/AIMessage";
import { Settings, DEFAULT_SETTINGS } from "../models/Settings";
import { SyncStatus } from "../models/SyncMetadata";

// ============================================================================
// Notes
// ============================================================================

/**
 * All notes in the app
 */
export const notesAtom = atom<Note[]>([]);

/**
 * Currently active note ID
 */
export const activeNoteIdAtom = atomWithStorage<string | null>(
  "manovyam-active-note-id",
  null
);

/**
 * Search query for filtering notes
 */
export const searchQueryAtom = atom<string>("");

/**
 * Filtered notes (derived atom)
 */
export const filteredNotesAtom = atom((get) => {
  const notes = get(notesAtom);
  const query = get(searchQueryAtom);

  if (!query.trim()) return notes;

  const lowerQuery = query.toLowerCase();
  return notes.filter(
    (note) =>
      note.title.toLowerCase().includes(lowerQuery) ||
      note.content.toLowerCase().includes(lowerQuery)
  );
});

/**
 * Active note (derived atom)
 */
export const activeNoteAtom = atom((get) => {
  const notes = get(notesAtom);
  const activeId = get(activeNoteIdAtom);
  return notes.find((note) => note.id === activeId) || null;
});

// ============================================================================
// AI
// ============================================================================

/**
 * AI conversation messages
 */
export const aiMessagesAtom = atom<AIMessage[]>([]);

/**
 * Selected AI model
 */
export const selectedAIModelAtom = atomWithStorage<string>(
  "manovyam-selected-ai-model",
  "gpt-4-turbo"
);

/**
 * AI panel open/closed state
 */
export const aiPanelOpenAtom = atom<boolean>(false);

/**
 * AI loading state
 */
export const aiLoadingAtom = atom<boolean>(false);

// ============================================================================
// Settings
// ============================================================================

/**
 * Application settings
 */
export const settingsAtom = atom<Settings>(DEFAULT_SETTINGS);

/**
 * Auto-save enabled (derived from settings)
 */
export const autoSaveEnabledAtom = atom((get) => get(settingsAtom).autoSave);

/**
 * Auto-save delay (derived from settings)
 */
export const autoSaveDelayAtom = atom((get) => get(settingsAtom).autoSaveDelay);

// ============================================================================
// Sync
// ============================================================================

/**
 * Current sync status
 */
export const syncStatusAtom = atom<SyncStatus>({
  isSyncing: false,
});

/**
 * Last synced timestamp
 */
export const lastSyncedAtAtom = atom<Date | undefined>(undefined);

// ============================================================================
// UI State
// ============================================================================

/**
 * Sidebar collapsed state
 */
export const sidebarCollapsedAtom = atomWithStorage<boolean>(
  "manovyam-sidebar-collapsed",
  false
);

/**
 * Editor focus state
 */
export const editorFocusedAtom = atom<boolean>(false);

/**
 * Current save status
 */
export const saveStatusAtom = atom<
  "saved" | "saving" | "error" | "unsaved"
>("saved");

/**
 * Loading state for initial data fetch
 */
export const isLoadingAtom = atom<boolean>(true);

/**
 * Error message
 */
export const errorAtom = atom<string | null>(null);

// ============================================================================
// Theme
// ============================================================================

/**
 * Theme preference
 */
export const themeAtom = atomWithStorage<"light" | "dark" | "system">(
  "manovyam-theme",
  "dark"
);

/**
 * Resolved theme (computed based on system preference if theme is "system")
 */
export const resolvedThemeAtom = atom((get) => {
  const theme = get(themeAtom);
  
  if (theme === "system") {
    // Check system preference
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "dark";
  }
  
  return theme;
});
