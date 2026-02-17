// parsers/ScheduleParser.js

/**
 * スケジュール一覧テーブルの解析クラス
 */
export default class ScheduleParser {
  constructor(tableElement) {
    this.table = tableElement;
    this.headers = this._getHeaderMap();
    // 基準年の取得（画面上の入力フィールドから）
    const inputDate = document.getElementById('input1_dt');
    this.baseYear = inputDate && inputDate.value ? new Date(inputDate.value).getFullYear() : new Date().getFullYear();
  }

  _getHeaderMap() {
    const map = {};
    const ths = this.table.querySelectorAll('tr:first-child td, tr:first-child th');
    ths.forEach((th, index) => {
      map[th.innerText.trim()] = index;
    });
    return map;
  }

  parse() {
    const events = [];
    const rows = Array.from(this.table.querySelectorAll('tr')).slice(1); // ヘッダー除去

    rows.forEach(row => {
      const rowData = this._parseRow(row);
      if (rowData) events.push(rowData);
    });
    return events;
  }

  _parseRow(row) {
    const cells = row.querySelectorAll('td');
    if (cells.length === 0) return null;

    const dateIdx = this.headers['日付'];
    const timeIdx = this.headers['時間'];
    const titleIdx = this.headers['予定'];
    const placeIdx = this.headers['場所'];
    const contentIdx = this.headers['内容'];

    if (dateIdx === undefined || timeIdx === undefined || titleIdx === undefined) return null;

    const dateText = cells[dateIdx].innerText.trim();
    const timeText = cells[timeIdx].innerText.trim();
    const rawTitle = cells[titleIdx].innerText.trim();
    const placeText = cells[placeIdx].innerText.trim();
    const contentText = cells[contentIdx].innerText.trim();

    //日時の無いものは除去
    if (!dateText || !timeText) return null;

    //面談の予定は除去
    if (contentText.startsWith('面談：')) return null;

    // 時間のパース (HH:mm-HH:mm)
    const startTimeStr = timeText.substring(0, 5);
    const endTimeStr = timeText.substring(6, 11);

    const startTime = this._createDate(dateText, startTimeStr);
    const endTime = this._createDate(dateText, endTimeStr);

    if (startTime > endTime) {
      endTime.setDate(endTime.getDate() + 1); // 日またぎ対応
    }

    // タイトルの整形と色ID決定
    const cleanTitle = rawTitle.replace('🗹', '');
    let title = cleanTitle;

    if (cleanTitle.includes('指導')) title = contentText;
    else if (cleanTitle.includes('現生徒面談：')) title = `現生徒面談：${contentText}`;

    //const colorId = this.COLOR_MAP[rawTitle] || 4; // デフォルト4
    // Google Calendarの色ID定義
    let colorId = 4;

    if (NMEX_Utils.multiIncludes(cleanTitle, ['会議・研修'])) colorId = 1;
    else if (NMEX_Utils.multiIncludes(cleanTitle, ['会議・研修', 'ＦＤ担当'])) colorId = 2;
    else if (NMEX_Utils.multiIncludes(cleanTitle, ['講師面接'])) colorId = 3;
    else if (NMEX_Utils.multiIncludes(cleanTitle, ['その他', '営業活動'])) colorId = 4;
    else if (NMEX_Utils.multiIncludes(cleanTitle, ['移動'])) colorId = 5;
    else if (NMEX_Utils.multiIncludes(cleanTitle, ['指導'])) colorId = 6;
    else if (NMEX_Utils.multiIncludes(cleanTitle, ['契約・営業'])) colorId = 7;
    else if (NMEX_Utils.multiIncludes(cleanTitle, ['休み'])) colorId = 8;
    else if (NMEX_Utils.multiIncludes(cleanTitle, ['現生徒面談'])) colorId = 10;
    else if (NMEX_Utils.multiIncludes(cleanTitle, ['訪問'])) colorId = 11;

    return {
      title,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      colorId,
      description: '',
      location: placeText
    };
  }

  _createDate(dateStr, timeStr) {
    const formattedDate = dateStr.replace(/\//g, '-');
    const dateTimeStr = `${this.baseYear}/${formattedDate} ${timeStr}:00`;
    const date = new Date(dateTimeStr);
    return isNaN(date.getTime()) ? new Date() : date;
  }
}
