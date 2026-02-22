// pages/PageFuncT.js
import { NX_Utils } from '../core/utils.js';
import PopMenu from '../core/PopMenu.js';

export default class PageFuncT {
  constructor() {
    this.path = location.pathname;
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
  makeZoomMail() {
    const popmenu = new PopMenu({ id: 'main' }); // 定義済みのmainを取得する

    const mailList = ['面接組', 'zoom招待', '採用テスト'];
    const mailDIV = $('<div>', { style: 'position:absolute;left:600px;top:50px;' });
    const mailTEXTAREA = $('<textarea>', { rows: 40, cols: 80 }).appendTo(mailDIV);

    //クリップボードコピー処理
    function copyToClipboard() {
      const cliptext = [$('[name=mail_address]').val(), '【１対１ネッツ】アルバイト講師面接', mailTEXTAREA.val()].join('\n');
      navigator.clipboard.writeText(cliptext);
      mailDIV.hide();
    }

    //メール送信処理
    function sendMail() {
      //prettier-ignore
      const to = $('[name=mail_address]').val().trim();
      //prettier-ignore
      const name = $('[name=name_kg]').val().trim();

      if (!to || !name) {
        $('body').append('メールアドレスか名前が未入力です');
        return;
      }

      const postdata = {
        to,
        subject: '【１対１ネッツ】アルバイト講師面接',
        body: mailTEXTAREA.val(),
        options: {
          bcc: 'tatsuno@edu-netz.com',
          from: 'tatsuno@edu-netz.com',
          name: '【１対１ネッツ】辰野　由弥'
        }
      };
      $.post(NX.ENDPOINT.sendMail, postdata, function(data) {
        const { sent_to } = JSON.parse(JSON.stringify(data));
        $('body').append(`<p>Sent to ${sent_to}</p>`);
      });
      mailDIV.hide();
    }

    //メール用ボタン生成
    $('<button>', {
      type: 'button',
      class: 'nx',
      text: 'クリップボードにコピー',
      on: { click: copyToClipboard }
    }).appendTo(mailDIV);

    $('<button>', {
      type: 'button',
      class: 'nx offajax',
      text: 'メール送信',
      on: { click: sendMail }
    }).appendTo(mailDIV);

    //Zoomミーティング作成処理
    function createZoomMeeting() {
      const topic = `アルバイト講師面接【${$('[name=name_kg]').val()}】`;
      const startdt = `${$('[name=mensetsu_dt_y]').val()}-${$('[name=mensetsu_dt_m]').val()}-${$('[name=mensetsu_dt_d]').val()}T${$(
        '[name=mensetsu_dt_h]'
      ).val()}:${$('[name=mensetsu_dt_n]').val()}:00`;

      $.post(NX.ENDPOINT.zoomMaker, { topic, startdt, duration: 30 }, function(data) {
        const { join_url, id, password } = JSON.parse(JSON.stringify(data));
        const meetingID = `${String(id).slice(0, 3)} ${String(id).slice(3, 7)} ${String(id).slice(7, 11)}`;
        const message = ['Zoomミーティングに参加する', join_url, `ミーティングID: ${meetingID}`, `パスコード: ${password}`].join('\n');
        $('<textarea>', { rows: 10, cols: 80 })
          .appendTo('body')
          .val(message);
      });
    }

    // 📋 テンプレート作成
    function buildMailTemplate(type, param) {
      const T = LCT.TEMPLATE.Teacher;
      const templates = {
        zoom招待: [
          `${param.name}様`,
          '',
          'お世話になります。',
          'ネッツ広島エリア講師面接担当の辰野です。',
          '',
          `${param.zoom_time}から面接を担当させていただきます。よろしくおねがいします。`,
          '時間は３０分程度を予定していますが、その後１時間程度高校入試レベルのテストを受けていただきます。',
          '',
          LCT.TEMPLATE.Mail.howtoZoom,
          '',
          '以下のURLおよびIDとパスワードからzoom会議室にログインください。',
          param.zoom_url,
          '',
          T.mysign
        ],
        採用テスト: [
          `${param.name}様`,
          '',
          '本日は面接を受けて頂きありがとうございました。',
          'これから採用テストを受けていただきます。',
          T.testurl,
          '',
          T.mysign
        ],
        面接組: [
          `${param.name}様`,
          '',
          'お世話になります。',
          'ネッツ広島エリア講師面接担当の辰野です。',
          '',
          T.thankyoudetail,
          '',
          'よろしくおねがいします。',
          '',
          T.mysign
        ]
      };

      return templates[type].join('\n');
    }
    function showMailBody(type) {
      const param = {
        name: $('[name=name_kg]').val(),
        mail_address: $('[name=mail_address]').val(),
        zoom_time: $NX(
          `${$('[name=mensetsu_dt_m]').val()}/${$('[name=mensetsu_dt_d]').val()} ${$('[name=mensetsu_dt_h]').val()}:${$(
            '[name=mensetsu_dt_n]'
          ).val()}`
        ).toFullWidth(),
        zoom_url: $('[name=bikou2_nm]').val()
      };
      const mailBody = buildMailTemplate(type, param);
      mailTEXTAREA.val(mailBody);
      mailDIV.show().appendTo('body');
      popmenut_F8.closemenu();
    }

    const popButtons = [{ text: '会議室作成', handler: () => createZoomMeeting() }];
    mailList.forEach(type => {
      popButtons.push({ text: type, handler: () => showMailBody(type) });
    });
    popmenu.appendItems(popButtons);
  }
}
