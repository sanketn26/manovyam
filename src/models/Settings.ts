/**
 * Application Settings
 * 
 * SECURITY NOTE:
 * - Credentials (API keys, passwords) are stored per-device only
 * - They are NEVER included in export/import operations
 * - Environment variables take precedence over database values
 */
export interface Settings {
  // AI Settings (DEVICE-SPECIFIC - NOT EXPORTED)
  openaiApiKey?: string;
  openaiBaseURL?: string; // For OpenAI-compatible endpoints (local LLMs, etc.)
  anthropicApiKey?: string;
  googleApiKey?: string;
  defaultAIModel?: string;
  
  // Editor Settings (SYNCED)
  autoSave: boolean;
  autoSaveDelay: number; // milliseconds
  
  // Sync Settings (SYNCED)
  syncEnabled: boolean;
  syncProvider?: "google_drive" | "dropbox" | "onedrive";
  lastSyncedAt?: Date;
  
  // Appearance (SYNCED)
  theme: "dark" | "light" | "system";
  editorFontSize: number;
  editorFontFamily: string;
  
  // Privacy (DEVICE-SPECIFIC - NOT EXPORTED)
  encryptionPassword?: string;
  telemetryEnabled: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  autoSave: true,
  autoSaveDelay: 1000,
  syncEnabled: false,
  theme: "dark",
  editorFontSize: 16,
  editorFontFamily: "Inter",
  telemetryEnabled: false,
};

/**
 * Fields that should NEVER be exported/imported
 * These are device-specific credentials and sensitive data
 */
export const DEVICE_SPECIFIC_SETTINGS = [
  "openaiApiKey",
  "openaiBaseURL",
  "anthropicApiKey",
  "googleApiKey",
  "encryptionPassword",
] as const;

/**
 * Environment variable names for credentials
 * These take precedence over database values
 */
export const ENV_KEYS = {
  OPENAI_API_KEY: "VITE_OPENAI_API_KEY",
  OPENAI_BASE_URL: "VITE_OPENAI_BASE_URL",
  ANTHROPIC_API_KEY: "VITE_ANTHROPIC_API_KEY",
  GOOGLE_API_KEY: "VITE_GOOGLE_API_KEY",
} as const;
