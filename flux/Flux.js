import { FluxCore } from './core/FluxCore.js';
import { MenuWidget } from './widgets/MenuWidget.js';
import { UnitWidget } from './widgets/features/UnitWidget.js';
import { DashboardActions } from './actions/DashboardAction.js';

export class Flux {
  constructor() {
    // 1. 初期状態の設定
    this.core = new FluxCore({
      currentPage: 'Dashboard',
      unitStatus: []
      // tasks: []
    });

    // 2. Widgetのインスタンス化
    this.widgets = {
      menu: new MenuWidget(this.core),
      unit: new UnitWidget(this.core)
      // task: new TaskWidget(this.core) // 後で作る
    };
  }

  init() {
    this.createLayout();

    // 3. Widgetのマウント
    this.widgets.menu.mount('#flux-sidebar');

    // コンテンツエリアには全Widgetをマウントしておき、CSSで出し分ける方式をとります
    // (または、DashboardページならUnitとTaskを表示、のような制御も可)
    const contentArea = document.querySelector('#flux-content');

    // ページごとのコンテナを作成
    this.createPageContainer(contentArea, 'Dashboard');
    this.createPageContainer(contentArea, 'Unit');
    this.createPageContainer(contentArea, 'Tasks');

    // Dashboardページに UnitWidget を配置してみる
    this.widgets.unit.mount('#page-Dashboard');
    // Unitページにも同じものを配置したい場合は、Mount先を変えるか、
    // WidgetはDOM要素なので1箇所にしか存在できません。
    // 複数の場所に同じWidgetを出したい場合はWidgetインスタンスを分ける必要がありますが、
    // 今回は「Dashboard」ページに全情報を集約する設計とします。

    // 4. ページ切り替え監視
    this.core.subscribe(state => {
      this.switchPage(state.currentPage);
    });

    // 5. 初期データ取得
    this.core.dispatch(DashboardActions.fetchUnitStatus);
  }

  createLayout() {
    // 全体レイアウト生成
    document.body.innerHTML = `
      <div class="flux-layout">
        <header id="flux-header">
            <div class="flux-brand"><i class="fa-solid fa-shapes"></i> Flux</div>
        </header>
        <aside id="flux-sidebar"></aside>
        <main id="flux-content"></main>
      </div>
    `;
    document.body.classList.add('pxdb_body');

    // CSSの適用 (manifest.jsonでCSSファイルを読み込むのが正攻法ですが、JSで当てる場合)
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('flux/css/flux.css');
    document.head.appendChild(link);
  }

  createPageContainer(parent, pageName) {
    const div = document.createElement('div');
    div.id = `page-${pageName}`;
    div.className = 'flux-page'; // CSSで制御用
    // 初期はDashboard以外非表示
    if (pageName !== 'Dashboard') div.style.display = 'none';
    parent.appendChild(div);
  }

  switchPage(pageName) {
    // 全ページを非表示にして、対象だけ表示
    document.querySelectorAll('.flux-page').forEach(el => {
      el.style.display = 'none';
    });
    const target = document.getElementById(`page-${pageName}`);
    if (target) target.style.display = 'grid'; // または block

    // ページタイトル変更などの処理もここで可能
  }
}
