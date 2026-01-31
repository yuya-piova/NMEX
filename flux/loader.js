(async () => {
  // 自身のパスから Flux.js を探して動的インポート
  // "flux/Flux.js" を指定
  const src = chrome.runtime.getURL('flux/Flux.js');

  // モジュールとして読み込む
  const { Flux } = await import(src);

  // アプリ起動
  const app = new Flux();
  app.init();
})();
