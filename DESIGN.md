# TabTamer — Design Document

## 1. Product Vision

**One sentence:** Drop your browser chaos into beautiful, auto-organized groups in under 2 seconds. No signup, no config, no AI API keys.

**The "whoa" moment:** A user with 47 open tabs hits one button and watches them sort into named groups like "React docs", "Stripe API", "Articles to read" — instantly, locally, privately.

## 2. Problem Statement

Browser tab managers exist but they all demand configuration, signup, or manual sorting. Users with 20+ tabs give up and let Chrome eat their RAM. The status quo:
- Chrome's built-in groups: manual only, no persistence across sessions
- OneTab / Session Buddy: dumb lists, no organization
- Workona / Toby: heavy, SaaS-first, require accounts, slow to load

The gap: **zero-friction, intelligent tab organization that respects privacy.**

## 3. Target User

**Primary:** Developers, designers, researchers, students — anyone who opens 10+ tabs while researching a single topic and ends up with tab soup.

**Secondary:** Power users who want to save and share curated reading lists.

**Persona:** Alex, frontend developer, 15 tabs open for a single feature (docs, GitHub issues, Stack Overflow, design references, a Medium article). It's 2pm and Chrome is eating 4GB of RAM. Alex wants to save this research session, free up memory, and find any tab in 1 second later.

## 4. Core Features (MVP)

### 4.1 Instant AI Grouping (P0 — the hook)
- Capture all open tabs from browser extension
- Cluster into named groups using hybrid algorithm (heuristic + optional embedding)
- Display as color-coded cards with favicons, titles, domain chips
- Drag tabs between groups, rename groups, collapse/expand
- Save groups to IndexedDB for persistence

### 4.2 Smart Session Restore (P1 — retention)
- One-click "restore session" — reopens all tabs in their groups
- Flag dead links (404s, redirects) since last save
- Highlight unread tabs (never clicked since grouping)

### 4.3 Shareable Reading Lists (P2 — growth)
- Publish any group as a public link
- Beautiful magazine-style reading list view
- QR code for mobile sharing

## 5. User Flows

### Flow 1: First-Time Grouping (the demo)
1. User installs extension
2. Clicks extension icon → "Tame my tabs" button
3. Tabs captured, dashboard opens in new tab
4. Dashboard shows animated grouping: tabs fly into colored cards
5. Groups named automatically (editable)
6. User clicks "Save session" — stored locally
7. Extension badge now shows tab count + group count

### Flow 2: Daily Use
1. User has 23 tabs open, getting slow
2. Clicks extension → "Tame & free memory"
3. Groups saved, tabs optionally closed (with one-click restore)
4. Later: opens dashboard, sees saved groups, clicks group to restore

### Flow 3: Research Curation
1. User groups tabs on "GraphQL vs REST"
2. Renames group, drags to reorder tabs by priority
3. Clicks "Share" → gets public link
4. Link shows curated reading list with previews

## 6. Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Extension | Manifest V3, vanilla JS | Fast, no build step for MVP |
| Dashboard | React 18 + TypeScript + Tailwind | Component ecosystem, fast iteration |
| AI Grouping | Hybrid: heuristic + Transformers.js (optional) | Heuristic = instant, embeddings = accuracy |
| Storage | IndexedDB (local-first) | Zero backend dependency for MVP |
| Backend (P2) | Cloudflare Workers + KV | Edge-deployed sharing links |
| Icons | Lucide React | Consistent, lightweight |

## 7. Architecture

```
Browser Extension (MV3)
  ├── content script (tab metadata extraction)
  ├── service worker (capture trigger, badge count)
  └── popup (quick actions)

Dashboard (React SPA)
  ├── TabCapture module (receives tabs from extension)
  ├── GroupingEngine (AI/ heuristic clustering)
  ├── GroupRenderer (drag-drop UI)
  ├── SessionStore (IndexedDB persistence)
  └── ShareService (public link generation, P2)
```

## 8. AI Grouping Algorithm (Hybrid)

### Phase 1: Heuristic Clustering (instant, <100ms)
1. **Domain normalization**: Group by root domain first (github.com, stackoverflow.com, docs.*)
2. **Keyword extraction**: From URL path + title, extract tech terms ("react", "api", "tutorial", "issue")
3. **Domain-category mapping**: Predefined rules (youtube.com → "Video", reddit.com → "Discussion", docs.* → "Documentation")
4. **Merge small clusters**: If a group has <2 tabs, merge to nearest by keyword similarity
5. **Label generation**: Use most common keywords + domain pattern to name group

### Phase 2: Embedding Refinement (background, optional)
1. Load lightweight sentence transformer via Transformers.js (~30MB quantized)
2. Embed tab titles + URL paths
3. Run cosine-similarity clustering (HDBSCAN or simple threshold)
4. Merge with heuristic results, show confidence score per group

**Privacy note:** Phase 1 is 100% local. Phase 2 runs the model entirely in-browser via WebGPU/WebGL — no data leaves the machine.

## 9. Data Model

```typescript
interface Tab {
  id: string;              // UUID
  url: string;
  title: string;
  favicon: string;
  domain: string;
  keywords: string[];
  lastAccessed: number;
  clickCount: number;
}

interface TabGroup {
  id: string;
  name: string;
  color: string;           // Tailwind color name
  tabs: Tab[];
  createdAt: number;
  updatedAt: number;
  isShared: boolean;
  shareUrl?: string;
}

interface Session {
  id: string;
  name: string;
  groups: TabGroup[];
  createdAt: number;
  deviceInfo: string;
}
```

## 10. UI Design Principles

- **Density without clutter**: Show 15 tabs comfortably on a 13" screen
- **Color coding**: Each group gets a distinct Tailwind color (indigo, emerald, amber, rose, etc.)
- **Motion**: Tabs "fly" into groups on first load (Framer Motion, 300ms)
- **Dark mode default**: Developers live in dark mode
- **Keyboard shortcuts**: `Cmd+Shift+T` to capture, `Esc` to collapse all groups
- **Empty state**: Beautiful illustration when no tabs, with "Capture from browser" CTA

## 11. Implementation Phases

### Phase 1: Core Loop (Week 1)
- [ ] Browser extension: capture tabs, send to dashboard
- [ ] Dashboard: receive tabs, display as flat list
- [ ] Heuristic grouping engine
- [ ] Group display with drag-drop (dnd-kit)
- [ ] Save to IndexedDB
- [ ] Restore session (reopen tabs)

### Phase 2: Polish (Week 2)
- [ ] Animated grouping on first load
- [ ] Dead link detection
- [ ] Unread tab highlighting
- [ ] Keyboard shortcuts
- [ ] Onboarding tour
- [ ] Export/import JSON

### Phase 3: Sharing (Week 3)
- [ ] Cloudflare Worker backend
- [ ] Public link generation for groups
- [ ] Magazine-style reading list view
- [ ] QR code generation

### Phase 4: AI Upgrade (Week 4)
- [ ] Transformers.js integration
- [ ] Embedding-based clustering
- [ ] Confidence scores per group
- [ ] Smart merge suggestions

## 12. Success Metrics

- **Time to first group:** <2 seconds from click to organized view
- **Grouping accuracy:** >80% of groups feel "right" to user (measure via rename rate — low rename = high accuracy)
- **Retention:** User saves 3+ sessions in first week
- **Viral:** Shared links get 5+ unique clicks (P2)

## 13. Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Heuristic grouping feels dumb | Ship with 20+ domain rules + keyword list, iterate based on rename data |
| Chrome MV3 limits background work | All heavy work happens in dashboard tab, not service worker |
| Transformers.js model too large | Lazy-load only on user request, keep heuristic as default |
| No backend = no cross-device sync | Explicit P3 scope, not MVP blocker |

## 14. Future Vision (Post-MVP)

- **Cross-browser:** Firefox, Safari, Arc support
- **Cross-device sync:** Encrypted cloud sync
- **Time-based sessions:** "Show me yesterday's research tabs"
- **Auto-capture:** "You have 30+ tabs, want to tame them?" proactive prompt
- **Team workspaces:** Shared group libraries for teams
- **Browser-native feel:** Optional sidebar integration (Chrome side panel API)

---

*Generated with TabTamer office hours session — build the hook first, everything else follows.*
