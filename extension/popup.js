// Keyword extraction for smarter grouping
const TECH_KEYWORDS = new Set([
  'react', 'vue', 'angular', 'svelte', 'solid', 'next', 'nuxt', 'astro',
  'tailwind', 'bootstrap', 'sass', 'css', 'html', 'js', 'ts', 'typescript',
  'javascript', 'python', 'rust', 'go', 'golang', 'java', 'kotlin', 'swift',
  'node', 'bun', 'deno', 'webpack', 'vite', 'rollup', 'esbuild',
  'docker', 'kubernetes', 'terraform', 'pulumi',
  'aws', 'gcp', 'azure', 'vercel', 'netlify', 'heroku',
  'graphql', 'rest', 'api', 'grpc', 'websocket',
  'postgres', 'mysql', 'mongodb', 'redis', 'sqlite', 'prisma',
  'git', 'github', 'actions', 'pipeline',
  'test', 'jest', 'vitest', 'cypress', 'playwright',
  'auth', 'oauth', 'jwt', 'session', 'cookie',
  'ai', 'ml', 'llm', 'gpt', 'openai', 'transformer',
  'algorithm', 'leetcode', 'hackerrank', 'issue', 'pr', 'pull',
]);

function safeExtractDomain(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return 'unknown';
  }
}

function extractKeywords(title, url) {
  const text = (title + ' ' + url).toLowerCase();
  const words = text.split(/[^a-z0-9+#]+/);
  const found = [];
  for (const w of words) {
    if (w.length >= 2 && TECH_KEYWORDS.has(w) && !found.includes(w)) {
      found.push(w);
    }
  }
  return found.slice(0, 4);
}

function isValidUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.startsWith('http://') || url.startsWith('https://');
}

// Modes: 0 = organize only, 1 = close, 2 = chrome groups
let captureMode = 0;
const MODE_STORAGE_KEY = 'tabtamer_capture_mode';

document.addEventListener('DOMContentLoaded', async () => {
  const tabs = await chrome.tabs.query({ currentWindow: true });
  const validTabs = tabs.filter(t => isValidUrl(t.url));
  const countEl = document.getElementById('tabCount');

  // Load saved session count from dashboard storage
  let sessionCount = 0;
  try {
    const dbData = await chrome.storage.local.get('tabtamer_session_count');
    sessionCount = dbData.tabtamer_session_count || 0;
  } catch {}

  countEl.innerHTML = `${validTabs.length} tabs ready to organize` +
    (sessionCount > 0 ? ` <span style="color:#71717a;font-size:11px;">· ${sessionCount} saved sessions</span>` : '');

  // Load persisted mode
  try {
    const stored = await chrome.storage.local.get(MODE_STORAGE_KEY);
    if (stored[MODE_STORAGE_KEY] !== undefined) {
      captureMode = stored[MODE_STORAGE_KEY];
    }
  } catch {}

  // Mode toggles
  const modeOrganize = document.getElementById('modeOrganize');
  const modeClose = document.getElementById('modeClose');
  const modeGroup = document.getElementById('modeGroup');
  const warningClose = document.getElementById('warningClose');
  const warningGroup = document.getElementById('warningGroup');

  function setMode(mode) {
    captureMode = mode;
    [modeOrganize, modeClose, modeGroup].forEach(b => b.classList.remove('active'));
    warningClose.classList.remove('show');
    warningGroup.classList.remove('show');

    if (mode === 0) modeOrganize.classList.add('active');
    if (mode === 1) { modeClose.classList.add('active'); warningClose.classList.add('show'); }
    if (mode === 2) { modeGroup.classList.add('active'); warningGroup.classList.add('show'); }

    // Persist mode
    chrome.storage.local.set({ [MODE_STORAGE_KEY]: mode }).catch(() => {});
  }

  // Initialize from stored mode
  setMode(captureMode);

  modeOrganize.addEventListener('click', () => setMode(0));
  modeClose.addEventListener('click', () => setMode(1));
  modeGroup.addEventListener('click', () => setMode(2));

  document.getElementById('tameBtn').addEventListener('click', async () => {
    const btn = document.getElementById('tameBtn');
    btn.disabled = true;
    btn.textContent = captureMode === 2 ? 'Grouping...' : 'Organizing...';

    const allTabs = await chrome.tabs.query({ currentWindow: true });
    const validTabs = allTabs.filter(t => isValidUrl(t.url));

    // Detect duplicates
    const seen = new Set();
    const duplicates = [];
    const uniqueTabs = [];
    for (const t of validTabs) {
      if (seen.has(t.url)) {
        duplicates.push(t.id);
      } else {
        seen.add(t.url);
        uniqueTabs.push(t);
      }
    }

    const payload = uniqueTabs.map(t => ({
      id: String(t.id),
      url: t.url,
      title: t.title || t.url,
      favicon: t.favIconUrl || '',
      domain: safeExtractDomain(t.url),
      keywords: extractKeywords(t.title || '', t.url),
      lastAccessed: Date.now(),
      clickCount: 0,
      isDuplicate: false,
    }));

    for (const dupId of duplicates) {
      const tab = allTabs.find(t => t.id === dupId);
      if (tab) {
        payload.push({
          id: String(tab.id),
          url: tab.url,
          title: tab.title || tab.url,
          favicon: tab.favIconUrl || '',
          domain: safeExtractDomain(tab.url),
          keywords: extractKeywords(tab.title || '', tab.url),
          lastAccessed: Date.now(),
          clickCount: 0,
          isDuplicate: true,
        });
      }
    }

    const capturedTabIds = validTabs.map(t => t.id);

    // Chrome native tab groups mode
    if (captureMode === 2) {
      await chrome.storage.local.set({
        'tabtamer_capture': payload,
        'tabtamer_captured_ids': capturedTabIds,
        'tabtamer_close_after_capture': false,
        'tabtamer_chrome_groups': true,
      });

      chrome.tabs.create({
        url: chrome.runtime.getURL('dashboard/index.html?capture=1')
      });

      setTimeout(async () => {
        try {
          const domainMap = {};
          for (const t of validTabs) {
            const domain = safeExtractDomain(t.url);
            if (!domainMap[domain]) domainMap[domain] = [];
            domainMap[domain].push(t.id);
          }

          for (const [domain, tabIds] of Object.entries(domainMap)) {
            if (tabIds.length >= 2) {
              try {
                await chrome.tabs.group({ tabIds, createProperties: {} });
              } catch (e) {
                console.error('Failed to group tabs for', domain, e);
              }
            }
          }
        } catch (e) {
          console.error('Chrome grouping failed:', e);
        }
      }, 500);

      return;
    }

    // Normal organize / close modes
    await chrome.storage.local.set({
      'tabtamer_capture': payload,
      'tabtamer_captured_ids': capturedTabIds,
      'tabtamer_close_after_capture': captureMode === 1,
      'tabtamer_chrome_groups': false,
    });

    chrome.tabs.create({
      url: chrome.runtime.getURL('dashboard/index.html?capture=1')
    });
  });

  document.getElementById('dashboardBtn').addEventListener('click', () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL('dashboard/index.html')
    });
  });

  document.getElementById('settingsBtn').addEventListener('click', () => {
    chrome.tabs.create({
      url: chrome.runtime.getURL('dashboard/index.html?view=settings')
    });
  });
});
