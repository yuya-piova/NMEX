// flux/widgets/features/NotificationWidget.js

import { Widget } from '../../core/Widget.js';

export class NotificationWidget extends Widget {
  render(state) {
    const notifications = state.notifications || [];

    // コンテナ初期化
    this.root.innerHTML = '';
    this.root.className = 'flux-notify-container';

    if (notifications.length === 0) {
      return; // 通知がなければ何も表示しない
    }

    notifications.forEach(note => {
      const item = document.createElement('a');
      item.className = `flux-notify-item ${note.type || 'info'}`;
      item.href = note.url || '#';
      item.target = '_blank';
      item.title = note.label;

      // アイコン
      item.innerHTML = `<i class="${note.icon}"></i>`;

      // バッジ (countがある場合のみ)
      if (note.count) {
        const badge = document.createElement('span');
        badge.className = 'flux-notify-badge';
        badge.textContent = note.count > 99 ? '99+' : note.count;
        item.appendChild(badge);
      }

      this.root.appendChild(item);
    });
  }
}
