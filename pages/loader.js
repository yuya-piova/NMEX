(async () => {
  // chrome.runtime.getURL を使って、モジュールを動的にインポートする
  const src = chrome.runtime.getURL('pages/router.js');
  const contentMain = await import(src);
})();
