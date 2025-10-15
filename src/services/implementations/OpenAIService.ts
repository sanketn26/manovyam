import { IAIService, TextCritique } from "../interfaces/IAIService";
import { AIMessage, CreateAIMessageDto, AIModel } from "../../models/AIMessage";

/**
 * OpenAI-compatible API Service
 * Supports OpenAI API and any OpenAI-compatible endpoints (like local LLMs)
 */
export class OpenAIService implements IAIService {
  private readonly STORAGE_KEY = "manovyam-ai-history";
  private conversationHistory: AIMessage[] = [];
  private apiKey: string;
  private baseURL: string;

  constructor(apiKey: string, baseURL = "https://api.openai.com/v1") {
    this.apiKey = apiKey;
    this.baseURL = baseURL;
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
        content: "Connected to AI Assistant",
        timestamp: new Date(),
      },
      {
        id: "2",
        role: "assistant",
        content:
          "Hi! I'm your AI assistant. I can help you with:\\n• Summarizing your notes\\n• Answering questions\\n• Finding connections\\n• Extracting tasks\\n\\nWhat would you like to do?",
        timestamp: new Date(),
      },
    ];
  }

  async getAvailableModels(): Promise<AIModel[]> {
    // Check if we have a valid API key
    if (!this.apiKey || this.apiKey === "YOUR_API_KEY_HERE") {
      return [
        {
          id: "no-key",
          name: "No API Key Configured",
          provider: "none",
          badge: "your-key",
        },
      ];
    }

    // Return common OpenAI models
    // In a production app, you could fetch this from the API
    return [
      {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        provider: "openai",
        badge: "your-key",
      },
      {
        id: "gpt-4",
        name: "GPT-4",
        provider: "openai",
        badge: "your-key",
      },
      {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        provider: "openai",
        badge: "your-key",
      },
    ];
  }

  async sendMessage(
    message: string,
    modelId: string,
    context?: string[]
  ): Promise<AIMessage> {
    if (!this.apiKey || this.apiKey === "YOUR_API_KEY_HERE") {
      throw new Error(
        "Please configure your OpenAI API key in settings to use AI features"
      );
    }

    try {
      // Build messages array for API
      const messages = [];

      // Add system message with context if available
      if (context && context.length > 0) {
        messages.push({
          role: "system",
          content: `You are a helpful AI assistant for a note-taking app called Manovyam. The user is asking about their notes. Here is the relevant note content:\n\n${context.join("\n\n---\n\n")}`,
        });
      } else {
        messages.push({
          role: "system",
          content:
            "You are a helpful AI assistant for a note-taking app called Manovyam. Help users with their notes and questions.",
        });
      }

      // Add conversation history (last 10 messages for context)
      const recentHistory = this.conversationHistory
        .filter((msg) => msg.role !== "system")
        .slice(-10);

      for (const msg of recentHistory) {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      }

      // Add current user message
      messages.push({
        role: "user",
        content: message,
      });

      // Call OpenAI API
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: modelId,
          messages: messages,
          temperature: 0.7,
          max_tokens: 1000,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || "Failed to get AI response");
      }

      const data = await response.json();
      const assistantMessage = data.choices[0]?.message?.content;

      if (!assistantMessage) {
        throw new Error("No response from AI");
      }

      // Create AI message
      const aiMessage: AIMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: assistantMessage,
        timestamp: new Date(),
        sources: context
          ? [{ noteId: "current", noteTitle: "Current Note" }]
          : undefined,
      };

      // Add to history
      this.conversationHistory.push(aiMessage);
      this.saveHistory();

      return aiMessage;
    } catch (error) {
      console.error("OpenAI API error:", error);
      throw error;
    }
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
   * Extract tasks from note content using AI
   */
  async extractTasksFromNote(noteContent: string): Promise<string[]> {
    if (!this.apiKey || this.apiKey === "YOUR_API_KEY_HERE") {
      throw new Error(
        "Please configure your OpenAI API key in settings to extract tasks"
      );
    }

    try {
      // Remove HTML tags
      const text = noteContent.replace(/<[^>]*>/g, " ");

      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a task extraction assistant. Extract action items and tasks from the given text. Return ONLY a JSON array of task strings, nothing else. Each task should be a clear, actionable item.",
            },
            {
              role: "user",
              content: `Extract all tasks and action items from this note:\n\n${text}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to extract tasks");
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        return [];
      }

      // Parse the JSON response
      try {
        const tasks = JSON.parse(content);
        if (Array.isArray(tasks)) {
          return tasks.slice(0, 10); // Limit to 10 tasks
        }
      } catch {
        // If not valid JSON, try to extract tasks from the text
        const lines = content.split("\n");
        const tasks: string[] = [];

        for (const line of lines) {
          const cleaned = line.trim().replace(/^[-*•\d.)\]]+\s*/, "");
          if (cleaned.length > 5 && cleaned.length < 200) {
            tasks.push(cleaned);
          }
        }

        return tasks.slice(0, 10);
      }

      return [];
    } catch (error) {
      console.error("Task extraction error:", error);
      throw error;
    }
  }

  /**
   * Update API key
   */
  updateApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Update base URL (for OpenAI-compatible endpoints)
   */
  updateBaseURL(baseURL: string): void {
    this.baseURL = baseURL;
  }

  /**
   * Rephrase selected text with AI
   */
  async rephraseText(text: string): Promise<string> {
    if (!this.apiKey || this.apiKey === "YOUR_API_KEY_HERE") {
      throw new Error("Please configure your OpenAI API key in settings");
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a writing assistant. Rephrase the given text to make it clearer and more professional while maintaining the original meaning. Return ONLY the rephrased text, nothing else.",
            },
            {
              role: "user",
              content: text,
            },
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to rephrase text");
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || text;
    } catch (error) {
      console.error("Rephrase error:", error);
      throw error;
    }
  }

  /**
   * Elaborate on selected text with AI
   */
  async elaborateText(text: string): Promise<string> {
    if (!this.apiKey || this.apiKey === "YOUR_API_KEY_HERE") {
      throw new Error("Please configure your OpenAI API key in settings");
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a writing assistant. Elaborate on the given text by adding more details, examples, and context. Make it more comprehensive and informative. Return ONLY the elaborated text, nothing else.",
            },
            {
              role: "user",
              content: text,
            },
          ],
          temperature: 0.7,
          max_tokens: 800,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to elaborate text");
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || text;
    } catch (error) {
      console.error("Elaborate error:", error);
      throw error;
    }
  }

  /**
   * Shorten selected text with AI
   */
  async shortenText(text: string): Promise<string> {
    if (!this.apiKey || this.apiKey === "YOUR_API_KEY_HERE") {
      throw new Error("Please configure your OpenAI API key in settings");
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a writing assistant. Shorten the given text while keeping the main points and meaning. Make it concise and to the point. Return ONLY the shortened text, nothing else.",
            },
            {
              role: "user",
              content: text,
            },
          ],
          temperature: 0.5,
          max_tokens: 300,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to shorten text");
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || text;
    } catch (error) {
      console.error("Shorten error:", error);
      throw error;
    }
  }

  /**
   * Critique selected text with structured output
   */
  async critiqueText(text: string): Promise<TextCritique> {
    if (!this.apiKey || this.apiKey === "YOUR_API_KEY_HERE") {
      throw new Error("Please configure your OpenAI API key in settings");
    }

    try {
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                'You are a critical thinking assistant. Analyze the given text and provide a structured critique. Return ONLY a JSON object with this exact structure: {"positives": ["point1", "point2"], "negatives": ["point1", "point2"], "suggestions": ["suggestion1", "suggestion2"]}. Include 2-4 items in each array.',
            },
            {
              role: "user",
              content: `Critique this text:\n\n${text}`,
            },
          ],
          temperature: 0.7,
          max_tokens: 600,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to critique text");
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;

      if (!content) {
        throw new Error("No response from AI");
      }

      // Parse JSON response
      try {
        const critique = JSON.parse(content);
        return {
          positives: critique.positives || [],
          negatives: critique.negatives || [],
          suggestions: critique.suggestions || [],
        };
      } catch {
        // Fallback if JSON parsing fails
        return {
          positives: ["Analysis completed"],
          negatives: ["Unable to parse detailed critique"],
          suggestions: ["Try rephrasing your text"],
        };
      }
    } catch (error) {
      console.error("Critique error:", error);
      throw error;
    }
  }
}
