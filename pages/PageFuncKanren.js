// pages/PageFuncKanren.js
import PopMenu from '../core/PopMenu.js';
import { NX_Utils } from '../core/utils.js';

export default class PageFuncKanren {
  constructor() {
    this.path = location.pathname;
  }
  setLeaderTeacher() {
    const popmenu = new PopMenu({ id: 'main' });
    popmenu.appendItems([{ text: '号令講師自動設定', handler: () => setAnnounceCoach() }]);

    function setAnnounceCoach() {
      $('select[name^=teacher_cd]').each(function() {
        const $select = $(this);
        // 講師ミーティング担当は”なし”に。name同じ。。。
        if ($select.attr('name') == 'teacher_cd0') {
          $select.val('000000');
          return true;
        }
        // 講師番号が若い順に並び替え
        $select
          .find('option')
          .sort(function(a, b) {
            return parseInt($(a).val()) - parseInt($(b).val());
          })
          .appendTo($select);
        // 最も上にある◎に設定
        $select
          .val('000000') // 一旦なしに変更（並び替えると見た目だけ変わってしまう）
          .find('option')
          .each(function() {
            const $option = $(this);
            if ($option.text().indexOf('◎') != -1) {
              $select.val($option.val());
              return false;
            }
          });
      });
    }
  }
  prettierLectureList() {
    const popmenu = new PopMenu({ id: 'main' });
    const paramMode = NX_Utils.getPageParams('mode');
    switch (paramMode) {
      case 'lecture':
        deleteExercise();
        break;
      case 'exercise':
        deleteLecture();
        break;
    }
    popmenu.appendItems([
      { text: 'リーダー講師なし削除', handler: () => deleteNoLeader() },
      {
        text: '指導のみ',
        handler: () => {
          deleteNoLeader();
          deleteExercise();
        }
      },
      {
        text: '演習のみ',
        handler: () => {
          deleteNoLeader();
          deleteLecture();
        }
      },
      { text: '演習番号削除', handler: () => deteleExerNumber() }
    ]);

    function deleteNoLeader() {
      $('tr:gt(0)').each(function() {
        const $tr = $(this);
        const td4 = $tr.findTdGetTxt(4);
        const isNoLeader = td4 == 'なし';
        if (isNoLeader) $tr.remove();
      });
    }
    function deleteExercise() {
      $('tr:gt(0)').each(function() {
        const $tr = $(this);
        const td4 = $tr.findTdGetTxt(4);
        const td6 = $tr.findTdGetTxt(6);
        const isExercise = td4 == '演習' && td6 == '(※未手配)';
        const isVisit = td4 == '来校';
        if (isExercise || isVisit) $tr.remove();
      });
    }
    function deleteLecture() {
      $('tr:gt(0)').each(function() {
        const $tr = $(this);
        const td3 = $tr.findTdGetTxt(3);
        const td4 = $tr.findTdGetTxt(4);
        const td6 = $tr.findTdGetTxt(6);
        const isLecture = td4 == '指導';
        const is1on1 = td4 == '1on1';
        const isExerTeacher = td4 == '演習' && td6 != '(※未手配)';
        const isOpen = td4 == '開閉校';
        const isLeaderTeacher = td3 == '講師Ｍ担当' || td3.indexOf('号令講師') != -1;
        if (isLecture || is1on1 || isExerTeacher || isLeaderTeacher || isOpen) $tr.remove();
      });
    }
    function deteleExerNumber() {
      $('tr:gt(0)').each(function() {
        const $tr = $(this);
        const td4 = $tr.findTdGetTxt(4);
        const td5 = $tr.findTdGetTxt(5);
        const isExerOpen = td4 == '演習' || td4 == '開閉校';
        const is1on1 = td4 == '1on1';
        const isGroup = td5.indexOf('進学教室') != -1;
        if (isExerOpen || is1on1 || isGroup)
          $tr
            .find('td')
            .eq(3)
            .text('');
      });
    }
  }
  lectureAllCheck() {
    $('#allcheck')
      .on('contextmenu', () => {
        checkAndRegist();
        return false;
      })
      .swipe('全チェック', () => checkAndRegist());

    function checkAndRegist() {
      $('input[name="kekka_cb"]').prop('checked', true);
      $('input[name=kekka_update]').trigger('click');
    }
  }
  sendingDiverse() {
    const popmenu = new PopMenu({ id: 'main' });
    popmenu.appendItems([
      {
        text: 'Diverse登録画面を開く',
        handler: () => {
          const tableHead = $('table').getTableHead();
          const eqDiverse = tableHead['科目'] || 10;
          const eqStudentName = tableHead['生徒名'] || 8;
          const DiverseList = [
            ...new Set(
              $('tr')
                .map(function() {
                  // 科目のテキストに"Diverse"が含まれているかチェック
                  //prettier-ignore
                  if ($(this).findTdGetTxt(eqDiverse).includes('Diverse')) {
                              return $(this).find('td').eq(eqStudentName).find('a').text().trim();
                            }
                  return null;
                })
                .get()
            )
          ];

          //遷移先のロードを待って反映
          const diverseWindow = window.open(NX.URL.diverse, 'DiverseWindow');
          setTimeout(() => {
            diverseWindow.postMessage(DiverseList, NX.URL.diverse);
          }, 3000);
        }
      }
    ]);
  }
}
