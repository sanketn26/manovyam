import { IAIService, TextCritique } from "../interfaces/IAIService";
import { AIMessage, CreateAIMessageDto, AIModel } from "../../models/AIMessage";

/**
 * Local/Mock implementation of AI Service
 * This is a demo implementation that simulates AI responses
 * In production, this would be replaced with actual AI API calls
 */
export class LocalAIService implements IAIService {
  private readonly STORAGE_KEY = "manovyam-ai-history";
  private conversationHistory: AIMessage[] = [];

  constructor() {
    this.loadHistory();
  }

  /**
   * Load conversation history from localStorage
   */
  private loadHistory(): void {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        this.conversationHistory = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
      } else {
        this.conversationHistory = this.getDefaultMessages();
      }
    } catch (error) {
      console.error("Failed to load AI history:", error);
      this.conversationHistory = this.getDefaultMessages();
    }
  }

  /**
   * Save conversation history to localStorage
   */
  private saveHistory(): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.conversationHistory)
      );
    } catch (error) {
      console.error("Failed to save AI history:", error);
    }
  }

  /**
   * Get default welcome messages
   */
  private getDefaultMessages(): AIMessage[] {
    return [
      {
        id: "1",
        role: "system",
        content: "Chat with your notes using AI",
        timestamp: new Date(),
      },
      {
        id: "2",
        role: "assistant",
        content:
          "Hi! I can help you:\n• Summarize notes\n• Answer questions\n• Find related thoughts\n\nWhat would you like?",
        timestamp: new Date(),
      },
    ];
  }

  async getAvailableModels(): Promise<AIModel[]> {
    return [
      {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        provider: "openai",
        badge: "your-key",
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        provider: "openai",
        badge: "your-key",
      },
      {
        id: "claude-3-opus",
        name: "Claude 3 Opus",
        provider: "anthropic",
        badge: "your-key",
      },
      {
        id: "claude-3-sonnet",
        name: "Claude 3 Sonnet",
        provider: "anthropic",
        badge: "your-key",
      },
      {
        id: "gemini-pro",
        name: "Gemini Pro",
        provider: "google",
        badge: "your-key",
      },
      {
        id: "llama-3-local",
        name: "Llama 3 Local",
        provider: "local",
        badge: "free",
      },
      {
        id: "mistral-local",
        name: "Mistral Local",
        provider: "local",
        badge: "free",
      },
    ];
  }

  async sendMessage(
    message: string,
    modelId: string,
    context?: string[]
  ): Promise<AIMessage> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Create a mock response
    const response: AIMessage = {
      id: Date.now().toString(),
      role: "assistant",
      content: this.generateMockResponse(message, modelId, context),
      timestamp: new Date(),
      sources: context
        ? [
            { noteId: "1", noteTitle: "Welcome to Manovyam" },
            { noteId: "2", noteTitle: "Building with Tauri" },
          ]
        : undefined,
    };

    // Add to history
    this.conversationHistory.push(response);
    this.saveHistory();

    return response;
  }

  /**
   * Generate a mock AI response
   * In production, this would make an actual API call
   */
  private generateMockResponse(
    message: string,
    modelId: string,
    context?: string[]
  ): string {
    const responses = [
      `Based on your notes, I can see that you're interested in ${message.toLowerCase()}. This is a demo response from ${modelId}.`,
      `I've analyzed ${context?.length || 0} notes related to your query about "${message}". Here's what I found...`,
      `That's an interesting question about ${message}. In a production environment, I would connect to ${modelId} to provide a detailed answer.`,
      `I understand you're asking about ${message}. This is a simulated response. When connected to a real AI service, I would provide intelligent insights based on your notes.`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  async getConversationHistory(): Promise<AIMessage[]> {
    return [...this.conversationHistory];
  }

  async clearConversationHistory(): Promise<void> {
    this.conversationHistory = this.getDefaultMessages();
    this.saveHistory();
  }

  async addMessageToHistory(dto: CreateAIMessageDto): Promise<void> {
    const message: AIMessage = {
      id: Date.now().toString(),
      ...dto,
      timestamp: new Date(),
    };

    this.conversationHistory.push(message);
    this.saveHistory();
  }

  /**
   * Extract tasks from note content
   * Uses simple heuristics for demo purposes
   * In production, this would call an actual AI API
   */
  async extractTasksFromNote(noteContent: string): Promise<string[]> {
    // Remove HTML tags
    const text = noteContent.replace(/<[^>]*>/g, " ");

    const tasks: string[] = [];

    // Extract lines that look like tasks
    const lines = text.split("\n");
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check for common task patterns
      const taskPatterns = [
        /^[-*•]\s+(.+)$/,           // Bullet points
        /^TODO:\s+(.+)$/i,          // TODO: prefix
        /^TASK:\s+(.+)$/i,          // TASK: prefix
        /^\[\s?\]\s+(.+)$/,         // [ ] checkbox
        /^[0-9]+\.\s+(.+)$/,        // Numbered list
      ];

      for (const pattern of taskPatterns) {
        const match = trimmed.match(pattern);
        if (match && match[1]) {
          tasks.push(match[1].trim());
          break;
        }
      }
    }

    // If no explicit tasks found, extract action items
    if (tasks.length === 0) {
      const actionPatterns = [
        /need to (.+?)(?:[.!?]|$)/gi,
        /should (.+?)(?:[.!?]|$)/gi,
        /must (.+?)(?:[.!?]|$)/gi,
        /will (.+?)(?:[.!?]|$)/gi,
        /plan to (.+?)(?:[.!?]|$)/gi,
      ];

      for (const pattern of actionPatterns) {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          if (match[1]) {
            tasks.push(match[1].trim());
          }
        }
      }
    }

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Return unique tasks, limited to 10
    return [...new Set(tasks)].slice(0, 10);
  }

  /**
   * Rephrase text (mock implementation)
   */
  async rephraseText(text: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `[Rephrased]: ${text.replace(/\b(\w)/g, (match) =>
      Math.random() > 0.7 ? match.toUpperCase() : match
    )}`;
  }

  /**
   * Elaborate text (mock implementation)
   */
  async elaborateText(text: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return `${text}\n\nFurthermore, this concept can be expanded by considering additional perspectives and contexts. The implications are significant when we examine the broader framework and related principles.`;
  }

  /**
   * Shorten text (mock implementation)
   */
  async shortenText(text: string): Promise<string> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const words = text.split(" ");
    return words.slice(0, Math.ceil(words.length / 2)).join(" ") + "...";
  }

  /**
   * Critique text (mock implementation)
   */
  async critiqueText(text: string): Promise<TextCritique> {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      positives: [
        "Clear and concise writing",
        "Good structure and organization",
        "Relevant content",
      ],
      negatives: [
        "Could use more specific examples",
        "Some points need further elaboration",
      ],
      suggestions: [
        "Add concrete examples to support your points",
        "Consider breaking long paragraphs into smaller ones",
        "Include data or statistics if applicable",
      ],
    };
  }
}
