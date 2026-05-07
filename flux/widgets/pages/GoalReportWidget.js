// flux/widgets/pages/GoalReportWidget.js

import { Widget } from '../../core/Widget.js';
import { DashboardActions } from '../../actions/DashboardAction.js';

export class GoalReportWidget extends Widget {
  constructor(core) {
    super(core);
    // 初期設定
    this.state = {
      targetYm: new ExDate().as('yyyy/mm')
    };
  }

  render(globalState) {
    const goalData = globalState.goalData || { resultsNXT: new NXTable(NX.GOAL.myblockNXT), updatedAt: '-' };
    const resultsNXT = goalData.resultsNXT || new NXTable(NX.GOAL.myblockNXT);
    const rows = resultsNXT.toObjectArray();

    const totalContract = rows.reduce((sum, r) => sum + (parseInt(r['契約']) || 0), 0);
    const totalCancel = rows.reduce((sum, r) => sum + (parseInt(r['解約']) || 0), 0) * -1;
    const totalCaeses = rows.reduce((sum, r) => sum + (parseInt(r['案件数']) || 0), 0);
    const totalStundents = rows.reduce((sum, r) => sum + (parseInt(r['生徒数']) || 0), 0);
    const totalTeacher = rows.reduce((sum, r) => sum + (parseInt(r['講師数']) || 0), 0);
    const totalTeacherRegister = rows.reduce((sum, r) => sum + (parseInt(r['講師登録数']) || 0), 0);

    const trHtml = rows
      .map(row => {
        return `
        <tr>
          <td class="flux-cell-head">${row['教室']}</td>
          <td class="text-right">${row['契約'] || 0}</td>
          <td class="text-right">${row['解約'] * -1 || 0}</td>
          <td class="text-right">${row['案件数'] || 0}</td>
          <td class="text-right">${row['生徒数'] || 0}</td>
          <td class="text-right">${row['講師数'] || 0}</td>
          <td class="text-right">${row['講師登録数'] || 0}</td>
        </tr>
      `;
      })
      .join('');

    this.root.innerHTML = `
      <div class="flux-page-header">
        <h2 class="flux-page-title"><i class="fa-solid fa-flag-checkered"></i> Goal Report</h2>
        <div class="flux-page-actions">
           <span style="font-size:0.8rem; color:#666; margin-right:10px;">Last Update: ${goalData.updatedAt}</span>
           <button class="flux-btn flux-btn-primary" id="btn-goal-report-reload"><i class="fa-solid fa-rotate"></i> 更新</button>
        </div>
      </div>

      <div class="flux-manage-container">
        <div class="flux-manage-controls">
           <div class="flux-manage-group">
             <label>対象年月</label>
             <input type="text" id="goal-report-ym" class="flux-input" value="${this.state.targetYm}" style="width: 100px;">
           </div>
        </div>

        <div class="flux-table-container" style="flex:1; overflow:auto; margin-top:10px;">
          <table class="flux-table-full dblcopytable"> <!-- flux-table-sales -->
            <thead>
              <tr>
                <th style="width: 200px;">教室</th>
                <th>契約</th>
                <th>解約</th>
                <th>案件数</th>
                <th>生徒数</th>
                <th>講師数</th>
                <th style="width: 120px;">講師登録数</th>
                <th style="width:auto;"> </th>
              </tr>
            </thead>
            <tbody>
              ${rows.length > 0 ? trHtml : '<tr><td colspan="5" class="flux-empty-state">データを取得してください</td></tr>'}
            </tbody>
            <tfoot>
               <tr style="background:#f0f8ff; font-weight:bold;">
                 <td colspan="1" class="flux-cell-head">合計</td>
                 <td class="text-right">${totalContract.toLocaleString()}</td>
                 <td class="text-right">${totalCancel.toLocaleString()}</td>
                 <td class="text-right">${totalCaeses.toLocaleString()}</td>
                 <td class="text-right">${totalStundents.toLocaleString()}</td>
                 <td class="text-right">${totalTeacher.toLocaleString()}</td>
                 <td class="text-right">${totalTeacherRegister.toLocaleString()}</td>
                 <td style="width:auto;"></td>
               </tr>
            </tfoot>
          </table>
        </div>
      </div>
    `;

    // イベントリスナ
    this.root.querySelector('#goal-report-ym').addEventListener('change', e => (this.state.targetYm = e.target.value));

    this.root.querySelector('#btn-goal-report-reload').addEventListener('click', () => {
      this.core.dispatch(DashboardActions.fetchGoalData, {
        ym: this.state.targetYm,
        force: true
      });
    });
  }
}
