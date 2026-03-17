(function initLauncher() {
  const BUTTON_ID = 'sheet-mail-merge-launcher-btn';

  if (document.getElementById(BUTTON_ID)) {
    return;
  }

  const btn = document.createElement('button');
  btn.id = BUTTON_ID;
  btn.textContent = 'Mail Merge';
  btn.style.position = 'fixed';
  btn.style.right = '24px';
  btn.style.bottom = '24px';
  btn.style.zIndex = '999999';
  btn.style.padding = '10px 16px';
  btn.style.border = 'none';
  btn.style.borderRadius = '999px';
  btn.style.cursor = 'pointer';
  btn.style.background = '#1a73e8';
  btn.style.color = '#fff';
  btn.style.fontSize = '14px';
  btn.style.boxShadow = '0 4px 12px rgba(0,0,0,.2)';

  btn.addEventListener('click', () => {
    chrome.runtime.sendMessage({
      type: 'OPEN_MAIL_MERGE',
      sheetUrl: window.location.href
    });
  });

  document.body.appendChild(btn);
})();