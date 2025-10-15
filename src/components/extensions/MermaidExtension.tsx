import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { NodeViewWrapper, NodeViewContent } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import mermaid from 'mermaid';
import { Button } from '../ui/button';
import { Pencil, Check, X } from 'lucide-react';
import { resolvedThemeAtom } from '../../store/atoms';

// Mermaid Node View Component
export const MermaidComponent = ({ node, updateAttributes, deleteNode }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [code, setCode] = useState(node.attrs.code || '');
  const [error, setError] = useState<string | null>(null);
  const diagramRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const theme = useAtomValue(resolvedThemeAtom);

  // Re-initialize Mermaid when theme changes
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: theme === 'dark' ? 'dark' : 'default',
      securityLevel: 'loose',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
      },
    });
  }, [theme]);

  useEffect(() => {
    if (!isEditing && diagramRef.current && code) {
      renderDiagram();
    }
  }, [code, isEditing, theme]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const renderDiagram = async () => {
    if (!diagramRef.current) return;

    try {
      setError(null);
      const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
      diagramRef.current.innerHTML = '';
      
      const { svg } = await mermaid.render(id, code);
      diagramRef.current.innerHTML = svg;
    } catch (err: any) {
      setError(err.message || 'Failed to render diagram');
      diagramRef.current.innerHTML = `<div class="text-accent-red p-4">Error: ${err.message}</div>`;
    }
  };

  const handleSave = () => {
    updateAttributes({ code });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setCode(node.attrs.code);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Delete this diagram?')) {
      deleteNode();
    }
  };

  return (
    <NodeViewWrapper className="mermaid-wrapper my-4">
      <div className="border border-border rounded-lg overflow-hidden bg-bg-1">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-bg-2 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground">Mermaid Diagram</div>
            {error && <div className="text-xs text-accent-red">⚠ Error</div>}
          </div>
          <div className="flex items-center gap-1">
            {isEditing ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSave}
                  className="h-7 px-2 text-accent-blue hover:text-accent-blue"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleCancel}
                  className="h-7 px-2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setIsEditing(true)}
                  className="h-7 px-2 text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDelete}
                  className="h-7 px-2 text-muted-foreground hover:text-accent-red"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full min-h-[200px] p-3 bg-bg-2 border border-border rounded text-foreground font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-accent-blue"
              placeholder="Enter Mermaid diagram code..."
            />
          ) : (
            <div 
              ref={diagramRef} 
              className="mermaid-diagram flex justify-center items-center min-h-[100px] bg-bg-2 rounded p-4"
            />
          )}
        </div>

        {/* Help Text */}
        {isEditing && (
          <div className="px-4 pb-3 text-xs text-muted-foreground">
            💡 Tip: Try <code className="px-1 py-0.5 bg-bg-2 rounded">{'flowchart TD; A-->B'}</code> or{' '}
            <code className="px-1 py-0.5 bg-bg-2 rounded">{'sequenceDiagram; Alice->>Bob: Hello'}</code>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

// Mermaid TipTap Extension
export const MermaidExtension = Node.create({
  name: 'mermaid',

  group: 'block',

  atom: true,

  addAttributes() {
    return {
      code: {
        default: 'flowchart TD\n    Start --> Stop',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="mermaid"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-type': 'mermaid' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MermaidComponent);
  },

  addCommands() {
    return {
      setMermaid:
        (attributes: { code?: string } = {}) =>
        ({ commands }: any) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },
});

export default MermaidExtension;
