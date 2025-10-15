import { INoteService } from "./interfaces/INoteService";
import { IAIService } from "./interfaces/IAIService";
import { ISyncService } from "./interfaces/ISyncService";
import { ISettingsService } from "./interfaces/ISettingsService";
import { ITaskService } from "./interfaces/ITaskService";
import { ITagService } from "./interfaces/ITagService";
import { LocalNoteService } from "./implementations/LocalNoteService";
import { LocalAIService } from "./implementations/LocalAIService";
import { OpenAIService } from "./implementations/OpenAIService";
import { LocalTaskService } from "./implementations/LocalTaskService";
import { LocalTagService } from "./implementations/LocalTagService";
import { TauriNoteService } from "./implementations/TauriNoteService";
import { TauriSyncService } from "./implementations/TauriSyncService";
import { TauriSettingsService } from "./implementations/TauriSettingsService";
import { TauriTagService } from "./implementations/TauriTagService";
import { isTauri } from "../utils/tauri";
import { getOpenAIApiKey, getOpenAIBaseURL } from "../utils/env";

/**
 * Service Factory
 * Creates and provides service instances
 * Automatically chooses Tauri services when running in Tauri, falls back to local otherwise
 */
export class ServiceFactory {
  private static noteServiceInstance: INoteService | null = null;
  private static aiServiceInstance: IAIService | null = null;
  private static syncServiceInstance: ISyncService | null = null;
  private static settingsServiceInstance: ISettingsService | null = null;
  private static taskServiceInstance: ITaskService | null = null;
  private static tagServiceInstance: ITagService | null = null;

  /**
   * Get the Note Service instance
   * Uses TauriNoteService in Tauri environment, LocalNoteService in browser
   */
  static getNoteService(): INoteService {
    if (!this.noteServiceInstance) {
      // Check if running in Tauri
      if (isTauri()) {
        this.noteServiceInstance = new TauriNoteService();
        console.info("Using TauriNoteService (SQLite backend)");
      } else {
        this.noteServiceInstance = new LocalNoteService();
        console.info("Using LocalNoteService (localStorage fallback)");
      }
    }
    return this.noteServiceInstance;
  }

  /**
   * Get the AI Service instance
   * Uses OpenAI service if API key is configured, otherwise uses LocalAIService (mock)
   * Priority: Environment Variables > Provided Args > Database
   */
  static getAIService(apiKey?: string, baseURL?: string): IAIService {
    if (!this.aiServiceInstance) {
      let finalApiKey: string | undefined = apiKey;
      let finalBaseURL: string | undefined = baseURL;
      let useOpenAI = false;
      
      // 1. Check database settings
      const storedSettings = localStorage.getItem("manovyam-settings");
      if (storedSettings) {
        try {
          const settings = JSON.parse(storedSettings);
          if (!finalApiKey) finalApiKey = settings.openaiApiKey;
          if (!finalBaseURL) finalBaseURL = settings.openaiBaseURL;
        } catch (error) {
          console.error("Failed to parse settings:", error);
        }
      }

      // 2. Override with environment variables (highest priority)
      finalApiKey = getOpenAIApiKey(finalApiKey);
      finalBaseURL = getOpenAIBaseURL(finalBaseURL) || "https://api.openai.com/v1";

      // 3. Validate and create service
      if (finalApiKey && finalApiKey !== "YOUR_API_KEY_HERE") {
        useOpenAI = true;
      }

      if (useOpenAI) {
        this.aiServiceInstance = new OpenAIService(finalApiKey!, finalBaseURL);
        console.info("Using OpenAIService (real AI)");
        // Check if key came from environment by seeing if env var is set
        const envKey = import.meta?.env?.VITE_OPENAI_API_KEY;
        console.info("API Key source:", envKey ? "Environment" : "Database");
      } else {
        this.aiServiceInstance = new LocalAIService();
        console.info("Using LocalAIService (mock AI)");
      }
    }
    return this.aiServiceInstance;
  }

  /**
   * Update AI Service with new API key
   * Forces recreation of the service instance
   */
  static updateAIService(apiKey: string, baseURL?: string): void {
    this.aiServiceInstance = null;
    this.getAIService(apiKey, baseURL);
  }

  /**
   * Get the Sync Service instance
   * Uses TauriSyncService for cloud backup
   */
  static getSyncService(): ISyncService {
    if (!this.syncServiceInstance) {
      this.syncServiceInstance = new TauriSyncService();
    }
    return this.syncServiceInstance;
  }

  /**
   * Get the Settings Service instance
   * Uses TauriSettingsService in Tauri, falls back to localStorage
   */
  static getSettingsService(): ISettingsService {
    if (!this.settingsServiceInstance) {
      this.settingsServiceInstance = new TauriSettingsService();
    }
    return this.settingsServiceInstance;
  }

  /**
   * Get the Task Service instance
   * Currently uses LocalTaskService (localStorage)
   * TODO: Implement TauriTaskService for SQLite backend
   */
  static getTaskService(): ITaskService {
    if (!this.taskServiceInstance) {
      this.taskServiceInstance = new LocalTaskService();
    }
    return this.taskServiceInstance;
  }

  /**
   * Get the Tag Service instance
   * Uses TauriTagService in Tauri environment, LocalTagService in browser
   */
  static getTagService(): ITagService {
    if (!this.tagServiceInstance) {
      if (isTauri()) {
        this.tagServiceInstance = new TauriTagService();
        console.info("Using TauriTagService (SQLite backend - fallback to localStorage)");
      } else {
        this.tagServiceInstance = new LocalTagService();
        console.info("Using LocalTagService (localStorage)");
      }
    }
    return this.tagServiceInstance;
  }

  /**
   * Reset all service instances (useful for testing)
   */
  static reset(): void {
    this.noteServiceInstance = null;
    this.aiServiceInstance = null;
    this.syncServiceInstance = null;
    this.settingsServiceInstance = null;
    this.taskServiceInstance = null;
    this.tagServiceInstance = null;
  }
}
