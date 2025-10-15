import { X, Plus, ListTodo, Filter } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { TaskList } from "./TaskList";
import { PomodoroTimer } from "./PomodoroTimer";
import { Task } from "../models/Task";
import { useState } from "react";
import { Switch } from "./ui/switch";

interface TaskPanelProps {
  isOpen: boolean;
  onClose: () => void;
  
  // Tasks
  todoTasks: Task[];
  inProgressTasks: Task[];
  doneTasks: Task[];
  activeTask: Task | null;
  activeTaskId: string | null;
  showCompleted: boolean;
  
  // Pomodoro
  isTimerRunning: boolean;
  isTimerPaused: boolean;
  timeRemaining: number;
  totalTime: number;
  completedPomodoros: number;
  
  // Actions
  onCreateTask: (title: string) => void;
  onStartTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onTaskClick: (taskId: string) => void;
  onPauseTimer: () => void;
  onStopTimer: (achievement?: string, pending?: string) => void;
  onToggleShowCompleted: (show: boolean) => void;
}

export function TaskPanel({
  isOpen,
  onClose,
  todoTasks,
  inProgressTasks,
  doneTasks,
  activeTask,
  activeTaskId,
  showCompleted,
  isTimerRunning,
  isTimerPaused,
  timeRemaining,
  totalTime,
  completedPomodoros,
  onCreateTask,
  onStartTask,
  onCompleteTask,
  onDeleteTask,
  onTaskClick,
  onPauseTimer,
  onStopTimer,
  onToggleShowCompleted,
}: TaskPanelProps) {
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const handleCreateTask = () => {
    if (newTaskTitle.trim()) {
      onCreateTask(newTaskTitle.trim());
      setNewTaskTitle("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="flex h-full w-80 flex-col border-l border-border bg-bg-0">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <ListTodo className="h-5 w-5 text-accent-green" />
          <span>Tasks</span>
        </div>
        <Button size="sm" variant="ghost" onClick={onClose} className="h-8 w-8 p-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Active Pomodoro */}
      {activeTask && isTimerRunning && (
        <div className="border-b border-border p-4">
          <PomodoroTimer
            task={activeTask}
            isRunning={isTimerRunning}
            isPaused={isTimerPaused}
            timeRemaining={timeRemaining}
            totalTime={totalTime}
            completedPomodoros={completedPomodoros}
            onStart={() => onStartTask(activeTask.id)}
            onPause={onPauseTimer}
            onStop={onStopTimer}
          />
        </div>
      )}

      {/* New Task Input */}
      <div className="border-b border-border p-4">
        <div className="flex gap-2">
          <Input
            placeholder="Add a new task..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleCreateTask();
              }
            }}
            className="flex-1"
          />
          <Button size="sm" onClick={handleCreateTask} className="px-3">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Task Tabs */}
      <Tabs defaultValue="todo" className="flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-border px-4">
          <TabsList className="w-full">
            <TabsTrigger value="todo" className="flex-1">
              To Do
              {todoTasks.length > 0 && (
                <span className="ml-2 rounded-full bg-accent-green/20 px-2 py-0.5 text-xs text-accent-green">
                  {todoTasks.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="in-progress" className="flex-1">
              Active
              {inProgressTasks.length > 0 && (
                <span className="ml-2 rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-500">
                  {inProgressTasks.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="done" className="flex-1">
              Done
              {doneTasks.length > 0 && (
                <span className="ml-2 rounded-full bg-muted-foreground/20 px-2 py-0.5 text-xs text-muted-foreground">
                  {doneTasks.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-4">
            <TabsContent value="todo" className="mt-0">
              <TaskList
                tasks={todoTasks}
                activeTaskId={activeTaskId}
                onTaskClick={onTaskClick}
                onStartTask={onStartTask}
                onCompleteTask={onCompleteTask}
                onDeleteTask={onDeleteTask}
              />
            </TabsContent>

            <TabsContent value="in-progress" className="mt-0">
              <TaskList
                tasks={inProgressTasks}
                activeTaskId={activeTaskId}
                onTaskClick={onTaskClick}
                onStartTask={onStartTask}
                onCompleteTask={onCompleteTask}
                onDeleteTask={onDeleteTask}
              />
            </TabsContent>

            <TabsContent value="done" className="mt-0">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Show completed</span>
                <Switch
                  checked={showCompleted}
                  onCheckedChange={onToggleShowCompleted}
                />
              </div>
              {showCompleted && (
                <TaskList
                  tasks={doneTasks}
                  activeTaskId={activeTaskId}
                  onTaskClick={onTaskClick}
                  onStartTask={onStartTask}
                  onCompleteTask={onCompleteTask}
                  onDeleteTask={onDeleteTask}
                />
              )}
            </TabsContent>
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
