import { ITaskService } from "../interfaces/ITaskService";
import {
  Task,
  CreateTaskDto,
  UpdateTaskDto,
  TaskSession,
  CreateSessionDto,
  UpdateSessionDto,
} from "../../models/Task";

/**
 * Local Storage implementation of Task Service
 */
export class LocalTaskService implements ITaskService {
  private readonly TASKS_KEY = "manovyam-tasks";
  private readonly SESSIONS_KEY = "manovyam-task-sessions";

  private getTasks(): Task[] {
    const data = localStorage.getItem(this.TASKS_KEY);
    if (!data) return [];

    const tasks = JSON.parse(data);
    return tasks.map((task: any) => ({
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
    }));
  }

  private saveTasks(tasks: Task[]): void {
    localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks));
  }

  private getSessions(): TaskSession[] {
    const data = localStorage.getItem(this.SESSIONS_KEY);
    if (!data) return [];

    const sessions = JSON.parse(data);
    return sessions.map((session: any) => ({
      ...session,
      startedAt: new Date(session.startedAt),
      endedAt: session.endedAt ? new Date(session.endedAt) : undefined,
    }));
  }

  private saveSessions(sessions: TaskSession[]): void {
    localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(sessions));
  }

  async getAllTasks(): Promise<Task[]> {
    return this.getTasks();
  }

  async getTaskById(id: string): Promise<Task | null> {
    const tasks = this.getTasks();
    return tasks.find((task) => task.id === id) || null;
  }

  async getTasksByNote(noteId: string): Promise<Task[]> {
    const tasks = this.getTasks();
    return tasks.filter((task) => task.noteId === noteId);
  }

  async createTask(dto: CreateTaskDto): Promise<Task> {
    const tasks = this.getTasks();
    const now = new Date();

    const newTask: Task = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      noteId: dto.noteId,
      title: dto.title,
      description: dto.description,
      status: "todo",
      priority: dto.priority || "medium",
      dueDate: dto.dueDate,
      estimatedMinutes: dto.estimatedMinutes,
      actualMinutes: 0,
      tags: dto.tags || [],
      createdAt: now,
      updatedAt: now,
    };

    tasks.push(newTask);
    this.saveTasks(tasks);
    return newTask;
  }

  async updateTask(id: string, dto: UpdateTaskDto): Promise<Task> {
    const tasks = this.getTasks();
    const index = tasks.findIndex((task) => task.id === id);

    if (index === -1) {
      throw new Error("Task not found");
    }

    const updatedTask: Task = {
      ...tasks[index],
      ...dto,
      updatedAt: new Date(),
      completedAt:
        dto.status === "done" && !tasks[index].completedAt
          ? new Date()
          : tasks[index].completedAt,
    };

    tasks[index] = updatedTask;
    this.saveTasks(tasks);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    const tasks = this.getTasks();
    const filtered = tasks.filter((task) => task.id !== id);
    this.saveTasks(filtered);
  }

  async createTasksFromNote(
    noteId: string,
    taskTitles: string[]
  ): Promise<Task[]> {
    const createdTasks: Task[] = [];

    for (const title of taskTitles) {
      const task = await this.createTask({
        noteId,
        title: title.trim(),
        priority: "medium",
      });
      createdTasks.push(task);
    }

    return createdTasks;
  }

  async getSessionsByTask(taskId: string): Promise<TaskSession[]> {
    const sessions = this.getSessions();
    return sessions.filter((session) => session.taskId === taskId);
  }

  async createSession(dto: CreateSessionDto): Promise<TaskSession> {
    const sessions = this.getSessions();

    const newSession: TaskSession = {
      id: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskId: dto.taskId,
      startedAt: new Date(),
      type: dto.type || "pomodoro",
      durationMinutes: 0,
      completed: false,
    };

    sessions.push(newSession);
    this.saveSessions(sessions);
    return newSession;
  }

  async updateSession(id: string, dto: UpdateSessionDto): Promise<TaskSession> {
    const sessions = this.getSessions();
    const index = sessions.findIndex((session) => session.id === id);

    if (index === -1) {
      throw new Error("Session not found");
    }

    const updatedSession: TaskSession = {
      ...sessions[index],
      ...dto,
    };

    sessions[index] = updatedSession;
    this.saveSessions(sessions);

    // Update task's actual minutes
    if (dto.durationMinutes) {
      const task = await this.getTaskById(updatedSession.taskId);
      if (task) {
        await this.updateTask(task.id, {
          actualMinutes: task.actualMinutes + dto.durationMinutes,
        });
      }
    }

    return updatedSession;
  }

  async getActiveSession(): Promise<TaskSession | null> {
    const sessions = this.getSessions();
    return (
      sessions.find((session) => !session.endedAt && !session.completed) ||
      null
    );
  }

  async getTotalTimeSpent(taskId: string): Promise<number> {
    const sessions = await this.getSessionsByTask(taskId);
    return sessions.reduce(
      (total, session) => total + session.durationMinutes,
      0
    );
  }

  async getTaskStats(): Promise<{
    total: number;
    todo: number;
    inProgress: number;
    done: number;
  }> {
    const tasks = this.getTasks();

    return {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === "todo").length,
      inProgress: tasks.filter((t) => t.status === "in_progress").length,
      done: tasks.filter((t) => t.status === "done").length,
    };
  }
}
