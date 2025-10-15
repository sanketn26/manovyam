# Manovyam Quick Start Guide

## 🚀 Getting Started

### 1. Install & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production (Tauri Desktop)
npm run tauri build
```

### 2. Configure AI (Recommended)

**Option A: Environment Variables (Recommended)**

```bash
# Create .env file
cp .env.example .env

# Edit .env and add your API key
VITE_OPENAI_API_KEY=sk-your-key-here
```

**Option B: UI Settings**

1. Click Settings (⚙️) in sidebar
2. Go to AI tab
3. Enter your OpenAI API key
4. Click Save

### 3. Create Your First Note

1. Click "New Note" (+) button
2. Start typing in the editor
3. Auto-save happens automatically
4. Use the AI panel for assistance

## 🔑 API Key Setup

### Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy the key (starts with `sk-`)
4. Add to `.env` or Settings

### Why Environment Variables?

✅ **More Secure** - Never exported in backups
✅ **Version Control Safe** - Add .env to .gitignore  
✅ **Production Ready** - Easy deployment
✅ **No Leaks** - Can't accidentally share

## 💾 Backup Your Data

### Quick Backup

1. Open Settings (⚙️)
2. Go to Sync tab
3. Click "Export Database"
4. Enter encryption password
5. Save the `.encrypted` file

### Restore from Backup

1. Open Settings (⚙️)
2. Go to Sync tab
3. Click "Import Database"
4. Select your `.encrypted` file
5. Enter the password
6. App reloads with your data

**⚠️ Important**: Keep your encryption password safe! Lost passwords cannot be recovered.

## ☁️ Cloud Sync (Coming Soon)

Cloud sync requires OAuth implementation. For now, use:
- **Manual Export/Import** - Works offline, full control
- **File-based backup** - Save to Dropbox/Drive manually

## 🎨 Theme

Toggle between Light/Dark/System themes:
- Click theme button in sidebar footer
- Or set default in Settings > Editor

## ✅ Task Management

### Create Tasks

**Method 1: AI Extraction**
1. Write your note with action items
2. Click AI button
3. Click "Extract Tasks"
4. Tasks automatically created!

**Method 2: Manual**
1. Click Tasks button (📋) in sidebar
2. Click "Add Task"
3. Fill in details
4. Start working with Pomodoro timer

### Pomodoro Timer

1. Open Tasks panel
2. Click "Start Pomodoro" on any task
3. Work for 25 minutes
4. Take a 5-minute break
5. Track your productivity!

## ⌨️ Keyboard Shortcuts

### Editor
- `Cmd/Ctrl + B` - Bold
- `Cmd/Ctrl + I` - Italic
- `Cmd/Ctrl + K` - Link
- `Cmd/Ctrl + Shift + 8` - Bullet list
- `Cmd/Ctrl + Shift + 7` - Numbered list

### App
- `Cmd/Ctrl + N` - New note
- `Cmd/Ctrl + S` - Manual save (auto-save is on by default)
- `Cmd/Ctrl + F` - Search notes

## 🏗️ Architecture (For Developers)

Manovyam uses MVVM architecture:

```
┌─────────┐
│  View   │ ← React Components (Sidebar, Editor, etc.)
└────┬────┘
     │
┌────┴──────┐
│ ViewModel │ ← Business Logic (useNotesViewModel, etc.)
└────┬──────┘
     │
┌────┴────┐
│ Service │ ← Data Access (TauriNoteService, LocalNoteService)
└────┬────┘
     │
┌────┴────┐
│  Model  │ ← Data Structures (Note, Task, Settings)
└─────────┘
```

### Dual Environment Support

- **Tauri Desktop**: SQLite database, native file system
- **Browser**: localStorage fallback, full feature parity

## 📁 Project Structure

```
manovyam/
├── components/        # UI Components
│   ├── Editor.tsx
│   ├── Sidebar.tsx
│   ├── AIPanel.tsx
│   └── TaskPanel.tsx
├── viewmodels/        # Business Logic
├── services/          # Data Access
│   ├── interfaces/
│   └── implementations/
├── models/            # Data Structures
├── store/             # Jotai Atoms (State)
└── utils/             # Helpers
```

## 🔒 Security

### What's Safe to Share?

✅ **Exported backups** - No API keys included
✅ **Screenshots** - No sensitive data visible
✅ **Bug reports** - Check logs first

### What's NOT Safe?

❌ `.env` file - Contains your API keys
❌ API keys directly - Never share
❌ Encryption password - Keep private

## 🐛 Troubleshooting

### AI Not Working?

1. Check if API key is set (Settings > AI)
2. Verify key is valid at OpenAI
3. Check console for errors (F12)
4. Ensure you have API credits

### Auto-save Not Working?

1. Check Settings > Editor > Auto-save is ON
2. Default delay is 1000ms (1 second)
3. Watch status bar for save indicator

### Export/Import Failed?

1. Ensure password is correct
2. Check file is `.encrypted` format
3. File must be valid backup
4. Check console for error details

### Theme Not Changing?

1. Check if system theme is overriding
2. Try "Dark" or "Light" instead of "System"
3. Clear browser cache
4. Restart app

## 📚 Further Reading

- [Architecture](../architecture/ARCHITECTURE.md) - Detailed architecture guide
- [Security](../security/SECURITY.md) - Security & credential management
- [Sync Implementation](../features/SYNC_IMPLEMENTATION.md) - Cloud sync details
- [Task Management](./TASK_MANAGEMENT.md) - Task & Pomodoro features
- [Tauri Integration](../features/TAURI_INTEGRATION.md) - Desktop app specifics

## 🆘 Getting Help

### Common Questions

**Q: Do I need internet for AI features?**
A: Yes, AI requires API calls to OpenAI.

**Q: Can I use local LLMs?**
A: Yes! Set `VITE_OPENAI_BASE_URL` to your local endpoint (LM Studio, Ollama, etc.)

**Q: Is my data synced automatically?**
A: Not yet. Use manual export/import for now.

**Q: Can I use on mobile?**
A: Web version works on mobile browsers. Native mobile apps planned.

**Q: Is this open source?**
A: Check the LICENSE file in the repository.

### Support Channels

- GitHub Issues - Bug reports & features
- Documentation - Check the `/docs` folder
- Console Logs - Press F12 for debug info

## 🎯 Next Steps

1. ✅ Set up API key
2. ✅ Create your first note
3. ✅ Try AI assistance
4. ✅ Extract some tasks
5. ✅ Start a Pomodoro session
6. ✅ Export a backup
7. ✅ Customize your theme

Happy note-taking! 🎮
