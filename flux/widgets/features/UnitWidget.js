import { Widget } from '../../core/Widget.js';
import { DashboardActions } from '../../actions/DashboardAction.js';

export class UnitWidget extends Widget {
  render(state) {
    const units = state.unitStatus || [];

    // HTML生成
    const listHtml = units
      .map(u => {
        let statusClass = 'flux-status-closed';
        if (u.status === 'OPEN') statusClass = 'flux-status-open';
        if (u.status === '開校前') statusClass = 'flux-status-pre';

        return `
        <div class="flux-unit-row">
          <div class="flux-unit-info">
             <span class="flux-unit-code">${u.code}</span>
             <span class="flux-unit-name">${u.name}</span>
          </div>
          
          <div class="flux-unit-actions">
            <a href="${u.openUrl}" target="_blank" class="flux-status-chip ${statusClass}">
               ${u.status} ${u.pcCheck === '○' ? '<i class="fa-solid fa-check"></i>' : ''}
            </a>

            ${
              u.boothUrl
                ? `
            <a href="${u.boothUrl}" target="_blank" class="flux-icon-link" title="座席表を開く">
               <i class="fa-solid fa-table"></i>
            </a>
            `
                : ''
            }
          </div>
        </div>
      `;
      })
      .join('');

    this.root.innerHTML = `
      <div class="flux-card">
        <div class="flux-card-header">
            <h3><i class="fa-solid fa-shop"></i> 担当教室状況</h3>
            <button class="flux-btn-icon reload-btn"><i class="fa-solid fa-rotate"></i></button>
        </div>
        <div class="flux-card-body">
            <div class="flux-unit-list">
                ${units.length > 0 ? listHtml : '<div style="padding:20px;text-align:center;color:#999;">Loading...</div>'}
            </div>
        </div>
      </div>
    `;

    // イベントリスナ
    this.root.querySelector('.reload-btn')?.addEventListener('click', () => {
      this.core.dispatch(DashboardActions.fetchUnitStatus);
    });
  }
}
