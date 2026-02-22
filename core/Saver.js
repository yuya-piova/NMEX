// core/Saver.js

// ユーティリティ: 純粋なオブジェクトかどうか判定する
const isPlainObject = obj => {
  return typeof obj === 'object' && obj !== null && !Array.isArray(obj);
};

export default class Saver {
  /**
   * @param {string} storageKey localStorage に保存する際のキー名
   */
  constructor(storageKey) {
    this.storageKey = storageKey;
  }

  /**
   * 全てのデータを取得する
   * @return {Object}
   */
  getAll() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey)) || {};
    } catch (e) {
      console.warn(`Saver [${this.storageKey}]: データのパースに失敗しました。`, e);
      return {};
    }
  }

  /**
   * 指定したキーのデータを1つ取得する（旧: getone）
   * @param {string} key 取得したいキー
   * @param {*} [defaultValue=null] データが存在しない場合のデフォルト値
   * @return {*}
   */
  get(key, defaultValue = null) {
    const data = this.getAll();
    return data[key] !== undefined ? data[key] : defaultValue;
  }

  /**
   * 複数のキーをデフォルト値付きで一括取得する（旧: get）
   * @param {Object<string, *>} defaultKeysObj { key1: defVal1, key2: defVal2 } の形式
   * @return {Object<string, *>}
   */
  getMultiple(defaultKeysObj) {
    if (!isPlainObject(defaultKeysObj)) {
      console.error(`Saver [${this.storageKey}]: getMultiple の引数はオブジェクトである必要があります`);
      return {};
    }
    const data = this.getAll();
    return Object.fromEntries(Object.entries(defaultKeysObj).map(([key, defVal]) => [key, data[key] ?? defVal]));
  }

  /**
   * データを保存（マージ）する（旧: save）
   * @param {Object<string, *>} dataObj 保存するデータのオブジェクト
   * @return {boolean} 成功可否
   */
  set(dataObj) {
    if (!isPlainObject(dataObj)) {
      console.error(`Saver [${this.storageKey}]: 保存するデータはオブジェクトである必要があります`);
      return false;
    }
    const mergedData = { ...this.getAll(), ...dataObj };
    localStorage.setItem(this.storageKey, JSON.stringify(mergedData));
    return true;
  }

  /**
   * 指定したキーのデータを削除する（旧: delete）
   * @param {string | string[]} keys 削除する単一のキー、またはキーの配列
   * @return {boolean}
   */
  remove(keys) {
    const data = this.getAll();
    const keysArray = Array.isArray(keys) ? keys : [keys];

    let isChanged = false;
    keysArray.forEach(key => {
      if (key in data) {
        delete data[key];
        isChanged = true;
      }
    });

    if (isChanged) {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    }
    return true;
  }

  /**
   * 指定した配列の値を順番に切り替えて保存する
   * @param {string} key
   * @param {Array<*>} values
   */
  toggleValue(key, values) {
    const current = this.get(key);
    const index = values.indexOf(current);
    const nextValue = values[(index + 1) % values.length];
    this.set({ [key]: nextValue });
  }

  /* ===================================================================== */
  /* UI生成メソッド (jQuery依存)                                           */
  /* ===================================================================== */

  /**
   * テキスト入力フィールドを作成し、変更時に自動保存する（旧: makesaveinput）
   * @param {string} key
   * @return {JQuery}
   */
  createSaveInput(key) {
    const $input = $('<input>', { type: 'text', 'data-saver-key': key });

    $input.val(this.get(key, ''));

    $input.on('change', () => {
      this.set({ [key]: $input.val() });
    });

    return $input;
  }

  /**
   * トグルボタンを作成し、クリックで値を切り替えて自動保存する（旧: maketogglebutton）
   * @param {string} buttonPrefix ボタンの接頭辞テキスト
   * @param {string} key
   * @param {Array<{ title: string, value: string|number }>} options
   * @return {JQuery}
   */
  createToggleButton(buttonPrefix, key, options) {
    const $btn = $('<button>', { type: 'button', name: key });

    const updateLabel = () => {
      const current = this.get(key);
      const matchedOption = options.find(opt => String(opt.value) === String(current));
      const label = matchedOption ? matchedOption.title : '';
      $btn.text(`${buttonPrefix}：${label}`);
    };

    $btn.on('click', () => {
      const values = options.map(opt => opt.value);
      this.toggleValue(key, values);
      updateLabel();
      $btn.trigger('change'); // 外部で変更を検知できるようにイベント発火
    });

    updateLabel();
    return $btn;
  }
}
