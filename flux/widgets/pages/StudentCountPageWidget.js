// flux/widgets/pages/StudentCountPageWidget.js

import { Widget } from '../../core/Widget.js';
import { DashboardActions } from '../../actions/DashboardAction.js';

export class StudentCountPageWidget extends Widget {
  constructor(core) {
    super(core);
    // デフォルト年度の算出
    const d = new Date();
    const currentYear = d.getMonth() < 3 ? d.getFullYear() - 1 : d.getFullYear();

    this.state = {
      year: currentYear,
      baseCd: 'a5031',
      subject: 'nonCandidate' // 初期値
    };
  }

  render(globalState) {
    const studentData = globalState.studentCounts || { updatedAt: '-' };

    // 年度選択肢の生成
    const yearOptions = this.createYearOptions(this.state.year);

    this.root.innerHTML = `
      <div class="flux-page-header">
        <h2 class="flux-page-title"><i class="fa-solid fa-users"></i> Student Count</h2>
        <div class="flux-page-actions">
           <span style="font-size:0.8rem; color:#666; margin-right:10px;">Last Update: ${studentData.updatedAt}</span>
           <button class="flux-btn flux-btn-primary" id="btn-student-reload"><i class="fa-solid fa-rotate"></i> 更新</button>
        </div>
      </div>

      <div class="flux-manage-container">
        <div class="flux-manage-controls">
           <div class="flux-manage-group">
             <label>対象年度</label>
             <select id="student-year" class="flux-input">
               ${yearOptions}
             </select>
             <span>年度</span>
           </div>
           
           <div class="flux-manage-group">
             <label>ブロックCD</label>
             <input type="text" id="student-base" class="flux-input" value="${this.state.baseCd}" style="width: 80px;">
           </div>
           
           <div class="flux-manage-group">
             <label>科目</label>
             <select id="student-subject" class="flux-input">
               <option value="nonCandidate" ${this.state.subject === 'nonCandidate' ? 'selected' : ''}>nonCandidate</option>
               <option value="candidate" ${this.state.subject === 'candidate' ? 'selected' : ''}>candidate</option>
             </select>
           </div>
        </div>

        <div class="flux-table-container" style="flex:1; overflow:auto; margin-top:10px;">
          <table class="flux-table-full flux-table-sales">
            <thead>
              <tr>
                <th>データ取得待ち</th>
              </tr>
            </thead>
            <tbody>
              <tr><td class="flux-empty-state">「更新」ボタンを押してデータを取得してください</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    `;

    // イベントリスナ
    this.root.querySelector('#student-year').addEventListener('change', e => (this.state.year = e.target.value));
    this.root.querySelector('#student-base').addEventListener('change', e => (this.state.baseCd = e.target.value));
    this.root.querySelector('#student-subject').addEventListener('change', e => (this.state.subject = e.target.value));

    this.root.querySelector('#btn-student-reload').addEventListener('click', () => {
      this.core.dispatch(DashboardActions.fetchStudentCounts, {
        year: this.state.year,
        baseCd: this.state.baseCd,
        subject: this.state.subject,
        force: true
      });
    });
  }

  createYearOptions(current) {
    const opts = [];
    const now = new Date().getFullYear();
    for (let y = now - 1; y <= now + 2; y++) {
      opts.push(`<option value="${y}" ${y == current ? 'selected' : ''}>${y}</option>`);
    }
    return opts.join('');
  }
}
