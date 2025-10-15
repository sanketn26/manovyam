# Documentation Migration Guide

## 📋 File Organization

All markdown documentation files have been reorganized into the `/docs` directory with the following structure:

### Old Location → New Location

#### User Guides
- `/QUICK_START.md` → `/docs/guides/QUICK_START.md`
- `/EDITOR_FEATURES.md` → `/docs/guides/EDITOR_FEATURES.md`
- `/DIAGRAM_GUIDE.md` → `/docs/guides/DIAGRAM_GUIDE.md`
- `/TASK_MANAGEMENT.md` → `/docs/guides/TASK_MANAGEMENT.md`

#### Architecture & Development
- `/ARCHITECTURE.md` → `/docs/architecture/ARCHITECTURE.md`
- `/CODE_STYLE.md` → `/docs/architecture/CODE_STYLE.md`
- `/DEPENDENCIES.md` → `/docs/architecture/DEPENDENCIES.md`
- `/REFACTORING.md` → `/docs/architecture/REFACTORING.md`

#### Features
- `/FEATURES.md` → `/docs/features/FEATURES.md`
- `/AI_CONTEXT_MENU.md` → `/docs/features/AI_CONTEXT_MENU.md`
- `/OPENAI_INTEGRATION.md` → `/docs/features/OPENAI_INTEGRATION.md`
- `/TAURI_INTEGRATION.md` → `/docs/features/TAURI_INTEGRATION.md`
- `/SYNC_IMPLEMENTATION.md` → `/docs/features/SYNC_IMPLEMENTATION.md`

#### Security
- `/SECURITY.md` → `/docs/security/SECURITY.md`
- `/CREDENTIAL_MANAGEMENT.md` → `/docs/security/CREDENTIAL_MANAGEMENT.md`

#### Changelog
- `/RECENT_FIXES.md` → `/docs/changelog/RECENT_FIXES.md`
- `/BUGFIXES.md` → `/docs/changelog/BUGFIXES.md`
- `/CONTEXT_MENU_TEST.md` → `/docs/changelog/CONTEXT_MENU_TEST.md`

#### Root Directory (Unchanged)
- `/Attributions.md` - Stays in root
- `/guidelines/Guidelines.md` - Stays as is

## 🔍 Finding Documentation

### Quick Access
Start at `/docs/README.md` which provides:
- Complete table of contents
- Quick links by category
- Links to specific topics

### By Category

**For Users:**
```
/docs/guides/
├── QUICK_START.md         # Getting started
├── EDITOR_FEATURES.md     # Using the editor
├── DIAGRAM_GUIDE.md       # Creating diagrams
└── TASK_MANAGEMENT.md     # Tasks & Pomodoro
```

**For Developers:**
```
/docs/architecture/
├── ARCHITECTURE.md        # System design
├── CODE_STYLE.md          # Coding standards
├── DEPENDENCIES.md        # Package info
└── REFACTORING.md         # Major changes
```

**Feature Documentation:**
```
/docs/features/
├── FEATURES.md            # Feature list
├── AI_CONTEXT_MENU.md     # AI features
├── OPENAI_INTEGRATION.md  # OpenAI setup
├── TAURI_INTEGRATION.md   # Desktop features
└── SYNC_IMPLEMENTATION.md # Cloud sync
```

**Security & Changelog:**
```
/docs/security/            # Security docs
/docs/changelog/           # History & fixes
```

## ✅ Benefits

### Before
```
/ (root)
├── AI_CONTEXT_MENU.md
├── ARCHITECTURE.md
├── BUGFIXES.md
├── CODE_STYLE.md
├── CREDENTIAL_MANAGEMENT.md
├── DEPENDENCIES.md
├── DIAGRAM_GUIDE.md
├── EDITOR_FEATURES.md
├── FEATURES.md
├── OPENAI_INTEGRATION.md
├── QUICK_START.md
├── RECENT_FIXES.md
├── REFACTORING.md
├── SECURITY.md
├── SYNC_IMPLEMENTATION.md
├── TASK_MANAGEMENT.md
├── TAURI_INTEGRATION.md
├── CONTEXT_MENU_TEST.md
├── App.tsx
├── Attributions.md
└── ... (20+ files at root level)
```

### After
```
/ (root)
├── docs/                  # All documentation
│   ├── README.md         # Documentation index
│   ├── guides/           # User guides
│   ├── architecture/     # Dev docs
│   ├── features/         # Feature docs
│   ├── security/         # Security
│   └── changelog/        # History
├── App.tsx
├── Attributions.md
└── ... (clean root)
```

**Advantages:**
- ✅ Clean root directory
- ✅ Logical categorization
- ✅ Easy to find documentation
- ✅ Better navigation
- ✅ Professional structure
- ✅ Scalable organization

## 🔄 Updating Links

If you have bookmarks or references to old paths, update them:

### Search & Replace Patterns

**In markdown files:**
```
Old: ](../QUICK_START.md)
New: ](./guides/QUICK_START.md)

Old: ](/ARCHITECTURE.md)
New: ](/docs/architecture/ARCHITECTURE.md)
```

**In code comments:**
```
Old: // See SECURITY.md
New: // See docs/security/SECURITY.md
```

## 📝 Contributing New Documentation

When adding new documentation:

1. **Determine category:**
   - User-facing? → `/docs/guides/`
   - Technical? → `/docs/architecture/`
   - Feature doc? → `/docs/features/`
   - Security? → `/docs/security/`
   - Changelog? → `/docs/changelog/`

2. **Create the file:**
   ```bash
   # Example: Adding a new feature doc
   touch docs/features/MY_FEATURE.md
   ```

3. **Update index:**
   - Add link to `/docs/README.md`
   - Include brief description
   - Add to appropriate category

4. **Cross-reference:**
   - Link related docs
   - Update affected documents
   - Add to Quick Links if important

## 🚀 Quick Commands

### View Documentation Index
```bash
cat docs/README.md
```

### List All Guides
```bash
ls -la docs/guides/
```

### Search Documentation
```bash
# Find mentions of "API key"
grep -r "API key" docs/

# Find in specific category
grep -r "Pomodoro" docs/guides/
```

### Validate Links
```bash
# Check for broken links (requires markdown-link-check)
find docs/ -name "*.md" -exec markdown-link-check {} \;
```

## 📖 Reading Order

### For New Users
1. `/docs/guides/QUICK_START.md`
2. `/docs/guides/EDITOR_FEATURES.md`
3. `/docs/guides/TASK_MANAGEMENT.md`
4. `/docs/guides/DIAGRAM_GUIDE.md`

### For Developers
1. `/docs/architecture/ARCHITECTURE.md`
2. `/docs/architecture/CODE_STYLE.md`
3. `/docs/features/FEATURES.md`
4. `/docs/security/SECURITY.md`

### For Contributors
1. `/docs/architecture/CODE_STYLE.md`
2. `/docs/architecture/DEPENDENCIES.md`
3. `/docs/architecture/REFACTORING.md`
4. This file (MIGRATION_GUIDE.md)

## 🛠️ Maintenance

### Regular Tasks
- [ ] Update `/docs/README.md` when adding new docs
- [ ] Check for broken cross-references monthly
- [ ] Archive outdated changelogs yearly
- [ ] Review and update Quick Links quarterly

### Checklist for New Documentation
- [ ] File placed in correct category
- [ ] Added to `/docs/README.md`
- [ ] Cross-references updated
- [ ] Links use relative paths
- [ ] Follows naming convention (SCREAMING_SNAKE_CASE.md)

## 📞 Questions?

If you can't find something:
1. Check `/docs/README.md` first
2. Use grep to search docs
3. Check git history for moved files
4. Ask in GitHub Issues

---

**Last Updated:** December 2024
**Migration Completed:** ✅
