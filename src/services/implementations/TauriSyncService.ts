import { ISyncService } from "../interfaces/ISyncService";
import { SyncMetadata, SyncStatus } from "../../models/SyncMetadata";
import { tauriInvoke, TauriCommands, isTauri } from "../../utils/tauri";

/**
 * Tauri implementation of Sync Service
 * Handles encrypted cloud backup
 */
export class TauriSyncService implements ISyncService {
  async getSyncMetadata(): Promise<SyncMetadata | null> {
    if (!isTauri()) {
      return this.getMockMetadata();
    }

    try {
      const metadata = await tauriInvoke<any>(
        TauriCommands.GET_SYNC_METADATA
      );
      return metadata
        ? {
            id: metadata.id,
            lastSyncedAt: metadata.last_synced_at
              ? new Date(metadata.last_synced_at)
              : undefined,
            syncProvider: metadata.sync_provider,
            cloudFileId: metadata.cloud_file_id,
            cloudFileModifiedAt: metadata.cloud_file_modified_at
              ? new Date(metadata.cloud_file_modified_at)
              : undefined,
          }
        : null;
    } catch (error) {
      console.error("Failed to get sync metadata:", error);
      return null;
    }
  }

  async exportDatabase(password: string): Promise<string> {
    if (!isTauri()) {
      // In browser, export from localStorage
      return this.exportLocalStorage(password);
    }

    try {
      return await tauriInvoke<string>(TauriCommands.EXPORT_DATABASE, {
        password,
      });
    } catch (error) {
      console.error("Failed to export database:", error);
      throw new Error("Failed to export database");
    }
  }

  async importDatabase(
    encryptedData: string,
    password: string
  ): Promise<void> {
    if (!isTauri()) {
      // In browser, import to localStorage
      return this.importLocalStorage(encryptedData, password);
    }

    try {
      await tauriInvoke<void>(TauriCommands.IMPORT_DATABASE, {
        encrypted_data: encryptedData,
        password,
      });
    } catch (error) {
      console.error("Failed to import database:", error);
      throw new Error("Failed to import database");
    }
  }

  async syncToCloud(
    provider: "google_drive" | "dropbox" | "onedrive",
    accessToken: string,
    password: string
  ): Promise<SyncStatus> {
    const status: SyncStatus = {
      isSyncing: true,
    };

    try {
      // 1. Export database
      const encryptedData = await this.exportDatabase(password);

      // 2. Get sync metadata
      const metadata = await this.getSyncMetadata();

      // 3. Upload to cloud (implementation depends on provider)
      switch (provider) {
        case "google_drive":
          await this.syncToGoogleDrive(
            encryptedData,
            accessToken,
            metadata?.cloudFileId
          );
          break;
        case "dropbox":
          await this.syncToDropbox(
            encryptedData,
            accessToken,
            metadata?.cloudFileId
          );
          break;
        case "onedrive":
          await this.syncToOneDrive(
            encryptedData,
            accessToken,
            metadata?.cloudFileId
          );
          break;
      }

      // 4. Update sync metadata
      if (isTauri()) {
        await tauriInvoke(TauriCommands.UPDATE_SYNC_METADATA, {
          sync_provider: provider,
          last_synced_at: Date.now(),
        });
      }

      status.isSyncing = false;
      status.lastSyncedAt = new Date();
      return status;
    } catch (error) {
      console.error("Sync failed:", error);
      return {
        isSyncing: false,
        error: error instanceof Error ? error.message : "Sync failed",
      };
    }
  }

  compareTimestamps(
    localModified: Date,
    cloudModified: Date
  ): "local_newer" | "cloud_newer" | "same" {
    const diff = localModified.getTime() - cloudModified.getTime();
    if (Math.abs(diff) < 1000) return "same"; // Within 1 second
    return diff > 0 ? "local_newer" : "cloud_newer";
  }

  /**
   * Sync to Google Drive
   */
  private async syncToGoogleDrive(
    encryptedData: string,
    accessToken: string,
    existingFileId?: string
  ): Promise<void> {
    const fileName = "manovyam-backup.encrypted";
    const url = existingFileId
      ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=media`
      : "https://www.googleapis.com/upload/drive/v3/files?uploadType=media";

    const response = await fetch(url, {
      method: existingFileId ? "PATCH" : "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/octet-stream",
      },
      body: encryptedData,
    });

    if (!response.ok) {
      throw new Error(`Google Drive sync failed: ${response.statusText}`);
    }
  }

  /**
   * Sync to Dropbox
   */
  private async syncToDropbox(
    encryptedData: string,
    accessToken: string,
    existingFileId?: string
  ): Promise<void> {
    const path = "/manovyam-backup.encrypted";
    const url = "https://content.dropboxapi.com/2/files/upload";

    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/octet-stream",
        "Dropbox-API-Arg": JSON.stringify({
          path,
          mode: "overwrite",
          autorename: false,
        }),
      },
      body: encryptedData,
    });

    if (!response.ok) {
      throw new Error(`Dropbox sync failed: ${response.statusText}`);
    }
  }

  /**
   * Sync to OneDrive
   */
  private async syncToOneDrive(
    encryptedData: string,
    accessToken: string,
    existingFileId?: string
  ): Promise<void> {
    const fileName = "manovyam-backup.encrypted";
    const url = existingFileId
      ? `https://graph.microsoft.com/v1.0/me/drive/items/${existingFileId}/content`
      : `https://graph.microsoft.com/v1.0/me/drive/root:/${fileName}:/content`;

    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/octet-stream",
      },
      body: encryptedData,
    });

    if (!response.ok) {
      throw new Error(`OneDrive sync failed: ${response.statusText}`);
    }
  }

  /**
   * Mock metadata for browser
   */
  private getMockMetadata(): SyncMetadata {
    return {
      id: 1,
      lastSyncedAt: undefined,
      syncProvider: undefined,
      cloudFileId: undefined,
      cloudFileModifiedAt: undefined,
    };
  }

  /**
   * Export from localStorage (browser fallback)
   */
  private async exportLocalStorage(password: string): Promise<string> {
    const data = {
      notes: localStorage.getItem("manovyam-notes"),
      aiHistory: localStorage.getItem("manovyam-ai-history"),
      settings: localStorage.getItem("manovyam-settings"),
      exportedAt: Date.now(),
    };

    // Simple base64 encoding (in production, use proper AES-256 encryption)
    const jsonStr = JSON.stringify(data);
    return btoa(jsonStr);
  }

  /**
   * Import to localStorage (browser fallback)
   */
  private async importLocalStorage(
    encryptedData: string,
    password: string
  ): Promise<void> {
    try {
      // Simple base64 decoding (in production, use proper AES-256 decryption)
      const jsonStr = atob(encryptedData);
      const data = JSON.parse(jsonStr);

      if (data.notes) localStorage.setItem("manovyam-notes", data.notes);
      if (data.aiHistory)
        localStorage.setItem("manovyam-ai-history", data.aiHistory);
      if (data.settings)
        localStorage.setItem("manovyam-settings", data.settings);
    } catch (error) {
      throw new Error("Invalid backup file or incorrect password");
    }
  }
}
