import { INoteService } from "../interfaces/INoteService";
import { Note, CreateNoteDto, UpdateNoteDto } from "../../models/Note";
import { tauriInvoke, TauriCommands } from "../../utils/tauri";
import { LocalNoteService } from "./LocalNoteService";

/**
 * Tauri/SQLite implementation of Note Service
 * Falls back to LocalNoteService in browser environment
 */
export class TauriNoteService implements INoteService {
  private fallbackService: LocalNoteService;

  constructor() {
    this.fallbackService = new LocalNoteService();
  }

  private async invokeSafely<T>(
    command: string,
    args?: Record<string, unknown>
  ): Promise<T> {
    try {
      return await tauriInvoke<T>(command, args);
    } catch (error) {
      console.warn(`Tauri command failed, using fallback:`, error);
      throw error;
    }
  }

  async getAllNotes(): Promise<Note[]> {
    try {
      const notes = await this.invokeSafely<any[]>(TauriCommands.GET_ALL_NOTES);
      return notes.map(this.mapToNote);
    } catch {
      return this.fallbackService.getAllNotes();
    }
  }

  async getNoteById(id: string): Promise<Note | null> {
    try {
      const note = await this.invokeSafely<any>(TauriCommands.GET_NOTE_BY_ID, {
        id,
      });
      return note ? this.mapToNote(note) : null;
    } catch {
      return this.fallbackService.getNoteById(id);
    }
  }

  async createNote(dto: CreateNoteDto): Promise<Note> {
    try {
      const note = await this.invokeSafely<any>(TauriCommands.CREATE_NOTE, {
        title: dto.title || "Untitled",
        content: dto.content || "",
        emoji: dto.emoji || "📝",
      });
      return this.mapToNote(note);
    } catch {
      return this.fallbackService.createNote(dto);
    }
  }

  async updateNote(id: string, dto: UpdateNoteDto): Promise<Note> {
    try {
      const note = await this.invokeSafely<any>(TauriCommands.UPDATE_NOTE, {
        id,
        ...dto,
      });
      return this.mapToNote(note);
    } catch {
      return this.fallbackService.updateNote(id, dto);
    }
  }

  async deleteNote(id: string): Promise<void> {
    try {
      await this.invokeSafely<void>(TauriCommands.DELETE_NOTE, { id });
    } catch {
      return this.fallbackService.deleteNote(id);
    }
  }

  async searchNotes(query: string): Promise<Note[]> {
    try {
      // Use FTS5 full-text search in Tauri
      const notes = await this.invokeSafely<any[]>(
        TauriCommands.FULL_TEXT_SEARCH,
        { query }
      );
      return notes.map(this.mapToNote);
    } catch {
      return this.fallbackService.searchNotes(query);
    }
  }

  async saveNotes(notes: Note[]): Promise<void> {
    // Not needed for Tauri (each operation saves immediately)
    // Keep for interface compatibility
    return this.fallbackService.saveNotes(notes);
  }

  /**
   * Map database row to Note model
   */
  private mapToNote(row: any): Note {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      emoji: row.emoji,
      createdAt: new Date(row.created_at || row.createdAt),
      updatedAt: new Date(row.updated_at || row.updatedAt),
    };
  }
}
