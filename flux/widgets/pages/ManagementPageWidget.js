// flux/widgets/pages/ManagementPageWidget.js

import { Widget } from '../../core/Widget.js';
import { DashboardActions } from '../../actions/DashboardAction.js';

export class ManagementPageWidget extends Widget {
  constructor(core) {
    super(core);
    // 初期日付設定 (先月～今日)
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);

    this.state = {
      from: this.formatDate(lastMonth),
      to: this.formatDate(today)
    };
  }

  formatDate(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  render(globalState) {
    const results = globalState.managementResults || [];

    // 結果リストのHTML生成
    const resultsHtml = results
      .map(
        res => `
      <tr>
        <td class="flux-cell-head">${res.title}</td>
        <td>${res.text}</td>
        <td class="flux-cell-action">
        ${res.url ? `<a href="${res.url}" target="_blank" class="chip-link"><i class="fa-solid fa-up-right-from-square"></i></a>` : ''}
        </td>
        <td style="width:auto;"></td>
      </tr>
    `
      )
      .join('');

    this.root.innerHTML = `
      <div class="flux-page-header">
        <h2 class="flux-page-title"><i class="fa-solid fa-briefcase"></i> Management</h2>
      </div>
      
      <div class="flux-manage-container">
        <div class="flux-manage-controls">
          <div class="flux-manage-group">
            <label>期間</label>
            <input type="date" id="manage-from" class="flux-input" value="${this.state.from}">
            <span>～</span>
            <input type="date" id="manage-to" class="flux-input" value="${this.state.to}">
          </div>
          
          <div class="flux-manage-group">
            <button class="flux-btn flux-btn-secondary btn-set-range" data-range="nextMonth">翌月</button>
            <button class="flux-btn flux-btn-secondary btn-set-range" data-range="koshu">講習</button>
          </div>
        </div>

        <div class="flux-manage-actions-row">
          <button class="flux-btn flux-btn-primary btn-check" data-type="text">
            <i class="fa-solid fa-book"></i> テキスト配布CH
          </button>
          <button class="flux-btn flux-btn-primary btn-check" data-type="open">
            <i class="fa-solid fa-door-open"></i> 開校CH
          </button>
          <button class="flux-btn flux-btn-primary btn-check" data-type="schedule">
            <i class="fa-solid fa-calendar-check"></i> 講習SJ入力CH
          </button>
          <button class="flux-btn flux-btn-primary btn-check" data-type="interview">
            <i class="fa-solid fa-comments"></i> 面談過去対応CH
          </button>
        </div>

        <div class="flux-table-container" style="flex:1; overflow:auto; margin-top:10px;">
          <table class="flux-table-full dblcopytable">
            <thead>
              <tr> 
                <th style="width: 150px;">教室</th>
                <th>内容</th>
                <th style="width: 80px;"></th>
                <th style="width: auto;"></th>
              </tr>
            </thead>
            <tbody>
              ${results.length > 0 ? resultsHtml : '<tr><td colspan="3" class="flux-empty-state">チェックを実行してください</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    `;

    // --- イベントリスナ ---

    // 日付変更の保存
    this.root.querySelector('#manage-from').addEventListener('change', e => (this.state.from = e.target.value));
    this.root.querySelector('#manage-to').addEventListener('change', e => (this.state.to = e.target.value));

    // 期間セットボタン
    this.root.querySelectorAll('.btn-set-range').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.range;
        const now = new Date();
        if (type === 'nextMonth') {
          // 翌月1日〜翌月末
          const nextM = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          const nextMEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
          this.state.from = this.formatDate(nextM);
          this.state.to = this.formatDate(nextMEnd);
        } else if (type === 'koshu') {
          // NX.VAR.koshu_kikan がある前提だが、なければ仮でセット
          if (typeof NX !== 'undefined' && NX.VAR && NX.VAR.koshu_kikan) {
            this.state.from = NX.VAR.koshu_kikan['開始'].replace(/\//g, '-');
            this.state.to = NX.VAR.koshu_kikan['終了'].replace(/\//g, '-');
          } else {
            alert('講習期間データが見つかりません');
          }
        }
        // UI更新
        this.root.querySelector('#manage-from').value = this.state.from;
        this.root.querySelector('#manage-to').value = this.state.to;
      });
    });

    // チェック実行ボタン
    this.root.querySelectorAll('.btn-check').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        // 面談の場合は年度入力が必要なため簡易プロンプト
        let params = { from: this.state.from.replace(/-/g, '/'), to: this.state.to.replace(/-/g, '/') };

        if (type === 'interview') {
          const nendo = prompt('年度を入力してください (例: 2025)', new Date().getFullYear());
          if (!nendo) return;
          const season = prompt('季節コードを入力してください (春:1, 夏:2, 冬:3)', '2');
          if (!season) return;
          params.nendo = nendo;
          params.season = season;
        }

        // 実行中はローディング表示っぽくする
        //this.root.querySelector('.flux-manage-results').innerHTML =
        //  '<div class="flux-loading"><i class="fa-solid fa-spinner fa-spin"></i> Checking...</div>';

        this.core.dispatch(DashboardActions.runManagementCheck, { type, params });
      });
    });
  }
}

/*
  render(globalState) {
    const results = globalState.managementResults || [];

    // 結果リストのHTML生成
    const resultsHtml = results
      .map(
        res => `
      <div class="flux-manage-chip chip-${res.type}">
        <span class="chip-title">${res.title}</span>
        <span class="chip-text">${res.text}</span>
        ${res.url ? `<a href="${res.url}" target="_blank" class="chip-link"><i class="fa-solid fa-up-right-from-square"></i></a>` : ''}
      </div>
    `
      )
      .join('');

    this.root.innerHTML = `
      <div class="flux-page-header">
        <h2 class="flux-page-title"><i class="fa-solid fa-briefcase"></i> Management</h2>
      </div>
      
      <div class="flux-manage-container">
        <div class="flux-manage-controls">
          <div class="flux-manage-group">
            <label>期間</label>
            <input type="date" id="manage-from" class="flux-input" value="${this.state.from}">
            <span>～</span>
            <input type="date" id="manage-to" class="flux-input" value="${this.state.to}">
          </div>
          
          <div class="flux-manage-group">
            <button class="flux-btn flux-btn-secondary btn-set-range" data-range="nextMonth">翌月</button>
            <button class="flux-btn flux-btn-secondary btn-set-range" data-range="koshu">講習</button>
          </div>
        </div>

        <div class="flux-manage-actions-row">
          <button class="flux-btn flux-btn-primary btn-check" data-type="text">
            <i class="fa-solid fa-book"></i> テキスト配布CH
          </button>
          <button class="flux-btn flux-btn-primary btn-check" data-type="open">
            <i class="fa-solid fa-door-open"></i> 開校CH
          </button>
          <button class="flux-btn flux-btn-primary btn-check" data-type="schedule">
            <i class="fa-solid fa-calendar-check"></i> 講習SJ入力CH
          </button>
          <button class="flux-btn flux-btn-primary btn-check" data-type="interview">
            <i class="fa-solid fa-comments"></i> 面談過去対応CH
          </button>
        </div>

        <div class="flux-manage-results">
          ${results.length > 0 ? resultsHtml : '<div class="flux-empty-state">チェックを実行してください</div>'}
        </div>
      </div>
    `;

    // --- イベントリスナ ---

    // 日付変更の保存
    this.root.querySelector('#manage-from').addEventListener('change', e => (this.state.from = e.target.value));
    this.root.querySelector('#manage-to').addEventListener('change', e => (this.state.to = e.target.value));

    // 期間セットボタン
    this.root.querySelectorAll('.btn-set-range').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.range;
        const now = new Date();
        if (type === 'nextMonth') {
          // 翌月1日〜翌月末
          const nextM = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          const nextMEnd = new Date(now.getFullYear(), now.getMonth() + 2, 0);
          this.state.from = this.formatDate(nextM);
          this.state.to = this.formatDate(nextMEnd);
        } else if (type === 'koshu') {
          // NX.VAR.koshu_kikan がある前提だが、なければ仮でセット
          if (typeof NX !== 'undefined' && NX.VAR && NX.VAR.koshu_kikan) {
            this.state.from = NX.VAR.koshu_kikan['開始'].replace(/\//g, '-');
            this.state.to = NX.VAR.koshu_kikan['終了'].replace(/\//g, '-');
          } else {
            alert('講習期間データが見つかりません');
          }
        }
        // UI更新
        this.root.querySelector('#manage-from').value = this.state.from;
        this.root.querySelector('#manage-to').value = this.state.to;
      });
    });

    // チェック実行ボタン
    this.root.querySelectorAll('.btn-check').forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        // 面談の場合は年度入力が必要なため簡易プロンプト
        let params = { from: this.state.from.replace(/-/g, '/'), to: this.state.to.replace(/-/g, '/') };

        if (type === 'interview') {
          const nendo = prompt('年度を入力してください (例: 2025)', new Date().getFullYear());
          if (!nendo) return;
          const season = prompt('季節コードを入力してください (春:1, 夏:2, 冬:3)', '2');
          if (!season) return;
          params.nendo = nendo;
          params.season = season;
        }

        // 実行中はローディング表示っぽくする
        this.root.querySelector('.flux-manage-results').innerHTML =
          '<div class="flux-loading"><i class="fa-solid fa-spinner fa-spin"></i> Checking...</div>';

        this.core.dispatch(DashboardActions.runManagementCheck, { type, params });
      });
    });
  }


*/
