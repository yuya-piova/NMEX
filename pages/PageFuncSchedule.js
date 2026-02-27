// pages/PageFuncSchedule.js
import ScheduleParser from '../parsers/ScheduleParser.js';
import CalendarSync from '../core/CalendarSync.js';
import PopMenu from '../core/PopMenu.js';

export default class PageFuncSchedule {
  constructor() {
    this.path = location.pathname;
  }

  setGCalRegister() {
    const popmenu = new PopMenu({ id: 'main' }); // 定義済みのmainを取得する

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
  scheduleResisterSupport() {
    const $basho_nm = $('input[name=basho_nm]');
    const $b_submit = $('input[name=b_submit]');

    // 予定の右クリック→チェックを付けて登録
    $('input[name=yotei_nm]').on('contextmenu', () => {
      $('#done_flg').prop('checked', true);
      $b_submit.trigger('click');
      return false;
    });

    // 場所の右クリック→空欄ならデフォルト教室入力、空欄でないなら登録ボタンを押す
    $basho_nm.on('contextmenu', () => {
      if ($basho_nm.val()) {
        $basho_nm.val();
      } else {
        $b_submit.trigger('click');
      }

      return false;
    });
  }
  scheduleResisterTemplate() {
    const popmenu = new PopMenu({ id: 'main' });

    // 1. UIの構築 (ユーティリティクラスとコンポーネントクラスを活用)
    const $templateDiv = $('<div>', {
      class: 'flux-card flux-flex flux-flex-col flux-gap-2 flux-p-3'
    }).css({
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: 9999,
      display: 'none'
    });

    // ヘッダー部分
    const $header = $('<div>', {
      class: 'flux-flex flux-items-center flux-justify-between flux-mb-2',
      css: { borderBottom: '1px solid var(--flux-border)', paddingBottom: '8px' }
    });

    const $title = $('<strong>', { class: 'flux-text-base flux-text-main' }).text('予定テンプレート');
    const $closeBtn = $('<button>', { class: 'flux-btn-close' }).html('&#10005;');
    $header.append($title, $closeBtn);

    // コントロール部分
    const $controls = $('<div>', { class: 'flux-flex flux-items-center flux-gap-2' });
    const $select = $('<select>', { class: 'flux-input', css: { width: '160px' } });
    const $addBtn = $('<button>', { class: 'flux-btn flux-btn-primary' }).text('追加');
    const $deleteBtn = $('<button>', { class: 'flux-btn flux-btn-danger' }).text('削除');

    $controls.append($select, $addBtn, $deleteBtn);
    $templateDiv.append($header, $controls).appendTo('body');

    // 2. セレクトボックスを最新のLocalStorageから再描画する関数
    const renderSelect = () => {
      $select.empty().append('<option value="" selected>ーーー</option>');
      const templates = JSON.parse(localStorage.getItem('yoteiTemplate')) || [];
      templates.forEach((elm, ind) => {
        $select.append(`<option value="${ind}">${elm.name || elm.yotei_nm || '名称未設定'}</option>`);
      });
    };

    // 3. メニューからの呼び出し
    popmenu.appendItems([
      {
        text: 'テンプレートを表示',
        handler: () => {
          renderSelect();
          // flexレイアウトを維持したまま表示する
          $templateDiv.css('display', 'flex');
        }
      }
    ]);

    // 4. イベント処理: 閉じる
    $closeBtn.on('click', () => {
      $templateDiv.hide();
    });

    // 5. イベント処理: 選択してフォームに反映
    $select.on('change', function() {
      const index = $(this).val();
      if (index === '') return;

      const templates = JSON.parse(localStorage.getItem('yoteiTemplate')) || [];
      const template = templates[index] || {};

      for (const [key, val] of Object.entries(template)) {
        if (key === 'name') continue;
        $(`[name="${key}"]`)
          .val(val)
          .trigger('change');
      }
    });

    // 6. イベント処理: 現在の入力を追加
    $addBtn.on('click', () => {
      const template = {};
      const keys = ['s_tm', 'e_tm', 'yotei_cb', 'yotei_nm', 'basho_nm'];

      keys.forEach(key => {
        const val = $(`[name="${key}"]`).val();
        if (val !== '') template[key] = val;
      });

      if (Object.keys(template).length === 0) {
        alert('保存する項目が入力されていません。');
        return;
      }

      const defaultName = template.yotei_nm || '新しいテンプレート';
      const templateName = prompt('テンプレート名を入力してください', defaultName);
      if (!templateName) return;

      template.name = templateName;

      const templates = JSON.parse(localStorage.getItem('yoteiTemplate')) || [];
      templates.push(template);
      localStorage.setItem('yoteiTemplate', JSON.stringify(templates));

      renderSelect();
      $select.val(templates.length - 1);
    });

    // 7. イベント処理: 選択中のものを削除
    $deleteBtn.on('click', () => {
      const targetIndex = $select.val();
      if (targetIndex === '') return;

      if (!confirm('選択中のテンプレートを削除してもよろしいですか？')) return;

      const templates = JSON.parse(localStorage.getItem('yoteiTemplate')) || [];
      templates.splice(targetIndex, 1);
      localStorage.setItem('yoteiTemplate', JSON.stringify(templates));

      renderSelect();
    });
  }
}
