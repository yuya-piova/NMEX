import PageFuncAll from './PageFuncAll.js';
import PageFuncSchedule from './PageFuncSchedule.js';

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
  if (typeof myprofiles === 'undefined' || myprofiles.getone({ isSpecialEnabled: 0 }) != 1) return;

  const pageFuncAll = new PageFuncAll();
  const pageFuncSchedule = new PageFuncSchedule();

  // エリアモード
  pageFuncAll.applyAreaMode();
  // DatePicker
  pageFuncAll.setDatePicker();
  // ダブルクリックでテーブルメニューを開く
  pageFuncAll.setDblcopyTable();

  switch (location.pathname) {
    /* ---------------------------------------------------*/
    /* PageFuncTehai
    /* ---------------------------------------------------*/

    case '/netz/netz1/tehai/tehai_input.aspx':
      break;
    case '/netz/netz1/tehai/kanren_input_save.aspx':
      //関連登録画面開いたら即送信
      $('form[name=form1]')['0'].submit();
      break;

    /* ---------------------------------------------------*/
    /* PageFuncS
    /* ---------------------------------------------------*/

    case '/netz/netz1/s/teian_list_head.aspx':
      //自動で自教室を開く
      $('select[name=tenpo_cd]').val('m');
      $('input[name=b_reload]').trigger('click');

      //最後に開いた季節を保存
      myprofiles.save({ nendo_season_cb: $('select[name=nendo_season_cb]').val() });

      //一括設定
      $('#tanto_cd').swipe('自分担当', () => {
        $('#tanto_cd').val(myprofiles.getone({ mynumber: '000231' }));
        $('select[name=tanto_cb]').val(2);
        $('[name=sort_cb]').val([2]);
        $('[name=kaiyaku_flg],[name=gen_course_flg],[name=mikomi_flg],[name=kakutei_flg]').prop('checked', true);
        $('[name=course_ng]').val('2026/04');
      });

      $('input[name=b_reload]').setshortcutkey('Enter');
      break;

    /* ---------------------------------------------------*/
    /* PageFuncSchedule
    /* ---------------------------------------------------*/

    case '/netz/netz1/schedule/yotei_list.aspx':
      // 予定をGoogleCalendarに登録
      pageFuncSchedule.setGCalRegister();
      break;
  }
});
