// pages/PageFuncTenpoYotei.js
import { bindSync } from '../core/utils.js';

/**
 * 店舗予定入力ページ (tenpo_yotei.aspx) 用の機能クラス
 */
export default class PageFuncTenpoYotei {
  constructor() {
    this.weekdayList = ['日', '月', '火', '水', '木', '金', '土'];

    // プリセット設定 (講習・通常)
    this.presets = {
      講習: {
        日: { type: 'closed' }, // 休校
        月: { open: '10:40', close: '21:20' },
        火: { open: '10:40', close: '21:20' },
        水: { type: 'closed' },
        木: { open: '10:40', close: '21:20' },
        金: { open: '10:40', close: '21:20' },
        土: { open: '10:40', close: '21:20' }
      },
      通常: {
        日: { type: 'closed' },
        月: { open: '16:30', close: '22:00' },
        火: { open: '16:30', close: '22:00' },
        水: { type: 'closed' },
        木: { open: '16:30', close: '22:00' },
        金: { open: '16:30', close: '22:00' },
        土: { open: '10:40', close: '21:20' }
      }
    };
  }

  init() {
    // 開始日の取得
    const startDateVal = $('input[name=input_f_dt]').val();
    if (!startDateVal) return;

    this.startDate = new Date(startDateVal);

    // 1. メインテーブルの各行に曜日クラスを付与
    this._tagMainTableRows();

    // 2. テンプレートテーブルの生成と挿入
    this._createTemplateTable();

    // 3. プリセットボタンの追加
    this._addPresetButtons();
  }

  /**
   * メインテーブルの入力欄に曜日ごとの識別クラスを付与する
   */
  _tagMainTableRows() {
    // "開校担当" を含むテーブルの行を取得 (ヘッダー除く)
    const $rows = $('table:contains(開校担当) tr:gt(1)');

    $rows.each((index, tr) => {
      // 日付計算: 開始日 + index日後
      const currentDate = new Date(this.startDate);
      currentDate.setDate(currentDate.getDate() + index);

      const weekday = this.weekdayList[currentDate.getDay()]; // '月', '火'...

      // その行内のすべてのinput/selectに曜日クラス(wd-月 など)を付与
      // ※既存コードの class="月" はCSS競合のリスクがあるため prefix 推奨ですが、
      //   今回はロジック優先で独自クラスとして扱います
      $(tr)
        .find('input, select')
        .addClass(`wd-${weekday}`);
    });
  }

  /**
   * 曜日別テンプレートテーブルを作成する
   */
  _createTemplateTable() {
    // ベースとなるテーブル枠組み
    const $templateTable = $(`
      <div id="template-area" style="margin: 20px 0; border: 2px solid #aaa; padding: 10px; background: #f9f9f9;">
        <strong>▼曜日別一括入力テンプレート</strong>
        <table class="small" border="1" cellpadding="1" cellspacing="1" style="border-collapse: collapse; background: white; margin-top:5px;">
          <tr style="background-color:#dfdfff">
            <td>曜日</td><td>指導開始</td><td>状態</td><td>開校予定</td><td>開校担当(CD)</td>
            <td>CH</td><td>指導終了</td><td>閉校予定</td><td>閉校担当</td><td>休校</td><td>備考</td>
          </tr>
        </table>
      </div>
    `);

    const $tbody = $templateTable.find('table');

    // メインテーブルの「ひな形」として最終行を利用（列幅などを合わせるため）
    // ※2行目以降のデータ行であればどれでも良い
    const $sourceRow = $('table:contains(開校担当) tr:last');

    // 曜日ごとにテンプレート行を作成
    this.weekdayList.forEach(weekday => {
      const $tr = $sourceRow.clone();

      // 行の初期化
      $tr.removeAttr('id style onmouseover onmouseout');
      $tr.css('background-color', '#fff'); // 背景リセット

      // 1列目（日付セル）を曜日に書き換え
      $tr
        .find('td:first')
        .text(weekday)
        .css({
          'font-weight': 'bold',
          'text-align': 'center',
          'background-color': '#eee'
        });

      // 各入力欄の初期化とイベント設定
      $tr.find('input, select, span').each((i, elem) => {
        const $elem = $(elem);

        // ID, Name, Valueのクリア
        $elem.val('').removeAttr('id value');
        $elem.text(''); // spanの中身クリア

        // 元のname属性から末尾の日付部分(数字)を除去して純粋な項目名を取得
        // 例: open_tm20260217 -> open_tm
        const originalName = $elem.attr('name') || '';
        const baseName = originalName.replace(/[0-9]+$/, '');
        $elem.attr('name', `${baseName}_tpl_${weekday}`); // テンプレート用の一意な名前

        // テンプレート($elem) が変更されたら、
        // メインテーブル(.wd-{曜日} かつ nameがbaseNameで始まるもの) に同期する
        const targetSelector = `.wd-${weekday}[name^="${baseName}"]`;
        bindSync($elem, targetSelector);

        // チェックボックス対応
        if ($elem.is(':checkbox')) {
          $elem.prop('checked', false);
        }
      });

      $tbody.append($tr);
    });

    // 登録ボタンの前に挿入
    $('#b_submit')
      .closest('p')
      .before($templateTable);
    this.$templateTable = $templateTable; // 参照を保存
  }

  /**
   * プリセットボタンの追加
   */
  _addPresetButtons() {
    const $container = $('<div style="margin-bottom: 5px;"></div>');

    Object.keys(this.presets).forEach(key => {
      $('<input type="button">')
        .val(key) // "講習" や "通常"
        .css({ 'margin-right': '10px', padding: '5px 10px' })
        .on('click', () => this._applyPreset(key))
        .appendTo($container);
    });

    // テンプレートエリアの中にボタンを配置
    this.$templateTable.find('strong').after($container);
  }

  /**
   * プリセットをテンプレートに適用
   */
  _applyPreset(presetName) {
    const settings = this.presets[presetName];
    if (!settings) return;

    this.weekdayList.forEach(weekday => {
      const conf = settings[weekday];
      if (!conf) return;

      // その曜日のテンプレート行内の入力要素を取得
      // name属性は `項目名_tpl_曜日` となっている
      const getTplInput = baseName => $(`input[name="${baseName}_tpl_${weekday}"]`);

      if (conf.type === 'closed') {
        // 休校の場合
        getTplInput('kyuko_flg')
          .prop('checked', true)
          .trigger('change');
        // 時間などはクリア
        getTplInput('open_tm')
          .val('')
          .trigger('change');
        getTplInput('close_tm')
          .val('')
          .trigger('change');
      } else {
        // 開校の場合
        getTplInput('kyuko_flg')
          .prop('checked', false)
          .trigger('change');
        if (conf.open)
          getTplInput('open_tm')
            .val(conf.open)
            .trigger('change');
        if (conf.close)
          getTplInput('close_tm')
            .val(conf.close)
            .trigger('change');
      }
    });
  }
}
