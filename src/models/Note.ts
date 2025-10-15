/**
 * Domain Model for Note
 * This represents the core business entity
 */
export interface Note {
  id: string;
  title: string;
  content: string;
  emoji?: string;
  tags?: string[]; // Array of tag IDs
  createdAt: Date;
  updatedAt: Date;
}

/**
 * DTO (Data Transfer Object) for creating a new note
 */
export interface CreateNoteDto {
  title?: string;
  content?: string;
  emoji?: string;
}

/**
 * DTO for updating an existing note
 */
export interface UpdateNoteDto {
  title?: string;
  content?: string;
  emoji?: string;
}
