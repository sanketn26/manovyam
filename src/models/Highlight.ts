/**
 * Domain Model for Highlight (from web clipper, Readwise, etc.)
 */
export interface Highlight {
  id: string;
  sourceType: "web" | "pdf" | "readwise";
  sourceUrl?: string;
  sourceTitle?: string;
  text: string;
  note?: string;
  color: string;
  position?: HighlightPosition;
  createdAt: Date;
}

export interface HighlightPosition {
  page?: number;
  location?: string;
  xpath?: string;
}

export interface CreateHighlightDto {
  sourceType: "web" | "pdf" | "readwise";
  sourceUrl?: string;
  sourceTitle?: string;
  text: string;
  note?: string;
  color?: string;
  position?: HighlightPosition;
}
