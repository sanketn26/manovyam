import { useMemo, useEffect, useState } from "react";
import { Provider as JotaiProvider, useAtom, useAtomValue } from "jotai";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { AIPanel } from "./components/AIPanel";
import { TaskPanel } from "./components/TaskPanel";
import { SettingsDialog } from "./components/SettingsDialog";
import { ServiceFactory } from "./services/ServiceFactory";
import { useNotesViewModel } from "./viewmodels/useNotesViewModel";
import { useAIViewModel } from "./viewmodels/useAIViewModel";
import { useSettingsViewModel } from "./viewmodels/useSettingsViewModel";
import { useSyncViewModel } from "./viewmodels/useSyncViewModel";
import { useTaskViewModel } from "./viewmodels/useTaskViewModel";
import { isTauri } from "./utils/tauri";
import { themeAtom, resolvedThemeAtom } from "./store/atoms";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner@2.0.3";
import { Settings } from "./models/Settings";

/**
 * Main App Component
 * Uses MVVM architecture with Jotai state management:
 * - View: React components (Sidebar, Editor, AIPanel, TaskPanel)
 * - ViewModel: useNotesViewModel, useAIViewModel, etc. (business logic & state)
 * - Model: Note, AIMessage, Settings, Task (data structures)
 * - Service: INoteService, IAIService, ITaskService, etc. (data access abstraction)
 * - Store: Jotai atoms (global state)
 */
function AppContent() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  // Get service instances (automatically chooses Tauri or Local implementation)
  const noteService = useMemo(() => ServiceFactory.getNoteService(), []);
  const aiService = useMemo(() => ServiceFactory.getAIService(), []);
  const settingsService = useMemo(() => ServiceFactory.getSettingsService(), []);
  const syncService = useMemo(() => ServiceFactory.getSyncService(), []);
  const taskService = useMemo(() => ServiceFactory.getTaskService(), []);

  // Initialize ViewModels
  const notesVM = useNotesViewModel(noteService, settingsService);
  const aiVM = useAIViewModel(aiService);
  const settingsVM = useSettingsViewModel(settingsService);
  const syncVM = useSyncViewModel(syncService);
  const taskVM = useTaskViewModel(taskService);

  // Theme management
  const [theme, setTheme] = useAtom(themeAtom);
  const resolvedTheme = useAtomValue(resolvedThemeAtom);

  // Apply theme to document and listen for system theme changes
  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (isDark: boolean) => {
      if (isDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };

    // Apply initial theme
    applyTheme(resolvedTheme === "dark");

    // Listen for system theme changes if theme is set to "system"
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        applyTheme(e.matches);
      };
      
      mediaQuery.addEventListener("change", handleChange);
      
      return () => {
        mediaQuery.removeEventListener("change", handleChange);
      };
    }
  }, [resolvedTheme, theme]);

  // Log environment info
  useEffect(() => {
    console.info("Manovyam initialized");
    console.info("Running in:", isTauri() ? "Tauri (Desktop)" : "Browser");
    console.info("Auto-save:", settingsVM.settings.autoSave ? "Enabled" : "Disabled");
    console.info("Theme:", theme);
  }, [settingsVM.settings.autoSave, theme]);

  /**
   * Handle settings update
   */
  const handleSettingsUpdate = async (updates: Partial<Settings>) => {
    try {
      await settingsVM.updateSettings(updates);
      
      // If API key was updated, reinitialize AI service
      if (updates.openaiApiKey !== undefined) {
        ServiceFactory.updateAIService(
          updates.openaiApiKey,
          updates.openaiBaseURL
        );
        // Reload AI data
        aiVM.loadData();
        toast.success("AI service updated with new API key");
      }
    } catch (error) {
      console.error("Failed to update settings:", error);
      toast.error("Failed to update settings");
    }
  };

  /**
   * Extract tasks from current note using AI
   */
  const handleExtractTasks = async () => {
    if (!notesVM.activeNote) {
      toast.error("No active note to extract tasks from");
      return;
    }

    try {
      const loadingToast = toast.loading("Extracting tasks...");
      
      const taskTitles = await aiService.extractTasksFromNote(
        notesVM.activeNote.content
      );

      toast.dismiss(loadingToast);

      if (taskTitles.length === 0) {
        toast.info("No tasks found in this note");
        return;
      }

      const createdTasks = await taskVM.createTasksFromNote(
        notesVM.activeNote.id,
        taskTitles
      );

      toast.success(`Created ${createdTasks.length} tasks!`);
      
      // Open task panel to show new tasks
      if (!taskVM.isPanelOpen) {
        taskVM.toggleTaskPanel();
      }
    } catch (error) {
      console.error("Failed to extract tasks:", error);
      toast.error("Failed to extract tasks");
    }
  };

  /**
   * Handle sync to cloud
   */
  const handleSync = async () => {
    const { syncEnabled, syncProvider, encryptionPassword } = settingsVM.settings;
    
    if (!syncEnabled || !syncProvider || !encryptionPassword) {
      toast.error("Please configure sync in settings first");
      setSettingsOpen(true);
      return;
    }

    try {
      // For now, we'll show a message that OAuth is needed
      // In a real implementation, you'd initiate OAuth flow here
      toast.info("Opening OAuth flow...");
      
      // This is a placeholder - in production you'd:
      // 1. Open OAuth window for the selected provider
      // 2. Get access token
      // 3. Call syncToCloud with the token
      
      toast.error(
        "Cloud sync requires OAuth implementation. Please use Export Database feature in the meantime.",
        { duration: 5000 }
      );
      
      // Uncomment when OAuth is implemented:
      // const accessToken = await getOAuthToken(syncProvider);
      // await syncVM.syncToCloud(syncProvider, accessToken, encryptionPassword);
      // toast.success("Sync completed successfully!");
      
    } catch (error) {
      console.error("Sync failed:", error);
      toast.error("Sync failed. Please try again.");
    }
  };

  /**
   * Export database
   */
  const handleExportDatabase = async () => {
    const password = prompt("Enter encryption password for backup:");
    if (!password) return;

    try {
      const loadingToast = toast.loading("Exporting database...");
      const encryptedData = await syncVM.exportDatabase(password);
      toast.dismiss(loadingToast);

      // Create download link
      const blob = new Blob([encryptedData], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `manovyam-backup-${new Date().toISOString().split("T")[0]}.encrypted`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Database exported successfully!");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export database");
    }
  };

  /**
   * Import database
   */
  const handleImportDatabase = async () => {
    const password = prompt("Enter the encryption password used for this backup:");
    if (!password) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".encrypted";
    
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      try {
        const loadingToast = toast.loading("Importing database...");
        const encryptedData = await file.text();
        
        await syncVM.importDatabase(encryptedData, password);
        toast.dismiss(loadingToast);
        
        toast.success("Database imported! Reloading...");
        
        // Reload the app after import
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } catch (error) {
        console.error("Import failed:", error);
        toast.error("Failed to import database. Check your password and file.");
      }
    };

    input.click();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar View */}
      <Sidebar
        notes={notesVM.notes}
        activeNoteId={notesVM.activeNoteId}
        onNoteSelect={notesVM.selectNote}
        onNewNote={notesVM.createNote}
        searchQuery={notesVM.searchQuery}
        onSearchChange={notesVM.searchNotes}
        theme={theme}
        onThemeChange={setTheme}
        onToggleTasks={taskVM.toggleTaskPanel}
        onOpenSettings={() => setSettingsOpen(true)}
        onSync={settingsVM.settings.syncEnabled ? handleSync : undefined}
        isSyncing={syncVM.syncStatus.isSyncing}
        lastSyncedAt={syncVM.lastSyncedAt}
      />

      {/* Editor View */}
      <Editor
        note={notesVM.activeNote}
        onUpdate={notesVM.updateNoteContent}
        onTitleUpdate={notesVM.updateNoteTitle}
        onToggleAI={aiVM.togglePanel}
        onTagsChange={notesVM.updateNoteTags}
        onDeleteNote={notesVM.deleteNote}
      />

      {/* AI Panel View */}
      <AIPanel
        isOpen={aiVM.isOpen}
        onClose={aiVM.closePanel}
        messages={aiVM.messages}
        availableModels={aiVM.availableModels}
        selectedModel={aiVM.selectedModel}
        isLoading={aiVM.isLoading}
        onSendMessage={(message) => {
          // Automatically include current note as context
          const context = notesVM.activeNote
            ? [notesVM.activeNote.content]
            : undefined;
          aiVM.sendMessage(message, context);
        }}
        onChangeModel={aiVM.changeModel}
        onExtractTasks={handleExtractTasks}
        currentNote={notesVM.activeNote}
      />

      {/* Task Panel View */}
      <TaskPanel
        isOpen={taskVM.isPanelOpen}
        onClose={taskVM.toggleTaskPanel}
        todoTasks={taskVM.todoTasks}
        inProgressTasks={taskVM.inProgressTasks}
        doneTasks={taskVM.doneTasks}
        activeTask={taskVM.activeTask}
        activeTaskId={taskVM.activeTaskId}
        showCompleted={taskVM.showCompleted}
        isTimerRunning={taskVM.timerState.isRunning}
        isTimerPaused={taskVM.timerState.isPaused}
        timeRemaining={taskVM.timerState.timeRemaining}
        totalTime={taskVM.timerState.totalTime}
        completedPomodoros={taskVM.timerState.completedPomodoros}
        onCreateTask={(title) => taskVM.createTask({ title })}
        onStartTask={taskVM.startTask}
        onCompleteTask={taskVM.completeTask}
        onDeleteTask={taskVM.deleteTask}
        onTaskClick={taskVM.setActiveTaskId}
        onPauseTimer={taskVM.togglePause}
        onStopTimer={taskVM.stopTask}
        onToggleShowCompleted={taskVM.setShowCompleted}
      />

      {/* Settings Dialog */}
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settingsVM.settings}
        onSettingsUpdate={handleSettingsUpdate}
        onExportDatabase={handleExportDatabase}
        onImportDatabase={handleImportDatabase}
      />

      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}

/**
 * Root App Component with Jotai Provider
 */
export default function App() {
  return (
    <JotaiProvider>
      <AppContent />
    </JotaiProvider>
  );
}
