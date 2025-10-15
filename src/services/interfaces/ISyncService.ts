import { SyncMetadata, SyncStatus } from "../../models/SyncMetadata";

/**
 * Interface for Sync Service
 */
export interface ISyncService {
  /**
   * Get current sync metadata
   */
  getSyncMetadata(): Promise<SyncMetadata | null>;

  /**
   * Export entire database as encrypted JSON
   */
  exportDatabase(password: string): Promise<string>;

  /**
   * Import database from encrypted JSON
   */
  importDatabase(encryptedData: string, password: string): Promise<void>;

  /**
   * Sync with cloud provider
   */
  syncToCloud(
    provider: "google_drive" | "dropbox" | "onedrive",
    accessToken: string,
    password: string
  ): Promise<SyncStatus>;

  /**
   * Check if local is newer than cloud
   */
  compareTimestamps(
    localModified: Date,
    cloudModified: Date
  ): "local_newer" | "cloud_newer" | "same";
}
