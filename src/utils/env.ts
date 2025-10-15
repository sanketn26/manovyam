/**
 * Environment Variable Utilities
 * 
 * Provides secure access to environment variables for credentials.
 * Priority: Environment Variables > Database
 */

import { ENV_KEYS, DEVICE_SPECIFIC_SETTINGS } from "../models/Settings";

// Re-export for convenience
export { ENV_KEYS, DEVICE_SPECIFIC_SETTINGS };

/**
 * Get environment variable value
 * Works in both browser (Vite) and Tauri environments
 */
function getEnvVar(key: string): string | undefined {
  // Browser environment (Vite)
  try {
    if (typeof import.meta !== "undefined" && import.meta.env) {
      const value = import.meta.env[key];
      if (typeof value === "string") {
        return value;
      }
    }
  } catch (e) {
    // import.meta might not be available in some contexts
  }
  
  // Node/Tauri environment
  try {
    if (typeof process !== "undefined" && process.env) {
      return process.env[key];
    }
  } catch (e) {
    // process might not be available in browser
  }
  
  return undefined;
}

/**
 * Get OpenAI API Key
 * Priority: Environment Variable > Database Value
 */
export function getOpenAIApiKey(dbValue?: string): string | undefined {
  return getEnvVar(ENV_KEYS.OPENAI_API_KEY) || dbValue;
}

/**
 * Get OpenAI Base URL
 * Priority: Environment Variable > Database Value
 */
export function getOpenAIBaseURL(dbValue?: string): string | undefined {
  return getEnvVar(ENV_KEYS.OPENAI_BASE_URL) || dbValue;
}

/**
 * Get Anthropic API Key
 * Priority: Environment Variable > Database Value
 */
export function getAnthropicApiKey(dbValue?: string): string | undefined {
  return getEnvVar(ENV_KEYS.ANTHROPIC_API_KEY) || dbValue;
}

/**
 * Get Google API Key
 * Priority: Environment Variable > Database Value
 */
export function getGoogleApiKey(dbValue?: string): string | undefined {
  return getEnvVar(ENV_KEYS.GOOGLE_API_KEY) || dbValue;
}

/**
 * Check if API key is from environment variable
 * Used to show appropriate UI messages
 */
export function isFromEnvironment(key: string): boolean {
  return getEnvVar(key) !== undefined;
}

/**
 * Get all environment-based credentials
 */
export function getEnvironmentCredentials() {
  return {
    openaiApiKey: getEnvVar(ENV_KEYS.OPENAI_API_KEY),
    openaiBaseURL: getEnvVar(ENV_KEYS.OPENAI_BASE_URL),
    anthropicApiKey: getEnvVar(ENV_KEYS.ANTHROPIC_API_KEY),
    googleApiKey: getEnvVar(ENV_KEYS.GOOGLE_API_KEY),
  };
}

/**
 * Check if any credentials are set via environment variables
 */
export function hasEnvironmentCredentials(): boolean {
  const creds = getEnvironmentCredentials();
  return Object.values(creds).some((val) => val !== undefined);
}
