import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Search, Plus, Cloud, Settings, ListTodo, Loader2, CloudOff, List, LayoutGrid, Shuffle, X, Tag as TagIcon } from "lucide-react";
import { Note } from "../models/Note";
import { Tag } from "../models/Tag";
import { ThemeToggle } from "./ThemeToggle";
import { useState, useEffect } from "react";
import { ServiceFactory } from "../services/ServiceFactory";

interface SidebarProps {
  notes: Note[];
  activeNoteId: string | null;
  onNoteSelect: (id: string) => void;
  onNewNote: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme: "light" | "dark" | "system";
  onThemeChange: (theme: "light" | "dark" | "system") => void;
  onToggleTasks?: () => void;
  onOpenSettings?: () => void;
  onSync?: () => void;
  isSyncing?: boolean;
  lastSyncedAt?: Date | null;
}

export function Sidebar({
  notes,
  activeNoteId,
  onNoteSelect,
  onNewNote,
  searchQuery,
  onSearchChange,
  theme,
  onThemeChange,
  onToggleTasks,
  onOpenSettings,
  onSync,
  isSyncing = false,
  lastSyncedAt,
}: SidebarProps) {
  const [viewMode, setViewMode] = useState<"compact" | "detailed">("detailed");
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showTagFilter, setShowTagFilter] = useState(false);
  
  // Load all tags
  useEffect(() => {
    const loadTags = async () => {
      const tagService = ServiceFactory.getTagService();
      const tags = await tagService.getAllTags();
      setAllTags(tags);
    };
    loadTags();
  }, [notes]); // Reload when notes change
  
  // Filter notes by search and tags
  const filteredNotes = notes.filter((note) => {
    // Search filter
    const matchesSearch =
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Tag filter
    const matchesTags =
      selectedTags.length === 0 ||
      (note.tags && selectedTags.some((tagId) => note.tags?.includes(tagId)));
    
    return matchesSearch && matchesTags;
  });

  // Handle random note selection
  const handleRandomNote = () => {
    if (filteredNotes.length === 0) return;
    const randomIndex = Math.floor(Math.random() * filteredNotes.length);
    onNoteSelect(filteredNotes[randomIndex].id);
  };

  // Toggle tag selection
  const toggleTag = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  // Clear all tag filters
  const clearTagFilters = () => {
    setSelectedTags([]);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const getPreview = (content: string) => {
    // Strip HTML and get first line
    const text = content.replace(/<[^>]*>/g, "");
    return text.slice(0, 60) + (text.length > 60 ? "..." : "");
  };

  const countWords = (content: string) => {
    const text = content.replace(/<[^>]*>/g, "");
    return text.split(/\s+/).filter((word) => word.length > 0).length;
  };

  // Group notes by date
  const groupNotesByDate = (notes: Note[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const thisWeek = new Date(today);
    thisWeek.setDate(thisWeek.getDate() - 7);
    const thisMonth = new Date(today);
    thisMonth.setDate(thisMonth.getDate() - 30);

    const groups: Record<string, Note[]> = {
      Today: [],
      Yesterday: [],
      "This Week": [],
      "This Month": [],
      Older: [],
    };

    notes.forEach((note) => {
      const noteDate = new Date(note.updatedAt);
      if (noteDate >= today) {
        groups.Today.push(note);
      } else if (noteDate >= yesterday) {
        groups.Yesterday.push(note);
      } else if (noteDate >= thisWeek) {
        groups["This Week"].push(note);
      } else if (noteDate >= thisMonth) {
        groups["This Month"].push(note);
      } else {
        groups.Older.push(note);
      }
    });

    return groups;
  };

  const groupedNotes = groupNotesByDate(filteredNotes);

  return (
    <div className="flex h-screen w-[280px] flex-col border-r border-border bg-bg-1">
      {/* Header */}
      <div className="flex flex-col gap-3 border-b border-border p-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#0066FF] to-[#9B59B6]">
            <span className="text-white">🎮</span>
          </div>
          <div className="flex flex-col">
            <h1 className="bg-gradient-to-r from-[#0066FF] to-[#9B59B6] bg-clip-text text-transparent">
              Manovyam
            </h1>
            <p className="text-xs text-muted-foreground">Your mind's playground</p>
          </div>
        </div>
        <Button
          onClick={onNewNote}
          className="w-full bg-gradient-to-r from-[#0066FF] to-[#9B59B6] text-white hover:opacity-90"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Note
        </Button>
      </div>

      {/* Search & Controls */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9 bg-bg-2 border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
        
        {/* Controls Row */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1">
            {searchQuery || selectedTags.length > 0 ? (
              <p className="text-xs text-muted-foreground">
                {filteredNotes.length} note{filteredNotes.length !== 1 ? "s" : ""} found
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {notes.length} note{notes.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            {/* Random Note Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRandomNote}
              disabled={filteredNotes.length === 0}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground disabled:opacity-50"
              title="Random note"
            >
              <Shuffle className="h-3.5 w-3.5" />
            </Button>
            
            {/* Tag Filter Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTagFilter(!showTagFilter)}
              className={`h-6 px-2 text-xs ${
                selectedTags.length > 0
                  ? "text-accent-blue"
                  : "text-muted-foreground"
              } hover:text-foreground`}
              title="Filter by tags"
            >
              <TagIcon className="h-3.5 w-3.5" />
              {selectedTags.length > 0 && (
                <span className="ml-1 text-xs">{selectedTags.length}</span>
              )}
            </Button>
            
            {/* View Mode Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setViewMode(viewMode === "compact" ? "detailed" : "compact")}
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              title={viewMode === "compact" ? "Detailed view" : "Compact view"}
            >
              {viewMode === "compact" ? (
                <LayoutGrid className="h-3.5 w-3.5" />
              ) : (
                <List className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        </div>

        {/* Tag Filter Section */}
        {showTagFilter && (
          <div className="mt-3 rounded-lg border border-border bg-bg-2 p-2">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Filter by tags</span>
              {selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearTagFilters}
                  className="h-5 px-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </Button>
              )}
            </div>
            
            {allTags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {allTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.id) ? "default" : "outline"}
                    className="cursor-pointer text-xs transition-all hover:opacity-80"
                    style={{
                      backgroundColor: selectedTags.includes(tag.id) ? tag.color : "transparent",
                      borderColor: tag.color,
                      color: selectedTags.includes(tag.id) ? "white" : tag.color,
                    }}
                    onClick={() => toggleTag(tag.id)}
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-xs text-text-disabled">No tags yet</p>
            )}
          </div>
        )}
      </div>

      {/* Notes List */}
      <ScrollArea className="flex-1 px-2">
        <div className="space-y-4 pb-2">
          {Object.entries(groupedNotes).map(([groupName, groupNotes]) => {
            if (groupNotes.length === 0) return null;
            
            return (
              <div key={groupName}>
                <h4 className="mb-1.5 px-2 text-xs uppercase tracking-wide text-muted-foreground">
                  {groupName}
                </h4>
                <div className="space-y-1">
                  {groupNotes.map((note) => (
                    <button
                      key={note.id}
                      onClick={() => onNoteSelect(note.id)}
                      className={`w-full rounded-lg text-left transition-all hover:bg-bg-2 ${
                        activeNoteId === note.id
                          ? "border border-accent-blue bg-bg-2"
                          : "border border-transparent"
                      } ${viewMode === "compact" ? "p-2" : "p-3"}`}
                    >
                      {viewMode === "detailed" ? (
                        <div className="flex items-start gap-2">
                          <span className="text-lg">{note.emoji || "📝"}</span>
                          <div className="flex-1 overflow-hidden">
                            <h3 className="truncate text-foreground">
                              {note.title || "Untitled"}
                            </h3>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {getPreview(note.content)}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-xs text-text-disabled">
                              <span>{formatDate(note.updatedAt)}</span>
                              <span>•</span>
                              <span>{countWords(note.content)} words</span>
                            </div>
                            {note.tags && note.tags.length > 0 && (
                              <div className="mt-1.5 flex flex-wrap gap-1">
                                {note.tags.slice(0, 3).map((tagId) => {
                                  const tag = allTags.find((t) => t.id === tagId);
                                  if (!tag) return null;
                                  return (
                                    <Badge
                                      key={tag.id}
                                      variant="outline"
                                      className="h-4 px-1 text-[10px]"
                                      style={{
                                        borderColor: tag.color,
                                        color: tag.color,
                                      }}
                                    >
                                      {tag.name}
                                    </Badge>
                                  );
                                })}
                                {note.tags.length > 3 && (
                                  <Badge
                                    variant="outline"
                                    className="h-4 px-1 text-[10px] text-muted-foreground"
                                  >
                                    +{note.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{note.emoji || "📝"}</span>
                          <div className="flex-1 overflow-hidden">
                            <div className="flex items-center gap-1">
                              <h3 className="truncate text-sm text-foreground">
                                {note.title || "Untitled"}
                              </h3>
                              {note.tags && note.tags.length > 0 && (
                                <span className="text-xs text-muted-foreground">
                                  ({note.tags.length})
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="text-xs text-text-disabled">
                            {countWords(note.content)}
                          </span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
          {filteredNotes.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-sm text-muted-foreground">
                {searchQuery ? "No notes found" : "No notes yet"}
              </p>
              {!searchQuery && (
                <p className="mt-1 text-xs text-text-disabled">
                  Click "New Note" to get started
                </p>
              )}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-border p-4">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSync}
            disabled={isSyncing || !onSync}
            className="text-muted-foreground hover:text-foreground disabled:opacity-50"
            title={
              !onSync
                ? "Configure sync in settings"
                : lastSyncedAt
                ? `Last synced: ${lastSyncedAt.toLocaleString()}`
                : "Sync to cloud"
            }
          >
            {isSyncing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : !onSync ? (
              <CloudOff className="mr-2 h-4 w-4" />
            ) : (
              <Cloud className="mr-2 h-4 w-4" />
            )}
            {isSyncing ? "Syncing..." : "Sync"}
          </Button>
          {onToggleTasks && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleTasks}
              className="text-muted-foreground hover:text-foreground"
            >
              <ListTodo className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="text-muted-foreground hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
