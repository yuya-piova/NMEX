// pages/PageFuncTodo.js
import { NX_Utils } from '../core/utils.js';
import PopMenu from '../core/PopMenu.js';
import { myprofile } from '../core/store.js';
import { toast } from '../core/components/FluxToast.js';

export default class PageFuncTodo {
  constructor() {
    this.path = location.pathname;
  }
  inputAutomation() {
    const start_dt = $('#start_dt');
    const end_dt = $('#end_dt');
    const kigen_dt = $('#kigen_dt');
    const kigen_tm = $('#kigen_tm');
    const jyotai_cb = $('select[name=jyotai_cb]');
    const $checklist_flgs = $('input[name^=checklist_flg]');
    const $progress_vl = $('#progress_vl');
    // パラメーターを持ってきてたら自動処理する
    let { setStart, setEnd, setDeadLine, setTime, doSave, setState, doAction } = NX_Utils.getPageParams();

    switch (doAction) {
      case 'autoClose':
        const hasDeadLine = kigen_dt.val() != '';
        const [nowStart, nowEnd, nowKigen] = [start_dt.val(), end_dt.val(), kigen_dt.val()];
        const todaySlash = new ExDate().as('yyyy/mm/dd');
        const nextTueSlash = new ExDate().nextday('火曜').as('yyyy/mm/dd');
        if (hasDeadLine) {
          // 期限がある場合
          // --- 終了日が空欄なら、終了日＝最終期限
          if (nowEnd == '') setEnd = nowKigen;
          // --- 開始日が空欄なら、開始日＝終了日or最終期限、今日の早い方
          if (nowStart == '') setStart = new ExDate(Math.min(new Date(nowKigen), new Date(setEnd), new Date())).as('yyyy/mm/dd');
        } else {
          // 期限がない場合
          if (nowEnd == '') {
            // --- 終了日がない場合
            // --- --- 開始日が空欄なら今日
            if (nowStart == '') setStart = todaySlash;
            // --- --- 終了日が空欄なら次の火曜日
            setEnd = nextTueSlash;
            setDeadLine = nextTueSlash;
          } else {
            // --- 終了日がある場合
            // --- --- 開始日は本日か終了日の早い方
            setStart = new ExDate(Math.min(new Date(nowEnd), new ExDate())).as('yyyy/mm/dd');
            // --- --- 期限は終了日
            setDeadLine = nowEnd;
          }
        }
        // 期限時間が０および空欄の場合は21:00にする
        if (kigen_tm.val() == '00:00' || kigen_tm.val() == '') setTime = '21:00';
        $('#kigen_flg').prop('checked', false);
        doSave = true;
        break;
    }

    // 最終処理
    // --- 状態を変更する
    const allowedState = ['F', 'X', 'D', 'C'];
    if (allowedState.includes(setState || '')) jyotai_cb.val(setState);

    // --- 完了なら全チェックを入れる
    if (setState == 'F') {
      $checklist_flgs.prop('checked', true);
      $progress_vl.val(100);
    }
    // --- 開始日を変更する
    if (setStart) start_dt.val(setStart);
    // --- 終了日を変更する
    if (setEnd) end_dt.val(setEnd);
    // --- 期限を変更する
    if (setDeadLine) kigen_dt.val(setDeadLine);
    // --- 時間を変更する
    if (setTime) kigen_tm.val(setTime);
    // --- 保存する
    if (doSave) ajaxsend();

    function ajaxsend() {
      $.ajax({
        type: 'POST',
        url: './todo_input_save_ajax.aspx',
        dataType: 'text',
        cache: false,
        data: $('form').serialize()
      })
        .done(
          // 取得成功時
          function(data) {
            if (data.split(',')[0] == 'ok') window.close();
          }
        )
        .fail(function() {
          alert('エラーが発生しました');
        });
    }
  }
  inputCalcRate() {
    const $checklist_flgs = $('input[name^=checklist_flg]');
    const $progress_vl = $('#progress_vl');
    const $jyotai_cb = $('[name=jyotai_cb]');
    // CH項目機能
    $checklist_flgs.on('contextmenu', function() {
      $(this).prop('checked', !this.checked);
      const checks = $checklist_flgs.length;
      const dones = $('input[name^=checklist_flg]:checked').length;
      $progress_vl.val(Math.floor((dones / checks) * 100));
      $('[name=jyotai_cb]').val(dones == checks ? 'F' : 'D');
      return false;
    });
  }
  inputSetPopmenu() {
    const popmenu = new PopMenu({ id: 'main' });
    popmenu.appendItems([
      {
        text: '完了',
        handler: () => {
          $('[name=jyotai_cb]').val('F');
          $('input[name^=checklist_flg]').prop('checked', true);
          $('#progress_vl').val(100);
          $('#b_submit').trigger('click');
        }
      },
      {
        text: '講師一覧を取得',
        handler: async () => {
          const tenpo_cd = prompt('校舎cdを入力してください', myprofile.get('mybase', '3416'));
          if (!tenpo_cd) return;
          try {
            const html = await $.get(`${NX.CONST.host}/t/teacher_list_body.aspx?jyotai_cb=1&main_tenpo_cd=${tenpo_cd}`);
            const $rows = $(html).find('tr');
            const existingCount = $('.FlexTextarea').length;

            $rows.each(function(index) {
              if (index === 0) return;

              const teacherName = $(this).findTdGetTxt(2);
              if (index - 1 >= existingCount) {
                $('input.add').trigger('click');
              }

              const $textarea = $('.FlexTextarea__textarea').eq(index - 1);
              const $dummy = $('.FlexTextarea__dummy').eq(index - 1);

              $textarea.val(teacherName);
              $dummy.text(teacherName);
            });
          } catch (err) {
            toast.error('講師データの取得に失敗しました');
          }
        }
      }
    ]);
  }
}
