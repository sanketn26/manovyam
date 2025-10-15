import {
  CheckCircle2,
  Circle,
  Clock,
  Trash2,
  Play,
  MoreVertical,
} from "lucide-react";
import { Task } from "../models/Task";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Badge } from "./ui/badge";

interface TaskListProps {
  tasks: Task[];
  activeTaskId: string | null;
  onTaskClick: (taskId: string) => void;
  onStartTask: (taskId: string) => void;
  onCompleteTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskList({
  tasks,
  activeTaskId,
  onTaskClick,
  onStartTask,
  onCompleteTask,
  onDeleteTask,
}: TaskListProps) {
  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-accent-red";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-accent-green";
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (tasks.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        No tasks yet. Create one to get started!
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`group rounded-lg border p-3 transition-all hover:border-accent-green/50 ${
            activeTaskId === task.id
              ? "border-accent-green bg-accent-green/5"
              : "border-border bg-bg-1"
          }`}
          onClick={() => onTaskClick(task.id)}
        >
          <div className="flex items-start gap-3">
            {/* Status Icon */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (task.status !== "done") {
                  onCompleteTask(task.id);
                }
              }}
              className="mt-0.5 transition-colors hover:text-accent-green"
            >
              {task.status === "done" ? (
                <CheckCircle2 className="h-5 w-5 text-accent-green" />
              ) : (
                <Circle className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            {/* Task Content */}
            <div className="flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div
                    className={`${
                      task.status === "done"
                        ? "text-muted-foreground line-through"
                        : ""
                    }`}
                  >
                    {task.title}
                  </div>
                  {task.description && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      {task.description}
                    </div>
                  )}
                </div>

                {/* Priority Badge */}
                <div
                  className={`h-2 w-2 rounded-full ${getPriorityColor(task.priority)}`}
                />
              </div>

              {/* Metadata */}
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {task.actualMinutes > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDuration(task.actualMinutes)}
                    {task.estimatedMinutes && (
                      <span> / {formatDuration(task.estimatedMinutes)}</span>
                    )}
                  </div>
                )}

                {task.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="text-xs"
                  >
                    {tag}
                  </Badge>
                ))}

                {task.status === "in_progress" && (
                  <Badge variant="secondary" className="text-xs">
                    In Progress
                  </Badge>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {task.status !== "done" && task.status !== "in_progress" && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStartTask(task.id);
                  }}
                  className="h-7 w-7 p-0"
                >
                  <Play className="h-3 w-3" />
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => e.stopPropagation()}
                    className="h-7 w-7 p-0"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTask(task.id);
                    }}
                    className="text-accent-red"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
