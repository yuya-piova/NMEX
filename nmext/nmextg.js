///<reference path="../jquery-3.4.1.min.js"/>
///<reference path="../jquery-ui.min.js"/>
///<reference path="../checker.js"/>
///<reference path="../dts/JQuery.d.ts"/>
///<reference path="../dts/jqueryui.d.ts"/>
///<reference path="../dts/global.d.ts"/>
///<reference path="../dts/chrome.d.ts"/>
///<reference path="../nmex-longconst.js"/>
///<reference path="../nmexg.js"/>

console.log('nmextg');
loadScript('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css', 'css');
function $NX(...arg) {
  return new $NXClass(arg);
}
class $NXClass {
  constructor(args) {
    this.args = args;
  }
  /**
   * Converts a string to its full-width representation.
   * @returns {string|false} - The full-width string or false if the argument is not a string.
   */
  toFullWidth() {
    if (!this.isString()) {
      console.error('$NX', 'Argument must be String.', this.args[0]);
      return false;
    }
    return this.args[0].replace(/[!-~]/g, match => String.fromCharCode(match.charCodeAt(0) + 0xfee0));
  }
  /**
   * Converts a string to its Katakana representation.
   * @returns {string|false} - The Katakana string or false if the argument is not a string.
   */
  toKatakana() {
    if (!this.isString()) {
      console.error('$NX', 'Argument must be String.', this.args[0]);
      return false;
    }
    return this.args[0].replace(/[\u3041-\u3096]/g, match => String.fromCharCode(match.charCodeAt(0) + 0x60));
  }
  /**
   * Converts a string to its Hiragana representation.
   * @returns {string|false} - The Hiragana string or false if the argument is not a string.
   */
  toHiragana() {
    if (!this.isString()) {
      console.error('$NX', 'Argument must be String.', this.args[0]);
      return false;
    }
    return this.args[0].replace(/[\u30a1-\u30f6]/g, match => String.fromCharCode(match.charCodeAt(0) - 0x60));
  }
  /**
   * Formats a phone number based on predefined phone groups.
   * @returns {string|false} - The formatted phone number or false if the argument is not a string or the length is invalid.
   */
  phoneformat() {
    if (!this.isString()) {
      console.error('$NX', 'Argument must be String.', this.args[0]);
      return false;
    }
    // データは http://www.soumu.go.jp/main_sosiki/joho_tsusin/top/tel_number/number_shitei.html より入手後、整形
    const group = LCT.INQ.phonegroup;
    // 市外局番の桁数を取得して降順に並べ替える
    const code = Object.keys(group)
      .map(num => parseInt(num, 10))
      .sort((a, b) => b - a);
    // 入力文字から数字以外を削除してnumber変数に格納する
    const number = String(this.args[0])
      .replace(/[０-９]/g, function($s) {
        return String.fromCharCode($s.charCodeAt(0) - 65248);
      })
      .replace(/\D/g, '');
    // 電話番号が10～11桁じゃなかったらfalseを返して終了する
    if (number.length < 10 || number.length > 11) {
      return false;
    }
    // 市外局番がどのグループに属するか確認していく
    for (const leng of code) {
      const area = number.slice(0, leng);
      const city = group[leng][area];
      if (city) {
        const formattedNumber = `${area}-${number.substr(leng, city)}`;
        return number.substr(leng + city) ? `${formattedNumber}-${number.substr(leng + city)}` : formattedNumber;
      }
    }
  }
  /**
   * Checks if the value is an object.
   * @param {any} [val] - The value to be checked. If not provided, checks the constructor's argument.
   * @returns {boolean} - True if the value is an object, false otherwise.
   */
  isObject(val) {
    val = val || this.args[0];
    return val !== null && typeof val === 'object';
  }
  /**
   * Checks if the value is a string.
   * @param {any} [val] - The value to be checked. If not provided, checks the constructor's argument.
   * @returns {boolean} - True if the value is a string, false otherwise.
   */
  isString(val) {
    val = val || this.args[0];
    return typeof val === 'string';
  }
  isTetraNumber() {
    const regex = /^\d{4}$/;
    return regex.test(this.args[0]);
  }
  isHexaNumber() {
    const regex = /^\d{6}$/;
    return regex.test(this.args[0]);
  }
  /**
   * 日付文字列が指定されたフォーマットに従っているかを判定します。
   *
   * @param {string} format - 日付フォーマット (例: "yyyy/mm"、"yyyy/mm/dd")。
   *                          - フォーマット内のサポートされるトークン:
   *                            - yyyy: 4桁の年
   *                            - mm: 2桁の月 (01-12)
   *                            - dd: 2桁の日 (01-31)
   * @returns {boolean} - 日付文字列が指定フォーマットに一致し、かつ有効な日付であれば true。そうでなければ false。
   *
   * @example
   * console.log($NX("2023/11").isValidDateFormat("yyyy/mm")); // true
   * console.log($NX("2023/02/30").isValidDateFormat("yyyy/mm/dd")); // false
   */
  isValidDateFormat(format) {
    // フォーマットを正規表現に変換
    const formatRegex = format
      .replace(/yyyy/, '(\\d{4})') // 年を4桁に置換
      .replace(/mm/, '(0[1-9]|1[0-2])') // 月を01-12に置換
      .replace(/dd/, '(0[1-9]|[12][0-9]|3[01])'); // 日を01-31に置換

    const regex = new RegExp(`^${formatRegex}$`);
    const match = this.args[0].match(regex);

    // フォーマットに一致しない場合
    if (!match) return false;

    // 実際の有効な日付かどうかを検証
    const year = format.includes('yyyy') ? parseInt(match[1], 10) : 0;
    const month = format.includes('mm') ? parseInt(match[2], 10) : 1; // デフォルト値: 1月
    const day = format.includes('dd') ? parseInt(match[3], 10) : 1; // デフォルト値: 1日

    const date = new Date(year, month - 1, day);

    // 日付が一致するかチェック
    return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  }
  /**
   * Checks whether the given value is a 2D array.
   * If `strict` is true, it also checks that all inner arrays have the same length.
   *
   * @param {Object} [options] - Optional settings.
   * @param {boolean} [options.strict=false] - Whether to enforce equal lengths for inner arrays.
   * @returns {boolean} - Returns true if the value is a (strict) 2D array, otherwise false.
   */
  is2DArray({ strict = false } = {}) {
    const arr = this.args[0];
    if (!Array.isArray(arr) || arr.length === 0) return false;
    if (!arr.every(row => Array.isArray(row))) return false;
    if (strict) {
      const length = arr[0].length;
      return arr.every(row => row.length === length);
    }
    return true;
  }

  getOnlyNode() {
    var result = '';
    $(this.args[0])
      .contents()
      .each(function() {
        if (this.nodeType === 3 && this.data) {
          result += $(this)
            .text()
            .trim();
        }
      });
    return result;
  }
  multiIncludes(arr) {
    return arr.some(el => this.args[0].includes(el));
  }
  parseToArray() {
    const tableObj = $(this.args[0]);
    const rows = tableObj.find('tr');
    const head = [];
    //prettier-ignore
    rows.first().find('td').each(function(){
      const colspan = parseInt($(this).attr('colspan')) || 1;
      const text = $(this).text().trim();
      for(let i =0; i < colspan; i++){
        head.push(text + (i != 0?`_${i}`:''))
      }
    })
    //prettier-ignore
    const rtn = rows.slice(1).map(function() {
      const temp = {};
      //prettier-ignore
      $(this).find('td').each(function(ind) {
        const clone = $(this).clone();
        clone.find('input,select').remove();
        temp[head[ind]] = clone.text().trim();
      });
      return temp;
    }).get();
    return rtn;
  }
  moneylocaleToInt() {
    const str = this.args[0];
    const isNumberString = /^-?\d+(,\d{3})*$/.test(str);
    if (isNumberString) {
      return parseInt(str.replace(/,/g, ''), 10);
    } else {
      return null;
    }
  }
  makeNXTable_old(options = {}) {
    const tableObj = $(this.args[0]);
    const rows = tableObj.find('tr');
    const head = trToArray(rows.first());
    const headLength = head.length;
    const body = [];
    rows.slice(1).each(function() {
      const arr = trToArray($(this), options.omitSubrow);
      if (arr) body.push(arr);
    });
    function trToArray(tr, omitSubrow) {
      const _tds = $(tr).find('td');
      //omitSubrowがtrueなら、不揃いな行（rowspanがあるもの）を弾く
      if (omitSubrow && _tds.length != headLength) return false;
      const rtn = [];
      _tds.each(function() {
        const _td = $(this).clone();
        _td.find('input,select').remove();
        const colspan = parseInt(_td.attr('colspan')) || 1;
        const text = _td
          .text()
          .trim()
          .replace(/[\n\r\t ]/g, '');
        for (let i = 0; i < colspan; i++) {
          rtn.push(text + (i != 0 ? `_${i}` : ''));
        }
      });
      return rtn;
    }
    return new NXTable(head, body);
  }
  makeNXTable(options = {}) {
    const tableObj = $(this.args[0]);

    // thead / tbody を優先して取得
    const theadRows = tableObj.find('thead tr');
    const tbodyRows = tableObj.find('tbody tr');

    let head = [];
    let headLength = 0;
    let body = [];

    if (theadRows.length) {
      // thead がある場合 → 最初の tr をヘッダーに
      head = trToArray(theadRows.first());
      headLength = head.length;
    } else {
      // thead がない場合 → table 全体から最初の tr をヘッダーに
      const rows = tableObj.find('tr');
      head = trToArray(rows.first());
      headLength = head.length;

      // tbody がない場合は残りを body とする
      if (!tbodyRows.length) {
        rows.slice(1).each(function() {
          const arr = trToArray($(this), options.omitSubrow);
          if (arr) body.push(arr);
        });
      }
    }

    // tbody がある場合は tbody 部分を body とする
    if (tbodyRows.length) {
      tbodyRows.each(function() {
        const arr = trToArray($(this), options.omitSubrow);
        if (arr) body.push(arr);
      });
    }

    function trToArray(tr, omitSubrow) {
      // th も対象に
      const _cells = $(tr).find('th, td');

      if (omitSubrow && _cells.length !== headLength) return false;

      const rtn = [];
      _cells.each(function() {
        const _cell = $(this).clone();
        _cell.find('input,select').remove();

        const colspan = parseInt(_cell.attr('colspan')) || 1;
        const text = _cell
          .text()
          .trim()
          .replace(/[\n\r\t ]/g, '');

        for (let i = 0; i < colspan; i++) {
          rtn.push(text + (i !== 0 ? `_${i}` : ''));
        }
      });
      return rtn;
    }
    return new NXTable(head, body);
  }
}

/**
 * Represents a database with search and data manipulation capabilities.
 */
class NXDatabase {
  constructor() {
    this.rawNXT = null;
    this.searchNXT = null;
  }
  /**
   * Initializes the database with base data and optionally performs a search.
   * @param {Array<Object>} baseList The base list data.
   * @param {Object|null} [query] The optional query object for initial search.
   */
  _initData(basedData, query) {
    //元データをNXTableData形式に移行中
    this.rawNXT = basedData.head ? new NXTable(basedData) : new NXTable().appendFromArray(basedData);
    if (query) this.search(query);
  }
  /**
   * Performs a search operation on the database.
   * @param {Object|null} query The query object to filter the data.
   * @returns {NXDatabase} The current instance for method chaining.
   */
  search(query) {
    query = query || this.query;
    this.searchNXT = null;
    if (query) this.searchNXT = Array.isArray(query) ? this.rawNXT.clone()._filterRowsByConditions(query) : this.rawNXT.clone().filterByQuery(query);
    return this;
  }
  include(query) {
    if (query) this.searchNXT = this.rawNXT.clone().include(query);
    return this;
  }
  _returnData(dataname) {
    if (!this.searchNXT || this.searchNXT.body.length === 0) return null;
    return this.searchNXT.body.length === 1 ? this.searchNXT.getColumn(dataname)[0] : this.searchNXT.getColumn(dataname);
  }
  /**
   * Creates a transformed data array based on filtering conditions and a shaping function.
   * @param {Function} shapingFunc The function to shape each element of the filtered data.
   * @param {...any} conditions The conditions to filter the data.
   * @returns {Array} An array of transformed data objects.
   * @throws {Error} Throws an error if the shaping function is not provided.
   */
  makeData(shapingFunc, ...conditions) {
    if (typeof shapingFunc !== 'function') throw new Error('NXDatabase: shapingFunc must be a function.');
    const filteredNXTtable = this.rawNXT.filterByCondition(conditions);
    return filteredNXTtable.export('objectArray').map(elem => shapingFunc(elem));
  }
}
/**
 * Represents a base management system extending NXDatabase.
 */
class NXBase extends NXDatabase {
  /**
   * Creates an instance of NXBase with base data and optionally performs a search.
   * @param {Object|null} [query] The optional query object for initial search.
   */
  constructor(query) {
    super();
    super._initData(LCT.UNIT.baseNXTData, query);
  }
  /**
   * Retrieves an array of base codes from the search results.
   * @returns {Array<string>} An array or string of base codes.
   */
  getCd() {
    return this._returnData('basecd');
  }
  /**
   * Retrieves an array of unit names from the search results.
   * @returns {Array<string>} An array or string of unit names.
   */
  getUnitName() {
    return this._returnData('unitname');
  }
  getBlockName() {
    return this._returnData('blockname');
  }
  /*
  search(returnHead, ...conditions) {
    return this.NXTable.match(returnHead, ['closed', ''], ...conditions);
  }
  */
}
class NXEmp extends NXDatabase {
  constructor(query) {
    super();
    super._initData(LCT.TEACHER.empNXTData, query);
  }
  getName() {
    return this._returnData('name');
  }
  /**
   * Retrieves an array of base codes from the search results.
   * @returns {Array<string>} An array or string of base codes.
   */
  getCd() {
    return this._returnData('cd');
  }
  findInclude(targetHead, query) {
    this.searchNXT = this.rawNXT.filter(targetHead, cell => query.indexOf(cell) != -1);
    return this;
  }
}

class memberInfoClass {
  constructor(tenpo_cd) {
    this.classData = this.getClassData();
    this.storeName = this.classData.storeName || 'memberInfo';
    this.parseFunction = this.classData.parseFunction || null;
    this.storeData = JSON.parse(localStorage.getItem(this.storeName)) || {};
    const tenpoData = this.storeData[tenpo_cd];
    if (tenpo_cd && tenpoData) {
      this.NXTable = new NXTable(tenpoData);
    } else {
      this.NXTable = new NXTable();
      for (let key in this.storeData) {
        this.NXTable.merge(new NXTable(this.storeData[key]), true);
      }
    }
  }
  saveTable(tenpo_cd, table) {
    const NXTable = $NX(table).makeNXTable();
    if (this.parseFunction) this.parseFunction(NXTable);
    this.storeData[tenpo_cd] = NXTable.export('object');
    localStorage.setItem(this.storeName, JSON.stringify(this.storeData));
    return this;
  }
  search(...conditions) {
    const filteredRows = this.NXTable.match(conditions);
    if (filteredRows.length > 1) {
      console.warn(this.storeName, `Find ${filteredRows} data. Return First Data.`);
      console.warn(this.storeName, `Given condition ${JSON.stringify(conditions)}.`);
      return this.NXTable.matchFirst(conditions);
    } else if (filteredRows.length == 1) {
      return this.NXTable.matchFirst(conditions);
    } else {
      return null;
    }
  }
  list(head) {
    return this.NXTable.getColumn(head);
  }
  getClassData() {
    return { storeName: 'memberInfo', parseFunction: null };
  }
}

class studentInfoClass extends memberInfoClass {
  constructor(tenpo) {
    super(tenpo);
  }
  getClassData() {
    return { storeName: 'studentInfo', parseFunction: null };
  }
}

class teacherInfoClass extends memberInfoClass {
  constructor(tenpo) {
    super(tenpo);
  }
  getClassData() {
    return { storeName: 'teacherInfo', parseFunction: null };
  }
}

//つくりかけーーーーーーーーーーーーー
class NXEvent extends NXDatabase {
  constructor() {
    super();
    this.data = JSON.parse(localStorage.getItem('NXEvent')) || {};
    super._initData(this.data);
  }
  bySchool(schoolname, schoolyear) {
    var filteredNXT = null;
    try {
      filteredNXT = this.rawNXT.clone().filterByCondition(['学校名', schoolname], ['年度', schoolyear]);
    } catch (err) {
      filteredNXT = new NXTable();
    }
  }
}

/**
 * TheTXT ver1.0
 * 1.0 基本機能作成
 */
class TheTXT {
  constructor() {
    this.content = '';
  }
  write(text) {
    this.content = text;
    return this;
  }
  append(text) {
    if (this.content == '') {
      this.content = text;
    } else {
      this.content = `${this.content}\n${text}`;
    }
    return this;
  }
  prepend(text) {
    if (this.content == '') {
      this.content = text;
    } else {
      this.content = `${text}\n${this.content}`;
    }
    return this;
  }
  clear() {
    this.content = '';
    return this;
  }
  export() {
    return this.content;
  }
  isEmpty() {
    return this.content == '';
  }
}
/**
 * PX_Toast ver1.1
 * 指定文字列のトースト表示
 * 1.0: 作成
 * 1.1: option整備
 * @param {string} toasttext トースト文字列
 * @param {Object} option オプション※以下参照
 * {
 *  [color]: トースト色 ※htmlカラー,
 *  [close]: 除去イベント ※リスナー名を入れる　デフォルトはanimationend
 * }
 */
function PX_Toast_old(toasttext, option) {
  if (!toasttext) {
    console.warn('PX_Toast: toasttext is required');
    return;
  }
  const { color = '', close = 'animationend' } = option;
  let toastdiv = document.createElement('div');
  toastdiv.classList.add('px-toast', option.close);
  toastdiv.textContent = toasttext;
  if (option.color) toastdiv.style.backgroundColor = color;
  document.getElementsByTagName('body')[0].appendChild(toastdiv);
  toastdiv.addEventListener(option.close, () => {
    toastdiv.remove();
  });
}

/**
 * Displays a toast notification on the screen.
 *
 * This function creates a toast element, appends it to a toast container (which will be created if not present),
 * and automatically removes the toast after the specified duration. Supports different types and color schemes.
 *
 * @function PX_Toast
 * @param {string} toasttext - The message to display inside the toast.
 * @param {Object} [option={}] - Optional configuration settings for the toast.
 * @param {string} [option.colorScheme] - Custom color scheme class name (optional).
 * @param {string} [option.type='default'] - Preset type for styling. Options: 'success', 'error', 'warning', 'info', or 'default'.
 * @param {number} [option.duration=3000] - Duration in milliseconds before the toast disappears automatically.
 * @returns {HTMLElement|null} The created toast element, or null if creation fails.
 *
 * @example
 * PX_Toast('Data saved successfully!', { type: 'success', duration: 4000 });
 *
 * @example
 * PX_Toast('Something went wrong...', { type: 'error' });
 */
function PX_Toast(toasttext, option = {}) {
  if (!toasttext) {
    console.warn('PX_Toast: toasttext is required');
    return null;
  }

  try {
    const { colorScheme = '', type = 'default', duration = 3000 } = option;

    // トーストコンテナを作成（存在しない場合）
    let container = document.getElementById('px-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'px-toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.classList.add('px-toast');
    if (type !== 'default') toast.classList.add(type);
    if (colorScheme) toast.classList.add(colorScheme);
    toast.textContent = toasttext;
    toast.style.animationDuration = '0.3s';

    container.appendChild(toast);

    // 自動削除
    const removeTimer = setTimeout(() => {
      toast.remove();
    }, duration);

    // ホバー中は削除停止 → 離れたら再カウント（+0.5秒）
    toast.addEventListener('mouseenter', () => clearTimeout(removeTimer));
    toast.addEventListener('mouseleave', () => {
      setTimeout(() => toast.remove(), 500);
    });

    return toast;
  } catch (err) {
    console.error('PX_Toast: Failed to create toast', err);
    return null;
  }
}

class EXSchool {
  constructor(caption) {
    this.data = null;
    this.LF = localforge.createInstance({
      name: 'SchoolInfo',
      storeName: 'global'
    });
    this.caption = caption || 'event';
  }
  async getData(caption = 'event') {
    return (await this.LF.getItem(caption)) || {};
  }
  async setData(caption = 'event') {
    await this.LF.setItem(caption, this.data);
    return this;
  }
  async load() {
    this.data = await this.getData(this.caption);
  }
}

class PX_ProgBar {
  constructor(start, end, cls, title) {
    this.wrap = $('<div>', { class: `progressbar ${cls}`, title: title });
    this.bar = $('<div>').appendTo(this.wrap);
    this.animate(start, end);
  }
  animate(start, end) {
    this.bar.css('width', `${start}%`);
    let width = start;
    const increment = end / (500 / 5);
    const setWidth = () => {
      width = width + increment;
      this.bar.css('width', `${width}%`);
    };
    const interval = setInterval(() => {
      setWidth();
      if (width + increment >= end) {
        this.bar.css('width', `${end}%`);
        clearInterval(interval);
      }
    }, 5);
    return this;
  }
  getNode() {
    return this.wrap;
  }
}
/**
 *面談結果入力のコントローラー
 *
 * @class MenLog
 */
class MenLog {
  constructor(studentcd) {
    this.LS;
    this.studentcd = studentcd;
  }
  /**
   *書き込む
   * @param {object} textareaOBJ JqueryObject
   * @return {object} this
   * @memberof MenLog
   */
  writeText(textareaOBJ) {
    this.#loadLS().#setResult();
    this.LS[this.studentcd]['result'][textareaOBJ.attr('name')] = textareaOBJ.val();
    this.#saveLS();
    return this;
  }
  loadAll() {
    var _this = this;
    this.#loadLS().#setResult();
    for (let key in _this.LS[this.studentcd]['result']) {
      $(`[name=${key}]`).val(_this.LS[this.studentcd]['result'][key]);
    }
    return this;
  }
  delete() {
    this.#loadLS().#setResult();
    delete this.LS[this.studentcd]['result'];
    this.#saveLS();
    return this;
  }
  exsistCH() {
    this.#loadLS();
    this.LS[this.studentcd] = this.LS[this.studentcd] || {};
    return this.LS[this.studentcd]['result'];
  }
  #loadLS() {
    this.LS = JSON.parse(localStorage.getItem('mendankanri')) || {};
    return this;
  }
  #setResult() {
    this.LS[this.studentcd] = this.LS[this.studentcd] || {};
    this.LS[this.studentcd]['result'] = this.LS[this.studentcd]['result'] || {};
    return this;
  }
  #saveLS() {
    localStorage.setItem('mendankanri', JSON.stringify(this.LS));
    return this;
  }
}
/**
 * [ExTextArea] 指定要素をテキストエディタに変える
 * @param {string} selector [テキストエディタ化したい要素(div)のidかclass]
 */
class ExTextArea {
  constructor(selector) {
    this.div = document.querySelector(selector);
    if (!this.div) return false;
    this.stylize();
  }
  stylize() {
    const _this = this;
    Object.assign(this.div.style, {
      height: 'auto',
      border: 'solid 1px gray',
      position: 'relative',
      'border-radius': '0.5rem',
      padding: '0.5rem'
    });
    this.div.addEventListener('contextmenu', function(e) {
      e.preventDefault();
      _this.editmode();
    });
  }
  editmode(option) {
    switch (option) {
      case 'on':
        this.div.classList.add('editmode');
        break;
      case 'off':
        this.div.classList.remove('editmode');
        break;
      default:
        this.div.classList.toggle('editmode');
        break;
    }
    this.div.setAttribute('contentEditable', this.div.classList.contains('editmode'));
    this.applyLink();
  }
  append(text) {
    var nowtext = this.div.innerText;
    if (nowtext == '') {
      this.div.innerText = text;
    } else {
      this.div.innerText = nowtext + '\n' + text;
    }
    this.applyLink();
    return this;
  }
  clear() {
    this.div.innerText = '';
    return this;
  }
  writeline() {
    var nowtext = this.div.innerText;
    if (nowtext == '') {
      this.div.innerText = '---------------------------------------------';
    } else {
      this.div.innerText = nowtext + '\n' + '---------------------------------------------';
    }
    this.applyLink();
    return this;
  }
  applyLink() {
    this.div.innerHTML = this.linker(this.div.innerHTML);
  }
  //var TA = new ExTextArea("#teest");TA.applyLink();
  /*
  <div id="teest">aaa</div>
  */
  linker(str) {
    str = str.replace(/<a href=".+">/g, '');
    str = str.replace(/<\/a>/g, '');
    const regexp_url = /((h?)(ttps?:\/\/[a-zA-Z0-9.\-_@:/~?%&;=+#',()*!]+))/g; // ']))/;
    const regexp_makeLink = function(all, url, h, href) {
      return `<a href="h${href}">${url}</a>`;
    };
    return str.replace(regexp_url, regexp_makeLink);
  }
}

function NXsetValues(selectorValuePairs) {
  if (!Array.isArray(selectorValuePairs)) {
    console.error('setValues:入力は配列である必要があります');
    return;
  }
  selectorValuePairs.forEach(function(pair, index) {
    try {
      if (!Array.isArray(pair) || pair.length !== 2) {
        throw new Error(`setValues:ペアは2つの要素を持つ配列である必要があります: index ${index}`);
      }
      const [selector, value] = pair;
      var $element = $(selector);
      if ($element.length === 0) throw new Error(`セレクタ "${selector}" に対応する要素が見つかりません: index ${index}`);
      $element.val(value);
    } catch (error) {
      console.error(`setValues:エラーが発生しました ${error.message}`);
    }
  });
}

window.addEventListener('scroll', function() {
  const elements = document.querySelectorAll('[netzheight]');

  elements.forEach(function(element) {
    const netzHeight = parseInt(element.getAttribute('netzheight'));
    const scrollTop = window.scrollY;
    element.style.top = `${scrollTop + netzHeight}px`;
  });
});

/**
 * Prevents the parent object's screen position from changing when the window is scrolled.
 * @param {HTMLElement} element - The DOM element that will have its position fixed.
 * @param {number} fixedPosition - The fixed position in pixels where the element should remain.
 */
function notScroll(element, fixedPosition = 10) {
  if (element.hasAttribute('netzheight')) element.removeAttribute('netzheight');
  element.setAttribute('netzheight', fixedPosition);
  element.style.position = 'absolute';
  element.style.zIndex = '1';

  window.dispatchEvent(new Event('scroll'));
}

// Create the notScroll function that extends the functionality for jQuery objects
$.fn.netznotscroll = function(fixedPosition) {
  return this.each(function() {
    notScroll(this, fixedPosition);
  });
};

class EmployMan {
  constructor(triggerElement, offset, multiple = false) {
    this.NXDatabase = new NXEmp();
    this.uiElements = {};
    this.offset = offset;
    this.triggerElement = triggerElement;
    this.multiple = multiple;
    this.selectedValues = triggerElement.value.split(',').map(val => val.trim());
    this.originalValues = [...this.selectedValues];
    this.initUI();
  }
  initUI() {
    this.uiElements.wrapper = document.createElement('div');
    this.uiElements.wrapper.classList.add('EmployManUI');
    document.body.appendChild(this.uiElements.wrapper);

    //表示位置を設定　はみ出さないように調整済み
    const rect = this.uiElements.wrapper.getBoundingClientRect();

    let top = this.offset.top;
    let left = this.offset.left;

    if (top + rect.height > window.innerHeight) top = window.innerHeight - rect.height;
    if (left + rect.width > window.innerWidth) left = window.innerWidth - rect.width;

    this.uiElements.wrapper.style.top = `${top}px`;
    this.uiElements.wrapper.style.left = `${left}px`;

    this.uiElements.header = document.createElement('div');
    this.uiElements.header.classList.add('EM_header');
    this.uiElements.wrapper.appendChild(this.uiElements.header);

    this.uiElements.searchBox = document.createElement('input');
    this.uiElements.searchBox.type = 'text';
    this.uiElements.searchBox.placeholder = '社員名・グループ';
    this.uiElements.searchBox.addEventListener('input', () => this.updateSearchResults());
    this.uiElements.searchBox.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const options = this.uiElements.resultList.options;
        if (options.length === 1) {
          const selected = options[0].value;
          if (this.triggerElement) {
            this.triggerElement.value = selected;
            dispatchNativeEvent(this.triggerElement, 'change');
            this.close();
          }
          e.preventDefault(); // フォーム送信や変な動作を防止
        }
      }
    });

    // 閉じるボタン（FontAwesomeアイコン）
    this.uiElements.closeButton = document.createElement('i');
    this.uiElements.closeButton.classList.add('fas', 'fa-times');
    this.uiElements.closeButton.addEventListener('click', () => {
      this.close();
    });

    // header に検索ボックスと閉じるボタンを追加
    this.uiElements.header.appendChild(this.uiElements.searchBox);
    this.uiElements.header.appendChild(this.uiElements.closeButton);

    this.uiElements.resultList = document.createElement('select');
    this.uiElements.resultList.multiple = this.multiple;
    this.uiElements.resultList.size = 5;
    this.uiElements.wrapper.appendChild(this.uiElements.resultList);
    this.uiElements.resultList.addEventListener('change', () => {
      const selectedOptions = Array.from(this.uiElements.resultList.selectedOptions);
      const newSelectedValues = selectedOptions.map(opt => opt.value);

      // multipleの場合は既存のselectedValuesと新たに選択された値をマージ
      this.selectedValues = this.multiple
        ? Array.from(new Set([...this.selectedValues, ...newSelectedValues])).filter(item => item !== '') // 重複を避けるためにSetを使用、かつ、初期値の空欄を除去
        : newSelectedValues;
      const result = this.selectedValues.join(','); // カンマ区切りで結合

      if (this.triggerElement) {
        this.triggerElement.value = result;
        dispatchNativeEvent(this.triggerElement, 'change');
      }

      //multipleでなければ選択で完了
      if (!this.multiple) this.close();
    });
  }
  updateSearchResults() {
    this.uiElements.resultList.innerHTML = '';
    const query = this.uiElements.searchBox.value.trim();

    //検索
    if (!query) return;
    this.NXDatabase.include(query);
    //退職社員は除く
    this.NXDatabase.searchNXT.filterByCondition(['retire', '']);

    const head = this.NXDatabase.rawNXT.head;
    this.NXDatabase.searchNXT.body.forEach(row => {
      const pickedData = extractByHead(row, head, ['name', 'kana', 'cd']);
      const optionElement = document.createElement('option');
      optionElement.value = pickedData.cd;
      optionElement.innerText = pickedData.name;
      this.uiElements.resultList.appendChild(optionElement);
      // 元の値に該当していれば選択状態にする
      if (this.originalValues.includes(pickedData.cd)) optionElement.selected = true;
    });

    function extractByHead(row, head, pick) {
      return pick.reduce((acc, key) => {
        const index = head.indexOf(key);
        if (index !== -1) {
          acc[key] = row[index];
        }
        return acc;
      }, {});
    }
  }
  show() {
    this.uiElements.wrapper.style.display = 'block';
    this.uiElements.searchBox.focus();
  }

  close() {
    this.uiElements.wrapper.style.display = 'none';
  }
}
class BaseMan {
  constructor() {
    this.NXDatabase = new NXBase();
    this.uiElements = {};
    this.initUI();
    this.addEventListener();
    this.enableDrag();
  }
  initUI() {
    this.uiElements.wrapper = document.createElement('div');
    this.uiElements.wrapper.classList.add('BaseManUI');
    document.body.appendChild(this.uiElements.wrapper);
    notScroll(this.uiElements.wrapper);

    this.uiElements.header = document.createElement('div');
    this.uiElements.header.classList.add('BM_header');
    this.uiElements.wrapper.appendChild(this.uiElements.header);

    this.uiElements.searchIcon = document.createElement('i');
    this.uiElements.searchIcon.classList.add('fa-solid', 'fa-magnifying-glass');
    this.uiElements.searchIcon.setAttribute('title', 'selectorより取得');
    this.uiElements.searchIcon.addEventListener('click', () => {
      const selectedOption = document.querySelector('select[name=tenpo_cd] option:checked');
      const searchValue = selectedOption ? selectedOption.textContent : '';
      this.uiElements.searchBox.value = searchValue;
      this.uiElements.searchBox.dispatchEvent(new Event('input'));
    });
    this.uiElements.header.appendChild(this.uiElements.searchIcon);

    this.uiElements.searchBox = document.createElement('input');
    this.uiElements.searchBox.type = 'text';
    this.uiElements.searchBox.placeholder = '教室・ユニット・ブロック・cd';
    this.uiElements.searchBox.addEventListener('input', () => this.updateSearchResults());
    this.uiElements.header.appendChild(this.uiElements.searchBox);

    this.uiElements.resultTable = document.createElement('table');
    this.uiElements.wrapper.appendChild(this.uiElements.resultTable);
  }

  enableDrag() {
    let offsetX = 0,
      offsetY = 0,
      isDragging = false;

    this.uiElements.header.style.cursor = 'grab';
    this.uiElements.header.addEventListener('pointerdown', event => {
      isDragging = true;
      offsetX = event.clientX - this.uiElements.wrapper.offsetLeft;
      offsetY = event.clientY - this.uiElements.wrapper.offsetTop;
      this.uiElements.header.style.cursor = 'grabbing';
    });

    window.addEventListener('pointermove', event => {
      if (!isDragging) return;
      event.preventDefault();
      this.uiElements.wrapper.style.left = `${event.clientX - offsetX}px`;
      this.uiElements.wrapper.style.top = `${event.clientY - offsetY}px`;
    });

    window.addEventListener('pointerup', () => {
      isDragging = false;
    });
  }

  updateSearchResults() {
    this.uiElements.resultTable.innerHTML = '';
    const query = this.uiElements.searchBox.value.trim();

    //検索
    if (!query) return;
    this.NXDatabase.include(query);
    //閉校教室は除く
    this.NXDatabase.searchNXT.filterByCondition(['closed', '']);

    const head = this.NXDatabase.rawNXT.head;
    this.NXDatabase.searchNXT.body.forEach(row => {
      const pickedData = extractByHead(row, head, ['basecd', 'unitname', 'unitcd', 'basename']);
      const rowElement = this.uiElements.resultTable.insertRow();
      const links = `<td><i class="fa-solid fa-circle-info links" title="教室基本情報" cd="${pickedData.basecd}"></i></td><td><i class="fa-solid fa-calendar-days links" title="教室予定" cd="${pickedData.basecd}"></i></td><td><i class="fa-solid fa-door-open links" title="開校予定" cd="${pickedData.basecd}"></i></td>`;
      rowElement.innerHTML = `<td class="cliptext" style="min-width:3.5rem">${pickedData.basecd}</td><td class="badge cliptext noicon offout" clipcontent="${pickedData.unitcd}" title="${pickedData.unitcd}">${pickedData.unitname}</td><td class="cliptext noicon">${pickedData.basename}</td><td class="full">${links}</td>`;
    });

    function extractByHead(row, head, pick) {
      return pick.reduce((acc, key) => {
        const index = head.indexOf(key);
        if (index !== -1) {
          acc[key] = row[index];
        }
        return acc;
      }, {});
    }
  }

  show() {
    this.uiElements.wrapper.style.display = 'block';
    this.uiElements.searchBox.focus();
  }

  close() {
    this.uiElements.wrapper.style.display = 'none';
  }

  addEventListener() {
    document.addEventListener('click', event => {
      const target = event.target.closest('.links'); // `.links` クラスを持つ要素を探す
      if (!target) return;

      const tenpoCd = target.getAttribute('cd');
      let url = null;

      switch (target.getAttribute('title')) {
        case '教室基本情報':
          url = `${NX.CONST.host}/tenpo/tenpo_info_list.aspx?tenpo_cd=${tenpoCd}`;
          break;
        case '教室予定':
          url = `${NX.CONST.host}/schedule/yotei.aspx?tenpo_cd=${tenpoCd}`;
          break;
        case '開校予定':
          url = `${NX.CONST.host}/tenpo_yotei.aspx?tenpo_cd=${tenpoCd}&input_f_dt=${new ExDate().as(
            'yyyy/mm/dd'
          )}&input_t_dt=${new ExDate().aftermonths(1).as('yyyy/mm/dd')}`;
          break;
      }

      if (url) window.open(url, '_blank');
    });
  }
}

/**
 * Class representing a customizable item box for pxdb.
 */
class pxdbItembox {
  /**
   * Create a pxdbItembox.
   * @param {Object} [options={}] - The options to customize the item box.
   * @param {string} [options.addClass] - Additional class to add to the box.
   * @param {Object} [options.attr={}] - Attributes to set on the box element.
   * @param {boolean} [options.header = false] - Flag to add a header to the box.
   * @param {string} [options.headerTxt] - Text to display in the header.
   * @param {boolean} [options.headerBold = false] - Flag to show header text as bold.
   * @param {string} [options.reloadTarget] - Target for the reload button in the header.
   * @param {boolean} [options.fullHeight = false] - Flag to enable fullHeight.
   * @param {boolean} [options.bodyScrollY = false] - Flag to enable vertical scroll for the body.
   * @param {boolean} [options.bodyStreach = false] - Flag to enable streaching the body.
   * @param {boolean} [options.footer = false] - Flag to add a footer to the box.
   * @param {string} [options.footerAlignment] - Footer alignment. Choose from left [center] right.
   */
  constructor(options = {}) {
    const {
      addClass,
      attr = {},
      header = false,
      headerTxt,
      headerBold = false,
      reloadTarget,
      fullHeight = false,
      bodyScrollY = false,
      bodyStreach = false,
      footer = false,
      footerAlignment,
      progBar = false
    } = options;

    /** @type {jQuery} The main container element for the box. */
    this.box = $('<div>', { class: `pxdbItembox ${fullHeight ? 'fullHeight' : ''}` });
    if (addClass) this.box.addClass(addClass);

    // Set attributes from options.attr
    Object.keys(attr).forEach(key => this.box.attr(key, attr[key]));

    // Create header if specified
    if (header) {
      /** @type {jQuery} The header element. */
      this.header = $('<div>', { class: `pxdbItembox_header ${headerBold ? 'bold' : ''}` }).appendTo(this.box);
      if (headerTxt) $('<span>', { class: 'fg-10', text: headerTxt }).appendTo(this.header);
      if (reloadTarget) {
        $('<span>', { class: 'fa-icon-wrap min round reloadbtn', target: reloadTarget })
          .append('<i class="fa-solid fa-rotate"></i>')
          .appendTo(this.header);
      }
    }

    /** @type {jQuery} The body element. */
    this.body = $('<div>', {
      class: `pxdbItembox_body ${bodyScrollY ? 'scrollY' : ''} ${bodyStreach ? 'streach' : ''}`
    }).appendTo(this.box);

    // Create footer if specified
    if (footer) this.footer = $('<div>', { class: `pxdbItembox_footer ${footerAlignment}` }).appendTo(this.box);

    if (progBar) this.progBar = $('<div>', { class: 'pxdbItembox_footer' }).appendTo(this.box);
  }

  /**
   * Append a DOM element to the body of the box.
   * @param {jQuery|HTMLElement|string} dom - The DOM element or HTML string to append to the body.
   * @returns {pxdbItembox} The current instance of pxdbItembox.
   */
  appendToBody(dom) {
    $(dom).appendTo(this.body);
    return this;
  }
  appendToFooter(dom) {
    $(dom).appendTo(this.footer);
    return this;
  }
  setBody(dom) {
    return this.resetBody().appendToBody(dom);
  }
  setFooter(dom) {
    return this.resetFooter().appendToFooter(dom);
  }
  appendNumber(num = '', attrs = {}) {
    const numSpan = $(`<span>${num}</span>`);
    //クラス指定でnumberが消えてしまうのでちょっと変だけどこうする。addClassにしてもいいけど引数がぐちゃるからな、、、
    attrs.class = `${attrs.class || ''} number`;
    Object.keys(attrs).forEach(attr => numSpan.attr(attr, attrs[attr]));
    $('<div>')
      .append(numSpan)
      .appendTo(this.body);
    return this;
  }
  /**
   * Reset the body content by clearing all child elements.
   * @returns {pxdbItembox} The current instance of pxdbItembox.
   */
  resetBody() {
    this.body.html('');
    return this;
  }
  /**
   * Reset the footer content by clearing all child elements.
   * @returns {pxdbItembox} The current instance of pxdbItembox.
   */
  resetFooter() {
    if (!this.footer) {
      console.warn('pxdbItemBox: No Footer was defined.');
      return this;
    }
    this.footer.html('');
    return this;
  }
  setProgBar(initVal = 0, currentVal = 100, cls = '', title = '') {
    if (!this.progBar) {
      console.warn('pxdbItemBox: No ProgBar was defined.');
      return this;
    }
    this.progBar.html(new PX_ProgBar(initVal, currentVal, cls, title).getNode());
  }
  getNode() {
    return $(this.box);
  }
}

class ExDataSaver {
  constructor(tablename) {
    this.tablename = tablename;
    this.#loadfromLS();
  }
  #loadfromLS() {
    this.data = JSON.parse(localStorage.getItem(this.tablename)) || {};
    return this;
  }
  #savetoLS() {
    localStorage.setItem(this.tablename, JSON.stringify(this.data));
    return this;
  }
  read(id, tag) {
    var target = this.data[id] || {};
    return target[tag] || '';
  }
  readAll() {
    return this.data;
  }
  write(id, tag, contentstring) {
    this.data[id] = this.data[id] || {};
    this.data[id][tag] = contentstring;
    this.#savetoLS();
    return this;
  }
  delete(id) {
    delete this.data[id];
    this.#savetoLS();
    return this;
  }
  deleteAll() {
    localStorage.removeItem(this.tablename);
    return this;
  }
}

/**
 * PageNote
 * ページごとにメモを残せる
 * PageNoteをインスタンス化するとドラッグ可能なノートが表示される
 * inputでlocalStorageに書き込み
 * 現状ページのlocation.pathnameで特定している
 */
class PageNote {
  constructor() {
    this.identifier;
    this.data;
    this.div = $('<div class="netzblind" style="display:flex;flex-direction:column;"></div');
    this.UI = {
      head: $('<div>').css({
        display: 'flex',
        'justify-content': 'space-between'
      }),
      grip: $('<i class="fa-solid fa-grip fa-2x" style="color:#2a5caa;margin:5px;"></i>'),
      length: $('<span>'),
      close: $('<i class="fas fa-times fa-2x" style="color:#2a5caa;float:right;margin:5px;"></i>'),
      input: $('<textarea class="pagenote_textarea nx_scrollbar" rows="30" cols="70" style="flex-basis:auto;"></textarea>')
    };
    this.init();
  }
  init() {
    const _this = this;
    this.identifier = location.pathname;
    this.data = JSON.parse(localStorage.getItem('pagenote')) || {};
    this.div
      .appendTo('body')
      .css({
        position: 'fixed',
        left: '850px',
        top: '50px',
        'border-top': 'solid 1px #2a5caa',
        'background-color': 'white'
      })
      .draggable({ handle: '.fa-grip' });
    this.UI.head
      .append(this.UI.grip)
      .append(this.UI.length)
      .append(this.UI.close)
      .appendTo(this.div);
    this.UI.close.on('click', function() {
      _this.input_close();
    });
    this.UI.input
      .appendTo(this.div)
      .val(this.data[this.identifier] || '')
      .on('input', function() {
        const length = _this.UI.input.val().length;
        _this.UI.length.text(`${length}文字`);
        _this.input_write();
      })
      .trigger('input');
  }
  savetoLS() {
    localStorage.setItem('pagenote', JSON.stringify(this.data));
    return this;
  }
  input_write() {
    this.data[this.identifier] = this.UI.input.val();
    this.savetoLS();
  }
  input_close() {
    this.div.hide();
  }
}
//cliptextのクラスを保持する要素をクリックしたらテキストをクリップボードにコピーする
//パラメーターclipcontentを持っていればそれを、なければテキストをコピー
class ClipText {
  constructor() {
    const _this = this;
    this.clipicon = $('<i class="fa-solid fa-clipboard" style="color:#2a5caa"></i>');
    $(document).on('click', '.cliptext', function() {
      const cptxt = $(this).attr('clipcontent') || _this.getonlynode($(this));
      clipper(cptxt);
      PX_Toast(`clickboard copied:${cptxt}`);
    });
    $(document).on('mouseenter', '.cliptext:not(.noicon)', function() {
      _this.clipicon.appendTo(this).show();
    });
    $(document).on('mouseleave', '.cliptext:not(.noicon)', function() {
      _this.clipicon.hide();
    });
  }
  getonlynode(DOMOBJ) {
    var result = '';
    $(DOMOBJ)
      .contents()
      .each(function() {
        if (this.nodeType === 3 && this.data) {
          result += jQuery.trim($(this).text());
        }
      });
    return result;
  }
}

//学校情報を取得する
class SchoolInfoGetter {
  constructor() {}
  getschedule(schoolname, daysrange) {
    if (!schoolname) return false;
    daysrange = daysrange || 60;
    $.get(
      `https://script.google.com/macros/s/AKfycbw-3TEKRgO2PSTX_bAz4hCX5L_NBKKNRshNNwprdKU1jDu_QDc9Lz8ylIgNr-bJE4Pc/exec?schoolname=${encodeURIComponent(
        schoolname
      )}&range=${daysrange}`,
      function(data) {
        window.alert(data.msg || JSON.stringify(data));
      }
    );
    return false;
  }
}
/**
 * Class representing SnapData for managing local storage and fetching data.
 */
class SnapData {
  /**
   * Creates an instance of SnapData.
   * @param {Object} options - Configuration options.
   * @param {string} options.storeName - Name of the store in localforage.
   * @param {string} options.key - The key in store.
   * @param {string} options.url - The URL to fetch data from.
   * @param {number} [options.expire=3600000] - Expiry time in milliseconds (default is 1 hour).
   * @param {boolean} [options.force=false] - Force fetching data regardless of expiry.
   * @param {boolean} [options.nosave=false] - Do not save fetched data to local storage.
   * @param {boolean} [options.useStatic=false] - Use only saved data if available.
   * @param {string} [options.name='SnapData'] - The name to identify in the indexedDB.
   * @throws {Error} - If required arguments are missinsg.
   */
  constructor(options = {}) {
    const { storeName, key, url, expire = 3600000, force = false, nosave = false, useStatic = false, name = 'SnapData' } = options;

    if ((!nosave && (!storeName || !key)) || !url) {
      throw new Error(`SnapData: Missing required arguments. Received storeName: ${storeName}, key: ${key}, url: ${url}`);
    }

    this.options = { storeName, key, url, expire, force, nosave, useStatic, name };
    this.data = null;

    try {
      this.store = localforage.createInstance({ name, storeName });
    } catch (error) {
      console.error('SnapData: Failed to initialize localforage instance', error);
      throw new Error('SnapData: Local storage initialization error.');
    }
  }

  /**
   * Fetches data from local storage or a remote URL.
   * @param {boolean} [force=false] - If true, force fetch from URL regardless of expiry.
   * @returns {Promise<SnapData>} - The SnapData instance with updated data.
   * @throws {Error} - If fetching or local storage access fails.
   */
  async fetchData(force = false) {
    const currentTime = Date.now();
    const shouldForceFetch = force || this.options.force;

    try {
      const storedData = await this.store.getItem(this.options.key);

      if (this.options.useStatic && storedData) {
        this.data = storedData.data;
        return this;
      }

      const isExpired = !storedData || currentTime - storedData.date > this.options.expire;
      if (shouldForceFetch || isExpired) {
        console.log(`SnapData: Fetching data for key "${this.options.key}" from URL due to expiry or missing data.`);

        try {
          const fetchedData = await $.get(this.options.url);
          this.data = fetchedData;

          if (!this.options.nosave) {
            await this.store.setItem(this.options.key, { data: fetchedData, date: currentTime });
          }
        } catch (fetchError) {
          console.error('SnapData: Failed to fetch data from URL', fetchError);
          throw new Error('SnapData: Data fetching error.');
        }
      } else {
        this.data = storedData.data;
      }
    } catch (storageError) {
      console.error('SnapData: Local storage access error', storageError);
      throw new Error('SnapData: Local storage read/write error.');
    }

    return this;
  }

  /**
   * Exports the fetched data.
   * @param {Object} [options={}] - Optional settings.
   * @returns {Promise<Object>} - The fetched data.
   * @throws {Error} - If exporting data fails.
   */
  async exportData(options = {}) {
    try {
      await this.fetchData(options.force);
      return this.data;
    } catch (error) {
      console.error('SnapData: Failed to export data', error);
      throw new Error('SnapData: Data export error.');
    }
  }

  /**
   * Exports the first table element from the fetched data.
   * @param {Object} [options={}] - Optional settings.
   * @param {string} [options.selector='table'] - CSS selector for the table element.
   * @returns {Promise<Object>} - The first table element.
   * @throws {Error} - If no table element is found or export fails.
   */
  async exportTable(options = {}) {
    return this._exportDOMElement({ selector: options.selector || 'table', single: true });
  }

  /**
   * Exports all matched elements based on the provided selector.
   * @param {Object} [options={}] - Optional settings.
   * @param {string} [options.selector='tr'] - CSS selector for elements.
   * @returns {Promise<Object>} - The matched elements.
   * @throws {Error} - If no elements are found or export fails.
   */
  async exportDOMs(options = {}) {
    return this._exportDOMElement({ selector: options.selector || 'tr', single: false });
  }

  /**
   * Private method to export DOM elements based on the selector.
   * @param {Object} options - Settings for exporting DOM elements.
   * @param {string} options.selector - CSS selector for elements.
   * @param {boolean} options.single - Whether to return a single element.
   * @returns {Promise<Object>} - The matched elements.
   * @throws {Error} - If no elements are found or export fails.
   * @private
   */
  async _exportDOMElement({ selector, single }) {
    const forceFetch = this.options.force;

    try {
      await this.fetchData(forceFetch);
      const elements = $(this.data).find(selector);
      if (!elements.length) throw new Error(`SnapData: No elements found with selector "${selector}"`);
      return single ? elements.eq(0) : elements;
    } catch (error) {
      console.error(`SnapData: Failed to export ${single ? 'table element' : 'DOM elements'}`, error);
      throw new Error(`SnapData: ${single ? 'Table' : 'DOM'} export error.`);
    }
  }

  /**
   * Exports data as a formatted table (NXTable).
   * @returns {Promise<Object>} - The formatted NXTable data.
   * @throws {Error} - If formatting fails.
   */
  async exportNXTable(options = {}) {
    try {
      const tableDOM = await this.exportTable();
      const nxTable = $NX(tableDOM).makeNXTable(options);
      if (!nxTable) throw new Error('SnapData: Failed to format NXTable.');
      return nxTable;
    } catch (error) {
      console.error('SnapData: Failed to export NXTable', error);
      throw new Error('SnapData: NXTable export error.');
    }
  }
}

class SnapLog {
  constructor(options = {}) {
    const { storeName, url, name = 'SnapLog', omitSubrow = false } = options;
    this.options = { storeName, url, name, omitSubrow };
    this.data = null;
    try {
      this.store = localforage.createInstance({ name, storeName });
    } catch (error) {
      console.error('SnapLog: Failed to initialize localforage instance', error);
      throw new Error('SnapLog: Local storage initialization error.');
    }
    return this;
  }
  async fetch() {
    const _this = this;
    const keys = await this.store.keys();
    const isMatched = keys.find(key => key.includes(new ExDate().as('yymmdd')));
    if (isMatched) {
      const localforagedata = await _this.store.getItem(isMatched);
      _this.data = new NXTable(localforagedata);
    } else {
      _this.data = await new SnapData({ url: _this.options.url, nosave: true }).exportNXTable({ omitSubrow: _this.options.omitSubrow });
      _this.store.setItem(`${new ExDate().as('yymmdd_HHMM')}`, _this.data);
    }
    return this;
  }
  getNXT() {
    return this.data;
  }
  getForage() {
    return this.store;
  }
}
class EventCalendar {
  constructor() {
    this.data;
    this.init();
  }
  init() {
    this.getDataFromLS();
  }
  getDataFromLS() {
    const _this = this;
    _this.data = JSON.parse(localStorage.getItem('EC_data')) || {};
    return this;
  }
  saveDataToLS() {
    const _this = this;
    localStorage.setItem('EC_data', JSON.stringify(_this.data));
    return this;
  }
  async getJukenData(tenpo_cd = 'a5031', nendo = '2023') {
    const _this = this;
    const url = `${NX.CONST.host}/jyuken/goukaku_list_body.aspx?tenpo_cd=${tenpo_cd}&nendo=${nendo}&jyuken_cb=&gakkou_cb=&nyushi_cb=&kekka_cb=&gakubu_flg=1&nyushi_dt_flg=1&kekka_dt_flg=1&jyuken_no_flg=1&sort=1`;
    const ajxdata = await $.get(url);
    _this.data.EntranceExam = [];
    $(ajxdata)
      .find('tr')
      .each(function(e) {
        if (e == 0) return true;
        const tds = $(this).find('td');
        _this.data.EntranceExam.push({
          base: tds.eq(0).text(),
          student_cd: tds.eq(1).text(),
          student_nm: tds.eq(2).text(),
          student_school: tds.eq(3).text(),
          student_grade: tds.eq(4).text(),
          exam_target: tds.eq(5).text(),
          exam_school: tds.eq(6).text(),
          exam_faculty: tds.eq(7).text(),
          exam_pp: tds.eq(8).text(),
          exam_way: tds.eq(9).text(),
          exam_date: tds.eq(10).text(),
          exam_announce: tds.eq(11).text(),
          exam_result: tds.eq(13).text(),
          exam_finally: tds.eq(15).text()
        });
      });
    _this.saveDataToLS();
    return this;
  }
  outputForFullCall(option = { exam: true, annouce: false, onlyfuture: false }) {
    const _this = this;
    if (!_this.data) _this.getDataFromLS();
    var eventdata = [];
    _this.data.EntranceExam.forEach(function(elem) {
      if (option.exam && elem.exam_date != '') {
        if (option.onlyfuture == false || _this.yearassign(elem.exam_date).compare(new ExDate().afterdays(-1)).forward) {
          var ex = Object.assign({}, elem);
          ex.title = `入試：${elem.exam_school}(${elem.student_nm})`;
          ex.start = _this.yearassign(elem.exam_date).as('yyyy-mm-dd');
          eventdata.push(ex);
        }
      }
      if (option.annouce && elem.exam_announce != '') {
        if (option.onlyfuture == false || _this.yearassign(elem.exam_announce).compare(new ExDate().afterdays(-1)).forward) {
          var ann = Object.assign({}, elem);
          ann.title = `合格発表：${elem.exam_school}(${elem.student_nm})`;
          ann.start = _this.yearassign(elem.exam_announce).as('yyyy-mm-dd');
          ann.backgroundColor = '#c93726';
          eventdata.push(ann);
        }
      }
    });
    return eventdata;
  }
  openmodal(text) {
    const dialog = $('<dialog class="nx"></dialog>')
      .appendTo('body')
      .on('click', function() {
        $(this).remove();
      });
    text.split(/\n/).forEach(function(elem) {
      $(`<span style="display:block">${elem}</span>`).appendTo(dialog);
    });
    dialog[0].showModal();
  }
  /**
   * 月/日しかデータがない場合、６月を堺に当年、前年を割り当て　※これ、、、年末と年始で変わる・・・
   * @param {*} monthdate
   * @returns
   */
  yearassign(monthdate) {
    var temp = new ExDate(monthdate);
    const thisy = parseInt(new ExDate().as('yyyy'));
    if (temp.getMonth() > 6) {
      return temp.setDateTry(thisy - 1);
    } else {
      return temp.setDateTry(thisy);
    }
  }
}
class AjaxstudentInfoClass {
  constructor() {}
  async studentsInBase(yearmonth) {
    const _this = this;
    yearmonth = yearmonth || new ExDate().as('yyyy/mm');
    const url = `${NX.CONST.host}/u/gessya_tenpo.aspx?shido_ng=${yearmonth}&gakunen_cb=&hyoji_cb=1&tenpo_cd=`;
    const ajx = await $.get(url);
    const rtn = {};
    $(ajx)
      .find('tr:gt(1)')
      .each(function() {
        const $tr = $(this);
        const basecd = new NXBase($tr.findTdGetTxt(0)).getCd();
        if (basecd) {
          //prettier-ignore
          rtn[basecd] = {
            fee: $tr.findTdGetTxt(1),
            count: $tr.findTdGetTxt(2),
            average: $tr.findTdGetTxt(3)
          }
        }
      });
    return rtn;
  }
  async CancelsInBase(from, to, caption) {
    if (!from || !to) return false;
    caption = caption ? `_${caption}` : '';
    const url = `${NX.CONST.host}/k/kaiyaku_list_body.aspx?tenpo_cd=&disp_cb=3&input_dt1=${from}&input_dt2=${to}&kaiyaku_cb=&status_cb=7&end_dt=&sort_cb=1`;
    const CancelTable = await new SnapData('SnapData', `CancelInBase${caption}`, url, {
      storeName: 'DashBoard',
      expire: 5 * 60 * 60 * 1000
    }).exportNXTable();
    return CancelTable.analyze('教室', ['区分', 'count', 'count'])
      .replace('教室', cell => new NXBase(cell).getCd())
      .export('dictionary');
  }
  async NoteInBase() {
    const rtn = {};
    const NoteDataTable = await new SnapData('SnapData', 'NoteInBase', `${NX.CONST.host}/s/student_renraku_shukei.aspx?tenpo_cd=`, {
      storeName: 'DashBoard',
      expire: 60 * 60 * 1000
    }).exportDOMs('tr:gt(0)');
    NoteDataTable.each(function() {
      const $tr = $(this);
      const basecd = new NXBase($tr.findTdGetTxt(0)).getCd();
      if (basecd) {
        //prettier-ignore
        rtn[basecd] = {
            past: $tr.findTdGetTxt(3),
            today: $tr.findTdGetTxt(4),
            total: $tr.findTdGetTxt(7),
            compensation: $tr.findTdGetTxt(8),
          }
      }
    });
    return rtn;
  }
  /**
   * 売上情報を取得　※税抜（税率10%）
   * @param {string} student_cd
   * @param {string} yearmonth - yyyy/mm 未指定なら当月
   * @param {string} caption - 売上科目 未指定なら月謝
   * @returns {Object} rtn - オブジェクトで戻る
   * @returns {string} rtn.fee - 売上値
   */
  async fee(student_cd, yearmonth = new ExDate().as('yyyy/mm'), caption = '月謝') {
    const _this = this;
    if (!_this.cdTest(student_cd)) return null;
    const url = `${NX.CONST.host}/u/uriage_input.aspx?student_cd=${student_cd}&course=1`;
    const ajx = await $.get(url);
    const table = $(ajx)
      .find('table')
      .eq(0);
    const nxtable = $NX(table).makeNXTable();
    return {
      student_cd: student_cd,
      yearmonth: yearmonth,
      caption: caption,
      fee: nxtable.sumifs('売上額', ['売上年月', yearmonth], ['科目', caption]).toLocaleString(),
      course: nxtable.xlookup(yearmonth, '売上年月', 'コース'),
      nxtable: nxtable
    };
  }
  async kitei(student_cd, yearmonth = new ExDate().as('yyyy/mm')) {
    //前もそうだった気がするけど、何故か規定回数画面は取得できない
    const _this = this;
    if (!_this.cdTest(student_cd)) return null;
    const url = `${NX.CONST.host}/kanren/student_kaisu_list3.aspx?student_cd=${student_cd}`;
    //const table = await new SnapData('null', 'null', url, { nosave: true }).exportTable();
    const ajx = await $.get(url);
    console.log('ajx', $(ajx).find('table'));
    const table = $(ajx).find('table');
    table
      .find('tr')
      .eq(1)
      .remove();
    console.log('table', $(table));
    const nxtable = $NX(table).makeNXTable({ omitSubrow: true });
    console.log('nxtable', nxtable);
    return {
      student_cd: student_cd,
      yearmonth: yearmonth,
      kitei: nxtable.xlookup(yearmonth.replace('/', ''), '年月', '１対１指導（50分）_2'),
      nxtable: nxtable
    };
  }
  async kihonCount(student_cd) {
    const _this = this;
    if (!_this.cdTest(student_cd)) return null;
    var rtn = {
      ICT: 0,
      指導: 0,
      oneonone: 0,
      来校: 0,
      演習: 0
    };
    const url = `${NX.CONST.host}/tehai/shido2_base_input.aspx?student_cd=${student_cd}&disp_flg=1`;
    const ajx = await $.get(url);
    //prettier-ignore
    $(ajx).find('table:contains("区分")').find('tr').each(function(){
      switch($(this).find('td').eq(5).text().trim()){
        case 'ICT':
          rtn['ICT']++;
          break;
        case '指導':
          rtn['指導']++;
          break;
        case '1on1':
          rtn['oneonone']++;
          break;
        case '来校':
          rtn['来校']++;
          break;
        case '演習':
          rtn['演習']++;
          break;        
      }
    })
    rtn['student_cd'] = student_cd;
    return rtn;
  }
  async lectureReport(shido_id, kind = '1to1', check = false) {
    const _this = this;
    if (!shido_id) return null;
    const url = { '1to1': `${NX.CONST.host}/kanren/shido_kiroku_input2.aspx`, '1on1': `${NX.CONST.host}/netz/netz1/ai/1on1_input.aspx` }[kind];
    const ajx = await $.get(`${url}?shido_id=${shido_id}`);
    var rtn = {};
    $(ajx)
      .find('textarea,input[type=radio]:checked')
      .each(function() {
        rtn[$(this).attr('name')] = $(this).val();
      });
    rtn['student_cd'] = $(ajx)
      .find('input[name=student_cd]')
      .val();
    if ((kind = '1to1' && check)) {
      const param = {
        shido_id: shido_id,
        syori: JSON.stringify([['input[name="b_submit"]', 'click', 'nextpage'], ['close']])
      };
      chrome.runtime.sendMessage({
        opennetzbackEx: `${NX.CONST.host}/kanren/shido_kiroku_check.aspx?${$.param(param)}`
      });
    }
    return rtn;
  }
  async coach(student_cd) {
    const listNXT = await this.getListNXT(student_cd);
    const coachRaw = listNXT.xlookup(student_cd, '生徒NO', '担任').split('副：');
    return {
      main: coachRaw[0],
      subcoach: coachRaw.slice(1),
      student_cd: student_cd
    };
  }
  async coachs(student_cds) {
    const listNXT = await this.getListNXT(student_cds);
    return listNXT.pickColumns(['生徒NO', '担任']).export('dictionary');
  }
  async getListNXT(student_cds) {
    let select_cd = null;
    if (Array.isArray(student_cds)) {
      select_cd = student_cds.filter(elem => this.cdTest(elem)).join();
    } else {
      select_cd = this.cdTest(student_cds) ? student_cds : null;
    }
    if (!select_cd) {
      console.warn(`ASI: Invalid student_cds. Argument must string or array of strings.`);
      console.warn(`ASI: Given argument. ${student_cds}`);
      return false;
    }
    const url = `${NX.CONST.host}/student_list_body.aspx?select_cd=${student_cds}&cd_flg=1&mynetz_flg=1&ch_flg=1&course_ng=2024/06&naisen_flg=1&student_kt_flg=1&gakkou_flg=1&tanto_flg=1&tel_flg=1&keitai_tel_flg=1&seibetsu_flg=1&mail_flg=1&course_flg=1&contents_flg=1&next_shido_flg=1`;
    return await new SnapData({ url: url, nosave: true }).exportNXTable();
  }
  async profile(student_cd) {
    if (!this.cdTest(student_cd)) return null;
    const url = `${NX.CONST.host}/s/student_profile_input.aspx?student_cd=${student_cd}`;
    const ajx = await $.get(url);
    const rtn = {
      student_cd: student_cd
    };
    $(ajx)
      .find('input')
      .each(function() {
        const $input = $(this);
        const $inputName = $input.attr('name');
        switch ($input.attr('type')) {
          case 'radio':
            if ($input.prop('checked')) rtn[$inputName] = $input.siblings('span').text();
            break;
          default:
            rtn[$inputName] = $input.val();
            break;
        }
      });
    return rtn;
  }
  cdTest(student_cd) {
    return student_cd && /\d{6}/.test(student_cd);
  }
}
/**
 * [studentcdlinker]Jqueryオブジェクト(table)内のstudent_cdに連絡事項のリンクを貼る
 * @param {number} eq student_cdが含まれるtdのeq 空欄ならgetTableHeadでcdかCDを検索
 * @return {object} this
 */
$.fn.studentcdlinker = function(eq) {
  if (!eq) {
    const tablehead = $(this).getTableHead;
    eq = tablehead['cd'] || tablehead['CD'] || 0;
  }
  $(this)
    .find('tr')
    .each(function() {
      const $td = $(this)
        .find('td')
        .eq(eq);
      const innerText = $td.text();
      if (!$NX(innerText).isHexaNumber()) return true;
      const linkobj = $('<a>', {
        href: `${NX.CONST.host}/s/student_renraku_list.aspx?student_cd=${innerText}`,
        target: `student_renraku_list_${innerText}`,
        css: { 'text-decoration': 'none', color: 'black' },
        text: innerText,
        class: 'studentLinker'
      });
      $td.html(linkobj);
    });
  return this;
};

$.fn.studentLinker = function(cdEq) {
  const $table = $(this);
  const $thead = $table.getTableHead();
  //cdの位置が指定されていなければ、cd,CDのヘッドを探す
  cdEq = cdEq || $thead.cd || $thead.CD || 0;

  $table.find('tr').each(function() {
    const $cdTd = $(this)
      .find('td')
      .eq(cdEq);
    const cd = $cdTd.text();
    //６桁の数字でなければスルー
    if (!$NX(cd).isHexaNumber()) return true;
    $cdTd.html(
      $('<a></a>', {
        href: `${NX.CONST.host}/s/student_renraku_list.aspx?student_cd=${cd}`,
        target: `student_renraku_list_${cd}`,
        text: cd,
        class: 'silent studentLinker',
        student_cd: cd
      })
    );
  });
};
class memberLinkMenu {
  constructor() {
    this.Menu = {};
    this.open = false;
  }

  get memberKind() {
    return this.getClassData().memberKind || 'member';
  }

  init() {
    this.initMenu();
    this.setListener();
  }

  setListener() {
    const _Class = this;
    $(document).on('contextmenu', `.${this.memberKind}Linker`, function() {
      const member_cd = $(this).attr(`${_Class.memberKind}_cd`);
      const member_nm = $(this).attr(`${_Class.memberKind}_nm`) || member_cd;
      if (!$NX(member_cd).isHexaNumber()) return false;
      _Class.setMember(member_cd, member_nm);
      return false;
    });
  }

  initMenu() {
    //メニューの初期化処理
  }

  createMenuItem({ label, icon, action, shortcutKey }) {
    $('<p></p>')
      .append(`<i class="fa-solid fa-${icon}"></i> <span label="${label}">${label}</span>`)
      .appendTo(this.Menu.list)
      .on('click', () => {
        action();
        this.closeMenu();
      })
      .setshortcutkey(shortcutKey);
  }
  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => PX_Toast(`${text} をコピーしました`));
  }
  fetchTaskCount(member_cd) {
    const url = `${NX.CONST.host}/todo/todo_list.aspx?user_cd=${member_cd}&todo_cb=1`;
    $.get(url, data => {
      const count = $(data).find('tr').length - 1;
      PX_Toast(`タスク ${count} 件`);
    });
  }
  setMember(member_cd, member_nm) {
    if (!member_cd) return;
    this.member_cd = member_cd;
    this.member_nm = member_nm || `cd-only:${member_cd}`;
    $(this.Menu.list)
      .find('[label="生徒名"],[label="講師名"]')
      .text(member_nm);
    $(this.Menu.list)
      .find('[label="cd"]')
      .text(member_cd);
    this.Menu.netzmemo.val('').netzmemorize(member_cd);
    this.showMenu();
  }
  showMenu() {
    this.open = true;
    this.Menu.div
      .mouseposition()
      .appendTo('body')
      .show();
  }

  closeMenu() {
    this.open = false;
    this.Menu.div.hide();
  }

  openNMwindow(path, params = {}) {
    window.open(`${NX.CONST.host}${path}?${$.param({ student_cd: this.member_cd, ...params })}`);
  }

  getClassData() {
    return {
      memberKind: 'member'
    };
  }
}

class studentLinkMenu extends memberLinkMenu {
  constructor() {
    super();
    this.init(); // 親クラスの init() を明示的に呼び出し
  }
  setListener() {
    super.setListener();
    const _Class = this;
    $(document).on('click', `.studentLinker`, function() {
      const member_cd = $(this).attr(`${_Class.memberKind}_cd`);
      if ($NX(member_cd).isHexaNumber()) window.open(`${NX.CONST.host}/s/student_renraku_list.aspx?student_cd=${member_cd}`);
    });
  }
  initMenu() {
    this.Menu.div = $('<div class="memberLinkerMenu"></div>').draggable();
    this.Menu.list = $('<div class="memberLinkerMenu_list"></div>').appendTo(this.Menu.div);
    this.Menu.nametip = $('<span></span>');
    this.Menu.cdtip = $('<span></span>');
    this.Menu.netzmemo = $('<input>', { type: 'text' }).appendTo(this.Menu.list);

    const menuItems = [
      { label: '生徒名', icon: 'clipboard', action: () => this.copyToClipboard(this.member_nm) },
      { label: 'cd', icon: 'clipboard', action: () => this.copyToClipboard(this.member_cd) },
      { label: '連絡事項(m)', icon: 'rectangle-list', shortcutKey: 'm', action: () => this.openNMwindow('/s/student_renraku_list.aspx') },
      { label: '生徒プロファイル(p)', icon: 'user', shortcutKey: 'p', action: () => this.openNMwindow('/s/student_profile_input.aspx') },
      {
        label: '生徒教務ボード',
        icon: 'tachograph-digital',
        action: () =>
          this.openNMwindow('/sso/mobilenetzmenu.aspx', {
            student_cd: this.member_cd,
            app_name: 'forlecturer',
            page_kind: 3,
            method_name: 'tannincheck'
          })
      },
      { label: 'タスク確認', icon: 'circle-exclamation', action: () => this.fetchTaskCount(this.member_cd) },
      { label: '本日入退館履歴', icon: 'circle-exclamation', action: () => this.showInOutHistory(this.member_cd) },
      {
        label: '成績管理(s)',
        icon: 'chart-line',
        shortcutKey: 's',
        action: () =>
          this.openNMwindow('/sso/mobilenetzmenu.aspx', {
            student_cd: this.member_cd,
            app_name: 'forlecturer',
            page_kind: 3,
            method_name: 'seiseki'
          })
      },
      {
        label: 'トーク(t)',
        icon: 'comment',
        shortcutKey: 't',
        action: () =>
          this.openNMwindow('/talk/talkmenu.aspx', {
            student_cd: this.member_cd,
            talk_type: 'student',
            personal_talk: 'true'
          })
      },
      {
        label: 'アプリスケジュール(a)',
        icon: 'calendar-days',
        shortcutKey: 'a',
        action: () =>
          this.openNMwindow('/sso/mobilenetzmenu.aspx', {
            student_cd: this.member_cd,
            app_name: 'forlecturer',
            page_kind: 3,
            method_name: 'tsuujuku'
          })
      }
    ];

    menuItems.forEach(item => this.createMenuItem(item));

    $('<i class="fa-solid fa-xmark fa-lg" style="position:absolute;right:10px;top:20px;color:#ab3a2b;"></i>')
      .appendTo(this.Menu.div)
      .setshortcutkey('x')
      .on('click', () => this.closeMenu());
  }

  showInOutHistory(member_cd) {
    const url = `${NX.CONST.host}/s/student_inout_list.aspx?student_cd=${member_cd}`;
    $.get(url, data => {
      const text =
        $(data)
          .find('table tr')
          .eq(2)
          .text()
          .trim() || '本日入退館履歴なし';
      alert(text);
    });
  }

  getClassData() {
    return {
      ...super.getClassData(), // 親クラスの情報を継承
      memberKind: 'student'
    };
  }
}

class teacherLinkMenu extends memberLinkMenu {
  constructor() {
    super();
    this.init(); // 親クラスの init() を明示的に呼び出し
  }

  initMenu() {
    this.Menu.div = $('<div class="memberLinkerMenu offsecondary"></div>').draggable();
    this.Menu.list = $('<div class="memberLinkerMenu_list"></div>').appendTo(this.Menu.div);
    this.Menu.nametip = $('<span></span>');
    this.Menu.cdtip = $('<span></span>');
    this.Menu.netzmemo = $('<input>', { type: 'text' }).appendTo(this.Menu.list);

    const menuItems = [
      { label: '講師名', icon: 'clipboard', action: () => this.copyToClipboard(this.member_nm) },
      { label: 'cd', icon: 'clipboard', action: () => this.copyToClipboard(this.member_cd) },
      {
        label: '講師情報(i)',
        icon: 'user',
        shortcutKey: 'i',
        action: () => {
          window.open(`${NX.CONST.host}/t/teacher_data.aspx?teacher_cd=${this.member_cd}`);
        }
      },
      {
        label: '指導予定(l)',
        icon: 'person-chalkboard',
        shortcutKey: 'l',
        action: () => {
          window.open(`${NX.CONST.host}/kanren/teacher_shido_yotei.aspx?teacher_cd=${this.member_cd}`);
        }
      },
      {
        label: '講師スケ(s)',
        icon: 'calendar-days',
        shortcutKey: 's',
        action: () => {
          window.open(`${NX.CONST.host}/t/teacher_schedule_list.aspx?teacher_cd=${this.member_cd}`);
        }
      },
      {
        label: '出勤簿(w)',
        icon: 'building-circle-check',
        shortcutKey: 'w',
        action: () => {
          window.open(`${NX.CONST.host}/t/worktime_teacher_list.aspx?teacher_cd=${this.member_cd}`);
        }
      },
      {
        label: 'トーク(t)',
        icon: 'comment',
        shortcutKey: 't',
        action: () =>
          this.openNMwindow('/talk/talkmenu.aspx', {
            teacher_cd: this.member_cd,
            talk_type: 'Lecturer',
            personal_talk: 'true'
          })
      }
    ];

    menuItems.forEach(item => this.createMenuItem(item));

    $('<i class="fa-solid fa-xmark fa-lg" style="position:absolute;right:10px;top:20px;color:#ab3a2b;"></i>')
      .appendTo(this.Menu.div)
      .setshortcutkey('x')
      .on('click', () => this.closeMenu());
  }
  getClassData() {
    return {
      ...super.getClassData(), // 親クラスの情報を継承
      memberKind: 'teacher'
    };
  }
}

$.fn.textarearesizer = function() {
  $(this).height(60);
  $(this).on('input', function() {
    if (this.scrollHeight > this.offsetHeight) {
      $(this).height(this.scrollHeight);
    } else {
      var lineHeight = Number($(this).height() - lineHeight);
      //↑要らない・・・？
    }
  });
};
/**
 * emppicker 社員cdのピッカー　名前で検索可能
 * 1.1 multipleでなくて、検索結果が１つの場合、エンターキーでそのままインプットする
 * 2.0 内部構造をクラスにし、汎用化
 */
$.fn.emppicker = function(options = {}) {
  this.offAutocomplete();
  //強制半角 falseを適用
  this.on('contextmenu', function() {
    const offset = $(this).offset();
    const height = $(this).outerHeight();

    offset.top += height; // 要素の下にずらす

    new EmployMan(this, offset, options.multiple).show();
    return false;
  });
};

/**
 * tooltip: 指定要素に対してtooltipを表示する
 * @version 1.0
 * @param {string} [text] - 表示させるテキスト
 * @param {Object} [options] - オプション
 * @param {number} [options.timelimit] - 表示期限をミリ秒で指定 ※ 元要素が消えても消せない問題
 * @returns {jQuery} - チェーンメソッドのためのjQueryオブジェクト
 */
$.fn.tooltip = function(text, options) {
  options = options || {};
  options.timelimit = options.timelimit || false;

  let tooltipDiv;

  $(this)
    .mouseover(function() {
      const offset = $(this).offset();
      const width = $(this).width();
      showTooltip(text, offset, width);

      if (options.timelimit) {
        setTimeout(hideTooltip, options.timelimit);
      }
    })
    .mouseout(function() {
      hideTooltip();
    });

  function showTooltip(showText, offset, width) {
    $('.nx_tt').remove();

    if (showText !== '') {
      tooltipDiv = $('<div class="nx_tt"></div>')
        .text(showText)
        .appendTo('body')
        .css({
          top: offset.top,
          left: offset.left + width + 5
        });
    } else {
      tooltipDiv = $('<div />'); // 要素がない場合の処理
    }
  }

  function hideTooltip() {
    tooltipDiv.remove();
  }

  return this;
};
/**
 * jQueryプラグイン: inputの値を増加させる
 * @param {number} val - 増加させる値
 * @returns {jQuery} - チェーンメソッドのためのjQueryオブジェクト
 */
$.fn.inputIncrease = function(val) {
  /**
   * @type {number}
   */
  const nowval = +$(this).val();

  /**
   * @type {number}
   */
  const newVal = nowval + val;
  $(this).val(newVal);

  return this;
};
/**
 * HTML要素の直下のテキストのみを取得
 * @returns {string} - テキストのみ
 */
$.fn.textonlynode = function() {
  let result = '';
  this.contents().each(function() {
    if (this.nodeType === 3 && this.data) {
      result += this.textContent.trim();
    }
  });
  return result;
};

/**
 * tableToCSV ver1.0
 * tableをCSVとして変換する DOMを入れても、class,idで指定してもよい
 * separatorはcsvならデフォルトのカンマでOK　エクセルに貼り付けるならタブ'\t'にする
 * [...target.rows]は Array.from(target.rows)でも良いが、こっちのほうが早い？らしい。
 * v1.0: 作成
 * @param {*} table [html element or class,id]
 * @param {int} [separator] [optional:cells separator, default comma]
 * @returns
 */
function tableToCSV(table, separator = ',') {
  let target = table instanceof HTMLElement ? table : document.querySelector(table);
  if (!target || target.nodeName.toLowerCase() !== 'table') {
    console.log("argument isn't table element");
    return null;
  }
  return [...target.rows].reduce((csv, row) => {
    return `${csv}${[...row.cells].map(cell => cell.innerText).join(separator)}\n`;
  }, '');
}
/**
 * Converts an HTML <table> element into a Markdown-formatted table string.
 *
 * This function accepts either a direct reference to a <table> element
 * or a CSS selector string to locate the table in the DOM.
 *
 * @param {HTMLElement|string} table - The HTMLTableElement or a CSS selector string pointing to a table.
 * @returns {string|null} The Markdown string representation of the table, or null if the input is invalid.
 *
 * @example
 * // Using a CSS selector
 * const markdown = tableToMarkdown('#myTable');
 * console.log(markdown);
 *
 * @example
 * // Using a direct element reference
 * const element = document.querySelector('table');
 * const markdown = tableToMarkdown(element);
 *
 * @throws Will not throw, but logs a message to the console if the input is invalid.
 */
function tableToMarkdown(table) {
  const target = table instanceof HTMLElement ? table : document.querySelector(table);
  if (!target || target.nodeName.toLowerCase() !== 'table') {
    console.log("argument isn't table element");
    return null;
  }

  const rows = Array.from(target.rows);
  if (rows.length === 0) return '';

  let markdown = '';
  const colCount = rows[0].cells.length;

  // 1行目：ヘッダー
  const headers = Array.from(rows[0].cells).map(cell => cell.textContent.trim());
  markdown += '| ' + headers.join(' | ') + ' |\n';

  // 区切り行（---）
  markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n';

  // データ行
  for (let i = 1; i < rows.length; i++) {
    const cells = Array.from(rows[i].cells).map(cell => cell.textContent.trim());
    markdown += '| ' + cells.join(' | ') + ' |\n';
  }

  return markdown;
}
function post_to_addr_setter() {
  $('input[name=b_post_to_addr]').on('contextmenu', function() {
    let adrs =
      $('input[name=jyusyo1_nm]').val() + $('input[name=jyusyo2_nm]').val() + $('input[name=jyusyo3_nm]').val() + $('input[name=jyusyo4_nm]').val();
    window.open(`https://www.google.co.jp/maps/place/${adrs}/`);
    return false;
  });
}
function makeOption(array) {
  return array.map(elem => `<option value="${elem[0]}">${elem[1]}</option>`).join('');
}
//★★★★★★★★グローバル変数★★★★★★★★
//★教室のリスト
const SLM = new studentLinkMenu();
const TLM = new teacherLinkMenu();
const SIG = new SchoolInfoGetter();
const ASI = new AjaxstudentInfoClass();
const EC = new EventCalendar();
//★★★★★★★★設定用定数★★★★★★★★
var TG = TG || {};

TG.workingHours = {
  usual: {
    capt: '通常勤怠',
    月: { from: '14:00', to: '22:00' },
    火: { from: '14:00', to: '22:00' },
    水: { from: '14:00', to: '22:00' },
    木: { from: '13:00', to: '22:00' },
    金: { from: '14:00', to: '22:00' },
    土: { from: '10:40', to: '21:20' },
    日: { from: '10:40', to: '18:40' }
  },
  vacA: {
    capt: '講習Ａ勤怠',
    月: { from: '10:40', to: '19:00' },
    火: { from: '10:40', to: '19:00' },
    水: { from: '10:40', to: '19:00' },
    木: { from: '10:40', to: '19:00' },
    金: { from: '10:40', to: '19:00' },
    土: { from: '10:40', to: '19:00' },
    日: { from: '10:40', to: '19:00' }
  },
  vacB: {
    capt: '講習Ｂ勤怠',
    月: { from: '13:00', to: '21:20' },
    火: { from: '13:00', to: '21:20' },
    水: { from: '13:00', to: '21:20' },
    木: { from: '13:00', to: '21:20' },
    金: { from: '13:00', to: '21:20' },
    土: { from: '13:00', to: '21:20' },
    日: { from: '13:00', to: '21:20' }
  },
  vacC: {
    capt: '講習Ｃ勤怠',
    月: { from: '10:40', to: '21:20' },
    火: { from: '10:40', to: '21:20' },
    水: { from: '10:40', to: '21:20' },
    木: { from: '10:40', to: '21:20' },
    金: { from: '10:40', to: '21:20' },
    土: { from: '10:40', to: '21:20' },
    日: { from: '10:40', to: '21:20' }
  },
  exam: {
    capt: '模試勤怠',
    月: { from: '8:30', to: '17:00' },
    火: { from: '8:30', to: '17:00' },
    水: { from: '8:30', to: '17:00' },
    木: { from: '8:30', to: '17:00' },
    金: { from: '8:30', to: '17:00' },
    土: { from: '8:30', to: '17:00' },
    日: { from: '8:30', to: '17:00' }
  },
  headU: {
    capt: '本部通常勤怠',
    月: { from: '11:00', to: '20:00' },
    火: { from: '11:00', to: '20:00' },
    水: { from: '11:00', to: '20:00' },
    木: { from: '11:00', to: '20:00' },
    金: { from: '11:00', to: '20:00' },
    土: { from: '10:40', to: '21:20' },
    日: { from: '10:40', to: '18:40' }
  },
  headV: {
    capt: '通常勤怠',
    月: { from: '11:00', to: '20:00' },
    火: { from: '11:00', to: '20:00' },
    水: { from: '11:00', to: '20:00' },
    木: { from: '11:00', to: '20:00' },
    金: { from: '11:00', to: '20:00' },
    土: { from: '11:00', to: '20:00' },
    日: { from: '11:00', to: '20:00' }
  }
};

//全社の日程選択型講座を取得
if (false) {
  $(function() {
    if (location.pathname == '/netz/netz1/shingaku/kouza_enshu_list2.aspx') {
      popmenut_F2.setContentFunction(function() {
        $('<button>全教室の登録者を表示</button>')
          .appendTo(this)
          .on('click', function() {
            var ajxdata, tenpo_id;
            var kouza_id = $('input[name=shingaku_id]').val();
            $('table')
              .find('tr')
              .each(async function() {
                if (!$(this).attr('id')) return true;
                tenpo_id = $(this)
                  .attr('id')
                  .replace('td', '');
                ajxdata = await $.get(
                  `${NX.CONST.host}/shingaku/kouza_enshu_jyuko_list.aspx?shingaku_id=${kouza_id}&kaiko_tenpo_cd=${tenpo_id}&tenpo_cd=${tenpo_id}`
                );
                $(ajxdata)
                  .find('#student_list')
                  .find('table')
                  .appendTo('body');
                $(this).remove();
              });
            popmenut_F2.closemenu();
          });
      });
    }
  });
}
//進学教室を取得
if (false) {
  $(function() {
    if (location.pathname == '/netz/netz1/shingaku/kouza_list.aspx') {
      popmenut_F2.setContentFunction(function() {
        $('<button>全教室の登録者を表示</button>')
          .appendTo(this)
          .on('click', function() {
            var ajxdata, tenpo_id;
            var kouza_id = 52786; //$('input[name=shingaku_id]').val();
            $('table')
              .find('tr')
              .each(async function() {
                if (!$(this).attr('id')) return true;
                kouza_id = $(this)
                  .attr('id')
                  .replace('td', '');
                ajxdata = await $.get(`${NX.CONST.host}/shingaku/kouza_jyuko_list.aspx?shingaku_id=${kouza_id}`);
                $(ajxdata)
                  //.find('#student_list')
                  .find('table')
                  .eq(2)
                  .appendTo('body');
                $(this).remove();
              });
            popmenut_F2.closemenu();
          });
      });
    }
  });
}

//手配情報クリーナー
//手配情報を一気に手配済みにする関数F2menuから発火可能
//使わないときはifの中をfalseにする
if (true) {
  $(function() {
    switch (location.pathname) {
      case '/netz/netz1/tehai/tehai_list_body.aspx':
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            type: 'button',
            text: 'すべて処理済',
            class: 'nx',
            on: {
              click: function() {
                $('input[value="手配票"]').each(function() {
                  //prettier-ignore
                  const tehaicd = $(this).attr('name').replace('b_open', '');
                  chrome.runtime.sendMessage({
                    opennetzbackEx: `${NX.CONST.host}/tehai/tehai_input.aspx?tehai_cd=${tehaicd}&doAction=setDone`
                  });
                });
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
          $('<button>', {
            type: 'button',
            text: 'すべて強制処理済',
            class: 'nx offdanger',
            on: {
              click: function() {
                $('input[value="手配票"]').each(function() {
                  //prettier-ignore
                  const tehaicd = $(this).attr('name').replace('b_open', '');
                  chrome.runtime.sendMessage({
                    opennetzbackEx: `${NX.CONST.host}/tehai/tehai_input.aspx?tehai_cd=${tehaicd}&doAction=setDone&forceSubject=true`
                  });
                });
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
          $('<button>', {
            type: 'button',
            text: 'すべて自動処理',
            class: 'nx',
            on: {
              click: function() {
                $('input[value="手配票"]').each(function() {
                  //prettier-ignore
                  const tehaicd = $(this).attr('name').replace('b_open', '');
                  chrome.runtime.sendMessage({
                    opennetzbackEx: `${NX.CONST.host}/tehai/tehai_input.aspx?tehai_cd=${tehaicd}&doAction=setAuto`
                  });
                });
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
        });
        break;
    }
  });
}

//教室基本情報書き換え
if (true) {
  $(function() {
    const inputdata = {
      '[name=keiyaku_tanto1_nm]': '伊東（オンラインorリモート）',
      '[name=keiyaku_tanto2_nm]': '田尻（オンラインorリモート）',
      '[name=keiyaku_tanto3_nm]': '（対面）'
    };
    switch (location.pathname) {
      case '/netz/netz1/tenpo/tenpo_info_list.aspx':
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            text: '教室基本情報書き換え',
            on: {
              click: () => {
                //広島県で閉校でない実店舗を拾う
                const hiroshimaList = new NXBase().rawNXT.filterByCondition(['unitcd', 'b34', false], ['closed', ''], ['realbase', 'TRUE']);
                (hiroshimaList.getColumn('basecd') || []).forEach(basecd => {
                  window.open(`${NX.CONST.host}/tenpo/tenpo_info_input.aspx?tenpo_cd=${basecd}&inputmode=true`);
                });
              }
            }
          }).appendTo(this);
        });
        break;
      case '/netz/netz1/tenpo/tenpo_info_input.aspx':
        if (NX.SEARCHPARAMS.get('inputmode') == 'true') {
          for (let selector in inputdata) {
            $(selector).val(inputdata[selector]);
          }
          $('[name=form_submit]').trigger('click');
        }
        break;
      case '/netz/netz1/tenpo/tenpo_info_input_save.aspx':
        $('[name=b_close]').trigger('click');
    }
  });
}
//日程固定型の備考欄を一括書き換え
if (true) {
  $(function() {
    switch (location.pathname) {
      case '/netz/netz1/shingaku/kouza_jyuko_list.aspx':
        popmenut_F2.setContentFunction(function() {
          $(this)
            .append('<button class="bikouwrite" opt="prepend">CH有備考欄に前置</button>')
            .append('<button class="bikouwrite" opt="rewrite">CH有備考欄を書き換え</button>')
            .append('<button class="bikouwrite" opt="append">CH有備考欄に後置</button>');
        });
        $(document).on('click', '.bikouwrite', function() {
          popmenut_F2.closemenu();
          const opt = $(this).attr('opt');
          const id = $('input[name=shingaku_id]').val();
          const txt = prompt('Input text');
          if (!txt) return false;

          $('input[value="修正"]').each(function() {
            const $this = $(this);
            const isChecked = $this
              .closest('tr')
              .find('input[type="checkbox"]')
              .prop('checked');
            if (!isChecked) return true;
            const student_cd = $this.attr('onclick').getStrBetween("'", "'");
            const keyValue = { student_cd, id, opt, txt };
            chrome.runtime.sendMessage({
              opennetzbackEx: `${NX.CONST.host}/shingaku/student_shingaku_input.aspx?${$.param(keyValue)}`
            });
          });
        });
        break;
      case '/netz/netz1/shingaku/student_shingaku_input.aspx':
        const opt = getparameter('opt');
        const txt = decodeURIComponent(getparameter('txt'));
        switch (opt) {
          case 'prepend':
            $('input[name^=bikou_nm]').valPrepend(txt);
            $('input[value="　登録　"').trigger('click');
            break;
          case 'rewrite':
            $('input[name^=bikou_nm]').val(txt);
            $('input[value="　登録　"').trigger('click');
            break;
          case 'append':
            $('input[name^=bikou_nm]').valAppend(txt);
            $('input[value="　登録　"').trigger('click');
            break;
        }
        break;
      case '/netz/netz1/shingaku/student_shingaku_input_save.aspx':
        myclosetab();
        break;
    }
  });
}

var cliptext = new ClipText();
