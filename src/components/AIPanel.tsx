import { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { X, ArrowUp, Sparkles, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { AIMessage, AIModel } from "../models/AIMessage";
import { Note } from "../models/Note";
import { Badge } from "./ui/badge";

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: AIMessage[];
  availableModels: AIModel[];
  selectedModel: string;
  isLoading: boolean;
  onSendMessage: (message: string) => void;
  onChangeModel: (modelId: string) => void;
  onExtractTasks?: () => void;
  currentNote?: Note | null;
}

export function AIPanel({
  isOpen,
  onClose,
  messages,
  availableModels,
  selectedModel,
  isLoading,
  onSendMessage,
  onChangeModel,
  onExtractTasks,
  currentNote,
}: AIPanelProps) {
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getBadgeDisplay = (model: AIModel) => {
    if (model.badge === "your-key") {
      return <span className="text-accent-blue">(Your key)</span>;
    }
    if (model.badge === "free") {
      return <span className="text-accent-green">⭐ Free</span>;
    }
    return null;
  };

  if (!isOpen) return null;

  return (
    <div
      className="flex h-screen w-[350px] flex-col border-l border-border bg-bg-1"
      style={{
        animation: "slideInRight 0.3s ease-out",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-accent-blue" />
          <h2 className="text-foreground">AI Assistant</h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Model Selector and Context */}
      <div className="space-y-3 border-b border-border p-4">
        <Select value={selectedModel} onValueChange={onChangeModel}>
          <SelectTrigger className="bg-bg-2 border-border text-foreground">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-bg-1 border-border">
            {availableModels.map((model) => (
              <SelectItem key={model.id} value={model.id} className="text-foreground">
                {model.name} {getBadgeDisplay(model)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Current Note Context */}
        {currentNote && (
          <div className="flex items-center gap-2 rounded-md bg-bg-2 px-3 py-2">
            <FileText className="h-3.5 w-3.5 text-accent-blue" />
            <span className="flex-1 truncate text-xs text-text-secondary">
              {currentNote.title || "Untitled"}
            </span>
            <Badge variant="secondary" className="text-xs">
              Context
            </Badge>
          </div>
        )}

        {/* Quick Actions */}
        {onExtractTasks && (
          <Button
            onClick={onExtractTasks}
            variant="outline"
            size="sm"
            className="w-full gap-2"
          >
            <Sparkles className="h-3 w-3" />
            Extract Tasks from Note
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "system" ? (
                <div className="w-full text-center text-xs text-text-disabled">
                  {message.content}
                </div>
              ) : (
                <div
                  className={`max-w-[85%] rounded-lg p-3 ${
                    message.role === "user"
                      ? "bg-accent-blue text-white"
                      : "bg-bg-2 text-foreground"
                  }`}
                  style={{
                    animation:
                      message.role === "user"
                        ? "slideInRight 0.2s ease-out"
                        : "slideInLeft 0.2s ease-out",
                  }}
                >
                  <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 space-y-1 border-t border-border pt-2">
                      <p className="text-xs text-muted-foreground">Sources:</p>
                      {message.sources.map((source) => (
                        <div
                          key={source.noteId}
                          className="flex items-center gap-1 text-xs text-text-secondary"
                        >
                          <span>📝</span>
                          <span>{source.noteTitle}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-lg bg-bg-2 p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Sparkles className="h-4 w-4 animate-pulse" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your notes..."
            className="min-h-[80px] resize-none bg-bg-2 border-border text-foreground placeholder:text-muted-foreground pr-12"
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="absolute bottom-2 right-2 h-8 w-8 rounded-full bg-accent-blue text-white hover:bg-accent-blue/90 disabled:opacity-50"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
        <div className="mt-2 space-y-1">
          <p className="text-xs text-text-disabled">
            Press Enter to send, Shift+Enter for new line
          </p>
          {currentNote && (
            <p className="text-xs text-muted-foreground">
              💡 Current note automatically included as context
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
