import { Settings } from "../../models/Settings";

/**
 * Interface for Settings Service
 */
export interface ISettingsService {
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<Settings>): Promise<Settings>;
  getSetting<K extends keyof Settings>(key: K): Promise<Settings[K]>;
  setSetting<K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ): Promise<void>;
}
