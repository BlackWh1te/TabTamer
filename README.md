# TabTamer

AI-powered browser tab organizer for Chrome. Tame your tab chaos with smart, automatic grouping.

![TabTamer](https://img.shields.io/badge/Chrome-Extension-green) ![License](https://img.shields.io/badge/license-MIT-blue)

## ✨ Features

- **Smart AI Grouping** - 3-layer clustering engine: domain rules → tech keywords → semantic title similarity
- **Session Management** - Save, load, export, and import tab sessions
- **Chrome Native Groups** - Optionally create Chrome tab groups by domain
- **Dead Link Detection** - Check all URLs and flag potentially dead links
- **Duplicate Detection** - Automatically identifies duplicate tabs
- **Privacy-First** - All processing happens locally in your browser. No data sent to servers.
- **Undo System** - Undo deleted groups, tabs, renames, and moves (Ctrl+Z)
- **Auto-Save** - Crash recovery - automatically saves unsaved work
- **Keyboard Shortcuts** - Quick access to common actions
- **Re-Group** - Re-run AI grouping on current tabs
- **Sort Groups** - Sort by name, size, or recency
- **Shareable HTML** - Export sessions as standalone HTML files to share with others

## 🚀 Installation

### From Chrome Web Store (Coming Soon)

### Manual Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked"
5. Select the `extension` folder from this repository
6. TabTamer is now installed!

## 📖 How to Use

### Opening TabTamer

**Keyboard Shortcut:** `Ctrl+Shift+Y` (Windows/Linux) or `Cmd+Shift+Y` (Mac)

**Alternative:** Click the TabTamer icon in your Chrome extensions toolbar

### Capturing Tabs

When you open TabTamer, you'll see three capture modes:

1. **Organize** - Captures all open tabs and keeps them open in Chrome
2. **Close** - Captures tabs and closes them to free RAM (tabs are saved in the dashboard)
3. **Chrome Groups** - Captures tabs and creates native Chrome tab groups by domain

### Dashboard

After capture, tabs appear in the TabTamer dashboard organized into smart groups:

- **Search** - Press `/` to focus search, or use the search bar to filter tabs
- **Delete Groups/Tabs** - Click the trash icon to delete (use Ctrl+Z to undo)
- **Rename Groups** - Click the group name to rename
- **Move Tabs** - Use the dropdown to move tabs between groups
- **Restore Tabs** - Click "Restore all" or restore individual groups to reopen in Chrome
- **Check Links** - Click "Check links" to scan for dead URLs
- **Re-Group** - Click "Re-group" to re-run AI grouping on current tabs
- **Sort** - Use the Sort dropdown to sort groups by name, size, or recency

### Saving Sessions

1. Organize your tabs in the dashboard
2. Click the "Save" button
3. Enter a session name (e.g., "React research", "Vacation planning")
4. Click "Save"

Your session is now stored locally and can be loaded anytime from the Sessions view.

### Loading Sessions

1. Click the "Sessions" button in the header
2. Find your saved session
3. Click "Load" to restore it to the dashboard

### Sharing Sessions

1. Go to the Sessions view
2. Click the share icon on a session
3. Download the generated HTML file
4. Share the file via email, host it, or send it to friends

The HTML file is self-contained and can be opened in any browser.

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+Y` | Open TabTamer popup |
| `/` | Focus search (dashboard) |
| `Esc` | Clear search / close modals |
| `Ctrl+Z` | Undo last action |

## 🛠️ Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

```bash
# Install dependencies
cd dashboard
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

The build output goes to `extension/dashboard/` and is automatically loaded by the Chrome extension.

### Project Structure

```
TabTamer/
├── extension/           # Chrome extension files
│   ├── manifest.json   # Extension manifest
│   ├── popup.html      # Popup UI
│   ├── popup.js        # Popup logic
│   ├── background.js   # Background service worker
│   ├── icons/         # Extension icons
│   └── dashboard/     # Built React app (auto-generated)
├── dashboard/          # React dashboard source
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx    # Main dashboard UI
│   │   │   └── TabCard.tsx      # Individual group card
│   │   ├── db.ts               # IndexedDB layer (Dexie)
│   │   ├── groupingEngine.ts   # AI clustering logic
│   │   └── main.tsx            # App entry point
│   ├── package.json
│   └── vite.config.ts
├── README.md
├── DESIGN.md           # Detailed design document
└── AUDIT.md            # Security audit
```

## 🧠 How It Works

TabTamer uses a 3-layer clustering engine:

1. **Domain Categories** - Groups tabs by domain patterns (github.com, stackoverflow.com, etc.)
2. **Tech Keyword Overlap** - Extracts keywords from titles and groups tabs with overlapping tech terms
3. **Semantic Similarity** - Uses Jaccard similarity on title keywords to merge related groups

All processing happens locally in your browser using IndexedDB for persistence.

## 🔒 Privacy

TabTamer is privacy-first:
- All tab data is processed locally in your browser
- No data is sent to any server
- No analytics or tracking
- Sessions are stored in your browser's IndexedDB

## 📝 License

MIT License - feel free to use, modify, and distribute.

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

## 🙏 Acknowledgments

Built with:
- React + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Dexie (IndexedDB wrapper)
- Lucide Icons
