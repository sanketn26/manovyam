import { Play, Pause, Square, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Task, TaskSession } from "../models/Task";

interface PomodoroTimerProps {
  task: Task;
  isRunning: boolean;
  isPaused: boolean;
  timeRemaining: number; // seconds
  totalTime: number; // seconds
  completedPomodoros: number;
  onStart: () => void;
  onPause: () => void;
  onStop: (achievement?: string, pending?: string) => void;
}

export function PomodoroTimer({
  task,
  isRunning,
  isPaused,
  timeRemaining,
  totalTime,
  completedPomodoros,
  onStart,
  onPause,
  onStop,
}: PomodoroTimerProps) {
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((totalTime - timeRemaining) / totalTime) * 100;

  const handleStop = () => {
    if (timeRemaining <= 0) {
      // Session completed - ask for summary
      const achievement = prompt("What did you achieve in this session?");
      const pending = prompt("What's still pending?");
      onStop(achievement || undefined, pending || undefined);
    } else {
      // Session interrupted
      onStop();
    }
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-bg-1 p-4">
      {/* Timer Display */}
      <div className="text-center">
        <div className="mb-2 flex items-center justify-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Pomodoro Timer</span>
        </div>
        
        <div className="mb-4 font-mono text-5xl">
          {formatTime(timeRemaining)}
        </div>

        {/* Progress Bar */}
        <Progress value={progress} className="h-2" />

        <div className="mt-2 text-xs text-muted-foreground">
          {completedPomodoros} pomodoros completed today
        </div>
      </div>

      {/* Task Info */}
      <div className="border-t border-border pt-4">
        <div className="text-sm text-muted-foreground">Working on:</div>
        <div className="mt-1">{task.title}</div>
        {task.estimatedMinutes && (
          <div className="mt-1 text-xs text-muted-foreground">
            Estimated: {task.estimatedMinutes}m • Actual: {task.actualMinutes}m
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {!isRunning ? (
          <Button onClick={onStart} className="flex-1 gap-2">
            <Play className="h-4 w-4" />
            Start
          </Button>
        ) : (
          <>
            <Button
              onClick={onPause}
              variant="outline"
              className="flex-1 gap-2"
            >
              {isPaused ? (
                <>
                  <Play className="h-4 w-4" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-4 w-4" />
                  Pause
                </>
              )}
            </Button>
            <Button
              onClick={handleStop}
              variant="destructive"
              className="flex-1 gap-2"
            >
              <Square className="h-4 w-4" />
              Stop
            </Button>
          </>
        )}
      </div>

      {/* Session completed notification */}
      {timeRemaining <= 0 && (
        <div className="animate-pulse rounded-lg bg-accent-green/10 p-3 text-center text-sm text-accent-green">
          🎉 Pomodoro completed! Take a break.
        </div>
      )}
    </div>
  );
}
