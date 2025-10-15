/**
 * Jotai Atoms for Tasks and Pomodoro
 */
import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { Task, TaskSession, PomodoroSettings, DEFAULT_POMODORO_SETTINGS } from "../models/Task";

// ============================================================================
// Tasks
// ============================================================================

/**
 * All tasks
 */
export const tasksAtom = atom<Task[]>([]);

/**
 * Active task (currently working on)
 */
export const activeTaskIdAtom = atom<string | null>(null);

/**
 * Active task (derived)
 */
export const activeTaskAtom = atom((get) => {
  const tasks = get(tasksAtom);
  const activeId = get(activeTaskIdAtom);
  return tasks.find((task) => task.id === activeId) || null;
});

/**
 * Tasks filtered by status
 */
export const todoTasksAtom = atom((get) => {
  const tasks = get(tasksAtom);
  return tasks.filter((task) => task.status === "todo");
});

export const inProgressTasksAtom = atom((get) => {
  const tasks = get(tasksAtom);
  return tasks.filter((task) => task.status === "in_progress");
});

export const doneTasksAtom = atom((get) => {
  const tasks = get(tasksAtom);
  return tasks.filter((task) => task.status === "done");
});

/**
 * Tasks for active note
 * Note: This requires importing activeNoteIdAtom when needed
 */
export const activeNoteTasksAtom = atom((get) => {
  const tasks = get(tasksAtom);
  // This will be filtered in the component/viewmodel that has access to activeNoteId
  // Keeping as simple filter for all tasks here
  return tasks;
});

// ============================================================================
// Pomodoro
// ============================================================================

/**
 * Pomodoro settings
 */
export const pomodoroSettingsAtom = atomWithStorage<PomodoroSettings>(
  "manovyam-pomodoro-settings",
  DEFAULT_POMODORO_SETTINGS
);

/**
 * Current pomodoro session
 */
export const currentSessionAtom = atom<TaskSession | null>(null);

/**
 * Pomodoro timer state
 */
export interface PomodoroTimerState {
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number; // seconds
  totalTime: number; // seconds
  sessionType: "pomodoro" | "short_break" | "long_break";
  completedPomodoros: number;
}

export const pomodoroTimerAtom = atom<PomodoroTimerState>({
  isRunning: false,
  isPaused: false,
  timeRemaining: 25 * 60, // 25 minutes default
  totalTime: 25 * 60,
  sessionType: "pomodoro",
  completedPomodoros: 0,
});

/**
 * Task sessions history
 */
export const taskSessionsAtom = atom<TaskSession[]>([]);

// ============================================================================
// UI State
// ============================================================================

/**
 * Task panel open/closed
 */
export const taskPanelOpenAtom = atom<boolean>(false);

/**
 * Show completed tasks
 */
export const showCompletedTasksAtom = atomWithStorage<boolean>(
  "manovyam-show-completed-tasks",
  false
);
