// core/CalendarSync.js

export default class CalendarSync {
  constructor(config = {}) {
    // グローバル変数 myprofiles から設定を取得
    this.scriptUrl = NX.ENDPOINT.makeGCal;
    //config.scriptUrl || (typeof myprofiles !== 'undefined' ? myprofiles.getone({ calendar_url: null }) : '');
    this.calendarId = config.calendarId || (typeof myprofiles !== 'undefined' ? myprofiles.getone({ calendar_id: false }) : '');
    this.batchSize = 30; // 分割サイズ
  }

  async sync(startDate, endDate, events, onProgress = null) {
    if (!this.scriptUrl) throw new Error('カレンダー同期用URLが設定されていません。');
    if (events.length === 0) return { status: 'empty' };

    const totalBatches = Math.ceil(events.length / this.batchSize);

    // 日付フォーマット (YYYY/MM/DD)
    const formatDate = d => `${d.getFullYear()}/${('0' + (d.getMonth() + 1)).slice(-2)}/${('0' + d.getDate()).slice(-2)}`;
    const rangeStart = formatDate(startDate);

    const endPlusOne = new Date(endDate);
    endPlusOne.setDate(endPlusOne.getDate() + 1);
    const rangeEnd = formatDate(endPlusOne);

    for (let i = 0; i < totalBatches; i++) {
      const chunk = events.slice(i * this.batchSize, (i + 1) * this.batchSize);
      const isFirst = i === 0;

      if (onProgress) onProgress(i + 1, totalBatches);

      const payload = {
        calendarId: this.calendarId,
        rangeStart: rangeStart,
        rangeEnd: rangeEnd,
        events: chunk,
        cleanup: isFirst // 最初のバッチのみ削除実行
      };

      await fetch(this.scriptUrl, {
        method: 'POST',
        redirect: 'follow',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });

      // 待機 (API制限対策)
      if (i < totalBatches - 1) {
        await new Promise(r => setTimeout(r, 1000));
      }
    }

    return { status: 'success', count: events.length };
  }
}
