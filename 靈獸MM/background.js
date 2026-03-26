const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbz6rh91araOqfT7kcTGyUkxjDnPy1zqyZbC8UQrYG_7wQmnqwoTt5kRa7sZMwtsU-jd-g/exec';

/**
 * 從 Google Sheet URL 中解析 spreadsheetId 與 gid。
 * 為了避免前端硬猜，統一在 background 處理一次。
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