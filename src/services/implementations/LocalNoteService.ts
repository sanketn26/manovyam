import { INoteService } from "../interfaces/INoteService";
import { Note, CreateNoteDto, UpdateNoteDto } from "../../models/Note";

/**
 * Local Storage implementation of Note Service
 * Stores notes in browser's localStorage
 */
export class LocalNoteService implements INoteService {
  private readonly STORAGE_KEY = "manovyam-notes";

  /**
   * Load notes from localStorage
   */
  private loadFromStorage(): Note[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return this.getDefaultNotes();

      const parsed = JSON.parse(data);
      return parsed.map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
    } catch (error) {
      console.error("Failed to load notes from localStorage:", error);
      return this.getDefaultNotes();
    }
  }

  /**
   * Save notes to localStorage
   */
  private saveToStorage(notes: Note[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error("Failed to save notes to localStorage:", error);
    }
  }

  /**
   * Get default/demo notes
   */
  private getDefaultNotes(): Note[] {
    return [
      {
        id: "1",
        title: "Welcome to Manovyam",
        content: `<h1>Welcome to Manovyam</h1><p>Your mind's playground - where thoughts come out to play!</p><h2>What is Manovyam?</h2><p>Manovyam is a local-first, privacy-focused note-taking app built with Tauri and React. It combines the power of rich text editing with AI assistance to help you capture and organize your thoughts.</p><h2>Key Features</h2><ul><li>🔒 <strong>Local-first privacy</strong> - Your notes stay on your device</li><li>☁️ <strong>Free cloud sync</strong> - Optional encrypted backup</li><li>🤖 <strong>AI assistance</strong> - Multiple AI models to choose from</li><li>✨ <strong>Rich text editing</strong> - Powered by TipTap</li><li>⚡ <strong>Lightning fast</strong> - Built with Rust and Tauri</li></ul><h2>Getting Started</h2><p>Try these commands in the editor:</p><ul><li>Type <code>/</code> for AI commands</li><li>Use markdown shortcuts (e.g., <code>##</code> for headings)</li><li>Press <code>Ctrl+K</code> to insert links</li><li>Click the 🤖 icon to open the AI assistant</li></ul><p>Happy writing! 🎮</p>`,
        emoji: "🎮",
        createdAt: new Date(Date.now() - 1000 * 60 * 5),
        updatedAt: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        id: "2",
        title: "Building with Tauri",
        content: `<h1>Building with Tauri</h1><p>Exploring the world of local-first applications with Tauri, React, and Rust.</p><h2>Why Tauri?</h2><ul><li>Small bundle size (~3MB)</li><li>Native performance</li><li>Access to system APIs</li><li>Cross-platform (Windows, macOS, Linux)</li></ul><h2>Architecture</h2><p>The app uses a clean separation:</p><ul><li><strong>Frontend</strong>: React + TypeScript + TipTap</li><li><strong>Backend</strong>: Rust with Tauri commands</li><li><strong>Storage</strong>: SQLite for local data</li><li><strong>Sync</strong>: Optional cloud backup (encrypted)</li></ul><blockquote><p>"Local-first software is software that puts the user in control of their data."</p></blockquote><h2>Next Steps</h2><ol><li>Implement full-text search</li><li>Add more AI models</li><li>Build mobile companion app</li></ol>`,
        emoji: "🚀",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      },
      {
        id: "3",
        title: "TipTap Editor Integration",
        content: `<h1>TipTap Editor Integration</h1><p>Notes on integrating TipTap for rich text editing.</p><h2>Extensions Used</h2><ul><li>StarterKit (basic formatting)</li><li>Link (URL handling)</li><li>TaskList (checkboxes)</li><li>CodeBlock (syntax highlighting)</li><li>Placeholder (helpful hints)</li></ul><h2>Custom Features</h2><p>We've added some custom functionality:</p><pre><code>// Slash commands for AI
const editor = useEditor({
  extensions: [
    SlashCommands,
    AISelection,
    AutoLinks,
  ]
})</code></pre><h3>AI Commands</h3><ul><li><code>/summarize</code> - Summarize content</li><li><code>/expand</code> - Expand on topic</li><li><code>/fix</code> - Fix grammar</li><li><code>/translate</code> - Translate text</li></ul>`,
        emoji: "📝",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
      },
    ];
  }

  async getAllNotes(): Promise<Note[]> {
    const notes = this.loadFromStorage();
    
    // Load tags for each note from the tag service
    try {
      const noteTagsData = localStorage.getItem("manovyam-note-tags");
      if (noteTagsData) {
        const noteTags: Record<string, string[]> = JSON.parse(noteTagsData);
        return notes.map((note) => ({
          ...note,
          tags: noteTags[note.id] || [],
        }));
      }
    } catch (error) {
      console.error("Failed to load note tags:", error);
    }
    
    return notes;
  }

  async getNoteById(id: string): Promise<Note | null> {
    const notes = await this.getAllNotes();
    return notes.find((note) => note.id === id) || null;
  }

  async createNote(dto: CreateNoteDto): Promise<Note> {
    const notes = await this.getAllNotes();
    const newNote: Note = {
      id: Date.now().toString(),
      title: dto.title || "Untitled",
      content: dto.content || "",
      emoji: dto.emoji || "📝",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const updatedNotes = [newNote, ...notes];
    this.saveToStorage(updatedNotes);
    return newNote;
  }

  async updateNote(id: string, dto: UpdateNoteDto): Promise<Note> {
    const notes = await this.getAllNotes();
    const noteIndex = notes.findIndex((note) => note.id === id);

    if (noteIndex === -1) {
      throw new Error(`Note with id ${id} not found`);
    }

    const updatedNote: Note = {
      ...notes[noteIndex],
      ...dto,
      updatedAt: new Date(),
    };

    notes[noteIndex] = updatedNote;
    this.saveToStorage(notes);
    return updatedNote;
  }

  async deleteNote(id: string): Promise<void> {
    const notes = await this.getAllNotes();
    const filteredNotes = notes.filter((note) => note.id !== id);
    this.saveToStorage(filteredNotes);
  }

  async searchNotes(query: string): Promise<Note[]> {
    const notes = await this.getAllNotes();
    const lowerQuery = query.toLowerCase();

    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(lowerQuery) ||
        note.content.toLowerCase().includes(lowerQuery)
    );
  }

  async saveNotes(notes: Note[]): Promise<void> {
    this.saveToStorage(notes);
  }
}
