/**
 * Retrieves text content from <td> elements inside a given target element.
 *
 * - If `eq` is a number, returns the trimmed text of the `eq`-th <td>.
 * - If `eq` is null or undefined, returns an array of all <td> texts.
 * - If `func` is provided, it will be applied to the text(s) before returning.
 *
 * @param {HTMLElement | string | jQuery} target - The target element or selector containing <td> elements.
 * @param {number|null} [eq=null] - The index of the <td> to extract. If null, returns all <td> texts.
 * @param {function(string): any} [func=null] - Optional function to process each text value.
 * @returns {string | any | string[] | any[]} - A single processed string if `eq` is specified, or an array of processed strings if not.
 * @throws {Error} If the target is not specified.
 */
function findTdGetTxt(target, eq = null, func = null) {
  if (!target) throw new Error('findTdGetTxt: No target specified');

  const $tds = $(target).find('td');

  if (eq === null) {
    const texts = $tds
      .map((_, td) => {
        const text = $(td)
          .text()
          .trim();
        return func ? func(text) : text;
      })
      .get();
    return texts;
  }

  const text = $tds
    .eq(eq)
    .text()
    .trim();
  return func ? func(text) : text;
}

/**
 * jQuery plugin version of `findTdGetTxt`.
 *
 * Allows calling directly on a jQuery object, typically a table row.
 *
 * - If `eq` is a number, returns the trimmed text of the `eq`-th <td> within the matched element.
 * - If `eq` is null or undefined, returns an array of all <td> texts in the matched element.
 * - If `func` is provided, it will be applied to each text value before returning.
 *
 * @function external:"jQuery.fn".findTdGetTxt
 * @param {number|null} [eq=null] - The index of the <td> to extract. If null, returns all <td> texts.
 * @param {function(string): any} [func=null] - Optional function to process each text value.
 * @returns {string | any | string[] | any[]} - A single processed string if `eq` is specified, or an array of processed strings if not.
 */
$.fn.findTdGetTxt = function(eq = null, func = null) {
  return findTdGetTxt($(this), eq, func);
};

function findTdGetInput(target, eq = 0, func = null) {
  if (!target) throw new Error('findTdGetTxt: No target specified');
  const val = $(target)
    .find('td')
    .eq(eq)
    .find('input')
    .val();
  if (func) return func(val);
  return val;
}
$.fn.findTdGetInput = function(eq = 0, func = null) {
  return findTdGetInput($(this), eq, func);
};

function findTdToArray(target, ...eqs) {
  return eqs.map(eq => target.findTdGetTxt(eq));
}
$.fn.findTdToArray = function(...eqs) {
  return findTdToArray($(this), ...eqs);
};

/**
 * 指定された文字列の間にある部分文字列を取得します。
 *
 * @param {string} str - 検索対象の文字列。
 * @param {string} search1 - 部分文字列の開始部分。
 * @param {string} search2 - 部分文字列の終了部分。
 * @param {number} [num=0] - 取得する部分文字列のインデックス。デフォルトは0。
 * @returns {string|undefined} - 指定されたインデックスの部分文字列、もしくは見つからない場合は undefined。
 */
function getStrBetween(str, search1, search2, num = 0) {
  return getStrBetweenHelper(str, search1, search2, num);
}

/**
 * Stringのプロトタイプメソッドとして部分文字列を取得する関数を追加します。
 *
 * @param {string} search1 - 部分文字列の開始部分。
 * @param {string} search2 - 部分文字列の終了部分。
 * @param {number} [num=0] - 取得する部分文字列のインデックス。デフォルトは0。
 * @returns {string|undefined} - 指定されたインデックスの部分文字列、もしくは見つからない場合は undefined。
 */
String.prototype.getStrBetween = function(search1, search2, num = 0) {
  return getStrBetweenHelper(this, search1, search2, num);
};

/**
 * 内部で使用するヘルパー関数。指定された文字列の間にある部分文字列を取得します。
 *
 * @param {string} str - 検索対象の文字列。
 * @param {string} search1 - 部分文字列の開始部分。
 * @param {string} search2 - 部分文字列の終了部分。
 * @param {number} [num=0] - 取得する部分文字列のインデックス。デフォルトは0。
 * @returns {string|undefined} - 指定されたインデックスの部分文字列、もしくは見つからない場合は undefined。
 */
function getStrBetweenHelper(str, search1, search2, num) {
  // エスケープ処理を行う
  const escapeRegExp = string => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // 正規表現を作成
  const reg = new RegExp(`${escapeRegExp(search1)}(.*?)${escapeRegExp(search2)}`, 'g');

  // マッチを配列に保存
  const result = [];
  let match;
  while ((match = reg.exec(str)) !== null) {
    result.push(match[1]);
  }

  // 指定された番号の結果を返す
  return result.length > 0 ? result[Math.min(num, result.length - 1)] : undefined;
}

/**
 * Adds swipe functionality with optional button action.
 *
 * @param {string|null} text - The text for the button. If `null`, the function executes immediately on swipe.
 * @param {Function} func - The callback function executed on swipe or button click.
 * @returns {jQuery} The current jQuery object for method chaining.
 */
$.fn.swipe = function(text, func) {
  let swipeID = this.data('swipeID');
  let buttonDiv = $(`div[swipeID=${swipeID}]`);
  const parentObj = this;
  // Initialize if not already set
  if (!swipeID || buttonDiv.length === 0) {
    //prettier-ignore
    swipeID = Math.random().toString(36).slice(2, 11);
    this.data('swipeID', swipeID);
    buttonDiv = $('<div>', { swipeID, class: 'unshown', style: 'position:absolute;' }).appendTo('body');
  }
  // Add button if text is provided
  if (text !== null) {
    $('<button>', {
      type: 'button',
      text: text,
      on: {
        mouseup: () => {
          func.apply(parentObj, parentObj);
          buttonDiv.addClass('unshown');
        }
      }
    }).appendTo(buttonDiv);
  }

  // Handle mousedown event to activate swipe
  this.on('mousedown', () => {
    this.data('swipe', true);
    $(document).data('swipeTarget', this);
    this.attr('tabindex', '-1').trigger('focus');
  });

  // Handle mouseup and mouseout events in one handler
  $(document).on('mouseup', () => {
    const target = $(document).data('swipeTarget');
    if (!target) return;
    target.removeData('swipe');
    $(document).removeData('swipeTarget');

    const targetSwipeID = target.data('swipeID');
    $(`div[swipeID=${targetSwipeID}]`).addClass('unshown');
  });
  this.on('mouseout', () => {
    if (!this.data('swipe')) return;
    if (text === null) {
      // Execute the function immediately if no button text is provided
      func.apply(parentObj, parentObj);
    } else {
      // Show the button near the swiped element
      const offset = this.offset();
      buttonDiv
        .css({
          top: offset.top,
          left: offset.left + this.outerWidth()
        })
        .removeClass('unshown');
    }
  });

  return this;
};

/**
 * Synchronizes the value or state of the target elements with the source element on change.
 * @param  {string|Object} selector - The target elements to be synchronized (can be a selector or a jQuery object).
 * @param  {boolean} isAppendMode - Whether to append the value instead of replacing it (for text inputs).
 * @return {JQuery} The source element as a jQuery object.
 */
$.fn.netztracer = function(selector, isAppendMode = false) {
  const source = $(this); // The source element triggering the change event

  source.on('change', () => {
    const sourceType = source.attr('type');
    const sourceVal = source.val();
    const sourceText = source.text();
    const sourceChecked = source.prop('checked');

    $(selector).each(function() {
      const target = $(this); // The target elements to be updated
      let changeCheck = false;

      switch (sourceType) {
        case 'checkbox':
          changeCheck = sourceChecked !== target.prop('checked');
          target.prop('checked', sourceChecked);
          break;

        case 'radio':
          changeCheck = sourceVal === target.val();
          target.prop('checked', changeCheck);
          break;

        case 'containtext':
          changeCheck = sourceText !== target.text();
          target.text(sourceText);
          break;

        default:
          const targetVal = target.val();
          changeCheck = sourceVal !== targetVal;
          target.val(isAppendMode ? `${targetVal}${sourceVal}` : sourceVal);
          break;
      }

      if (changeCheck) {
        target
          .trigger('change')
          .get(0)
          .dispatchEvent(new Event('change'));
      }
    });
  });

  return source;
};
/**
 * jQuery プラグイン: netzpicker
 * 様々な形式のデータを基にボタンを生成し、DOMに追加します。
 *
 * @function
 * @param {Array|Object} arg - ボタンを生成するためのデータ
 * - 2次元配列: [[key, value], [key, value], ...]
 * - 連想配列: {key: value, key: value, ...}
 * - 1次元配列: [key, key, key] (valueはkeyと同じ)
 * @returns {jQuery} - チェーン可能なjQueryオブジェクト
 */
$.fn.netzpicker = function(arg) {
  if (!arg || (typeof arg !== 'object' && !Array.isArray(arg))) {
    console.error('Invalid argument format.');
    return this;
  }
  /**
   * ボタンを生成する関数
   *
   * @param {string} key - ボタンのテキスト (表示名)
   * @param {string} value - ボタンの値 (value 属性)
   */
  const $this = $(this);
  const createButton = (key, value) => {
    $this.swipe(key, () => {
      $(this).val(value);
      $(this)['0'].dispatchEvent(new Event('change')); // イベントを発火
    });
  };

  // 受け取ったデータの型を判定して処理を分岐
  []
    .concat(Array.isArray(arg) ? arg.map(item => (Array.isArray(item) ? item : [item, item])) : Object.entries(arg))
    .forEach(([key, value]) => createButton(key, value));

  return this;
};

/**
 * IframeMakerEx - Creates and manages an iframe within a container element.
 * @class
 * @param {Object} options - Configuration options for the iframe container.
 * @param {string} [options.iframeName] - The name of the container.
 * @param {number} [options.x] - The x-coordinate for the container.
 * @param {number} [options.y] - The y-coordinate for the container.
 * @param {boolean} [options.draggable=false] - Whether the container is draggable.
 * @param {boolean} [options.closebutton=false] - Whether the container has a close button.
 */
class IframeMakerEx {
  constructor(options = {}) {
    const { x, y, draggable = false, closebutton = false, iframeName = 'iframe', autoResize = true, savePosition = false } = options;
    const hasPosition = x != null && y != null;

    this.iframeName = iframeName;
    this.positionStorageKey = 'iframeMakerPosition';
    this.autoResize = autoResize;

    this.containerElement = $('<div/>', {
      class: 'iframe-container unshown',
      css: {
        backgroundColor: 'white',
        position: hasPosition ? 'absolute' : 'relative',
        width: '600px',
        height: '800px'
      }
    }).appendTo('body');

    this.iframeElement = $('<iframe>', {
      scrolling: 'yes',
      css: { width: '100%', height: '100%' }
    }).appendTo(this.containerElement);

    const localStorageData = JSON.parse(localStorage.getItem(this.positionStorageKey)) || {};
    const savedPosition = localStorageData[this.iframeName] || { x, y };
    this.moveContainer(savedPosition.x, savedPosition.y);

    if (draggable) this.makeDraggable({ savePosition });
    if (closebutton) this.addCloseButton();
    if (autoResize) this.updateSizeOnResize();
  }

  getIframeName() {
    return this.iframeName;
  }

  getContainerElement() {
    return this.containerElement;
  }

  moveContainer(x, y) {
    if (x != null) this.containerElement.css('left', x);
    if (y != null) this.containerElement.css('top', y);
    return this;
  }

  addCloseButton() {
    $('<button>', {
      name: 'closeButton',
      text: '×',
      css: { fontSize: '20px', position: 'absolute', top: 0, right: 0 }
    })
      .appendTo(this.containerElement)
      .on('click', () => this.containerElement.addClass('unshown'));
    return this;
  }

  close() {
    this.containerElement.addClass('unshown');
    return this;
  }

  show() {
    this.containerElement.removeClass('unshown');
    return this;
  }

  loadUrl(url) {
    this.iframeElement.attr('src', url);
    this.show();
    if (this.autoResize) this.updateSize();
    return this;
  }

  makeDraggable({ savePosition } = {}) {
    const positionData = JSON.parse(localStorage.getItem(this.positionStorageKey) || '{}');

    this.containerElement.draggable({
      create: () => {
        const savedPosition = positionData[this.iframeName];
        if (savePosition && savedPosition) this.moveContainer(savedPosition.x, savedPosition.y);
      },
      stop: (_, ui) => {
        if (savePosition) {
          positionData[this.iframeName] = { x: ui.position.left, y: ui.position.top };
          localStorage.setItem(this.positionStorageKey, JSON.stringify(positionData));
        }
        if (this.autoResize) this.updateSize();
      }
    });

    return this;
  }

  updateSize() {
    const { left, top } = this.containerElement.position();
    this.containerElement.css({
      width: `${window.innerWidth - left - 20}px`,
      height: `${window.innerHeight - top - 20}px`
    });
  }

  updateSizeOnResize() {
    $(window)
      .off('resize.iframeResize')
      .on('resize.iframeResize', () => this.updateSize());
  }

  makeButton(url, text = 'load', args = {}, attrs = {}) {
    const queryString = $.param(args);
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    return $(
      '<button>',
      Object.assign(
        {
          text: text
        },
        attrs
      )
    ).on('click', () => this.loadUrl(fullUrl));
  }
}

class Saver {
  /**
   * ローカルストレージを操作するクラス
   * @param {string} localname 保存するキー名
   */
  constructor(localname) {
    this.localname = localname;
  }

  /**
   * 全てのデータを取得する
   * @return {Object} 保存されているオブジェクト
   */
  getall() {
    try {
      return JSON.parse(localStorage.getItem(this.localname)) || {};
    } catch {
      console.warn(`${this.localname} は正しい JSON 形式ではありません`);
      return {};
    }
  }

  /**
   * 指定したキーのデータを取得する
   * @param {Object<string, *>} keys { key: defaultValue } の形式で指定
   * @return {Object<string, *>} 該当するデータを取得し、なければデフォルト値を返す
   */
  get(keys) {
    if (!$.isPlainObject(keys)) {
      console.error(`${this.localname}: 引数はオブジェクト形式である必要があります`);
      return { error: '無効な引数' };
    }
    const data = this.getall();
    return Object.fromEntries(Object.entries(keys).map(([key, defaultValue]) => [key, data[key] ?? defaultValue]));
  }

  /**
   * 指定したキーのデータを1つだけ取得する
   * @param {Object<string, *>} keys { key: defaultValue } の形式で指定
   * @return {*} キーに対応するデータ、またはデフォルト値
   */
  getone(keys) {
    return Object.values(this.get(keys))[0];
  }

  /**
   * 指定したデータをローカルストレージに保存する
   * @param {Object<string, *>} data 保存するデータ (キーと値のペア)
   * @return {boolean} 成功した場合は true、失敗した場合は false
   */
  save(data) {
    if (!$.isPlainObject(data)) {
      console.error('保存するデータはオブジェクト形式である必要があります');
      return false;
    }
    localStorage.setItem(this.localname, JSON.stringify({ ...this.getall(), ...data }));
    return true;
  }

  /**
   * オブジェクトが入れ子になっていてもデータを保存する (深いマージ)
   * @param {Object<string, *>} data 保存するデータ
   * @return {Promise<Object|boolean>} 成功した場合は保存後のデータ、失敗した場合は false
   */
  async deepsave(data) {
    if (!$.isPlainObject(data)) {
      console.error('保存するデータはオブジェクト形式である必要があります');
      return false;
    }
    return await localStorageSaverSync(this.localname, data, true);
  }

  /**
   * 指定したキーのデータを削除する
   * @param {Object<string, *> | string} keys 削除するキー (オブジェクトまたは文字列)
   * @return {boolean} 成功した場合は true
   */
  delete(keys) {
    const data = this.getall();
    if (typeof keys === 'object') {
      keys = Object.keys(keys);
    } else {
      keys = [keys];
    }
    keys.forEach(key => delete data[key]);
    localStorage.setItem(this.localname, JSON.stringify(data));
    return true;
  }

  /**
   * テキスト入力フィールドを作成し、変更時にデータを保存する
   * @param {string} key 保存するキー
   * @return {JQuery} 作成された入力フィールド
   */
  makesaveinput(key) {
    return $('<input>', { type: 'text', cd: key })
      .on(
        'change',
        function() {
          this.save({ [key]: $(this).val() });
        }.bind(this)
      )
      .val(this.getone({ [key]: '' }));
  }

  /**
   * 指定した値の配列を順番に切り替える
   * @param {string} key 保存するキー
   * @param {Array<*>} values 切り替える値のリスト
   */
  toggle(key, values) {
    const current = this.getone({ [key]: null });
    const index = values.findIndex(value => value === current);
    this.save({ [key]: values[(index + 1) % values.length] });
  }

  /**
   * トグルボタンを作成し、クリックで値を切り替える
   * @param {string} buttonText ボタンの表示テキスト
   * @param {string} key 保存するキー
   * @param {Array<{ title: string, value: string|number }>} options 切り替え可能な値のリスト
   * @return {JQuery} 作成されたボタン
   */
  maketogglebutton(buttonText, key, options) {
    const _class = this;
    return $('<button>', {
      type: 'button',
      name: key,
      on: {
        change: function() {
          const current = _class.getone({ [key]: null });
          const label = options.find(option => option.value == current)?.title || '';
          $(this).text(`${buttonText}：${label}`);
        },
        click: function() {
          _class.toggle(
            key,
            options.map(option => option.value)
          );
          $(this).trigger('change');
        }
      }
    }).trigger('change');
  }
}

/**
 * NMのローカルストレージにデータを保存する。Object、Arrayならデータを追加、それ以外ならデータの上書き
 * @param {string} storagename localStorageの名前
 * @param {*} savedata 保存するデータ
 * @param {boolean} deepcopy ディープコピーをするかどうか
 * @return {Promise<*>} 保存したデータを返す
 */
async function localStorageSaverSync(storagename, savedata, deepcopy = false) {
  try {
    const requestData = {
      id: 'localStorageSaverSync',
      data: { storagename, savedata, deepcopy }
    };

    const returndata = await sendDatatoOthertab(`${NX.CONST.host}/index1.html`, requestData, true);

    console.log('SendSaveData Success:', storagename, savedata);
    return returndata?.data?.savedata ?? null;
  } catch (error) {
    console.error(`localStorageSaverSync エラー: storagename=${storagename}`, error);
    throw new Error(`localStorageSaverSync でエラー発生: ${error.message}`);
  }
}

/**
 * menu.edu-netz.com から localStorage を読み込む
 * @param {string} storagename localStorage のキー名
 * @return {Promise<*>} 読み込んだデータを返す
 */
async function localStorageLoader(storagename) {
  return new Promise((resolve, reject) => {
    const listener = message => {
      console.log('Received message:', message);
      if (message.id === 'localStorageLoaderReceiver') {
        chrome.runtime.onMessage.removeListener(listener);
        resolve(message.data);
      }
    };

    // メッセージリスナーを登録
    chrome.runtime.onMessage.addListener(listener);

    try {
      sendDatatoOthertab(
        `${NX.CONST.host}/index1.html`,
        {
          id: 'localStorageLoaderSender',
          data: { storagename, fromurl: location.href }
        },
        true
      );
    } catch (error) {
      chrome.runtime.onMessage.removeListener(listener);
      console.error('localStorageLoader failed:', error);
      reject(error);
    }
  });
}
/**
 * Class for generating and querying scheduled time blocks.
 * Each time block consists of a PT time, start time, and end time.
 */
class NetzTime {
  /**
   * @param {(string|number)} arg - A value to match against time fields (e.g., Number, PTTime, StartTime, EndTime).
   * @param {string} [target] - A specific field name to match against. If omitted, all time fields are searched.
   * @param {Object} [options] - Optional configuration for time generation.
   * @param {string} [options.initialTime='11:00'] - Starting time for the first PT slot.
   * @param {number} [options.PTDuration=5] - Duration (in minutes) of the PT slot.
   * @param {number} [options.lectureDuration=45] - Duration (in minutes) of the main lecture.
   */
  constructor(arg, target, options = {}) {
    this.timeList = this._generateTimeList(options);
    this.matchedTimes = this._searchTimes(arg, target);
  }

  /**
   * Searches for entries in the time list that match the given argument.
   * @private
   * @param {(string|number)} arg - The value to search for.
   * @param {string} [target] - Specific field to search, or all fields if omitted.
   * @returns {Array<Object>} Matched time entries.
   */
  _searchTimes(arg, target) {
    const fieldsToSearch = target ? [target] : ['Number', 'PTTime', 'StartTime', 'EndTime'];
    return this.timeList
      .filter(row => fieldsToSearch.some(field => row[field]?.toString() === arg.toString()))
      .map(row => ({
        ...row,
        match: fieldsToSearch.find(field => row[field]?.toString() === arg.toString())
      }));
  }

  /**
   * Generates a list of time blocks starting from the initial time.
   * @private
   * @param {Object} config - Configuration options.
   * @param {string} config.initialTime - Starting time (e.g., '11:00').
   * @param {number} config.PTDuration - Duration in minutes of PT time.
   * @param {number} config.lectureDuration - Duration in minutes of the lecture.
   * @returns {Array<Object>} List of time block objects.
   */
  _generateTimeList({ initialTime = '11:00', PTDuration = 5, lectureDuration = 45 } = {}) {
    const list = [];
    let currentTime = initialTime;

    for (let i = 1; i <= 13; i++) {
      const ptTime = currentTime;
      const startTime = this._addMinutes(ptTime, PTDuration);
      const endTime = this._addMinutes(startTime, lectureDuration);
      list.push({ Number: i, PTTime: ptTime, StartTime: startTime, EndTime: endTime });
      currentTime = endTime;
    }

    return list;
  }

  /**
   * Adds minutes to a given time string.
   * @private
   * @param {string} time - Time in HH:MM format.
   * @param {number} minutes - Number of minutes to add.
   * @returns {string} New time in HH:MM format.
   */
  _addMinutes(time, minutes) {
    const [hour, min] = time.split(':').map(Number);
    const date = new Date(2000, 0, 1, hour, min);
    date.setMinutes(date.getMinutes() + minutes);
    return date.toTimeString().slice(0, 5); // Returns "HH:MM"
  }

  /**
   * Returns the value of a specified field from the first matched time entry.
   * @private
   * @param {string} field - The field to retrieve (e.g., 'StartTime').
   * @returns {(string|number)} The field value or a warning message if not found.
   */
  _getFirstMatchField(field) {
    if (this.matchedTimes.length === 0) {
      console.warn('NetzTime: No time matched.');
      return 'No time matched.';
    }

    if (this.matchedTimes.length > 1) {
      console.warn(`NetzTime: ${this.matchedTimes.length} times matched. Returning the first match.`, this.matchedTimes);
    }

    return this.matchedTimes[0][field];
  }

  /**
   * Gets the StartTime of the matched time block.
   * @returns {string} Start time in HH:MM format.
   */
  StartTime() {
    return this._getFirstMatchField('StartTime');
  }

  /**
   * Gets the PTTime of the matched time block.
   * @returns {string} PT time in HH:MM format.
   */
  PTTime() {
    return this._getFirstMatchField('PTTime');
  }

  /**
   * Gets the session number of the matched time block.
   * @returns {number} Session number.
   */
  Number() {
    return this._getFirstMatchField('Number');
  }
}

/**
 * Displays a modal dialog with selectable options.
 * Supports both callback and Promise-based usage.
 * Allows canceling by pressing Esc or clicking the backdrop.
 *
 * @param {string} message - The message to display in the modal.
 * @param {{label: string, value: any}[]} choices - An array of choices with label and value.
 * @param {(value: any) => void} [callback] - Optional callback function to handle the selected value.
 * @returns {Promise<any>|void} Returns a Promise if no callback is provided.
 */
function showChoiceModal(message, choices, callback) {
  // Inject CSS once
  if (!document.getElementById('simple-modal-style')) {
    const style = document.createElement('style');
    style.id = 'simple-modal-style';
    style.textContent = `
      .simple-modal-backdrop {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center;
        z-index: 9999;
      }
      .simple-modal {
        background: white; padding: 1em; border-radius: 8px; text-align: center; min-width: 200px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3); max-width: 90vw;
      }
      .simple-modal button {
        margin: 0.5em; padding: 0.5em 1em; cursor: pointer;
      }
    `;
    document.head.appendChild(style);
  }

  const createModal = onSelect => {
    const backdrop = document.createElement('div');
    backdrop.className = 'simple-modal-backdrop';

    const modal = document.createElement('div');
    modal.className = 'simple-modal';

    const msg = document.createElement('p');
    msg.textContent = message;
    modal.appendChild(msg);

    choices.forEach(({ label, value }) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.onclick = () => cleanup(value);
      modal.appendChild(btn);
    });

    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);

    // Handle Esc key and backdrop click
    function handleKeyDown(e) {
      if (e.key === 'Escape') cleanup(null);
    }

    function handleBackdropClick(e) {
      if (e.target === backdrop) cleanup(null);
    }

    function cleanup(value) {
      window.removeEventListener('keydown', handleKeyDown);
      backdrop.removeEventListener('click', handleBackdropClick);
      document.body.removeChild(backdrop);
      onSelect(value);
    }

    window.addEventListener('keydown', handleKeyDown);
    backdrop.addEventListener('click', handleBackdropClick);
  };

  if (typeof callback === 'function') {
    createModal(callback);
    return;
  }

  return new Promise(resolve => {
    createModal(resolve);
  });
}

/**
 * Retrieves the table header titles and their column indices.
 * @param  {JQuery} tableobj - The jQuery object of the table.
 * @param  {number} headindex - The row index to retrieve headers from (default: 0).
 * @return {Object<string, number>} - An object mapping header titles to their column indices.
 */
function getTableHead(tableobj, headindex = 0) {
  const lists = {};
  const $headers = $(tableobj)
    .find('tr')
    .eq(headindex)
    .find('th, td'); // Supports both <th> and <td>

  //prettier-ignore
  $headers.each((index, elem) => {
    lists[$(elem).text().trim()] = index;
  });

  return lists;
}

/**
 * jQuery plugin version of getTableHead.
 * Retrieves table header titles and their column indices.
 * @param  {number} headindex - The row index to retrieve headers from (default: 0).
 * @return {Object<string, number>} - An object mapping header titles to their column indices.
 */
$.fn.getTableHead = function(headindex = 0) {
  return getTableHead(this, headindex);
};

$.fn.valPrepend = function(txt) {
  const nowval = $(this).val();
  $(this).val(`${txt}${nowval}`);
  return this;
};
$.fn.valAppend = function(txt) {
  const nowval = $(this).val();
  $(this).val(`${nowval}${txt}`);
  return this;
};
$.fn.valReplace = function(target, replace) {
  if (!target) {
    console.error('This Function needs target.');
    return this;
  }
  const nowval = $(this).val();
  $(this).val(nowval.replace(target, replace || ''));
  return this;
};
$.fn.valRegexReplace = function(regex, replace) {
  if (!(regex instanceof RegExp)) {
    console.error('First argument must be a RegExp object.');
    return this;
  }
  replace = replace || '';
  const nowval = $(this).val();
  $(this).val(nowval.replace(regex, replace));
  return this;
};
$.fn.valFunction = function(func) {
  if (typeof func != 'function') return this;
  const nowval = $(this).val();
  $(this).val(func(nowval));
  return this;
};

/**
 * オートコンプリートを無効化する
 */
function offautocomplete(query = 'input') {
  $(query).attr('autocomplete', 'off');
}

$.fn.offAutocomplete = function() {
  this.attr('autocomplete', 'off');
  return this;
};

/**
 * jQuery plugin to enforce numeric input on form elements.
 *
 * This plugin modifies the selected input elements to accept only numeric values.
 * It automatically converts full-width (zenkaku) numbers to half-width (hankaku) and
 * removes any non-numeric characters if `strict` mode is enabled.
 *
 * @function
 * @param {boolean} [strict=true] - Whether to strictly enforce numeric input by removing non-numeric characters.
 * @returns {jQuery} The jQuery object for chaining.
 */
$.fn.isAllNumeric = function(strict = true) {
  this.not('[type="hidden"]')
    .attr({ type: 'text', inputmode: 'numeric' })
    .on('input', function() {
      let val = $(this)
        .val()
        .normalize('NFKC'); // Full-width to half-width conversion
      if (strict) val.replace(/[^0-9]/g, ''); // Remove non-numeric characters
      $(this).val(val);
    });
  return this;
};

/**
 * A jQuery plugin to switch the value of an element to the next item in the given array.
 *
 * @function
 * @param {Array<string>} array - An array of possible values.
 * @returns {jQuery} The jQuery object for chaining.
 *
 * @example
 * // Assuming you have a select element with id "mySelect" and possible values ["apple", "banana", "cherry"]
 * $("#mySelect").selectSwitcher(["apple", "banana", "cherry"]);
 * // If the current value is "apple", it will change to "banana".
 */
$.fn.selectSwitcher = function(array) {
  let index = (array.indexOf(this.val()) + 1) % array.length;
  return this.val(array[index]);
};

/**
 * A jQuery plugin that adds a text input field next to a select element for searching options by text or value.
 * The user can type in the input field, and the select element will change its value based on the input text.
 *
 * @function
 * @returns {jQuery} The jQuery object, allowing for chaining of further jQuery methods.
 *
 */
$.fn.selectSearcher = function() {
  return this.each(function() {
    let $select = $(this);

    let addSearchInput = function() {
      const inputName = 'selectSearcher';

      // Prevent duplicate input fields
      if ($select.next().attr('name') === inputName) return;

      let $input = $('<input>', {
        type: 'text',
        class: 'netzblind',
        name: inputName
      })
        .attr('autocomplete', 'off')
        .insertAfter($select)
        .on('keyup', function() {
          let searchText = $input.val().trim();
          let $options = $select.find('option');

          /** @type {string|undefined} */
          let val =
            $options.filter(`[value="${searchText}"]`).val() ||
            $options
              .filter(function() {
                return $(this).text() === searchText;
              })
              .val() ||
            $options.filter(`:contains("${searchText}")`).val();

          if (val !== undefined) $select.val(val).trigger('change');
        })
        .on('dblclick', function() {
          $(this).remove();
        });

      $input.focus();
    };

    $select.swipe(null, addSearchInput);
  });
};

/**
 * 指定した要素に時刻選択ピッカーを適用するjQueryプラグイン
 *
 * @param {(boolean|Array<string>)} shidotime - 時間データの選択肢。
 *        true: shidoTimes, false: ptTimes, Array: そのまま使用。
 * @param {string|null} selecterHour - 時間を設定する入力要素のセレクタ（オプション）。
 * @param {string|null} selecterMin - 分を設定する入力要素のセレクタ（オプション）。
 * @returns {jQuery} - jQueryオブジェクトを返す。
 */
$.fn.netztimepicker = function(shidotime = true, selecterHour, selecterMin) {
  if (!(typeof shidotime === 'boolean' || Array.isArray(shidotime))) {
    console.warn('shidotimeはtrue,false,Arrayでなければなりません', shidotime);
    return this;
  }

  const $input = this;
  const isHourMinMode = selecterHour && selecterMin;

  // 時間データの決定
  let timeframe;
  switch (shidotime) {
    case false:
      timeframe = NX.CONST.ptTimes;
      break;
    case true:
      timeframe = NX.CONST.shidoTimes;
      break;
    default:
      if (Array.isArray(shidotime)) {
        timeframe = shidotime;
      } else {
        console.warn('shidotime未設定');
        return;
      }
  }

  // ピッカー表示用DIV作成
  const $picker = $('<div>', { style: 'position:absolute' })
    .hide()
    .appendTo('body');

  const $target = isHourMinMode ? $(selecterMin) : $input;
  const position = $target.offset();

  $picker.css({
    left: position.left,
    top: position.top + $target.outerHeight()
  });

  // ボタン作成ロジック
  timeframe.forEach((time, index) => {
    const $button = $('<button>', {
      type: 'button',
      text: `${NX.CONST.shidoNumbers[index]}${time}～`,
      style: 'width:80px',
      value: index
    });

    $button.appendTo($picker).on('mousedown', function() {
      const selected = timeframe[+this.value];

      if (isHourMinMode) {
        $(selecterHour)
          .val(selected.slice(0, 2))
          .trigger('change');
        $(selecterMin)
          .val(selected.slice(3, 5))
          .trigger('change');
      } else {
        $input.val(selected).trigger('change');
      }

      $(this).trigger('focusout');
    });

    // 4つごとに改行
    if ((index + 1) % 4 === 0) {
      $picker.append('<br>');
    }
  });

  // 入力フォーカス時にピッカー表示
  $input.on('focus', () => $picker.show()).on('focusout', () => $picker.hide());

  return $input;
};

/**
 * jQuery plugin to store and retrieve memoized values for a specific student.
 *
 * @function
 * @param {string} student_cd - The student code used as a key for storing and retrieving memoized data.
 * @returns {jQuery} The jQuery object for chaining.
 */
$.fn.netzmemorize = function(student_cd) {
  $(this)
    .attr('autocomplete', 'off')
    .val(memos.getone({ [student_cd]: '' })) // Retrieve memoized value
    .on('change', () => memos.save({ [student_cd]: $(this).val() })) // Save updated value on change
    .on('contextmenu', () => {
      if (confirm('削除してもよろしいでしょうか')) memos.delete(student_cd);
      return false;
    });

  return $(this); // Ensure jQuery object is returned for method chaining
};

/**
 * 入力された日付に対応した曜日を右側に表示
 * @returns {jQuery}
 */
$.fn.setweekday = function() {
  const $this = $(this);
  const spanId = `after_${$this.attr('name')}`;

  if (!$(`#${spanId}`).length) {
    $this.after(`<span id="${spanId}"></span>`);
  }

  const updateWeekday = () => {
    const date = new Date($this.val());
    $(`#${spanId}`).text(Number.isNaN(date.getTime()) ? '' : `(${weekdaylist[date.getDay()]})`);
  };

  $this.on('input change blur', updateWeekday);
  updateWeekday();

  return $this;
};

/**
 * Sets a keyboard shortcut for clicking the button when a specific key is pressed.
 *
 * @param {string} key - The key to trigger the click event.
 *                        Example: "Enter" for the Enter key, "a" for the "A" key.
 * @param {Object} [keyoption={}] - Optional key modifiers for the shortcut.
 * @param {boolean} [keyoption.altkey=false] - If true, the Alt key must be pressed.
 * @param {boolean} [keyoption.shiftkey=false] - If true, the Shift key must be pressed.
 * @param {boolean} [keyoption.ctrlkey=false] - If true, the Ctrl key must be pressed.
 * @returns {jQuery} The jQuery object for chaining.
 */
$.fn.setshortcutkey = function(key, keyoption = {}) {
  if (!key) return this;

  const $this = $(this);
  const { altkey, shiftkey, ctrlkey } = keyoption;

  // Event handler to be used for keydown event
  const handler = function(evt) {
    // Only trigger if the pressed key matches
    if (evt.key !== key) return;

    // Check for required modifier keys
    if ((altkey && !evt.altKey) || (shiftkey && !evt.shiftKey) || (ctrlkey && !evt.ctrlKey)) return;

    $this.each(function() {
      if ($(this).is(':visible')) {
        // Dispatch click event
        this.dispatchEvent(new Event('click'));
        evt.preventDefault();
      }
    });
  };

  // Add the event listener for keydown (only once)
  window.document.addEventListener('keydown', handler);

  return this;
};

const parsedHost = document.domain != 'portal.edu-netz.com' ? document.domain : 'menu.edu-netz.com';
const NX = {
  CONST: {
    host: `https://${parsedHost}/netz/netz1`,
    shidoTimes: ['11:05', '11:55', '12:45', '13:35', '14:25', '15:15', '16:05', '16:55', '17:45', '18:35', '19:25', '20:15', '21:05'],
    ptTimes: ['11:00', '11:50', '12:40', '13:30', '14:20', '15:10', '16:00', '16:50', '17:40', '18:30', '19:20', '20:10', '21:00'],
    shidoNumbers: ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩', '⑪', '⑫', '⑬']
  },
  VAR: {
    nendo: 2025, //new ExDate().getAcademicYear(),
    season_cb: '3',
    campaign: { 開始: '2026/02/01', 終了: '2026/04/30' },
    koshu_kikan: { 開始: '2026/03/25', 終了: '2026/04/08' }
  },
  DT: {
    //NXMakeDateで生成
  },
  ENDPOINT: {
    zoomMaker: 'https://n8n.overhauser0.synology.me/webhook/zoomMaker',
    sendMail: 'https://n8n.overhauser0.synology.me/webhook/sendNetzMail',
    makeGCal: 'https://script.google.com/macros/s/AKfycbxq87tE_KIhP25L0Ish1qkXkVSdzEoU7E-BrxMfGlv4HrnGTCd_y5sNLkXpKDSPMxp9/exec'
  },
  URL: {
    diverse: 'https://lms2.s-diverse.com'
  },
  //GETのパラメータ
  SEARCHPARAMS: new URLSearchParams(window.location.search),
  NOWBASE: {
    '000231': [
      ['', '指定なし'],
      ['m', '全担当教室'],
      ['h', '担任生徒'],
      ['', '------------'],
      ['3404', '白島'],
      ['3414', '緑井'],
      ['3408', '上安'],
      ['3403', '中広'],
      ['3416', '広島駅前'],
      ['3406', '古江'],
      ['3405', '中筋'],
      ['3401', '皆実町'],
      ['3410', '安芸府中'],
      ['', '------------'],
      ['a5031', '中四国'],
      ['c3400', '広島県校舎'],
      ['b3401', '広島北'],
      ['b3403', '広島南'],
      ['b3301', '岡山駅前'],
      ['b3302', '岡山北'],
      ['b3303', '岡山南'],
      ['b3701', '高松'],
      ['', '------------'],
      ['9001', '会場'],
      ['9800', 'イベント'],
      ['9803', 'リモート']
    ]
  }
};
const NXMakeDate = {
  today: new ExDate(),
  yesterday: new ExDate().afterdays(-1),
  tomorrow: new ExDate().afterdays(1),
  dayaftertomorrow: new ExDate().afterdays(2),
  IOM: new ExDate().setDateTry(null, null, 1),
  EOM: new ExDate().endofmonth(),
  IONM: new ExDate().aftermonths(1).setDateTry(null, null, 1),
  EONM: new ExDate().aftermonths(2).setDateTry(null, null, 0),
  CMP_START: new ExDate(NX.VAR.campaign['開始']),
  CMP_END: new ExDate(NX.VAR.campaign['終了']),
  Koshu_START: new ExDate(NX.VAR.koshu_kikan['開始']),
  Koshu_END: new ExDate(NX.VAR.koshu_kikan['終了'])
};
for (let key in NXMakeDate) {
  NX.DT[key] = {
    cls: NXMakeDate[key],
    ymd: NXMakeDate[key].as('yyyy-mm-dd'),
    slash: NXMakeDate[key].as('yyyy/mm/dd'),
    md: NXMakeDate[key].as('mm/dd')
  };
}
NX.GOAL = {
  AprilDivNXT: {
    head: ['ブロック', 'ユニット', '校舎', '受講校舎', '対面', 'exist2603', 'service2603', 'goal2604'],
    body: [
      ['関東', '東京U', '早稲田', '早稲田', '', '8', '4', '6'],
      ['関東', '東京U', '要町', '要町', '', '3', '0', '3'],
      ['関東', '東京U', '豊玉', '豊玉', '', '4', '0', '2'],
      ['関東', '東京U', '上板橋', '上板橋', '', '0', '0', '3'],
      ['関東', '東京U', '志木', '志木', '', '0', '0', '2'],
      ['関東', '東京U', '和光', '和光', '', '1', '0', '2'],
      ['関東', '東京U', '鶴瀬', '鶴瀬', '', '0', '0', '2'],
      ['福岡', '福岡中央・西Ｕ', '薬院', '薬院', '', '19', '4', '10'],
      ['福岡', '福岡中央・西Ｕ', '大橋駅前', '大橋駅前', '対面', '3', '0', '6'],
      ['福岡', '福岡中央・西Ｕ', '西新修猷館前', '西新修猷館前', '対面', '10', '1', '10'],
      ['福岡', '福岡中央・西Ｕ', '六本松', '六本松', '', '3', '1', '6'],
      ['福岡', '福岡中央・西Ｕ', '橋本', '橋本', '', '11', '2', '8'],
      ['福岡', '福岡南・東Ｕ', '西鉄久留米', '西鉄久留米', '', '11', '4', '10'],
      ['福岡', '福岡南・東Ｕ', '小郡', '西鉄久留米', '', '', '', ''],
      ['福岡', '福岡南・東Ｕ', '香椎', '香椎', '', '8', '4', '11'],
      ['福岡', '福岡南・東Ｕ', '東郷', '東郷', '', '1', '0', '5'],
      ['福岡', '北九州Ｕ', '門司駅前', '門司駅前', '', '5', '4', '8'],
      ['福岡', '北九州Ｕ', '下曽根', '下曽根', '', '7', '0', '5'],
      ['福岡', '北九州Ｕ', '折尾駅前', '折尾駅前', '', '4', '1', '7'],
      ['福岡', '下関Ｕ', '長府駅前', '長府駅前', '対面', '9', '5', '10'],
      ['福岡', '駿台Diverse', '小倉駅', '小倉駅', '対面', '2', '2', '15'],
      ['福岡', '駿台Diverse', '新宮中央', '新宮中央', '対面', '5', '5', '13'],
      ['九州', '佐賀Ｕ', '佐賀駅前', '佐賀駅前', '', '12', '5', '15'],
      ['九州', '佐賀Ｕ', '鳥栖', '鳥栖', '', '5', '2', '5'],
      ['九州', '長崎Ｕ', '長崎駅前', '長崎駅前', '対面', '21', '6', '20'],
      ['九州', '長崎Ｕ', '南長崎', '南長崎', '', '7', '1', '5'],
      ['九州', '長崎Ｕ', '葉山', '葉山', '', '7', '3', '5'],
      ['九州', '熊本Ｕ', '水前寺', '水前寺', '', '4', '0', '5'],
      ['九州', '熊本Ｕ', '健軍', '健軍', '', '9', '1', '5'],
      ['九州', '熊本Ｕ', '武蔵ケ丘', '武蔵ケ丘', '', '2', '0', '5'],
      ['九州', '熊本Ｕ', '長嶺', '長嶺', '', '3', '0', '5'],
      ['九州', '大分Ｕ', '大分駅前', '大分駅前', '対面', '44', '14', '30'],
      ['九州', '大分Ｕ', '高等部大分', '大分駅前', '', '0', '0', '0'],
      ['九州', '大分Ｕ', '光吉', '光吉', '', '4', '0', '5'],
      ['九州', '大分Ｕ', '戸次', '光吉', '', '', '', ''],
      ['九州', '大分Ｕ', '明野', '明野', '', '7', '2', '5'],
      ['九州', '宮崎Ｕ', '宮崎駅前', '宮崎駅前', '', '17', '3', '10'],
      ['九州', '宮崎Ｕ', '生目大塚', '生目大塚', '', '9', '0', '5'],
      ['九州', '宮崎Ｕ', '花ヶ島', '花ヶ島', '', '19', '1', '5'],
      ['九州', '鹿児島Ｕ', '鹿児島中央', '鹿児島中央', '対面', '20', '7', '20'],
      ['九州', '鹿児島Ｕ', '東谷山', '東谷山', '', '5', '0', '5'],
      ['九州', '鹿児島Ｕ', '宇宿', '宇宿', '', '2', '0', '5'],
      ['中四国', '広島北Ｕ', '緑井', '緑井', '', '7', '0', '6'],
      ['中四国', '広島北Ｕ', '白島', '広島駅前', '', '', '', ''],
      ['中四国', '広島南Ｕ', '広島駅前', '広島駅前', '対面', '2', '3', '10'],
      ['中四国', '広島南Ｕ', '古江', '古江', '', '6', '2', '8'],
      ['中四国', '広島南Ｕ', '中筋', '中筋', '', '3', '1', '5'],
      ['中四国', '広島南Ｕ', '皆実町', '皆実町', '', '3', '0', '6'],
      ['中四国', '広島南Ｕ', '安芸府中', '安芸府中', '', '8', '0', '6'],
      ['中四国', '岡山北Ｕ', 'HS岡山駅前', 'HS岡山駅前', '対面', '40', '29', '37'],
      ['中四国', '岡山北Ｕ', '伊島', '伊島', '', '', '', '3'],
      ['中四国', '岡山北Ｕ', '岡北', '伊島', '', '', '', ''],
      ['中四国', '岡山北Ｕ', '津高', '伊島', '', '', '', ''],
      ['中四国', '岡山南Ｕ', '高島', '高島', '', '', '', '2'],
      ['中四国', '岡山南Ｕ', '国富', '高島', '', '', '', ''],
      ['中四国', '岡山南Ｕ', '西古松', 'HS岡山駅前', '', '', '', ''],
      ['中四国', '高松Ｕ', '栗林', '栗林', '対面', '8', '3', '8'],
      ['中四国', '高松Ｕ', '木太南', '木太南', '対面', '17', '4', '11'],
      ['中四国', '高松Ｕ', '水田', '水田', '', '1', '0', '6'],
      ['中四国', '高松Ｕ', '番町', '番町', '', '6', '4', '8']
    ]
  },
  myblockNXT: {
    head: ['ユニット', '教室'],
    body: [
      ['広島北', '白島'],
      ['広島北', '緑井'],
      ['広島北', '上安'],
      ['広島北', '中広'],
      ['広島北', 'みらいミッテ緑井'],
      ['広島南', '広島駅前'],
      ['広島南', '中筋'],
      ['広島南', '古江'],
      ['広島南', '皆実町'],
      ['広島南', '安芸府中'],
      ['広島南', 'みらいミッテ安芸府中'],
      ['岡山駅前', '岡山駅前'],
      ['岡山駅前', 'HS岡山駅前'],
      ['岡山駅前', 'みらいミッテ岡山駅前'],
      ['岡山北', '岡北'],
      ['岡山北', '伊島'],
      ['岡山北', '津高'],
      ['岡山北', 'みらいミッテ伊島'],
      ['岡山南', '国富'],
      ['岡山南', '西古松'],
      ['岡山南', '高島'],
      ['高松', '栗林'],
      ['高松', '木太南'],
      ['高松', '水田'],
      ['高松', '番町'],
      ['高松', 'みらいミッテ栗林'],
      ['広島北', '広島'],
      ['岡山駅前', '岡山'],
      ['高松', '香川']
    ]
  }
};
NX.LS = {
  '000231': {
    infoSave: { '3401': true, '3403': true, '3404': true, '3405': true, '3406': true, '3408': true, '3410': true, '3414': true, '3416': true },
    yoteiTemplate: [
      { name: '定例会議・業務研修', s_tm: '12:00', e_tm: '15:30', yotei_cb: '5', yotei_nm: '定例会議・業務研修', basho_nm: '広島駅前', naiyo_nm: '' },
      { name: 'UL会議', s_tm: '14:00', e_tm: '15:30', yotei_cb: '5', yotei_nm: 'AUL会議', basho_nm: '古江', naiyo_nm: '' },
      { name: 'BL会議', s_tm: '14:00', e_tm: '16:00', yotei_cb: '5', yotei_nm: 'BL会議', basho_nm: '古江', naiyo_nm: '' }
    ],
    myprofile: {
      isSpecialEnabled: 1,
      isAreaMode: 1,
      NMmode: 'normal',
      myname: '辰野　由弥',
      mynumber: '000231',
      myarea: 'c3400',
      myarea2: 'a5031',
      mygroup: 'b3403',
      mybase: '3416',
      mybasename: '広島駅前',
      mybase2: '3406',
      showTokki: 0,
      showRenrakubutton: 1,
      showMemo: 1,
      showInfosave: 1,
      nendo_season_cb: '20255'
    }
  }
};
