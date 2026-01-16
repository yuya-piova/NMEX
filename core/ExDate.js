/**
 * ExDate ver3.0
 * Dateオブジェクトを継承して拡張
 */
class ExDate extends Date {
  /**
   * 曜日および言語設定の静的ラベルデータ
   * @static
   * @type {Object.<string, string[]>}
   */
  static DATE_LABELS = {
    aaaa: ['日曜日', '月曜日', '火曜日', '水曜日', '木曜日', '金曜日', '土曜日'],
    aaa: ['日', '月', '火', '水', '木', '金', '土'],
    aa: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    a: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  };

  /**
   * @param {...any} args - Dateコンストラクタと同じ引数
   */
  constructor(...args) {
    super(...args);
  }

  /**
   * 指定したフォーマットで日時文字列を返します。
   * @example
   * new ExDate().as('yyyy/mm/dd (aaa)') // "2024/01/01 (月)"
   * @param {string} format - yyyy, mm, dd, HH, MM, SS, aaaa, aaa 等の組み合わせ
   * @returns {string} フォーマット済み文字列。無効な日付の場合は空文字。
   */
  as(format) {
    if (!this.isValid() || !format) return '';

    const values = {
      yyyy: this.getFullYear(),
      yy: String(this.getFullYear()).slice(-2),
      m: this.getMonth() + 1,
      mm: String(this.getMonth() + 1).padStart(2, '0'),
      d: this.getDate(),
      dd: String(this.getDate()).padStart(2, '0'),
      H: this.getHours(),
      HH: String(this.getHours()).padStart(2, '0'),
      M: this.getMinutes(),
      MM: String(this.getMinutes()).padStart(2, '0'),
      S: this.getSeconds(),
      SS: String(this.getSeconds()).padStart(2, '0'),
      aaaa: ExDate.DATE_LABELS.aaaa[this.getDay()],
      aaa: ExDate.DATE_LABELS.aaa[this.getDay()],
      aa: ExDate.DATE_LABELS.aa[this.getDay()],
      a: ExDate.DATE_LABELS.a[this.getDay()]
    };

    return format.replace(/yyyy|yy|m{1,2}|d{1,2}|H{1,2}|M{1,2}|S{1,2}|a{1,4}/g, match => values[match]);
  }
  /**
   * 年を加算します
   * @param {number|string} years
   * @returns {this}
   */
  afteryears(years) {
    this.setFullYear(this.getFullYear() + Number(years));
    return this;
  }

  /**
   * 月を加算します
   * @param {number|string} months
   * @returns {this}
   */
  aftermonths(months) {
    this.setMonth(this.getMonth() + Number(months));
    return this;
  }

  /**
   * 日を加算します
   * @param {number|string} days
   * @returns {this}
   */
  afterdays(days) {
    this.setDate(this.getDate() + Number(days));
    return this;
  }

  /**
   * 月末日に設定します
   * @returns {this}
   */
  endofmonth() {
    this.setMonth(this.getMonth() + 1);
    this.setDate(0);
    return this;
  }

  /**
   * 次の特定曜日の日付に移動します
   * @param {string} daystr - '月', '火曜日', 'Mon' など
   * @returns {this}
   */
  nextday(daystr) {
    return this.#moveToDay(daystr, true);
  }

  /**
   * 前の特定曜日の日付に移動します
   * @param {string} daystr - '月', '火曜日', 'Mon' など
   * @returns {this}
   */
  prevday(daystr) {
    return this.#moveToDay(daystr, false);
  }

  /**
   * 内部用：曜日移動ロジック
   * @private
   */
  #moveToDay(daystr, isNext) {
    const targetIdx = Math.max(...Object.values(ExDate.DATE_LABELS).map(arr => arr.indexOf(daystr)));
    if (targetIdx === -1) return this;
    const currentIdx = this.getDay();
    let diff = targetIdx - currentIdx;
    if (isNext && diff < 0) diff += 7;
    if (!isNext && diff > 0) diff -= 7;
    return this.afterdays(diff);
  }
  /**
   * 他の日付と比較し、差分情報を返します
   * @param {Date|string|number} comparison - 比較対象の日付
   * @returns {{forwarddate: ExDate, backwarddate: ExDate, forward: boolean, backward: boolean, difference: number}}
   */
  compare(comparison) {
    const compareDate = new Date(comparison);
    const diff = this.getTime() - compareDate.getTime();
    return {
      forwarddate: new ExDate(Math.max(this, compareDate)),
      backwarddate: new ExDate(Math.min(this, compareDate)),
      forward: diff > 0,
      backward: diff < 0,
      difference: diff
    };
  }
  /**
   * 年度を取得します（デフォルト4月開始）
   * @param {number} [startMonth=4] - 年度の開始月
   * @returns {number}
   */
  getAcademicYear(startMonth = 4) {
    const month = this.getMonth() + 1;
    return month >= startMonth ? this.getFullYear() : this.getFullYear() - 1;
  }
  /**
   * 有効な日付かどうかを判定します
   * @returns {boolean}
   */
  isValid() {
    return !isNaN(this.getTime());
  }
  /**
   * setbyWareki 和暦から日付をセット 和暦以外は省略すると元の値を使う
   * @param {string} gengou [1800年～2999年までの和暦に対応]
   * @param {string} [year]
   * @param {string} [month]
   * @param {string} [date]
   * @return {object} dateobj
   * @memberof ExDate
   */
  setbyWareki(gengou, year, month, date) {
    const def = this.#getWarekiData();
    this.setDateTry(def[gengou] + parseInt(year) - 1, month, date);
    return this;
  }
  /**
   * resolveYear 月日しかない場合に今年を補完する
   * borderdateより前であれば、翌年とする
   * @param {string|Date} borderdate string,Dateいずれも可能
   * @returns
   */
  resolveYear(options) {
    const thisYear = options?.thisYear || new ExDate().as('yyyy');
    const borderDate = new ExDate(`${thisYear}/${options?.borderMMDD || '6/1'}`);
    this.setDateTry(thisYear, null, null);
    if (this < borderDate) this.afteryears(1);
    return this;
  }
  /**
   * setDateTry 日付の代入を試みる、各値を省略した場合、現在の値を使用
   * @param {number} [year]
   * @param {number} [month]
   * @param {number} [date]
   */
  setDateTry(year, month, date) {
    //組込のisNaNでは、true,false,nullはそれぞれ1,0,0に変換されるのでfalseが返ってくる。
    if (this.#isNumber(year)) this.setFullYear(year);
    if (this.#isNumber(month)) this.setMonth(month);
    if (this.#isNumber(date)) this.setDate(date);
    return this;
  }
  /**
   * padWithZero 指定桁数になるように、頭に0埋めをする
   * @param {number} string
   * @param {number} digit
   * @return {string}
   */
  padWithZero(string, digit) {
    return string.toString().padStart(digit, '0');
  }
  #isNumber(val) {
    return /^\d+$/.test(val);
  }

  /**
   * #getWarekiData 各和暦の元年を取得
   * @return
   */
  #getWarekiData() {
    const data = {};
    for (let i = 1868; i <= new Date().getFullYear() + 1; i++) {
      const formatter = new Intl.DateTimeFormat('ja-JP-u-ca-japanese', { era: 'long' });
      const parts = formatter.formatToParts(new Date(i, 0, 1));
      const era = parts.find(p => p.type === 'era').value;
      const year = parts.find(p => p.type === 'year').value;
      if (year === '1' || year === '元') data[era] = i;
    }
    return data;
  }
}
