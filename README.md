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
- **Drag-and-Drop** - Drag tabs between groups by their grip handle
- **Sort Groups** - Sort by name, size, or recency
- **Shareable HTML** - Export sessions as standalone HTML files to share with others

## 🚀 Installation

### From Chrome Web Store (Coming Soon)

### Manual Installation

Follow these steps to install TabTamer manually in Chrome:

#### Step 1: Download TabTamer

- **Option A (Download ZIP):** Go to [https://github.com/BlackWh1te/TabTamer](https://github.com/BlackWh1te/TabTamer) and click the green "Code" button, then "Download ZIP". Extract the downloaded file to a folder on your computer.
- **Option B (Git Clone):** If you have Git installed, run:
  ```bash
  git clone https://github.com/BlackWh1te/TabTamer.git
  cd TabTamer
  ```

#### Step 2: Open Chrome Extensions Page

- Open Google Chrome
- Type `chrome://extensions/` in the address bar and press Enter
- Alternatively, click the Chrome menu (three dots) → More tools → Extensions

#### Step 3: Enable Developer Mode

- Look for a toggle switch labeled "Developer mode" in the top-right corner of the extensions page
- Click it to enable Developer mode (the toggle will turn blue when enabled)
- This allows you to load unpacked extensions that aren't from the Chrome Web Store

#### Step 4: Load the Extension

- With Developer mode enabled, you'll see new buttons appear at the top left
- Click the "Load unpacked" button
- A file picker dialog will open

#### Step 5: Select the Extension Folder

- Navigate to the folder where you extracted/downloaded TabTamer
- **Important:** Select the `extension` folder inside the TabTamer directory (not the root TabTamer folder)
- The path should look like: `TabTamer/extension/`
- Click "Select Folder"

#### Step 6: Verify Installation

- TabTamer should now appear in your extensions list with its purple icon
- You should see a confirmation message that the extension was loaded successfully
- Pin TabTamer to your toolbar by clicking the puzzle piece icon → Pin next to TabTamer

#### Step 7: Start Using TabTamer

- Press `Ctrl+Shift+Y` (Windows/Linux) or `Cmd+Shift+Y` (Mac) to open TabTamer
- Or click the TabTamer icon in your Chrome toolbar
- Try the demo mode or capture your actual tabs!

**💡 Tip:** For a visual walkthrough with animated steps, visit the [installer page](https://blackwh1te.github.io/TabTamer/installer.html)

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
- **Move Tabs** - Drag any tab by its grip handle (`⋮⋮`) to another group. The target group highlights in purple. Drop to move. (Dropdown menu still available as keyboard fallback.)
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
