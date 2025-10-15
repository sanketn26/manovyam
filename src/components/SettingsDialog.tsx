import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Settings } from "../models/Settings";
import { Eye, EyeOff, ExternalLink, Download, Upload, Info } from "lucide-react";
import { toast } from "sonner@2.0.3";
import { isFromEnvironment, ENV_KEYS } from "../utils/env";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: Settings;
  onSettingsUpdate: (settings: Partial<Settings>) => void;
  onExportDatabase?: () => void;
  onImportDatabase?: () => void;
}

export function SettingsDialog({
  open,
  onOpenChange,
  settings,
  onSettingsUpdate,
  onExportDatabase,
  onImportDatabase,
}: SettingsDialogProps) {
  const [apiKey, setApiKey] = useState(settings.openaiApiKey || "");
  const [baseURL, setBaseURL] = useState(
    settings.openaiBaseURL || "https://api.openai.com/v1"
  );
  const [showApiKey, setShowApiKey] = useState(false);
  
  // Check if using environment variables
  const isUsingEnvApiKey = isFromEnvironment(ENV_KEYS.OPENAI_API_KEY);
  const isUsingEnvBaseURL = isFromEnvironment(ENV_KEYS.OPENAI_BASE_URL);
  const [autoSave, setAutoSave] = useState(settings.autoSave ?? true);
  const [autoSaveDelay, setAutoSaveDelay] = useState(settings.autoSaveDelay || 1000);
  
  // Sync settings
  const [syncEnabled, setSyncEnabled] = useState(settings.syncEnabled ?? false);
  const [syncProvider, setSyncProvider] = useState<"google_drive" | "dropbox" | "onedrive" | undefined>(
    settings.syncProvider
  );
  const [encryptionPassword, setEncryptionPassword] = useState(settings.encryptionPassword || "");
  const [showPassword, setShowPassword] = useState(false);

  // Update local state when settings change
  useEffect(() => {
    setApiKey(settings.openaiApiKey || "");
    setBaseURL(settings.openaiBaseURL || "https://api.openai.com/v1");
    setAutoSave(settings.autoSave ?? true);
    setAutoSaveDelay(settings.autoSaveDelay || 1000);
    setSyncEnabled(settings.syncEnabled ?? false);
    setSyncProvider(settings.syncProvider);
    setEncryptionPassword(settings.encryptionPassword || "");
  }, [settings]);

  const handleSave = () => {
    // Validate sync settings
    if (syncEnabled && !syncProvider) {
      toast.error("Please select a sync provider");
      return;
    }
    
    if (syncEnabled && !encryptionPassword) {
      toast.error("Please set an encryption password for cloud sync");
      return;
    }

    onSettingsUpdate({
      openaiApiKey: apiKey,
      openaiBaseURL: baseURL,
      autoSave,
      autoSaveDelay,
      syncEnabled,
      syncProvider,
      encryptionPassword,
    });
    toast.success("Settings saved!");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your Manovyam preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="ai" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ai">AI</TabsTrigger>
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="sync">Sync</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4 py-4">
            <div className="space-y-4">
              {isUsingEnvApiKey && (
                <div className="rounded-lg border border-blue-500/50 bg-blue-500/10 p-4">
                  <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-500">
                    <Info className="h-4 w-4" />
                    Using Environment Variable
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    OpenAI API Key is being loaded from environment variable
                    <code className="mx-1 rounded bg-muted px-1 py-0.5">{ENV_KEYS.OPENAI_API_KEY}</code>.
                    Settings below will be ignored.
                  </p>
                </div>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="apiKey">OpenAI API Key</Label>
                <div className="relative">
                  <Input
                    id="apiKey"
                    type={showApiKey ? "text" : "password"}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={isUsingEnvApiKey ? "Set via environment variable" : "sk-..."}
                    disabled={isUsingEnvApiKey}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowApiKey(!showApiKey)}
                    disabled={isUsingEnvApiKey}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {isUsingEnvApiKey ? (
                    "Configure via environment variable for better security"
                  ) : (
                    <>
                      Get your API key from{" "}
                      <a
                        href="https://platform.openai.com/api-keys"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        OpenAI Platform
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </>
                  )}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseURL">API Base URL</Label>
                <Input
                  id="baseURL"
                  type="text"
                  value={baseURL}
                  onChange={(e) => setBaseURL(e.target.value)}
                  placeholder="https://api.openai.com/v1"
                  disabled={isUsingEnvBaseURL}
                />
                <p className="text-xs text-muted-foreground">
                  {isUsingEnvBaseURL ? (
                    <>Set via <code className="mx-1 rounded bg-muted px-1 py-0.5">{ENV_KEYS.OPENAI_BASE_URL}</code> environment variable</>
                  ) : (
                    "Use a custom endpoint for OpenAI-compatible APIs (e.g., local LLMs with LM Studio, Ollama, etc.)"
                  )}
                </p>
              </div>

              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <h4 className="mb-2 font-medium">Supported Models</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• GPT-4 Turbo (recommended)</li>
                  <li>• GPT-4</li>
                  <li>• GPT-3.5 Turbo</li>
                  <li>• Any OpenAI-compatible model</li>
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <h4 className="mb-2 font-medium">Security & Privacy</h4>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  <li>✓ API keys stored per-device only</li>
                  <li>✓ Never included in backups or exports</li>
                  <li>✓ Environment variables recommended for production</li>
                  <li>✓ Notes sent to AI provider only when you use AI features</li>
                </ul>
              </div>
              
              <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
                <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-500">
                  💡 Recommended: Use Environment Variables
                </h4>
                <p className="text-xs text-muted-foreground mb-2">
                  For better security, set credentials via environment variables:
                </p>
                <code className="block text-xs bg-black/20 dark:bg-black/40 p-2 rounded">
                  {ENV_KEYS.OPENAI_API_KEY}=sk-your-key-here<br />
                  {ENV_KEYS.OPENAI_BASE_URL}=https://api.openai.com/v1
                </code>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="editor" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-save</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically save notes as you type
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={autoSave}
                  onChange={(e) => setAutoSave(e.target.checked)}
                  className="h-4 w-4"
                />
              </div>

              {autoSave && (
                <div className="space-y-2">
                  <Label htmlFor="autoSaveDelay">Auto-save Delay (ms)</Label>
                  <Input
                    id="autoSaveDelay"
                    type="number"
                    value={autoSaveDelay}
                    onChange={(e) => setAutoSaveDelay(Number(e.target.value))}
                    min={500}
                    max={5000}
                    step={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    Time to wait after typing stops before saving (500-5000ms)
                  </p>
                </div>
              )}

              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <h4 className="mb-2 font-medium">Editor Features</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Rich text formatting</li>
                  <li>• Code blocks with syntax highlighting</li>
                  <li>• Task lists with checkboxes</li>
                  <li>• Markdown support</li>
                  <li>• Keyboard shortcuts</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="sync" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Cloud Sync</Label>
                  <p className="text-xs text-muted-foreground">
                    Automatically backup your notes to cloud storage
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={syncEnabled}
                  onChange={(e) => setSyncEnabled(e.target.checked)}
                  className="h-4 w-4"
                />
              </div>

              {syncEnabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="syncProvider">Cloud Provider</Label>
                    <select
                      id="syncProvider"
                      value={syncProvider || ""}
                      onChange={(e) => setSyncProvider(e.target.value as any)}
                      className="w-full rounded-md border border-border bg-background px-3 py-2"
                    >
                      <option value="">Select provider...</option>
                      <option value="google_drive">Google Drive</option>
                      <option value="dropbox">Dropbox</option>
                      <option value="onedrive">OneDrive</option>
                    </select>
                    <p className="text-xs text-muted-foreground">
                      Choose where to store your encrypted backups
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="encryptionPassword">Encryption Password</Label>
                    <div className="relative">
                      <Input
                        id="encryptionPassword"
                        type={showPassword ? "text" : "password"}
                        value={encryptionPassword}
                        onChange={(e) => setEncryptionPassword(e.target.value)}
                        placeholder="Enter a strong password..."
                        className="pr-10"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Your data will be encrypted before upload. Keep this password safe!
                    </p>
                  </div>

                  <div className="rounded-lg border border-amber-500/50 bg-amber-500/10 p-4">
                    <h4 className="mb-2 flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-500">
                      ⚠️ Important
                    </h4>
                    <ul className="space-y-1 text-xs text-muted-foreground">
                      <li>• Your data is encrypted before being uploaded</li>
                      <li>• You'll need this password to restore your backup</li>
                      <li>• Lost passwords cannot be recovered</li>
                      <li>• Manual sync available from sidebar</li>
                    </ul>
                  </div>

                  <div className="rounded-lg border border-border bg-muted/50 p-4">
                    <h4 className="mb-2 font-medium">How Sync Works</h4>
                    <ol className="space-y-1 text-sm text-muted-foreground">
                      <li>1. Click the Sync button in the sidebar</li>
                      <li>2. Authorize access to your cloud provider</li>
                      <li>3. Your encrypted database is uploaded</li>
                      <li>4. Access from any device with the same account</li>
                    </ol>
                  </div>
                </>
              )}

              <div className="space-y-3 border-t border-border pt-4">
                <h4 className="font-medium">Manual Backup</h4>
                <p className="text-sm text-muted-foreground">
                  Export and import your encrypted database manually
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={onExportDatabase}
                  >
                    <Download className="h-4 w-4" />
                    Export Database
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 gap-2"
                    onClick={onImportDatabase}
                  >
                    <Upload className="h-4 w-4" />
                    Import Database
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="about" className="space-y-4 py-4">
            <div className="space-y-4">
              <div className="text-center">
                <div className="mb-4 text-6xl">🎮</div>
                <h3 className="mb-2 text-xl font-semibold">Manovyam</h3>
                <p className="mb-4 text-sm text-muted-foreground">
                  Your mind's playground
                </p>
                <p className="text-xs text-muted-foreground">Version 1.0.0</p>
              </div>

              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <h4 className="mb-2 font-medium">Features</h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Local-first note-taking</li>
                  <li>• AI-powered assistance</li>
                  <li>• Task management with Pomodoro</li>
                  <li>• Cloud sync support</li>
                  <li>• Full-text search</li>
                  <li>• Export to Markdown/PDF</li>
                  <li>• Dark/Light theme</li>
                </ul>
              </div>

              <div className="rounded-lg border border-border bg-muted/50 p-4">
                <h4 className="mb-2 font-medium">Architecture</h4>
                <p className="text-sm text-muted-foreground">
                  Built with MVVM architecture using React, Tauri, TypeScript,
                  and Jotai state management. SQLite backend with FTS5
                  full-text search.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
