import { useEffect, useCallback } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { Note, CreateNoteDto, UpdateNoteDto } from "../models/Note";
import { INoteService } from "../services/interfaces/INoteService";
import { ISettingsService } from "../services/interfaces/ISettingsService";
import {
  notesAtom,
  activeNoteIdAtom,
  activeNoteAtom,
  searchQueryAtom,
  filteredNotesAtom,
  isLoadingAtom,
  errorAtom,
  saveStatusAtom,
  autoSaveEnabledAtom,
  autoSaveDelayAtom,
} from "../store/atoms";
import { useDebounce } from "../utils/debounce";

/**
 * ViewModel for Notes
 * Manages the state and business logic for notes using Jotai
 * Acts as a bridge between the View (components) and Service (data layer)
 */
export function useNotesViewModel(
  noteService: INoteService,
  settingsService: ISettingsService
) {
  // Jotai atoms
  const [notes, setNotes] = useAtom(notesAtom);
  const [activeNoteId, setActiveNoteId] = useAtom(activeNoteIdAtom);
  const activeNote = useAtomValue(activeNoteAtom);
  const filteredNotes = useAtomValue(filteredNotesAtom);
  const [searchQuery, setSearchQuery] = useAtom(searchQueryAtom);
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom);
  const [error, setError] = useAtom(errorAtom);
  const setSaveStatus = useSetAtom(saveStatusAtom);
  const autoSaveEnabled = useAtomValue(autoSaveEnabledAtom);
  const autoSaveDelay = useAtomValue(autoSaveDelayAtom);

  /**
   * Load all notes from the service
   */
  const loadNotes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const loadedNotes = await noteService.getAllNotes();
      setNotes(loadedNotes);

      // Set the first note as active if none is selected
      if (!activeNoteId && loadedNotes.length > 0) {
        setActiveNoteId(loadedNotes[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load notes");
      console.error("Error loading notes:", err);
    } finally {
      setIsLoading(false);
    }
  }, [noteService, activeNoteId, setIsLoading, setError, setNotes, setActiveNoteId]);

  /**
   * Create a new note
   */
  const createNote = useCallback(
    async (dto?: CreateNoteDto) => {
      try {
        setError(null);
        const newNote = await noteService.createNote(dto || {});
        setNotes((prev) => [newNote, ...prev]);
        setActiveNoteId(newNote.id);
        return newNote;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create note");
        console.error("Error creating note:", err);
        throw err;
      }
    },
    [noteService]
  );

  /**
   * Update an existing note
   */
  const updateNote = useCallback(
    async (id: string, dto: UpdateNoteDto) => {
      try {
        setError(null);
        const updatedNote = await noteService.updateNote(id, dto);
        setNotes((prev) =>
          prev.map((note) => (note.id === id ? updatedNote : note))
        );
        return updatedNote;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update note");
        console.error("Error updating note:", err);
        throw err;
      }
    },
    [noteService]
  );

  /**
   * Update note content with auto-save
   */
  const updateNoteContentImmediate = useCallback(
    async (content: string) => {
      if (!activeNoteId) return;
      
      try {
        setSaveStatus("saving");
        await updateNote(activeNoteId, { content });
        setSaveStatus("saved");
      } catch (err) {
        setSaveStatus("error");
        throw err;
      }
    },
    [activeNoteId, updateNote, setSaveStatus]
  );

  /**
   * Debounced version for auto-save
   */
  const updateNoteContentDebounced = useDebounce(
    updateNoteContentImmediate,
    autoSaveDelay
  );

  /**
   * Update note content (uses auto-save if enabled)
   */
  const updateNoteContent = useCallback(
    (content: string) => {
      if (!activeNoteId) return;

      // Update local state immediately for responsive UI
      setNotes((prev) =>
        prev.map((note) =>
          note.id === activeNoteId
            ? { ...note, content, updatedAt: new Date() }
            : note
        )
      );

      // Save to backend with debounce if auto-save is enabled
      if (autoSaveEnabled) {
        setSaveStatus("unsaved");
        updateNoteContentDebounced(content);
      }
    },
    [activeNoteId, autoSaveEnabled, updateNoteContentDebounced, setNotes, setSaveStatus]
  );

  /**
   * Update note title
   */
  const updateNoteTitle = useCallback(
    async (title: string) => {
      if (!activeNoteId) return;
      await updateNote(activeNoteId, { title });
    },
    [activeNoteId, updateNote]
  );

  /**
   * Update note tags
   */
  const updateNoteTags = useCallback(
    async (tagIds: string[]) => {
      if (!activeNoteId) return;
      
      // Update local state immediately
      setNotes((prev) =>
        prev.map((note) =>
          note.id === activeNoteId
            ? { ...note, tags: tagIds, updatedAt: new Date() }
            : note
        )
      );
      
      // Note: The tag service handles the relationship in a separate table
      // The note model is updated here just for UI consistency
      // The actual relationship is managed by TagService.addTagToNote/removeTagFromNote
    },
    [activeNoteId, setNotes]
  );

  /**
   * Delete a note
   */
  const deleteNote = useCallback(
    async (id: string) => {
      try {
        setError(null);
        await noteService.deleteNote(id);
        
        // Update state and handle active note selection
        setNotes((prev) => {
          const filtered = prev.filter((note) => note.id !== id);
          
          // If the deleted note was active, select another one
          if (activeNoteId === id) {
            setActiveNoteId(filtered.length > 0 ? filtered[0].id : null);
          }
          
          return filtered;
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete note");
        console.error("Error deleting note:", err);
        throw err;
      }
    },
    [noteService, activeNoteId, setNotes, setActiveNoteId]
  );

  /**
   * Select a note
   */
  const selectNote = useCallback((id: string) => {
    setActiveNoteId(id);
  }, []);

  /**
   * Search notes
   */
  const searchNotes = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Load notes on mount
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  /**
   * Manual save (for when auto-save is disabled)
   */
  const saveNote = useCallback(async () => {
    if (!activeNote) return;
    
    try {
      setSaveStatus("saving");
      await updateNote(activeNote.id, {
        content: activeNote.content,
        title: activeNote.title,
      });
      setSaveStatus("saved");
    } catch (err) {
      setSaveStatus("error");
      throw err;
    }
  }, [activeNote, updateNote, setSaveStatus]);

  return {
    // State
    notes: filteredNotes,
    allNotes: notes,
    activeNote,
    activeNoteId,
    searchQuery,
    isLoading,
    error,

    // Actions
    createNote,
    updateNote,
    updateNoteContent,
    updateNoteTitle,
    updateNoteTags,
    deleteNote,
    selectNote,
    searchNotes,
    loadNotes,
    saveNote,
  };
}
