// pages/PageFuncTehai.js
import { NX_Utils } from '../core/utils.js';
import PopMenu from '../core/PopMenu.js';

export default class PageFuncTehai {
  constructor() {
    this.path = location.pathname;
  }
  setTehaiAutomation() {
    const { doAction, forceSubject } = NX_Utils.getPageParams();

    //数値だけの入力、オートコンプリートオフ
    $('input[name$=_vl]').isAllNumeric();
    $('input').offAutocomplete();

    //回数が空欄か0でチェックが入っていたら外す
    ['kok', 'sha', 'sug', 'rik', 'eig'].forEach(sub => {
      $(`input[name=shido_${sub}]`)
        .on('input', function() {
          const count = $(this).val();
          if (count == '' || count == '0') $(`[name=shido_${sub}_flg]`).prop('checked', false);
        })
        .trigger('input');
    });

    //科目強制であれば、合計値をすべて国語に割り振る
    if (forceSubject == 'true') applyToSubject();

    switch (doAction) {
      case 'setAuto':
        //自動処理に変える
        $('select[name=jyotai_cb]').val(2);
        $('input[name=b_submit]').trigger('click');
        break;
      case 'setDone':
        //完了に変える
        $('select[name=jyotai_cb]').val(5);
        $('input[name=b_submit]').trigger('click');
        break;
    }

    const popmenu = new PopMenu({ id: 'main' });
    const iframe = new IframeMakerEx({ x: 1100, y: 10, draggable: true });
    const student_cd = $('input[name=student_cd').val();

    popmenu.appendItems([
      {
        text: '手配中にして登録',
        handler: () => {
          applyToSubject();
          $('select[name=jyotai_cb]').val('1');
          $('input[name=b_submit]').trigger('click');
        }
      },
      {
        text: '手配済にして登録',
        handler: () => {
          applyToSubject();
          $('select[name=jyotai_cb]').val('5');
          $('input[name=b_submit]').trigger('click');
        }
      },
      { text: 'プロファイル', handler: () => iframe.loadUrl(`${NX.CONST.host}/s/student_profile_input.aspx?student_cd=${student_cd}`) },
      { text: '契約情報', handler: () => iframe.loadUrl(`${NX.CONST.host}/k/student_keiyaku_data.aspx?student_cd=${student_cd}`) }
    ]);

    function applyToSubject(sub = 'kok') {
      const applyedSum = ['kok', 'sha', 'sug', 'rik', 'eig'].reduce((acc, cur) => {
        const val = parseInt($(`input[name=shido_${cur}_vl]`).val()) || 0;
        return acc + val;
      }, 0);
      //合計算出
      const sum = ['sho', 'kitei', 'tsuika', 'koshu'].reduce((acc, cur) => {
        const val = parseInt($(`input[name=${cur}_vl]`).val()) || 0;
        return acc + val;
      }, 0);

      //すでに適正なら終了
      if (applyedSum == sum) return true;

      //一旦科目クリア
      ['kok', 'sha', 'sug', 'rik', 'eig'].forEach(cur => {
        $(`input[name=shido_${cur}_vl]`).val('');
        $(`[name=shido_${cur}_flg]`).prop('checked', false);
      });

      //特定科目に適用
      $(`[name=shido_${sub}_flg]`).prop('checked', true);
      $(`[name=shido_${sub}_vl]`).val(sum);
    }
  }
  setTehaiRange() {
    const tehaiRange = {
      koshu: {
        from: new ExDate(Math.max(new Date(NX.VAR.koshu_kikan['開始']), new Date())).as('yyyy/mm/dd'),
        to: new ExDate(Math.max(new Date(NX.VAR.koshu_kikan['終了']), new Date())).as('yyyy/mm/dd')
      },
      tsuika: {
        from: new ExDate().as('yyyy/mm/dd'),
        to: new ExDate().aftermonths(1).as('yyyy/mm/dd')
      },
      sho: {
        from: new ExDate().as('yyyy/mm/dd'),
        to: new ExDate().aftermonths(1).as('yyyy/mm/dd')
      },
      kitei: {
        from: new ExDate().as('yyyy/mm'),
        to: ''
      }
    };
    ['sho', 'kitei', 'koshu', 'tsuika'].forEach(function(query) {
      $(`input[name=${query}_vl]`)
        .on('change', function() {
          const isNull = $(this).val() == '';
          $(`input[name=${query}_jk]`).val(isNull ? '' : '45');
          $(`input[name=${query}_from]`).val(isNull ? '' : tehaiRange[query].from);
          $(`input[name=${query}_to]`).val(isNull ? '' : tehaiRange[query].to);
        })
        .trigger('change');
    });
  }
}
