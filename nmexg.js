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
 * Class representing a Font Awesome icon element, optionally wrapped and configurable.
 */
class FaIcon_old {
  /**
   * Create a Font Awesome icon.
   * @param {Object} [options={}] - Configuration options for the icon.
   * @param {string} [options.name='fa-solid fa-star'] - Font Awesome class name(s).
   * @param {string} [options.addClass=''] - Additional class names to add.
   * @param {boolean} [options.wrapper=false] - Whether to wrap the icon in a <span> element.
   * @param {Function|null} [options.onClick=null] - Optional click event handler.
   * @param {Object} [options.attr={}] - Additional HTML attributes to apply to the icon element.
   */
  constructor(options = {}) {
    const { name = 'fa-solid fa-star', addClass = '', wrapper = false, onClick = null, attr = {} } = options;
    const className = [name, addClass].filter(Boolean).join(' ');
    const icon = $(`<i class="${className}"></i>`);
    Object.entries(attr).forEach(([key, value]) => icon.attr(key, value));
    this.element = wrapper ? $('<span class="fa-icon-wrap"></span>').append(icon) : icon;
    if (onClick) this.element.on('click', onClick);
  }
  /**
   * Get the jQuery object representing the icon or its wrapper.
   * @returns {jQuery} The jQuery DOM element.
   */
  getNode() {
    return this.element;
  }

  /**
   * Get the outer HTML of the icon or its wrapper.
   * @returns {string} The HTML string.
   */
  getHtml() {
    return this.element.prop('outerHTML');
  }
}

//core/NXTable.jsに移行した。しばらく様子を見て問題なければ削除
class NXTable_old {
  /**
   * Create an NXTable.
   * @param {...*} args - Either an object with 'head' and 'body' properties or two arrays (head, body).
   */
  constructor(...args) {
    if (args.length === 0) {
      this.head = [];
      this.body = [];
    } else if (args[0]?.head && args[0]?.body) {
      ({ head: this.head, body: this.body } = args[0]);
    } else if (Array.isArray(args[0])) {
      [this.head, this.body] = args;
    } else {
      this.reset();
      console.group('NXTable Warn');
      console.warn('Received invalid arguments: Expected object with "head" and "body", or two arrays.');
      console.warn('Given head.');
      console.table(this.head);
      console.warn('Given body.');
      console.table(this.body);
      console.groupEnd('NXTable Warn');
    }
    if (!this._isOneDimArray(this.head)) {
      this.reset();
      console.warn('NXTable: Head is not a one-dimensional array.');
    }
    this.headIndices = this._createHeadIndices();
  }
  _createHeadIndices() {
    return new Map(this.head.map((header, index) => [header, index]));
  }
  _convertToNumber(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseFloat(value.replace(',', ''));
      return isNaN(num) ? 0 : num;
    }
    return 0;
  }
  _isIntegerAndNotString(value) {
    return Number.isInteger(value) && typeof value !== 'string';
  }
  _getIndex(head, strict = true) {
    const index = this._isIntegerAndNotString(head) ? head : this.headIndices.get(head);
    if (strict && index === undefined) {
      console.warn(`${head} is Not Found.`);
      return undefined;
    }
    return index;
  }
  _matchesCondition(row, condition) {
    const [targetHead, query, isExactMatch = true] = condition;
    const targetIndex = this._getIndex(targetHead);
    if (targetIndex === undefined) return false;
    const targetValue = row[targetIndex]?.toString() || '';
    const queryArray = Array.isArray(query) ? query : [query];
    return queryArray.some(q => (isExactMatch ? targetValue === q.toString() : targetValue.includes(q.toString())));
  }
  _filterRowsByConditions(conditions) {
    const cachedIndexes = conditions.map(([head]) => this._getIndex(head, false));
    //一つでもヘッダーが存在しなければ空で返す
    if (cachedIndexes.some(elem => elem === undefined)) return [];
    return this.body.filter(row =>
      conditions.every((condition, i) => {
        //null,undefinedはスキップ
        if (condition == null) return true;
        const [targetHead, query, isExactMatch = true] = condition;
        const targetValue = row[cachedIndexes[i]]?.toString() || '';
        const queryArray = Array.isArray(query) ? query : [query];
        return queryArray.some(q => (isExactMatch ? targetValue === q.toString() : targetValue.includes(q.toString())));
      })
    );
  }
  /**
   * Check if an array is one-dimensional.
   * @param {Array} arr - The array to check.
   * @returns {boolean} True if the array is one-dimensional, false otherwise.
   * @private
   */
  _isOneDimArray(arr) {
    return Array.isArray(arr) && arr.every(element => !Array.isArray(element));
  }
  sumifs(sumHead, ...conditions) {
    const sumIndex = this._getIndex(sumHead);
    if (sumIndex === undefined) return null;
    const filteredRows = this._filterRowsByConditions(conditions);
    return filteredRows.reduce((sum, row) => sum + this._convertToNumber(row[sumIndex]), 0);
  }
  countifs(...conditions) {
    return this._filterRowsByConditions(conditions).length;
  }
  averageifs(averageHead, ...conditions) {
    const averageIndex = this._getIndex(averageHead);
    if (averageIndex === undefined) return null;
    const filteredRows = this._filterRowsByConditions(conditions);
    if (filteredRows.length === 0) return 0;
    const sum = filteredRows.reduce((sum, row) => sum + this._convertToNumber(row[averageIndex]), 0);
    return sum / filteredRows.length;
  }
  xlookup(lookupValue, lookupHead, returnHead) {
    const lookupIndex = this._getIndex(lookupHead);
    const returnIndex = this._getIndex(returnHead);
    if (lookupIndex === undefined || returnIndex === undefined) return null;
    const lookupStr = lookupValue.toString();
    for (const row of this.body) {
      if ((row[lookupIndex]?.toString() || '') === lookupStr) {
        return row[returnIndex] || null;
      }
    }
    return null;
  }
  /**
   * Conditional sum based on a test function applied to a target column.
   * @param {string} sumHead - The header of the column to sum.
   * @param {string} targetHead - The header of the column to apply the test function to.
   * @param {function} testFunction - A function that takes a value and returns a boolean.
   * @returns {number} The sum of the values in the sum column that meet the condition.
   */
  conditionalSum(sumHead, targetHead, testFunction) {
    if (typeof testFunction !== 'function') throw new Error('NXTable: testFunction must be a function.');

    const sumIndex = this._getIndex(sumHead);
    const targetIndex = this._getIndex(targetHead);

    if (sumIndex === undefined || targetIndex === undefined) {
      return 0; // Return 0 if either header is invalid
    }

    return this.body.reduce((sum, row) => {
      const targetValue = row[targetIndex];
      if (testFunction(targetValue)) return sum + this._convertToNumber(row[sumIndex]);
      return sum;
    }, 0);
  }
  /**
   * Conditional count based on a test function applied to a target column.
   * @param {string} targetHead - The header of the column to apply the test function to.
   * @param {function} testFunction - A function that takes a value and returns a boolean.
   * @returns {number} The count of rows where the target column value satisfies the test function.
   */
  conditionalCount(targetHead, testFunction) {
    if (typeof testFunction !== 'function') throw new Error('NXTable: testFunction must be a function.');

    const targetIndex = this._getIndex(targetHead);

    if (targetIndex === undefined) {
      return 0; // Return 0 if the target header is invalid
    }

    return this.body.reduce((count, row) => {
      const targetValue = row[targetIndex];
      if (testFunction(targetValue)) return count + 1;
      return count;
    }, 0);
  }
  match(conditions) {
    const filteredRows = this._filterRowsByConditions(conditions);
    return filteredRows;
  }
  matchFirst(conditions) {
    const filteredRows = this._filterRowsByConditions(conditions)[0];
    const dict = {};
    if (!filteredRows) return {};
    this.head.forEach((elem, index) => {
      dict[elem] = filteredRows[index];
    });
    return dict;
  }
  clone() {
    return new NXTable(structuredClone(this.head), structuredClone(this.body));
  }
  unique(targetHead) {
    const targetIndex = this._getIndex(targetHead);
    if (targetIndex === undefined) return [];
    const uniqueValues = new Set();
    for (const row of this.body) {
      if (row[targetIndex] !== undefined && row[targetIndex] !== null) {
        uniqueValues.add(row[targetIndex]);
      }
    }
    return Array.from(uniqueValues);
  }
  /**
   * Filter rows based on a callback function applied to a specific column.
   * This function modifies the current NXTable instance.
   * @param {string} targetHead - The header of the column to filter on.
   * @param {function} testFunction - A function that takes a cell value and returns a boolean indicating whether the row should be included.
   * @returns {NXTable} The current NXTable instance.
   */
  filter(targetHead, testFunction) {
    if (typeof testFunction !== 'function') throw new Error('NXTable: callback must be a function.');
    const index = this._getIndex(targetHead);
    if (index === undefined) {
      console.warn(`NXTable: Head ${targetHead} is not found.`);
      return this;
    }
    this.body = this.body.filter(row => testFunction(row[index]));
    return this;
  }
  filterByCondition(...conditions) {
    this.body = this._filterRowsByConditions(conditions);
    return this;
  }
  include(query) {
    this.body = this.body.filter(row => Object.values(row).some(value => value.toString().includes(query)));
    return this;
  }
  /**
   * Filter rows that contain a specific query as a complete match in any of their elements.
   * @param {string} query - The query to search for.
   * @returns {NXTable} The current NXTable instance.
   */
  filterByQuery(query) {
    if (typeof query !== 'string') throw new Error('NXTable: query must be a string.');
    this.body = this.body.filter(row => row.some(cell => cell != null && cell.toString() === query));
    return this;
  }
  replace(targetHead, callback) {
    if (typeof callback !== 'function') throw new Error('NXTable: callback must be a function.');
    const targetIndex = this._getIndex(targetHead);
    if (!targetIndex) return this;
    this.body = this.body.map(row => {
      row[targetIndex] = callback(row[targetIndex], row);
      return row;
    });
    return this;
  }
  /**
   * Create a ranking based on the occurrence count of unique elements in a specific column.
   * @param {string} targetHead - The header of the column to analyze.
   * @returns {NXTable} A new NXTable containing the ranking.
   */
  createRanking(targetHead) {
    const targetIndex = this._getIndex(targetHead);
    if (!targetIndex) return null;

    // Count occurrences of each unique value
    const countMap = new Map();
    this.body.forEach(row => {
      const value = row[targetIndex];
      if (countMap.has(value)) {
        countMap.set(value, countMap.get(value) + 1);
      } else {
        countMap.set(value, 1);
      }
    });

    // Convert the countMap to an array and sort it by count (descending)
    const rankingArray = Array.from(countMap.entries()).sort((a, b) => b[1] - a[1]);

    // Create the ranking with the same rank for the same counts
    const rankingBody = [];
    let currentRank = 1;
    let lastCount = null;
    rankingArray.forEach(([value, count], index) => {
      if (count !== lastCount) {
        currentRank = index + 1;
      }
      rankingBody.push([currentRank, value, count]);
      lastCount = count;
    });

    // Create a new NXTable for the ranking
    const rankingHead = ['Rank', targetHead, 'Count'];
    return new NXTable(rankingHead, rankingBody);
  }

  /**
   * Create an AnalyzeCondition in array format.
   *
   * @param {string} head - Column name to analyze.
   * @param {'sum'|'count'|'average'} method - Type of analysis.
   * @param {string} label - Column header name for the result.
   * @param {Array<[string|number, string, boolean]>} [filters] - Optional filter conditions.
   * Each filter condition is an array of [targetHead, searchQuery, isExactMatch].
   *
   * @returns {[string, 'sum'|'count'|'average', string, Array<[string|number, string, boolean]>?]} AnalyzeCondition
   *
   * @example
   * // Create a condition to sum sales where product === 'apple'
   * const condition = NXTable.condition('sales', 'sum', 'Total Sales', [['product', 'apple', true']]);
   */
  static condition(head, method, label, filters) {
    return [head, method, label, filters];
  }
  /**
   * Performs a pivot-style analysis on the table based on a target column and analysis conditions.
   *
   * @param {string} pivotHead - Header to pivot the analysis by (e.g., "region").
   * @param {...AnalyzeCondition} conditions - One or more analysis instructions.
   * @returns {NXTable} A new NXTable containing the analysis result.
   *
   * @example
   * // Analyze total and average sales by region, filtered by product
   * table.analyze(
   *   'region',
   *   ['sales', 'sum', 'Total Sales', [['product', 'apple', true]]],
   *   ['sales', 'average', 'Average Sales']
   * );
   */
  analyze(pivotHead, ...conditions) {
    const uniqueList = this.unique(pivotHead);
    const newHead = [pivotHead];
    const newBody = uniqueList.map(query => [query]);

    conditions.forEach((condition, conditionIndex) => {
      const [analyzeHead, name, caption, ...subConditions] = condition;
      const subConditonsString = subConditions.map(elem => elem.join('')).join();
      const newCaption = caption || `${analyzeHead}(${name}_${subConditonsString})`;
      newHead.push(newCaption);

      uniqueList.forEach((query, queryIndex) => {
        const conditionList = [[pivotHead, query], ...subConditions];
        let value;
        switch (name) {
          case 'sum':
            value = this.sumifs(analyzeHead, ...conditionList);
            break;
          case 'count':
            value = this.countifs(...conditionList);
            break;
          case 'average':
            value = this.averageifs(analyzeHead, ...conditionList);
            break;
          default:
            throw new Error(`NXTable: Unknown analyze method "${name}".`);
        }
        newBody[queryIndex][conditionIndex + 1] = value;
      });
    });

    return new NXTable(newHead, newBody);
  }
  /**
   * Append a column at the specified index or at the end if index is not specified.
   * @param {string} caption - The header of the new column.
   * @param {function} callback - A function that takes a row and returns the value for the new column.
   * @param {number} [index] - The index after which the new column should be inserted. If not specified, the column is added at the end.
   * @returns {NXTable} The current NXTable instance.
   */
  appendColumn(caption, callback, targetHead) {
    if (typeof callback !== 'function') throw new Error('NXTable: callback must be a function.');
    let targetIndex;
    if (targetHead === undefined) {
      targetIndex = this.head.length - 1; // Set index to the last position if not specified
    } else if (this._isIntegerAndNotString(targetHead)) {
      targetIndex = targetHead;
    } else {
      targetIndex = this.headIndices.get(targetHead);
      if (targetIndex === undefined) {
        console.warn(`NXTable: Column "${targetHead}" is not found.`);
        return this;
      }
    }

    // Insert the new header at the specified index
    this.head.splice(targetIndex + 1, 0, caption);

    // Insert the new column at the specified index for each row
    this.body = this.body.map(row => {
      const newValue = callback(row);
      row.splice(targetIndex + 1, 0, newValue);
      return row;
    });

    // Recreate the headIndices map
    this.headIndices = this._createHeadIndices();
    return this;
  }
  /**
   * Appends one or more columns to the table at the specified index.
   * If the callback returns an array, multiple columns will be added.
   * Validates that the number of headers matches the number of values inserted.
   *
   * @param {string|string[]} caption - Column header(s) to insert.
   * @param {function} callback - A function that receives a row and returns a value or array of values.
   * @param {number} [index] - The index after which to insert the new column(s).
   * @returns {NXTable} - Returns this for chaining.
   */
  appendColumnEx(caption, callback, index) {
    if (typeof callback !== 'function') {
      throw new Error('NXTable: callback must be a function.');
    }

    if (index === undefined) {
      index = this.head.length - 1;
    } else if (typeof index !== 'number' || index < 0 || index >= this.head.length) {
      throw new Error('NXTable: Invalid index.');
    }

    const isMultiCaption = Array.isArray(caption);
    if (isMultiCaption && caption.length === 0) {
      throw new Error('NXTable: caption array must not be empty.');
    }

    // Validate using first row
    const sampleRow = this.body[0];
    const sampleValue = callback(sampleRow);

    if (Array.isArray(sampleValue)) {
      if (!isMultiCaption) {
        throw new Error('NXTable: caption must be an array when callback returns an array.');
      }
      if (caption.length !== sampleValue.length) {
        throw new Error(`NXTable: caption length (${caption.length}) does not match returned array length (${sampleValue.length}).`);
      }
    }

    // Insert headers
    if (Array.isArray(sampleValue)) {
      this.head.splice(index + 1, 0, ...caption);
    } else {
      this.head.splice(index + 1, 0, caption);
    }

    // Process rows
    this.body = this.body.map(row => {
      const newValue = callback(row);
      if (Array.isArray(newValue)) {
        row.splice(index + 1, 0, ...newValue);
      } else {
        row.splice(index + 1, 0, newValue);
      }
      return row;
    });

    this.headIndices = this._createHeadIndices();
    return this;
  }
  /**
   * Deletes a column from the table based on the header name or column index.
   *
   * - If a string is provided, it is treated as the header name and the corresponding column will be removed.
   * - If a number is provided, it is treated as the column index and the column at that index will be removed directly.
   *
   * @param {string|number} targetHead - The header name or column index to delete.
   * @returns {NXTable} The current NXTable instance for method chaining.
   */
  deleteColumn(targetHead) {
    let targetIndex;

    if (this._isIntegerAndNotString(targetHead)) {
      targetIndex = targetHead;
    } else {
      targetIndex = this.headIndices.get(targetHead);
      if (targetIndex === undefined) {
        console.warn(`NXTable: Column "${targetHead}" is not found.`);
        return this;
      }
    }

    if (targetIndex < 0 || targetIndex >= this.head.length) {
      console.warn(`NXTable: Invalid column index ${targetIndex}.`);
      return this;
    }

    this.head.splice(targetIndex, 1);

    this.body = this.body.map(row => {
      row.splice(targetIndex, 1);
      return row;
    });

    this.headIndices = this._createHeadIndices();
    return this;
  }
  deleteColumns(...targetHeads) {
    targetHeads.forEach(targetHead => this.deleteColumn(targetHead));
    return this;
  }
  /**
   * Create a new NXTable containing only the specified columns.
   * @param {string[]} targetHeadsArray - Array of header names to extract.
   * @returns {NXTable} A new NXTable with only the selected columns.
   */
  pickColumns(targetHeadsArray) {
    if (!Array.isArray(targetHeadsArray)) {
      throw new Error('NXTable: pickColumns expects an array of header names.');
    }

    // 取得したい列インデックスと存在チェック
    const indexes = targetHeadsArray.map(head => {
      const index = this._getIndex(head, false);
      if (index === undefined) {
        console.warn(`NXTable: Column "${head}" is not found and will be skipped.`);
      }
      return index;
    });

    // 存在する列のみ抽出
    const validPairs = targetHeadsArray.map((head, i) => ({ head, index: indexes[i] })).filter(pair => pair.index !== undefined);

    const newHead = validPairs.map(pair => pair.head);
    const newBody = this.body.map(row => validPairs.map(pair => row[pair.index]));

    return new NXTable(newHead, newBody);
  }
  makeTotalRow() {
    const totals = this.head.map((_, colIndex) => {
      const sum = this.body.reduce((acc, row) => {
        const value = row[colIndex];
        return acc + this._convertToNumber(value);
      }, 0);
      return sum || '';
    });
    totals[0] = '合計';
    this.body.push(totals);
    return this;
  }
  /**
   * Sort the table by a specific column.
   * @param {string} pivotHead - The header of the column to sort by.
   * @param {string|number} [direction='descending'] - The sort direction ('ascending', 'descending', 1, or 0).
   * @param {function} [sortFunction] - A custom sort function for advanced sorting.
   * @returns {NXTable} The current NXTable instance.
   */
  sort(pivotHead, direction = 'descending', sortFunction = null) {
    const pivotIndex = this._getIndex(pivotHead);
    if (pivotIndex === undefined) {
      throw new Error(`NXTable: Column "${pivotHead}" is not found.`);
    }

    // Determine the sort direction
    const isAscending = direction === 'ascending' || direction === 1;

    // Use the provided sortFunction, or fallback to default comparator
    const comparator = sortFunction
      ? (a, b) => sortFunction(a[pivotIndex], b[pivotIndex])
      : (a, b) => {
          const valA = dataConvertForSort(a[pivotIndex]);
          const valB = dataConvertForSort(b[pivotIndex]);

          // Handle undefined or null values
          if (valA == null && valB == null) return 0;
          if (valA == null) return isAscending ? -1 : 1;
          if (valB == null) return isAscending ? 1 : -1;

          // Default comparison
          if (valA < valB) return isAscending ? -1 : 1;
          if (valA > valB) return isAscending ? 1 : -1;
          return 0;
        };

    // Sort the body array
    this.body.sort(comparator);

    return this;

    function dataConvertForSort(elem) {
      if (typeof elem === 'number') return elem;
      if (typeof elem === 'string') {
        //定数の場合順位に変換
        //学年番号
        if (LCT.STUDENT.gradeTable[elem]) return LCT.STUDENT.gradeTable[elem];
        //ブロック名
        if (LCT.UNIT.blockOrder[elem]) return LCT.UNIT.blockOrder[elem];
        //ユニット名
        if (LCT.UNIT.unitOrder[elem]) return LCT.UNIT.unitOrder[elem];
        //教室名
        if (LCT.UNIT.baseOrder[elem]) return LCT.UNIT.baseOrder[elem];

        //該当しなければ%を除外した数値に変換
        return parseInt(elem.replace('%', ''));
      }
      //すべてに当てはまらなければそのまま返す
      return elem;
    }
  }
  /**
   * Transposes the table based on a specified pivot column.
   * Converts rows into columns using the values from the pivot column
   * as new headers.
   *
   * @param {string|number} [pivotHeadOrIndex=0] - The header name or index of the column to pivot by. Defaults to index 0.
   * @param {boolean} [inPlace=false] - If true, modifies the current instance. If false, returns a new NXTable instance.
   * @returns {NXTable} The transposed table (new instance or this, depending on inPlace).
   * @throws {Error} If the pivotHeadOrIndex is invalid or not found.
   */
  transpose(pivotHeadOrIndex = 0, inPlace = false) {
    const index = this._getIndex(pivotHeadOrIndex);
    if (index === undefined) {
      throw new Error(`NXTable: Invalid pivotHead or index: ${pivotHeadOrIndex}`);
    }

    // 新しいヘッダー: 'title' + 元bodyのpivot列
    const newHead = ['title', ...this.body.map(row => row[index])];

    const newBody = [];

    // 元のヘッダーをループ（pivot列はスキップ）
    for (let col = 0; col < this.head.length; col++) {
      if (col === index) continue;

      const newRow = [this.head[col]]; // 新しい行の先頭は元ヘッダー

      // 各行の対象列の値を追加
      for (let row = 0; row < this.body.length; row++) {
        newRow.push(this.body[row][col]);
      }

      newBody.push(newRow);
    }

    const result = new NXTable(newHead, newBody);

    if (inPlace) {
      this.head = result.head;
      this.body = result.body;
      this.headIndices = this._createHeadIndices();
      return this;
    }

    return result;
  }

  reset() {
    this.head = [];
    this.body = [];
    this.headIndices = new Map();
  }

  fromClipboard(clipboardData) {
    const rows = clipboardData
      .trim()
      .split('\n')
      .map(row => row.split('\t'));
    if (rows.length === 0) return this;

    if (this.head.length === 0) {
      this.head = rows.shift();
    }

    this.body = rows;
    this.headIndices = this._createHeadIndices();

    return this;
  }
  appendFromArray(array) {
    array.forEach(obj => {
      const newRow = this.head.map(head => (obj[head] !== undefined ? obj[head] : ''));
      Object.keys(obj).forEach(key => {
        if (!this.headIndices.has(key)) {
          this.head.push(key);
          this.headIndices.set(key, this.head.length - 1);
          newRow.push(obj[key]);
        }
      });
      this.body.push(newRow);
    });
    return this;
  }
  /**
   * Get a specific column as an array.
   * @param {string} head - The head of the column to retrieve.
   * @returns {Array} The column values as an array.
   */
  getColumn(head) {
    const index = this.headIndices.get(head);
    if (index === undefined) {
      console.error(`NXTable: Column "${head}" is not found.`);
      return [];
    }
    return this.body.map(row => row[index]);
  }
  getLength() {
    return this.body.length;
  }
  _toTable(attr = {}) {
    const table = $('<table>');
    for (let key in attr) {
      table.attr(key, attr[key]);
    }
    const trHead = $('<tr>').appendTo(table);
    this.head.forEach(head => {
      trHead.append(`<th title="${head}">${head}</th>`);
    });
    this.body.forEach(row => {
      const tr = $('<tr>').appendTo(table);
      row.forEach(cell => {
        tr.append(`<td data-value="${cell}">${cell}</td>`);
      });
    });
    return table;
  }
  _toArray() {
    return this.body.map(row => {
      const obj = {};
      this.head.forEach((head, index) => (obj[head] = row[index]));
      return obj;
    });
  }
  export(datakind, option = {}) {
    switch (datakind) {
      case 'object':
        const rtn = { head: this.head, body: this.body };
        return rtn;
      case 'array':
        return this._toArray();
      case 'table':
        return this._toTable(option);
      case 'objectArray':
        return this.body.map(row => {
          const obj = {};
          this.head.forEach((head, index) => {
            obj[head] = row[index];
          });
          return obj;
        });
      case 'dictionary':
        const dict = {};
        const pivotIndex = this._getIndex(option.pivotHead || 0);
        this.body.forEach(row => {
          const obj = {};
          this.head.forEach((head, index) => {
            obj[head] = row[index];
          });
          dict[row[pivotIndex]] = obj;
        });
        return dict;
      default:
        throw new Error(`NXTable: datakind "${datakind}" was not found.`);
    }
  }
  merge(otherTable, inPlace = true) {
    if (!(otherTable instanceof NXTable)) {
      throw new Error('NXTable: The provided table must be an instance of NXTable.');
    }

    // 共通のヘッダーを取得し、新しいヘッダーを決定
    const newHead = Array.from(new Set([...this.head, ...otherTable.head]));
    const newHeadIndices = new Map(newHead.map((header, index) => [header, index]));

    // 既存のデータを新ヘッダーに適合させる
    const adaptRow = (row, oldHeadIndices) => {
      return newHead.map(head => (oldHeadIndices.has(head) ? row[oldHeadIndices.get(head)] : null));
    };

    const newBody = [...this.body.map(row => adaptRow(row, this.headIndices)), ...otherTable.body.map(row => adaptRow(row, otherTable.headIndices))];

    if (inPlace) {
      this.head = newHead;
      this.body = newBody;
      this.headIndices = newHeadIndices;
      return this;
    } else {
      return new NXTable(newHead, newBody);
    }
  }
}
/*
class neoTabler {
  constructor($table, headNumber = 0, footerRows = 0) {
    this.table = $table;
    this.headNumber = headNumber; // ヘッダー行の番号
    this.footerRows = footerRows; // フッター行の数
    this.activeFilters = {}; // フィルター状態を保持
    this.setTrigger();
    this.addFilterFunctionality();
    this.addSortFunctionality();
  }

  setTrigger() {
    const self = this;
    this.table.on('dblclick', function() {
      self.copyToClipboard();
    });
  }

  copyToClipboard() {
    let $clonedTable = this.table.clone();

    // visibility: collapse の行を削除
    $clonedTable.find('tr').each(function() {
      if ($(this).css('visibility') === 'collapse') {
        $(this).remove();
      }
    });
    // クローンされたテーブルのHTMLを取得
    let tableHTML = $clonedTable.prop('outerHTML');

    // クリップボードにコピー
    navigator.clipboard
      .writeText(tableHTML)
      .then(() => {
        alert('テーブルの内容がクリップボードにコピーされました！');
      })
      .catch(err => {
        console.error('クリップボードへのコピーに失敗しました:', err);
        alert('クリップボードへのコピーに失敗しました。');
      });
  }

  addSortFunctionality() {
    const self = this;
    this.table.on('contextmenu', 'tr:eq(' + this.headNumber + ') th, tr:eq(' + this.headNumber + ') td', function(e) {
      e.preventDefault(); // 右クリックメニューを無効化
      const columnIndex = $(this).index();
      self.sortTable(columnIndex, this);
    });
  }

  sortTable(columnIndex, headerCell) {
    const rows = this.table.find('tbody tr').get();
    const $headerCell = $(headerCell);
    const currentOrder = $headerCell.attr('data-sort-order') || 'desc'; // デフォルトは降順
    const isAscending = currentOrder === 'desc'; // 現在の状態に基づいて昇順・降順を切り替え
    const cache = {};

    // ヘッダー行を分離
    const headerRow = rows.splice(this.headNumber, 1)[0];

    // フッター行を分離
    const footerRows = rows.splice(-this.footerRows, this.footerRows);

    // データ行をソート
    rows.sort((a, b) => {
      const cellA = $(a)
        .find('td')
        .eq(columnIndex)
        .text()
        .trim();
      const cellB = $(b)
        .find('td')
        .eq(columnIndex)
        .text()
        .trim();

      // キャッシュを使って値変換のパフォーマンス向上
      const valueA = cache[cellA] ?? (cache[cellA] = this.dataConvertForSort(cellA));
      const valueB = cache[cellB] ?? (cache[cellB] = this.dataConvertForSort(cellB));

      if (valueA < valueB) return isAscending ? -1 : 1;
      if (valueA > valueB) return isAscending ? 1 : -1;
      return 0;
    });

    // ヘッダーの文字を太字に設定
    this.highlightSortedHeader(headerCell);

    // ソート状態を反転して保存
    $headerCell.attr('data-sort-order', isAscending ? 'asc' : 'desc');

    // 再構築（ヘッダー行を先頭、フッター行を末尾に戻す）
    this.table
      .find('tbody')
      .empty()
      .append(headerRow, ...rows, ...footerRows);
  }

  highlightSortedHeader(headerCell) {
    // すべてのヘッダーの太字を解除
    this.table
      .find('tr')
      .eq(this.headNumber)
      .find('th, td')
      .removeClass('sorted-header')
      .removeAttr('data-sort-order'); // 状態リセット

    // ソートした列のヘッダーを太字に設定
    $(headerCell).addClass('sorted-header');
  }

  dataConvertForSort(elem) {
    // 数値変換（カンマ区切りを含む場合も対応）
    if (typeof elem === 'string' && /^[\d,]+(\.\d+)?$/.test(elem)) {
      return parseFloat(elem.replace(/,/g, '')); // カンマを除去して数値に変換
    }
    // %対応
    if (typeof elem === 'string' && elem.includes('%')) {
      return parseFloat(elem.replace('%', '')); // パーセント記号を削除して数値に変換
    }
    // 特定の順序を定義
    if (typeof LCT !== 'undefined' && LCT.UNIT && LCT.UNIT.baseOrder[elem]) {
      return LCT.UNIT.baseOrder[elem];
    }
    // その他はそのまま返す
    return elem;
  }

  addFilterFunctionality() {
    const self = this;
    this.table
      .find('tr')
      .eq(this.headNumber)
      .find('th, td')
      .each(function(index) {
        $(this).on('click', function() {
          self.showFilterUI(index, this);
        });
      });
  }

  showFilterUI(columnIndex, headerCell) {
    // フィルターUIを一旦削除
    $('.filter-ui').remove();

    // フィルタリングされている行を収集
    const filteredRows = [];
    const rows = this.table.find('tbody tr');

    // 非表示の行を除外
    rows.each((index, row) => {
      const isVisible = $(row).css('display') !== 'none';
      if (!isVisible) {
        filteredRows.push(
          $(row)
            .find('td')
            .eq(columnIndex)
            .text()
            .trim()
        );
      }
    });

    // ヘッダー行とフッター行を除外するためにフィルタリング対象行のみを処理
    const uniqueValues = new Set();
    rows.each((index, row) => {
      // ヘッダー行とフッター行を除外
      if (index <= this.headNumber || index >= rows.length - this.footerRows) return;

      const cellValue = $(row)
        .find('td')
        .eq(columnIndex)
        .text()
        .trim();

      uniqueValues.add(cellValue);
    });

    // dataConvertForSortを使って昇順に並べ替える
    const sortedValues = Array.from(uniqueValues).sort((a, b) => {
      const valueA = this.dataConvertForSort(a);
      const valueB = this.dataConvertForSort(b);

      if (valueA < valueB) return -1;
      if (valueA > valueB) return 1;
      return 0;
    });

    // フィルターUIを生成
    const filterUI = $('<div class="filter-ui"></div>').css({
      position: 'absolute',
      top: $(headerCell).offset().top + $(headerCell).outerHeight(),
      left: $(headerCell).offset().left,
      border: '1px solid #ccc',
      padding: '0 10px 10px 10px', // 上部の余白をゼロ、その他の余白を10px
      backgroundColor: '#fff',
      zIndex: 1000,
      maxHeight: '400px', // 最大高さを指定
      overflowY: 'auto' // 縦方向スクロールを有効に
    });

    // 固定ヘッダー部分（適用・キャンセルボタン）
    const buttonContainer = $('<div class="filter-buttons"></div>').css({
      position: 'sticky',
      top: 0,
      backgroundColor: '#fff',
      padding: '10px', // ボタンコンテナの適切な余白
      borderBottom: '1px solid #ccc',
      zIndex: 10 // 上に重なるようにする
    });

    // 検索ボックス追加（ボタンの下に配置）
    const searchBox = $('<input type="text" placeholder="検索...">')
      .css({
        width: '100%',
        padding: '5px',
        marginTop: '10px',
        boxSizing: 'border-box'
      })
      .on('input', function() {
        const query = $(this)
          .val()
          .toLowerCase();
        filterUI.find('.filter-checkbox').each(function() {
          const value = $(this)
            .val()
            .toLowerCase();
          const isMatch = value.includes(query);
          $(this).prop('checked', isMatch); // 検索文字列を含む場合はチェック
        });
      });

    buttonContainer.append(searchBox);

    // 適用ボタン
    const applyButton = $('<button>適用</button>').on('click', () => {
      this.applyFilters(columnIndex);
      filterUI.remove();
    });
    buttonContainer.append(applyButton);

    // キャンセルボタン
    const cancelButton = $('<button>キャンセル</button>').on('click', () => {
      filterUI.remove();
    });
    buttonContainer.append(cancelButton);

    filterUI.append(buttonContainer);

    // チェックボックスリストを追加
    sortedValues.forEach(value => {
      const isChecked = !filteredRows.includes(value); // 非表示の行の値は未チェック状態
      const checkbox = $(`
        <div>
          <label>
            <input type="checkbox" class="filter-checkbox" value="${value}" ${isChecked ? 'checked' : ''}>
            ${value}
          </label>
        </div>
      `);

      // もし表示されている項目のうちその値があればチェック
      const isVisible =
        rows.filter((index, row) => {
          const cellValue = $(row)
            .find('td')
            .eq(columnIndex)
            .text()
            .trim();
          return cellValue === value && $(row).css('display') !== 'none';
        }).length > 0;

      // チェックボックスの状態を更新
      if (isVisible) {
        checkbox.find('input').prop('checked', true);
      } else {
        checkbox.find('input').prop('checked', false);
      }

      filterUI.append(checkbox);
    });

    $('body').append(filterUI);
  }

  applyFilters(columnIndex) {
    const checkedValues = [];
    $('.filter-checkbox:checked').each(function() {
      checkedValues.push($(this).val());
    });

    // 現在のフィルタリング条件を更新
    this.activeFilters[columnIndex] = checkedValues;

    // 全体のフィルタリングを適用
    this.applyAllFilters();
  }

  applyAllFilters() {
    const rows = this.table.find('tbody tr');

    rows.each((index, row) => {
      // ヘッダー行とフッター行を除外
      if (index <= this.headNumber || index >= this.table.find('tbody tr').length - this.footerRows) {
        return; // ヘッダー行やフッター行はそのまま表示
      }

      let isVisible = true;

      // すべてのフィルタを順番に適用
      Object.keys(this.activeFilters).forEach(columnIndex => {
        const cellValue = $(row)
          .find('td')
          .eq(columnIndex)
          .text()
          .trim();

        // フィルタの値が一致しない場合、非表示
        if (!this.activeFilters[columnIndex].includes(cellValue)) {
          isVisible = false;
        }
      });

      // 行を表示・非表示
      $(row).toggle(isVisible);
    });
  }
}
*/
class neoTabler {
  constructor($table, headNumber = 0, footerRows = 0) {
    this.table = $table;
    this.headNumber = headNumber; // ヘッダー行の番号
    this.footerRows = footerRows; // フッター行の数
    this.activeFilters = {}; // フィルター状態を保持
    this.setTrigger();
    this.addFilterFunctionality();
    this.addSortFunctionality();
  }

  setTrigger() {
    const self = this;
    this.table.on('dblclick', function() {
      self.copyToClipboard();
    });
  }

  copyToClipboard() {
    let $clonedTable = this.table.clone();

    // visibility: collapse の行を削除
    $clonedTable.find('tr').each(function() {
      if ($(this).css('visibility') === 'collapse') {
        $(this).remove();
      }
    });
    // クローンされたテーブルのHTMLを取得
    let tableHTML = $clonedTable.prop('outerHTML');

    // クリップボードにコピー
    navigator.clipboard
      .writeText(tableHTML)
      .then(() => {
        alert('テーブルの内容がクリップボードにコピーされました！');
      })
      .catch(err => {
        console.error('クリップボードへのコピーに失敗しました:', err);
        alert('クリップボードへのコピーに失敗しました。');
      });
  }

  // セルの値を取得し、必要に応じて変換する処理
  getCellValue(row, columnIndex) {
    const cellValue = $(row)
      .find('td')
      .eq(columnIndex)
      .text()
      .trim();
    return this.dataConvertForSort(cellValue);
  }

  // フィルタリング処理の共通部分
  applyVisibility(row, columnIndex, checkedValues) {
    const cellValue = this.getCellValue(row, columnIndex);
    const isVisible = checkedValues.includes(cellValue);
    $(row).toggle(isVisible);
  }

  addSortFunctionality() {
    const self = this;
    this.table.on('contextmenu', 'tr:eq(' + this.headNumber + ') td', function(e) {
      e.preventDefault(); // 右クリックメニューを無効化
      const columnIndex = $(this).index();
      self.sortTable(columnIndex, this);
    });
  }

  sortTable(columnIndex, headerCell) {
    const rows = this.table.find('tbody tr').get();
    const $headerCell = $(headerCell);
    const currentOrder = $headerCell.attr('data-sort-order') || 'desc';
    const isAscending = currentOrder === 'desc';

    // ヘッダー行とフッター行の処理
    const headerRow = rows.splice(this.headNumber, 1)[0];
    const footerRows = rows.splice(-this.footerRows, this.footerRows);

    // フィルター状態を保存
    const activeFilters = this.activeFilters;

    // 行をソート
    rows.sort((a, b) => {
      const valueA = this.getCellValue(a, columnIndex);
      const valueB = this.getCellValue(b, columnIndex);

      if (valueA < valueB) return isAscending ? -1 : 1;
      if (valueA > valueB) return isAscending ? 1 : -1;
      return 0;
    });

    // ソート状態を反転して保存
    $headerCell.attr('data-sort-order', isAscending ? 'asc' : 'desc');

    // ソート後にフィルターを適用
    this.activeFilters = activeFilters; // フィルター状態を戻す
    this.applyAllFilters(); // フィルタリングを再適用

    // すべての行を再構築
    this.table
      .find('tbody')
      .empty()
      .append(rows);

    // ヘッダー行とフッター行を再度追加
    this.table.find('tbody').prepend(headerRow); // ヘッダー行を先頭に追加
    this.table.find('tbody').append(footerRows); // フッター行を末尾に追加

    // ソート後にフィルタリング機能を再設定（右クリックリスナーを再設定）
    this.addFilterFunctionality(); // フィルターUIの右クリックリスナーを再設定
  }

  applyFiltersAfterSort(columnIndex) {
    const checkedValues = $('.filter-checkbox:checked')
      .map(function() {
        return $(this).val();
      })
      .get();

    this.table.find('tbody tr').each((index, row) => {
      if (index <= this.headNumber || index >= this.table.find('tbody tr').length - this.footerRows) return;
      this.applyVisibility(row, columnIndex, checkedValues);
    });
  }

  // フィルタリング状態を保存し、適用する
  applyFilters(columnIndex) {
    const checkedValues = [];
    $('.filter-checkbox:checked').each(function() {
      checkedValues.push($(this).val());
    });

    // フィルター状態を保存
    this.activeFilters[columnIndex] = checkedValues;

    // フィルターを一括適用
    this.applyAllFilters();
  }

  // すべてのフィルターを適用
  applyAllFilters() {
    const rows = this.table.find('tbody tr');

    rows.each((index, row) => {
      if (index <= this.headNumber || index >= this.table.find('tbody tr').length - this.footerRows) {
        return; // ヘッダーやフッター行はスキップ
      }

      let isVisible = true;

      // すべてのフィルターを順番に適用
      Object.keys(this.activeFilters).forEach(columnIndex => {
        this.applyVisibility(row, columnIndex, this.activeFilters[columnIndex]);
      });
    });
  }

  highlightSortedHeader(headerCell) {
    // すべてのヘッダーの太字を解除
    this.table
      .find('tr')
      .eq(this.headNumber)
      .find('th, td')
      .removeClass('sorted-header')
      .removeAttr('data-sort-order'); // 状態リセット

    // ソートした列のヘッダーを太字に設定
    $(headerCell).addClass('sorted-header');
  }

  dataConvertForSort(elem) {
    // 数値変換（カンマ区切りを含む場合も対応）
    if (typeof elem === 'string' && /^[\d,]+(\.\d+)?$/.test(elem)) {
      return parseFloat(elem.replace(/,/g, '')); // カンマを除去して数値に変換
    }
    // %対応
    if (typeof elem === 'string' && elem.includes('%')) {
      return parseFloat(elem.replace('%', '')); // パーセント記号を削除して数値に変換
    }
    // 特定の順序を定義
    if (typeof LCT !== 'undefined' && LCT.UNIT && LCT.UNIT.baseOrder[elem]) {
      return LCT.UNIT.baseOrder[elem];
    }
    // その他はそのまま返す
    return elem;
  }

  addFilterFunctionality() {
    const self = this;
    this.table
      .find('tr')
      .eq(this.headNumber)
      .find('th, td')
      .each(function(index) {
        $(this).on('click', function() {
          self.showFilterUI(index, this);
        });
      });
  }

  showFilterUI(columnIndex, headerCell) {
    // フィルターUIを一旦削除
    $('.filter-ui').remove();

    // フィルタリングされている行を収集
    const filteredRows = [];
    const rows = this.table.find('tbody tr');

    // 非表示の行を除外
    rows.each((index, row) => {
      const isVisible = $(row).css('display') !== 'none';
      if (!isVisible) {
        filteredRows.push(
          $(row)
            .find('td')
            .eq(columnIndex)
            .text()
            .trim()
        );
      }
    });

    // ヘッダー行とフッター行を除外するためにフィルタリング対象行のみを処理
    const uniqueValues = new Set();
    rows.each((index, row) => {
      // ヘッダー行とフッター行を除外
      if (index <= this.headNumber || index >= rows.length - this.footerRows) return;

      const cellValue = $(row)
        .find('td')
        .eq(columnIndex)
        .text()
        .trim();

      uniqueValues.add(cellValue);
    });

    // dataConvertForSortを使って昇順に並べ替える
    const sortedValues = Array.from(uniqueValues).sort((a, b) => {
      const valueA = this.dataConvertForSort(a);
      const valueB = this.dataConvertForSort(b);

      if (valueA < valueB) return -1;
      if (valueA > valueB) return 1;
      return 0;
    });

    // フィルターUIを生成
    const filterUI = $('<div class="filter-ui"></div>').css({
      position: 'absolute',
      top: $(headerCell).offset().top + $(headerCell).outerHeight(),
      left: $(headerCell).offset().left,
      border: '1px solid #ccc',
      padding: '0 10px 10px 10px',
      backgroundColor: '#fff',
      zIndex: 1000,
      maxHeight: '400px',
      overflowY: 'auto'
    });

    // 固定ヘッダー部分（適用・キャンセルボタン）
    const buttonContainer = $('<div class="filter-buttons"></div>').css({
      position: 'sticky',
      top: 0,
      backgroundColor: '#fff',
      padding: '10px',
      borderBottom: '1px solid #ccc',
      zIndex: 10
    });

    // 検索ボックス追加（ボタンの下に配置）
    const searchBox = $('<input type="text" placeholder="検索...">')
      .css({
        width: '100%',
        padding: '5px',
        marginTop: '10px',
        boxSizing: 'border-box'
      })
      .on('input', function() {
        const query = $(this)
          .val()
          .toLowerCase();
        filterUI.find('.filter-checkbox').each(function() {
          const value = $(this)
            .val()
            .toLowerCase();
          const isMatch = value.includes(query);
          $(this).prop('checked', isMatch);
        });
      });

    buttonContainer.append(searchBox);

    // 適用ボタン
    const applyButton = $('<button>適用</button>').on('click', () => {
      this.applyFilters(columnIndex);
      filterUI.remove();
    });
    buttonContainer.append(applyButton);

    // キャンセルボタン
    const cancelButton = $('<button>キャンセル</button>').on('click', () => {
      filterUI.remove();
    });
    buttonContainer.append(cancelButton);

    filterUI.append(buttonContainer);

    // チェックボックスリストを追加
    sortedValues.forEach(value => {
      // フィルタリングされた行の中にこの値が残っているか確認
      const isChecked =
        rows.filter((index, row) => {
          const cellValue = $(row)
            .find('td')
            .eq(columnIndex)
            .text()
            .trim();
          return cellValue === value && $(row).css('display') !== 'none';
        }).length > 0; // 1行でも表示されていればチェックを入れる

      const checkbox = $(`
        <div>
          <label>
            <input type="checkbox" class="filter-checkbox" value="${value}" ${isChecked ? 'checked' : ''}>
            ${value}
          </label>
        </div>
      `);

      filterUI.append(checkbox);
    });

    $('body').append(filterUI);
  }
}

$.fn.neoTabler = function(headNumber = 0, footerRows = 0) {
  new neoTabler(this, headNumber, footerRows);
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
    campaign: { 開始: '2025/11/01', 終了: '2026/2/28' },
    koshu_kikan: { 開始: '2025/12/20', 終了: '2026/1/6' }
  },
  DT: {
    //NXMakeDateで生成
  },
  ENDPOINT: {
    zoomMaker: 'https://n8n.overhauser0.synology.me/webhook/zoomMaker',
    sendMail: 'https://n8n.overhauser0.synology.me/webhook/sendNetzMail'
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
NX.SUMMER = {
  GOALNXT: {
    head: ['担当者名', '個人目標'],
    body: [
      ['大世戸　敦', '5,400,000'],
      ['荒木　智子', '560,000'],
      ['矢野　誠治', '1,500,000'],
      ['佐々木　譲司', '930,000'],
      ['辰野　由弥', '2,700,000'],
      ['中村　莉菜', '750,000'],
      ['古久保　和仁', '3,100,000'],
      ['大田　俊介', '3,200,000'],
      ['浜田　健登', '1,500,000'],
      ['大橋　健司', '2,600,000'],
      ['那須　裕子', '2,100,000'],
      ['池田　さくら', '3,200,000'],
      ['庄野　知佳', '610,000'],
      ['坂本　薫', '4,600,000'],
      ['池田　光一', '6,700,000'],
      ['竹中　香保里', '150,000'],
      ['鹿毛　史寛', '50,000'],
      ['平本　晃大', '6,906,000']
    ]
  }
};
NX.SPRING = {
  STUDENTSNXT: {
    head: ['教室cd', '教室名', '４月目標', '非受母数', '非受目標', '受験小６母数', '受験小６目標', '中３母数', '中３目標', '新規目標'],
    body: [
      ['3404', '白島', 41, 32, 28, 2, 1, 13, 4, 8],
      ['3414', '緑井', 27, 19, 17, 0, 0, 6, 2, 8],
      ['3408', '上安', 24, 15, 13, 2, 1, 6, 2, 8],
      ['3403', '中広', 38, 27, 24, 4, 3, 9, 3, 8],
      ['3416', '広島駅前', 35, 28, 24, 2, 2, 3, 1, 8],
      ['3405', '中筋', 29, 19, 17, 0, 0, 12, 4, 8],
      ['3406', '古江', 28, 19, 17, 0, 0, 8, 3, 8],
      ['3401', '皆実町', 46, 38, 34, 2, 2, 5, 2, 8],
      ['3410', '安芸府中', 56, 48, 42, 2, 1, 15, 5, 8],
      ['3311', '岡山駅前', 187, 162, 154, 16, 9, 13, 6, 18],
      ['3313', 'HS岡山駅前', 0, 0, 0, 0, 0, 0, 0, 0],
      ['3302', '岡北', 45, 35, 33, 1, 0, 4, 2, 10],
      ['3301', '伊島', 35, 24, 22, 2, 1, 6, 4, 8],
      ['3308', '津高', 38, 25, 23, 1, 1, 8, 4, 10],
      ['3304', '国富', 49, 37, 35, 0, 0, 4, 2, 12],
      ['3303', '西古松', 29, 14, 13, 1, 1, 8, 4, 11],
      ['3309', '高島', 40, 27, 25, 3, 1, 11, 6, 8],
      ['3702', '栗林', 35, 23, 21, 1, 0, 8, 5, 9],
      ['3707', '木太南', 56, 42, 39, 0, 0, 14, 9, 8],
      ['3706', '水田', 17, 11, 10, 0, 0, 3, 1, 6],
      ['3701', '番町', 30, 21, 19, 1, 1, 5, 2, 8],
      ['b3401', '広島北Ｕ', 130, 93, 82, 8, 5, 34, 11, 32],
      ['b3403', '広島南Ｕ', 194, 152, 134, 6, 5, 43, 15, 40],
      ['b3302', '岡山北Ｕ', 305, 246, 232, 20, 11, 31, 16, 46],
      ['b3303', '岡山南Ｕ', 118, 78, 73, 4, 2, 23, 12, 31],
      ['b3701', '高松Ｕ', 138, 97, 89, 2, 1, 30, 17, 31],
      ['a5031', '中四国', 885, 666, 610, 40, 24, 161, 71, 180],
      ['c3400', '広島県校舎', 324, 245, 216, 14, 10, 77, 26, 72],
      ['c3300', '岡山県校舎', 423, 324, 305, 24, 13, 54, 28, 77]
    ]
  },
  BASENUMBER: {
    price: {
      小１: 24000,
      小２: 24000,
      小３: 24000,
      小４: 24000,
      小５: 24000,
      小６: 24000,
      中１: 46000,
      中２: 46000,
      中３: 95000,
      高１: 46000,
      高２: 46000,
      高３: 95000,
      大学受験: 95000,
      受験小１: 49000,
      受験小２: 49000,
      受験小３: 49000,
      受験小４: 49000,
      受験小５: 49000,
      受験小６: 95000,
      一貫中１: 46000,
      一貫中２: 46000,
      一貫中３: 46000,
      幼児０歳: 14000,
      幼児１歳: 14000,
      幼児２歳: 14000,
      幼児３歳: 14000,
      年少４歳: 14000,
      年中５歳: 14000,
      年長６歳: 14000,
      未就学: 14000,
      その他: 0
    },
    rate: {
      小１: '95%',
      小２: '95%',
      小３: '95%',
      小４: '95%',
      小５: '95%',
      小６: '95%',
      中１: '95%',
      中２: '95%',
      中３: '95%',
      高１: '95%',
      高２: '95%',
      高３: '95%',
      大学受験: '95%',
      受験小１: '95%',
      受験小２: '95%',
      受験小３: '95%',
      受験小４: '95%',
      受験小５: '95%',
      受験小６: '95%',
      一貫中１: '95%',
      一貫中２: '95%',
      一貫中３: '95%',
      幼児０歳: '95%',
      幼児１歳: '95%',
      幼児２歳: '95%',
      幼児３歳: '95%',
      年少４歳: '95%',
      年中５歳: '95%',
      年長６歳: '95%',
      未就学: '95%',
      その他: '0%'
    }
  }
};

NX.SALES = {
  goalNXT0603: {
    head: ['ユニット', '年月', '入会金', '初月月謝', '月謝', '売上割引', '講習料', '模試教材費', '合宿料', 'その他', '合計'],
    body: [
      ['b3401', '2025/04', '80000', '65000', '2555200', '-48800', '0', '594750', '0', '4000', '3250150'],
      ['b3401', '2025/05', '80000', '70000', '3572800', '-65000', '0', '105259', '0', '4000', '3767059'],
      ['b3401', '2025/06', '0', '96000', '3674550', '-58910', '0', '85023', '0', '4000', '3800663'],
      ['b3401', '2025/07', '65000', '0', '3983100', '-48620', '0', '149262', '0', '6000', '4154742'],
      ['b3401', '2025/08', '10000', '10000', '0', '-22500', '6732250', '302346', '810000', '2000', '7844096'],
      ['b3401', '2025/09', '35000', '35000', '4241160', '-50860', '0', '913662', '0', '6000', '5179962'],
      ['b3401', '2025/10', '30000', '30000', '4358970', '-24450', '1348800', '34138', '0', '4100', '5781558'],
      ['b3401', '2025/11', '0', '42000', '4417875', '-22450', '0', '60577', '0', '6124', '4504126'],
      ['b3401', '2025/12', '45000', '45000', '3652110', '-22450', '4436800', '58154', '720000', '4124', '8938738'],
      ['b3401', '2026/01', '20000', '20000', '4177984.388', '-22400', '330000', '53685', '0', '4124', '4583393.388'],
      ['b3401', '2026/02', '0', '25000', '3939860.925', '-22400', '0', '18954', '0', '4124', '3965538.925'],
      ['b3401', '2026/03', '40000', '0', '2566476.124', '-20400', '2018250', '376169', '0', '6124', '4986619.124'],
      ['b3403', '2025/04', '45000', '65450', '4123300', '-58740', '0', '897650', '0', '247', '5072907'],
      ['b3403', '2025/05', '70000', '112000', '5052600', '-81820', '0', '72086', '0', '4247', '5229113'],
      ['b3403', '2025/06', '0', '96000', '5258890', '-40240', '0', '90074', '0', '6100', '5410824'],
      ['b3403', '2025/07', '90000', '0', '5547840', '-36480', '0', '135433', '0', '2100', '5738893'],
      ['b3403', '2025/08', '35000', '35000', '0', '-18550', '9364250', '395279', '1323000', '200', '11134179'],
      ['b3403', '2025/09', '50000', '50000', '6341008', '-44200', '0', '1095568', '0', '6400', '7498776'],
      ['b3403', '2025/10', '55000', '55000', '6462367', '-28550', '2396400', '74786', '0', '4200', '9019203'],
      ['b3403', '2025/11', '0', '84000', '6674745', '-26550', '0', '106656', '0', '4247', '6843098'],
      ['b3403', '2025/12', '80000', '80000', '5582514', '-26550', '6507300', '90677', '768000', '4247', '13086188'],
      ['b3403', '2026/01', '20000', '20000', '6792463', '-24400', '462000', '53863', '0', '6247', '7330173'],
      ['b3403', '2026/02', '0', '55000', '6101627', '-20450', '0', '43967', '0', '4371', '6184515'],
      ['b3403', '2026/03', '65000', '0', '4160384', '-20350', '3079750', '741349', '0', '2371', '8028504'],
      ['b3302', '2025/04', '30000', '107350', '6524800', '-235820', '0', '1355469', '0', '12371', '7794170'],
      ['b3302', '2025/05', '20000', '24600', '7882000', '-222560', '0', '473900', '0', '10495', '8188435'],
      ['b3302', '2025/06', '0', '120000', '7914514', '-145240', '0', '518736', '0', '2500', '8410510'],
      ['b3302', '2025/07', '90000', '0', '8124170', '-131320', '0', '521503', '0', '2600', '8606953'],
      ['b3302', '2025/08', '70000', '70000', '0', '-121700', '15079750', '1091514', '1566000', '6400', '17761964'],
      ['b3302', '2025/09', '55000', '55000', '9025691', '-138190', '0', '1287875', '0', '16600', '10301976'],
      ['b3302', '2025/10', '50000', '50000', '9163278', '-81450', '3313200', '602333', '0', '18700', '13116061'],
      ['b3302', '2025/11', '0', '126000', '9273347', '-77350', '0', '571610', '0', '12865', '9906472'],
      ['b3302', '2025/12', '65000', '65000', '7682844', '-153850', '10051900', '518455', '672000', '14865', '18916214'],
      ['b3302', '2026/01', '20000', '20000', '9240876', '-81600', '462000', '292121', '0', '14865', '9968262'],
      ['b3302', '2026/02', '0', '60000', '8313542', '-76400', '0', '1417834', '0', '10618', '9725594'],
      ['b3302', '2026/03', '85000', '0', '6022502', '-113800', '4626000', '1405016', '0', '18495', '12043213'],
      ['b3303', '2025/04', '60000', '44900', '1896400', '-91750', '0', '495200', '0', '2124', '2406874'],
      ['b3303', '2025/05', '20000', '0', '2449900', '-109400', '0', '71159', '0', '124', '2431783'],
      ['b3303', '2025/06', '0', '54000', '2418836', '-94940', '0', '52761', '0', '0', '2430657'],
      ['b3303', '2025/07', '45000', '0', '2559466', '-79674', '0', '51447', '0', '2100', '2578339'],
      ['b3303', '2025/08', '25000', '25000', '0', '-24450', '4504500', '231649', '594000', '2100', '5357799'],
      ['b3303', '2025/09', '25000', '25000', '2864633', '-85250', '0', '794936', '0', '4100', '3628419'],
      ['b3303', '2025/10', '15000', '15000', '2894165', '-30650', '980400', '68043', '0', '6100', '3948058'],
      ['b3303', '2025/11', '0', '42000', '2835101', '-28600', '0', '79106', '0', '6124', '2933731'],
      ['b3303', '2025/12', '15000', '15000', '2362584', '-58600', '2862100', '80024', '408000', '8124', '5692232'],
      ['b3303', '2026/01', '10000', '10000', '2849867', '-26600', '280500', '22266', '0', '6247', '3152280'],
      ['b3303', '2026/02', '0', '20000', '2579942', '-28650', '0', '129447', '0', '4247', '2704986'],
      ['b3303', '2026/03', '35000', '0', '1735569', '-30500', '1336500', '599496', '0', '4247', '3680312'],
      ['b3701', '2025/04', '50000', '96250', '3506300', '-98510', '0', '628000', '0', '124', '4182164'],
      ['b3701', '2025/05', '30000', '24500', '4108000', '-103550', '0', '58150', '0', '2371', '4119471'],
      ['b3701', '2025/06', '0', '66000', '4256538', '-127330', '0', '40102', '0', '4200', '4239510'],
      ['b3701', '2025/07', '55000', '0', '4464900', '-93860', '0', '89311', '0', '2200', '4517551'],
      ['b3701', '2025/08', '15000', '15000', '0', '-26950', '7054250', '381441', '0', '4200', '7442941'],
      ['b3701', '2025/09', '30000', '30000', '4875671', '-82560', '0', '961826', '0', '6200', '5821137'],
      ['b3701', '2025/10', '40000', '40000', '5000688', '-32950', '1699200', '70144', '0', '4300', '6821382'],
      ['b3701', '2025/11', '0', '18000', '5125705', '-28950', '0', '70144', '0', '8371', '5193270'],
      ['b3701', '2025/12', '25000', '25000', '4075561', '-30950', '4713200', '88332', '0', '6371', '8902514'],
      ['b3701', '2026/01', '5000', '5000', '4735183', '-26750', '363000', '19711', '0', '2371', '5103515'],
      ['b3701', '2026/02', '0', '50000', '4152446', '-26600', '0', '13594', '0', '4495', '4193935'],
      ['b3701', '2026/03', '50000', '0', '3145730', '-26550', '2073750', '644208', '0', '2495', '5889633']
    ]
  },
  goalNXT: {
    head: ['ユニット', '年月', '入会金', '初月月謝', '月謝', '売上割引', '講習料', '模試教材費', '合宿料', 'その他', '合計'],
    body: [
      ['b3401', '2025/04', '36000', '60000', '2555200', '-59670', '0', '740582', '0', '2100', '3334212'],
      ['b3401', '2025/05', '30000', '36000', '3506250', '-56910', '0', '61071', '0', '2100', '3578511'],
      ['b3401', '2025/06', '0', '96000', '3534300', '-58910', '0', '82420', '0', '4000', '3657810'],
      ['b3401', '2025/07', '65000', '0', '3898950', '-48620', '0', '144692', '0', '6000', '4066022'],
      ['b3401', '2025/08', '10000', '10000', '0', '-22500', '6685000', '293091', '810000', '2000', '7787591'],
      ['b3401', '2025/09', '35000', '35000', '4152803', '-50860', '0', '885692', '0', '6000', '5063635'],
      ['b3401', '2025/10', '30000', '30000', '4270613', '-24450', '1348800', '33093', '0', '4100', '5692156'],
      ['b3401', '2025/11', '0', '42000', '4329518', '-22450', '0', '58723', '0', '6124', '4413915'],
      ['b3401', '2025/12', '45000', '45000', '3581424', '-22450', '4347700', '56374', '720000', '4124', '8777172'],
      ['b3401', '2026/01', '20000', '20000', '4092719', '-22400', '330000', '52041', '0', '4124', '4496484'],
      ['b3401', '2026/02', '0', '25000', '3859456', '-22400', '0', '18374', '0', '4124', '3884554'],
      ['b3401', '2026/03', '40000', '0', '2506791', '-20400', '1977000', '364654', '0', '6124', '4874169'],
      ['b3403', '2025/04', '27000', '45000', '4123300', '-39550', '0', '1092389', '0', '100', '5248239'],
      ['b3403', '2025/05', '50000', '60000', '5114415', '-46450', '0', '44771', '0', '100', '5222836'],
      ['b3403', '2025/06', '0', '96000', '5316680', '-40240', '0', '90727', '0', '6100', '5469267'],
      ['b3403', '2025/07', '90000', '0', '5663420', '-36480', '0', '136414', '0', '2100', '5855454'],
      ['b3403', '2025/08', '35000', '35000', '0', '-18550', '9411500', '398143', '1323000', '200', '11184293'],
      ['b3403', '2025/09', '50000', '50000', '6462367', '-44200', '0', '1103507', '0', '6400', '7628074'],
      ['b3403', '2025/10', '55000', '55000', '6583726', '-28550', '2396400', '75328', '0', '4200', '9141104'],
      ['b3403', '2025/11', '0', '84000', '6796104', '-26550', '0', '107429', '0', '4247', '6965230'],
      ['b3403', '2025/12', '80000', '80000', '5679601', '-26550', '6626100', '91334', '768000', '4247', '13302732'],
      ['b3403', '2026/01', '20000', '20000', '6909575', '-24400', '462000', '54253', '0', '6247', '7447675'],
      ['b3403', '2026/02', '0', '55000', '6212064', '-20450', '0', '44286', '0', '4371', '6295271'],
      ['b3403', '2026/03', '65000', '0', '4242362', '-20350', '3134750', '746721', '0', '2371', '8170854'],
      ['b3302', '2025/04', '18000', '30000', '6524800', '-144390', '0', '1696573', '0', '8300', '8133283'],
      ['b3302', '2025/05', '60000', '72000', '7966928', '-154341', '0', '411921', '0', '16400', '8372908'],
      ['b3302', '2025/06', '0', '120000', '8071756', '-145240', '0', '522040', '0', '2500', '8571056'],
      ['b3302', '2025/07', '90000', '0', '8543482', '-131320', '0', '524825', '0', '2600', '9029587'],
      ['b3302', '2025/08', '70000', '70000', '0', '-121700', '15316000', '1098466', '1566000', '6400', '18005166'],
      ['b3302', '2025/09', '55000', '55000', '9465968', '-138190', '0', '1296078', '0', '16600', '10750456'],
      ['b3302', '2025/10', '50000', '50000', '9603555', '-81450', '3313200', '606170', '0', '18700', '13560175'],
      ['b3302', '2025/11', '0', '126000', '9713625', '-77350', '0', '575251', '0', '12865', '10350391'],
      ['b3302', '2025/12', '65000', '65000', '8035066', '-153850', '10527100', '521757', '672000', '14865', '19746938'],
      ['b3302', '2026/01', '20000', '20000', '9665744', '-81600', '462000', '293982', '0', '14865', '10394991'],
      ['b3302', '2026/02', '0', '60000', '8714194', '-76400', '0', '1426865', '0', '10618', '10135277'],
      ['b3302', '2026/03', '85000', '0', '6319910', '-113800', '4846000', '1413966', '0', '18495', '12569571'],
      ['b3303', '2025/04', '18000', '30000', '1896400', '-86990', '0', '841570', '0', '2000', '2700980'],
      ['b3303', '2025/05', '30000', '36000', '2475088', '-101085', '0', '39740', '0', '4000', '2483743'],
      ['b3303', '2025/06', '0', '54000', '2587592', '-94940', '0', '53572', '0', '0', '2600224'],
      ['b3303', '2025/07', '45000', '0', '2756348', '-79674', '0', '52238', '0', '2100', '2776012'],
      ['b3303', '2025/08', '25000', '25000', '0', '-24450', '4693500', '235213', '594000', '2100', '5550363'],
      ['b3303', '2025/09', '25000', '25000', '3071359', '-85250', '0', '807166', '0', '4100', '3847375'],
      ['b3303', '2025/10', '15000', '15000', '3100892', '-30650', '980400', '69089', '0', '6100', '4155831'],
      ['b3303', '2025/11', '0', '42000', '3041827', '-28600', '0', '80323', '0', '6124', '3141674'],
      ['b3303', '2025/12', '15000', '15000', '2527965', '-58600', '3070000', '81255', '408000', '8124', '6066744'],
      ['b3303', '2026/01', '10000', '10000', '3049358', '-26600', '280500', '22609', '0', '6247', '3352114'],
      ['b3303', '2026/02', '0', '20000', '2768062', '-28650', '0', '131438', '0', '4247', '2895097'],
      ['b3303', '2026/03', '35000', '0', '1875212', '-30500', '1432750', '608719', '0', '4247', '3925428'],
      ['b3701', '2025/04', '21000', '35000', '3515300', '-177150', '0', '971947', '0', '4300', '4370397'],
      ['b3701', '2025/05', '20000', '24000', '4048176', '-131090', '0', '28391', '0', '4300', '3993777'],
      ['b3701', '2025/06', '0', '66000', '4107708', '-127330', '0', '36414', '0', '4200', '4086992'],
      ['b3701', '2025/07', '55000', '0', '4375602', '-93860', '0', '81098', '0', '2200', '4420040'],
      ['b3701', '2025/08', '15000', '15000', '0', '-26950', '7101500', '346366', '0', '4200', '7455116'],
      ['b3701', '2025/09', '30000', '30000', '4781908', '-82560', '0', '873382', '0', '6200', '5638930'],
      ['b3701', '2025/10', '40000', '40000', '4906925', '-32950', '1699200', '63694', '0', '4300', '6721169'],
      ['b3701', '2025/11', '0', '18000', '5031942', '-28950', '0', '63694', '0', '8371', '5093057'],
      ['b3701', '2025/12', '25000', '25000', '4000550', '-30950', '4624100', '80210', '0', '6371', '8730281'],
      ['b3701', '2026/01', '5000', '5000', '4644702', '-26750', '363000', '17898', '0', '2371', '5011221'],
      ['b3701', '2026/02', '0', '50000', '4067122', '-26600', '0', '12344', '0', '4495', '4107361'],
      ['b3701', '2026/03', '50000', '0', '3082393', '-26550', '2032500', '584970', '0', '2495', '5725808']
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
