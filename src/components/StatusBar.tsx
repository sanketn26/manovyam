import { Note } from "../models/Note";
import { useAtomValue } from "jotai";
import { Cloud, Lock, AlertCircle, Check } from "lucide-react";
import { saveStatusAtom, lastSyncedAtAtom } from "../store/atoms";

interface StatusBarProps {
  note: Note;
}

export function StatusBar({ note }: StatusBarProps) {
  const saveStatus = useAtomValue(saveStatusAtom);
  const lastSyncedAt = useAtomValue(lastSyncedAtAtom);

  const countWords = (content: string) => {
    const text = content.replace(/<[^>]*>/g, "");
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  };

  const countCharacters = (content: string) => {
    const text = content.replace(/<[^>]*>/g, "");
    return text.length;
  };

  const calculateReadTime = (wordCount: number) => {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return minutes;
  };

  const wordCount = countWords(note.content);
  const charCount = countCharacters(note.content);
  const readTime = calculateReadTime(wordCount);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return `${diffSeconds}s ago`;
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    return `${Math.floor(diffSeconds / 3600)}h ago`;
  };

  return (
    <div className="flex items-center justify-between border-t border-border bg-bg-1 px-6 py-2 text-xs text-muted-foreground">
      <div className="flex items-center gap-4">
        <span>{wordCount} words</span>
        <span>•</span>
        <span>{charCount.toLocaleString()} characters</span>
        <span>•</span>
        <span>~{readTime} min read</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Save Status */}
        <div className="flex items-center gap-1">
          {saveStatus === "saving" && (
            <>
              <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" />
              <span>Saving...</span>
            </>
          )}
          {saveStatus === "saved" && (
            <>
              <Check className="h-3 w-3 text-accent-green" />
              <span className="text-accent-green">
                Saved {formatTime(note.updatedAt)}
              </span>
            </>
          )}
          {saveStatus === "unsaved" && (
            <>
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <span className="text-yellow-500">Unsaved changes</span>
            </>
          )}
          {saveStatus === "error" && (
            <>
              <AlertCircle className="h-3 w-3 text-accent-red" />
              <span className="text-accent-red">Save failed</span>
            </>
          )}
        </div>

        {/* Sync Status */}
        <div className="flex items-center gap-1">
          <Cloud className="h-3 w-3" />
          <span>
            {lastSyncedAt
              ? `Synced ${formatTime(lastSyncedAt)}`
              : "Not synced"}
          </span>
        </div>

        {/* Encryption Status */}
        <div className="flex items-center gap-1">
          <Lock className="h-3 w-3" />
          <span>Encrypted</span>
        </div>
      </div>
    </div>
  );
}
