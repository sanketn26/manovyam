import { AIMessage, CreateAIMessageDto, AIModel } from "../../models/AIMessage";

/**
 * Structured output for text critique
 */
export interface TextCritique {
  positives: string[];
  negatives: string[];
  suggestions: string[];
}

/**
 * Interface for AI Service
 * This defines the contract for AI operations
 */
export interface IAIService {
  /**
   * Get all available AI models
   */
  getAvailableModels(): Promise<AIModel[]>;

  /**
   * Send a message to the AI and get a response
   */
  sendMessage(
    message: string,
    modelId: string,
    context?: string[]
  ): Promise<AIMessage>;

  /**
   * Get conversation history
   */
  getConversationHistory(): Promise<AIMessage[]>;

  /**
   * Clear conversation history
   */
  clearConversationHistory(): Promise<void>;

  /**
   * Add a message to history
   */
  addMessageToHistory(message: CreateAIMessageDto): Promise<void>;

  /**
   * Rephrase selected text
   */
  rephraseText(text: string): Promise<string>;

  /**
   * Elaborate on selected text
   */
  elaborateText(text: string): Promise<string>;

  /**
   * Shorten selected text
   */
  shortenText(text: string): Promise<string>;

  /**
   * Critique selected text with structured output
   */
  critiqueText(text: string): Promise<TextCritique>;
}
