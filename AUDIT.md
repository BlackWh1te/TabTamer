# TabTamer Build Audit — Critical Issues

## 1. The Core Loop Is Broken (Product-Killing)

**What's missing:** After capture, the 47 original tabs are STILL OPEN. The user still has a slow browser.

OneTab's entire value is: click button → tabs vanish → organized list appears. TabTamer catalogs tabs but does nothing to the browser. It's a pretty list viewer, not a tab manager.

**Fix required:**
- Popup needs "Tame & close tabs" option
- Dashboard needs "Close all captured tabs" button
- Dashboard needs "Restore this group" / "Restore session" buttons that call `chrome.tabs.create()`

## 2. background.js Lines 1-14 Are Dead Code

In MV3, `chrome.action.onClicked` NEVER fires when `default_popup` is set in manifest. The background script's tab capture logic is unreachable. The entire `background.js` only does badge updates.

**Fix required:** Move capture logic to popup only, or remove `default_popup` and use `onClicked` with a custom page.

## 3. The "AI Grouping" Is a Lie

The heuristic engine has two paths:
- Path A: Domain-based bucketing (works)
- Path B: Keyword clustering (dead code)

Path B depends on `tab.keywords`, but `tab.keywords` is ALWAYS `[]` in real usage. The `extractKeywords()` and `TECH_KEYWORDS` were deleted from `groupingEngine.ts` to satisfy the compiler. Now `misc` tabs with unknown domains get dumped into "Uncategorized" because they have no keywords.

The demo works because demo tabs hardcode `keywords: ['react']`, etc. Real capture sets `keywords: []`.

**Fix required:** Re-add keyword extraction. Extract from title+URL at capture time or in the engine.

## 4. No Error Handling for Edge URLs

`new URL(t.url)` in `popup.js` and `Dashboard.tsx` will throw on:
- `chrome://settings`
- `file://C:/...`
- `about:blank`
- `javascript:void(0)`

These crash the capture silently.

**Fix required:** Wrap URL parsing in try/catch, skip or sanitize invalid URLs.

## 5. Favicons Break in Extension Context

TabCard fetches `https://www.google.com/s2/favicons` from an extension page. Chrome's default CSP for extension pages blocks external image loads unless explicitly allowed in manifest `content_security_policy`.

**Fix required:** Either:
- Add `content_security_policy` with `img-src 'self' https://www.google.com;`
- Or store favicons as data URLs at capture time
- Or generate inline SVG favicons per domain

## 6. Dashboard Cannot Restore Tabs to Browser

The dashboard runs in an extension page context but has no `chrome.tabs` integration. Saved sessions can be loaded into the UI but never back into Chrome. The `ExternalLink` icon opens the URL in a new browser tab via `<a target="_blank">`, which is fine for one tab, but there's no "Restore all 12 tabs in this group" button.

**Fix required:** Add `chrome.tabs.create()` calls from dashboard, guarded by feature detection.

## 7. Missing Keyboard Shortcuts

Design doc claims `Cmd+Shift+T` for capture. Manifest has no `commands` section. The shortcut doesn't exist.

**Fix required:** Add `commands` to manifest with `_execute_action` or custom command.

## 8. No Duplicate Tab Detection

Real users accumulate duplicate tabs. Open the same Stack Overflow question 3 times. The tool should flag or dedupe these.

**Fix required:** Detect duplicate URLs within captured set, keep newest, flag duplicates.

## 9. Manifest Icon Format Wrong

Chrome toolbar icons should be PNG or ICO. SVG support in `action.default_icon` is limited and often renders incorrectly at small sizes.

**Fix required:** Generate PNG icons or document the SVG limitation.

## 10. Responsive Design Untested

The dashboard grid is `grid-cols-1 lg:grid-cols-2`. On mobile, tab titles truncate aggressively. The extension popup is fixed at 280px which is fine.

## 11. No Onboarding for First-Time Users

Install extension → click icon → popup appears with "Tame my tabs" → what happens? A new tab opens with dashboard. User sees empty state. They need to have tabs open already, or click "Try demo." The flow is unclear.

## 12. Session Data Has No Versioning

IndexedDB schema is v1. If we add fields later (e.g., `deviceInfo`, `tags`), existing sessions break or require migration code.

## 13. The "Local AI" Tagline Is Misleading

The grouping is rule-based heuristics. Calling it "local AI" on the popup footer and dashboard will get roasted on HN. Either ship real embeddings (Transformers.js) or change the copy to "smart grouping" or "local heuristics."

---

## Honest Verdict

The code compiles and the UI looks good. But the product loop is incomplete. A user installs it, captures tabs, sees a pretty list... and their browser is still slow. They uninstall.

What needs to ship before this is real:
1. Suspend/close after capture
2. Restore to browser
3. Keyword extraction actually working
4. Dead link detection
5. Honest branding
