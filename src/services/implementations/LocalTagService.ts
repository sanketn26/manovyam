import { Tag, CreateTagDto, UpdateTagDto } from "../../models/Tag";
import { ITagService } from "../interfaces/ITagService";

/**
 * Local implementation of TagService using localStorage
 * For browser environment or fallback
 */
export class LocalTagService implements ITagService {
  private readonly TAGS_KEY = "manovyam-tags";
  private readonly NOTE_TAGS_KEY = "manovyam-note-tags";

  private getTags(): Tag[] {
    try {
      const data = localStorage.getItem(this.TAGS_KEY);
      if (!data) return [];
      
      const tags = JSON.parse(data);
      return tags.map((tag: any) => ({
        ...tag,
        createdAt: new Date(tag.createdAt),
      }));
    } catch (error) {
      console.error("Error loading tags:", error);
      return [];
    }
  }

  private saveTags(tags: Tag[]): void {
    try {
      localStorage.setItem(this.TAGS_KEY, JSON.stringify(tags));
    } catch (error) {
      console.error("Error saving tags:", error);
    }
  }

  private getNoteTags(): Record<string, string[]> {
    try {
      const data = localStorage.getItem(this.NOTE_TAGS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Error loading note-tags:", error);
      return {};
    }
  }

  private saveNoteTags(noteTags: Record<string, string[]>): void {
    try {
      localStorage.setItem(this.NOTE_TAGS_KEY, JSON.stringify(noteTags));
    } catch (error) {
      console.error("Error saving note-tags:", error);
    }
  }

  async getAllTags(): Promise<Tag[]> {
    return this.getTags();
  }

  async getTagById(id: string): Promise<Tag | null> {
    const tags = this.getTags();
    return tags.find((tag) => tag.id === id) || null;
  }

  async createTag(dto: CreateTagDto): Promise<Tag> {
    const tags = this.getTags();
    
    // Check if tag with same name already exists
    const existing = tags.find(
      (tag) => tag.name.toLowerCase() === dto.name.toLowerCase()
    );
    if (existing) {
      return existing;
    }

    const newTag: Tag = {
      id: `tag-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: dto.name,
      color: dto.color || this.getRandomColor(),
      createdAt: new Date(),
    };

    tags.push(newTag);
    this.saveTags(tags);
    return newTag;
  }

  async updateTag(id: string, dto: UpdateTagDto): Promise<Tag> {
    const tags = this.getTags();
    const index = tags.findIndex((tag) => tag.id === id);
    
    if (index === -1) {
      throw new Error(`Tag with id ${id} not found`);
    }

    const updatedTag = {
      ...tags[index],
      ...dto,
    };

    tags[index] = updatedTag;
    this.saveTags(tags);
    return updatedTag;
  }

  async deleteTag(id: string): Promise<void> {
    const tags = this.getTags();
    const filteredTags = tags.filter((tag) => tag.id !== id);
    this.saveTags(filteredTags);

    // Remove tag from all notes
    const noteTags = this.getNoteTags();
    Object.keys(noteTags).forEach((noteId) => {
      noteTags[noteId] = noteTags[noteId].filter((tagId) => tagId !== id);
      if (noteTags[noteId].length === 0) {
        delete noteTags[noteId];
      }
    });
    this.saveNoteTags(noteTags);
  }

  async addTagToNote(noteId: string, tagId: string): Promise<void> {
    const noteTags = this.getNoteTags();
    
    if (!noteTags[noteId]) {
      noteTags[noteId] = [];
    }

    if (!noteTags[noteId].includes(tagId)) {
      noteTags[noteId].push(tagId);
      this.saveNoteTags(noteTags);
    }
  }

  async removeTagFromNote(noteId: string, tagId: string): Promise<void> {
    const noteTags = this.getNoteTags();
    
    if (noteTags[noteId]) {
      noteTags[noteId] = noteTags[noteId].filter((id) => id !== tagId);
      if (noteTags[noteId].length === 0) {
        delete noteTags[noteId];
      }
      this.saveNoteTags(noteTags);
    }
  }

  async getTagsForNote(noteId: string): Promise<Tag[]> {
    const noteTags = this.getNoteTags();
    const tagIds = noteTags[noteId] || [];
    const allTags = this.getTags();
    
    return allTags.filter((tag) => tagIds.includes(tag.id));
  }

  async getNotesForTag(tagId: string): Promise<string[]> {
    const noteTags = this.getNoteTags();
    const noteIds: string[] = [];

    Object.entries(noteTags).forEach(([noteId, tags]) => {
      if (tags.includes(tagId)) {
        noteIds.push(noteId);
      }
    });

    return noteIds;
  }

  private getRandomColor(): string {
    const colors = [
      "#ef4444", // red
      "#f97316", // orange
      "#f59e0b", // amber
      "#84cc16", // lime
      "#22c55e", // green
      "#14b8a6", // teal
      "#06b6d4", // cyan
      "#3b82f6", // blue
      "#6366f1", // indigo
      "#8b5cf6", // violet
      "#a855f7", // purple
      "#ec4899", // pink
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }
}
