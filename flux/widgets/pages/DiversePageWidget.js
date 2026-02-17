// flux/widgets/pages/DiversePageWidget.js

import { Widget } from '../../core/Widget.js';
import { DashboardActions } from '../../actions/DashboardAction.js';

export class DiversePageWidget extends Widget {
  constructor(core) {
    super(core);
    // 初期設定 (2026/04固定とのことですが、変更可能なようにStateで管理)
    this.state = {
      targetYm: '2026/04'
    };
  }

  render(globalState) {
    const diverseData = globalState.diverseData || { url: '', rows: [], updatedAt: '-' };
    const rows = diverseData.rows || [];

    // 合計行の計算
    const totalExist = rows.reduce((sum, r) => sum + (parseInt(r.exist) || 0), 0);
    const totalService = rows.reduce((sum, r) => sum + (parseInt(r.service) || 0), 0);
    const totalGoal = rows.reduce((sum, r) => sum + (parseInt(r.goal) || 0), 0);
    const totalCurrent = rows.reduce((sum, r) => sum + (parseInt(r.current) || 0), 0);
    const totalDiff = totalCurrent - totalGoal;

    const trHtml = rows
      .map(row => {
        const diff = row.diff;
        const diffClass = diff < 0 ? 'flux-text-danger' : 'flux-text-success';
        const diffIcon = diff < 0 ? '<i class="fa-solid fa-caret-down"></i>' : diff > 0 ? '<i class="fa-solid fa-caret-up"></i>' : '';

        return `
        <tr>
          <td class="flux-cell-head">${row.baseName}</td>
          <td>${row.kind || ''}</td>
          <td class="text-right">${row.exist.toLocaleString()}</td>
          <td class="text-right">${row.service.toLocaleString()}</td>
          <td class="text-right">${row.goal.toLocaleString()}</td>
          <td class="text-right font-bold">${row.current.toLocaleString()}</td>
          <td class="text-right ${diffClass}">${diffIcon} ${diff > 0 ? '+' : ''}${diff.toLocaleString()}</td>
        </tr>
      `;
      })
      .join('');

    const listButton =
      diverseData.url != ''
        ? `<button class="flux-btn flux-btn-secondary" onclick='window.open("${diverseData.url}","_blank")'><i class="fa-solid fa-list"></i> 一覧</button>`
        : '';
    this.root.innerHTML = `
      <div class="flux-page-header">
        <h2 class="flux-page-title"><i class="fa-solid fa-graduation-cap"></i> Diverse</h2>
        <div class="flux-page-actions">
           <span style="font-size:0.8rem; color:#666; margin-right:10px;">Last Update: ${diverseData.updatedAt}</span>
           <button class="flux-btn flux-btn-primary" id="btn-diverse-reload"><i class="fa-solid fa-rotate"></i> 更新</button>
           ${listButton}
        </div>
      </div>

      <div class="flux-manage-container">
        <div class="flux-manage-controls">
           <div class="flux-manage-group">
             <label>対象年月</label>
             <input type="text" id="diverse-ym" class="flux-input" value="${this.state.targetYm}" style="width: 100px;">
           </div>
        </div>

        <div class="flux-table-container" style="flex:1; overflow:auto; margin-top:10px;">
          <table class="flux-table-full flux-table-sales dblcopytable">
            <thead>
              <tr>
                <th>校舎</th>
                <th>対面</th>
                <th>３月月謝</th>
                <th>３月サービス</th>
                <th>目標</th>
                <th>現状</th>
                <th>差異</th>
              </tr>
            </thead>
            <tbody>
              ${rows.length > 0 ? trHtml : '<tr><td colspan="6" class="flux-empty-state">データを取得してください</td></tr>'}
            </tbody>
            <tfoot>
               <tr style="background:#f0f8ff; font-weight:bold;">
                 <td colspan="2" class="flux-cell-head">合計</td>
                 <td class="text-right">${totalExist.toLocaleString()}</td>
                 <td class="text-right">${totalService.toLocaleString()}</td>
                 <td class="text-right">${totalGoal.toLocaleString()}</td>
                 <td class="text-right">${totalCurrent.toLocaleString()}</td>
                 <td class="text-right ${totalDiff < 0 ? 'flux-text-danger' : 'flux-text-success'}">
                    ${totalDiff > 0 ? '+' : ''}${totalDiff.toLocaleString()}
                 </td>
               </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;

    // イベントリスナ
    this.root.querySelector('#diverse-ym').addEventListener('change', e => (this.state.targetYm = e.target.value));

    this.root.querySelector('#btn-diverse-reload').addEventListener('click', () => {
      this.core.dispatch(DashboardActions.fetchDiverseData, {
        ym: this.state.targetYm,
        force: true
      });
    });
  }
}
