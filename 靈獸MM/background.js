const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwVYiRzx-r6mG2XOtsqF9oOUWjvGCFitOi2lsqadMzfkFU0BhqZaDOx2_uV2i-6MRCw_A/exec';

/**
 * 從 Google Sheet URL 中解析 spreadsheetId 與 gid。
 */
function parseSheetInfo(url) {
  const result = {
    spreadsheetId: '',
    gid: ''
  };

  const spreadsheetMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  const gidMatch = url.match(/[?#&]gid=([0-9]+)/);

  result.spreadsheetId = spreadsheetMatch ? spreadsheetMatch[1] : '';
  result.gid = gidMatch ? gidMatch[1] : '';

  return result;
}

/**
 * 設定擴充功能右上角的 Badge。
 * 這裡使用 MAIL 作為小標籤，讓使用者更容易辨識這個工具的用途。
 *
 * 注意：
 * Chrome badge 能顯示的字數有限，
 * "MAIL" 在多數情況下可以顯示，但若圖示太小或系統縮放較高，
 * 有些環境可能會被壓縮。
 */
function setMailBadge() {
  chrome.action.setBadgeText({ text: 'MAIL' });
  chrome.action.setBadgeBackgroundColor({ color: '#1a73e8' });
  chrome.action.setBadgeTextColor?.({ color: '#ffffff' });
}

/**
 * 安裝或更新擴充功能時設定一次 Badge。
 */
chrome.runtime.onInstalled.addListener(() => {
  setMailBadge();
});

/**
 * 瀏覽器啟動後，重新補上 Badge。
 * 因為有些情況下 service worker 重啟後，badge 需要重新設定。
 */
chrome.runtime.onStartup?.addListener(() => {
  setMailBadge();
});

/**
 * 當 service worker 被喚醒時，也補一次 badge。
 * 這樣可以降低 badge 消失的機率。
 */
setMailBadge();

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab || !tab.url || !tab.url.includes('docs.google.com/spreadsheets')) {
    return;
  }

  const info = parseSheetInfo(tab.url);
  if (!info.spreadsheetId) {
    return;
  }

  const launchUrl =
    `${WEB_APP_URL}?spreadsheetId=${encodeURIComponent(info.spreadsheetId)}` +
    `&gid=${encodeURIComponent(info.gid || '')}` +
    `&sourceUrl=${encodeURIComponent(tab.url)}`;

  chrome.tabs.create({ url: launchUrl });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === 'OPEN_MAIL_MERGE' && message?.sheetUrl) {
    const info = parseSheetInfo(message.sheetUrl);
    if (!info.spreadsheetId) {
      sendResponse({ ok: false, message: '無法從目前網址解析 spreadsheetId。' });
      return;
    }

    const launchUrl =
      `${WEB_APP_URL}?spreadsheetId=${encodeURIComponent(info.spreadsheetId)}` +
      `&gid=${encodeURIComponent(info.gid || '')}` +
      `&sourceUrl=${encodeURIComponent(message.sheetUrl)}`;

    chrome.tabs.create({ url: launchUrl }, () => {
      sendResponse({ ok: true });
    });

    return true;
  }
});