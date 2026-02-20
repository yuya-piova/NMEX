// flux/widgets/features/MiscStatsWidget.js

import { Widget } from '../../core/Widget.js';
import { DashboardActions } from '../../actions/DashboardAction.js';

export class MiscStatsWidget extends Widget {
  render(state) {
    const stats = state.miscStats || { data: [], updatedAt: '-' };
    const listHtml = stats.data
      .map(
        item => `
      <div class="flux-unit-row">
        <div class="flux-unit-info">
          <div class="flux-unit-name">${item.label}</div>
        </div>
        <div class="flux-unit-actions">
          <span style="font-weight:bold; font-size:1.1rem;">${item.value}</span>
        </div>
      </div>
    `
      )
      .join('');

    this.root.innerHTML = `
      <div class="flux-card">
        <div class="flux-card-header">
          <h3><i class="fa-solid fa-clipboard-list"></i> Lectures</h3>
          <div class="flux-header-actions">
            <button class="flux-btn-icon" id="btn-misc-reload" title="更新"><i class="fa-solid fa-rotate"></i></button>
          </div>
        </div>
        <div class="flux-card-body">
          <div class="flux-unit-list">
            ${listHtml || '<div class="flux-empty-state">データなし</div>'}
          </div>
        </div>
        <div style="padding:5px 15px; font-size:0.8rem; color:#ccc; text-align:right;">
          Updated: ${stats.updatedAt}
        </div>
      </div>
    `;

    // 更新ボタン
    this.root.querySelector('#btn-misc-reload').addEventListener('click', () => {
      this.core.dispatch(DashboardActions.fetchMiscStats, true);
    });
  }
}
