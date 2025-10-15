import { useEffect, useCallback } from "react";
import { useAtom } from "jotai";
import { Settings } from "../models/Settings";
import { ISettingsService } from "../services/interfaces/ISettingsService";
import { settingsAtom, errorAtom } from "../store/atoms";

/**
 * ViewModel for Settings
 * Manages application settings
 */
export function useSettingsViewModel(settingsService: ISettingsService) {
  const [settings, setSettings] = useAtom(settingsAtom);
  const [error, setError] = useAtom(errorAtom);

  /**
   * Load settings from service
   */
  const loadSettings = useCallback(async () => {
    try {
      const loadedSettings = await settingsService.getSettings();
      setSettings(loadedSettings);
    } catch (err) {
      console.error("Error loading settings:", err);
      setError(err instanceof Error ? err.message : "Failed to load settings");
    }
  }, [settingsService, setSettings, setError]);

  /**
   * Update settings
   */
  const updateSettings = useCallback(
    async (partial: Partial<Settings>) => {
      try {
        const updated = await settingsService.updateSettings(partial);
        setSettings(updated);
      } catch (err) {
        console.error("Error updating settings:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update settings"
        );
        throw err;
      }
    },
    [settingsService, setSettings, setError]
  );

  /**
   * Update a single setting
   */
  const updateSetting = useCallback(
    async <K extends keyof Settings>(key: K, value: Settings[K]) => {
      try {
        await settingsService.setSetting(key, value);
        setSettings((prev) => ({ ...prev, [key]: value }));
      } catch (err) {
        console.error(`Error updating setting ${key}:`, err);
        setError(
          err instanceof Error ? err.message : `Failed to update ${key}`
        );
        throw err;
      }
    },
    [settingsService, setSettings, setError]
  );

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    // State
    settings,
    error,

    // Actions
    loadSettings,
    updateSettings,
    updateSetting,
  };
}
