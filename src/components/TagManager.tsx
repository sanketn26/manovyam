import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { ScrollArea } from "./ui/scroll-area";
import { Tag as TagIcon, Plus, X, Check } from "lucide-react";
import { Tag } from "../models/Tag";
import { ServiceFactory } from "../services/ServiceFactory";

interface TagManagerProps {
  noteId: string;
  noteTags: string[]; // Array of tag IDs
  onTagsChange: (tagIds: string[]) => void;
}

export function TagManager({ noteId, noteTags, onTagsChange }: TagManagerProps) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [open, setOpen] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const tagService = ServiceFactory.getTagService();

  // Load all tags
  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    const tags = await tagService.getAllTags();
    setAllTags(tags);
  };

  const handleToggleTag = async (tagId: string) => {
    const isCurrentlySelected = noteTags.includes(tagId);
    
    if (isCurrentlySelected) {
      // Remove tag
      await tagService.removeTagFromNote(noteId, tagId);
      onTagsChange(noteTags.filter((id) => id !== tagId));
    } else {
      // Add tag
      await tagService.addTagToNote(noteId, tagId);
      onTagsChange([...noteTags, tagId]);
    }
  };

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      const newTag = await tagService.createTag({ name: newTagName.trim() });
      await loadTags();
      
      // Automatically add the new tag to the note
      await tagService.addTagToNote(noteId, newTag.id);
      onTagsChange([...noteTags, newTag.id]);
      
      setNewTagName("");
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating tag:", error);
    }
  };

  const handleRemoveTag = async (tagId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await tagService.removeTagFromNote(noteId, tagId);
    onTagsChange(noteTags.filter((id) => id !== tagId));
  };

  const selectedTags = allTags.filter((tag) => noteTags.includes(tag.id));
  const availableTags = allTags.filter((tag) => !noteTags.includes(tag.id));

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={`h-8 px-2 ${
            noteTags.length > 0
              ? "text-accent-blue hover:text-accent-blue"
              : "text-muted-foreground"
          } hover:bg-bg-2`}
          title="Manage tags"
        >
          <TagIcon className="mr-1.5 h-4 w-4" />
          {noteTags.length > 0 && (
            <span className="text-xs">{noteTags.length}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="flex flex-col">
          {/* Header */}
          <div className="border-b border-border p-3">
            <h4 className="text-foreground">Manage Tags</h4>
            <p className="mt-1 text-xs text-muted-foreground">
              Add or remove tags for this note
            </p>
          </div>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="border-b border-border p-3">
              <p className="mb-2 text-xs text-muted-foreground">Applied tags</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    className="cursor-pointer pl-2 pr-1 transition-all hover:opacity-80"
                    style={{
                      backgroundColor: tag.color,
                      color: "white",
                    }}
                  >
                    {tag.name}
                    <button
                      onClick={(e) => handleRemoveTag(tag.id, e)}
                      className="ml-1 rounded-sm hover:bg-white/20"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Available Tags */}
          <div className="p-3">
            {availableTags.length > 0 && (
              <>
                <p className="mb-2 text-xs text-muted-foreground">Available tags</p>
                <ScrollArea className="max-h-40">
                  <div className="flex flex-wrap gap-1.5">
                    {availableTags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant="outline"
                        className="cursor-pointer transition-all hover:opacity-80"
                        style={{
                          borderColor: tag.color,
                          color: tag.color,
                        }}
                        onClick={() => handleToggleTag(tag.id)}
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}

            {/* Create New Tag */}
            {!isCreating ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCreating(true)}
                className="mt-2 h-8 w-full justify-start text-xs text-muted-foreground hover:text-foreground"
              >
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Create new tag
              </Button>
            ) : (
              <div className="mt-3 flex gap-2">
                <Input
                  type="text"
                  placeholder="Tag name..."
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateTag();
                    } else if (e.key === "Escape") {
                      setIsCreating(false);
                      setNewTagName("");
                    }
                  }}
                  className="h-8 flex-1 text-xs"
                  autoFocus
                />
                <Button
                  size="sm"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim()}
                  className="h-8 px-2"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsCreating(false);
                    setNewTagName("");
                  }}
                  className="h-8 px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Empty State */}
          {allTags.length === 0 && !isCreating && (
            <div className="p-6 text-center">
              <TagIcon className="mx-auto h-8 w-8 text-muted-foreground opacity-50" />
              <p className="mt-2 text-sm text-muted-foreground">No tags yet</p>
              <p className="mt-1 text-xs text-text-disabled">
                Create your first tag to organize notes
              </p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
