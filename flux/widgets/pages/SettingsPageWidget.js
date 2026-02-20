// flux/widgets/pages/SettingsPageWidget.js

import { Widget } from '../../core/Widget.js';

export class SettingsPageWidget extends Widget {
  render(state) {
    this.root.innerHTML = `
      <div class="flux-page-header">
        <h2 class="flux-page-title"><i class="fa-solid fa-gear"></i> Settings</h2>
        <div class="flux-page-actions">
           <button class="flux-btn flux-btn-secondary" id="btn-settings-reload"><i class="fa-solid fa-rotate"></i> 更新</button>
        </div>
      </div>

      <div class="flux-table-container flux-manage-container" style="padding: 15px;">
        <table class="flux-table-full">
          <thead>
            <tr>
              <th style="width: 200px;">Key</th>
              <th>Value</th>
              <th style="width: 80px;">Delete</th>
            </tr>
          </thead>
          <tbody id="flux-settings-tbody">
            </tbody>
        </table>
      </div>
    `;

    this.refreshTable();

    // イベントリスナ
    this.root.querySelector('#btn-settings-reload').addEventListener('click', () => {
      this.refreshTable();
    });

    // 動的要素へのイベント委譲
    const tbody = this.root.querySelector('#flux-settings-tbody');

    tbody.addEventListener('input', e => {
      if (e.target.classList.contains('myprofile-input')) {
        const $input = e.target;
        const key = $input.dataset.key;
        let val = null;

        if ($input.type === 'checkbox') {
          val = $input.checked ? '1' : '0';
        } else {
          val = $input.value;
        }

        if (typeof myprofiles !== 'undefined') {
          const data = {};
          data[key] = val;
          myprofiles.save(data);
        }
      }
    });

    tbody.addEventListener('click', e => {
      const btn = e.target.closest('.action-delete');
      if (btn) {
        const key = btn.dataset.key;
        if (confirm(`キー「${key}」を削除しますか？`)) {
          if (typeof myprofiles !== 'undefined') {
            myprofiles.delete(key);
            this.refreshTable();
          }
        }
      }
    });
  }

  refreshTable() {
    const tbody = this.root.querySelector('#flux-settings-tbody');
    if (!tbody || typeof myprofiles === 'undefined') return;

    tbody.innerHTML = '';
    const myProfile = myprofiles.getall();

    Object.keys(myProfile)
      .sort()
      .forEach(key => {
        const val = myProfile[key];
        const isSwitch = key.startsWith('is') || key.startsWith('show');

        let inputHtml = '';
        if (isSwitch) {
          inputHtml = `<input type="checkbox" class="myprofile-input" data-key="${key}" ${
            val == '1' ? 'checked' : ''
          } style="transform: scale(1.5); margin-left: 5px;">`;
        } else {
          inputHtml = `<input type="text" class="flux-input myprofile-input" data-key="${key}" value="${val}" style="width: 100%; max-width: 400px;">`;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = `
        <td class="flux-cell-head">${key}</td>
        <td>${inputHtml}</td>
        <td class="flux-cell-action">
          <button class="flux-btn-icon action-delete flux-text-danger" data-key="${key}" title="削除">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </td>
      `;
        tbody.appendChild(tr);
      });
  }
}
