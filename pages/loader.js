(async () => {
  // chrome.runtime.getURL を使って、モジュールを動的にインポートする
  const src = chrome.runtime.getURL('router.js');
  const contentMain = await import(src);
})();
