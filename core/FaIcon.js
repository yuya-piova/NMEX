/**
 * FaIcon ver 2.0
 * FontAwesomeアイコン生成クラス
 * 依存: なし (toJQuery() を使う場合のみ jQuery が必要)
 */
class FaIcon {
  /**
   * @param {Object} options
   * @param {string} [options.name] - アイコンクラス名 (例: 'fa-solid fa-check')。旧仕様互換用。
   * @param {string} [options.icon] - nameのエイリアス (推奨)。
   * @param {string} [options.color] - アイコンの色 (例: '#ff0000', 'red')。
   * @param {string} [options.size] - フォントサイズ (例: '1.2rem', '16px')。
   * @param {string} [options.title] - ツールチップとして表示するテキスト。
   * @param {Function} [options.click] - クリック時の動作。
   * @param {Function} [options.onClick] - 旧仕様互換用。
   * @param {boolean} [options.wrapper=false] - spanタグでラップするかどうか。
   * @param {string} [options.addClass] - 追加するクラス名。
   * @param {Object} [options.style] - 追加のCSSスタイルオブジェクト。
   * @param {Object} [options.attrs] - 追加のHTML属性オブジェクト。
   */
  constructor(options = {}) {
    // パラメータの正規化（新旧の揺らぎを吸収）
    this.config = {
      icon: options.icon || options.name || 'fa-solid fa-star',
      color: options.color || null,
      size: options.size || null,
      title: options.title || null,
      click: options.click || options.onClick || null,
      class: options.addClass || options.class || '',
      style: options.style || {},
      attrs: options.attrs || options.attr || {},
      wrapper: options.wrapper || false
    };

    this.element = this._build();
  }

  /**
   * DOM要素を生成（jQuery非依存で高速化）
   * @private
   */
  _build() {
    const i = document.createElement('i');

    // クラス設定
    const classList = [this.config.icon, this.config.class].filter(Boolean).join(' ');
    i.className = classList;

    // 基本スタイル設定
    if (this.config.color) i.style.color = this.config.color;
    if (this.config.size) i.style.fontSize = this.config.size;
    if (this.config.click) i.style.cursor = 'pointer'; // クリック可能なら指カーソルに

    // 追加スタイル適用
    Object.entries(this.config.style).forEach(([k, v]) => (i.style[k] = v));

    // 属性設定 (title属性で簡易ツールチップ)
    if (this.config.title) i.title = this.config.title;
    Object.entries(this.config.attrs).forEach(([k, v]) => i.setAttribute(k, v));

    // イベント設定
    if (this.config.click) {
      i.addEventListener('click', e => {
        // jQueryのイベントハンドラ互換のためにthisをelementにする配慮
        this.config.click.call(this.element, e);
      });
    }

    // ラッパーが必要な場合 (レイアウト調整用)
    if (this.config.wrapper) {
      const span = document.createElement('span');
      span.className = 'fa-icon-wrap';
      span.appendChild(i);
      // ラッパー側にもイベントを伝播させたい場合などはここに記述
      return span;
    }

    return i;
  }

  /**
   * 生のDOM要素を取得（推奨）
   * @returns {HTMLElement}
   */
  get() {
    return this.element;
  }

  /**
   * jQueryオブジェクトとして取得（旧コードとの互換用）
   * @returns {jQuery}
   */
  toJQuery() {
    if (typeof jQuery === 'undefined') {
      console.warn('FaIcon: jQuery not found. Returning raw DOM.');
      return this.element;
    }
    return $(this.element);
  }

  // --- 旧互換用メソッド ---

  getNode() {
    return this.toJQuery();
  }

  getHtml() {
    return this.element.outerHTML;
  }
}
