import { useState, useCallback, useRef } from "react";
import { Editor } from "@tiptap/react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuLabel,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from "./ui/context-menu";
import {
  Sparkles,
  Maximize2,
  Minimize2,
  MessageSquare,
  Loader2,
  Network,
  GitBranch,
  Workflow,
  ChartGantt,
  PieChart,
} from "lucide-react";
import { ServiceFactory } from "../services/ServiceFactory";
import { toast } from "sonner@2.0.3";

interface EditorContextMenuProps {
  editor: Editor | null;
  children: React.ReactNode;
}

export function EditorContextMenu({
  editor,
  children,
}: EditorContextMenuProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasTextSelected, setHasTextSelected] = useState(false);
  const selectedTextRef = useRef<string>("");
  const selectionRangeRef = useRef<{ from: number; to: number } | null>(null);

  // Capture selection when context menu opens
  const handleContextMenu = useCallback(() => {
    if (!editor) return;
    
    const { from, to } = editor.state.selection;
    const hasSelection = from !== to;
    const selectedText = hasSelection ? editor.state.doc.textBetween(from, to, " ") : "";
    
    setHasTextSelected(hasSelection);
    selectedTextRef.current = selectedText;
    selectionRangeRef.current = hasSelection ? { from, to } : null;
  }, [editor]);

  const replaceSelection = useCallback(
    (newText: string) => {
      if (!editor || !selectionRangeRef.current) return;
      
      const { from, to } = selectionRangeRef.current;
      editor
        .chain()
        .focus()
        .deleteRange({ from, to })
        .insertContentAt(from, newText)
        .run();
      
      // Reset selection state
      selectedTextRef.current = "";
      selectionRangeRef.current = null;
      setHasTextSelected(false);
    },
    [editor]
  );

  const insertAfterSelection = useCallback(
    (content: string) => {
      if (!editor || !selectionRangeRef.current) return;
      
      const { to } = selectionRangeRef.current;
      editor
        .chain()
        .focus()
        .insertContentAt(to, content)
        .run();
      
      // Reset selection state
      selectedTextRef.current = "";
      selectionRangeRef.current = null;
      setHasTextSelected(false);
    },
    [editor]
  );

  const handleRephrase = async () => {
    const selectedText = selectedTextRef.current;
    if (!selectedText) {
      toast.error("Please select some text first");
      return;
    }

    setIsProcessing(true);
    try {
      const aiService = ServiceFactory.getAIService();
      const rephrased = await aiService.rephraseText(selectedText);
      replaceSelection(rephrased);
      toast.success("Text rephrased successfully");
    } catch (error) {
      console.error("Rephrase error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to rephrase text"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleElaborate = async () => {
    const selectedText = selectedTextRef.current;
    if (!selectedText) {
      toast.error("Please select some text first");
      return;
    }

    setIsProcessing(true);
    try {
      const aiService = ServiceFactory.getAIService();
      const elaborated = await aiService.elaborateText(selectedText);
      replaceSelection(elaborated);
      toast.success("Text elaborated successfully");
    } catch (error) {
      console.error("Elaborate error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to elaborate text"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleShorten = async () => {
    const selectedText = selectedTextRef.current;
    if (!selectedText) {
      toast.error("Please select some text first");
      return;
    }

    setIsProcessing(true);
    try {
      const aiService = ServiceFactory.getAIService();
      const shortened = await aiService.shortenText(selectedText);
      replaceSelection(shortened);
      toast.success("Text shortened successfully");
    } catch (error) {
      console.error("Shorten error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to shorten text"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCritique = async () => {
    const selectedText = selectedTextRef.current;
    if (!selectedText) {
      toast.error("Please select some text first");
      return;
    }

    setIsProcessing(true);
    try {
      const aiService = ServiceFactory.getAIService();
      const critique = await aiService.critiqueText(selectedText);

      // Format critique as info blocks
      const critiqueBlock = `
<hr style="margin: 16px 0 12px 0; border: none; border-top: 2px solid #e5e7eb;" />

<blockquote style="margin: 0 0 10px 0; padding: 16px 20px; background: linear-gradient(to right, rgba(139, 92, 246, 0.1), rgba(139, 92, 246, 0.05)); border-left: 4px solid #8b5cf6; border-radius: 8px;">
  <p style="margin: 0 0 6px 0; font-size: 16px; font-weight: 600; color: #8b5cf6;">✨ AI Critique</p>
  <p style="margin: 0; opacity: 0.8;">Analysis of selected text</p>
</blockquote>

<blockquote style="margin: 0 0 6px 0; padding: 14px 18px; background: linear-gradient(to right, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05)); border-left: 4px solid #22c55e; border-radius: 8px;">
  <p style="margin: 0 0 6px 0; font-weight: 600; color: #22c55e;">✅ Strengths</p>
  <ul style="margin: 0; padding-left: 20px;">
    ${critique.positives.map((p) => `<li style="margin: 3px 0;">${p}</li>`).join("")}
  </ul>
</blockquote>

<blockquote style="margin: 0 0 6px 0; padding: 14px 18px; background: linear-gradient(to right, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.05)); border-left: 4px solid #ef4444; border-radius: 8px;">
  <p style="margin: 0 0 6px 0; font-weight: 600; color: #ef4444;">⚠️ Areas for Improvement</p>
  <ul style="margin: 0; padding-left: 20px;">
    ${critique.negatives.map((n) => `<li style="margin: 3px 0;">${n}</li>`).join("")}
  </ul>
</blockquote>

<blockquote style="margin: 0 0 6px 0; padding: 14px 18px; background: linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(59, 130, 246, 0.05)); border-left: 4px solid #3b82f6; border-radius: 8px;">
  <p style="margin: 0 0 6px 0; font-weight: 600; color: #3b82f6;">💡 Suggestions</p>
  <ul style="margin: 0; padding-left: 20px;">
    ${critique.suggestions.map((s) => `<li style="margin: 3px 0;">${s}</li>`).join("")}
  </ul>
</blockquote>
`;

      insertAfterSelection(critiqueBlock);
      toast.success("Critique added successfully");
    } catch (error) {
      console.error("Critique error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to critique text"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!editor) {
    return <>{children}</>;
  }

  return (
    <ContextMenu onOpenChange={(open) => open && handleContextMenu()}>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        {!hasTextSelected && (
          <>
            <ContextMenuLabel>Select text for AI features</ContextMenuLabel>
            <ContextMenuSeparator />
          </>
        )}
        
        <ContextMenuItem
          onClick={handleRephrase}
          disabled={isProcessing || !hasTextSelected}
          className="gap-2"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Rephrase with AI
        </ContextMenuItem>

        <ContextMenuItem
          onClick={handleElaborate}
          disabled={isProcessing || !hasTextSelected}
          className="gap-2"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
          Elaborate
        </ContextMenuItem>

        <ContextMenuItem
          onClick={handleShorten}
          disabled={isProcessing || !hasTextSelected}
          className="gap-2"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Minimize2 className="h-4 w-4" />
          )}
          Shorten
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem
          onClick={handleCritique}
          disabled={isProcessing || !hasTextSelected}
          className="gap-2"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <MessageSquare className="h-4 w-4" />
          )}
          Critique
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuSub>
          <ContextMenuSubTrigger className="gap-2">
            <Network className="h-4 w-4" />
            Insert Diagram
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            <ContextMenuItem
              onClick={() => {
                (editor.chain().focus() as any).setMermaid({
                  code: 'flowchart TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Action 1]\n    B -->|No| D[Action 2]\n    C --> E[End]\n    D --> E'
                }).run();
              }}
              className="gap-2"
            >
              <GitBranch className="h-4 w-4" />
              Flowchart
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                (editor.chain().focus() as any).setMermaid({
                  code: 'sequenceDiagram\n    participant A as Alice\n    participant B as Bob\n    A->>B: Hello Bob!\n    B->>A: Hello Alice!'
                }).run();
              }}
              className="gap-2"
            >
              <Workflow className="h-4 w-4" />
              Sequence Diagram
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                (editor.chain().focus() as any).setMermaid({
                  code: 'gantt\n    title Project Timeline\n    dateFormat YYYY-MM-DD\n    section Planning\n    Research    :2024-01-01, 7d\n    Design      :7d\n    section Development\n    Implementation :14d\n    Testing     :7d'
                }).run();
              }}
              className="gap-2"
            >
              <ChartGantt className="h-4 w-4" />
              Gantt Chart
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                (editor.chain().focus() as any).setMermaid({
                  code: 'pie title Project Status\n    "Completed" : 45\n    "In Progress" : 30\n    "Planned" : 25'
                }).run();
              }}
              className="gap-2"
            >
              <PieChart className="h-4 w-4" />
              Pie Chart
            </ContextMenuItem>
            <ContextMenuItem
              onClick={() => {
                (editor.chain().focus() as any).setMermaid({
                  code: 'graph TD\n    A[Component A] --> B[Component B]\n    A --> C[Component C]\n    B --> D[Component D]\n    C --> D'
                }).run();
              }}
              className="gap-2"
            >
              <Network className="h-4 w-4" />
              Graph
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
      </ContextMenuContent>
    </ContextMenu>
  );
}
