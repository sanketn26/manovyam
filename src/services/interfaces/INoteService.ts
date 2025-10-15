import { Note, CreateNoteDto, UpdateNoteDto } from "../../models/Note";

/**
 * Interface for Note Service
 * This defines the contract for note storage/retrieval
 * Can be implemented for local storage, API, or any other backend
 */
export interface INoteService {
  /**
   * Get all notes
   */
  getAllNotes(): Promise<Note[]>;

  /**
   * Get a single note by ID
   */
  getNoteById(id: string): Promise<Note | null>;

  /**
   * Create a new note
   */
  createNote(dto: CreateNoteDto): Promise<Note>;

  /**
   * Update an existing note
   */
  updateNote(id: string, dto: UpdateNoteDto): Promise<Note>;

  /**
   * Delete a note
   */
  deleteNote(id: string): Promise<void>;

  /**
   * Search notes by query
   */
  searchNotes(query: string): Promise<Note[]>;

  /**
   * Save all notes (for batch operations)
   */
  saveNotes(notes: Note[]): Promise<void>;
}
