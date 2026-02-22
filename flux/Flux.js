console.log('Flux.js loaded');

import { FluxCore } from './core/FluxCore.js';
import { MenuWidget } from './widgets/MenuWidget.js';
import { UnitWidget } from './widgets/features/UnitWidget.js';
import { TaskWidget } from './widgets/features/TaskWidget.js';
import { MiscStatsWidget } from './widgets/features/MiscStatsWidget.js';
import { TaskPageWidget } from './widgets/pages/TaskPageWidget.js';
import { AsCoachPageWidget } from './widgets/pages/AsCoachPageWidget.js';
import { ManagementPageWidget } from './widgets/pages/ManagementPageWidget.js';
import { DashboardActions } from './actions/DashboardAction.js';
import { NotificationWidget } from './widgets/features/NotificationWidget.js';
import { StatsWidget } from './widgets/features/StatsWidget.js';
import { BlockSalesPageWidget } from './widgets/pages/BlockSalesPageWidget.js';
import { StudentCountPageWidget } from './widgets/pages/StudentCountPageWidget.js';
import { DiversePageWidget } from './widgets/pages/DiversePageWidget.js';
import { SettingsPageWidget } from './widgets/pages/SettingsPageWidget.js';
import { ToolsPageWidget } from './widgets/pages/ToolsPageWidget.js';

export class Flux {
  constructor() {
    // 1. 初期状態の設定
    this.core = new FluxCore({
      currentPage: 'Dashboard',
      unitStatus: [],
      tasks: [],
      miscStats: null,
      errorTasks: [],
      notifications: [],
      contractCount: '-',
      trialCount: '-',
      cancelCount: '-',
      blockSales: null,
      studentCounts: null,
      diverseData: null
    });

    // 2. Widgetのインスタンス化
    this.widgets = {
      menu: new MenuWidget(this.core),
      notification: new NotificationWidget(this.core),
      unit: new UnitWidget(this.core),
      task: new TaskWidget(this.core),
      miscStats: new MiscStatsWidget(this.core),
      stats: new StatsWidget(this.core),
      taskPage: new TaskPageWidget(this.core),
      asCoachPage: new AsCoachPageWidget(this.core),
      managementPage: new ManagementPageWidget(this.core),
      blockSalesPage: new BlockSalesPageWidget(this.core),
      studentCountPage: new StudentCountPageWidget(this.core),
      diversePage: new DiversePageWidget(this.core),
      settingsPage: new SettingsPageWidget(this.core),
      toolsPage: new ToolsPageWidget(this.core)
    };
  }

  init() {
    this.createLayout();

    // 3. Widgetのマウント
    this.widgets.menu.mount('#flux-sidebar');

    // コンテンツエリアには全Widgetをマウントしておき、CSSで出し分ける方式をとります
    // (または、DashboardページならUnitとTaskを表示、のような制御も可)
    const contentArea = document.querySelector('#flux-content');

    // コンテナ作成
    this.createPageContainer(contentArea, 'Dashboard');
    this.createPageContainer(contentArea, 'Unit');
    this.createPageContainer(contentArea, 'Management');

    // 固定ページ系
    this.createPageContainer(contentArea, 'Tasks', 'flux-page-fixed');
    this.createPageContainer(contentArea, 'AsCoach', 'flux-page-fixed');
    this.createPageContainer(contentArea, 'BlockSales', 'flux-page-fixed');
    this.createPageContainer(contentArea, 'StudentCount', 'flux-page-fixed');
    this.createPageContainer(contentArea, 'Diverse', 'flux-page-fixed');
    this.createPageContainer(contentArea, 'Settings', 'flux-page-fixed');
    this.createPageContainer(contentArea, 'Tools', 'flux-page-fixed');

    // Dashboardページに Widget を配置
    this.widgets.notification.mount('#flux-header-right');
    this.widgets.stats.mount('#page-Dashboard');
    this.widgets.unit.mount('#page-Dashboard');
    this.widgets.task.mount('#page-Dashboard');
    this.widgets.miscStats.mount('#page-Dashboard');
    this.widgets.taskPage.mount('#page-Tasks');
    this.widgets.asCoachPage.mount('#page-AsCoach');
    this.widgets.managementPage.mount('#page-Management');
    this.widgets.blockSalesPage.mount('#page-BlockSales');
    this.widgets.studentCountPage.mount('#page-StudentCount');
    this.widgets.diversePage.mount('#page-Diverse');
    this.widgets.settingsPage.mount('#page-Settings');
    this.widgets.toolsPage.mount('#page-Tools');

    // 4. ページ切り替え監視
    this.core.subscribe(state => {
      this.switchPage(state.currentPage);
    });

    // 5. 初期データ取得
    this.core.dispatch(DashboardActions.fetchContracts);
    this.core.dispatch(DashboardActions.fetchTrials);
    this.core.dispatch(DashboardActions.fetchCancels);
    this.core.dispatch(DashboardActions.fetchNotifications);
    this.core.dispatch(DashboardActions.fetchUnitStatus);
    this.core.dispatch(DashboardActions.fetchTasks);
    this.core.dispatch(DashboardActions.fetchMiscStats);
    this.core.dispatch(DashboardActions.fetchErrorTasks);
    this.core.dispatch(DashboardActions.fetchAsCoachData);
    this.core.dispatch(DashboardActions.fetchBlockSales);

    //通知は１５分毎の定期実行
    setInterval(() => {
      this.core.dispatch(DashboardActions.fetchNotifications);
    }, 900000);
  }

  createLayout() {
    // 全体レイアウト生成
    document.body.innerHTML = `
      <div class="flux-layout">
        <header id="flux-header">
            <div class="flux-brand"><i class="fa-solid fa-shapes"></i> Flux</div>
            <div id="flux-header-right"></div>
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

    const svgIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
        <rect width="64" height="64" rx="12" fill="#0056b3"/>
        <text x="32" y="48" font-family="Arial, sans-serif" font-size="40" font-weight="bold" fill="white" text-anchor="middle">F</text>
      </svg>
    `.trim();
    const favicon = document.createElement('link');
    favicon.rel = 'icon';
    //favicon.href = chrome.runtime.getURL('icon19.png');
    favicon.href = `data:image/svg+xml;base64,${btoa(svgIcon)}`;
    document.head.appendChild(favicon);

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
