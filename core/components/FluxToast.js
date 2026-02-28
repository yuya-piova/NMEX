// core/components/FluxToast.js

export default class FluxToast {
  constructor() {
    this.containerId = 'flux-toast-container';
  }

  /**
   * コンテナが存在するか確認し、なければ生成する（自己修復機能）
   */
  _ensureContainer() {
    let $container = $(`#${this.containerId}`);

    // コンテナが存在しなければbodyに作る（削除された場合も含む）
    if ($container.length === 0) {
      $container = $('<div>', { id: this.containerId })
        .css({
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          pointerEvents: 'none'
        })
        .appendTo('body');
    }
    return $container;
  }

  /**
   * トースト通知を表示する内部メソッド
   */
  show(message, type = 'info', duration = 3000) {
    // 1. コンテナを取得（消えていれば復活させる）
    const $container = this._ensureContainer();

    // 2. タイプに応じたテーマカラーとアイコンを設定
    let themeColor = 'var(--flux-primary)';
    let icon = 'ℹ️';

    if (type === 'success') {
      themeColor = 'var(--flux-success)';
      icon = '✅';
    } else if (type === 'danger') {
      themeColor = 'var(--flux-danger)';
      icon = '❌';
    } else if (type === 'warning') {
      themeColor = 'var(--flux-warning)';
      icon = '⚠️';
    }

    // 3. トースト要素の作成
    const $toast = $('<div>', {
      class: 'flux-card flux-p-3 flux-flex flux-flex-row flux-items-center flux-gap-2'
    }).css({
      borderTop: 'none',
      borderLeft: `4px solid ${themeColor}`,
      minWidth: '250px',
      pointerEvents: 'auto',
      boxShadow: 'var(--flux-shadow-md)',
      opacity: 0,
      transform: 'translateX(100%)',
      transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)'
    });

    const $icon = $('<span>').text(icon);
    const $text = $('<span>', { class: 'flux-text-base flux-text-main flux-font-bold' }).text(message);

    $toast.append($icon, $text);

    // コンテナに追加
    $container.append($toast);

    // 4. アニメーションでスライドイン
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        $toast.css({ opacity: 1, transform: 'translateX(0)' });
      });
    });

    // 5. 指定時間後にフェードアウトして削除
    setTimeout(() => {
      $toast.css({ opacity: 0, transform: 'translateX(100%)' });
      setTimeout(() => $toast.remove(), 300);
    }, duration);
  }

  success(msg, duration) {
    this.show(msg, 'success', duration);
  }
  error(msg, duration) {
    this.show(msg, 'danger', duration);
  }
  warning(msg, duration) {
    this.show(msg, 'warning', duration);
  }
  info(msg, duration) {
    this.show(msg, 'info', duration);
  }
}

export const toast = new FluxToast();
