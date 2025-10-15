import { useEffect, useCallback } from "react";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskSession,
  PomodoroSettings,
} from "../models/Task";
import { ITaskService } from "../services/interfaces/ITaskService";
import {
  tasksAtom,
  activeTaskIdAtom,
  activeTaskAtom,
  todoTasksAtom,
  inProgressTasksAtom,
  doneTasksAtom,
  currentSessionAtom,
  pomodoroTimerAtom,
  pomodoroSettingsAtom,
  taskSessionsAtom,
  taskPanelOpenAtom,
  showCompletedTasksAtom,
} from "../store/taskAtoms";
import { errorAtom } from "../store/atoms";

/**
 * ViewModel for Task Management and Pomodoro
 */
export function useTaskViewModel(taskService: ITaskService) {
  // Jotai atoms
  const [tasks, setTasks] = useAtom(tasksAtom);
  const [activeTaskId, setActiveTaskId] = useAtom(activeTaskIdAtom);
  const activeTask = useAtomValue(activeTaskAtom);
  const todoTasks = useAtomValue(todoTasksAtom);
  const inProgressTasks = useAtomValue(inProgressTasksAtom);
  const doneTasks = useAtomValue(doneTasksAtom);
  const [currentSession, setCurrentSession] = useAtom(currentSessionAtom);
  const [timerState, setTimerState] = useAtom(pomodoroTimerAtom);
  const [pomodoroSettings, setPomodoroSettings] = useAtom(
    pomodoroSettingsAtom
  );
  const [sessions, setSessions] = useAtom(taskSessionsAtom);
  const [isPanelOpen, setIsPanelOpen] = useAtom(taskPanelOpenAtom);
  const [showCompleted, setShowCompleted] = useAtom(showCompletedTasksAtom);
  const setError = useSetAtom(errorAtom);

  /**
   * Load all tasks
   */
  const loadTasks = useCallback(async () => {
    try {
      const allTasks = await taskService.getAllTasks();
      setTasks(allTasks);

      // Check for active session
      const activeSession = await taskService.getActiveSession();
      if (activeSession) {
        setCurrentSession(activeSession);
        setActiveTaskId(activeSession.taskId);
      }
    } catch (err) {
      console.error("Error loading tasks:", err);
      setError(err instanceof Error ? err.message : "Failed to load tasks");
    }
  }, [taskService, setTasks, setCurrentSession, setActiveTaskId, setError]);

  /**
   * Create a new task
   */
  const createTask = useCallback(
    async (dto: CreateTaskDto) => {
      try {
        const task = await taskService.createTask(dto);
        setTasks((prev) => [...prev, task]);
        return task;
      } catch (err) {
        console.error("Error creating task:", err);
        setError(err instanceof Error ? err.message : "Failed to create task");
        throw err;
      }
    },
    [taskService, setTasks, setError]
  );

  /**
   * Update a task
   */
  const updateTask = useCallback(
    async (id: string, dto: UpdateTaskDto) => {
      try {
        const updated = await taskService.updateTask(id, dto);
        setTasks((prev) => prev.map((task) => (task.id === id ? updated : task)));
        return updated;
      } catch (err) {
        console.error("Error updating task:", err);
        setError(err instanceof Error ? err.message : "Failed to update task");
        throw err;
      }
    },
    [taskService, setTasks, setError]
  );

  /**
   * Delete a task
   */
  const deleteTask = useCallback(
    async (id: string) => {
      try {
        await taskService.deleteTask(id);
        setTasks((prev) => prev.filter((task) => task.id !== id));
      } catch (err) {
        console.error("Error deleting task:", err);
        setError(err instanceof Error ? err.message : "Failed to delete task");
        throw err;
      }
    },
    [taskService, setTasks, setError]
  );

  /**
   * Create tasks from note content (AI-powered)
   */
  const createTasksFromNote = useCallback(
    async (noteId: string, taskTitles: string[]) => {
      try {
        const created = await taskService.createTasksFromNote(
          noteId,
          taskTitles
        );
        setTasks((prev) => [...prev, ...created]);
        return created;
      } catch (err) {
        console.error("Error creating tasks from note:", err);
        setError(
          err instanceof Error ? err.message : "Failed to create tasks"
        );
        throw err;
      }
    },
    [taskService, setTasks, setError]
  );

  /**
   * Start working on a task (start pomodoro)
   */
  const startTask = useCallback(
    async (taskId: string) => {
      try {
        // Update task status to in_progress
        await updateTask(taskId, { status: "in_progress" });

        // Create a new session
        const session = await taskService.createSession({ taskId });
        setCurrentSession(session);
        setActiveTaskId(taskId);

        // Initialize timer
        const workDuration = pomodoroSettings.workDuration * 60;
        setTimerState({
          isRunning: true,
          isPaused: false,
          timeRemaining: workDuration,
          totalTime: workDuration,
          sessionType: "pomodoro",
          completedPomodoros: timerState.completedPomodoros,
        });
      } catch (err) {
        console.error("Error starting task:", err);
        setError(err instanceof Error ? err.message : "Failed to start task");
        throw err;
      }
    },
    [
      taskService,
      updateTask,
      setCurrentSession,
      setActiveTaskId,
      setTimerState,
      pomodoroSettings,
      timerState.completedPomodoros,
      setError,
    ]
  );

  /**
   * Pause/Resume pomodoro
   */
  const togglePause = useCallback(() => {
    setTimerState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, [setTimerState]);

  /**
   * Stop pomodoro and save session
   */
  const stopTask = useCallback(
    async (achievement?: string, pending?: string) => {
      if (!currentSession) return;

      try {
        const now = new Date();
        const duration = Math.floor(
          (now.getTime() - currentSession.startedAt.getTime()) / 1000 / 60
        );

        await taskService.updateSession(currentSession.id, {
          endedAt: now,
          durationMinutes: duration,
          completed: timerState.timeRemaining <= 0,
          achievement,
          pending,
        });

        // Load updated sessions
        if (activeTaskId) {
          const taskSessions = await taskService.getSessionsByTask(
            activeTaskId
          );
          setSessions(taskSessions);
        }

        // Reset timer
        setCurrentSession(null);
        setTimerState((prev) => ({
          ...prev,
          isRunning: false,
          isPaused: false,
          timeRemaining: pomodoroSettings.workDuration * 60,
        }));
      } catch (err) {
        console.error("Error stopping task:", err);
        setError(err instanceof Error ? err.message : "Failed to stop task");
        throw err;
      }
    },
    [
      currentSession,
      activeTaskId,
      taskService,
      timerState,
      pomodoroSettings,
      setCurrentSession,
      setTimerState,
      setSessions,
      setError,
    ]
  );

  /**
   * Complete a task
   */
  const completeTask = useCallback(
    async (taskId: string) => {
      await updateTask(taskId, { status: "done" });
    },
    [updateTask]
  );

  /**
   * Load task sessions
   */
  const loadTaskSessions = useCallback(
    async (taskId: string) => {
      try {
        const taskSessions = await taskService.getSessionsByTask(taskId);
        setSessions(taskSessions);
      } catch (err) {
        console.error("Error loading task sessions:", err);
      }
    },
    [taskService, setSessions]
  );

  /**
   * Update pomodoro settings
   */
  const updatePomodoroSettings = useCallback(
    (settings: Partial<PomodoroSettings>) => {
      setPomodoroSettings((prev) => ({ ...prev, ...settings }));
    },
    [setPomodoroSettings]
  );

  /**
   * Toggle task panel
   */
  const toggleTaskPanel = useCallback(() => {
    setIsPanelOpen((prev) => !prev);
  }, [setIsPanelOpen]);

  // Load tasks on mount
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Timer countdown effect
  useEffect(() => {
    if (!timerState.isRunning || timerState.isPaused) return;

    const interval = setInterval(() => {
      setTimerState((prev) => {
        const newTime = prev.timeRemaining - 1;

        if (newTime <= 0) {
          // Pomodoro completed
          return {
            ...prev,
            isRunning: false,
            timeRemaining: 0,
            completedPomodoros: prev.completedPomodoros + 1,
          };
        }

        return {
          ...prev,
          timeRemaining: newTime,
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timerState.isRunning, timerState.isPaused, setTimerState]);

  return {
    // State
    tasks,
    activeTask,
    activeTaskId,
    todoTasks,
    inProgressTasks,
    doneTasks,
    currentSession,
    timerState,
    pomodoroSettings,
    sessions,
    isPanelOpen,
    showCompleted,

    // Actions
    loadTasks,
    createTask,
    updateTask,
    deleteTask,
    createTasksFromNote,
    startTask,
    togglePause,
    stopTask,
    completeTask,
    loadTaskSessions,
    updatePomodoroSettings,
    toggleTaskPanel,
    setActiveTaskId,
    setShowCompleted,
  };
}
