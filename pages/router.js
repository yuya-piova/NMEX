import PageFuncAll from './PageFuncAll.js';
import PageFuncS from './PageFuncS.js';
import PageFuncT from './PageFuncT.js';
import PageFuncSchedule from './PageFuncSchedule.js';
import PageFuncTenpoYotei from './PageFuncTenpoYotei.js';
import PageFuncToiawases from './PageFuncToiawases.js';
import PopMenu from '../core/PopMenu.js';
import MemberLinker from '../core/features/MemberLinker.js';
import { myprofile } from '../core/store.js';

$(function() {
  console.log('PageFunction.js');
  /* ---------------------------------------------------*/
  /* 常に働く機能
  /* ---------------------------------------------------*/

  // ドメインチェック
  if (location.hostname != 'menu.edu-netz.com' && location.hostname != 'menu2.edu-netz.com') return;

  /* ---------------------------------------------------*/
  /* スペシャルモードで働く機能
  /* ---------------------------------------------------*/

  // スペシャルモードチェック
  if (myprofile.get('isSpecialEnabled', 0) != 1) {
    console.log('Special mode disabled');
    return;
  }

  const pageFuncAll = new PageFuncAll();
  const pageFuncS = new PageFuncS();
  const pageFuncSchedule = new PageFuncSchedule();
  const pageFuncToiawases = new PageFuncToiawases();
  const pageFuncT = new PageFuncT();

  // エリアモード
  pageFuncAll.applyAreaMode();
  // DatePicker
  pageFuncAll.setDatePicker();
  // ダブルクリックでテーブルメニューを開く
  pageFuncAll.setDblcopyTable();
  // 教室の生徒講師情報保存
  pageFuncAll.infoSave();
  // radio or checkboxのクリック範囲を拡大
  pageFuncAll.checkboxClickHelper();
  // 教室名右クリックでプロファイルに設定した教室にする
  pageFuncAll.tenpoClicker();

  // popmenu
  const popmenu = new PopMenu({
    id: 'main',
    keyCode: 113,
    showFloatingButton: true
  });
  window.addEventListener('keydown', async e => {
    if (e.keyCode === popmenu.keyCode) {
      // 1. 前回の動的ボタンをクリア
      popmenu.clearDynamic();

      // 2. 選択テキストを取得
      const selectedText = window
        .getSelection()
        .toString()
        .trim();

      if (selectedText !== '') {
        // 3. StudentInfoを使って検索 (core/StudentInfo.js を使用)
        // 事前に初期化済みの studentInfoManager インスタンスがあると想定
        const students = new studentInfoClass().search(['生徒名', selectedText]); //studentInfoManager.search(selectedText);

        if (students) {
          //.length > 0
          //const student = students[0]; // 最初の候補
          const student_cd = students['生徒NO'];
          const student_name = students['生徒名'];

          // 4. 動的ボタンとして追加 (レイヤー色を 'page' = 紫に設定)
          popmenu.appendDynamic(`連絡事項 (${student_name})`, {
            type: 'page',
            handler: () => {
              window.open(`${NX.CONST.host}/s/student_renraku_list.aspx?student_cd=${student_cd}`);
            }
          });
        }
      }

      // 5. メニューを表示
      const pos = typeof getMousePosition === 'function' ? getMousePosition() : { x: e.pageX, y: e.pageY };
      popmenu.show(pos.x, pos.y);
    }
  });

  // memberLinker
  const memberLinker = new MemberLinker();
  memberLinker.init();

  // 全ページ共通のPopMenu
  pageFuncAll.setPopMenu();

  switch (location.pathname) {
    /* ---------------------------------------------------*/
    /* PageFuncTehai
    /* ---------------------------------------------------*/

    case '/netz/netz1/tehai/kanren_input_save.aspx':
      // 関連登録画面開いたら即送信
      $('form[name=form1]')['0'].submit();
      break;

    /* ---------------------------------------------------*/
    /* PageFuncS
    /* ---------------------------------------------------*/

    case '/netz/netz1/s/teian_list_head.aspx':
      // 自動で自教室を開く
      $('select[name=tenpo_cd]').val('m');
      $('input[name=b_reload]').trigger('click');

      // 最後に開いた季節を保存
      myprofile.set({ nendo_season_cb: $('select[name=nendo_season_cb]').val() });

      // 一括設定
      $('#tanto_cd').swipe('自分担当', () => {
        $('#tanto_cd').val(myprofile.get('mynumber', '000231'));
        $('select[name=tanto_cb]').val(2);
        $('[name=sort_cb]').val([2]);
        $('[name=kaiyaku_flg],[name=gen_course_flg],[name=mikomi_flg],[name=kakutei_flg]').prop('checked', true);
        $('[name=course_ng]').val('2026/04');
      });

      $('input[name=b_reload]').setshortcutkey('Enter');
      break;
    case '/netz/netz1/s/student_mendan_input.aspx': {
      //履歴チェックは外す
      $('#edt_cb').prop('checked', false);

      //曜日を表示
      $('input[name=mendan_dt]').setweekday();

      //pickerをセット
      $('#mendan_tm').netztimepicker(false);

      //自動処理があれば先に完了させる
      const { mode, teacher_cd, mendan_jk, mendan_status_cb, bikou_nm, mendan_dt, mendan_tm } = getparameter();
      if (mode == 'autoChange') {
        //teacher_cdを持っていれば面談担当者を変更する
        if ($NX(teacher_cd).isHexaNumber()) $('[name=tanto_cd]').val(teacher_cd);
        if ([50, 70, 100].indexOf(mendan_jk)) $('select[name=mendan_jk]').val(mendan_jk);
        if (['0', '1', '9', 'd', 'h'].indexOf(mendan_status_cb)) $('select[name=mendan_status_cb]').val(mendan_status_cb);
        if (bikou_nm && bikou_nm != '') $('[name=bikou_nm').val(bikou_nm);
        if (mendan_dt) $('input[name=mendan_dt]').val(mendan_dt);
        if (mendan_tm) $('input[name=mendan_tm]').val(mendan_tm);
        if (mendan_dt && mendan_tm) $('input[name=mendan_nd]').prop('checked', false);
        $('[name=b_submit]').trigger('click');
      }

      //zoom会議室作成をする
      pageFuncS.setZoomMaker();
      break;
    }
    case '/netz/netz1/s/student_mailsend_input.aspx':
      //パラメータCH
      pageFuncS.mailSendChParam();
      break;

    /* ---------------------------------------------------*/
    /* PageFuncT
    /* ---------------------------------------------------*/

    case '/netz/netz1/t/teacher_toroku_list_head.aspx':
      $('select[name=area_cd]').on('contextmenu', function() {
        $(this).val(['g']);
        return false;
      });
      break;
    case '/netz/netz1/t/teacher_toroku_input.aspx':
      //zoomメール作成（要URL作成＆特記事項に入力）
      pageFuncT.makeZoomMail();
      //電話番号や名前、メアドの整形セット
      pageFuncT.detailPrettier();
      //右クリックで広島に
      $('select[name=area_cd]').on('contextmenu', function() {
        $(this).val(['g']);
        return false;
      });
      break;

    /* ---------------------------------------------------*/
    /* PageFuncSchedule
    /* ---------------------------------------------------*/

    case '/netz/netz1/schedule/yotei_list.aspx':
      // 予定をGoogleCalendarに登録
      pageFuncSchedule.setGCalRegister();
      break;

    case '/netz/netz1/schedule/shain_yotei.aspx':
      // // ショートカットキーセット
      $('input[name=b_submit]').setshortcutkey('Enter');

      // 社員予定表にswipe仕込む
      $('input[name=b_today]').swipe('今日～翌月', () => {
        $('input[name="input_f_dt"]').val(NX.DT.today.slash);
        $('input[name="input_t_dt"]').val(dateslash(window.dtnextmonth));
        $('input[name=b_submit]').trigger('click');
      });

      // tdに日付を仕込む
      $('a:contains("◆予定追加")').each(function() {
        $(this)
          .closest('td')
          .attr(
            'data-date',
            $(this)
              .attr('href')
              .getStrBetween("'", "'")
          );
      });
      break;

    case '/netz/netz1/schedule/yotei.aspx':
      // ショートカットキーセット
      $('input[name=b_submit][value="表示更新"]').setshortcutkey('Enter');
      $('input[name=b_yesterday]').setshortcutkey('ArrowLeft');
      $('input[name=b_tommorow]').setshortcutkey('ArrowRight');

      // エリア予定表に本日のswipeを仕込む
      $('button[class="ui-datepicker-trigger"]').swipe('本日', () => {
        $('form[name=form1]')['0'].action = 'yotei.aspx';
        $('form[name=form1]')['0'].input_dt.value = NX.DT.today.slash;
        $('form[name=form1]')['0'].submit();
      });

      // 読み込み後、デフォルトを開く（リンクが存在しない（＝未読込）＆会場ではない）
      if (
        $('a').length == 0 &&
        $('select[name=tenpo_cd] option:selected')
          .text()
          .match(/(会場|×)/) == null
      ) {
        $('input[value="表示更新"]').trigger('click');
      }
      break;

    case '/netz/netz1/schedule/yotei_input2_save.aspx':
      // 保存完了画面を即閉じる
      $('[name=b_close]').trigger('click');
      break;

    case '/netz/netz1/schedule/yotei2.aspx':
      $('[name=b_submit]').swipe('通常予定画面', () => {
        window.location.href = `${NX.CONST.host}/schedule/yotei.aspx`;
      });

    /* ---------------------------------------------------*/
    /* PageFunc Directs
    /* ---------------------------------------------------*/

    case '/netz/netz1/tenpo_yotei.aspx':
      popmenu.appendItems([{ text: 'テンプレート', handler: () => new PageFuncTenpoYotei().init() }]);
      break;

    case '/netz/netz1/toiawase_input.aspx': {
      //Page Const
      const student_cd = $('input[name=student_cd]').val();
      const toi_id = $('input[name=toi_id]').val();

      //名前のスペースと電話番号整形
      pageFuncToiawases.detailPrettier();

      //生年月日を和暦入力
      $('#birthday_dt')
        .attr('autocomplete', 'off')
        .on('contextmenu', function() {
          $(this).val(
            new ExDate()
              .setbyWareki(prompt('和暦を漢字で ex.令和、平成、昭和、大正、明治'), prompt('年'), prompt('月') - 1, prompt('日'))
              .as('yyyy/mm/dd')
          );
          return false;
        });

      $('.shain_cd').each(function() {
        $(this).emppicker();
      });

      //PopMenu
      popmenu.appendItems([
        { text: '連絡事項', handler: () => window.open(`${NX.CONST.host}/s/student_renraku_list.aspx?student_cd=${student_cd}`, '_blank') },
        { text: '指導予定', handler: () => window.open(`${NX.CONST.host}/kanren/student_shido_yotei.aspx?student_cd=${student_cd}`, '_blank') },
        {
          text: '新規用プロファイル',
          handler: () => window.open(`${NX.CONST.host}/s/student_profile_nyukai_input.aspx?student_cd=${student_cd}&toi_id=${toi_id}`, '_blank')
        }
      ]);
      break;
    }
    case '/netz/netz1/toiawase_input_save.aspx':
      $('input[name=b_close]').trigger('click');
      break;
    case '/netz/netz1/toiawase_list_head.aspx':
      $('input[value="今日"][onclick^=dataset2]').swipe('本日以降', () => {
        $('input[name=input_dt11]').val(dateslash(window.dt));
        $('input[name=input_dt12]').val('');
      });
      break;
  }
});
