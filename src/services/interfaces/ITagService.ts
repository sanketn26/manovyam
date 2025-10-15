import { Tag, CreateTagDto, UpdateTagDto } from "../../models/Tag";

/**
 * Interface for Tag Service
 */
export interface ITagService {
  getAllTags(): Promise<Tag[]>;
  getTagById(id: string): Promise<Tag | null>;
  createTag(dto: CreateTagDto): Promise<Tag>;
  updateTag(id: string, dto: UpdateTagDto): Promise<Tag>;
  deleteTag(id: string): Promise<void>;
  
  // Note-Tag relationships
  addTagToNote(noteId: string, tagId: string): Promise<void>;
  removeTagFromNote(noteId: string, tagId: string): Promise<void>;
  getTagsForNote(noteId: string): Promise<Tag[]>;
  getNotesForTag(tagId: string): Promise<string[]>; // Returns note IDs
}
