import { AIMessage } from "./AIMessage";

/**
 * Domain Model for AI Chat Session
 */
export interface AIChat {
  id: string;
  noteId?: string;
  title?: string;
  messages: AIMessage[];
  modelUsed: string;
  provider: "openai" | "anthropic" | "google" | "ollama";
  totalTokens: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAIChatDto {
  noteId?: string;
  title?: string;
  modelUsed: string;
  provider: "openai" | "anthropic" | "google" | "ollama";
}

export interface UpdateAIChatDto {
  title?: string;
  messages?: AIMessage[];
  totalTokens?: number;
}
