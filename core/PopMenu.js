/**
 * PopMenu ver 2.1
 * キーボードトリガーおよびフローティングボタンによるポップアップメニュー管理クラス
 * 依存: なし (getMousePosition があれば利用)
 */
class PopMenu {
  static instances = new Map();
  static activeMenuElement = null;

  /**
   * @param {Object} options
   * @param {string} options.id - メニューの一意識別子
   * @param {number} [options.keyCode=45] - 起動キー (デフォルト: Insert)
   * @param {boolean} [options.showFloatingButton=false] - タブレット用ボタンを表示する設定にするか
   * @param {Function} [options.onBeforeShow] - 表示直前に実行されるコールバック (動的追加用)
   */
  constructor({ id, keyCode = 45, showFloatingButton = false, onBeforeShow = null }) {
    if (PopMenu.instances.has(id)) return PopMenu.instances.get(id);

    this.id = id;
    this.keyCode = keyCode;

    // 設定がON、かつ 実際にタブレット端末である場合のみ true にする
    this.showFloatingButton = showFloatingButton && this._isTabletDevice();

    this.onBeforeShow = onBeforeShow;

    this.staticItems = [];
    this.dynamicItems = [];

    this._initEvents();

    // 判定結果が true の場合のみボタンを作成
    if (this.showFloatingButton) {
      this._createFloatingButton();
    }

    PopMenu.instances.set(id, this);
  }

  /**
   * 静的要素を追加する (初期化時などに使用)
   * @param {HTMLElement|jQuery|string} content
   * @param {Object} [options]
   * @param {string} [options.type='default'] - 'common', 'page', 'danger' など
   * @param {boolean} [options.autoClose=true]
   */
  append(content, options = {}) {
    const element = this._prepareElement(content, options);
    if (element) {
      this.staticItems.push(element);
    }
    return this;
  }

  /**
   * 配列データから静的要素を一括で追加する
   * @param {Array<Object|string>} configs
   */
  appendItems(configs) {
    configs.forEach(config => {
      if (config === '<hr>') {
        this.append('<hr>', { autoClose: false });
      } else {
        const btn = document.createElement('button');
        btn.textContent = config.text;
        this.append(btn, {
          type: config.type || 'default',
          handler: config.handler,
          autoClose: config.autoClose !== false
        });
      }
    });
    return this;
  }

  /**
   * 動的要素を追加する (表示直前などに使用)
   * @param {HTMLElement|jQuery|string} content
   * @param {Object} [options]
   */
  appendDynamic(content, options = {}) {
    const element = this._prepareElement(content, options);
    if (element) {
      this.dynamicItems.push(element);
    }
    return this;
  }

  /**
   * 動的要素をクリアする
   */
  clearDynamic() {
    this.dynamicItems = [];
  }

  /**
   * メニューを表示する
   * @param {number} x
   * @param {number} y
   */
  async show(x, y) {
    this.close();

    // 表示直前のフックがあれば実行 (非同期対応)
    if (typeof this.onBeforeShow === 'function') {
      await this.onBeforeShow(this);
    }

    const menu = document.createElement('div');
    menu.id = `popmenu-${this.id}`;
    menu.className = 'popmenu-container';
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;

    // 1. 静的アイテムの追加
    this.staticItems.forEach(item => {
      // DOM要素は移動してしまうためクローンしてイベントを再設定するか、
      // 毎回生成する必要がありますが、ここでは簡易的に既存要素を移動させます。
      // 複数回開閉する場合は、staticItemsには「生成関数」を持つか、都度appendChildし直す運用となります。
      menu.appendChild(item);
    });

    // 2. 動的アイテムがあれば区切り線と共に追加
    if (this.dynamicItems.length > 0) {
      // 静的アイテムがある場合のみ区切り線を入れる
      if (this.staticItems.length > 0) {
        const hr = document.createElement('hr');
        menu.appendChild(hr);
      }
      this.dynamicItems.forEach(item => menu.appendChild(item));
    }

    // 中身が空なら表示しない
    if (menu.children.length === 0) return;

    document.body.appendChild(menu);
    PopMenu.activeMenuElement = menu;

    // 画面外はみ出し防止
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = `${window.innerWidth - rect.width - 10}px`;
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = `${y - rect.height}px`;
    }
  }

  /**
   * メニューを閉じる
   */
  close() {
    if (PopMenu.activeMenuElement) {
      // staticItemsを退避させる処理が必要な場合は記述
      // (appendChildで移動しているため、閉じる際にメモリ上の配列には残っているがDOMからは消える)
      PopMenu.activeMenuElement.remove();
      PopMenu.activeMenuElement = null;
    }
  }

  /**
   * 内部ヘルパー: 要素の生成と設定
   * @private
   */
  _prepareElement(content, { type = 'default', autoClose = true, handler = null } = {}) {
    let element;

    if (typeof content === 'string') {
      const temp = document.createElement('div');
      temp.innerHTML = content;
      element = temp.firstElementChild;

      // ★追加: タグが見つからない（ただのテキスト）場合のフォールバック
      if (!element && content.trim() !== '') {
        // ハンドラがあるならボタン、なければdivとして生成
        const tagName = handler ? 'button' : 'div';
        element = document.createElement(tagName);
        element.innerHTML = content;
      }
    } else if (content && content.jquery) {
      element = content.get(0);
    } else if (content instanceof HTMLElement) {
      element = content;
    }

    if (!element) return null;

    // スタイルクラスの適用
    if (type !== 'default') {
      element.classList.add(`popmenu-type-${type}`);
    }

    // ボタンらしい要素には共通クラスを付与
    if (element.tagName === 'BUTTON' || element.tagName === 'A') {
      element.classList.add('popmenu-item');
    }

    // クリックハンドラの設定
    const clickHandler = e => {
      if (handler) handler(e);
      if (autoClose) this.close();
    };

    // ボタン、または明示的にアイテムクラスを持つ場合にイベント付与
    if (element.tagName === 'BUTTON' || element.classList.contains('popmenu-item')) {
      element.addEventListener('click', clickHandler);
    }

    return element;
  }

  /**
   * イベント初期化
   * @private
   */
  _initEvents() {
    window.addEventListener('keydown', e => {
      if (e.keyCode === this.keyCode) {
        // テキストエリア入力中などは発火しないように制御したい場合はここに条件を追加

        // 座標取得
        let pos = { x: window.innerWidth / 2, y: window.innerHeight / 3 };
        if (typeof getMousePosition === 'function') {
          pos = getMousePosition();
        }

        this.show(pos.x, pos.y);
      }
    });

    // 外部クリックで閉じる
    document.addEventListener('mousedown', e => {
      if (PopMenu.activeMenuElement && !PopMenu.activeMenuElement.contains(e.target)) {
        // 入力要素の操作中は閉じない
        if (!['INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'LABEL'].includes(e.target.tagName)) {
          this.close();
        }
      }
    });
  }

  /**
   * タブレット用フローティングボタン作成
   * @private
   */
  _createFloatingButton() {
    const btn = document.createElement('div');
    btn.className = 'popmenu-floating-trigger';
    btn.innerHTML = '<i></i>'; // CSSでアイコン付与

    btn.addEventListener('click', e => {
      e.stopPropagation();
      // 右上に表示
      this.show(window.innerWidth - 250, 60);
    });

    document.body.appendChild(btn);
  }
  /**
   * @private
   * @returns {boolean}
   */
  _isTabletDevice() {
    // 1. タッチポイントが存在するか（マウスのみのPCを除外）
    const hasTouch = (navigator.maxTouchPoints && navigator.maxTouchPoints > 0) || 'ontouchstart' in window;

    if (!hasTouch) return false;

    // 2. ユーザーエージェントによる判定 (iPad, Android, Macintosh+Touch)
    const ua = navigator.userAgent.toLowerCase();

    // iPadOS 13以降は 'macintosh' と判定されることがあるため、タッチ対応ならiPadとみなす
    const isIpad = ua.indexOf('ipad') > -1 || (ua.indexOf('macintosh') > -1 && hasTouch);

    // Androidタブレット (mobile文字列が含まれない、またはAndroidかつタッチ対応)
    const isAndroid = ua.indexOf('android') > -1;

    // 「タッチ対応しているなら表示する」という広めの判定が実用的です
    // スマホも含みますが、フローティングボタンはスマホでも有用なため
    return isIpad || isAndroid || hasTouch;
  }
}
