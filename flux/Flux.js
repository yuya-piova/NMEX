console.log('Flux.js loaded');

import { FluxCore } from './core/FluxCore.js';
import { MenuWidget } from './widgets/MenuWidget.js';
import { UnitWidget } from './widgets/features/UnitWidget.js';
import { TaskWidget } from './widgets/features/TaskWidget.js';
import { TaskPageWidget } from './widgets/pages/TaskPageWidget.js';
import { AsCoachPageWidget } from './widgets/pages/AsCoachPageWidget.js';
import { DashboardActions } from './actions/DashboardAction.js';

export class Flux {
  constructor() {
    // 1. 初期状態の設定
    this.core = new FluxCore({
      currentPage: 'Dashboard',
      unitStatus: [],
      tasks: [],
      errorTasks: []
    });

    // 2. Widgetのインスタンス化
    this.widgets = {
      menu: new MenuWidget(this.core),
      unit: new UnitWidget(this.core),
      task: new TaskWidget(this.core),
      taskPage: new TaskPageWidget(this.core),
      asCoachPage: new AsCoachPageWidget(this.core)
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
    this.createPageContainer(contentArea, 'Tasks', 'flux-page-fixed');
    this.createPageContainer(contentArea, 'AsCoach', 'flux-page-fixed');

    // Dashboardページに Widget を配置
    this.widgets.unit.mount('#page-Dashboard');
    this.widgets.task.mount('#page-Dashboard');
    this.widgets.taskPage.mount('#page-Tasks');
    this.widgets.asCoachPage.mount('#page-AsCoach');

    // 4. ページ切り替え監視
    this.core.subscribe(state => {
      this.switchPage(state.currentPage);
    });

    // 5. 初期データ取得
    this.core.dispatch(DashboardActions.fetchUnitStatus);
    this.core.dispatch(DashboardActions.fetchTasks);
    this.core.dispatch(DashboardActions.fetchErrorTasks);
    this.core.dispatch(DashboardActions.fetchAsCoachData);
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

    // CSSの適用 (manifest.jsonでCSSファイルを読み込むのが正攻法ですが、JSで当てる場合)
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = chrome.runtime.getURL('flux/css/flux.css');
    document.head.appendChild(link);

    document.title = 'Flux';
  }

  createPageContainer(parent, pageName, extraClass = '') {
    const div = document.createElement('div');
    div.id = `page-${pageName}`;
    div.className = `flux-page ${extraClass}`;

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
    if (target) target.style.display = '';

    // ページタイトル変更などの処理もここで可能
  }
}
