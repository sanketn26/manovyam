/**
 * Domain Model for AI Messages
 */
export interface AIMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  sources?: AIMessageSource[];
}

export interface AIMessageSource {
  noteId: string;
  noteTitle: string;
}

/**
 * DTO for creating a new AI message
 */
export interface CreateAIMessageDto {
  role: "user" | "assistant" | "system";
  content: string;
  sources?: AIMessageSource[];
}

/**
 * AI Model Configuration
 */
export interface AIModel {
  id: string;
  name: string;
  provider: "openai" | "anthropic" | "google" | "local";
  badge?: "your-key" | "free";
}
