chrome.runtime.onInstalled.addListener(() => {
  chrome.action.setBadgeBackgroundColor({ color: '#a855f7' });
});

// Update badge count when tabs change
async function updateBadge() {
  try {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    chrome.action.setBadgeText({
      text: tabs.length > 99 ? '99+' : String(tabs.length)
    });
  } catch (e) {}
}

chrome.tabs.onCreated.addListener(updateBadge);
chrome.tabs.onRemoved.addListener(updateBadge);
chrome.tabs.onDetached.addListener(updateBadge);
chrome.windows.onFocusChanged.addListener(updateBadge);

updateBadge();
