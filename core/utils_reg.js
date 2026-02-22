const NMEX_Utils = {
  /**
   * 二次元配列をMarkdownテーブル形式の文字列に変換する
   * @param {string[][]} rows - [ヘッダー配列, 行1配列, 行2配列...]
   * @returns {string} Markdown文字列
   */
  arrayToMarkdownTable: rows => {
    if (!rows || rows.length === 0) return '';

    const head = rows[0];
    const body = rows.slice(1);

    // ヘッダー行の作成
    const headerLine = `| ${head.join(' | ')} |`;

    // セパレーター行 (|---|---|...) の作成
    //const separatorLine = `| ${head.map(() => '---').join(' | ')} |`;

    // ボディ行の作成
    const bodyLines = body.map(row => `| ${row.map(cell => String(cell).replace(/\n/g, '<br>')).join(' | ')} |`).join('\n');

    return `${headerLine}\n${bodyLines}`; //\n${separatorLine}
  },
  /**
   * Markdownテーブル文字列を二次元配列に変換する
   * @param {string} mdString
   * @returns {string[][]}
   */
  markdownTableToArray: mdString => {
    return mdString
      .trim()
      .split('\n')
      .filter(row => row.includes('|') && !row.includes('---')) // セパレーター行を除外
      .map(row => {
        // 両端の | を除外してから分割し、各セルをトリミング
        const cells = row.replace(/^\||\|$/g, '').split('|');
        return cells.map(cell => cell.trim().replace(/<br>/g, '\n'));
      });
  },

  /**
   * NXTable形式(JSON)を二次元配列に変換する
   * @param {string} jsonString
   * @returns {string[][]}
   */
  nxtableToArray: jsonString => {
    const data = JSON.parse(jsonString);
    return [data.head, ...data.body];
  },
  /**
   * [[value,text],[]]の配列から、<option>を作成
   * @param {*} array
   * @returns
   */
  makeOption: array => array.map(elem => `<option value="${elem[0]}">${elem[1]}</option>`).join(''),

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
  tableToCSV: (table, separator = ',') => {
    let target = table instanceof HTMLElement ? table : document.querySelector(table);
    if (!target || target.nodeName.toLowerCase() !== 'table') {
      console.log("argument isn't table element");
      return null;
    }
    return [...target.rows].reduce((csv, row) => {
      return `${csv}${[...row.cells].map(cell => cell.innerText).join(separator)}\n`;
    }, '');
  },
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
  tableToMarkdown: table => {
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
  },
  multiIncludes: (target, querys) => querys.some(equery => target.includes(equery))
};

/**
 * Dispatches a native DOM event on a specific element.
 *
 * @param {Element} element - The DOM element on which to dispatch the event.
 * @param {string} eventName - The name of the event to dispatch (e.g., 'change', 'click').
 */
function dispatchNativeEvent(element, eventName) {
  if (!(element instanceof Element)) {
    console.warn('element must be an HTMLElement');
    return;
  }
  const event = new Event(eventName, { bubbles: true });
  element.dispatchEvent(event);
}

/**
 * jQuery plugin to dispatch a native DOM event on each element in the jQuery collection.
 *
 * @function
 * @name $.fn.dispatchNativeEvent
 * @param {string} eventName - The name of the event to dispatch (e.g., 'change', 'click').
 * @param {Object} [options={ bubbles: true }] - Optional event initialization properties.
 * @returns {jQuery} The original jQuery object, for chaining.
 *
 * @example
 * $('#myInput').dispatchNativeEvent('change');
 */
$.fn.dispatchNativeEvent = function(eventName, options = { bubbles: true }) {
  return this.each(function() {
    if (this instanceof Element) {
      this.dispatchEvent(new Event(eventName, options));
    }
  });
};

// ヘルパー関数：一意のセレクタを生成（#id を優先）
function getUniqueSelector(element) {
  if (element.id) return `#${element.id}`;
  if (element.className && typeof element.className === 'string') {
    const firstClass = element.className.split(/\s+/)[0];
    if (firstClass) return `.${firstClass}`;
  }
  // fallback: タグ＋インデックス指定
  const tag = element.tagName.toLowerCase();
  const all = Array.from(document.getElementsByTagName(tag));
  const index = all.indexOf(element);
  if (index !== -1) return `${tag}:nth-of-type(${index + 1})`;

  return null;
}

$.fn.clipper = function() {
  // inputやtextareaならval()、普通のdiv等ならtext()を取得
  const text = this.is('input, textarea') ? this.val() : this.text();

  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(text)
      .then(() => console.log('Copied!'))
      .catch(err => console.error('Copy failed:', err));
  } else {
    console.warn('Clipboard API is not supported in this environment.');
  }

  return this; // メソッドチェーンを維持
};

//選択解除
function deSelect() {
  var selection;
  if (window.getSelection) {
    selection = window.getSelection();
    selection.collapse(document.body, 0);
  } else {
    selection = document.selection.createRange();
    selection.setEndPoint('EndToStart', selection);
    selection.select();
  }
}
/**
 *
 * @param {boolean} off
 */
function overridedialog(off = false) {
  if (off == false)
    window.onbeforeunload = function(e) {
      e.returnValue = 'このページを離れてもよろしいですか？';
    };
  else
    window.onbeforeunload = function(e) {
      e.returnValue = true;
    };
}
/**
 * Creates a mouse position tracker.
 * This function returns a function that can be used to get the current mouse position.
 *
 * @returns {Function} A function that returns the current mouse position as an object with `x` and `y` properties.
 */
function createMouseTracker() {
  let mouseX = 0;
  let mouseY = 0;

  // Update mouse position when the mouse moves
  document.addEventListener('mousemove', function(event) {
    mouseX = event.pageX;
    mouseY = event.pageY;
  });

  /**
   * Returns the current mouse position.
   *
   * @returns {Object} An object with `x` and `y` properties representing the current mouse position.
   */
  return function() {
    return { x: mouseX, y: mouseY };
  };
}

/**
 * A function to get the current mouse position.
 * This function is created by `createMouseTracker()` and can be used to retrieve the latest mouse position.
 */
const getMousePosition = createMouseTracker();
/**
 * loadScript ver2.0
 * 指定URL(CDN等)を読み込む関数(js,cssのみ対応)
 * v1.0: 作成
 * v1.1: IEを除外し、簡略化
 * v2.0: Promiseに対応
 * @param {string} url [スクリプトのURL]
 * @param {string} scripttype [js,css]
 * @param {function} [callback]
 */
function loadScript(url, scripttype, callback) {
  return new Promise((resolve, reject) => {
    let script;
    if (scripttype === 'js') {
      script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
    } else if (scripttype === 'css') {
      script = document.createElement('link');
      script.type = 'text/css';
      script.href = url;
      script.rel = 'stylesheet';
    }
    if (!script) reject(new Error('Failed to create script tag.'));
    script.onload = () => {
      console.log(`LoadScript ${url}`);
      typeof callback === 'function' && callback();
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load script.'));
    document.head.appendChild(script);
  });
}
