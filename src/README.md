# Manovyam

A local-first note-taking app with AI integration, featuring a playground metaphor with rich text editing, task management, and Pomodoro timers.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (Tauri Desktop)
npm run tauri build
```

## 📚 Documentation

All documentation has been organized in the `/docs` directory:

### For Users
- **[Quick Start Guide](./docs/guides/QUICK_START.md)** - Get started with Manovyam
- **[Editor Features](./docs/guides/EDITOR_FEATURES.md)** - Using the rich text editor
- **[Diagram Guide](./docs/guides/DIAGRAM_GUIDE.md)** - Creating Mermaid diagrams
- **[Task Management](./docs/guides/TASK_MANAGEMENT.md)** - Tasks & Pomodoro features

### For Developers
- **[Architecture](./docs/architecture/ARCHITECTURE.md)** - System architecture (MVVM pattern)
- **[Code Style](./docs/architecture/CODE_STYLE.md)** - Coding standards
- **[Features](./docs/features/FEATURES.md)** - Complete feature list
- **[Security](./docs/security/SECURITY.md)** - Security guidelines

### 📖 [Full Documentation Index](./docs/README.md)

## ✨ Key Features

- 📝 **Rich Text Editor** - Powered by TipTap with formatting, lists, code blocks
- 🤖 **AI Integration** - OpenAI-powered text assistance, rephrasing, and task extraction
- 📊 **Mermaid Diagrams** - Create flowcharts, sequence diagrams, gantt charts
- ✅ **Task Management** - AI-powered task extraction with Pomodoro timers
- 🎨 **Theme Support** - Light, dark, and system theme modes
- 🔍 **Full-Text Search** - Fast SQLite FTS5 search
- 🏷️ **Tag System** - Organize notes with tags
- 💾 **Auto-Save** - Never lose your work
- 🔒 **Encrypted Backup** - AES-256 encrypted export/import
- 🖥️ **Desktop App** - Built with Tauri (Rust + SQLite)
- 🌐 **Web Support** - Fallback to browser localStorage

## 🏗️ Architecture

Manovyam uses **MVVM architecture** with clear separation of concerns:

```
View (React Components)
    ↓
ViewModel (Business Logic)
    ↓
Service (Data Access Layer)
    ↓
Model (Data Structures)
```

**Dual Environment Support:**
- **Tauri Desktop**: SQLite database, native file system
- **Browser**: localStorage fallback, full feature parity

## 🛠️ Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **State Management**: Jotai (atomic state)
- **Editor**: TipTap (ProseMirror)
- **Desktop**: Tauri (Rust)
- **Database**: SQLite with FTS5
- **AI**: OpenAI API
- **Diagrams**: Mermaid.js
- **UI Components**: shadcn/ui

## 📁 Project Structure

```
manovyam/
├── docs/                  # 📚 All documentation
│   ├── README.md         # Documentation index
│   ├── guides/           # User guides
│   ├── architecture/     # Developer docs
│   ├── features/         # Feature documentation
│   ├── security/         # Security guides
│   └── changelog/        # History & fixes
├── components/           # React UI components
│   ├── extensions/       # TipTap extensions
│   └── ui/              # shadcn/ui components
├── viewmodels/           # Business logic layer
├── services/             # Data access layer
│   ├── interfaces/       # Service interfaces
│   └── implementations/  # Service implementations
├── models/               # Data structures
├── store/                # Jotai state atoms
├── utils/                # Helper functions
└── styles/               # Global CSS
```

## 🔑 Setup

### 1. API Key Configuration

**Option A: Environment Variables (Recommended)**
```bash
cp .env.example .env
# Edit .env and add: VITE_OPENAI_API_KEY=sk-your-key-here
```

**Option B: UI Settings**
- Open Settings (⚙️) → AI tab → Enter API key

### 2. Get OpenAI API Key
1. Visit https://platform.openai.com/api-keys
2. Create new secret key
3. Copy key (starts with `sk-`)
4. Add to `.env` or Settings

## 🔒 Security

- ✅ API keys stored securely (environment variables or encrypted settings)
- ✅ AES-256 encrypted database export/import
- ✅ No API keys in backups
- ✅ Local-first architecture

See [Security Guide](./docs/security/SECURITY.md) for details.

## 📦 Backup & Sync

### Manual Export/Import
1. Settings → Sync tab → Export Database
2. Enter encryption password
3. Save `.encrypted` file
4. Import on any device with password

**Cloud Sync**: Coming soon with OAuth implementation

## ⌨️ Keyboard Shortcuts

### Editor
- `Ctrl/Cmd + B` - Bold
- `Ctrl/Cmd + I` - Italic
- `Ctrl/Cmd + K` - Insert link
- `Ctrl/Cmd + Shift + 8` - Bullet list
- `Ctrl/Cmd + Shift + 7` - Numbered list
- `Ctrl/Cmd + E` - Inline code
- `Ctrl/Cmd + Alt + C` - Code block

### App
- `Ctrl/Cmd + N` - New note
- `Ctrl/Cmd + F` - Search notes
- `Ctrl/Cmd + S` - Manual save

## 🐛 Troubleshooting

**AI not working?**
- Check API key in Settings → AI
- Verify key is valid at OpenAI
- Check console (F12) for errors

**Auto-save not working?**
- Check Settings → Editor → Auto-save is ON
- Watch status bar for save indicator

**Theme issues?**
- Try switching to Dark/Light instead of System
- Clear browser cache
- Restart app

See [Quick Start Guide](./docs/guides/QUICK_START.md) for more help.

## 🤝 Contributing

1. Read [Code Style Guide](./docs/architecture/CODE_STYLE.md)
2. Check [Architecture](./docs/architecture/ARCHITECTURE.md)
3. Follow [Guidelines](./guidelines/Guidelines.md)
4. Submit PR with clear description

## 📄 License & Attributions

See [Attributions.md](./Attributions.md) for third-party licenses and credits.

## 🆘 Support

- **Documentation**: Check [/docs](./docs/) first
- **GitHub Issues**: For bugs and feature requests
- **Console Logs**: Press F12 for debug info

## 🎯 Roadmap

- [x] Rich text editor with TipTap
- [x] AI-powered context menu
- [x] Task management with Pomodoro
- [x] Mermaid diagram support
- [x] Theme switching
- [x] Encrypted backup/restore
- [x] Full-text search
- [x] Tag system
- [ ] Cloud sync with OAuth
- [ ] Mobile apps (iOS/Android)
- [ ] Collaborative editing
- [ ] Plugin system
- [ ] Local LLM support

---

**Built with ❤️ using React, Tauri, and TypeScript**

For detailed documentation, visit [/docs](./docs/README.md)
