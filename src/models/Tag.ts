/**
 * Domain Model for Tag
 */
export interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

export interface CreateTagDto {
  name: string;
  color?: string;
}

export interface UpdateTagDto {
  name?: string;
  color?: string;
}
