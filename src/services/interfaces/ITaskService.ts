import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskSession,
  CreateSessionDto,
  UpdateSessionDto,
} from "../../models/Task";

/**
 * Interface for Task Service
 */
export interface ITaskService {
  // Task CRUD
  getAllTasks(): Promise<Task[]>;
  getTaskById(id: string): Promise<Task | null>;
  getTasksByNote(noteId: string): Promise<Task[]>;
  createTask(dto: CreateTaskDto): Promise<Task>;
  updateTask(id: string, dto: UpdateTaskDto): Promise<Task>;
  deleteTask(id: string): Promise<void>;

  // Bulk operations
  createTasksFromNote(noteId: string, taskTitles: string[]): Promise<Task[]>;

  // Session management
  getSessionsByTask(taskId: string): Promise<TaskSession[]>;
  createSession(dto: CreateSessionDto): Promise<TaskSession>;
  updateSession(id: string, dto: UpdateSessionDto): Promise<TaskSession>;
  getActiveSession(): Promise<TaskSession | null>;

  // Statistics
  getTotalTimeSpent(taskId: string): Promise<number>;
  getTaskStats(): Promise<{
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  }>;
}
