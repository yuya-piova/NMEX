// pages/PageFuncSchedule.js
import ScheduleParser from '../parsers/ScheduleParser.js';
import CalendarSync from '../core/CalendarSync.js';
//import PopMenu from '../core/PopMenu.js';

export default class PageFuncSchedule {
  constructor() {
    this.path = location.pathname;
  }

  setGCalRegister() {
    // 既存のPopMenuインスタンスを取得、なければ新規作成
    // ※id: 'main' は既存コードのルールに合わせてください
    const popmenu = new PopMenu({
      id: 'tool-set',
      keyCode: 113,
      showFloatingButton: true
    });

    // 「Googleカレンダー同期」ボタンを追加
    popmenu.append('Googleカレンダー同期', {
      handler: async () => {
        await this.handleSync();
      }
    });
  }

  async handleSync() {
    const table = document.querySelector('table');
    const inputDt1 = document.getElementById('input1_dt');
    const inputDt2 = document.getElementById('input2_dt');

    if (!table || !inputDt1 || !inputDt2) {
      alert('スケジュールテーブルが見つかりません');
      return;
    }

    // UI: 進捗表示用エリアを作成
    let msgDiv = document.getElementById('sync-status-msg');
    if (!msgDiv) {
      msgDiv = document.createElement('div');
      msgDiv.id = 'sync-status-msg';
      msgDiv.style.cssText =
        'padding: 10px; margin-bottom: 10px; background: #fff3cd; position: fixed; top: 0; left: 0; width: 100%; z-index: 9999; text-align: center;';
      document.body.appendChild(msgDiv);
    }

    try {
      msgDiv.innerText = 'データ解析中...';

      // 1. パース
      const parser = new ScheduleParser(table);
      const events = parser.parse();

      if (events.length === 0) {
        msgDiv.innerText = '同期対象のデータがありませんでした';
        setTimeout(() => msgDiv.remove(), 3000);
        return;
      }

      // 2. 同期
      const syncer = new CalendarSync();
      const startDate = new Date(inputDt1.value);
      const endDate = new Date(inputDt2.value);

      await syncer.sync(startDate, endDate, events, (current, total) => {
        msgDiv.innerText = `Googleカレンダー同期中... (${current}/${total} セット)`;
      });

      msgDiv.style.background = '#d4edda';
      msgDiv.innerText = `完了: ${events.length} 件の予定を同期しました`;
    } catch (e) {
      console.error(e);
      msgDiv.style.background = '#f8d7da';
      msgDiv.innerText = `エラーが発生しました: ${e.message}`;
    }

    // 5秒後にメッセージを消す
    setTimeout(() => {
      if (msgDiv) msgDiv.remove();
    }, 5000);
  }
}
