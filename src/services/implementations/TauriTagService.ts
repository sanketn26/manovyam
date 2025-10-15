import { Tag, CreateTagDto, UpdateTagDto } from "../../models/Tag";
import { ITagService } from "../interfaces/ITagService";
import { LocalTagService } from "./LocalTagService";

/**
 * Tauri implementation of TagService
 * Falls back to LocalTagService for now (TODO: implement Tauri commands)
 */
export class TauriTagService implements ITagService {
  private fallbackService: LocalTagService;

  constructor() {
    this.fallbackService = new LocalTagService();
  }

  async getAllTags(): Promise<Tag[]> {
    // TODO: Implement with Tauri command when SQLite backend is ready
    return this.fallbackService.getAllTags();
  }

  async getTagById(id: string): Promise<Tag | null> {
    return this.fallbackService.getTagById(id);
  }

  async createTag(dto: CreateTagDto): Promise<Tag> {
    return this.fallbackService.createTag(dto);
  }

  async updateTag(id: string, dto: UpdateTagDto): Promise<Tag> {
    return this.fallbackService.updateTag(id, dto);
  }

  async deleteTag(id: string): Promise<void> {
    return this.fallbackService.deleteTag(id);
  }

  async addTagToNote(noteId: string, tagId: string): Promise<void> {
    return this.fallbackService.addTagToNote(noteId, tagId);
  }

  async removeTagFromNote(noteId: string, tagId: string): Promise<void> {
    return this.fallbackService.removeTagFromNote(noteId, tagId);
  }

  async getTagsForNote(noteId: string): Promise<Tag[]> {
    return this.fallbackService.getTagsForNote(noteId);
  }

  async getNotesForTag(tagId: string): Promise<string[]> {
    return this.fallbackService.getNotesForTag(tagId);
  }
}
