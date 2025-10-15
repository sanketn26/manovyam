/**
 * Domain Model for Task
 */
export interface Task {
  id: string;
  noteId?: string; // Link to parent note
  title: string;
  description?: string;
  status: "todo" | "in_progress" | "done" | "cancelled";
  priority: "low" | "medium" | "high";
  dueDate?: Date;
  estimatedMinutes?: number; // Estimated time in minutes
  actualMinutes: number; // Tracked time in minutes
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface CreateTaskDto {
  noteId?: string;
  title: string;
  description?: string;
  priority?: "low" | "medium" | "high";
  dueDate?: Date;
  estimatedMinutes?: number;
  tags?: string[];
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: "todo" | "in_progress" | "done" | "cancelled";
  priority?: "low" | "medium" | "high";
  dueDate?: Date;
  estimatedMinutes?: number;
  tags?: string[];
}

/**
 * Task Session (Pomodoro tracking)
 */
export interface TaskSession {
  id: string;
  taskId: string;
  startedAt: Date;
  endedAt?: Date;
  durationMinutes: number;
  type: "pomodoro" | "short_break" | "long_break";
  completed: boolean;
  achievement?: string; // What was achieved in this session
  pending?: string; // What's still pending
  notes?: string;
}

export interface CreateSessionDto {
  taskId: string;
  type?: "pomodoro" | "short_break" | "long_break";
}

export interface UpdateSessionDto {
  endedAt?: Date;
  durationMinutes?: number;
  completed?: boolean;
  achievement?: string;
  pending?: string;
  notes?: string;
}

/**
 * Pomodoro Settings
 */
export interface PomodoroSettings {
  workDuration: number; // minutes
  shortBreakDuration: number; // minutes
  longBreakDuration: number; // minutes
  sessionsUntilLongBreak: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
}

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
  autoStartBreaks: false,
  autoStartPomodoros: false,
};
