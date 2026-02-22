// pages/PageFuncT.js
import { NX_Utils, sendMailAsync, createZoomMeetingAsync } from '../core/utils.js';
import PopMenu from '../core/PopMenu.js';
import ConsoleBot from '../core/components/ConsoleBot.js';

export default class PageFuncT {
  constructor() {
    this.path = location.pathname;
    this.bot = new ConsoleBot();
  }
  detailPrettier() {
    $('input[name=toroku_tanto_nm]').netzpicker(['FromAナビ→', '塾講師ナビ→', 'おしごと発見→', '塾講師JAPAN→']);
    $('input[name=name_kt]').on('contextmenu', function() {
      $(this).valFunction(now => NX_Utils.toKatakana(now));
      return false;
    });
    $('input[name=tel_no]').on('contextmenu', function() {
      $(this).valFunction(now => NX_Utils.phoneformat(now));
      return false;
    });
    $('input[name=name_kg],input[name=name_kt]').on('contextmenu', function() {
      $(this).valReplace(' ', '　');
      return false;
    });
    $('input[name=name_kg],input[name=name_kt],input[name=tel_no],input[name=mail_address]').on('change', function() {
      $(this).valFunction(now => now.trim());
    });
  }
  /**
   * メニューの組み立て（エントリーポイント）
   */
  makeZoomMail() {
    const popmenu = new PopMenu({ id: 'main' });

    // ボタンの定義
    const popButtons = [{ text: '会議室作成', handler: () => this.handleCreateZoom() }];

    const mailList = ['面接組', 'zoom招待', '採用テスト'];
    mailList.forEach(type => {
      popButtons.push({ text: type, handler: () => this.handleShowMail(type) });
    });

    popmenu.appendItems(popButtons);
  }
  /**
   * ヘルパー: 画面からデータを抽出する
   */
  _extractData() {
    const name =
      $('[name=name_kg]')
        .val()
        .trim() || '';
    const mail =
      $('[name=mail_address]')
        .val()
        .trim() || '';
    const year = $('[name=mensetsu_dt_y]').val();
    const month = $('[name=mensetsu_dt_m]').val();
    const day = $('[name=mensetsu_dt_d]').val();
    const hours = $('[name=mensetsu_dt_h]').val();
    const minutes = $('[name=mensetsu_dt_n]').val();

    // 日付オブジェクトの生成
    let dateObj = null;
    if ([year, month, day, hours, minutes].every(val => val !== '')) {
      dateObj = new Date(year, parseInt(month) - 1, day, hours, minutes);
    }

    // Zoom時間文字列
    const zoom_time = $NX(`${month}/${day} ${hours}:${minutes}`).toFullWidth();
    const zoom_url = $('[name=bikou2_nm]').val();

    return { name, mail, dateObj, year, month, day, hours, minutes, zoom_time, zoom_url };
  }
  /**
   * ヘルパー: メールテンプレートの構築
   */
  _buildMailTemplate(type, param) {
    const T = LCT.TEMPLATE.Teacher;
    const templates = {
      zoom招待: [
        `${param.name}様\n`,
        'お世話になります。\nネッツ広島エリア講師面接担当の辰野です。\n',
        `${param.zoom_time}から面接を担当させていただきます。よろしくおねがいします。`,
        '時間は３０分程度を予定していますが、その後１時間程度高校入試レベルのテストを受けていただきます。\n',
        LCT.TEMPLATE.Mail.howtoZoom,
        '\n以下のURLおよびIDとパスワードからzoom会議室にログインください。',
        param.zoom_url,
        '\n' + T.mysign
      ],
      採用テスト: [
        `${param.name}様\n`,
        '本日は面接を受けて頂きありがとうございました。',
        'これから採用テストを受けていただきます。\n',
        T.testurl,
        '\n' + T.mysign
      ],
      面接組: [
        `${param.name}様\n`,
        'お世話になります。\nネッツ広島エリア講師面接担当の辰野です。\n',
        T.thankyoudetail,
        '\nよろしくおねがいします。\n',
        T.mysign
      ]
    };
    return templates[type] ? templates[type].join('\n') : '';
  }
  /**
   * アクション: Zoom会議室の作成
   */
  async handleCreateZoom() {
    const data = this._extractData();
    if (!data.dateObj) {
      this.bot.print('⚠️ エラー: 面接日時が正しく入力されていません。');
      return;
    }

    const topic = `アルバイト講師面接【${data.name}】`;
    const startdt = `${data.year}-${data.month}-${data.day}T${data.hours}:${data.minutes}:00`;

    const $msg = this.bot.print('⏳ Zoom会議室を作成中...');

    try {
      const result = await createZoomMeetingAsync({ topic, startdt, duration: 30 });

      // 1. 備考欄に貼る用（純粋なZoom情報のみ）
      const zoomInfoText = [
        'Zoomミーティングに参加する',
        result.join_url,
        `ミーティングID: ${result.formattedId}`,
        `パスコード: ${result.password}`
      ].join('\n');

      // 2. ConsoleBotに表示する用（ステータスメッセージ付き）
      const displayText = `✅ Zoom会議室を作成しました\n\n${zoomInfoText}`;

      // ConsoleBotの表示を更新
      $msg.text(displayText);

      // 3. ボタンの処理では zoomInfoText のみを使用する
      this.bot.addButton(
        '📋 コピーして備考欄に貼る',
        () => {
          // クリップボードと備考欄には純粋な情報だけをコピー
          navigator.clipboard.writeText(zoomInfoText);
          $('[name=bikou2_nm]').val(zoomInfoText);

          // 操作完了の軽いフィードバック（任意）
          const $btn = $msg.find('button');
          $btn.text('✅ 貼り付けました').css('background', '#28a745');
          setTimeout(() => $btn.text('📋 コピーして備考欄に貼る').css('background', '#007bff'), 2000);
        },
        $msg
      );
    } catch (error) {
      $msg.text(error.message);
    }
  }
  /**
   * アクション: メール本文の表示と送信
   */
  handleShowMail(type) {
    const data = this._extractData();
    const mailBody = this._buildMailTemplate(type, data);
    const subject = '【１対１ネッツ】アルバイト講師面接';

    // 1. コピー用の純粋なテキスト（宛先、件名、本文）
    const copyText = `${data.mail}\n${subject}\n\n${mailBody}`;

    // 2. 画面表示用のテキスト（ステータス付き）
    const displayText = `✅ 【${type}】のメールを作成しました\n\n${mailBody}`;

    // ConsoleBotに出力
    const $msg = this.bot.print(displayText);

    // 3. コピーボタン
    this.bot.addButton(
      '📋 クリップボードにコピー',
      () => {
        // 画面の文字ではなく copyText をクリップボードへ
        navigator.clipboard.writeText(copyText);

        // ボタン自身を「✅ コピーしました」に変更してフィードバック
        const $btn = $msg.find('button').eq(0); // 1つ目のボタン
        const originalText = $btn.text();
        $btn.text('✅ コピーしました').css('background', '#28a745');
        setTimeout(() => $btn.text(originalText).css('background', '#007bff'), 2000);
      },
      $msg
    );

    // 4. 送信ボタン
    this.bot.addButton(
      '✉️ この内容でメール送信',
      async () => {
        const $btn = $msg.find('button').eq(1); // 2つ目のボタン

        // 送信中はボタンを押せないようにし、色をグレーにする
        $btn
          .text('⏳ 送信中...')
          .prop('disabled', true)
          .css('background', '#6c757d');

        try {
          // mailBody (純粋な本文) を送信
          await sendMailAsync({
            to: data.mail,
            subject: subject,
            body: mailBody,
            options: {
              bcc: 'tatsuno@edu-netz.com',
              from: 'tatsuno@edu-netz.com',
              name: '【１対１ネッツ】辰野　由弥' // ※ myprofiles から取得する形にしてもOKです
            }
          });

          // 成功したら緑色にする（二重送信防止のため disabled はそのまま）
          $btn.text('✅ 送信完了').css('background', '#28a745');
        } catch (error) {
          // 失敗したら赤色にして、再度押せるようにする
          $btn
            .text('❌ 送信失敗')
            .css('background', '#dc3545')
            .prop('disabled', false);
          this.bot.print(`エラー: ${error.message}`); // エラーの詳細は新しい吹き出しで出す
        }
      },
      $msg
    );
  }
}
