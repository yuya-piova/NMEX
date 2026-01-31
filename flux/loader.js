(async () => {
  // 1. 起動させたいページかどうかチェックする
  // 例: URLに 'index.aspx' が含まれる場合のみ起動
  // ※具体的なURL条件は実際の運用に合わせて書き換えてください
  if (!location.pathname.includes('/netz/netz1/s/student_inout_checklist.aspx')) return;

  // 2. モジュールを読み込む
  const src = chrome.runtime.getURL('flux/Flux.js');
  const { Flux } = await import(src);

  // 3. アプリケーションを起動 (new Flux() して init())
  const app = new Flux();
  app.init();

  // (任意) コンソールからデバッグ操作したい場合のために window に公開しておく
  window.fluxApp = app;
})();
