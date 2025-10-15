import { ISettingsService } from "../interfaces/ISettingsService";
import { Settings, DEFAULT_SETTINGS } from "../../models/Settings";
import { tauriInvoke, TauriCommands, isTauri } from "../../utils/tauri";

/**
 * Tauri implementation of Settings Service
 * Falls back to localStorage in browser
 */
export class TauriSettingsService implements ISettingsService {
  private readonly STORAGE_KEY = "manovyam-settings";

  async getSettings(): Promise<Settings> {
    if (!isTauri()) {
      return this.getSettingsFromLocalStorage();
    }

    try {
      const settings = await tauriInvoke<any>(TauriCommands.GET_SETTINGS);
      return this.mapToSettings(settings);
    } catch (error) {
      console.error("Failed to get settings:", error);
      return DEFAULT_SETTINGS;
    }
  }

  async updateSettings(partial: Partial<Settings>): Promise<Settings> {
    const current = await this.getSettings();
    const updated = { ...current, ...partial };

    if (!isTauri()) {
      this.saveSettingsToLocalStorage(updated);
      return updated;
    }

    try {
      await tauriInvoke(TauriCommands.UPDATE_SETTINGS, {
        settings: this.mapToDatabase(partial),
      });
      return updated;
    } catch (error) {
      console.error("Failed to update settings:", error);
      throw error;
    }
  }

  async getSetting<K extends keyof Settings>(key: K): Promise<Settings[K]> {
    const settings = await this.getSettings();
    return settings[key];
  }

  async setSetting<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ): Promise<void> {
    await this.updateSettings({ [key]: value } as Partial<Settings>);
  }

  /**
   * Get settings from localStorage (browser fallback)
   */
  private getSettingsFromLocalStorage(): Settings {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return DEFAULT_SETTINGS;

      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        lastSyncedAt: parsed.lastSyncedAt
          ? new Date(parsed.lastSyncedAt)
          : undefined,
      };
    } catch (error) {
      console.error("Failed to load settings:", error);
      return DEFAULT_SETTINGS;
    }
  }

  /**
   * Save settings to localStorage (browser fallback)
   */
  private saveSettingsToLocalStorage(settings: Settings): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }

  /**
   * Map database format to Settings model
   */
  private mapToSettings(dbSettings: any): Settings {
    return {
      openaiApiKey: dbSettings.openai_api_key,
      anthropicApiKey: dbSettings.anthropic_api_key,
      googleApiKey: dbSettings.google_api_key,
      defaultAIModel: dbSettings.default_ai_model,
      autoSave: dbSettings.auto_save ?? DEFAULT_SETTINGS.autoSave,
      autoSaveDelay: dbSettings.auto_save_delay ?? DEFAULT_SETTINGS.autoSaveDelay,
      syncEnabled: dbSettings.sync_enabled ?? DEFAULT_SETTINGS.syncEnabled,
      syncProvider: dbSettings.sync_provider,
      lastSyncedAt: dbSettings.last_synced_at
        ? new Date(dbSettings.last_synced_at)
        : undefined,
      theme: dbSettings.theme ?? DEFAULT_SETTINGS.theme,
      editorFontSize: dbSettings.editor_font_size ?? DEFAULT_SETTINGS.editorFontSize,
      editorFontFamily:
        dbSettings.editor_font_family ?? DEFAULT_SETTINGS.editorFontFamily,
      encryptionPassword: dbSettings.encryption_password,
      telemetryEnabled:
        dbSettings.telemetry_enabled ?? DEFAULT_SETTINGS.telemetryEnabled,
    };
  }

  /**
   * Map Settings model to database format
   */
  private mapToDatabase(settings: Partial<Settings>): Record<string, any> {
    const result: Record<string, any> = {};

    if (settings.openaiApiKey !== undefined)
      result.openai_api_key = settings.openaiApiKey;
    if (settings.anthropicApiKey !== undefined)
      result.anthropic_api_key = settings.anthropicApiKey;
    if (settings.googleApiKey !== undefined)
      result.google_api_key = settings.googleApiKey;
    if (settings.defaultAIModel !== undefined)
      result.default_ai_model = settings.defaultAIModel;
    if (settings.autoSave !== undefined) result.auto_save = settings.autoSave;
    if (settings.autoSaveDelay !== undefined)
      result.auto_save_delay = settings.autoSaveDelay;
    if (settings.syncEnabled !== undefined)
      result.sync_enabled = settings.syncEnabled;
    if (settings.syncProvider !== undefined)
      result.sync_provider = settings.syncProvider;
    if (settings.lastSyncedAt !== undefined)
      result.last_synced_at = settings.lastSyncedAt.getTime();
    if (settings.theme !== undefined) result.theme = settings.theme;
    if (settings.editorFontSize !== undefined)
      result.editor_font_size = settings.editorFontSize;
    if (settings.editorFontFamily !== undefined)
      result.editor_font_family = settings.editorFontFamily;
    if (settings.encryptionPassword !== undefined)
      result.encryption_password = settings.encryptionPassword;
    if (settings.telemetryEnabled !== undefined)
      result.telemetry_enabled = settings.telemetryEnabled;

    return result;
  }
}
