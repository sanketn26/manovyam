# Editor Features Guide

## Text Formatting

### Basic Formatting
- **Bold** (Ctrl+B) - Make text bold
- **Italic** (Ctrl+I) - Make text italic
- **Strikethrough** (Ctrl+Shift+S) - Strike through text
- **Inline Code** (Ctrl+E) - Format text as inline code

### Headings
- **Heading 1** (Ctrl+Alt+1) - Largest heading
- **Heading 2** (Ctrl+Alt+2) - Medium heading
- **Heading 3** (Ctrl+Alt+3) - Small heading

### Lists
- **Bullet List** (Ctrl+Shift+8) - Unordered list
- **Numbered List** (Ctrl+Shift+7) - Ordered list
- **Task List** (Ctrl+Shift+9) - Checkable todo items

### Special Elements
- **Link** (Ctrl+K) - Insert hyperlink
- **Quote** (Ctrl+Shift+Q) - Block quote
- **Code Block** (Ctrl+Alt+C) - Multi-line code with syntax highlighting
- **Horizontal Rule** - Visual separator
- **Diagram** - Insert Mermaid diagrams (flowcharts, sequence diagrams, etc.)

## Code Formatting: Inline vs Block

### Inline Code (`code`)
**Purpose**: For short code snippets within text

**Icon**: `<Code />` (single brackets)

**Usage**: When mentioning variables, functions, or short commands inline
```
Use the `useState` hook to manage state in React.
Run `npm install` to install dependencies.
The variable `userName` stores the user's name.
```

**How it looks**: 
- Renders as: This is `inline code` within a sentence.
- Styled with monospace font and subtle background

**When to use**:
- Mentioning variable names
- Referencing function names
- Short commands or keywords
- File names or paths
- API endpoints
- Single-line expressions

**Keyboard Shortcut**: `Ctrl+E` (or `Cmd+E` on Mac)

---

### Code Block
**Purpose**: For multi-line code or longer code samples

**Icon**: `<Code2 />` (double brackets)

**Usage**: When showing complete code examples, functions, or scripts
```javascript
function greet(name) {
  console.log(`Hello, ${name}!`);
  return `Welcome to Manovyam!`;
}
```

**Features**:
- Multi-line support
- Syntax highlighting
- Preserves formatting and indentation
- Better for complex code

**When to use**:
- Complete functions or methods
- Configuration files
- Multiple lines of code
- Scripts or commands with multiple steps
- JSON/XML/YAML examples
- SQL queries

**Keyboard Shortcut**: `Ctrl+Alt+C` (or `Cmd+Alt+C` on Mac)

---

### Quick Comparison

| Feature | Inline Code | Code Block |
|---------|-------------|------------|
| **Icon** | `<Code />` | `<Code2 />` |
| **Shortcut** | Ctrl+E | Ctrl+Alt+C |
| **Length** | Short (1 line) | Multiple lines |
| **Syntax Highlighting** | No | Yes |
| **Use Case** | Variables, keywords | Functions, scripts |

### Examples

**✅ Good Use of Inline Code:**
```
To install the package, run `npm install react`.
The `useState` hook returns an array with two elements.
Set the environment variable `NODE_ENV=production`.
```

**✅ Good Use of Code Block:**
```
Here's how to create a custom hook:

```javascript
import { useState, useEffect } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}
```
```

## Rich Text Features

### Text Styles
- **Bold**: Make text stand out
- **Italic**: Emphasize words
- **Strikethrough**: Mark deleted or incorrect text
- **Underline**: Underline important text
- **Highlight**: Yellow background for emphasis

### Structure
- **Paragraphs**: Automatic spacing
- **Headings**: 3 levels for hierarchy
- **Horizontal Rules**: Visual separators
- **Blockquotes**: Quotations or callouts

### Lists & Tasks
- **Bullet Lists**: Unordered items
- **Numbered Lists**: Sequential items
- **Task Lists**: Interactive checkboxes for todos

### Links & Media
- **Hyperlinks**: Link to external resources
- **Images**: (Coming soon)
- **Embeds**: (Coming soon)

### Code & Technical
- **Inline Code**: Short code references
- **Code Blocks**: Multi-line code with syntax highlighting
- **Mermaid Diagrams**: Flowcharts, sequence diagrams, etc.

## Keyboard Shortcuts Reference

### Text Formatting
| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Bold | Ctrl+B | Cmd+B |
| Italic | Ctrl+I | Cmd+I |
| Underline | Ctrl+U | Cmd+U |
| Strikethrough | Ctrl+Shift+S | Cmd+Shift+S |
| Inline Code | Ctrl+E | Cmd+E |

### Headings
| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Heading 1 | Ctrl+Alt+1 | Cmd+Alt+1 |
| Heading 2 | Ctrl+Alt+2 | Cmd+Alt+2 |
| Heading 3 | Ctrl+Alt+3 | Cmd+Alt+3 |

### Lists
| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Bullet List | Ctrl+Shift+8 | Cmd+Shift+8 |
| Numbered List | Ctrl+Shift+7 | Cmd+Shift+7 |
| Task List | Ctrl+Shift+9 | Cmd+Shift+9 |

### Special Elements
| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Link | Ctrl+K | Cmd+K |
| Quote | Ctrl+Shift+Q | Cmd+Shift+Q |
| Code Block | Ctrl+Alt+C | Cmd+Alt+C |

### Undo/Redo
| Action | Windows/Linux | Mac |
|--------|--------------|-----|
| Undo | Ctrl+Z | Cmd+Z |
| Redo | Ctrl+Shift+Z | Cmd+Shift+Z |

## Tips & Best Practices

### When to Use Each Feature

**Inline Code** for:
- Variable names: `userName`
- Function names: `handleClick()`
- File paths: `/src/components/Editor.tsx`
- Commands: `npm install`
- API endpoints: `/api/notes`

**Code Blocks** for:
- Complete functions
- Configuration files
- Scripts
- Multiple commands
- JSON/YAML examples

**Headings** for:
- Document structure
- Section titles
- Content hierarchy

**Lists** for:
- Multiple items
- Steps in a process
- Options or choices

**Task Lists** for:
- Todo items
- Checklists
- Action items

**Quotes** for:
- Citations
- Highlighting important text
- Callouts or notes

**Diagrams** for:
- Process flows
- Architecture diagrams
- Project timelines
- Data relationships

## Common Workflows

### Writing Technical Documentation
1. Use **Headings** for structure
2. Use **Code Blocks** for examples
3. Use **Inline Code** for references
4. Use **Lists** for steps or options
5. Use **Diagrams** for visual explanations

### Creating Meeting Notes
1. Use **Headings** for topics
2. Use **Task Lists** for action items
3. Use **Bullet Lists** for discussion points
4. Use **Quotes** for decisions or quotes

### Project Planning
1. Use **Headings** for phases
2. Use **Task Lists** for todos
3. Use **Diagrams** (Gantt) for timeline
4. Use **Code Blocks** for technical specs

## See Also

- [Diagram Guide](./DIAGRAM_GUIDE.md) - Creating Mermaid diagrams
- [Quick Start](./QUICK_START.md) - Getting started guide
- [Task Management](./TASK_MANAGEMENT.md) - Using tasks and Pomodoro

---

**Pro Tip**: Right-click in the editor for AI-powered text assistance including rephrasing, elaborating, and more!
