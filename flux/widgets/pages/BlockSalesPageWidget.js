import { Widget } from '../../core/Widget.js';
import { DashboardActions } from '../../actions/DashboardAction.js';

export class BlockSalesPageWidget extends Widget {
  constructor(core) {
    super(core);
    // 今日の日付からデフォルト年度を決定 (1~3月なら前年が年度)
    const d = new Date();
    const currentYear = d.getMonth() < 3 ? d.getFullYear() - 1 : d.getFullYear();

    this.state = {
      year: currentYear,
      baseCd: 'a5031' // デフォルト: 広島(中四国)
    };
  }

  render(globalState) {
    const salesInfo = globalState.blockSales || { data: [], year: this.state.year, updatedAt: '-' };
    const data = salesInfo.data || [];

    // 表示用月リスト (4月～3月)
    const monthLabels = [];
    for (let m = 4; m <= 12; m++) monthLabels.push(`${m}月`);
    for (let m = 1; m <= 3; m++) monthLabels.push(`${m}月`);

    // テーブルヘッダー生成
    const thHtml = monthLabels.map(m => `<th>${m}</th>`).join('');

    // テーブルボディ生成
    const trHtml = data
      .map(row => {
        // 科目名
        let html = `<tr><td class="flux-cell-head">${row.category}</td>`;
        // 各月の値
        html += monthLabels
          .map(m => {
            const val = row[m] !== undefined ? row[m].toLocaleString() : '-';
            return `<td class="text-right">${val}</td>`;
          })
          .join('');
        // 合計列
        html += `<td class="flux-cell-total text-right">${row.total.toLocaleString()}</td></tr>`;
        return html;
      })
      .join('');

    this.root.innerHTML = `
      <div class="flux-page-header">
        <h2 class="flux-page-title"><i class="fa-solid fa-chart-simple"></i> Block Sales</h2>
        <div class="flux-page-actions">
           <span style="font-size:0.8rem; color:#666; margin-right:10px;">Last Update: ${salesInfo.updatedAt}</span>
           <button class="flux-btn flux-btn-primary" id="btn-sales-reload"><i class="fa-solid fa-rotate"></i> 更新</button>
        </div>
      </div>

      <div class="flux-manage-container">
        <div class="flux-manage-controls">
           <div class="flux-manage-group">
             <label>対象年度</label>
             <select id="sales-year" class="flux-input">
               ${this.createYearOptions(this.state.year)}
             </select>
             <span>年度</span>
           </div>
           <div class="flux-manage-group">
             <label>ブロックCD</label>
             <input type="text" id="sales-base" class="flux-input" value="${this.state.baseCd}" style="width: 80px;">
           </div>
        </div>

        <div class="flux-table-container" style="flex:1; overflow:auto; margin-top:10px;">
          <table class="flux-table-full flux-table-sales dblcopytable">
            <thead>
              <tr>
                <th style="min-width:120px;">科目</th>
                ${thHtml}
                <th style="min-width:80px; background:#f0f8ff;">合計</th>
              </tr>
            </thead>
            <tbody>
              ${
                data.length > 0
                  ? trHtml
                  : '<tr><td colspan="14" class="flux-empty-state">データがありません。[更新]ボタンを押してください。</td></tr>'
              }
            </tbody>
          </table>
        </div>
      </div>
    `;

    // イベントリスナ
    this.root.querySelector('#sales-year').addEventListener('change', e => {
      this.state.year = e.target.value;
    });
    this.root.querySelector('#sales-base').addEventListener('change', e => {
      this.state.baseCd = e.target.value;
    });

    this.root.querySelector('#btn-sales-reload').addEventListener('click', () => {
      this.core.dispatch(DashboardActions.fetchBlockSales, {
        year: this.state.year,
        baseCd: this.state.baseCd,
        force: true
      });
    });
  }

  createYearOptions(current) {
    const opts = [];
    const now = new Date().getFullYear();
    for (let y = now - 2; y <= now + 1; y++) {
      opts.push(`<option value="${y}" ${y == current ? 'selected' : ''}>${y}</option>`);
    }
    return opts.join('');
  }
}
