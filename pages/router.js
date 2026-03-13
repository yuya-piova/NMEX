import PageFuncAll from './PageFuncAll.js';
import PageFuncTehai from './PageFuncTehai.js';
import PageFuncS from './PageFuncS.js';
import PageFuncT from './PageFuncT.js';
import PageFuncSchedule from './PageFuncSchedule.js';
import PageFuncKanren from './PageFuncKanren.js';
import PageFuncTodo from './PageFuncTodo.js';
import PageFuncTenpoYotei from './PageFuncTenpoYotei.js';
import PageFuncToiawases from './PageFuncToiawases.js';
import PopMenu from '../core/PopMenu.js';
import MemberLinker from '../core/features/MemberLinker.js';
import { myprofile } from '../core/store.js';
import Tabler from '../core/Tabler.js';
import { NX_Utils } from '../core/utils.js';
import EmployMan from '../core/components/EmployMan.js';

// ---------------------------------------------------------
// Global変数作成
// ---------------------------------------------------------
$.fn.tabler = function(headnum = 0) {
  return this.each(function() {
    // 既にインスタンス化されていればスキップ、もしくは取得する設計にもできます
    if (!$(this).data('tabler')) {
      const instance = new Tabler(this, headnum);
      $(this).data('tabler', instance);
    }
  });
};
$.fn.emppicker = function(options = {}) {
  // ブラウザのオートコンプリートをオフにする
  this.attr('autocomplete', 'off');

  this.on('contextmenu', function(e) {
    e.preventDefault(); // デフォルトの右クリックメニューを無効化

    const $this = $(this);
    const offset = $this.offset();
    offset.top += $this.outerHeight(); // 要素の真下に表示する

    new EmployMan(this, offset, options.multiple).show();
  });

  return this;
};

$(function() {
  /* ---------------------------------------------------*/
  /* 常に働く機能
  /* ---------------------------------------------------*/

  // ドメインチェック
  if (location.hostname != 'menu.edu-netz.com' && location.hostname != 'menu2.edu-netz.com') return;

  console.log('PageFunction.js for edu-netz');

  /* ---------------------------------------------------*/
  /* スペシャルモードで働く機能
  /* ---------------------------------------------------*/

  // スペシャルモードチェック
  if (myprofile.get('isSpecialEnabled', 0) != 1) {
    console.log('Special mode disabled');
    return;
  }

  const pageFuncAll = new PageFuncAll();
  const pageFuncTehai = new PageFuncTehai();
  const pageFuncS = new PageFuncS();
  const pageFuncSchedule = new PageFuncSchedule();
  const pageFuncKanren = new PageFuncKanren();
  const pageFuncTodo = new PageFuncTodo();
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
  // EmpPickerをセット
  pageFuncAll.setEmpPicker();

  // popmenu
  const popmenu = new PopMenu({
    id: 'main',
    keyCode: 113,
    showFloatingButton: true
  });

  // 生徒名を選択している場合にPopmenuに反映
  pageFuncAll.popmenuStudentResolver();

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

    case '/netz/netz1/tehai/tehai_input.aspx':
      // 自動入力
      pageFuncTehai.setTehaiAutomation();

      // 手配期間修正（整形＆エラー回避）＆回数空欄の場合は時間と期間を削除
      pageFuncTehai.setTehaiRange();

      break;
    case '/netz/netz1/tehai/tehai_kanren_list.aspx':
      popmenu.append('終了ボタンを表示', {
        handler: () => {
          $('input[value="修正"]').each(function() {
            const $btn = $(this);
            const editID = $btn.attr('onclick').getStrBetween("'", "'");
            $('<button>', {
              type: 'button',
              text: '終了',
              on: { click: () => NX_Utils.openTabBack(`${NX.CONST.host}/tehai/kanren_input.aspx?kanren_cd=${editID}&mode=close`) }
            }).insertAfter($btn);
          });
        }
      });
      break;
    case '/netz/netz1/tehai/kanren_input.aspx':
      // 自動終了
      const { mode } = NX_Utils.getPageParams();
      if (mode == 'close') {
        const delBtn = $('[name=b_del]');
        if (delBtn.attr('disabled') == 'false') {
          delBtn.trigger('click');
        } else {
          $('input[name=status_cb]').val(1);
          $('input[onclick="　登録　"]').trigger('click');
        }
      }
      break;

    case '/netz/netz1/tehai/shido_edit_list.aspx':
      // ブース組システムによる文字列修正
      pageFuncTehai.setShidoEditPrettify();

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
      // 履歴チェックは外す
      $('#edt_cb').prop('checked', false);

      // 曜日を表示
      $('input[name=mendan_dt]').setweekday();

      // pickerをセット
      $('#mendan_tm').netztimepicker(false);

      // 自動処理があれば先に完了させる
      const { mode, teacher_cd, mendan_jk, mendan_status_cb, bikou_nm, mendan_dt, mendan_tm } = getparameter();
      if (mode == 'autoChange') {
        // teacher_cdを持っていれば面談担当者を変更する
        if ($NX(teacher_cd).isHexaNumber()) $('[name=tanto_cd]').val(teacher_cd);
        if ([50, 70, 100].indexOf(mendan_jk)) $('select[name=mendan_jk]').val(mendan_jk);
        if (['0', '1', '9', 'd', 'h'].indexOf(mendan_status_cb)) $('select[name=mendan_status_cb]').val(mendan_status_cb);
        if (bikou_nm && bikou_nm != '') $('[name=bikou_nm').val(bikou_nm);
        if (mendan_dt) $('input[name=mendan_dt]').val(mendan_dt);
        if (mendan_tm) $('input[name=mendan_tm]').val(mendan_tm);
        if (mendan_dt && mendan_tm) $('input[name=mendan_nd]').prop('checked', false);
        $('[name=b_submit]').trigger('click');
      }

      // zoom会議室作成をする
      pageFuncS.setZoomMaker();
      break;
    }
    case '/netz/netz1/s/student_mailsend_input.aspx':
      // パラメータCH
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
      // zoomメール作成（要URL作成＆特記事項に入力）
      pageFuncT.makeZoomMail();
      // 電話番号や名前、メアドの整形セット
      pageFuncT.detailPrettier();
      // 右クリックで広島に
      $('select[name=area_cd]').on('contextmenu', function() {
        $(this).val(['g']);
        return false;
      });
      break;
    case '/netz/netz1/t/health_check_input.aspx':
      // 自動で健康チェック
      $('#netsu0,#nodo0,#seki0,#zutsu0,#okan0,#hakike0').prop('checked', true);
      $('#cb_w').prop('checked', true);
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
      break;
    case '/netz/netz1/schedule/yotei_input.aspx':
      // 予定の右クリック→チェックを付けて登録
      // 場所の右クリック→空欄ならデフォルト教室入力、空欄でないなら登録ボタンを押す
      pageFuncSchedule.scheduleResisterSupport();

      // 予定表のテンプレート機能
      pageFuncSchedule.scheduleResisterTemplate();

      // 半角修正
      $('input[name=s_tm],input[name=e_tm]').isAllNumeric(false);
      break;

    /* ---------------------------------------------------*/
    /* PageFuncKanren
    /* ---------------------------------------------------*/

    case '/netz/netz1/kanren/shido_leader_input.aspx':
      // リーダー講師設定
      pageFuncKanren.setLeaderTeacher();
      break;

    case '/netz/netz1/kanren/booth_list_print.aspx':
      // A4タテで印刷
      $('body').before('<style>@page {size: 210mm 297mm;}</style>');

      // 指導予定整形
      pageFuncKanren.prettierLectureList();
      break;

    case '/netz/netz1/kanren/booth_list.aspx':
      // 報告済チェックボタンの右クリックかスワイプで、すべてCHし登録
      pageFuncKanren.lectureAllCheck();

      // Diverse登録画面を開いてデータを送る
      pageFuncKanren.sendingDiverse();

      break;

    case '/netz/netz1/kanren/student_shido_kiroku_list.aspx':
    case '/netz/netz1/kanren/teacher_shido_kiroku_list.aspx':
      // 指導報告一覧に講師コメントを表示
      popmenu.appendItems([
        {
          text: '講師コメント一覧',
          handler: () => {
            $('tr').each(async function(e) {
              const shido_id = ($(this).attr('id') || '').replace('td', '');
              const done = $(this).find('input').length > 0;
              let text = e != 0 && !done ? '' : '講師コメント';
              if (e != 0 && shido_id != '' && done) {
                const ajx = await $.get(`${NX.CONST.host}/kanren/shido_kiroku_input2.aspx?shido_id=${shido_id}`);
                text = ($(ajx).find('#comment,#etc') || $('<input></input>')).val();
              }
              $(this).append(`<td width="500">${text}</td>`);
            });
          }
        }
      ]);
      break;

    /* ---------------------------------------------------*/
    /* PageFuncTodo
    /* ---------------------------------------------------*/

    case '/netz/netz1/todo/todo_input.aspx':
      // パラメーターで自動処理
      pageFuncTodo.inputAutomation();

      // チェック右クリックで自動計算
      pageFuncTodo.inputCalcRate();

      // Popmenu （完了、講師一覧取得）
      pageFuncTodo.inputSetPopmenu();

      // 社員ピッカーセット
      $(document).on('contextmenu', '#cd_select', function() {
        $(this).emppicker();
      });
      // テンプレートセット
      $('input[name=base_id]').netzpicker([['終了調整', 80323]]);
      // 初期設定

      if (['', '00:00'].includes($('#kigen_dt').val())) $('#kigen_dt').val('21:00');
      $('#start_dt,#end_dt,#kigen_dt').offAutocomplete();

      break;

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
    case '/netz/netz1/tenpo_input.aspx':
      //autoOpenだったら開店をクリック（ダッシュボードから開く場合）
      if (NX_Utils.getPageParams('mode') == 'autoOpen') $('input[value="開店報告をする"]').trigger('click');
      break;
  }
});

/* ---------------------------------------------------*/
/* Diverse LMS
/* ---------------------------------------------------*/

$(function() {
  // ドメインチェック
  if (location.hostname != 'lms2.s-diverse.com') return;

  console.log('PageFunction.js for s-diverse');

  const popmenu = new PopMenu({
    id: 'main',
    keyCode: 113,
    showFloatingButton: true
  });

  window.addEventListener('message', function(event) {
    // 送信元を確認
    if (event.origin === 'https://menu.edu-netz.com' || event.origin === 'https://menu2.edu-netz.com') {
      popmenu.staticItems = [];
      popmenu.appendItems([
        {
          text: 'ブース表から出欠登録',
          handler: () => {
            event.data.forEach(student => {
              $(`tr:contains("${student.replace('　', ' ')}")`)
                .find('.chakra-checkbox')
                .trigger('click');
            });
          }
        }
      ]);

      console.log('popmenu', popmenu);
    }
  });

  // 組織を変更するリンクボタンを作成
  const groupTransitionMenus = [
    ['🔗 広島', 'A002007'],
    ['🔗 体験教室', 'A002999']
  ].map(([text, groupid]) => ({ text, handler: () => (window.location.href = `https://lms2.s-diverse.com/coach/${groupid}/students-status`) }));

  popmenu.appendItems(groupTransitionMenus);
});
