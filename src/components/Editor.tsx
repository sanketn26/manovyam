import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Highlight from "@tiptap/extension-highlight";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { MermaidExtension } from "./extensions/MermaidExtension";
import { EditorToolbar } from "./EditorToolbar";
import { EditorContextMenu } from "./EditorContextMenu";
import { StatusBar } from "./StatusBar";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Share2, Bot, MoreVertical, FileText, Download, Printer, Copy, Hash, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import { Note } from "../models/Note";
import { useEffect } from "react";
import { downloadAsMarkdown, downloadAsPDF, printNote } from "../utils/export";
import { toast } from "sonner@2.0.3";

const lowlight = createLowlight(common);

interface EditorProps {
  note: Note | null;
  onUpdate: (content: string) => void;
  onTitleUpdate: (title: string) => void;
  onToggleAI: () => void;
  onTagsChange?: (tagIds: string[]) => void;
  onDeleteNote?: (noteId: string) => void;
}

export function Editor({ note, onUpdate, onTitleUpdate, onToggleAI, onTagsChange, onDeleteNote }: EditorProps) {
  const editor = useEditor(
    {
      extensions: [
        StarterKit.configure({
          heading: {
            levels: [1, 2, 3],
          },
          codeBlock: false,
          link: false,
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: {
            class: "text-[#0066FF] underline hover:opacity-80",
          },
        }),
        Placeholder.configure({
          placeholder: ({ node }) => {
            if (node.type.name === "heading") {
              return "Heading...";
            }
            return 'Start writing... or type "/" for commands';
          },
        }),
        Highlight.configure({
          HTMLAttributes: {
            class: "bg-[#FF6B35] bg-opacity-30",
          },
        }),
        TaskList.configure({
          HTMLAttributes: {
            class: "task-list",
          },
        }),
        TaskItem.configure({
          HTMLAttributes: {
            class: "task-item",
          },
          nested: true,
        }),
        CodeBlockLowlight.configure({
          lowlight,
          HTMLAttributes: {
            class: "code-block bg-[#2A2A2A] rounded-lg p-4 text-[#E5E5E5]",
          },
        }),
        MermaidExtension,
      ],
      content: note?.content || "",
      editorProps: {
        attributes: {
          class: "tiptap-editor prose prose-invert max-w-none focus:outline-none px-16 py-8 text-[#E5E5E5]",
        },
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        onUpdate(html);
      },
    },
    [note?.id]
  );

  useEffect(() => {
    if (editor && note && editor.getHTML() !== note.content) {
      editor.commands.setContent(note.content);
    }
  }, [note?.id, editor, note]);

  if (!note) {
    return (
      <div className="flex h-screen flex-1 items-center justify-center bg-bg-0">
        <div className="text-center">
          <div className="mb-4 text-6xl">🎮</div>
          <h2 className="mb-2 text-foreground">Welcome to Manovyam</h2>
          <p className="text-muted-foreground">
            Select a note or create a new one to get started
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-1 flex-col bg-bg-0">
      {/* Editor Header */}
      <div className="flex items-center justify-between border-b border-border bg-bg-1 px-6 py-4">
        <Input
          type="text"
          value={note.title}
          onChange={(e) => onTitleUpdate(e.target.value)}
          placeholder="Untitled note..."
          className="border-none bg-transparent text-2xl text-foreground placeholder:text-text-disabled focus-visible:ring-0"
        />
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => {
                  downloadAsMarkdown(note);
                  toast.success("Exported as Markdown");
                }}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Export as Markdown
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  downloadAsPDF(note);
                  toast.success("Opening PDF export...");
                }}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  printNote(note);
                  toast.success("Opening print dialog...");
                }}
                className="gap-2"
              >
                <Printer className="h-4 w-4" />
                Print
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleAI}
            className="text-muted-foreground hover:text-foreground"
          >
            <Bot className="h-5 w-5" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem
                onClick={() => {
                  const plainText = note.content.replace(/<[^>]*>/g, '');
                  navigator.clipboard.writeText(plainText);
                  toast.success("Note content copied to clipboard");
                }}
                className="gap-2"
              >
                <Copy className="h-4 w-4" />
                Copy as Plain Text
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  const plainText = note.content.replace(/<[^>]*>/g, '');
                  const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length;
                  const charCount = plainText.length;
                  const readTime = Math.ceil(wordCount / 200);
                  toast.info(`${wordCount} words • ${charCount} characters • ~${readTime} min read`);
                }}
                className="gap-2"
              >
                <Hash className="h-4 w-4" />
                View Statistics
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  const date = new Date(note.createdAt);
                  const formattedDate = date.toLocaleString();
                  toast.info(`Created: ${formattedDate}`);
                }}
                className="gap-2"
              >
                <FileText className="h-4 w-4" />
                Note Info
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  const confirmed = window.confirm("Are you sure you want to delete this note? This action cannot be undone.");
                  if (confirmed && onDeleteNote) {
                    onDeleteNote(note.id);
                    toast.success("Note deleted");
                  }
                }}
                className="gap-2 text-accent-red focus:text-accent-red"
              >
                <Trash2 className="h-4 w-4" />
                Delete Note
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Editor Toolbar */}
      <div className="border-b border-border bg-bg-1">
        <EditorToolbar 
          editor={editor} 
          onToggleAI={onToggleAI}
          noteId={note.id}
          noteTags={note.tags || []}
          onTagsChange={onTagsChange}
        />
      </div>

      {/* Editor Content */}
      <EditorContextMenu editor={editor}>
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <EditorContent editor={editor} className="tiptap-editor text-foreground" />
        </div>
      </EditorContextMenu>

      {/* Status Bar */}
      <StatusBar note={note} />
    </div>
  );
}
