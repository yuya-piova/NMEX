// core/components/ConsoleBot.js

export default class ConsoleBot {
  static instance = null;

  constructor() {
    // シングルトン: 何度 new されても同じインスタンスを返す
    if (ConsoleBot.instance) return ConsoleBot.instance;

    this.initUI();
    ConsoleBot.instance = this;
  }

  initUI() {
    this.$wrapper = $(`
      <div id="nx-console-bot" style="
        position: fixed; bottom: 20px; right: 20px; width: 340px;
        background: #fff; border: 1px solid #ccc; border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000;
        display: none; flex-direction: column; font-family: sans-serif; font-size: 13px;
      ">
        <div style="background: #343a40; color: white; padding: 10px; border-radius: 8px 8px 0 0; display: flex; justify-content: space-between; align-items: center; cursor: move;" class="cb-header">
          <span style="font-weight: bold;"><i class="fa-solid fa-terminal" style="margin-right:5px;"></i>NX Console</span>
          <div>
            <i class="fa-solid fa-eraser cb-clear" style="cursor: pointer; margin-right: 10px;" title="クリア"></i>
            <i class="fa-solid fa-xmark cb-close" style="cursor: pointer;" title="閉じる"></i>
          </div>
        </div>
        <div class="cb-body" style="padding: 10px; max-height: 400px; overflow-y: auto; background: #f4f6f9; display: flex; flex-direction: column; gap: 10px;">
        </div>
      </div>
    `).appendTo('body');

    this.$body = this.$wrapper.find('.cb-body');

    // イベントバインディング
    this.$wrapper.find('.cb-close').on('click', () => this.hide());
    this.$wrapper.find('.cb-clear').on('click', () => this.clear());

    // オプション: jQuery UI があればドラッグ可能にする
    if (typeof $.fn.draggable === 'function') {
      this.$wrapper.draggable({ handle: '.cb-header' });
    }
  }

  show() {
    this.$wrapper.css('display', 'flex'); // flexで表示
  }

  hide() {
    this.$wrapper.hide();
  }

  clear() {
    this.$body.empty();
  }

  /**
   * メッセージを吹き出し風に出力
   * @param {string} text
   */
  print(text) {
    const $msg = $(`
      <div style="background: white; border: 1px solid #e0e0e0; padding: 10px; border-radius: 6px; white-space: pre-wrap; word-break: break-all; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
        ${this._escapeHtml(text)}
      </div>
    `);
    this.$body.append($msg);
    this._scrollToBottom();
    this.show();
    return $msg; // 追加した要素を返す（後からボタンを追加するため）
  }

  /**
   * アクションボタンを追加
   * @param {string} label - ボタンのテキスト
   * @param {Function} onClick - クリック時の処理
   * @param {jQuery} [$target] - 追加先の親要素（省略時は一番下に追加）
   */
  addButton(label, onClick, $target = null) {
    const $btn = $(`
      <button style="
        margin-top: 5px; padding: 6px 12px; background: #007bff; color: white;
        border: none; border-radius: 4px; cursor: pointer; align-self: flex-start; font-size: 12px;
      ">${label}</button>
    `);

    $btn.on('click', () => onClick());

    if ($target) {
      $target.append($btn);
    } else {
      this.$body.append($btn);
    }

    this._scrollToBottom();
    this.show();
  }

  _scrollToBottom() {
    this.$body.scrollTop(this.$body.prop('scrollHeight'));
  }

  _escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
