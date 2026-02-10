// flux/widgets/features/StatsWidget.js

import { Widget } from '../../core/Widget.js';
import { DashboardActions } from '../../actions/DashboardAction.js';

export class StatsWidget extends Widget {
  render(state) {
    // ★重要: このWidget自体（親のdiv）にクラスを付与して、横幅いっぱいに広げる
    this.root.classList.add('flux-widget-full');

    const contracts = state.contractCount !== undefined ? state.contractCount : '-';
    const trials = state.trialCount !== undefined ? state.trialCount : '-';
    const cancels = state.cancelCount !== undefined ? state.cancelCount : '-';

    // StateからURLを取得 (未取得時は #)
    const contractUrl = state.contractUrl || '#';
    const trialUrl = state.trialUrl || '#';
    const cancelUrl = state.cancelUrl || '#';

    this.root.innerHTML = `
      <div class="flux-stats-row">
        <div class="flux-stat-card">
          <div class="stat-header">
            <div class="stat-label">
                <span class="stat-icon"><i class="fa-solid fa-file-contract"></i></span>
                <span class="stat-title">Contract</span>
            </div>
            <a href="${contractUrl}" target="_blank" class="flux-btn-icon mini" title="詳細ページへ">
                <i class="fa-solid fa-up-right-from-square"></i>
            </a>
          </div>
          <div class="stat-body">
            <span class="stat-value">${contracts}</span>
            <span class="stat-unit">件</span>
          </div>
          <div class="stat-footer">
            <button class="flux-btn-icon reload-btn" data-type="contract" title="更新"><i class="fa-solid fa-rotate"></i></button>
          </div>
        </div>

        <div class="flux-stat-card">
          <div class="stat-header">
            <div class="stat-label">
                <span class="stat-icon icon-info"><i class="fa-solid fa-handshake"></i></span>
                <span class="stat-title">Trial</span>
            </div>
            <a href="${trialUrl}" target="_blank" class="flux-btn-icon mini" title="詳細ページへ">
                <i class="fa-solid fa-up-right-from-square"></i>
            </a>
          </div>
          <div class="stat-body">
            <span class="stat-value">${trials}</span>
            <span class="stat-unit">件</span>
          </div>
          <div class="stat-footer">
            <button class="flux-btn-icon reload-btn" data-type="trial" title="更新"><i class="fa-solid fa-rotate"></i></button>
          </div>
        </div>

        <div class="flux-stat-card">
          <div class="stat-header">
            <div class="stat-label">
                <span class="stat-icon icon-danger"><i class="fa-solid fa-user-xmark"></i></span>
                <span class="stat-title">Rescission</span>
            </div>
            <a href="${cancelUrl}" target="_blank" class="flux-btn-icon mini" title="詳細ページへ">
                <i class="fa-solid fa-up-right-from-square"></i>
            </a>
          </div>
          <div class="stat-body">
            <span class="stat-value flux-text-danger">${cancels}</span>
            <span class="stat-unit">件</span>
          </div>
          <div class="stat-footer">
            <button class="flux-btn-icon reload-btn" data-type="cancel" title="更新"><i class="fa-solid fa-rotate"></i></button>
          </div>
        </div>
      </div>
    `;

    // 更新ボタンイベント
    this.root.querySelectorAll('.reload-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const type = e.currentTarget.dataset.type;
        const icon = e.currentTarget.querySelector('i');
        icon.classList.add('fa-spin'); // 回転アニメーション

        if (type === 'contract') {
          this.core.dispatch(DashboardActions.fetchContracts);
        } else if (type === 'trial') {
          this.core.dispatch(DashboardActions.fetchTrials);
        } else {
          this.core.dispatch(DashboardActions.fetchCancels);
        }
      });
    });
  }
}
