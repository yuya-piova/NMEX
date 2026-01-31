// flux/widgets/pages/AsCoachPageWidget.js

import { Widget } from '../../core/Widget.js';
import { DashboardActions } from '../../actions/DashboardAction.js';

export class AsCoachPageWidget extends Widget {
  render(state) {
    const data = state.asCoach || { waiting: [], going: [], gone: [] };

    this.root.innerHTML = `
      <div class="flux-page-header">
        <h2 class="flux-page-title"><i class="fa-solid fa-user-clock"></i> AsCoach</h2>
        <div class="flux-page-actions">
          <button class="flux-btn flux-btn-secondary" id="btn-reload-coach"><i class="fa-solid fa-rotate"></i> 更新</button>
        </div>
      </div>
      
      <div class="flux-coach-grid">
        <div class="flux-coach-column">
          <div class="flux-coach-header header-waiting">
            来校前 <span class="badge">${data.waiting.length}</span>
          </div>
          <div class="flux-coach-list">
            ${this.createList(data.waiting)}
          </div>
        </div>

        <div class="flux-coach-column">
          <div class="flux-coach-header header-going">
            在室 <span class="badge">${data.going.length}</span>
          </div>
          <div class="flux-coach-list">
             ${this.createList(data.going)}
          </div>
        </div>

        <div class="flux-coach-column">
          <div class="flux-coach-header header-gone">
            帰宅 <span class="badge">${data.gone.length}</span>
          </div>
          <div class="flux-coach-list">
             ${this.createList(data.gone)}
          </div>
        </div>
      </div>
    `;

    // 更新イベント
    this.root.querySelector('#btn-reload-coach')?.addEventListener('click', () => {
      this.core.dispatch(DashboardActions.fetchAsCoachData);
    });
  }

  createList(items) {
    if (!items || items.length === 0) return '<div class="flux-empty-state">なし</div>';

    return items
      .map(item => {
        // アイコン生成
        const icons = [];
        if (item.hasFurikae) icons.push('<i class="fa-solid fa-mug-hot flux-icon-orange" title="振替有"></i>');
        if (item.hasContact) icons.push('<i class="fa-solid fa-envelope flux-icon-blue" title="連絡有"></i>');
        if (item.hasTask) icons.push('<i class="fa-solid fa-square-check flux-icon-green" title="タスク有"></i>');

        // リンク生成
        const link = item.student_cd ? `${NX.CONST.host}/s/student_renraku_list.aspx?student_cd=${item.student_cd}` : '#';

        return `
        <div class="flux-coach-card">
          <div class="flux-coach-row">
            <span class="shop-badge">${item.shopName}</span>
            <span class="time-badge">${item.lect_time}</span>
          </div>
          <div class="flux-coach-row main">
            <a href="${link}" target="_blank" class="student-name">${item.student_nm}</a>
            <div class="student-icons">${icons.join('')}</div>
          </div>
        </div>
      `;
      })
      .join('');
  }
}
