import type { TabData, TabGroupData } from './db';
import { getGroupColor } from './db';
import { v4 as uuidv4 } from 'uuid';

const DOMAIN_CATEGORIES: Record<string, string> = {
  'github.com': 'Code',
  'stackoverflow.com': 'Code',
  'stackexchange.com': 'Code',
  'gitlab.com': 'Code',
  'bitbucket.org': 'Code',
  'npmjs.com': 'Code',
  'pypi.org': 'Code',
  'crates.io': 'Code',
  'docs.rs': 'Docs',
  'developer.mozilla.org': 'Docs',
  'react.dev': 'Docs',
  'nextjs.org': 'Docs',
  'vuejs.org': 'Docs',
  'angular.io': 'Docs',
  'tailwindcss.com': 'Docs',
  'docs.python.org': 'Docs',
  'readthedocs.io': 'Docs',
  'medium.com': 'Reading',
  'dev.to': 'Reading',
  'news.ycombinator.com': 'Discussion',
  'reddit.com': 'Discussion',
  'twitter.com': 'Social',
  'x.com': 'Social',
  'linkedin.com': 'Social',
  'youtube.com': 'Video',
  'youtu.be': 'Video',
  'vimeo.com': 'Video',
  'twitch.tv': 'Video',
  'figma.com': 'Design',
  'dribbble.com': 'Design',
  'behance.net': 'Design',
  'canva.com': 'Design',
  'notion.so': 'Productivity',
  'todoist.com': 'Productivity',
  'trello.com': 'Productivity',
  'linear.app': 'Productivity',
  'vercel.com': 'Deploy',
  'netlify.com': 'Deploy',
  'cloudflare.com': 'Deploy',
  'aws.amazon.com': 'Cloud',
  'azure.microsoft.com': 'Cloud',
  'cloud.google.com': 'Cloud',
  'wikipedia.org': 'Reference',
  'arxiv.org': 'Research',
  'scholar.google.com': 'Research',
};

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
  'should', 'may', 'might', 'must', 'shall', 'can', 'need', 'dare',
  'ought', 'used', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by',
  'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above',
  'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here',
  'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more',
  'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own',
  'same', 'so', 'than', 'too', 'very', 'just', 'and', 'but', 'if', 'or',
  'because', 'until', 'while', 'this', 'that', 'these', 'those', 'i', 'me',
  'my', 'myself', 'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she',
  'her', 'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who',
  'whom', 's', 't', 'don', 'doesn', 'didn', 'wasn', 'weren', 'haven',
  'hasn', 'hadn', 'won', 'wouldn', 'couldn', 'shouldn', 'isn', 'aren',
  'weren', 'mustn', 'needn', 'daren', 'oughtn', 'usedn', 'www', 'com',
  'org', 'net', 'io', 'app', 'dev', 'doc', 'docs', 'home', 'page',
  'index', 'default', 'about', 'contact', 'help', 'support', 'login',
  'sign', 'account', 'profile', 'user', 'admin', 'dashboard', 'main',
]);

function getCategory(domain: string): string | null {
  if (DOMAIN_CATEGORIES[domain]) return DOMAIN_CATEGORIES[domain];
  for (const [d, cat] of Object.entries(DOMAIN_CATEGORIES)) {
    if (domain.includes(d) || d.includes(domain)) return cat;
  }
  return null;
}

// Extract ALL meaningful words from title (not just tech keywords)
function extractTitleKeywords(title: string): string[] {
  const text = title.toLowerCase();
  const words = text.split(/[^a-z0-9]+/);
  const found: string[] = [];
  for (const w of words) {
    if (w.length >= 3 && !STOPWORDS.has(w) && !/^\d+$/.test(w) && !found.includes(w)) {
      found.push(w);
    }
  }
  return found.slice(0, 8);
}

// Jaccard similarity between two keyword sets
function jaccardSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;
  const setA = new Set(a);
  const setB = new Set(b);
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);
  return intersection.size / union.size;
}

function generateGroupName(tabs: TabData[]): string {
  const domains = tabs.map(t => t.domain);
  const keywords = tabs.flatMap(t => t.keywords);

  const uniqueDomains = [...new Set(domains)];
  if (uniqueDomains.length === 1) {
    const cat = getCategory(uniqueDomains[0]);
    if (cat) return `${cat}: ${uniqueDomains[0]}`;
    return uniqueDomains[0];
  }

  const keywordCounts: Record<string, number> = {};
  for (const k of keywords) {
    keywordCounts[k] = (keywordCounts[k] || 0) + 1;
  }
  const sorted = Object.entries(keywordCounts).sort((a, b) => b[1] - a[1]);
  if (sorted.length > 0 && sorted[0][1] >= Math.max(2, tabs.length * 0.3)) {
    return sorted[0][0].charAt(0).toUpperCase() + sorted[0][0].slice(1);
  }

  const common = getCategory(uniqueDomains[0]);
  if (common) return common;

  return 'Research';
}

type EnrichedTab = TabData & { titleKeywords: string[] };

export function groupTabsHeuristic(tabs: TabData[]): TabGroupData[] {
  // Enrich all tabs with title keywords for semantic grouping
  const enrichedTabs: EnrichedTab[] = tabs.map(t => ({
    ...t,
    titleKeywords: extractTitleKeywords(t.title),
  }));

  // Step 1: domain-based grouping
  const domainGroups: Record<string, EnrichedTab[]> = {};
  const misc: EnrichedTab[] = [];

  for (const tab of enrichedTabs) {
    const cat = getCategory(tab.domain);
    if (cat) {
      if (!domainGroups[cat]) domainGroups[cat] = [];
      domainGroups[cat].push(tab);
    } else {
      misc.push(tab);
    }
  }

  // Step 2: merge small domain groups
  const smallThreshold = 2;
  const resultGroups: TabGroupData[] = [];

  for (const [cat, groupTabs] of Object.entries(domainGroups)) {
    if (groupTabs.length >= smallThreshold) {
      resultGroups.push({
        id: uuidv4(),
        name: cat,
        color: '',
        tabs: groupTabs,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isShared: false,
      });
    } else {
      misc.push(...groupTabs);
    }
  }

  // Step 3: keyword clustering for misc tabs (tech keywords first)
  if (misc.length > 0) {
    const keywordClusters: Record<string, EnrichedTab[]> = {};
    const unclustered: EnrichedTab[] = [];

    for (const tab of misc) {
      if (tab.keywords.length > 0) {
        const key = tab.keywords[0];
        if (!keywordClusters[key]) keywordClusters[key] = [];
        keywordClusters[key].push(tab);
      } else {
        unclustered.push(tab);
      }
    }

    for (const [kw, groupTabs] of Object.entries(keywordClusters)) {
      if (groupTabs.length >= smallThreshold) {
        resultGroups.push({
          id: uuidv4(),
          name: kw.charAt(0).toUpperCase() + kw.slice(1),
          color: '',
          tabs: groupTabs,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          isShared: false,
        });
      } else {
        unclustered.push(...groupTabs);
      }
    }

    // Step 4: Semantic title-similarity clustering for remaining tabs
    if (unclustered.length > 0) {
      const semanticGroups: EnrichedTab[][] = [];
      const similarityThreshold = 0.25; // 25% word overlap

      for (const tab of unclustered) {
        let placed = false;
        for (const group of semanticGroups) {
          // Check similarity with any tab in the group
          const maxSim = Math.max(
            ...group.map(g => jaccardSimilarity(tab.titleKeywords, g.titleKeywords))
          );
          if (maxSim >= similarityThreshold) {
            group.push(tab);
            placed = true;
            break;
          }
        }
        if (!placed) {
          semanticGroups.push([tab]);
        }
      }

      for (const groupTabs of semanticGroups) {
        if (groupTabs.length >= smallThreshold) {
          // Generate name from shared title keywords
          const allKeywords = groupTabs.flatMap(t => t.titleKeywords);
          const counts: Record<string, number> = {};
          for (const k of allKeywords) counts[k] = (counts[k] || 0) + 1;
          const best = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
          const name = best && best[1] >= 2
            ? best[0].charAt(0).toUpperCase() + best[0].slice(1)
            : groupTabs[0].domain;

          resultGroups.push({
            id: uuidv4(),
            name,
            color: '',
            tabs: groupTabs,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            isShared: false,
          });
        } else {
          // Single tabs go to "Other"
          const otherGroup = resultGroups.find(g => g.name === 'Other');
          if (otherGroup) {
            otherGroup.tabs.push(...groupTabs);
          } else {
            resultGroups.push({
              id: uuidv4(),
              name: 'Other',
              color: '',
              tabs: groupTabs,
              createdAt: Date.now(),
              updatedAt: Date.now(),
              isShared: false,
            });
          }
        }
      }
    }
  }

  // Step 5: post-process — merge very small groups into similar larger groups
  const MIN_GROUP_SIZE = 2;
  const smallGroups = resultGroups.filter(g => g.tabs.length < MIN_GROUP_SIZE && g.name !== 'Other');
  const largeGroups = resultGroups.filter(g => g.tabs.length >= MIN_GROUP_SIZE || g.name === 'Other');

  for (const small of smallGroups) {
    let merged = false;
    const smallKeywords = small.tabs.flatMap(t => t.keywords.length > 0 ? t.keywords : (t.titleKeywords || []));

    for (const large of largeGroups) {
      if (large.name === 'Other') continue;
      const largeKeywords = large.tabs.flatMap(t => t.keywords.length > 0 ? t.keywords : (t.titleKeywords || []));
      const sim = jaccardSimilarity(smallKeywords, largeKeywords);
      if (sim >= 0.15) {
        large.tabs.push(...small.tabs);
        merged = true;
        break;
      }
    }

    if (!merged) {
      const other = largeGroups.find(g => g.name === 'Other');
      if (other) {
        other.tabs.push(...small.tabs);
      } else {
        largeGroups.push(small);
      }
    }
  }

  // Step 6: refine names
  for (const g of largeGroups) {
    if (g.name === 'Other' || g.name === 'Uncategorized') continue;
    const refined = generateGroupName(g.tabs);
    if (refined && refined !== g.name) {
      g.name = refined;
    }
  }

  // Step 7: assign colors and sort
  largeGroups.forEach((g, i) => {
    g.color = getGroupColor(i);
  });
  largeGroups.sort((a, b) => b.tabs.length - a.tabs.length);

  return largeGroups;
}

// Dead link detection: lightweight HEAD request
export async function checkDeadLinks(tabs: TabData[]): Promise<TabData[]> {
  const checked = await Promise.all(
    tabs.map(async (tab) => {
      if (!tab.url.startsWith('http://') && !tab.url.startsWith('https://')) {
        return { ...tab, isDead: false };
      }
      if (tab.url.includes('localhost') || tab.url.includes('127.0.0.1')) {
        return { ...tab, isDead: false };
      }
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        await fetch(tab.url, {
          method: 'HEAD',
          mode: 'no-cors',
          signal: controller.signal,
        });
        clearTimeout(timeout);
        return { ...tab, isDead: false };
      } catch {
        return { ...tab, isDead: true };
      }
    })
  );
  return checked;
}
