/**
 * SnapData.js
 * 外部HTMLデータの取得・キャッシュ・パースを一元管理するクラス
 * * 依存ライブラリ:
 * - localforage (必須: キャッシュ機能を利用する場合)
 * - jQuery (任意: getAsJQuery利用時)
 * - NXTable (任意: getAsNXTable利用時)
 */

class SnapData {
  /**
   * @typedef {Object} SnapConfig
   * @property {string} url - 取得対象のURL (必須)
   * @property {string} [storeName] - localforageのストア名 (保存時必須)
   * @property {string} [key] - 保存キー (保存時必須)
   * @property {number} [expire=3600000] - 有効期限(ms) デフォルト1時間
   * @property {boolean} [force=false] - trueならキャッシュを無視して再取得
   * @property {boolean} [noCache=false] - trueなら保存も読み込みもしない
   */

  /**
   * @param {SnapConfig} config
   */
  constructor(config) {
    this.config = {
      expire: 60 * 60 * 1000, // 1 hour
      force: false,
      noCache: false,
      ...config
    };

    // 必須チェック
    if (!this.config.url) {
      throw new Error('SnapData: URL is required.');
    }

    // キャッシュ利用時の依存チェックと必須キーチェック
    if (!this.config.noCache) {
      if (typeof localforage === 'undefined') {
        console.warn('SnapData: localforage library is not loaded. Cache will be disabled.');
        this.config.noCache = true;
      } else if (!this.config.storeName || !this.config.key) {
        throw new Error('SnapData: "storeName" and "key" are required for caching.');
      } else {
        // ストアの初期化
        this.store = localforage.createInstance({
          name: 'SnapDataStore',
          storeName: this.config.storeName
        });
      }
    }

    // 取得データの保持用
    this._rawString = null;
    this._fetchedTime = null;
  }

  /**
   * データを取得します（キャッシュ判定含む）
   * @param {boolean} [force=false] - trueを指定するとキャッシュを無視して強制的に通信します
   * @returns {Promise<SnapData>} メソッドチェーン用
   */
  async fetch(force = false) {
    // 引数の force または コンストラクタ設定の force いずれかが true なら強制取得モード
    const isForced = force || this.config.force;

    // 1. メモリキャッシュのチェック
    // 強制更新でなく、すでにデータを持っているなら何もしない
    if (this._rawString && !isForced) return this;

    // 2. ローカルストレージ（永続キャッシュ）のチェック
    if (!this.config.noCache && !isForced) {
      try {
        const cached = await this.store.getItem(this.config.key);
        const now = Date.now();
        if (cached && now - cached.timestamp < this.config.expire) {
          this._rawString = cached.data;
          this._fetchedTime = cached.timestamp;
          return this;
        }
      } catch (e) {
        console.warn('SnapData: Cache read error', e);
      }
    }

    // 3. ネットワークから取得（強制更新またはキャッシュ切れの場合）
    try {
      const response = await fetch(this.config.url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      // 1. 一旦バイナリ（ArrayBuffer）として取得する
      const buffer = await response.arrayBuffer();

      // 2. TextDecoderを使って Shift_JIS としてデコードする
      // ※日本の社内システムで一般的な Windows-31J (CP932) を指定
      const decoder = new TextDecoder('shift-jis');
      const text = decoder.decode(buffer);

      this._rawString = text;
      this._fetchedTime = Date.now();

      if (!this.config.noCache) {
        await this.store.setItem(this.config.key, {
          data: text,
          timestamp: this._fetchedTime
        });
      }
    } catch (e) {
      console.error(`SnapData: Fetch failed`, e);
      throw e;
    }

    return this;
  }

  /**
   * 生のテキストデータを取得します
   * @returns {string}
   */
  getText() {
    this._ensureFetched();
    return this._rawString;
  }

  /**
   * DOM要素として取得します (DOMParser使用)
   * @param {string} [selector] - 抽出したいセレクタ（指定がなければbody全体）
   * @param {boolean} [returnAll=false] - trueならNodeList, falseなら単一Element
   * @returns {HTMLElement|NodeList|null}
   */
  getDOM(selector, returnAll = false) {
    this._ensureFetched();

    const parser = new DOMParser();
    const doc = parser.parseFromString(this._rawString, 'text/html');

    if (!selector) return doc.body;

    const results = doc.querySelectorAll(selector);
    if (results.length === 0) return null;

    return returnAll ? results : results[0];
  }

  /**
   * jQueryオブジェクトとして取得します
   * @param {string} [selector]
   * @returns {jQuery}
   */
  getAsJQuery(selector) {
    if (typeof jQuery === 'undefined') throw new Error('SnapData: jQuery is not loaded.');
    const dom = this.getDOM(selector, true); // 常にリストで取得してjQueryに渡す
    return dom ? $(dom) : $();
  }
  /**
   * 生データとして取得します
   * @returns {string}
   */
  getAsRawString() {
    return this._rawString;
  }

  /**
   * NXTableクラスとして取得します (Bridgeメソッド)
   * @param {Object} nxTableOptions - NXTable作成時のオプション
   * @param {string} [tableSelector='table'] - テーブル特定用セレクタ
   * @returns {Object} NXTableのインスタンス
   */
  getAsNXTable(nxTableOptions = {}, tableSelector = 'table') {
    // 1. NXTable ($NX) の存在チェック
    if (typeof $NX === 'undefined') {
      throw new Error('SnapData: NXTable library ($NX) is not loaded.');
    }

    // 2. テーブルDOMの取得
    const tableDom = this.getDOM(tableSelector);
    if (!tableDom) {
      throw new Error(`SnapData: Table not found with selector "${tableSelector}"`);
    }

    // 3. NXTableの生成 (DOM要素を直接渡せる想定。もしjQuery必須なら $(tableDom) で渡す)
    // ここでは既存コードに合わせてjQueryラップして渡す安全策を取ります
    return $NX($(tableDom)).makeNXTable(nxTableOptions);
  }

  static async quickFetch(config) {
    const instance = new SnapData(config);
    await instance.fetch();
    return instance;
  }

  /**
   * データ取得済みかチェックする内部メソッド
   * @private
   */
  _ensureFetched() {
    if (this._rawString === null) {
      throw new Error('SnapData: Data not fetched. Call await .fetch() first.');
    }
  }
}
