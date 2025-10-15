import { Editor } from "@tiptap/react";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Code2,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ListTodo,
  Link as LinkIcon,
  Image,
  Quote,
  Minus,
  Sparkles,
  Network,
} from "lucide-react";
import { TagManager } from "./TagManager";

interface EditorToolbarProps {
  editor: Editor | null;
  onToggleAI?: () => void;
  noteId?: string;
  noteTags?: string[];
  onTagsChange?: (tagIds: string[]) => void;
}

export function EditorToolbar({ 
  editor, 
  onToggleAI, 
  noteId, 
  noteTags = [], 
  onTagsChange 
}: EditorToolbarProps) {
  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    isActive = false,
    children,
    title,
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`h-8 px-2 ${
        isActive
          ? "bg-accent-blue text-white"
          : "text-muted-foreground hover:bg-bg-2 hover:text-foreground"
      }`}
      title={title}
    >
      {children}
    </Button>
  );

  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = window.prompt("URL", previousUrl);

    if (url === null) {
      return;
    }

    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 px-6 py-2">
      {/* Text Formatting */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive("bold")}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive("italic")}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive("strike")}
          title="Strikethrough (Ctrl+Shift+S)"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive("code")}
          title="Inline Code (Ctrl+E)"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6 bg-border" />

      {/* Headings */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive("heading", { level: 1 })}
          title="Heading 1 (Ctrl+Alt+1)"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive("heading", { level: 2 })}
          title="Heading 2 (Ctrl+Alt+2)"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive("heading", { level: 3 })}
          title="Heading 3 (Ctrl+Alt+3)"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6 bg-border" />

      {/* Lists */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive("bulletList")}
          title="Bullet List (Ctrl+Shift+8)"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive("orderedList")}
          title="Numbered List (Ctrl+Shift+7)"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleTaskList().run()}
          isActive={editor.isActive("taskList")}
          title="Task List (Ctrl+Shift+9)"
        >
          <ListTodo className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6 bg-border" />

      {/* Insert */}
      <div className="flex items-center gap-0.5">
        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive("link")}
          title="Insert Link (Ctrl+K)"
        >
          <LinkIcon className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive("blockquote")}
          title="Quote (Ctrl+Shift+Q)"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive("codeBlock")}
          title="Code Block (Ctrl+Alt+C)"
        >
          <Code2 className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          isActive={false}
          title="Horizontal Rule"
        >
          <Minus className="h-4 w-4" />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => {
            (editor.chain().focus() as any).setMermaid({
              code: 'flowchart TD\n    Start --> Stop'
            }).run();
          }}
          isActive={editor.isActive("mermaid")}
          title="Insert Diagram"
        >
          <Network className="h-4 w-4" />
        </ToolbarButton>
      </div>

      <Separator orientation="vertical" className="mx-1 h-6 bg-border" />

      {/* Tag Management */}
      {noteId && onTagsChange && (
        <div className="flex items-center gap-0.5">
          <TagManager
            noteId={noteId}
            noteTags={noteTags}
            onTagsChange={onTagsChange}
          />
        </div>
      )}

      <Separator orientation="vertical" className="mx-1 h-6 bg-border" />

      {/* AI Actions */}
      <div className="flex items-center gap-0.5">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleAI}
          className="h-8 px-3 text-accent-blue hover:bg-bg-2 hover:text-accent-blue"
          title="AI Commands"
        >
          <Sparkles className="mr-1.5 h-4 w-4" />
          AI
        </Button>
      </div>
    </div>
  );
}
