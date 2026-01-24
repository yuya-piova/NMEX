///<reference path="../jquery-3.4.1.min.js"/>
///<reference path="../jquery-ui.min.js"/>
///<reference path="../checker.js"/>
///<reference path="../dts/JQuery.d.ts"/>
///<reference path="../dts/jqueryui.d.ts"/>
///<reference path="../dts/global.d.ts"/>
///<reference path="../dts/chrome.d.ts"/>
///<reference path="../nmex-longconst.js"/>
///<reference path="../nmexg.js"/>
///<reference path="./nmextg.js"/>
///<reference path="../nmexo/nmexog.js"/>
///<reference path="../nmexo/nmexof.js"/>

//const { cosmiconfig } = require('prettier/third-party');

console.log('nmextf.js');

var FUNCTION_T = {};
const popmenut_PB = new Popmenumaker('popmenut_PB', 19);

const popmenut_Ins = new Popmenumaker('popmenut_Ins', 45);

const popmenut_F2 = new Popmenumaker('popmenut_F2', 113);
//F8はファンクションボタンとして使う
const popmenut_F8 = new Popmenumaker('popmenut_F8', 119);
popmenut_F2.setContentFunction(function() {
  const $studentTable = $('<table>', { style: 'width:100%' });
  const selectedText = window.getSelection().toString();
  if (selectedText != '') {
    const student_cd = new studentInfoClass().search(['生徒名', selectedText])?.['生徒NO'];
    if ($NX(student_cd).isHexaNumber()) {
      appendStudentTR($studentTable, student_cd, 'Selected', selectedText);
      $studentTable.appendTo(this);
    }
  }
  if ($('input[name=student_cd]').length != 0) {
    const student_cd = $('input[name=student_cd]')
      .eq(0)
      .val();
    if ($NX(student_cd).isHexaNumber()) {
      const student_nm = new studentInfoClass().search(['生徒NO', student_cd])?.['生徒名'];
      appendStudentTR($studentTable, student_cd, 'FromPage', student_nm || student_cd);
      $studentTable.appendTo(this);
    }
  }
  function appendStudentTR($targetTable, student_cd, caption, selectedText = '') {
    const $studentMemo = $('<input>', { type: 'text', class: 'nx', size: '20' });
    const $linkButton = $('<button>', {
      class: 'nx',
      text: '連絡事項',
      on: {
        click: function() {
          window.open(`${NX.CONST.host}/s/student_renraku_list.aspx?student_cd=${student_cd}`);
        }
      }
    });
    const $tr = $('<tr>').append(`<td>${caption}<td>`, `<td>${selectedText}</td>`);
    $('<td>')
      .append($linkButton)
      .appendTo($tr);
    $('<td>')
      .append($studentMemo)
      .appendTo($tr);
    $targetTable.append($tr);
    $studentMemo.netzmemorize(student_cd);
  }
  $('<br>').appendTo(this);
  $('<button>', {
    type: 'button',
    text: 'BaseMan(b)',
    on: {
      click: function() {
        new BaseMan().show();
        popmenut_F2.closemenu();
      }
    }
  })
    .appendTo(this)
    .setshortcutkey('b');
  $('<button>', {
    type: 'button',
    text: 'PageNote(p)',
    on: {
      click: function() {
        new PageNote();
        popmenut_F2.closemenu();
      }
    }
  })
    .appendTo(this)
    .setshortcutkey('p');
  $('<button>', {
    type: 'button',
    text: '学習管理メニュー(F4)',
    on: {
      click: function() {
        popmenut_F2.closemenu();
        window.open(`${NX.CONST.host}/sso/mobilenetzmenu.aspx?app_name=forlecturer&page_kind=3&method_name=studymanagement`);
      }
    }
  })
    .appendTo(this)
    .setshortcutkey('F4');
  $('<button>', {
    type: 'button',
    text: 'タスク作成(t)',
    on: {
      click: function() {
        popmenut_F2.closemenu();
        window.open(`${NX.CONST.host}/todo/todo_input.aspx`);
      }
    }
  })
    .appendTo(this)
    .setshortcutkey('t');
  $('<button>', {
    type: 'button',
    text: 'tablerアイコン表示',
    on: {
      click: () => {
        $('.netztablerbutton,.addbutton_nmex').toggleClass('unshown');
      }
    }
  }).appendTo(this);
  $('<br>').appendTo(this);
});
(function() {
  console.log('走る走るFUNCTION_Tたち');
  FUNCTION_T.general = {};
  FUNCTION_T.general.isAreaMode = function() {
    if (myprofiles.getone({ isAreaMode: 0 }) == 1) {
      if (location.pathname != '/netz/netz1/schedule/yotei.aspx') {
        ['tenpo_cd', 'main_tenpo_cd'].forEach(function(elem) {
          $(`select[name=${elem}] option`).hide();
          $(`select[name=${elem}] optgroup`).hide();
          $(`select[name=${elem}]`).append(
            `${makeOption(NX.NOWBASE[myprofiles.getone({ mynumber: '000231' })])}<option value="allmode">全教室表示</option>`
          );
        });
      }
    }
    $('select[name=tenpo_cd],select[name=main_tenpo_cd]').on('change', function() {
      if ($(this).val() == 'allmode')
        $(this)
          .find('[style="display: none;"]')
          .show();
    });
  };
  FUNCTION_T.general.set_datepicker = function() {
    $.datepicker.setDefaults($.datepicker.regional.ja);
    const defaultRows = $('frameset', parent.document).attr('rows');
    switch (location.pathname) {
      case '/netz/netz1/toiawase_list_head.aspx':
      case '/netz/netz1/tehai/shido_furikae_list_head.aspx':
      case '/netz/netz1/tehai/tehai_list_head.aspx':
      case '/netz/netz1/kanren/booth_select_head.aspx':
      case '/netz/netz1/k/keiyaku_list_head.aspx':
      case '/netz/netz1/shingaku/shingaku_hokoku_list_head.aspx':
      case '/netz/netz1/k/kaiyaku_list_head.aspx':
      case '/netz/netz1/t/teacher_toroku_list_head.aspx':
        //headでフレーム拡張してセット
        $('[name^=input_dt1],[name^=input_dt2],[name^=input1_dt],[name^=input2_dt]').datepicker({
          numberOfMonths: 3,
          showCurrentAtPos: 1,
          showOtherMonths: true,
          dateFormat: 'yy/mm/dd',
          beforeShow: function() {
            $(this).attr('autocomplete', 'off');
            $('frameset', parent.document).attr('rows', '340,*');
          },
          onClose: function() {
            $('frameset', parent.document).attr('rows', defaultRows);
          }
        });
        break;
      case '/netz/netz1/s/teian_list_head.aspx':
        //headでフレーム拡張して月日で入力
        $('input[name^=input_dt],input[name^=next_dt]').datepicker({
          numberOfMonths: 3,
          showCurrentAtPos: 1,
          showOtherMonths: true,
          dateFormat: 'mm/dd',
          beforeShow: function() {
            $(this).attr('autocomplete', 'off');
            $('frameset', parent.document).attr('rows', '340,*');
          },
          onClose: function() {
            $('frameset', parent.document).attr('rows', '165,*');
          }
        });
        break;
      case '/netz/netz1/tehai/shido2_input_sp_h.aspx':
        //手配画面用の特殊ピッカー
        $('input[name^=input_f_]').datepicker({
          numberOfMonths: 3,
          showCurrentAtPos: 1,
          showOtherMonths: true,
          dateFormat: 'yy/mm/dd',
          beforeShow: function() {
            $(this).attr('autocomplete', 'off');
            $('frameset', parent.document).attr('rows', '340,*');
          },
          onClose: function() {
            $('frameset', parent.document).attr('rows', '130,*');
          },
          onSelect: function(dateText) {
            const [year, month, date] = dateText.split('/');
            $('input[name$=_f_dt_y]').val(year);
            $('input[name$=_f_dt_m]').val(month);
            $('input[name$=_f_dt_d]')
              .val(date)
              .trigger('change');
          }
        });
        $('input[name^=input_t_]').datepicker({
          numberOfMonths: 3,
          showCurrentAtPos: 1,
          showOtherMonths: true,
          dateFormat: 'mm/dd',
          beforeShow: function() {
            $(this).attr('autocomplete', 'off');
            $('frameset', parent.document).attr('rows', '340,*');
          },
          onClose: function() {
            $('frameset', parent.document).attr('rows', '130,*');
          },
          onSelect: function(dateText) {
            const [month, date] = dateText.split('/');
            $('input[name$=_t_dt_m]').val(month);
            $('input[name$=_t_dt_d]')
              .val(date)
              .trigger('change');
          }
        });
        break;
      case '/netz/netz1/tehai/shido_furikae_input.aspx':
      case '/netz/netz1/kanren/shido_yotei_edit.aspx':
        //年月日に分けて入力
        $('input[name$=_tm_y],input[name$=_tm_m],input[name$=_tm_d]').datepicker({
          numberOfMonths: 3,
          showCurrentAtPos: 1,
          showOtherMonths: true,
          dateFormat: 'yy/mm/dd',
          onSelect: function(dateText) {
            const [year, month, date] = dateText.split('/');
            $('input[name$=_tm_y]').val(year);
            $('input[name$=_tm_m]').val(month);
            $('input[name$=_tm_d]')
              .val(date)
              .trigger('change');
          }
        });
        break;
      case '/netz/netz1/t/teacher_toroku_input.aspx':
        $('[name$=_dt_y],[name$=_dt_m],[name$=_dt_d]').datepicker({
          numberOfMonths: 3,
          showCurrentAtPos: 1,
          showOtherMonths: true,
          dateFormat: 'yy/mm/dd',
          onSelect: function(dateText) {
            const [year, month, date] = dateText.split('/');
            const caption = $(this)
              .attr('name')
              .split('_')[0];
            $(`input[name=${caption}_dt_y]`).val(year);
            $(`input[name=${caption}_dt_m]`).val(month);
            $(`input[name=${caption}_dt_d]`)
              .val(date)
              .trigger('change');
          }
        });
        break;
      case '/netz/netz1/s/student_schedule_list.aspx':
        //年月のみ
        $('[name=input_ng]').datepicker({
          numberOfMonths: 2,
          showCurrentAtPos: 0,
          showOtherMonths: true,
          dateFormat: 'yy/mm'
        });
        break;
      case '/netz/netz1/tehai/shido_edit_list.aspx':
        //普通のyyyy/mm/ddとyy,mmが混在
        $('[name$=_dt]').datepicker({
          numberOfMonths: 3,
          showCurrentAtPos: 1,
          showOtherMonths: true,
          dateFormat: 'yy/mm/dd'
        });
        $('input[name^=shido_tm_d],input[name^=shido_tm_m]')
          .datepicker({
            dateFormat: 'yy/mm/dd',
            numberOfMonths: 3,
            showOtherMonths: true,
            onSelect: function(dateText, inst) {
              const [year, month, date] = dateText.split('/');
              const $td = $(`#${inst.id}`).closest('td');
              $td
                .find('input[name^=shido_tm_m]')
                .val(month)
                .change();
              $td
                .find('input[name^=shido_tm_d]')
                .val(date)
                .change();
            }
          })
          .attr('autocomplete', 'off');
        break;
    }
    //月日に分けて入力 指導振替とか
    $('[name=next_dt_m],[name=next_dt_d]').datepicker({
      numberOfMonths: 3,
      showCurrentAtPos: 1,
      showOtherMonths: true,
      dateFormat: 'mm/dd',
      onSelect: function(dateText) {
        const [month, date] = dateText.split('/');
        $('[name=next_dt_m]').val(month);
        $('[name=next_dt_d]')
          .val(date)
          .trigger('change');
      }
    });
    $('[name=input_dt_y],[name=input_dt_m],[name=input_dt_d]').datepicker({
      numberOfMonths: 3,
      showCurrentAtPos: 1,
      showOtherMonths: true,
      dateFormat: 'yy/mm/dd',
      onSelect: function(dateText) {
        const [year, month, date] = dateText.split('/');
        $('[name=input_dt_y]').val(year);
        $('[name=input_dt_m]').val(month);
        $('[name=input_dt_d]')
          .val(date)
          .trigger('change');
      }
    });
  };
  FUNCTION_T.general.EMP_Picker = function() {
    switch (location.pathname) {
      case '/netz/netz1/s/student_tanto_input.aspx':
        $('#shain_cd').each(function() {
          $(this).emppicker();
        });
        break;
      case '/netz/netz1/s/student_tanto_list.aspx':
      case '/netz/netz1/student_list_head.aspx':
      case '/netz/netz1/s/teian_list_head.aspx':
      case '/netz/netz1/s/student_renraku_head.aspx':
        $('#tanto_cd').each(function() {
          $(this).emppicker();
        });
        break;
      //以降複数系
      //エリア予定
      case '/netz/netz1/schedule/yotei2.aspx':
        $('textarea[name=select_cd]').emppicker({ multiple: true });
        break;
      //開校予定
      case '/netz/netz1/tenpo_yotei.aspx':
        $('[id^=duty],[id^=open_tanto],[id^=close_tanto]').each(function() {
          $(this).emppicker({ multiple: true });
        });
        break;
      case '/netz/netz1/shingaku/shingaku_hokoku_list_head.aspx':
        $('[name=teacher_cd]').emppicker();
        break;
    }
  };
  FUNCTION_T.general.capsescaper = function() {
    var capscount = 0;
    window.addEventListener(
      'keydown',
      function(e) {
        if (e.keyCode == 240) {
          if (capscount == 0) {
            capscount = 1;
          } else {
            myprofiles.save({ isSpecialEnabled: 0 });
            capscount = 0;
          }
          return false;
        }
      },
      false
    );
  };
  FUNCTION_T.general.SLM = function() {
    const studentInfo = new studentInfoClass();
    const teacherInfo = new teacherInfoClass();
    $('td').each(function() {
      const $td = $(this);
      const innerText = $td
        .text()
        .trim()
        .replace(/\(.*?\)/g, '');
      const isLinkedCell = $td.html().includes('<a');
      const otherElements = $td.find(':not(a)');
      //生徒
      const matchedInfoS = studentInfo.search(['生徒名', innerText]);
      const student_cd = matchedInfoS?.['生徒NO'];
      const student_nm = matchedInfoS?.['生徒名'];
      if (student_cd) {
        $td.attr({
          class: `studentLinker ${isLinkedCell ? 'everblue' : 'silent'}`,
          student_cd,
          student_nm,
          title: `カナ：${matchedInfoS['カナ']},学年：${matchedInfoS['学年']}`
        });
      }
      //個別のリンクをやめて、studentLinker(memberLinker)自体に機能をもたせてみる　問題なければ以下削除
      if (false && student_cd) {
        $td
          .html(
            $('<a></a>', {
              href: `${NX.CONST.host}/s/student_renraku_list.aspx?student_cd=${student_cd}`,
              target: `student_renraku_list_${student_cd}`,
              text: innerText,
              class: `studentLinker ${isLinkedCell ? 'everblue' : 'silent'}`,
              student_cd: student_cd,
              student_nm: innerText,
              title: `カナ：${matchedInfoS['カナ']},学年：${matchedInfoS['学年']}`
            })
          )
          .append(otherElements);
        return true;
      }

      //講師
      const matchedInfoT = teacherInfo.search(['講師名', innerText]);
      const teacher_cd = matchedInfoT?.['cd'];
      if (teacher_cd) {
        $td.attr({ teacher_cd, teacher_nm: innerText }).addClass('teacherLinker');
      }
    });
  };
  FUNCTION_T.general.teacherSwipe = function() {
    const tenpo_cd = $('[name=kaiko_tenpo_cd],input[name=tenpo_cd]').val() || myprofiles.getone({ mybase: '' });
    const teacherInfo = new teacherInfoClass(tenpo_cd);
    const cdList = teacherInfo.list('cd');
    cdList.push(myprofiles.getone({ mynumber: '' }));
    const nameList = teacherInfo.list('講師名');
    nameList.push(myprofiles.getone({ myname: '' }));

    const btnData = Object.fromEntries(nameList.map((name, index) => [name, cdList[index]]));

    $('input[name^=teacher_cd]').each(function() {
      $(this).netzpicker(btnData);
    });
  };
  FUNCTION_T.general.checkboxClickHelper = function() {
    $(document).on('click', 'td:has(input[type="checkbox"]), td:has(input[type="radio"])', function(e) {
      if (e.target.tagName !== 'TD') return;
      if ($(e.target).attr('tablehead') === 'true') return; // tablehead 属性が true の場合は無視

      const $input = $(this).children('input[type="checkbox"], input[type="radio"]'); // td の直下にある input（checkbox または radio）を取得
      if ($input.length === 1) $input.trigger('click');
    });
  };

  FUNCTION_T.general.tenpoClicker = function() {
    $('select[name=tenpo_cd],select[name=main_tenpo_cd]')
      .on('contextmenu', function() {
        //myprofilesから、 mybase#,mygroup#,myarea#を拾う
        const profilelist = myprofiles.getall();
        const tenpocds = [
          extractValuesByKeyPrefix(profilelist, 'mybase'),
          extractValuesByKeyPrefix(profilelist, 'mygroup'),
          extractValuesByKeyPrefix(profilelist, 'myarea')
        ];
        $('select[name=tenpo_cd],select[name=main_tenpo_cd]')
          .selectSwitcher(tenpocds.flat(Infinity))
          .trigger('change');
        return false;

        function extractValuesByKeyPrefix(data, prefix) {
          return Object.keys(data)
            .filter(key => key.startsWith(prefix) && /^\d*$/.test(key.replace(prefix, '')))
            .sort((a, b) => {
              const numA = parseInt(a.replace(prefix, '')) || 0;
              const numB = parseInt(b.replace(prefix, '')) || 0;
              return numA - numB;
            })
            .map(key => data[key]);
        }
      })
      .selectSearcher() //swipeで検索boxを追加
      .find('option')
      .each(function() {
        $(this).attr('title', $(this).val());
      });
  };

  //一時的に必要な関数を記述する場所※必ず期日を明記すること
  FUNCTION_T.general.temporary = function() {
    if (myprofiles.getone({ mynumber: '0' }) != '000231') return true;
    switch (location.pathname) {
      /* eslint-disable */
      case '/netz/netz1/shingaku/kouza_select.aspx':
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            text: '大学入試セミナー',
            on: {
              click: function() {
                popmenut_F2.closemenu();
                $('[name=tenpo_cd]').val('');
                $('[name=season_cb]').val('c');
                $('[name=b_reload]').trigger('click');
              }
            }
          }).appendTo(this);
        });
        break;
      case '/netz/netz1/text/contents_list.aspx':
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            type: 'button',
            text: '担任取得',
            on: {
              click: async () => {
                const student_cds = $('tr:gt(0)')
                  .map(function() {
                    return $(this).findTdGetTxt(1);
                  })
                  .get();
                const coachs = await new AjaxstudentInfoClass().coachs(student_cds);
                $('tr:gt(0)').each(function() {
                  const student_cd = $(this).findTdGetTxt(1);
                  if (coachs[student_cd]) $(`<td>${coachs[student_cd]}</td>`).appendTo(this);
                });
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
        });
        break;
      default:
        //nothing
        break;
    }
  };
  FUNCTION_T.general.infoSave = function() {
    const [elemName, storageName] = {
      '/netz/netz1/student_list_head.aspx': ['tenpo_cd', 'sInfoSave'],
      '/netz/netz1/t/teacher_list_head.aspx': ['main_tenpo_cd', 'tInfoSave']
    }[location.pathname] || [null, null];
    if (elemName && storageName && myprofiles.getone({ showInfosave: 1 }) == 1) {
      const $tenpoSelector = $(`select[name=${elemName}]`);
      const $stateCheck = $('<input>', { type: 'checkbox' });

      // localStorage のデータを取得・保存する関数
      const getSaveData = () => JSON.parse(localStorage.getItem(storageName)) || {};
      const setSaveData = data => localStorage.setItem(storageName, JSON.stringify(data));

      // チェックボックスの状態変更時の処理
      const handleCheckboxChange = () => {
        const saveData = getSaveData();
        saveData[$tenpoSelector.val()] = $stateCheck.prop('checked');
        setSaveData(saveData);
      };

      // 店舗セレクター変更時の処理
      const handleTenpoChange = () => {
        const saveData = getSaveData();
        $stateCheck.prop('checked', saveData[$tenpoSelector.val()] || false);
      };

      // イベント登録
      $stateCheck.on('change', handleCheckboxChange);
      $tenpoSelector.on('change', handleTenpoChange).trigger('change');

      // ラベルを作成し、セレクターの後に追加
      $('<label>', { text: '情報保存' })
        .prepend($stateCheck)
        .insertAfter($tenpoSelector);
    }
  };
  FUNCTION_T.student_list_body = {};
  FUNCTION_T.student_list_body.CTXrenrakuopen = function() {
    $('input[value="開く"]').each(function() {
      $(this).on('contextmenu', function() {
        //prettier-ignore
        const studentcd = $(this).attr('name').replace('b','');
        window.open(`${NX.CONST.host}/s/student_renraku_list.aspx?student_cd=${studentcd}`, `student_renraku_list_${studentcd}`);
        return false;
      });
    });
  };
  FUNCTION_T.student_list_body.saveStudentInfo = function() {
    const parentframe = $('frame[name=student_list_head]', parent.document).contents();
    const tenpo_cd = parentframe.find('select[name=tenpo_cd]').val();

    //保存条件：指導中＆入力欄がすべて空欄＆メール送信でない＆infoSave登録済
    const isStateZero = parentframe.find('[name=jyotai_cb]').val() == '0';
    const isGakunenNull = parentframe.find('[name=gakunen_cb]').val() == '';
    const isAllTextBlank =
      $('input[type=text]')
        .map((_, elem) => $(elem).val())
        .get()
        .join('') == '';
    const isNotSendMail = $('input[name=menu_cb').val() != 'sendmail';
    const isSave = (JSON.parse(localStorage.getItem('infoSave')) || {})[tenpo_cd];

    if (isStateZero && isGakunenNull && isAllTextBlank && isSave && isNotSendMail) {
      const $parsedTable = $('table').clone();

      //生徒番号がなければselecterから取得
      const eqCD = $parsedTable.getTableHead()['生徒NO'];
      if (!eqCD) {
        $('<td>生徒NO</td>').prependTo($parsedTable.find('tr').eq(0));
        $parsedTable.find('select').each(function() {
          const $this = $(this);
          const student_cd = $this.attr('name').replace('d', '');
          $this.closest('tr').prepend(`<td>${student_cd}</td>`);
        });
      }

      //特記事項は削除
      const eqName = $parsedTable.getTableHead()['生徒名'];
      $parsedTable.find('tr').each(function() {
        const nameTD = $(this)
          .find('td')
          .eq(eqName);
        const parsedTxt = nameTD.text().replace(/\(.*?\)/g, '');
        nameTD.text(parsedTxt);
      });

      new studentInfoClass().saveTable(tenpo_cd, $parsedTable);
    }
  };
  FUNCTION_T.student_list_body.showMemo = function() {
    if (myprofiles.getone({ showMemo: 0 }) == 1) {
      const tableIndex = $('table').getTableHead();
      const JotaiIndex = tableIndex['状態'] || 0;
      const rows = $('table tr');
      rows
        .eq(0)
        .find(`td:eq(${JotaiIndex})`)
        .after('<td>メモ</td>');

      rows.slice(1).each(function() {
        const student_cd = $(this)
          .find('input[value="開く"]')
          .attr('name')
          .replace('b', '');
        $('<td>')
          .append($('<input>', { type: 'text' }).netzmemorize(student_cd))
          .insertAfter($(this).find(`td:eq(${JotaiIndex})`));
      });
    }
  };
  FUNCTION_T.student_list_body.shokiSync = function() {
    if (top.frames.length != 0) $('select[name=menu_cb]', top.frames[0].document.body).netztracer($('select[name^=d]'));
  };
  FUNCTION_T.student_list_body.popmenu = function() {
    popmenut_F2.setContentFunction(function() {
      //モード切り替え
      const onoff = [
        { title: 'OFF', value: 0 },
        { title: 'ON', value: 1 }
      ];
      myprofiles.maketogglebutton('生徒メモ', 'showMemo', onoff).appendTo(this);
      myprofiles.maketogglebutton('生徒情報保存', 'showInfosave', onoff).appendTo(this);
    });
  };

  FUNCTION_T.toiawase_input = {};
  FUNCTION_T.toiawase_input.namenoformatter = function() {
    $('input[name=tel_no],input[name=keitai_tel_no1]').on('contextmenu', function() {
      $(this).valFunction(now => $NX(now).phoneformat());
      return false;
    });
    $('input[name=parent_kg],input[name=parent_kt],input[name=student_kg],input[name=student_kt]').on('contextmenu', function() {
      $(this).valReplace(' ', '　');
      return false;
    });
  };
  FUNCTION_T.shido2_input_sp_check = {};
  FUNCTION_T.shido2_input_sp_check.setmaster = function() {
    $('input[name^=bikou_nm]').each(function() {
      $(this).after('<input type="checkbox" class="mastertarget" checked >');
    });
    $('td:contains("備考")').append(
      ' <input type="button" class="allchange" tag="on" value="ON"><input type="button" class="allchange" tag="off" value="OFF"><input type="button" class="allchange" tag="toggle" value="TOGGLE">'
    );
    $('.allchange').on('click', function() {
      let tag = $(this).attr('tag');
      $('.mastertarget').each(function() {
        switch (tag) {
          case 'on':
            $(this).prop('checked', true);
            break;
          case 'off':
            $(this).prop('checked', false);
            break;
          case 'toggle':
            $(this).prop('checked', !$(this).prop('checked'));
            break;
        }
      });
    });
    $('<input type="text" placeholder="マスター">')
      .prependTo('body')
      .on('change', function() {
        const text = $(this).val();
        $('.mastertarget:checked').each(function() {
          $(this)
            .parent()
            .find('input[name^=bikou_nm]')
            .val(text);
        });
      });
  };
  FUNCTION_T.yotei_input = {};
  FUNCTION_T.yotei_input.inputsupport = function() {
    //予定の右クリック→タスクならチェックを付けて登録、それ以外なら■をつけて登録
    $('input[name=yotei_nm]').on('contextmenu', function() {
      if ($('select[name=yotei_cb]').val() == '4') {
        $(this).valPrepend('■');
        $('input[name=b_submit]').trigger('click');
      } else if ($('select[name=yotei_cb]').val() == 't') {
        $('#done_flg').prop('checked', true);
        $('input[name=b_submit]').trigger('click');
      }
      return false;
    });
    //場所の右クリック→空欄ならデフォルト教室入力、空欄でないなら登録ボタンを押す
    $('input[name=basho_nm]').on('contextmenu', function() {
      if ($(this).val() == '') {
        $(this).val(myprofiles.getone({ mybasename: '' }));
      } else {
        $('input[name=b_submit]').trigger('click');
      }
      return false;
    });

    //半角修正
    $('input[name=s_tm],input[name=e_tm]').isAllNumeric(false);
  };
  FUNCTION_T.yotei_input.togas = function() {
    if (myprofiles.getone({ myname: '' }) == '辰野　由弥') {
      popmenut_F2.setContentFunction(function() {
        $('<button>', {
          type: 'button',
          text: 'Google Calとoutlookに追加',
          on: {
            click: () => {
              const startDate = new ExDate($('#input_dt').val() + ' ' + $('#s_tm').val());
              const endDate = new ExDate($('#input_dt').val() + ' ' + $('#e_tm').val());
              const duration = $('#e_tm').val() != '' ? (endDate.getTime() - startDate.getTime()) / (1000 * 60) : 30;
              const startdt = `${startdt.as('yyyy-mm-dd')}T${$('#s_tm').val()}:00`;
              const topic = `${$('[name=yotei_cb] option:selected').text()}:${$('#basho_nm').val()}`;
              $.post(
                'https://script.google.com/macros/s/AKfycbwwG54-D3VbMrrH9p31vQa44vk5MY7piaVhg0NYfoWdXWOCWLlQu3eXbPoVZ16hPd6u5A/exec',
                { onlymakeschedule: 'true', topic, startdt, duration },
                window.alert('POST完了')
              );
            }
          }
        }).appendTo(this);
      });
    }
  };
  FUNCTION_T.yotei_input.addtemplate = function() {
    const tempUI = {
      select: $('<select></select>'),
      updateBtn: $('<button>').text('更新・保存'),
      deleteBtn: $('<button>').text('削除')
    };
    tempUI.select.on('change', function() {
      const yoteiTemplate = JSON.parse(localStorage.getItem('yoteiTemplate')) || {};
      const selectedData = yoteiTemplate[$(this).val()] || {};
      for (let key in selectedData) {
        $(`[name="${key}"]`).val(selectedData[key]);
      }
    });
    tempUI.updateBtn.on('click', function() {
      let title = tempUI.select.val();
      if (title == '') title = prompt('タイトルを入力してください');
      if (!title) return false;
      const yoteiTemplate = JSON.parse(localStorage.getItem('yoteiTemplate')) || [];
      const item = Object.fromEntries(
        $('input,select,textarea')
          .map((_, el) => (el.name ? [el.name, $(el).val()] : null))
          .get()
          .filter(Boolean)
      );
      yoteiTemplate.push(item);
      localStorage.setItem('yoteiTemplate', JSON.stringify(yoteiTemplate));
      PX_Toast('保存しました');
      tempReflesh();
    });
    tempUI.deleteBtn.on('click', function() {
      let index = tempUI.select.val();
      if (index == '') return false;
      const yoteiTemplate = JSON.parse(localStorage.getItem('yoteiTemplate')) || [];
      if (yoteiTemplate[index]) delete yoteiTemplate.splice(index, 1);
      localStorage.setItem('yoteiTemplate', JSON.stringify(yoteiTemplate));
      PX_Toast('削除しました');
      tempReflesh();
    });
    function tempReflesh() {
      const yoteiTemplate = JSON.parse(localStorage.getItem('yoteiTemplate')) || [];
      tempUI.select.html('<option value="" selected>ーーー</option>');
      yoteiTemplate.forEach((elm, ind) => {
        tempUI.select.append(`<option value="${ind}">${elm.name}</option>`);
      });
    }
    popmenuo_ins.setContentFunction(function() {
      for (let key in tempUI) {
        tempUI[key].appendTo('body');
      }
      tempReflesh();
    });
  };
  FUNCTION_T.yotei_input.renzoku = function() {
    //連続登録ボタンを押したら保存
    $('input[name=b_submit2]').on('click', function() {
      const yoteiData = {};
      $('input,select,textarea').each(elm => {
        yoteiData[$(elm).attr('name')] = $(elm).val();
      });
      sessionStorage.setItem('yoteiData', JSON.stringify(yoteiData));
    });
    //セッションストレージに保存されていたら
    if (sessionStorage.getItem('yoteiData') != null) {
      const yoteiData = JSON.parse(sessionStorage.getItem('yoteiData')) || {};
      for (let key in yoteiData) {
        $(`[name="${key}"]`)
          .val(yoteiData[key])
          .trigger('change');
      }
      sessionStorage.removeItem('yoteiData');
    }
  };
  FUNCTION_T.student_info_input = {};
  FUNCTION_T.student_info_input.F2menu = function() {
    popmenut_F2.setContentFunction(function() {
      $('<button>引継ぎ連絡事項（上に追加）</button>')
        .appendTo(this)
        .on('click', function() {
          var nowtext = $('textarea[name=student_info_detail_nm]').val();
          var contentformat =
            '□受講コース・科目・テキスト\n\n\n□目標・志望校\n\n\n□入会動機・現状の問題点\n\n\n□成績\n\n\n□約束事・注意点\n\n\n□宿題の量・提出状況\n\n\n□部活動\n\n\n□連絡時注意（連絡相手・連絡可能時間）\n\n\n□入金方法と未入金残高・回収状況\n\n\n□生徒間・保護者間の友人・つながり\n\n\n□兄弟';
          $('textarea[name=student_info_detail_nm]')
            .val(contentformat + '\n' + nowtext)
            .textarearesizer();
        });
    });
  };
  FUNCTION_T.tehai_input = {};
  FUNCTION_T.tehai_input.setRange = function() {
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
  };
  FUNCTION_T.shido_furikae_input = {};
  FUNCTION_T.shido_furikae_input.F2menu = function() {
    const tableWidth = $('table')['0'].clientWidth;
    const iframe = new IframeMakerEx({ iframeName: 'shido_furikae_input', x: tableWidth + 20, y: 10, draggable: true, savePosition: false });
    const student_cd = $('input[name=student_cd]').val();

    popmenut_F2.setContentFunction(function() {
      iframe.makeButton(`${NX.CONST.host}/s/student_renraku_list.aspx`, '連絡事項', Object.assign({}, { student_cd })).appendTo(this);
      iframe.makeButton(`${NX.CONST.host}/kanren/student_shido_yotei.aspx`, '指導予定', Object.assign({}, { student_cd })).appendTo(this);
    });
  };
  FUNCTION_T.shido_furikae_input.weekday = function() {
    $('input[name=kekka_shido_dt]').setweekday();
    $('input[name=next_dt]').setweekday();
  };
  FUNCTION_T.shido_edit_list = {};
  FUNCTION_T.shido_edit_list.F2menu = function() {
    popmenut_F2.setContentFunction(function() {
      //自動ブース組による文字列修正
      $('<button>', {
        type: 'button',
        text: '[↑][↓]学年種削除',
        class: 'nx offsecondary',
        on: {
          click: function() {
            $('[name^=bikou_nm]').each(function() {
              const $this = $(this);
              const beforeVal = $this.val();
              $this
                .valReplace('[ ↑ ]')
                .valReplace('[ ↓ ]')
                .valReplace('△')
                .valRegexReplace(/^.*?：/)
                .valReplace('(', '（')
                .valReplace(')', '）');
              if ($this.val() != beforeVal) $this.addClass('inputselectchange');
            });
            popmenut_F2.closemenu();
          }
        }
      }).appendTo(this);
      $('<button>', {
        type: 'button',
        text: '補助常時表示ON',
        class: 'nx',
        on: {
          click: function() {
            myprofiles.toggle('showShidoEditSupport', [0, 1]);
            $(this).trigger('change');
          },
          change: function() {
            const showES = myprofiles.getone({ showShidoEditSupport: 0 }) == 1;
            $(this)
              .text(`補助常時表示${showES ? 'ON' : 'OFF'}`)
              .toggleClass('offout', !showES);
          }
        }
      })
        .appendTo(this)
        .trigger('change');
    });
  };
  FUNCTION_T.shido_edit_list.support = function() {
    const $table = $('table').eq(0);
    const tableHead = $table.getTableHead();
    const $trs = $table.find('tr');
    const $addTr = $('table')
      .eq(1)
      .find('tr')
      .eq(1);
    //tracer
    const inputTracerMaster = $('<input type="checkbox" class="inputTracer"/>');
    $trs.each(function(e) {
      if (e === 0) {
        $('<td>')
          .append(inputTracerMaster)
          .appendTo(this);
        return true;
      }
      $(this).append(`<td><input type="checkbox" class="inputTracer"/></td>`);
    });
    //masterの動作
    inputTracerMaster
      .on('click', function() {
        //全部チェック
        const isChecked = $(this).prop('checked');
        $(document)
          .find('.inputTracer')
          .prop('checked', isChecked);
      })
      .on('contextmenu', function() {
        //チェックを一つ下げる
        let isCheckedBefore = false;
        $trs.each(function(e) {
          if (e === 0) return true;
          const $tracer = $(this).find('.inputTracer');
          const isChecked = $tracer.prop('checked');
          $tracer.prop('checked', isCheckedBefore);
          isCheckedBefore = isChecked;
        });
        return false;
      });
    //変更を同期
    $('input:not(.inputTracer),select:not(.inputTracer)').on('change', function() {
      const $this = $(this);
      const $row = $this.closest('tr');
      const $siblingTracer = $row.find('.inputTracer');

      // チェックボックスがオフの場合は処理を中止
      if (!$siblingTracer.prop('checked')) return;

      const masterName = $this.attr('name').replace(/\d+/g, '');
      const masterVal = $this.val();
      const masterChecked = $this.prop('checked');

      // チェックボックスがオンの行の対応するフィールドを更新
      $trs.each(function() {
        const $tr = $(this);
        const $trTracer = $tr.find('.inputTracer');

        if (!$trTracer.prop('checked')) return true;
        const $target = $tr.find(`[name^="${masterName}"]`);
        switch ($target.attr('type')) {
          case 'checkbox':
            $target.prop('checked', masterChecked);
            break;
          default:
            $target.val(masterVal).addClass('inputselectchange');
            break;
        }
      });
    });
    //Tracerの右クリックで同じ曜日時間の指導のみチェック
    $(document).on('contextmenu', '.inputTracer', function() {
      const masterData = getDataFromTr($(this).closest('tr'));
      if (!masterData) return false;
      $('tr').each(function() {
        const $tr = $(this);
        const targetData = getDataFromTr($tr);
        if (!targetData) return true;
        const isSameDate = targetData.date == masterData.date;
        const isSameTime = targetData.hour == masterData.hour && targetData.minute == masterData.minute;
        //備考欄の１文字目のみ判定（末尾の追加情報は同一視）
        const isSimilarBikou = targetData.bikou.charAt(0) == masterData.bikou.charAt(0);
        $tr.find('.inputTracer').prop('checked', isSameDate && isSameTime && isSimilarBikou);
      });
      return false;
    });
    function getDataFromTr(tr) {
      const $tr = $(tr);
      const month = $tr.find('[name^=shido_tm_m]').val();
      const day = $tr.find('[name^=shido_tm_d]').val();
      const hour = $tr.find('[name^=shido_tm_h]').val();
      const minute = $tr.find('[name^=shido_tm_n]').val();
      const bikou = $tr.find('[name^=bikou_nm]').val();
      if (!month || !day || !hour || !minute) return undefined;
      const date = new ExDate().setDateTry(null, month - 1, day).as('a');
      return { month, day, hour, minute, date, bikou };
    }

    //追加にコピー
    //なぜかnew_がついているのでコピーが反映されない
    $('[name=new_teacher_cd]').attr('name', 'teacher_cd');
    $trs.each(function(e) {
      if (e === 0) {
        $(this).append('<td>');
        return true;
      }
      const btn = $('<button>', { type: 'button', text: 'コピー' })
        .css('font-size', '10px')
        .on('click', function() {
          const $tr = $(this).parents('tr');
          $tr.find('input,select').each(function() {
            //prettier-ignore
            const targetName = $(this).attr('name')?.replace(/\d+/g, '');
            $addTr.find(`[name^=${targetName}]`).val($(this).val());
          });
          //授業種類を反映
          const lectureKind = $tr.findTdGetTxt(tableHead['区分'] || 9);
          $('select[name=new_shido_cb] option')
            .filter(function() {
              return (
                $(this)
                  .text()
                  .trim() === lectureKind
              );
            })
            .prop('selected', true);
        });
      $('<td>')
        .append(btn)
        .appendTo(this);
    });
    $trs.each(function(e) {
      $(this).append(`<td>${e === 0 ? 'Num' : e}</td>`);
    });
    //footer
    const footer = $('<div>', { style: 'display:block' }).appendTo('body');
    $('<button>', {
      type: 'button',
      text: '奇数番目or偶数番目',
      on: {
        click: function() {
          //prettier-ignore
          const isFirstChecked = $(document).find('.inputTracer').eq(1).prop('checked');
          $(document)
            .find('.inputTracer')
            .each(function(e) {
              if (e == 0) return true;
              $(this).prop('checked', e % 2 === 0 ? isFirstChecked : !isFirstChecked);
            });
        }
      }
    }).appendTo(footer);
    $('<button>', {
      type: 'button',
      text: 'toggle',
      on: {
        click: function() {
          $(document)
            .find('.inputTracer')
            .each(function(e) {
              if (e == 0) return true;
              const isChecked = $(this).prop('checked');
              $(this).prop('checked', !isChecked);
            });
        }
      }
    }).appendTo(footer);
  };
  FUNCTION_T.shido_edit_list.showYoubiSetPicker = function() {
    $('input[name^=shido_tm_m][type=text]:not(:disabled)').each(function() {
      const $tr = $(this).closest('tr');
      const $hour = $tr.find('[name^=shido_tm_h]');
      const $minute = $tr.find('[name^=shido_tm_n]');
      const $month = $tr.find('[name^=shido_tm_m]');
      const $day = $tr.find('[name^=shido_tm_d]');
      const $date = $('<span>').insertAfter($day);
      $hour.add($minute).netztimepicker(true, $hour, $minute);
      $month
        .add($day)
        .on('change', () => {
          $date.text(new ExDate().setDateTry(null, parseInt($month.val()) - 1, $day.val()).as('(aaa)'));
        })
        .trigger('change');
    });
  };
  FUNCTION_T.shido_edit_list.changecolor = function() {
    $('input,select').on('change', function() {
      $(this).addClass('inputselectchange');
    });
  };
  FUNCTION_T.shido_edit_list.layoutchange = function() {
    $('input[name^=shido_tm_m],input[name^=shido_tm_d],input[name^=shido_tm_h],input[name^=shido_tm_n],input[name^=pt_jk],input[name^=kt_jk]')
      .attr('size', '')
      .css('width', '1rem');
    $('input[name^=shido_jikan]')
      .attr('size', '')
      .css('width', '1.5rem');
    $('[name^="bikou"]')
      .attr('size', '')
      .css('width', '10rem');
  };
  FUNCTION_T.shido_edit_list.bikouSwipe = function() {
    $('input[name^=bikou_nm]').each(function() {
      $(this)
        .swipe('[●/●]', () => {
          const $tr = $(this).closest('tr');
          const month = $tr.find('input[name^=shido_tm_m]').val();
          const day = $tr.find('input[name^=shido_tm_d]').val();
          $(this)
            .valAppend(`[${parseInt(month)}/${parseInt(day)}]`)
            .trigger('change');
        })
        .swipe('代理指導', () => {
          $(this)
            .valAppend('※代理指導')
            .trigger('change');
        })
        .swipe('同備考にCH', () => {
          const text = $(this).val();
          $(`input[value="${text}"]`).each(function() {
            $(this)
              .closest('tr')
              .find('.inputTracer')
              .prop('checked', true);
          });
        });
    });
  };
  FUNCTION_T.student_shido_yotei = {};
  FUNCTION_T.student_shido_yotei.SWrange = function() {
    $('input[name=b_kikan]')
      .swipe('先月', () => {
        $('input[name=input1_dt]').val(dateslash(dtlmstart));
        $('input[name=input2_dt]').val(dateslash(dtlmlast));
      })
      .swipe('今月末まで', () => {
        $('input[name=input1_dt]').val(dateslash(dt));
        $('input[name=input2_dt]').val(dateslash(dtlast));
      })
      .swipe('講習終了まで', () => {
        $('input[name=input1_dt]').val(dateslash(dt));
        $('input[name=input2_dt]').val(NX.VAR.koshu_kikan['終了']);
      });
  };
  FUNCTION_T.teacher_list_body = {};
  FUNCTION_T.teacher_list_body.saveTeacherInfo = function() {
    const parentframe = $('frame[name=teacher_list_head]', parent.document)?.contents();
    //フレームがなかったら終了
    if (!parentframe) return;

    const isAllBlank = parentframe
      .find('[name=shido_tenpo_cd],[name=teacher_cd],[name=teacher_kt]')
      .toArray()
      .every(elem => $(elem).val() == '');
    const isjyotai_cb1 = parentframe.find('[name=jyotai_cb]').val() == '1';
    const tenpo_cd = parentframe.find('select[name=main_tenpo_cd]').val();
    const isSave = (JSON.parse(localStorage.getItem('infoSave')) || {})[tenpo_cd];
    if (isSave && isAllBlank && isjyotai_cb1) {
      const $parsedTable = $('table').clone();

      //特記事項は削除
      const eqName = $parsedTable.getTableHead()['講師名'];
      $parsedTable.find('tr').each(function() {
        const nameTD = $(this)
          .find('td')
          .eq(eqName);
        const parsedTxt = nameTD.text().replace(/\(.*?\)/g, '');
        nameTD.text(parsedTxt);
      });

      new teacherInfoClass().saveTable(tenpo_cd, $parsedTable);
    }
  };
  FUNCTION_T.teacher_list_body.showMemo = function() {
    if (myprofiles.getone({ showMemo: 0 }) == 1) {
      $('input[value="開く"]').each(function() {
        const teacher_cd = $(this)
          .attr('name')
          .replace('b', '');
        const input = $('<input>', { type: 'text' }).netzmemorize(teacher_cd);
        $('<td>')
          .append(input)
          .appendTo($(this).closest('tr'));
      });
    }
  };
  FUNCTION_T.teacher_toroku_input = {};
  FUNCTION_T.teacher_toroku_input.inputsupport = function() {
    $('input[name=toroku_tanto_nm]').netzpicker(['FromAナビ→', '塾講師ナビ→', 'おしごと発見→', '塾講師JAPAN→']);
    $('input[name=name_kt]').on('contextmenu', function() {
      $(this).valFunction(now => $NX(now).toKatakana());
      return false;
    });
    $('input[name=tel_no]').on('contextmenu', function() {
      $(this).valFunction(now => $NX(now).phoneformat());
      return false;
    });
    $('input[name=name_kg],input[name=name_kt]').on('contextmenu', function() {
      $(this).valReplace(' ', '　');
      return false;
    });
    $('input[name=name_kg],input[name=name_kt],input[name=tel_no],input[name=mail_address]').on('change', function() {
      $(this).valFunction(now => now.trim());
    });
  };
  FUNCTION_T.teacher_toroku_input.makezoommail = function() {
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

      //const gasurl = 'https://script.google.com/macros/s/AKfycbybfnv6-zjP60bp5Hj9ucFky_MrxUE2UDGGe1dQakb8lvZw5KY/exec';
      //doPost(gasurl, JSON.stringify(postdata));
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
      popmenut_F2.closemenu();
    }

    //メニュー内UI構築
    popmenut_F2.setContentFunction(function() {
      mailList.forEach(type => {
        $('<button>', {
          name: 'makemailbtn',
          class: 'nx',
          text: type,
          on: {
            click: () => showMailBody(type)
          }
        }).appendTo(this);
      });

      $('<button>', {
        class: 'nx offajax',
        text: '会議室作成',
        on: { click: createZoomMeeting }
      }).appendTo(this);
    });
  };
  /* eslint-enable */
  FUNCTION_T.moshikomi4_osusume_input = {};
  FUNCTION_T.moshikomi4_osusume_input.support = function() {
    // 条件に基づいて表示・非表示を切り替える
    const filterSelect = $('<select>', {
      on: {
        change: function() {
          const query = $(this).val();
          $('tr').each(function() {
            const $tr = $(this);
            const hasQuery = $tr.text().includes(query);
            $tr.toggle(hasQuery);
          });
        }
      }
    }).prependTo('body');
    // prettier-ignore
    ['小１','小２','小３','小４','小５','小６','中１','中２','中３','高校生'].forEach(elem =>
      $(`<option value="${elem}">${elem}</option>`).appendTo(filterSelect)
    );
  };
  FUNCTION_T.student_profile_mendan_input = {};
  FUNCTION_T.student_profile_mendan_input.notesaver = function() {
    const student_cd = $('[name=student_cd]').val();
    const menlog = new MenLog(student_cd);
    if (menlog.exsistCH())
      $('<i class="fas fa-sticky-note" style="position:fixed;right:0;top:0;color:#2a5caa"></i>')
        .appendTo('body')
        .on('click', () => {
          menlog.loadAll();
        });
    popmenut_F2.setContentFunction(function() {
      $('<button>', {
        type: 'button',
        text: 'ログ読み込み',
        class: 'nx',
        on: {
          click: () => {
            menlog.loadAll();
            popmenut_F2.closemenu();
          }
        }
      }).appendTo(this);
      $('<button>', {
        type: 'button',
        text: '削除',
        class: 'nx offdanger',
        on: {
          click: () => {
            menlog.delete();
            popmenut_F2.closemenu();
          }
        }
      }).appendTo(this);
      $('<button>', {
        type: 'button',
        text: '25春期履歴取得',
        class: 'nx offajax',
        on: {
          click: async () => {
            const data = await $.get(`${NX.CONST.host}/s/student_profile_mendan_input.aspx?student_cd=${student_cd}&nendo_season_cb=20254`);
            ['profile28', 'profile21', 'profile14', 'profile29'].forEach(id => {
              $(`[name=${id}]`).valAppend(
                $(data)
                  .find(`[name=${id}]`)
                  .val()
              );
            });
            popmenut_F2.closemenu();
          }
        }
      }).appendTo(this);
    });
    //$('textarea').textarearesizer();
    $('textarea').on('change', function() {
      menlog.writeText($(this));
    });
  };
  FUNCTION_T.student_renraku_list = {};
  FUNCTION_T.student_renraku_list.topbuttons = function() {
    const showRenrakubutton = myprofiles.getone({ showRenrakubutton: 0 });
    const student_cd = $('input[name=student_cd]').val();
    const studentMemo = $('<input>', { type: 'text', class: 'nx', size: '20' }).netzmemorize(student_cd);
    const headWrapper = $('<div>')
      .append(studentMemo)
      .prependTo('body');
    const tableWidth = $('table')['0'].clientWidth;
    const iframe = new IframeMakerEx({ iframeName: 'renraku_list', x: tableWidth + 20, y: 10, draggable: true, savePosition: false });

    //設定でOFFなら非表示
    if (showRenrakubutton == 0) headWrapper.hide();

    //新規入力ボタンを右クリックでトグル
    $('input[name=b_new][value="　新規入力　"]').on('contextmenu', () => {
      myprofiles.toggle('showRenrakubutton', [0, 1]);
      headWrapper.toggle();
      return false;
    });

    headWrapper.append('<br>');

    addIframeBtn([
      ['/s/student_renraku_input.aspx', '連絡'],
      ['/kanren/student_shido_yotei.aspx', '指導予定'],
      ['/tehai/tehai_kanren_list.aspx', '関連'],
      ['/jyuken/goukaku_input.aspx', '受験'],
      ['/student_data_input.aspx', '詳細'],
      ['/k/student_keiyaku_data.aspx', '契約'],
      ['/shingaku/student_shingaku_list.aspx', '講座'],
      ['/tehai/furikae_list.aspx', '振替'],
      ['/kanren/student_shido_kiroku_list.aspx', '報告']
    ]);
    $('<button>', {
      type: 'button',
      text: '関連P',
      on: {
        click: () => {
          relpop(student_cd);
        }
      }
    }).appendTo(headWrapper);
    $('<button>', {
      type: 'button',
      text: '指導予定（講習）',
      on: {
        click: () => {
          const student_cd = $('input[name=student_cd]').val();
          iframe.loadUrl(
            `${NX.CONST.host}/kanren/student_shido_yotei.aspx?student_cd=${student_cd}&input1_dt=${NX.DT.Koshu_START.ymd}&input2_dt=${NX.DT.Koshu_END.ymd}`
          );
        }
      }
    }).appendTo(headWrapper);
    headWrapper.append('<br>');

    addIframeBtn([
      ['/tehai/shido2_base_input.aspx', '基本ﾌﾞｰｽ'],
      ['/tehai/student_tehai_list.aspx', '手配'],
      ['/s/student_schedule_list.aspx', 'ｽｹｼﾞｭｰﾙ'],
      ['/text/text_list_body.aspx', 'ﾃｷｽﾄ'],
      ['/kanren/student_kaisu_list3.aspx', '規定'],
      ['/u/uriage_input.aspx', '売上'],
      ['/s/student_inout_list.aspx', '入退館'],
      ['/talk/talkmenu.aspx', 'ﾄｰｸ', { talk_type: 'student', personal_talk: 'true' }]
    ]);

    function addIframeBtn(array) {
      array.forEach(([url, text, args = {}]) => {
        iframe.makeButton(`${NX.CONST.host}${url}`, text, Object.assign(args, { student_cd: student_cd })).appendTo(headWrapper);
      });
    }
  };
  FUNCTION_T.student_renraku_list.F2menu = function() {
    const student_cd = $('input[name=student_cd]').val() || getparameter('student_cd');
    popmenut_F2.setContentFunction(function() {
      $('<button>', {
        type: 'button',
        text: 'スケ（ブース形式）【講習】',
        on: {
          click: () => {
            const param = {
              student_cd,
              input1_dt: new ExDate().compare(NX.VAR.koshu_kikan['開始'])['forwarddate'].as('yyyy/mm/dd'),
              input2_dt: new ExDate().compare(NX.VAR.koshu_kikan['終了'])['forwarddate'].as('yyyy/mm/dd')
            };
            window.open(`${NX.CONST.host}/kanren/student_shift.aspx?${$.param(param)}`);
            popmenut_F2.closemenu();
          }
        }
      }).appendTo(this);
      $('<button>', {
        type: 'button',
        text: 'スケ（ブース形式）【翌月末】',
        on: {
          click: () => {
            const param = {
              student_cd,
              input1_dt: new ExDate().as('yyyy/mm/dd'),
              input2_dt: new ExDate()
                .aftermonths(2)
                .setDateTry(false, false, 0)
                .as('yyyy/mm/dd')
            };
            window.open(`${NX.CONST.host}/kanren/student_shift.aspx?${$.param(param)}`);
            popmenut_F2.closemenu();
          }
        }
      }).appendTo(this);
      $('<button>', {
        type: 'button',
        text: '仮会員証',
        on: {
          click: () => {
            window.open(`${NX.CONST.host}/s/student_studyplan_list.aspx?student_cd=${student_cd}`);
            popmenut_F2.closemenu();
          }
        }
      }).appendTo(this);
    });
  };
  FUNCTION_T.student_renraku_input = {};
  FUNCTION_T.student_renraku_input.inputsupport = function() {
    $('select[name=jyotai_cb]')
      .swipe('次回本日９時', () => {
        $('#next_dt').val(NX.DT.today.slash);
        $('#next_tm').val('21:00');
      })
      .swipe('次回明日９時', () => {
        $('#next_dt').val(NX.DT.tomorrow.slash);
        $('#next_tm').val('21:00');
      })
      .swipe('次回明後日９時', () => {
        $('#next_dt').val(NX.DT.dayaftertomorrow.slash);
        $('#next_tm').val('21:00');
      })
      .swipe('処理済', () => {
        $('select[name="jyotai_cb"]').val('3');
        $('[name=b_submit]').trigger('click');
      });
    $('input[name="title_nm"]').on('contextmenu', function() {
      $(this).val(localStorage.getItem('renrakutemptitle') || '');
      return false;
    });
    $('textarea[name=naiyo_nm]').on('contextmenu', function() {
      $(this).val(localStorage.getItem('renrakutempcontent') || '');
      return false;
    });
  };
  FUNCTION_T.student_renraku_input.notesaver = function() {
    const renrakuSaver = new Saver('renrakuNote');
    $('[name=naiyo_nm]')
      .on('change', function() {
        renrakuSaver.save({ ['naiyo_nm']: $(this).val() });
      })
      .on('contextmenu', function() {
        const naiyo_nm = renrakuSaver.getone({ naiyo_nm: '' });
        if (naiyo_nm !== '') $(this).val(naiyo_nm);
        return false;
      });
    const rawBtn = $('input[name=b_submit');
    $('<button>', {
      type: 'button',
      text: '登録',
      on: {
        click: () => {
          renrakuSaver.delete('naiyo_nm');
          rawBtn.trigger('click');
        }
      }
    }).insertAfter(rawBtn);
    rawBtn.hide();
  };
  FUNCTION_T.start_input_kintai = {};
  FUNCTION_T.start_input_kintai.auto = function() {
    $('#netsu0,#nodo0,#seki0,#zutsu0,#okan0,#hakike0').prop('checked', true);
    $('#cb_w').prop('checked', true);
  };
  FUNCTION_T.student_studyplan_list = function() {
    const studentcd = $('input[name=student_cd]').val();
    const studentname = $(`td:contains("${studentcd}")`)
      .next()
      .text();
    const cbname = $(`td:contains("${studentcd}")`)
      .prev()
      .text();
    $('body')
      .html('')
      .append('<div name="barcodein" style="position:absolute;index:1;">')
      .append('<div name="barcodeout" style="position:absolute;index:1;">')
      .append('<div name="personalfolder" style="position:absolute;index:1;">');
    $('div[name=barcodein]')
      .css('top', 80)
      .css('left', 80)
      .barcode(pluscheckdigit(`N${studentcd}1`), 'code39', {
        barWidth: 2,
        barHeight: 50
      })
      .prepend(`<span style="border-style:double">仮会員証</span><br><br><u>生徒名：${studentname}</u><br><br><p>入館時用</p>`);
    $('div[name=barcodeout]')
      .css('top', 80)
      .css('left', 540)
      .barcode(pluscheckdigit(`N${studentcd}9`), 'code39', {
        barWidth: 2,
        barHeight: 50
      })
      .prepend(`<u>生徒CD：${studentcd}</u><br><br><u>教室：${cbname}校</u><br><br><p>退館時用</p>`);
    $('div[name=personalfolder]')
      .css('top', 300)
      .css('left', 120)
      .prepend(
        `<p style="display: inline-flex;width:5.8cm;height:0.9cm;border:solid 2px black;font-size:28px;font-weight:bold;align-items: center;justify-content: center;">${studentname}</p>`
      )
      .append(
        `<p style="display: inline-flex;writing-mode: vertical-rl;width:1.4cm;height:9.7cm;border:solid 2px black;font-family:'ヒラギノ明朝';font-size:28px;align-items: center;justify-content: center;">${studentname}  (${studentcd})</p>`
      );
  };
  FUNCTION_T.shido_yotei_edit = {};
  FUNCTION_T.shido_yotei_edit.inputsupport = function() {
    $('input[name=shido_jikan]').netzpicker([45]);
    const $bikouInput = $('input[name=bikou_nm]');
    const captrewrite = param => {
      const nowbikou = $bikouInput.val().replace(/[.*]/, '');
      const addstr = {
        '[代理指導]': '[代理指導]',
        '[時間変更]': '[時間変更]',
        '[●/●]': `[${new ExDate($('input[name=shido_dt]').val()).as('m/d')}]`
      };
      $bikouInput.val(nowbikou + addstr[param]);
    };
    $bikouInput
      .swipe('[代理指導]', () => captrewrite('[代理指導]'))
      .swipe('[時間変更]', () => captrewrite('[時間変更]'))
      .swipe('[●/●]', () => captrewrite('[●/●]'));
  };
  FUNCTION_T.student_mendan_input = {};
  FUNCTION_T.student_mendan_input.F2menu = function() {
    //GASでzoom会議室作成をする
    popmenut_F2.setContentFunction(function() {
      const student_cd = $('input[name=student_cd]').val();
      $('<button>', {
        type: 'button',
        class: 'nx offprimary',
        text: '面談組案内文',
        on: {
          click: () => {
            const date = new ExDate($('#mendan_dt').val() + ' ' + $('#mendan_tm').val());
            const dateStr = $NX(`${date.as('m月d日（aaa） H:MM')}～（最大６０分）`).toFullWidth();
            const way = $('input[name=mendan_way_cb]:checked').val();
            $('<textarea id="invite" rows="10" cols="80"></textarea>')
              .appendTo('body')
              .val(LCT.TEMPLATE.Meeting[way](dateStr));
            clipper(LCT.TEMPLATE.Meeting[way](dateStr));
            PX_Toast('クリップボードにコピーしました');
            const note = {
              1: '★日程案内済',
              2: '日程案内済※要zoomURL'
            };
            $(`[name=bikou_nm]`).valPrepend(note[way]);
            $('[name=shido_data_flg]').prop('checked', true);
          }
        }
      }).appendTo(this);
      $('<button>', {
        type: 'button',
        class: 'nx offajax',
        text: 'Zoom作成',
        on: {
          click: () => {
            const mendt = new ExDate($('#mendan_dt').val());
            const topic = `三者面談【${$('.studentLinker').text()}】`;
            const startdt = `${mendt.as('yyyy-mm-dd')}T${$('#mendan_tm').val()}:00`;
            const duration = parseInt($('[name=mendan_jk]').val()) || 50;
            //GASのURL　'https://script.google.com/macros/s/AKfycbyQp5KhAPwsNWdtPjQqKvOxWAJu9eiTZs5tEjEL8z4-ULncAxGeVrSspl71KUBGYOyT/exec'
            $.post(NX.ENDPOINT.zoomMaker, { topic, startdt, duration }, function(data) {
              console.log('Response from Server', data);
              const { join_url, id, password } = JSON.parse(JSON.stringify(data));
              const meetingID = `${String(id).slice(0, 3)} ${String(id).slice(3, 7)} ${String(id).slice(7, 11)}`;
              const template = `【１対１ネッツ】オンライン面談ログイン方法のご案内
お世話になります。ネッツです。

オンライン面談へのご協力、誠にありがとうございます。
面談日が近づいてまいりましたので当日のご案内を差し上げます。
当日は、現在の学習状況のご報告と今後の学習計画についてご相談をさせていただく予定です。

■日時: ${$NX(mendt.as('m月d日（aaa） ') + $('#mendan_tm').val()).toFullWidth()}～（最大６０分）

■Zoomミーティング情報
Zoomミーティングに参加する
${join_url}

ミーティングID: ${meetingID}
パスコード: ${password}

※ご本人様と一緒にご参加をお願いいたします。
 
ご都合が悪い場合には、アプリもしくは現生徒専用フリーダイヤル（0120-689-121）までご連絡ください。

${LCT.TEMPLATE.Mail.howtoZoom}

当日はどうぞよろしくお願いいたします。

１対１ネッツ
辰野`;
              $('<textarea id="invite" rows="10" cols="80"></textarea>')
                .appendTo('body')
                .val(template);
              clipper(template);
              PX_Toast('クリップボードにコピーしました');
              $(`[name=bikou_nm]`)
                .valReplace('日程案内済※要zoomURL', '')
                .valPrepend('★URL送付済');
              $('#url_dt').val(join_url);
              $('#meeting_id').val(meetingID);
              $('#passcode').val(password);
              /* eslint-enable */
            });
          }
        }
      }).appendTo(this);
      $('<span>→</span>').appendTo(this);
      $('<button>', {
        type: 'button',
        class: 'nx offprimary',
        text: 'メール送付',
        on: {
          click: () => {
            const clip = $('#invite').length == 1 ? 'true' : 'false';
            const param = {
              student_cd: $('input[name=student_cd]').val(),
              limit: $('#mendan_dt').val(),
              clip
            };
            window.open(`${NX.CONST.host}/s/student_mailsend_input.aspx?${$.param(param)}`);
            popmenut_F2.closemenu();
          }
        }
      }).appendTo(this);
      $('<br>').appendTo(this);
      if (myprofiles.getone({ myname: '' }) == '辰野　由弥') {
        $('<button>', {
          type: 'button',
          class: 'nx offajax',
          text: 'outlook予定表に追加',
          on: {
            click: () => {
              const startEXDT = new ExDate($('#mendan_dt').val());
              const topic = `現生徒面談【${$('.studentLinker').text()}】`;
              const startdt = `${startEXDT.as('yyyy-mm-dd')}T${$('#mendan_tm').val()}:00`;
              const duration = $('select[name=mendan_jk] option:selected').val();
              $.post(
                'https://script.google.com/macros/s/AKfycbwwG54-D3VbMrrH9p31vQa44vk5MY7piaVhg0NYfoWdXWOCWLlQu3eXbPoVZ16hPd6u5A/exec',
                { onlymakeschedule: 'true', topic, startdt, duration },
                PX_Toast('POST完了')
              );
            }
          }
        }).appendTo(this);
      }
      //面談履歴チェック用
      $('<button>', {
        type: 'button',
        class: 'nx offsecondary',
        text: '履歴入力済',
        on: {
          click: () => {
            $('[name=bikou_nm]')
              .valReplace('▽履歴未入力')
              .valReplace('★日程案内済')
              .valReplace('★URL送付済')
              .valPrepend('■');
            $('#edt_cb').prop('checked', false);
            $('[name=b_submit]').trigger('click');
          }
        }
      }).appendTo(this);
      $('<button>', {
        type: 'button',
        class: 'nx',
        text: '指導予定',
        on: {
          click: () => {
            if (!student_cd) return false;
            const iframe = new IframeMakerEx({ iframeName: 'yotei', x: 800, y: 10, draggable: true }).loadUrl(
              `${NX.CONST.host}/kanren/student_shido_yotei.aspx?student_cd=${student_cd}`
            );
            popmenut_F2.closemenu();
          }
        }
      }).appendTo(this);
    });
  };

  FUNCTION_T.teian_list_body = {};
  FUNCTION_T.teian_list_body.F2menu = function() {
    popmenut_F2.setContentFunction(function() {
      const listNXTable = $NX('table').makeNXTable({ omitSubrow: true });
      const sortByState = function(a, b) {
        const list = ['未組', '', '日程調整', '面談待', '保留', '完了', '申込無'];
        return list.indexOf(a) - list.indexOf(b);
      };
      const isBlank = val => val != '';
      const analysisTable = listNXTable
        .clone()
        .filter('教室', isBlank)
        .analyze('状態', ['状態', 'count', '数'])
        .sort('状態', 1, sortByState)
        .makeTotalRow();
      $(analysisTable.export('table')).appendTo(this);
    });
  };
  FUNCTION_T.teian_list_body.appendSwipeButton = function() {
    $('input[value="開く"]').each(function() {
      //prettier-ignore
      const student_cd = $(this).attr('name').replace('b', '');
      $(this).on('contextmenu', function() {
        window.open(`${NX.CONST.host}/s/student_renraku_list.aspx?student_cd=${student_cd}`);
        return false;
      });
    });
  };
  FUNCTION_T.teian_list_body.teianmemo = function() {
    const menSaver = new Saver('mendankanri');
    //td右クリックしたら、そのテキストを見込金額として保存
    //すげーニッチだけど、強力
    // eslint-disable-next-line
    if (false) {
      $('td').on('contextmenu', function() {
        var stcd = $(this)
          .parents('tr')
          .attr('id');
        var mendankanri = JSON.parse(localStorage.getItem('mendankanri')) || {};
        mendankanri[stcd] = mendankanri[stcd] || {};
        mendankanri[stcd]['prospect'] = $(this).text();
        localStorage.setItem('mendankanri', JSON.stringify(mendankanri));
        loadMendanData();
        return false;
      });
    }
    popmenut_F2.setContentFunction(function() {
      //メモの表示をトグル
      $('<button>', {
        type: 'button',
        class: 'nx',
        on: {
          click: function() {
            myprofiles.toggle('showMeetingNote', [0, 1]);
            $(this).trigger('change');
          },
          change: function() {
            const showMN = myprofiles.getone({ showMeetingNote: 0 }) == 1;
            $(this)
              .text(`面談メモ${showMN ? 'ON' : 'OFF'}`)
              .toggleClass('offout', !showMN);
          }
        }
      })
        .appendTo(this)
        .trigger('change');
      $('<button>', {
        type: 'button',
        class: 'nx',
        text: '任意のデータ保存',
        on: {
          click: function() {
            const dataname = prompt('データ名を入力', 'mendandata');
            const eq = prompt('書き込みたいtdのeqは？', 10);
            popmenut_F2.closemenu();
            if (!eq || !dataname) return false;
            const fullLength = $('tr:eq(1)').find('td').length;
            $('tr:gt(0)').each(function(e) {
              //prettier-ignore
              const student_cd = $(this).attr('id').replace('tr', '');
              if (!student_cd || $(this).find('td').length != fullLength) return true;
              const tdValue = $(this).findTdGetTxt(eq);
              menSaver.deepsave({ [student_cd]: { [dataname]: tdValue } });
            });
            PX_Toast('保存完了');
          }
        }
      }).appendTo(this);
      $('<button>', {
        type: 'button',
        class: 'nx',
        text: 'メモ一括書込',
        on: {
          click: function() {
            const dataname = prompt('データ名を入力', 'mendandata');
            const memoStr = prompt('メモを入力');
            popmenut_F2.closemenu();
            if (!dataname) return false;
            const fullLength = $('tr:eq(1)').find('td').length;
            $('tr:gt(0)').each(function(e) {
              //prettier-ignore
              const student_cd = $(this).attr('id').replace('tr', '');
              if (!student_cd || $(this).find('td').length != fullLength) return true;
              menSaver.deepsave({ [student_cd]: { [dataname]: memoStr || '' } });
            });
            PX_Toast('削除完了');
          }
        }
      }).appendTo(this);
      $('<br>').appendTo(this);
      $('<button>', {
        type: 'button',
        class: 'nx',
        text: '面談担当者一括設定',
        on: {
          click: () => {
            popmenut_F2.closemenu();
            const teacher_cd = prompt('【社員cd】→年度→季節\n社員cdを入れてください');
            if (!teacher_cd) return false;
            const teacherName = new NXEmp(teacher_cd).getName();
            if (!teacherName) {
              window.alert(`対象者が存在しません ${teacher_cd}`);
              return false;
            }
            if (!confirm(`社員名は${teacherName}です。よろしいですか？`)) return false;

            const pageNendoSeason = $('[name=nendo_season_cb]').val();
            const [suggestNendo = NX.VAR.nendo, suggestSeason_cb = NX.VAR.season_cb] = [pageNendoSeason.slice(0, 4), pageNendoSeason.slice(4)];
            const inputNendo = prompt('社員cd→【年度】→季節\n年度を入力してください', suggestNendo);
            if (!inputNendo) return false;
            const inputSeason_cb = prompt('【社員cd】→年度→【季節】\nseason_cbを入力してください', suggestSeason_cb);
            if (!inputSeason_cb) return false;
            const inputLength = prompt('面談時間は何分にしますか', 50);
            if (new NXEmp(String(teacher_cd)).getCd() == String(teacher_cd)) {
              $('tr').each(function() {
                const $select = $(this).find('select');
                if (!($select.attr('name') || '').startsWith('d')) return true;
                const student_cd = $select.attr('name').replace('d', '');
                chrome.runtime.sendMessage({
                  opennetzbackEx: `${NX.CONST.host}/s/student_mendan_input.aspx?nendo_season_cb=${inputNendo}${inputSeason_cb}&student_cd=${student_cd}&mode=autoChange&teacher_cd=${teacher_cd}&mendan_jk=${inputLength}`
                });
              });
            }
          }
        }
      }).appendTo(this);
      /*
      $('<button>', {
        type: 'button',
        class: 'nx',
        text: '月謝固定',
        on: {
          click: () => {
            popmenut_F2.closemenu();
            const pageNendoSeason = $('[name=nendo_season_cb]').val();
            const [suggestNendo = NX.VAR.nendo, suggestSeason_cb = NX.VAR.season_cb] = [pageNendoSeason.slice(0, 4), pageNendoSeason.slice(4)];
            const inputNendo = prompt('【年度】→季節\n年度を入力してください', suggestNendo);
            if (!inputNendo) return false;
            const inputSeason_cb = prompt('年度→【季節】\nseason_cbを入力してください', suggestSeason_cb);
            if (!inputSeason_cb) return false;
            $('tr').each(function() {
              const $select = $(this).find('select');
              if (!($select.attr('name') || '').startsWith('d')) return true;
              const student_cd = $select.attr('name').replace('d', '');
              chrome.runtime.sendMessage({
                opennetzbackEx: `${NX.CONST.host}/s/student_mendan_input.aspx?nendo_season_cb=${inputNendo}${inputSeason_cb}&student_cd=${student_cd}&mode=autoChange&mendan_status_cb=d&bikou_nm=月謝固定&mendan_tm=9:00&mendan_dt=2025/10/01&mendan_jk=30`
              });
            });
          }
        }
      }).appendTo(this);
      */
      $('<button>', {
        type: 'button',
        class: 'nx offajax',
        text: '24高３年明け追加取得',
        on: {
          click: function() {
            popmenut_F2.closemenu();
            const menSaver = new Saver('mendankanri');
            $('select').each(async function() {
              //prettier-ignore
              const student_cd = $(this).attr('name').replace('d', '');
              const feeData = await new AjaxStudentInfo().fee(student_cd);
              const feeLast = (
                (feeData.nxtable.sumifs('売上額', ['売上年月', '2025/01'], ['科目', '追加指導']) +
                  feeData.nxtable.sumifs('売上額', ['売上年月', '2025/02'], ['科目', '追加指導'])) /
                1.1
              ).toLocaleString();
              const fee2412 = (feeData.nxtable.sumifs('売上額', ['売上年月', '2024/12'], ['科目', '月謝']) / 1.1).toLocaleString();
              const fee2411 = (feeData.nxtable.sumifs('売上額', ['売上年月', '2024/11'], ['科目', '月謝']) / 1.1).toLocaleString();
              menSaver.deepsave({ [student_cd]: { ['feeLast']: feeLast } });
              menSaver.deepsave({ [student_cd]: { ['fee2412']: fee2412 } });
              menSaver.deepsave({ [student_cd]: { ['fee2411']: fee2411 } });
            });
          }
        }
      }).appendTo(this);
      $('<button>', {
        type: 'button',
        class: 'nx offajax',
        text: '2502月謝取得',
        on: {
          click: function() {
            popmenut_F2.closemenu();
            const menSaver = new Saver('mendankanri');
            $('select').each(async function() {
              //prettier-ignore
              const student_cd = $(this).attr('name').replace('d', '');
              const feeData = await new AjaxStudentInfo().fee(student_cd);
              const fee2502 = (feeData.nxtable.sumifs('売上額', ['売上年月', '2025/02'], ['科目', '月謝']) / 1.1).toLocaleString();
              menSaver.deepsave({ [student_cd]: { ['fee2502']: fee2502 } });
            });
          }
        }
      }).appendTo(this);
      $('<button>', {
        text: 'プロファイル取得',
        type: 'button',
        class: 'nx offajax',
        on: {
          click: function() {
            popmenut_F2.closemenu();
            const menSaver = new Saver('mendankanri');
            $('select').each(async function() {
              //prettier-ignore
              const student_cd = $(this).attr('name').replace('d', '');
              const profile = await new AjaxStudentInfo().profile(student_cd);
              menSaver.deepsave({ [student_cd]: { ['nowRank']: profile.profile10 } });
            });
          }
        }
      }).appendTo(this);

      /*
            $('<button>', { type: 'button', class: 'nx offajax', text: '24高３規定取得' })
        .appendTo(this)
        .on('click', function() {
          popmenut_F2.closemenu();
          const menSaver = new Saver('mendankanri');
          $('select').each(async function() {
            const student_cd = $(this)
              .attr('name')
              .replace('d', '');
            const kiteiData = await new AjaxStudentInfo().kitei(student_cd);
            const kitei2412 = kiteiData.nxtable.xlookup(yearmonth.replace('/', ''), '年月', '１対１指導（50分）_2');
            menSaver.deepsave({ [student_cd]: { ['kitei2412']: kitei2412 } });
          });
        });
    $('<button>', { text: '23夏期講習売上取得' })
      .appendTo(this)
      .on('click', function() {
        popmenut_F2.closemenu();
        const menSaver = new Saver('mendankanri');
        $('select').each(async function() {
          const student_cd = $(this)
            .attr('name')
            .replace('d', '');
          const fee = await new AjaxStudentInfo().fee(student_cd, '2023/08', '講習料');
          menSaver.deepsave({ [student_cd]: { ['fee23SM']: fee.fee } });
        });
      });
      */
    });
    //見込みメモ入力
    if (myprofiles.getone({ showMeetingNote: 0 }) == 1) {
      const noteList = [
        ['メモ', 'subnote'],
        ['初期見込', 'prospect'],
        ['前月謝', 'feeBefore'],
        ['後月謝', 'feeAfter']
      ].reverse();
      /*
        ['HS3Last', 'feeLast'],
        ['HS3-12', 'fee2412'],
        ['HS3-11', 'fee2411'],
        ['規定', 'kitei2412'],
        ['現状ランク', 'nowRank']
      
      */
      popmenut_F2.setContentFunction(function() {
        const $isNotesShow_Btns = $('<div>', {
          class: 'nxChecks'
        }).appendTo(this);
        noteList.forEach(function([capt, key]) {
          $(`<input type="checkbox" id="${key}" name="noteListToggle" checked /><label for="${key}">${capt}</label>`).appendTo($isNotesShow_Btns);
        });
      });
      $(document).on('click', '[name=noteListToggle]', function() {
        const dataLabel = $(this).attr('id');
        const isChecked = $(this).prop('checked');
        $(`td[data-label="${dataLabel}"]`).each(function() {
          $(this).toggleClass('unshown', !isChecked);
        });
      });
      $.fn.makeNoteTD = function(studentcd, noteArray) {
        const $this = this;
        noteArray.forEach(function([capt, key]) {
          $this.after(`<td rowspan="${$this.attr('rowspan') || '1'}" class="dataeditable" data-studentcd="${studentcd}" data-label="${key}"></td>`);
        });
      };
      const $notePlace = $('tr:contains("CH")')
        .find('td')
        .eq(4);
      noteList.forEach(function([capt, key]) {
        $notePlace.after(`<td data-label="${key}">${capt}</td>`);
      });
      const $trs = $('tr:gt(0)');
      //prettier-ignore
      $trs.each(function(e) {
        const $tr = $(this);
        const isLast = e + 1 == $trs.length;
        const isMaintr = $tr.find('input[value="開く"]').length == 1;
        if (!isLast && !isMaintr) return true;
        const studentcd =$tr.find('select')?.attr('name')?.replace('d','') || '';
        const $targettd = $tr.find('td').eq(4);
        $targettd.makeNoteTD(studentcd, noteList);
      });

      loadMendanData();

      $(document).on('dblclick', '.dataeditable', function() {
        const $this = $(this);
        const inputtxt = prompt('Input text', $this.text() || '');
        if (inputtxt === null) return false;
        const student_cd = $this.attr('data-studentcd');
        const data_label = $this.attr('data-label');
        menSaver.deepsave({ [student_cd]: { [data_label]: inputtxt } });
        $this.text(inputtxt);
      });
    }
    function loadMendanData() {
      $('.dataeditable').each(function() {
        const $this = $(this);
        const student_cd = $this.attr('data-studentcd');
        const data_label = $this.attr('data-label');
        $this.text(menSaver.getone({ [student_cd]: {} })[data_label] || '');
      });
    }
  };
  FUNCTION_T.shido_yotei_input = {};
  FUNCTION_T.shido_yotei_input.validation = function() {
    $('input[name=select_day],input[name=kanren_cd],input[name^=shido_tm],input[name=shido_jikan]')
      .on('change', () => {
        const hasKanren = $('input[name=kanren_cd]:checked').val() != undefined;
        const hasDate = $('input[name=select_day]:checked').length > 0;
        const hasHour = $('input[name=shido_tm_h]').val() != '';
        const hasMinute = $('input[name=shido_tm_m]').val() != '';
        const hasTime = $('input[name=shido_jikan]').val() != '';
        if (hasKanren && hasDate && hasHour && hasMinute && hasTime) {
          $('input[value="登録"]').prop('disabled', false);
        } else {
          $('input[value="登録"]').prop('disabled', true);
        }
      })
      .eq(0)
      .trigger('change');
  };
  FUNCTION_T.shido_yotei_input.tracer = function() {
    ['日', '月', '火', '水', '木', '金', '土'].forEach((day, index) => {
      $(`td:contains("${day}")`).each(function() {
        const $dayTD = $(this);
        if ($dayTD.text() != day) return true;
        $dayTD.on('click', function() {
          $dayTD
            .closest('table')
            .find('tr')
            .each(function() {
              const $target = $(this)
                .find('td')
                .eq(index)
                .find('input[type=checkbox]');
              $target.prop('checked', !$target.prop('checked'));
            });
        });
      });
    });
  };
  FUNCTION_T.shido_yotei_input.F2menu = function() {
    popmenut_F2.setContentFunction(function() {
      $('<button>', {
        type: 'button',
        class: 'nx',
        text: 'トリセツ',
        on: {
          click: () => {
            NXsetValues([
              ['select[name=tenpo_cd]', '7004'],
              ['[name=shido_jikan]', '20'],
              ['[name=pt_jk]', '0'],
              ['select[name=shido_cb]', '9'],
              ['[name=bikou_nm]', 'NALUトリセツ']
            ]);
            popmenut_F2.closemenu();
          }
        }
      }).appendTo(this);
      $('<button>', {
        type: 'button',
        class: 'nx',
        text: '1on1',
        on: {
          click: () => {
            NXsetValues([
              ['[name=shido_jikan]', '10'],
              ['[name=pt_jk]', '0'],
              ['select[name=shido_cb]', '9'],
              ['[name=bikou_nm]', '1on1']
            ]);
            popmenut_F2.closemenu();
          }
        }
      }).appendTo(this);
      $('<button>', {
        type: 'button',
        class: 'nx lazgreen',
        text: 'Div志望校別類題',
        on: {
          click: () => {
            NXsetValues([
              ['[name=kanren_cd]', ['']],
              ['[name=tenpo_cd]', '3416'],
              ['[name=shido_jikan]', '45'],
              ['[name=pt_jk]', '0'],
              ['select[name=shido_cb]', '2'],
              ['[name=bikou_nm]', 'Diverse志望類題']
            ]);
            popmenut_F2.closemenu();
          }
        }
      }).appendTo(this);
    });
  };
  FUNCTION_T.teian_shukei_tenpo = {};
  FUNCTION_T.schedule_input_check = {};
  FUNCTION_T.schedule_input_check.inputsupport = function() {
    $('input[name=b_reload]')
      .swipe('講習期間', () => {
        $('input[name=input1_dt]').val(NX.VAR.koshu_kikan['開始']);
        $('input[name=input2_dt]').val(NX.VAR.koshu_kikan['終了']);
        $('input[name=b_reload]').trigger('click');
      })
      .swipe('未入力のみ表示', () => {
        $('tr:not(:contains("入力"))').remove();
        const count = $(`td:contains("${myprofiles.getone({ mybasename: '薬院' })}")`).length;
        $('input[name=b_reload]').after(count + '件');
      });
  };
  FUNCTION_T.kouza_enshu_jyuko_list = {};
  FUNCTION_T.kouza_enshu_jyuko_list.F2menu = function() {
    popmenut_F2.setContentFunction(function() {
      const getdata = {};
      $('input[type=hidden]').each(function() {
        getdata[$(this).attr('name')] = $(this).val();
      });
      $('<button>', {
        text: '名簿作成',
        on: {
          click: function() {
            $('table,div').hide();
            $('input[name=b_jyuko_list]')
              .get()
              .reverse()
              .each(function(e) {
                //prettier-ignore
                const functionid = $(this).attr('onclick').getStrBetween("'", "'");
                getdata['shido_tm'] = functionid;
                const iframemaker = new IframeMaker('frame_' + e);
                iframemaker
                  .openurl(`${NX.CONST.host}/shingaku/enshu_shido_list.aspx?${$.param(getdata)}`)
                  .getdivobject()
                  .css('margin', '40px')
                  .css('page-break-after', 'always')
                  .children('iframe')
                  .attr('frameborder', 0);
              });
          }
        }
      }).appendTo(this);
    });
  };
  FUNCTION_T.student_info_input = {};
  FUNCTION_T.student_info_input.template = function() {
    popmenut_F2.setContentFunction(function() {
      $('<button>', {
        text: '長期目標テンプレ',
        on: {
          click: () => {
            $('textarea[name=mokuhyo1_nm]').val(LCT.TEMPLATE.Student.future);
            popmenut_F2.closemenu();
          }
        }
      }).appendTo(this);
      $('<button>', {
        text: '基本情報テンプレ',
        on: {
          click: () => {
            $('textarea[name=student_info_detail_nm]').val(LCT.TEMPLATE.Student.kihoninfo);
            popmenut_F2.closemenu();
          }
        }
      }).appendTo(this);
    });
  };

  FUNCTION_T.index_system = {};
  FUNCTION_T.index_system.dashboard = function() {
    class DashMan {
      constructor() {
        const _this = this;
        this.LS = JSON.parse(localStorage.getItem('DashboardData')) || {};
        this.const = {
          todayClass: new ExDate(),
          today: new ExDate().as('yyyy-mm-dd'),
          todayMD: new ExDate().as('mm/dd'),
          yesterdayMD: new ExDate().afterdays(-1).as('mm/dd'),
          biggOfMonth: new ExDate().setDateTry(null, null, 1).as('yyyy-mm-dd')
        };
        this.profile = {
          mynumber: myprofiles.getone({ mynumber: '000231' }),
          mybase: myprofiles.getone({ mybase: '3401' }),
          myarea: myprofiles.getone({ myarea: 'b3403' }),
          nowgroup: 'c3400',
          mybasename: myprofiles.getone({ mybasename: '広島駅前' })
        };
        this.UI = {
          wrap: {
            menu: $('<div class="pxdb_menu"></div>'),
            head: $('<div class="pxdb_head noselectable"></div>')
          },
          menu: {
            inner: $('<div></div>')
          },
          head: {
            innder: $('<div></div>')
          },
          dashboard: {
            online: $('<details class="pxdb_infochip" style="width:calc(100% - 0.5rem);"><summary style="display:block">OL申込</summary></details>')
          },
          page: {
            Dashboard: $('<div class="pxdb_main" page="Dashboard" order="1"></div>'),
            Unit: $('<div class="unshown pxdb_main" page="Unit" order="4"></div>'),
            Management: $('<div class="unshown pxdb_main" page="Management" order="7"></div>'),
            Tasks: $('<div class="unshown pxdb_main" page="Tasks" order="8"></div>'),
            AsCoach: $('<div class="unshown pxdb_main" page="AsCoach" order="9"></div>'),
            SeasonalLog: $('<div class="unshown pxdb_main" page="SeasonalLog" order="11"></div>'),
            Diverse: $('<div class="unshown pxdb_main" page="Diverse" order="12" />'),
            Marathon: $('<div class="unshown pxdb_main" page="Marathon" order="13" />'),
            Sales: $('<div class="unshown pxdb_main" page="Sales" order="14"></div>'),
            Configure: $('<div class="unshown pxdb_main" page="Configure" order="15"></div>'),
            Function: $('<div class="unshown pxdb_main" page="Function" order="16"></div>')
          },
          DashItem: {
            Contract: {
              order: 2,
              class: new pxdbItembox({
                header: true,
                headerTxt: 'Contract',
                footer: true,
                //progBar: true,
                addClass: 'noselectable small',
                reloadTarget: 'getContract'
              })
            },
            Cancel: {
              order: 3,
              class: new pxdbItembox({
                header: true,
                headerTxt: 'Rescission',
                addClass: 'noselectable small',
                reloadTarget: 'getCancel'
              })
            },
            Diverse: {
              order: 4,
              class: new pxdbItembox({
                header: true,
                headerTxt: 'Diverse',
                footer: true,
                addClass: 'noselectable small',
                reloadTarget: 'getDiverse'
              })
            },
            GroupOriginal: {
              order: 5,
              class: new pxdbItembox({
                header: true,
                headerTxt: 'Customized',
                footer: true,
                addClass: 'noselectable midium',
                reloadTarget: 'getLecture'
              })
            },
            Spacer: {
              order: 8,
              dom: $('<div>', { class: 'pxdbItembox spacer' })
            },
            MyTask: {
              order: 9,
              class: new pxdbItembox({
                header: true,
                headerTxt: 'MyTask',
                bodyScrollY: true,
                footer: true,
                footerAlignment: 'right',
                addClass: 'noselectable half',
                reloadTarget: 'getMyTask'
              })
            },
            MyUnit: {
              order: 10,
              class: new pxdbItembox({
                header: true,
                headerTxt: 'MyUnit',
                bodyScrollY: true,
                addClass: 'noselectable half',
                reloadTarget: 'getMyUnit'
              })
            },
            Spacer2: {
              order: 11,
              dom: $('<div>', { class: 'pxdbItembox spacer' })
            },
            Application: {
              order: 12,
              class: new pxdbItembox({
                header: true,
                headerTxt: 'Block Cont.',
                bodyScrollY: true,
                addClass: 'noselectable half',
                reloadTarget: 'getTodayApplication'
              })
            }
          },
          HeadItem: {
            title: $('<div style="font-size:1.5rem;line-height:2" class="pagetitle fg-10">Dashboard</div>'),
            notify: $('<div style="border-left:solid 2px white;padding:0 0.5rem"></div>')
          }
        };
        const hiroshimalist = new NXBase().makeData(elem => [elem.basecd, elem.basename], ['pref', '広島県'], ['realbase', true], ['closed', '']);
        const Minami = [
          ['3416', '広島駅前'],
          ['3406', '古江'],
          ['3401', '皆実町'],
          ['3410', '安芸府中'],
          ['3405', '中筋']
        ];
        const _UI = this.UI;
        this.getFunc = {
          getMyUnit: async function(option = { force: false }) {
            //初期化（取得待がわかるように先に削除）
            _UI.DashItem.MyUnit.class.resetBody();

            //開校状況取得
            const openSnap = await SnapData.quickFetch({ url: `${NX.CONST.host}/tenpo.aspx`, noCache: true, force: true });
            const $openTable = openSnap.getAsJQuery('table');
            $openTable.find('tr:eq(0)').remove(); //先頭に不要な列あり
            const openNXTable = $NX($openTable).makeNXTable();

            //table作成処理
            const table = $('<table>', { class: 'pxdb_innerTable' });
            _UI.DashItem.MyUnit.class.appendToBody(table);
            Minami.forEach(function([baseNum, baseName]) {
              const tr = $('<tr>')
                .append(`<td style="width:4rem">${baseNum}</td>`)
                .append(`<td style="width:6rem">${baseName}</td>`)
                .appendTo(table);

              //開校状況表示
              const openState = openNXTable.xlookup(baseName, '教室', '状態');
              const pcCheck = openNXTable.xlookup(baseName, '教室', 5);
              let openUrl = `${NX.CONST.host}/tenpo_input.aspx?tenpo_cd=${baseNum}&dt=${_this.const.today}`;
              let openClass = 'offout';
              switch (openState) {
                case '開校前':
                  if (pcCheck == '○') {
                    openClass = 'offsecondary';
                    //サポメOKなら、開校ボタンを自動で押すモードのURLにする
                    openUrl = openUrl + '&mode=autoOpen';
                  }
                  break;
                case 'OPEN':
                  if (pcCheck != '○') {
                    openClass = 'offdanger';
                  } else {
                    openClass = 'cs__offprimary';
                  }
                  break;
              }
              $('<td style="width:2rem">')
                .append(
                  `<span class="pxdb_chip contextlink ${openClass}" title="状態：${openState},PC：${pcCheck}" url="${openUrl}">${openState}</span>`
                )
                .appendTo(tr);

              //ブース表リンク
              const end = new ExDate();
              if (end.getDate() > 15) end.aftermonths(1);
              const endStr = end.endofmonth().as('yyyy/mm/dd');
              const boothParam = {
                input1_dt: _this.const.today,
                input2_dt: endStr,
                tenpo_cd: baseNum,
                hyoji_cb: 2,
                basename: baseName
              };
              const boothUrl = `${NX.CONST.host}/kanren/booth2.aspx?${$.param(boothParam)}`;
              $('<td style="width:1rem;">')
                .append(
                  `<span class="fa-icon-wrap contextbacklink" url="${boothUrl}" title="ブース表（${boothParam.basename}:${boothParam.input1_dt}～${boothParam.input2_dt}）"><i class="fa-solid fa-table"></i></span>`
                )
                .appendTo(tr);

              $('<td class="spacer">').appendTo(tr);
            });
          },
          getTodayApplication: async function(options = { force: false }) {
            //初期化
            _UI.DashItem.Application.class.resetBody();
            const path = `/k/keiyaku_list_body.aspx?tenpo_cb=1&cancel_cb=1&gakunen_cb=&kiteigessya_cb=&nyukai_cb=&keiyaku_cb=1&kanri_cb=1&week_vl=4&sort_cb=1&tax_cb=0&input_dt1=${_this.const.today}&input_dt2=${_this.const.today}&tenpo_cd=${_this.profile.myarea}`;
            const snap = await getDashSnap(path, 'getTodayApplication', 5, options.force);
            const $table = snap.getAsJQuery('table');
            const result = $('<table>', { class: 'pxdb_innerTable' });
            _UI.DashItem.Application.class.appendToBody(result);
            $table.find('tr:gt(0)').each(function() {
              const $this = $(this);
              const [base, inCharge, genre, course] = $this.findTdToArray(0, 5, 7, 17);
              const dat = { base, inCharge, genre, course };
              if (dat.genre == 'コース変更' || dat.base == '合計') return true;
              $(
                `<tr class="contextlink" url="${NX.CONST.host}${path}"><td><span class="pxdb_chip">${dat.base}</span></td><td>${dat.inCharge}</td><td>${dat.course}</td></tr>`
              ).appendTo(result);
            });
          },
          getContract: async function(options = { force: false }) {
            const param = {
              tenpo_cd: _this.profile.nowgroup,
              input_dt1: _this.const.biggOfMonth,
              input_dt2: _this.const.today,
              tenpo_cb: 1,
              cancel_cb: 1,
              gakunen_cb: '',
              kiteigessya_cb: '',
              nyukai_cb: '',
              keiyaku_cb: 1,
              kanri_cb: 1,
              week_vl: 4,
              sort_cb: 1,
              tax_cb: 0
            };
            const path = `/k/keiyaku_list_body.aspx?${$.param(param)}`;
            const snap = await getDashSnap(path, 'getContract', 5, options.force);
            const count = snap.getAsJQuery('table input[name=b_keiyaku]').length;
            _UI.DashItem.Contract.class
              .resetBody()
              .appendNumber(count, {
                title: `Base:${param.tenpo_cd} Period:${param.input_dt1}～${param.input_dt2}`,
                class: 'contextlink',
                url: `${NX.CONST.host}${path}`
              })
              .setFooter(new PX_ProgBar(0, Math.floor((count / 30) * 100), '', '').getNode());
          },
          getCancel: async function(options = { force: false }) {
            const param = {
              tenpo_cd: _this.profile.nowgroup,
              input_dt1: _this.const.biggOfMonth,
              input_dt2: _this.const.today,
              disp_cb: 3,
              kaiyaku_cb: 1,
              status_cb: 7,
              end_dt: '',
              sort_cb: 1
            };
            const path = `/k/kaiyaku_list_body.aspx?${$.param(param)}`;
            const snap = await getDashSnap(path, 'getCancel', 60 * 24, options.force);
            const count = snap.getAsJQuery('table input[name=b_kaiyaku]').length;
            _UI.DashItem.Cancel.class.resetBody().appendNumber(count, {
              title: `Base:${param.tenpo_cd} Period:${param.input_dt1}～${param.input_dt2}`,
              class: 'contextlink offwarning',
              url: `${NX.CONST.host}${path}`
            });
          },
          getDiverse: async function(options = { force: false }) {
            const targetBase_cd = ''; //_this.profile.myarea　一時的に全社
            const params = {
              tenpo_cd: targetBase_cd,
              gakunen_cb: '',
              shido_ng: new ExDate().aftermonths(1).as('yyyy/mm'),
              contents_id: 10,
              contents_kamoku_id: '',
              moshikomi_id: '',
              cb: 1
            };
            //同一nameのchackbox要素が、、、、
            const path = `/text/contents_list.aspx?&kamoku_cb=1&kamoku_cb=2&kamoku_cb=3&kamoku_cb=4&${$.param(params)}`;
            const snap = await getDashSnap(path, 'getDiverse', 6 * 60, options.force);
            const table = snap.getAsJQuery('table');
            const count = table.find('input[name=b_keiyaku]').length;
            _UI.DashItem.Diverse.class
              .resetBody()
              .appendNumber(count, {
                title: `Base:${targetBase_cd} Period:${new ExDate().aftermonths(1).as('yyyy/mm')}`,
                class: 'contextlink',
                url: `${NX.CONST.host}${path}`
              })
              .resetFooter()
              .appendToFooter(new PX_ProgBar(0, Math.floor((count / 500) * 100), '', '１０月目標５００件').getNode());

            const $pageDiverse = _UI.page.Diverse;
            $pageDiverse.html('');
            const $countListWrap = new pxdbItembox({
              header: true,
              headerTxt: `Count ${params.shido_ng}`,
              bodyScrollY: true,
              reloadTarget: 'getDiverse',
              bodyStreach: true
            });
            const listNXT = $NX(table).makeNXTable();
            const septGoalin2025 = {
              東京: 15,
              福岡中央: 10,
              福岡南: 7,
              福岡西: 23,
              福岡東: 10,
              北九州西: 16,
              北九州東: 14,
              駿台Diverse: 72,
              佐賀: 29,
              長崎: 42,
              熊本: 24,
              大分: 34,
              宮崎: 28,
              鹿児島: 37,
              広島北: 10,
              広島南: 20,
              岡山北: 60,
              岡山南: 15,
              高松: 35
            };
            const countByUnitNXT = listNXT
              .appendColumn('ユニット', row => new NXBase(row[2]).getUnitName(), 0)
              .analyze(
                'ユニット',
                ['ユニット', 'count', '生徒数'],
                ['数', 'sum', '科目数'],
                ['ユニット', 'count', '生徒数（高１・２）', ['学年', ['高１', '高２']]],
                ['数', 'sum', '科目数（高１・２）', ['学年', ['高１', '高２']]],
                ['ユニット', 'count', '生徒数（高３）', ['学年', ['高３', '大学受験']]],
                ['数', 'sum', '科目数（高３）', ['学年', ['高３', '大学受験']]]
              )
              .appendColumn('９月目標', rows => septGoalin2025[rows[0]] || '', 0)
              .appendColumn('目標差', rows => rows[2] - rows[1], 2)
              .makeTotalRow()
              .appendColumn('平均科目数', rows => Math.round((rows[4] / rows[2]) * 10) / 10, 4)
              .appendColumn('平均科目数（高１・２）', rows => Math.round((rows[7] / rows[6]) * 10) / 10, '生徒数（高１・２）')
              .appendColumn('平均科目数（高３）', rows => Math.round((rows[10] / rows[9]) * 10) / 10, '生徒数（高３）')
              .deleteColumns('科目数（高１・２）')
              .deleteColumns('科目数（高３）');
            $countListWrap
              .appendToBody(countByUnitNXT.toTable({ class: 'pxdb_innerTable right withFooter minusRed offout dblcopytable' }))
              .box.appendTo($pageDiverse);
          },
          getMarathon: async function() {
            const $marathonPage = _UI.page.Marathon;
            $marathonPage.html('');
            const $marathonWrap = new pxdbItembox({
              header: 'true',
              headText: '過去問マラソン',
              bodyScrollY: true,
              fullHeight: true,
              reloadTarget: 'getMarathon'
            });
            const marathonParam = {
              user_type: 'Teacher',
              shain_type: 1,
              shain_cd: '000231',
              nendo: '2025',
              student_cd: '511306',
              talk_type: 'student',
              personal_talk: true,
              dnct_exam_result: true,
              tenpo_cd: 'whole',
              gakunen_cd: 33,
              student_name: '',
              tourokuzumi_only: true
            };
            $.post('https://portal.edu-netz.com/portal/StudyManagement/SearchStudentsListKakomonMarathon', marathonParam, res => {
              const table = $(res);
              const NXTable = $NX(table)
                .makeNXTable()
                .sort('実施年数')
                .deleteColumns('フリガナ', '学年', '学校名', '最新の実施結果_2', '最新の実施結果_3', '最新の実施結果_4');
              $marathonWrap.appendToBody(NXTable.toTable({ class: 'pxdb_innerTable offout dblcopytable' })).box.appendTo($marathonPage);
            });
          },
          getNoreport: async function() {
            const param = {
              tenpo_cd: 'b3403',
              from_dt: new ExDate().afterdays(-2).as('yyyy/mm/dd'), //２日前
              to_dt: NX.DT.yesterday.slash, //～昨日
              shido_cb_flg: 1
            };
            const path = `/kanren/tenpo_shido_kiroku_list.aspx?${$.param(param)}`;
            const snap = await getDashSnap(path, 'getNoReport', 24 * 60);
            const nxt = snap.getAsNXTable();
            const result = nxt.countifs(['指導記録', '未入力']);
            if (result > 0) _this.notify(`指導報告未入力(${param.tenpo_cd})：${result}件`, 'fa-quote-left', `${NX.CONST.host}${path}`);
          },
          getLecture: async function(options = { force: false }) {
            const param = {
              nendo: NX.VAR.nendo,
              season_cb: 'a',
              tenpo_cd: '',
              gakunen_cb: '',
              shido_cb: '',
              base_dt: '',
              shingaku_id: '',
              id_flg: 1
            };
            const path = `/shingaku/kouza_list.aspx?${$.param(param)}`;
            const snap = await getDashSnap(path, 'getLecture', 6 * 60, options.force);
            const nxt = snap.getAsNXTable();
            const result = {
              SaJH3H: nxt.xlookup('【広島】市内六校合格講座', '講座名', '受講者数'),
              SaJH3L: nxt.xlookup('【広島】公立高校合格講座', '講座名', '受講者数')
            };

            _UI.DashItem.GroupOriginal.class
              .resetBody()
              .appendNumber(result.SaJH3H, {
                title: '【通年】市内六校合格講座',
                class: 'contextlink offsecondary',
                url: `${NX.CONST.host}/shingaku/kouza_jyuko_list.aspx?shingaku_id=59098`
              })
              .appendNumber(result.SaJH3L, {
                title: '【通年】公立高校合格講座',
                class: 'contextlink offsecondary',
                url: `${NX.CONST.host}/shingaku/kouza_jyuko_list.aspx?shingaku_id=59099`
              });
          },
          getNotify: async function(options = { force: false }) {
            const url_indexinfo = `${NX.CONST.host}/index_info.aspx`;
            const ajx_indexinfo = await $.get(url_indexinfo);
            const notifykey = {
              未処理の生徒連絡事項: ['fa-envelope', `${NX.CONST.host}/s/student_renraku.aspx`],
              未確認の講師トーク: ['fa-chalkboard-user', `${NX.CONST.host}/talk/talkmenu.aspx?talk_type=lecturer&midoku_flg=1&condition_type=tenpo`],
              ワークフロー: ['fa-ticket', `${NX.CONST.host}/sso/mobilenetzmenu.aspx?page_kind=1&app_name=workflow`],
              未確認の生徒トーク: ['fa-comments', `${NX.CONST.host}/talk/talkmenu.aspx?talk_type=student&midoku_flg=1&condition_type=tenpo`],
              未確認の予定: ['fa-calendar-days', `${NX.CONST.host}/schedule/yotei_list.aspx?ch_flg=1`]
            };
            //_UI.HeadItem.notify.text('');
            for (let key in notifykey) {
              if (ajx_indexinfo.indexOf(key) != -1) {
                new FaIcon({
                  name: `fa-solid fa-lg ${notifykey[key][0]}`,
                  addClass: 'contextlink',
                  wrapper: true,
                  attr: {
                    title: key,
                    url: notifykey[key][1],
                    target: '_blank'
                  }
                })
                  .getNode()
                  .appendTo(_UI.HeadItem.notify);
              }
            }
            //解約未承認通知
            const cancelPath = `/k/kaiyaku_list_body.aspx?tenpo_cd=${_this.profile.nowgroup}&disp_cb=0&input_dt1=&input_dt2=&kaiyaku_cb=&status_cb=3&end_dt=&sort_cb=1`;
            const cancelSnap = await getDashSnap(cancelPath, 'cancelInPending', 5);
            const cancelCount = cancelSnap.getAsJQuery('table input[value=承認]').length;
            if (cancelCount > 0)
              new FaIcon({
                name: `fa-solid fa-lg fa-user-large-slash`,
                addClass: 'contextlink',
                wrapper: true,
                attr: {
                  title: `解約未承認（${cancelCount}件）`,
                  url: `${NX.CONST.host}${cancelPath}`,
                  target: '_blank'
                }
              })
                .getNode()
                .appendTo(_UI.HeadItem.notify);

            //担任未設定通知
            //現状中四国ブロックにしている
            const coachPath = `/s/student_tanto_list.aspx?tanto_cb=0&tenpo_cd=a5031`;
            const coachSnap = await getDashSnap(coachPath, 'noCoach', 5);
            const noCoachCount = coachSnap.getAsJQuery('table input[type=checkbox]').length;
            if (noCoachCount > 0)
              new FaIcon({
                name: `fa-solid fa-lg fa-user-tag`,
                addClass: 'contextlink',
                wrapper: true,
                attr: {
                  title: `担任未設定（${noCoachCount}件）`,
                  url: `${NX.CONST.host}${coachPath}`,
                  target: '_blank'
                }
              })
                .getNode()
                .appendTo(_UI.HeadItem.notify);
          },
          getMyTask: async function(options = { force: false }) {
            //初期化
            _UI.DashItem.MyTask.class.resetBody();
            const studentInfo = new studentInfoClass();

            //１．ダッシュボード bodyを作成
            // ---データの抽出---
            const myTaskPath = `/todo/todo_list.aspx?tanto_cd=${_this.profile.mynumber}&base_dt=`;
            const myTaskSnap = await getDashSnap(myTaskPath, 'mytask', 60, options.force);

            const taskList = myTaskSnap
              .getAsJQuery('table tr:not(:first-child)')
              .map(function() {
                const $tr = $(this);
                const trId = $tr.attr('id') || '';
                //idがなければ弾く
                if (!/td\d+/.test(trId)) return null;

                const taskId = trId.replace('td', '');
                const due = new ExDate('20' + $tr.findTdGetTxt(8));
                const targetName = $tr.findTdGetTxt(2).replace(/校舎：|生徒：/g, '');
                const taskName = $tr.find('td:eq(3) a').text();
                const progress = $tr.findTdGetTxt(6);
                const student_cd = studentInfo.search(['生徒名', targetName])?.['生徒NO'];

                return { taskId, due, targetName, taskName, progress, student_cd };
              })
              .get()
              .filter(t => t !== null);

            // ---データのソート---
            taskList.sort((a, b) => a.due.getTime() - b.due.getTime());

            // ---UIの構築---
            const $table = $('<table>', { class: 'pxdb_innerTable offout' });
            _UI.DashItem.MyTask.class.appendToBody($table);

            taskList.forEach(task => {
              const $row = createTaskRow(task);
              $table.append($row);
            });

            //２．ダッシュボード footer作成
            _UI.DashItem.MyTask.class.setFooter(
              new FaIcon({
                name: 'fa-solid fa-square-plus fa-lg',
                addClass: 'offout',
                wrapper: true,
                attr: {
                  title: '新規タスク追加'
                },
                onClick: () => window.open(`${NX.CONST.host}/todo/todo_input.aspx`, '_blank')
              }).getNode()
            );

            /**
             * タスク1行分のDOMを生成する
             */
            function createTaskRow(task) {
              const { taskId, due, targetName, taskName, progress, student_cd } = task;

              // アイコンの準備
              const doneIcon = new FaIcon({
                name: 'fa-regular fa-square',
                attr: { title: '完了にする' },
                onClick: function() {
                  chrome.runtime.sendMessage({
                    opennetzbackEx: `${NX.CONST.host}/todo/todo_input.aspx?setState=F&doSave=true&id=${taskId}`
                  });
                  PX_Toast('タスクを完了にしました');
                  $(this)
                    .closest('tr')
                    .remove();
                }
              });

              const renrakuHtml = student_cd
                ? new FaIcon({
                    name: 'fa-solid fa-envelope',
                    addClass: 'contextlink',
                    attr: {
                      title: '生徒連絡事項を開く',
                      url: `${NX.CONST.host}/s/student_renraku_list.aspx?student_cd=${student_cd}`
                    }
                  }).getHtml()
                : '';

              const isOverdue = due.compare(new Date()).backward;

              // 行の組み立て（テンプレートリテラルで視覚的に）
              const $tr = $(`
                  <tr class="contextlink" url="${NX.CONST.host}/todo/todo_rireki_input.aspx?id=${taskId}">
                      <td class="icon-col"></td>
                      <td>${targetName} ${taskName} ${renrakuHtml}</td>
                      <td><span class="pxdbsmall colorScheme ${isOverdue ? 'offdanger' : 'offout'}">${due.as('m月d日')}</span></td>
                      <td style="width:2rem;text-align:right">${progress}%</td>
                      <td class="edit-col"></td>
                  </tr>
              `);

              $tr.find('.icon-col').append(doneIcon.getNode());
              $tr.find('.edit-col').append(
                new FaIcon({
                  name: 'fa-solid fa-pen-to-square',
                  attr: { title: '詳細情報' },
                  onClick: e => {
                    e.stopPropagation();
                    window.open(`${NX.CONST.host}/todo/todo_input.aspx?id=${taskId}`);
                  }
                }).getNode()
              );

              return $tr;
            }

            //Tasksページ
            const $taskPage = _UI.page.Tasks;
            $taskPage.html('');
            const $errorTaskListWrap = new pxdbItembox({
              header: true,
              headerTxt: 'ErrorTask',
              bodyScrollY: true,
              fullHeight: true,
              reloadTarget: 'getMyTask',
              footer: true,
              footerAlignment: 'right'
            });
            // --- 過去データ抽出 ---
            const undonePath = `/todo/todo_tenpo_list.aspx?tenpo_cd=a5031&personal_flg=1&student_flg=1&teacher_flg=1&tenpo_flg=1&instruction_id=&jyotai_cb=1&category_cb=&progress_vl1=0&progress_vl2=100&base_dt=&taio_dt=&sort_cb=1`;
            const undoneSnap = await getDashSnap(undonePath, 'undone', 5, options.force);
            const undoneList = extractTaskInfo(undoneSnap.getAsJQuery('table'));

            // --- 過去データ描画 ---
            const $dateErrorTable = $('<table>', { class: 'pxdb_innerTable' });
            undoneList.forEach(item => {
              const $row = createUndoneRow(item, 'past');
              if ($row) $dateErrorTable.append($row);
            });

            // --- 本日時点データ抽出 ---
            const todayPath = `/todo/todo_tenpo_list.aspx?tenpo_cd=a5031&personal_flg=1&student_flg=1&teacher_flg=1&tenpo_flg=1&instruction_id=&jyotai_cb=&category_cb=&progress_vl1=0&progress_vl2=100&base_dt=${NX.DT.today.slash}&taio_dt=&sort_cb=1`;
            const todaySnap = await getDashSnap(todayPath, 'todayTask', 5, options.force);
            const todayErrorList = extractTaskInfo(todaySnap.getAsJQuery('table'));

            // --- 本日データ描画 ---
            todayErrorList.forEach(item => {
              const $row = createUndoneRow(item, 'today');
              if ($row) $dateErrorTable.append($row);
            });

            $errorTaskListWrap.appendToBody($dateErrorTable);

            setFooterBtn($errorTaskListWrap);

            $errorTaskListWrap.box.appendTo($taskPage);

            // 生のtableからタスク情報を引き出す共通関数
            function extractTaskInfo($table) {
              return $table
                .filter(function() {
                  //tableが入れ子になっているので、outerにtableを持たないもののみに
                  return $(this).parents('table').length === 0;
                })
                .children('tbody')
                .children('tr:not(:first-child)')
                .map(function() {
                  const $tr = $(this);
                  const trId = $tr.attr('id');

                  if (!trId || trId.includes('-')) return null;

                  const taskId = trId.replace('td', '');
                  const texts = $tr.findTdGetTxt();
                  return {
                    taskId,
                    taskName: `${texts[1] || ''} ${texts[3] || ''}`,
                    state: texts[5] || '',
                    range: texts[7] || '',
                    due: texts[8] || ''
                  };
                })
                .get()
                .filter(t => t !== null);
            }

            function multiIncludes(target, querys) {
              querys.some(equery => target.includes(equery));
            }

            // タスクリストから、DOMを生成する共通関数
            function createUndoneRow(undone, pattern = 'past') {
              const { taskId, taskName, state, range, due } = undone;
              const displayRange = range === '' ? '×' : range;
              const isIncorrectRange = range.startsWith('～') || range.endsWith('～') || range == '';
              const isPast = new ExDate('20' + due).getTime() < new Date().getTime();
              const isNeedfollow = taskName.includes('１対１指導要フォロー');
              const isEnded = multiIncludes(state, ['削除', '完了', '中止']);

              //エラーがなければ除去 エラー条件の分岐
              switch (pattern) {
                case 'today':
                  if (!isEnded || !isIncorrectRange) return false;
                  break;
                case 'past':
                  if (!isIncorrectRange && !isPast && !isNeedfollow) return false;
                  break;
              }

              //アイコンの作成
              const createIcon = (name, title, actionUrl, toast) =>
                new FaIcon({
                  name,
                  attr: { title },
                  onClick: function() {
                    chrome.runtime.sendMessage({ opennetzbackEx: `${NX.CONST.host}/todo/todo_input.aspx?id=${taskId}${actionUrl}` });
                    PX_Toast(toast);
                    $(this)
                      .closest('tr')
                      .remove();
                  }
                });

              const doneIcon = createIcon('fa-regular fa-square', '完了にする', '&setState=F&doSave=true', '完了にしました');
              const setRangeIcon = createIcon('fa-solid fa-calendar-days', '期間の適正化', '&doAction=autoClose', 'タスク期限を適正化しました');
              const cancelIcon = createIcon('fa-solid fa-ban', '中止にする', '&setState=C&doSave=true', '中止にしました');
              const editIcon = new FaIcon({
                name: 'fa-solid fa-pen-to-square',
                attr: { title: '詳細情報' },
                onClick: () => window.open(`${NX.CONST.host}/todo/todo_input.aspx?id=${taskId}`)
              });

              // 行の組み立て
              const $tr = $(`
                <tr data-id="${taskId}">
                  <td class="done-col"></td>
                  <td class="${isNeedfollow ? 'red' : ''}">${taskName}</td>
                  <td>${state}</td>
                  <td class="${isIncorrectRange ? 'red' : ''}">${displayRange}</td>
                  <td class="${isPast ? 'red' : ''}">${due}</td>
                  <td class="setrange-col"></td>
                  <td class="cancel-col"></td>
                  <td class="edit-col"></td>
                `);
              //一括処理用にtrにエラー条件を付与
              if (isIncorrectRange) $tr.attr('isIncorrectrange', true);
              if (isPast) $tr.attr('isPast', true);
              if (isNeedfollow) $tr.attr('isNeedfollow', true);

              //アイコンを設置
              $tr.find('.done-col').append(doneIcon.getNode());
              $tr.find('.setrange-col').append(setRangeIcon.getNode());
              $tr.find('.cancel-col').append(cancelIcon.getNode());
              $tr.find('.edit-col').append(editIcon.getNode());

              return $tr;
            }
            function setFooterBtn($errorTaskListWrap) {
              $errorTaskListWrap.resetFooter();
              if ($dateErrorTable.find('tr[isNeedfollow=true]').length > 0) {
                $errorTaskListWrap.appendToFooter(
                  $('<button>', {
                    type: 'button',
                    class: 'nx offout',
                    text: '指導F削除',
                    on: {
                      click: function() {
                        $dateErrorTable.find('tr[isNeedfollow=true]').each(function() {
                          const taskID = $(this).attr('data-id');
                          chrome.runtime.sendMessage({
                            opennetzbackEx: `${NX.CONST.host}/todo/todo_input.aspx?setState=C&doAction=autoClose&id=${taskID}`
                          });
                          PX_Toast(`taskID:${taskID} を適正化、中止処理しました`);
                          $(this).remove();
                        });
                        setFooterBtn($errorTaskListWrap);
                      }
                    }
                  })
                );
              }
              if ($dateErrorTable.find('tr[isIncorrectrange=true]').length > 0) {
                $errorTaskListWrap.appendToFooter(
                  $('<button>', {
                    type: 'button',
                    class: 'nx offout',
                    text: '期限適正化',
                    on: {
                      click: function() {
                        $dateErrorTable.find('tr[isIncorrectrange=true]').each(function() {
                          const taskID = $(this).attr('data-id');
                          chrome.runtime.sendMessage({
                            opennetzbackEx: `${NX.CONST.host}/todo/todo_input.aspx?doAction=autoClose&id=${taskID}`
                          });
                          PX_Toast(`taskID:${taskID} を適正化処理しました`);
                          $(this).remove();
                        });
                        setFooterBtn($errorTaskListWrap);
                      }
                    }
                  })
                );
              }
            }
          },
          getUnitDash: async function(options = { force: false }) {
            class DBunitdataManager {
              constructor(UIpageUnit) {
                this.$body = UIpageUnit;
                this.LF = localforage.createInstance({
                  name: 'UnitInfo'
                });
              }
              init(tenpo_cd, yyyymm) {
                const _this = this;
                //初期化
                this.$body.html('');
                const stickyItem = $('<div>', { class: 'pxdb_stickyItem' }).appendTo(this.$body);
                stickyItem.append('<span>Region</span>');

                const unitSelector = $(
                  '<select class="pxdb_select" name="unitdata_tenpo_cd"><option value="nothing">ーーー</option><option value="a5031">中四国</option><option value="b3401">広島北</option><option value="b3403">広島南</option><option value="b3302">岡山北</option><option value="b3303">岡山南</option><option value="b3701">高松</option><option value="c3400">広島県校舎</option></select>'
                )
                  .appendTo(stickyItem)
                  .val(tenpo_cd)
                  .on('change', function() {
                    const yyyymm = $('[name=monthRadio]:checked').val();
                    _this.rendar($(this).val(), yyyymm);
                  });

                stickyItem.append('<span>Month</span>');
                const dtForSelect = new ExDate().setDateTry(NX.VAR.nendo, 2, 1);
                /*
                const monthSelector = $('<select class="pxdb_select" name="unitdata_yyyymm"><option value="nothing">ーーー</option></select>');
                
                for (let m = 1; m <= 12; m++) {
                  dtForSelect.aftermonths(1);
                  monthSelector.append(`<option value="${dtForSelect.as('yyyymm')}">${dtForSelect.as('yyyy/mm')}</option>`);
                }
                monthSelector
                  .appendTo(stickyItem)
                  .val(yyyymm)
                  .on('change', function() {
                    const tenpo_cd = $('[name=unitdata_tenpo_cd]').val();
                    _this.rendar(tenpo_cd, $(this).val());
                  });
                */
                const monthRadio = $('<div>', { class: 'nxChecks', style: 'font-size:1.2rem' }).appendTo(stickyItem);
                for (let m = 1; m <= 12; m++) {
                  dtForSelect.aftermonths(1);
                  monthRadio.append(
                    `<input type="radio" id="monthRadio_${m}" class="radio" name="monthRadio" value="${dtForSelect.as(
                      'yyyymm'
                    )}"/><label for="monthRadio_${m}">${dtForSelect.as('mm')}</label>`
                  );
                }
                $(`[name=monthRadio][value="${yyyymm}`).prop('checked', true);
                $('[name=monthRadio]').on('change', function() {
                  const tenpo_cd = $('[name=unitdata_tenpo_cd]').val();
                  _this.rendar(tenpo_cd, $('[name=monthRadio]:checked').val());
                });
                stickyItem.append('<div class="fg-10"></div>');
                $('<span class="fa-icon-wrap min round" ><i class="fa-solid fa-rotate"></i></span>')
                  .appendTo(stickyItem)
                  .on('click', async function() {
                    const tenpo_cd = $('[name=unitdata_tenpo_cd]').val();
                    const yyyymm = $('[name=monthRadio]:checked').val();
                    await _this.getData(tenpo_cd, yyyymm);
                    PX_Toast(`${yyyymm} 取得完了`);
                  });
              }
              parseYM(yyyymm) {
                const [yyyy, mm] = [parseInt(yyyymm.slice(0, 4)), parseInt(yyyymm.slice(4, 6))];
                return {
                  yyyy: yyyy,
                  mm: mm,
                  SOM: new ExDate(yyyy, mm - 1, 1),
                  EOM: new ExDate(yyyy, mm, 0),
                  LSOM: new ExDate(yyyy - 1, mm - 1, 1),
                  LEOM: new ExDate(yyyy - 1, mm, 0),
                  NSOM: new ExDate(yyyy, mm, 1),
                  LNSOM: new ExDate(yyyy - 1, mm, 1)
                };
              }
              async setLF(tenpo_cd, yyyymm) {
                const { LSOM } = this.parseYM(yyyymm);

                //昨年と一昨年の教室データをセット
                this.LF = localforage.createInstance({
                  storeName: tenpo_cd,
                  name: 'UnitInfo'
                });
                this.LFData = (await this.LF.getItem(yyyymm)) || {};
                this.LLFData = (await this.LF.getItem(LSOM.as('yyyymm'))) || {};
                return this;
              }
              async rendar(tenpo_cd = 'a5031', yyyymm = '202509') {
                this.init(tenpo_cd, yyyymm);
                const { yyyy, mm } = this.parseYM(yyyymm);

                //昨年と一昨年の教室データをセット
                await this.setLF(tenpo_cd, yyyymm);

                //生徒数
                const $countBox = new pxdbItembox({
                  header: true,
                  headerTxt: 'Stu.',
                  addClass: 'makeChart noselectable',
                  attr: { target: 'Students' }
                });
                $countBox
                  .appendNumber(this.LFData?.Students, { class: 'number', title: '今年度生徒数' })
                  .appendNumber(this.LLFData?.Students, { class: 'number offout small', title: '昨年度生徒数' })
                  .box.appendTo(this.$body);

                //契約数
                const $contBox = new pxdbItembox({ header: true, headerTxt: 'Cont.', addClass: 'makeChart noselectable', attr: { target: 'Cont' } });
                $contBox
                  .appendNumber(this.LFData?.Cont, { class: 'number', title: '今年度契約数' })
                  .appendNumber(this.LLFData?.Cont, { class: 'number offout small', title: '昨年度契約数' })
                  .box.appendTo(this.$body);

                //紹介兄弟契約数
                const $contRelBox = new pxdbItembox({
                  header: true,
                  headerTxt: 'ContRel.',
                  addClass: 'makeChart noselectable',
                  attr: { target: 'ContRel' }
                });
                $contRelBox
                  .appendNumber(this.LFData?.ContRel, { class: 'number', title: '今年度紹介兄弟契約数' })
                  .appendNumber(this.LLFData?.ContRel, { class: 'number offout small', title: '昨年度紹介兄弟契約数' })
                  .box.appendTo(this.$body);

                //解約数
                const $rescissionBox = new pxdbItembox({
                  header: true,
                  headerTxt: 'Resci.',
                  addClass: 'makeChart noselectable',
                  attr: { target: 'Resci' }
                });
                $rescissionBox
                  .appendNumber(this.LFData?.Resci, { class: 'number offdanger', title: '今年度翌月解約数' })
                  .appendNumber(this.LLFData?.Resci, { class: 'number offout small', title: '昨年度翌月解約数' })
                  .box.appendTo(this.$body);

                //問合せ数
                const $inqBox = new pxdbItembox({ header: true, headerTxt: 'Inq.', addClass: 'makeChart noselectable', attr: { target: 'Inq' } });
                $inqBox
                  .appendNumber(this.LFData?.Inq, { class: 'number', title: '今年度問合せ数' })
                  .appendNumber(this.LLFData?.Inq, { class: 'number offout small', title: '昨年度問合せ数' })
                  .box.appendTo(this.$body);

                this.$body.append('<div class="pxdbItembox spacer"></div>');
                //生徒数グラフ
                this.$chartCTX = $('<canvas></canvas>');
                const $chartBox = new pxdbItembox({
                  header: true,
                  headerTxt: 'Transition',
                  addClass: 'half',
                  bodyStreach: true,
                  attr: { style: 'height:300px' }
                })
                  .appendToBody(this.$chartCTX)
                  .box.appendTo(this.$body);
                this.openChart(tenpo_cd, yyyy, mm, 'Students');

                //問合せ詳細
                const $inqDetailWrap = new pxdbItembox({
                  header: true,
                  headerTxt: 'InqDetal',
                  addClass: 'half',
                  attr: { style: 'height:300px' }
                });
                const $inqDetailTable = $('<table>', { class: 'pxdb_innerTable' });
                $inqDetailWrap.appendToBody($inqDetailTable).box.appendTo(this.$body);
                $('<tr>')
                  .append(`<td>onboardingRate</td>`)
                  .append(`<td>${this.LFData?.Inq_onBoardRate || 'ー'}</td><td>LY ${this.LLFData?.Inq_onBoardRate || 'ー'}</td>`)
                  .appendTo($inqDetailTable);
                $('<tr>')
                  .append(`<td>contractRate</td>`)
                  .append(`<td>${this.LFData?.Inq_contractRate || 'ー'}</td><td>LY ${this.LLFData?.Inq_contractRate || 'ー'}</td>`)
                  .appendTo($inqDetailTable);

                this.$body.append('<div class="pxdbItembox spacer"></div>');

                //生徒比率グラフ
                this.$chartRatioCTX = $('<canvas></canvas>');
                const $chartRatioBox = new pxdbItembox({
                  header: true,
                  headerTxt: 'Grade Ratio',
                  addClass: 'oneThird',
                  bodyStreach: true,
                  attr: { style: 'height:300px' }
                })
                  .appendToBody(this.$chartRatioCTX)
                  .box.appendTo(this.$body);
                this.openRatioChart(tenpo_cd, yyyy, mm);
              }
              async openRatioChart(tenpo_cd, yyyy, mm) {
                const DT = new ExDate(yyyy, mm - 1, 1);
                if (!tenpo_cd || !yyyy || !mm) return false;
                const chartData = {
                  labels: [],
                  thisYear: []
                };
                const thisYearData = (await this.LF.getItem(DT.as('yyyymm'))) || {};
                (thisYearData.stuRatio || [])
                  .sort((a, b) => {
                    return a.stuRatio > b.stuRatio ? 1 : -1;
                  })
                  .forEach(elem => {
                    if (elem['学年'] == '合計') return true;
                    chartData.labels.push(elem['学年']);
                    chartData.thisYear.push(elem['stuCount']);
                  });
                this.chartRatio?.destroy();
                this.chartRatio = new Chart(this.$chartRatioCTX[0], {
                  type: 'doughnut',
                  data: {
                    labels: chartData.labels,
                    datasets: [
                      {
                        label: '',
                        data: chartData.thisYear
                      }
                    ]
                  },
                  options: {
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }
                });
              }
              async openChart(tenpo_cd, yyyy, mm, key) {
                if (!tenpo_cd || !yyyy || !mm || !key) return false;
                const chartData = {
                  labels: [],
                  thisYear: [],
                  lastYear: []
                };
                for (let i = -6; i <= 6; i++) {
                  const DT = new ExDate(yyyy, mm - 1 + i, 1);
                  const LDT = new ExDate(DT).afteryears(-1);
                  chartData.labels.push(DT.as('m'));
                  const thisYearData = (await this.LF.getItem(DT.as('yyyymm'))) || {};
                  chartData.thisYear.push(thisYearData[key]);
                  const lastYearData = (await this.LF.getItem(LDT.as('yyyymm'))) || {};
                  chartData.lastYear.push(lastYearData[key]);
                }

                const suggestedMin = Math.round(Math.min(updateArray(chartData.thisYear).min, updateArray(chartData.lastYear).min) * 0.9);
                this.chart?.destroy();
                this.chart = new Chart(this.$chartCTX[0], {
                  type: 'line',
                  data: {
                    labels: chartData.labels,
                    datasets: [
                      {
                        label: '',
                        data: updateArray(chartData.thisYear).arr,
                        borderColor: '#5aaa94'
                      },
                      {
                        label: '',
                        data: updateArray(chartData.lastYear).arr,
                        borderColor: '#666'
                      }
                    ]
                  },
                  options: {
                    scales: {
                      y: {
                        suggestedMin: suggestedMin > 10 ? suggestedMin : 0,
                        suggestedMax: Math.round(Math.max(updateArray(chartData.thisYear).max, updateArray(chartData.lastYear).max) * 0.11) * 10
                      }
                    },
                    datasets: {
                      line: {
                        spanGaps: true
                      }
                    },
                    plugins: {
                      legend: {
                        display: false
                      }
                    }
                  }
                });
                //10%以下（夏期用）かundefinedはnullにする
                function updateArray(arr) {
                  if (!Array.isArray(arr)) {
                    return null; // 配列でない場合はnullを返す
                  }
                  // 配列内の最大最小を見つける
                  const max = Math.max(...arr.filter(val => typeof val === 'number'));
                  const min = Math.min(...arr.filter(val => typeof val === 'number'));

                  // 配列を更新
                  return {
                    max: max,
                    min: min,
                    arr: arr.map(val => {
                      if (val === undefined || (typeof val === 'number' && val < max * 0.1)) return null;
                      return val;
                    })
                  };
                }
                return this;
              }

              async getData(tenpo_cd = 'b3403', yyyymm = '202509') {
                if (!$NX(yyyymm).isHexaNumber()) {
                  console.log(`getUnit: Argument is not hexanumber ${yyyymm}`);
                  return false;
                }
                //昨年と一昨年の教室データをセット
                await this.setLF(tenpo_cd, yyyymm);
                const { SOM, EOM, LSOM, LEOM, NSOM, LNSOM } = this.parseYM(yyyymm);

                //生徒数取得
                await Promise.all(
                  [
                    [SOM, this.LFData],
                    [LSOM, this.LLFData]
                  ].map(async ([dt, LFData]) => {
                    const url = `${NX.CONST.host}/u/gessya_tenpo.aspx?gakunen_cb=&hyoji_cb=1&tenpo_cd=${tenpo_cd}&shido_ng=${ymsl(dt)}`;
                    const feeSnap = SnapData.quickFetch({ url, noCache: true });
                    const $feeTable = feeSnap.getAsJQuery('table');
                    //headerが２行でじゃまなので２行目を消す
                    $feeTable
                      .find('tr')
                      .eq(1)
                      .remove();
                    const feeNXT = $NX($feeTable).makeNXTable();
                    LFData.Students = parseInt(feeNXT.xlookup('合計', '校舎', '合計(月謝発生生徒数)_1'));
                    LFData.Fee = $NX(feeNXT.xlookup('合計', '校舎', '合計(月謝発生生徒数)')).moneylocaleToInt();
                    LFData.FeeAv = $NX(feeNXT.xlookup('合計', '校舎', '合計(月謝発生生徒数)_2')).moneylocaleToInt();
                  })
                );

                //契約数取得
                await Promise.all(
                  [
                    [SOM, EOM, this.LFData],
                    [LSOM, LEOM, this.LLFData]
                  ].map(async ([dt1, dt2, LFData]) => {
                    const params = {
                      tenpo_cb: 1,
                      cancel_cb: 1,
                      gakunen_cb: '',
                      nyukai_cb: '',
                      keiyaku_cb: 'b',
                      kanri_cb: '1',
                      week_vl: '4',
                      sort_cb: '1',
                      tax_cb: '0',
                      input_dt1: sl(dt1),
                      input_dt2: sl(dt2),
                      tenpo_cd: tenpo_cd
                    };
                    const url = `${NX.CONST.host}/k/keiyaku_list_body.aspx?${$.param(params)}`;
                    const contractSnap = await SnapData.quickFetch({ url, noCache: true });
                    const contractNXT = contractSnap.getAsNXTable();
                    LFData.Cont = contractNXT.countifs(['契約日', ['/'], false]);
                    LFData.ContRel = contractNXT.countifs(['区分', '紹介']) + contractNXT.countifs(['区分', '兄弟']);
                  })
                );

                //解約数取得
                await Promise.all(
                  [
                    [NSOM, this.LFData],
                    [LNSOM, this.LLFData]
                  ].map(async ([dt, LFData]) => {
                    const url = `${NX.CONST.host}/k/kaiyaku_list_body.aspx?end_dt=${ymsl(dt)}&tenpo_cd=${tenpo_cd}&kaiyaku_cb=1&status_cb=7`;
                    const rescissionSnap = await SnapData.quickFetch({ url, noCache: true });
                    const rescissionNXT = rescissionSnap.getAsNXTable();
                    LFData.Resci = rescissionNXT.countifs(['区分', '解約']) - rescissionNXT.countifs(['区分', '解約'], ['解約理由', '未入金']);
                  })
                );

                //問合せ数取得
                await Promise.all(
                  [
                    [SOM, EOM, this.LFData],
                    [LSOM, LEOM, this.LLFData]
                  ].map(async ([dt1, dt2, LFData]) => {
                    const url = `${NX.CONST.host}/toiawase_list_body.aspx?input_dt1=${sl(dt1)}&input_dt2=${sl(dt2)}&tenpo_cd=${tenpo_cd}&test_cb=2`;
                    const inquireSnap = await SnapData.quickFetch({ url, noCache: true });
                    const inquireNXT = inquireSnap.getAsNXTable();
                    LFData.Inq = inquireNXT.countifs(['問合日', ['/'], false]);
                  })
                );
              }
            }
            const UDM = new DBunitdataManager(_UI.page.Unit);
            UDM.rendar('b3403', new ExDate().as('yyyymm'));
            $(document).on('click', '.makeChart', function() {
              const tenpo_cd = $('[name=unitdata_tenpo_cd]').val();
              const yyyymm = $('[name=monthRadio]:checked').val();
              const { yyyy, mm } = UDM.parseYM(yyyymm);
              UDM.openChart(tenpo_cd, yyyy, mm, $(this).attr('target'));
            });
          },
          getManagement: async function(options = { force: false }) {
            //広島県で閉校でない実店舗を拾う
            const hiroshimaList = new NXBase().rawNXT
              .filterByCondition(['unitcd', 'b34', false], ['closed', ''], ['realbase', 'TRUE'])
              .pickColumns(['basecd', 'basename'])
              .toObjectArray();

            const ManageDiv = $('<div>', { class: 'pxdb_manage' }).appendTo(_UI.page.Management);
            const ManageHead = $('<div>', { class: 'pxdb_manage_head' }).appendTo(ManageDiv);
            const ManageList = $('<div>', { class: 'pxdb_manage_list' }).appendTo(ManageDiv);
            const ManageBody = $('<div>', { class: 'pxdb_manage_body' }).appendTo(ManageDiv);
            const ManageBodyInner = $('<div>', { class: 'pxdb_manage_bodyinner' }).appendTo(ManageBody);
            const InputRangeFrom = $('<input>', {
              type: 'date',
              class: 'px withlabel',
              'data-label': 'From'
            })
              .val(new ExDate().aftermonths(-1).as('yyyy-mm-dd'))
              .appendTo(ManageHead);
            const InputRangeTo = $('<input>', {
              type: 'date',
              class: 'px withlabel',
              'data-label': 'To'
            })
              .val(new ExDate().as('yyyy-mm-dd'))
              .appendTo(ManageHead);
            $('<button>', {
              class: 'nx',
              type: 'button',
              text: '翌月',
              on: {
                click: () => {
                  InputRangeFrom.val(NX.DT.IONM.ymd);
                  InputRangeTo.val(NX.DT.EONM.ymd);
                }
              }
            }).appendTo(ManageHead);
            $('<button>', {
              class: 'nx',
              type: 'button',
              text: '講習期間',
              on: {
                click: () => {
                  InputRangeFrom.val(NX.DT.Koshu_START.ymd);
                  InputRangeTo.val(NX.DT.Koshu_END.ymd);
                }
              }
            }).appendTo(ManageHead);

            $('<button>', {
              class: 'nx offsecondary',
              text: 'テキスト配布CH',
              on: {
                click: async () => {
                  ManageBodyInner.html('');
                  for (let { basecd, basename } of hiroshimaList) {
                    //prettier-ignore
                    const url = `${NX.CONST.host}/text/text_list_body.aspx?tenpo_cd=${basecd}&publish_cd=&input1_dt=${InputRangeFrom.val()}&input2_dt=${InputRangeTo.val()}&haifu_flg=1`;
                    const ajxdata = await $.get(url);
                    const failcount = $(ajxdata).find('input[name=delivery_ch]').length;
                    if (failcount == 0) continue;
                    //prettier-ignore
                    ManageBodyInner.append(`<div class="pxdb_infochip" url="${url}"><span>${basename}：${failcount}個</span><span class="fa-icon-wrap copytext" data-copy="${url}" style="flex-basis:2rem"><i class="fa-solid fa-copy"></i></span></div>`);
                  }
                  PX_Toast('テキスト配布CH完了');
                }
              }
            }).appendTo(ManageList);

            $('<button>', {
              class: 'nx offsecondary',
              text: '開校CH',
              on: {
                click: async function() {
                  ManageBodyInner.html('');
                  for (let { basecd, basename } of hiroshimaList) {
                    //prettier-ignore
                    const url = `${NX.CONST.host}/tenpo_yotei.aspx?input_f_dt=${InputRangeFrom.val()}&input_t_dt=${InputRangeTo.val()}&tenpo_cd=${basecd}`;
                    const ajxdata = await $.get(url);
                    const failcount = $(ajxdata).find('input[value="#ffcccc"]').length;
                    if (failcount == 0) continue;
                    ManageBodyInner.append(
                      `<div class="pxdb_infochip" url="${url}"><span>${basename}：${failcount}個</span><span class="fa-icon-wrap copytext" data-copy="${url}" style="flex-basis:2rem"><i class="fa-solid fa-copy"></i></span></div>`
                    );
                  }
                  PX_Toast('開校CH完了');
                }
              }
            }).appendTo(ManageList);

            $('<button>', {
              class: 'nx offsecondary',
              text: '講習SJ入力CH',
              on: {
                click: async () => {
                  ManageBodyInner.html('');
                  const url = `${NX.CONST.host}/s/schedule_input_check.aspx?tenpo_cd=c3400&input_cb=1&input1_dt=${NX.VAR.koshu_kikan['開始']}&input2_dt=${NX.VAR.koshu_kikan['終了']}`;
                  const snap = await SnapData.quickFetch({ url, noCache: true, force: true });
                  const nxtable = snap.getAsNXTable();
                  const resultArray = nxtable.analyze('校舎', ['校舎', 'count'], ['校舎', 'count', null, ['入力ＣＨ', '']]).toObjectArray();
                  //prettier-ignore
                  resultArray.forEach(elem => {
                    ManageBodyInner.append(
                      `<div class="pxdb_infochip" url="${url}"><span>${elem['校舎']}：${elem['校舎(count_)'] - elem['校舎(count_入力ＣＨ)']}個</span><span class="fa-icon-wrap copytext" data-copy="${url}" style="flex-basis:2rem"><i class="fa-solid fa-copy"></i></span></div>`
                    );
                  });
                  PX_Toast('講習SJ入力CH完了');
                }
              }
            }).appendTo(ManageList);
            $('<button>', {
              class: 'nx offsecondary',
              text: '面談過去対応CH',
              on: {
                click: async () => {
                  ManageBodyInner.html('');
                  const commomParam = `tanto_cd=&tanto_cb=1&kado_flg=1&menu_cb=&cb=&sort_cb=4&mendan_status_cb=nn&kaiyaku_flg=1&gen_course_flg=1&mikomi_flg=1&mendan_aite_flg=1&mendan_tanto_flg=1&shukei_cb=0&shibo_cb_flg=1`;
                  const nendo_season_cb =
                    String(prompt('年を入力してください yyyy', NX.VAR.nendo || new ExDate().as('yyyy'))) +
                    String(prompt('season_cbを入れてください #', NX.VAR.season_cb || '2'));
                  const nextParams = {
                    nendo_season_cb,
                    next_dt1: NX.DT.CMP_START.md,
                    next_dt2: NX.DT.today.md,
                    gakunen_cb: '',
                    input_dt1: '',
                    input_dt2: '',
                    course_ng: '2025/10'
                  };
                  const nextUrl = `${NX.CONST.host}/s/teian_list_body.aspx?${$.param(nextParams)}&${commomParam}`;
                  const nextSnap = await SnapData.quickFetch({ url: nextUrl + '&tenpo_cd=a5031', noCache: true, force: true });
                  const nextNXT = nextSnap.getAsNXTable({ omitSubrow: true });
                  const nextArray = nextNXT
                    .analyze(
                      '教室',
                      ['null', 'count', '対応_保留', ['状態', '保留']],
                      ['null', 'count', '対応_日程調整', ['状態', '日程調整']],
                      ['null', 'count', '対応_面談待', ['状態', '面談待']]
                    )
                    .appendColumn('未対応合計', row => row[1] + row[2] + row[3]);
                  const mendanParams = {
                    nendo_season_cb,
                    next_dt1: '',
                    next_dt2: '',
                    gakunen_cb: '',
                    input_dt1: NX.DT.CMP_START.md,
                    input_dt2: NX.DT.today.md,
                    course_ng: '2025/10'
                  };
                  const mendanUrl = `${NX.CONST.host}/s/teian_list_body.aspx?${$.param(mendanParams)}&${commomParam}`;
                  const mendanSnap = await SnapData.quickFetch({ url: mendanUrl + '&tenpo_cd=a5031', noCache: true, force: true });
                  const mendanNXT = mendanSnap.getAsNXTable({ omitSubrow: true });
                  const mendanArray = mendanNXT
                    .analyze(
                      '教室',
                      ['null', 'count', '面談_保留', ['状態', '保留'], ['次', '', true]],
                      ['null', 'count', '面談_日程調整', ['状態', '日程調整'], ['次', '', true]],
                      ['null', 'count', '面談_面談待', ['状態', '面談待'], ['次', '', true]]
                    )
                    .appendColumn('未対応合計', row => row[1] + row[2] + row[3]);
                  const resultObj = {};

                  nextArray.body.forEach(([base, horyu, chosei, machi, sum]) => {
                    if (sum == 0) return true;
                    resultObj[base] = resultObj[base] || {};
                    resultObj[base].next = sum;
                  });

                  mendanArray.body.forEach(([base, horyu, chosei, machi, sum]) => {
                    if (sum == 0) return true;
                    resultObj[base] = resultObj[base] || {};
                    resultObj[base].mendan = sum;
                  });
                  Object.keys(resultObj).forEach(base => {
                    const tenpo_cd = new NXBase(base).getCd() || 'a5031';
                    const kako = resultObj[base].next || 0;
                    const mendan = resultObj[base].mendan || 0;
                    $('<div class="pxdb_infochip"></div>')
                      .append(`<span style="flex-basis:6rem">${base}</span>`)
                      .append(`<span class="contextlink" url="${`${nextUrl}&tenpo_cd=${tenpo_cd}`}" style="flex-basis:8rem">過去対応${kako}個</span>`)
                      .append(
                        `<span class="contextlink" url="${`${mendanUrl}&tenpo_cd=${tenpo_cd}`}" style="flex-basis:8rem">過去面談${mendan}個</span>`
                      )
                      .append('<span style="flex:1"></span>')
                      .appendTo(ManageBodyInner);
                  });
                  PX_Toast('面談対応CH完了');
                }
              }
            }).appendTo(ManageList);
          },
          getAsCoach: async function(options = { force: false }) {
            const $ascoachPage = _UI.page.AsCoach;
            $ascoachPage.html('');

            //box作成
            const $waitingStudentsWrap = new pxdbItembox({
              header: true,
              headerTxt: '来校前',
              bodyScrollY: true,
              fullHeight: true,
              reloadTarget: 'getAsCoach'
            });
            const $waitingTable = $('<table>', { class: 'pxdb_innerTable offdanger' });
            $waitingStudentsWrap.appendToBody($waitingTable).box.appendTo($ascoachPage);
            const $goingStudentsWrap = new pxdbItembox({
              header: true,
              headerTxt: '在室',
              bodyScrollY: true,
              fullHeight: true,
              reloadTarget: 'getAsCoach'
            });
            const $goingTable = $('<table>', { class: 'pxdb_innerTable offdanger' });
            $goingStudentsWrap.appendToBody($goingTable).box.appendTo($ascoachPage);
            const $goneStudentsWrap = new pxdbItembox({
              header: true,
              headerTxt: '帰宅',
              bodyScrollY: true,
              fullHeight: true,
              reloadTarget: 'getAsCoach'
            });
            const $goneTable = $('<table>', { class: 'pxdb_innerTable offdanger' });
            $goneStudentsWrap.appendToBody($goneTable).box.appendTo($ascoachPage);

            [
              ['3406', '古江'],
              ['3416', '広島駅前']
            ].forEach(async function([tenpo_cd, basename]) {
              //ブースを取得
              const boothPath = `/gapp/student_list_ajax.aspx?tenpo_cd=${tenpo_cd}&sort_cb=3`;
              const boothSnap = await getDashSnap(boothPath, `booth_${tenpo_cd}`, 5, options.force);
              const boothRaw = boothSnap.getAsRawString();
              // --- ajax用でhtmlとして不完全なのでhtmlをJQueryで掴むために構築して上げる必要がある ---
              const boothTable = $(`<html>`).html(boothRaw);

              //振替を取得
              const furikaePath = `/tehai/shido_furikae_list_body.aspx?kekka_cb=01&tenpo_cd=${tenpo_cd}`;
              const furikaeSnap = await getDashSnap(furikaePath, `furikae_${tenpo_cd}`, 5, options.force);
              const furikaeTable = furikaeSnap.getAsJQuery('table');

              boothTable.find('tr:gt(0)').each(function() {
                const $tr = $(this);
                const student_nm = $tr.findTdGetTxt(0);
                const lect_time = $tr.findTdGetTxt(4);
                //prettier-ignore
                const student_cd = $tr.find('input[value="対応メモ"]')?.attr('onclick')?.getStrBetween("'", "'");
                const hasFurikae = furikaeTable.find(`td:contains("${student_nm}")`).length;
                const furikaeIcon =
                  hasFurikae > 0
                    ? new FaIcon({
                        name: 'fa-solid fa-lg fa-mug-hot',
                        addClass: 'contextlink',
                        wrapper: true,
                        attr: {
                          title: `振替有（${hasFurikae}件）`,
                          url: `${NX.CONST.host}/tehai/furikae_list.aspx?student_cd=${student_cd}`,
                          target: '_blank'
                        }
                      }).getHtml()
                    : '';
                const hasContactNote = $tr.find('input[value="連絡"]').length > 0;
                const contactNoteIcon = hasContactNote
                  ? new FaIcon({
                      name: 'fa-solid fa-lg fa-envelope',
                      addClass: 'contextlink',
                      wrapper: true,
                      attr: {
                        title: '連絡事項有',
                        url: `${NX.CONST.host}/s/student_renraku_list.aspx?student_cd=${student_cd}`,
                        target: '_blank'
                      }
                    }).getHtml()
                  : '';
                const hasTask = $tr.find('input[value="タスク"]').length > 0;
                const taskIcon = hasTask
                  ? new FaIcon({
                      name: 'fa-solid fa-lg fa-square-check',
                      addClass: 'contextlink',
                      wrapper: true,
                      attr: {
                        title: 'タスク有',
                        url: `${NX.CONST.host}/todo/todo_list.aspx?todo_cb=1&user_cd=${student_cd}`,
                        target: '_blank'
                      }
                    }).getHtml()
                  : '';
                const netzmemo = $('<input>', {
                  type: 'text',
                  class: 'silentinput'
                }).netzmemorize(student_cd);
                const inout = $tr.findTdGetTxt(2);
                const start = new ExDate(new Date().setHours(lect_time.slice(0, 2), lect_time.slice(3, 5), 0));
                const end = new ExDate(new Date().setHours(lect_time.slice(6, 8), lect_time.slice(9, 11), 0));
                const isStart = start.compare(new ExDate()).backward;
                const isEnd = inout == '' && end.compare(new ExDate()).backward;
                const doIn = inout.indexOf('入') != -1;
                const doOut = inout.indexOf('退') != -1;
                //const isWaiting = !isStart && !isEnd;
                const isPresent = isStart && !isEnd;
                //const isGone = isStart && isEnd;
                const isError = isPresent && !doIn && !doOut;

                const tr = $(
                  `<tr class="${
                    isError ? 'fontAccent' : ''
                  }"><td>${basename}</td><td><span class="studentLinker" student_nm="${student_nm}" student_cd="${student_cd}">${student_nm}</span></td><td>${lect_time}</td></tr>`
                );
                $('<td style="min-width:5rem;padding:0">')
                  .append(netzmemo)
                  .appendTo(tr);
                $(`<td>${furikaeIcon}${contactNoteIcon}${taskIcon}</td>`).appendTo(tr);
                if (!doIn && !doOut) tr.appendTo($waitingTable);
                if (doIn) tr.appendTo($goingTable);
                if (doOut) tr.appendTo($goneTable);
              });
            });
          },
          getSales: async function(options = { force: false }) {
            const $salesPage = _UI.page.Sales;
            $salesPage.html('');
            const nglist = ['2025/04', '2025/05', '2025/06', '2025/07', '2025/08', '2025/09', '2025/10', '2025/11'];

            const stickyItem = $('<div>', { class: 'pxdb_stickyItem' }).appendTo($salesPage);
            const unitSelector = $(
              '<select class="pxdb_select" name="unitdata_tenpo_cd"><option value="b">中四国</option><option value="b3401">広島北</option><option value="b3403">広島南</option><option value="b3302">岡山北</option><option value="b3303">岡山南</option><option value="b3701">高松</option></select>'
            )
              .appendTo(stickyItem)
              .val('b')
              .on('change', loadData);
            const accountSelector = $(
              '<select class="pxdb_select"><option value="">なし</option><option value="入会金">入会金</option><option value="初回月謝">初回月謝</option><option value="月謝">月謝</option><option value="講習料">講習料</option></select>'
            )
              .appendTo(stickyItem)
              .val('')
              .on('change', loadData);

            const $salesGoalTableWrap = new pxdbItembox({
              header: true,
              headerTxt: `Sales Against Goal`,
              bodyStreach: true
            });
            $salesGoalTableWrap.box.appendTo($salesPage);
            const $salesBadgetTableWrap = new pxdbItembox({
              header: true,
              headerTxt: `Sales Against Badget`,
              bodyStreach: true
            });
            $salesBadgetTableWrap.box.appendTo($salesPage);

            const $salesListTableWrap = new pxdbItembox({
              header: true,
              headerTxt: `Sales List`,
              bodyStreach: true
            });
            $salesListTableWrap.box.appendTo($salesPage);
            loadData();

            async function getRawData() {
              const lsData = JSON.parse(localStorage.getItem('salesData')) || {};
              if (lsData.date && new ExDate().getTime() - lsData.date < 6 * 24 * 60 * 60 * 1000) return new NXTable(lsData.nxtable);

              const unitList = ['b3401', 'b3403', 'b3302', 'b3303', 'b3701'];
              const resultNXT = new NXTable();
              for (const tenpo_cd of unitList) {
                for (const yyyymm of nglist) {
                  await $.get(`${NX.CONST.host}/u/yosandata.aspx?tenpo_cd=${tenpo_cd}&shido_ng=${yyyymm}`, function(data) {
                    const table = $(data)
                      .find('table')
                      .html()
                      .replaceAll(',', '');
                    const nxtable = $NX(table)
                      .makeNXTable()
                      .transpose()
                      .appendColumn(['ユニット', '年月'], () => [tenpo_cd, yyyymm], 0)
                      .deleteColumns('title');
                    resultNXT.merge(nxtable, true);
                  });
                }
              }
              localStorage.setItem('salesData', JSON.stringify({ date: new ExDate().getTime(), nxtable: resultNXT.toObject() }));
              return resultNXT;
            }
            async function loadData() {
              const unit_cd = unitSelector.val();
              const account = accountSelector.val() == '' ? '合計' : accountSelector.val();
              const $salesGoalTable = $('<table>', { class: 'pxdb_innerTable offout' });
              const $salesBadgetTable = $('<table>', { class: 'pxdb_innerTable offout' });
              const $salesListTable = $('<table>', { class: 'pxdb_innerTable dblcopytable' }).append(
                '<tr><td>年月</td><td>目標</td><td>売上</td><td>目標差</td><td>達成率</td><td>予算</td><td>売上</td><td>予算差</td><td>達成率</td></tr>'
              );
              const resultNXT = await getRawData();
              const badgetNXT = new NXTable(NX.SALES.goalNXT);
              let totalRes = 0;
              let totalBadget = 0;
              nglist.forEach(shido_ng => {
                const res = resultNXT.sumifs(account, ['年月', shido_ng], ['ユニット', unit_cd, false]);
                const badget = badgetNXT.sumifs(account, ['年月', shido_ng], ['ユニット', unit_cd, false]);
                totalRes = totalRes + res;
                totalBadget = totalBadget + badget;
                const goalRateCalc = Math.floor(((res / badget) * 1000) / 1.05) / 10;
                const goalRate = Number.isFinite(goalRateCalc) ? goalRateCalc : '-';
                const badgetRateCalc = Math.floor((res / badget) * 1000) / 10;
                const badgetRate = Number.isFinite(badgetRateCalc) ? badgetRateCalc : '-';
                const goalEvaluate = goalRate >= 100 ? 'offprimary' : goalRate >= 95 ? 'offsecondary' : 'offwarning';
                const badgetEvaluate = badgetRate >= 100 ? 'offprimary' : badgetRate >= 98 ? 'offsecondary' : 'offwarning';
                const goalTr = $('<tr>')
                  .append(`<td>${shido_ng}</td>`)
                  .append(`<td class="right">${Math.floor(res - badget * 1.05).toLocaleString()}</td>`)
                  .appendTo($salesGoalTable);
                $('<td style="width:8rem">')
                  .append(`<span>${goalRate}%</span>`)
                  .append(new PX_ProgBar(0, goalRate, goalEvaluate, `目標：${(badget * 1.05).toLocaleString()}`).getNode())
                  .appendTo(goalTr);
                const differ = res - badget;
                const badgetTr = $('<tr>')
                  .append(`<td>${shido_ng}</td>`)
                  .append(`<td class="right">${differ > 0 ? '+' : ''}${(res - badget).toLocaleString()}</td>`)
                  .appendTo($salesBadgetTable);
                $('<td style="width:8rem">')
                  .append(`<span>${badgetRate}%</span>`)
                  .append(new PX_ProgBar(0, badgetRate, badgetEvaluate, `予算：${badget.toLocaleString()}`).getNode())
                  .appendTo(badgetTr);

                const listTr = $('<tr>')
                  .append(`<td>${shido_ng}</td>`)
                  .append(`<td>${Math.round(badget * 1.05).toLocaleString()}</td>`)
                  .append(`<td>${res.toLocaleString()}</td>`)
                  .append(`<td>${(res - Math.round(badget * 1.05)).toLocaleString()}</td>`)
                  .append(`<td>${goalRate}%</td>`)
                  .append(`<td>${badget.toLocaleString()}</td>`)
                  .append(`<td>${res.toLocaleString()}</td>`)
                  .append(`<td>${Math.round(res - badget).toLocaleString()}</td>`)
                  .append(`<td>${badgetRate}%</td>`)
                  .appendTo($salesListTable);
              });
              const totalGoalRate = Math.floor(((totalRes / totalBadget) * 1000) / 1.05) / 10;
              const totalBadgetRate = Math.floor((totalRes / totalBadget) * 1000) / 10;
              const totalGoalEvaluate = totalGoalRate >= 100 ? 'offprimary' : totalGoalRate >= 95 ? 'offsecondary' : 'offwarning';
              const totalBadgetEvaluate = totalBadgetRate >= 100 ? 'offprimary' : totalBadgetRate >= 98 ? 'offsecondary' : 'offwarning';
              const totalGoalTr = $('<tr class="accent">')
                .append(`<td>合計</td>`)
                .append(`<td class="right">${(totalRes - Math.floor(totalBadget * 1.05)).toLocaleString()}</td>`)
                .appendTo($salesGoalTable);
              $('<td style="width:8rem">')
                .append(`<span>${totalGoalRate}%</span>`)
                .append(new PX_ProgBar(0, totalGoalRate, totalGoalEvaluate, `目標：${(totalBadget * 1.05).toLocaleString()}`).getNode())
                .appendTo(totalGoalTr);
              const totalBadgetTr = $('<tr class="accent">')
                .append(`<td>合計</td>`)
                .append(`<td class="right">${(totalRes - totalBadget).toLocaleString()}</td>`)
                .appendTo($salesBadgetTable);
              $('<td style="width:8rem">')
                .append(`<span>${totalBadgetRate}%</span>`)
                .append(new PX_ProgBar(0, totalBadgetRate, totalBadgetEvaluate, `予算：${totalBadget.toLocaleString()}`).getNode())
                .appendTo(totalBadgetTr);

              const listTr = $('<tr>')
                .append(`<td>合計</td>`)
                .append(`<td>${Math.round(totalBadget * 1.05).toLocaleString()}</td>`)
                .append(`<td>${totalRes.toLocaleString()}</td>`)
                .append(`<td>${Math.round(totalRes - totalBadget * 1.05).toLocaleString()}</td>`)
                .append(`<td>${totalGoalRate}%</td>`)
                .append(`<td>${totalBadget.toLocaleString()}</td>`)
                .append(`<td>${totalRes.toLocaleString()}</td>`)
                .append(`<td>${Math.round(totalRes - totalBadget).toLocaleString()}</td>`)
                .append(`<td>${totalBadgetRate}%</td>`)
                .appendTo($salesListTable);
              $salesGoalTableWrap.setBody($salesGoalTable);
              $salesBadgetTableWrap.setBody($salesBadgetTable);
              $salesListTableWrap.setBody($salesListTable);
            }
          },
          async getSeasonalLog() {
            return;
            //１日１回面談データを魚拓取る
            const LFMendanLogNXT = localforage.createInstance({ name: 'SnapData', storeName: 'MendanLogNXT' });
            if (true) {
              LFMendanLogNXT.keys().then(async function(keys) {
                if (!keys.find(key => key.includes(new ExDate().as('yymmdd')))) {
                  const rawUrl = `${NX.CONST.host}/s/teian_list_body.aspx?nendo_season_cb=${NX.VAR.nendo}${NX.VAR.season_cb}&tenpo_cd=a5031&tanto_cb=11&tanto_cd=&gakunen_cb=existing&kado_flg=1&input_dt1=${NX.DT.CMP_START.slash}&input_dt2=${NX.DT.CMP_END.slash}&menu_cb=&next_dt1=&next_dt2=&mendan_status_cb=&course_ng=2024%2F05&mikomi_flg=1&kakutei_flg=1&sort_cb=4&cb=&shukei_cb=0&mendan_tanto_flg=1`;
                  const avUrl = `${NX.CONST.host}/s/koshu_gakunen_shukei.aspx?nendo_season_cb=${NX.VAR.nendo}${NX.VAR.season_cb}&tenpo_cd=a5031`;
                  const summaryUrl = `${NX.CONST.host}/s/teian_shukei.aspx?nendo_season_cb=${NX.VAR.nendo}${NX.VAR.season_cb}`;
                  const data = {
                    raw: await new SnapData({ url: rawUrl, nosave: true }).exportNXTable({ omitSubrow: true }),
                    average: await new SnapData({ url: avUrl, nosave: true }).exportNXTable(),
                    summary: await new SnapData({ url: summaryUrl, nosave: true }).exportNXTable()
                  };
                  LFMendanLogNXT.setItem(`${new ExDate().as('yymmdd_HHMM')}`, data);
                }
              });
            }
            _UI.page.SeasonalLog.html('');
            const list_radiusWrapper = $('<div class="pxdb_roundtable_radiusWrapper"></div>').appendTo(_UI.page.SeasonalLog);
            const list_scrollWrapper = $('<div class="pxdb_roundtable_scrollWrapper"></div>').appendTo(list_radiusWrapper);
            const $list_table = $('<table>', { class: 'pxdb_roundtable widthauto' })
              .append('<tr><td></td><td>key</td><td>act</td></tr>')
              .appendTo(list_scrollWrapper);

            const $view = $('<div style="width:100%;overflow:auto"></div>').appendTo(_UI.page.SeasonalLog);
            (await LFMendanLogNXT.keys()).forEach(function(key) {
              const $tr = $(`<tr data-key="${key}"></tr>`).appendTo($list_table);
              $tr.append('<td><input type="checkbox" /></td>').append(`<td>${key}</td>`);
              const act = $('<td></td>')
                .append(
                  new FaIcon({
                    name: 'fa-solid fa-list',
                    wrapper: true,
                    attr: {
                      'data-key': key,
                      title: '一覧'
                    },
                    onClick: async function() {
                      const data = await LFMendanLogNXT.getItem(key);
                      const nxtable = new NXTable(data.raw);
                      $view.html(nxtable.toTable({ class: 'pxdb_table' }));
                    }
                  }).getNode()
                )
                .append(
                  new FaIcon({
                    name: 'fa-solid fa-magnifying-glass-chart',
                    wrapper: true,
                    attr: {
                      'data-key': key,
                      title: '平均単価'
                    },
                    onClick: async function() {
                      const data = await LFMendanLogNXT.getItem(key);
                      const nxtable = new NXTable(data.average);
                      $view.html(nxtable.toTable({ class: 'pxdb_table' }));
                    }
                  }).getNode()
                )
                .append(
                  new FaIcon({
                    name: 'fa-solid fa-table',
                    wrapper: true,
                    attr: {
                      'data-key': key,
                      title: '積み上げ集計'
                    },
                    onClick: async function() {
                      const data = await LFMendanLogNXT.getItem(key);
                      const nxtable = new NXTable(data.summary);
                      $view.html(nxtable.toTable({ class: 'pxdb_table' }));
                    }
                  }).getNode()
                )
                .appendTo($tr);
            });
          },
          getConfigure() {
            reflesh();
            function reflesh() {
              //初期化
              _UI.page.Configure.html('');
              const radiusWrapper = $('<div>', { class: 'pxdb_roundtable_radiusWrapper' }).appendTo(_UI.page.Configure);
              const scrollWrapper = $('<div>', { class: 'pxdb_roundtable_scrollWrapper' }).appendTo(radiusWrapper);
              const myProfile = myprofiles.getall();
              const table = $('<table>', { class: 'pxdb_roundtable widthauto' }) //pxdb_table
                .append('<tr><td>key</td><td>val</td><td>del</td></tr>')
                .appendTo(scrollWrapper);
              Object.keys(myProfile)
                .sort()
                .forEach(key => {
                  const tr = $(`<tr><td>${key}</td></tr>`).appendTo(table);
                  let input = null;
                  if (key.slice(0, 2) == 'is' || key.slice(0, 4) == 'show') {
                    input = $('<td>').append(isSwitch(key, myProfile[key]));
                  } else {
                    input = $('<td>').append(textInput(key, myProfile[key]));
                  }
                  const delFaIcon = $(
                    `<td>${new FaIcon({
                      name: 'fa-solid fa-lg fa-trash-can',
                      addClass: 'delIcon offdanger',
                      wrapper: true,
                      attr: {
                        title: '削除する',
                        key: key
                      }
                    }).getHtml()}</td>`
                  );
                  tr.append(input).append(delFaIcon);
                });
            }
            function isSwitch(key, nowVal) {
              return $(`<input type="checkbox" class="offsecondary myprofileInput" key="${key}" ${nowVal == '1' ? 'checked' : ''}/>`); //pxdb_check
            }
            function textInput(key, nowVal) {
              return $(`<input type="text" class="silentinput myprofileInput" key="${key}" value="${nowVal}" />`);
            }
            $(document)
              .on('input', '.myprofileInput', function() {
                const $input = $(this);
                const data = {};
                let val = null;
                switch ($input.attr('type')) {
                  case 'checkbox':
                    val = $input.prop('checked') ? '1' : '0';
                    break;
                  default:
                    val = $input.val();
                    break;
                }
                data[$input.attr('key')] = val;
                myprofiles.save(data);
              })
              .on('click', '.delIcon', function() {
                const key = $(this).attr('key');
                myprofiles.delete(key);
                reflesh();
              });
          },
          makeFunction: function() {
            _UI.page.Function.html('');
            // ボタンエリアの作成
            const $buttonArea = $('<div>', { style: 'margin-bottom: 10px;width:100%;' });
            const $clearBtn = $('<button>', {
              class: 'pxdb_btn offout', // 既存のスタイルクラスを想定
              text: '一括クリア',
              on: {
                click: () => clearAll()
              }
            });
            $buttonArea.append('<h2>CSV Convert</h2>', $clearBtn);

            // 共通のスタイル
            const taStyle = 'width:31%; margin-right:1%; box-sizing:border-box; vertical-align:top;';

            const $textareaCSV = $('<textarea>', {
              class: 'nx',
              style: taStyle,
              rows: '8',
              placeholder: 'Excel / TSV',
              on: { input: () => updateFromCSV() }
            });

            const $textareaNXT = $('<textarea>', {
              class: 'nx',
              style: taStyle,
              rows: '8',
              placeholder: 'NXTable (JSON)',
              on: { input: () => updateFromNXT() }
            });

            const $textareaMD = $('<textarea>', {
              class: 'nx',
              style: taStyle,
              rows: '8',
              placeholder: 'Markdown',
              on: { input: () => updateFromMD() }
            });

            _UI.page.Function.append($buttonArea, $textareaCSV, $textareaNXT, $textareaMD);

            // --- 同期用関数 ---

            function updateFromCSV() {
              const raw = $textareaCSV.val();
              if (!raw.trim()) {
                clearAll();
                return;
              }
              const rows = raw
                .trim()
                .split('\n')
                .map(r => r.split('\t'));
              reflect(rows, [$textareaNXT, $textareaMD]);
            }

            function updateFromNXT() {
              const raw = $textareaNXT.val();
              if (!raw.trim()) {
                clearAll();
                return;
              }
              try {
                const rows = NMEX_Utils.nxtableToArray(raw);
                reflect(rows, [$textareaCSV, $textareaMD]);
              } catch (e) {
                /* パースエラー時は何もしない */
              }
            }

            function updateFromMD() {
              const raw = $textareaMD.val();
              if (!raw.trim()) {
                clearAll();
                return;
              }
              const rows = NMEX_Utils.markdownTableToArray(raw);
              if (rows.length > 0) {
                reflect(rows, [$textareaCSV, $textareaNXT]);
              }
            }
            function clearAll() {
              $textareaCSV.val('');
              $textareaNXT.val('');
              $textareaMD.val('');
            }
            /**
             * 取得した二次元配列を各テキストエリアに反映させる
             * @param {string[][]} rows
             * @param {jQuery[]} targets
             */
            function reflect(rows, targets) {
              targets.forEach($target => {
                if ($target === $textareaCSV) {
                  $target.val(rows.map(r => r.join('\t')).join('\n'));
                } else if ($target === $textareaNXT) {
                  $target.val(JSON.stringify({ head: rows[0], body: rows.slice(1) }, null, 2));
                } else if ($target === $textareaMD) {
                  $target.val(NMEX_Utils.arrayToMarkdownTable(rows));
                }
              });
            }
          }
        };
        this.init();
        this.setListener();
      }
      init() {
        const _this = this;
        const _UI = this.UI;
        //htmlデータ調整
        $('body')
          .html('')
          .addClass('pxdb_body');
        //CSSでこのページだけスクロールバーを細く
        $('body').before(`<style>
        ::-webkit-scrollbar {
          width: 10px;
        }
        ::-webkit-scrollbar-track {
          background: #fff;
          border: none;
          border-radius: 10px;
          box-shadow: inset 0 0 2px #777;
        }
        ::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 10px;
          box-shadow: none;
        }</style>`);
        //タイトルの変更
        $('title').text('ダッシュボード');
        //wapperの追加
        for (let key in _UI.wrap) {
          $('body').append(_this.UI.wrap[key]);
        }
        //pageとMenuの生成
        _UI.menu.inner.appendTo(_UI.wrap.menu);
        for (let key in _UI.page) {
          $('body').append(_this.UI.page[key]);
          _UI.menu.inner.append(
            `<div class="noselectable pagelink ${key == 'Dashboard' ? 'active' : ''}" page="${key}" order="${$(_UI.page[key]).attr(
              'order'
            )}">${key}</div>`
          );
        }
        _UI.menu.inner
          .find('div')
          .sort(function(a, b) {
            return parseInt($(a).attr('order')) > parseInt($(b).attr('order')) ? 1 : -1;
          })
          .appendTo(_UI.menu.inner);
        //headの生成
        _UI.head.innder.appendTo(_UI.wrap.head);
        for (let key in _UI.HeadItem) {
          _UI.head.innder.append(_UI.HeadItem[key]);
        }
        //DashItemの生成
        for (let key in _UI.DashItem) {
          (_UI.DashItem[key]?.dom || _UI.DashItem[key]?.class?.getNode())?.attr('order', _UI.DashItem[key].order)?.appendTo(_UI.page.Dashboard);
        }
        _UI.page.Dashboard.find('.pxdb_box .pxdbItembox')
          .sort(function(a, b) {
            return parseInt($(a).attr('order')) > parseInt($(b).attr('order')) ? 1 : -1;
          })
          .appendTo(_UI.page.Dashboard);
        //データ読み込み
        for (let key in this.getFunc) {
          _this.getFunc[key]();
        }
      }
      setListener() {
        const _this = this;
        $(document).on('click', '.pxdb_menu div.pagelink', function() {
          $('.pxdb_menu div.pagelink').removeClass('active');
          $(this).addClass('active');
          $('.pxdb_main').addClass('unshown');
          $(`.pxdb_main[page="${$(this).attr('page')}"]`).removeClass('unshown');
          $('.pagetitle').text($(this).text());
        });
        $(document).on('contextmenu', '.pxdb_infochip,.contextlink', function() {
          const targetUrl = $(this).attr('contexturl') || $(this).attr('url') || null;
          if (targetUrl) window.open(targetUrl);
          return false;
        });
        $(document).on('click', '.clicklink', function() {
          const targetUrl = $(this).attr('clickurl') || $(this).attr('url') || null;
          if (targetUrl) window.open(targetUrl);
          return false;
        });
        $(document).on('click', '.dbllink', function() {
          const targetUrl = $(this).attr('dblurl') || $(this).attr('url') || null;
          if (targetUrl) window.open(targetUrl);
          return false;
        });
        $(document).on('contextmenu', '.contextbacklink', function() {
          const targetUrl = $(this).attr('contextbackurl') || $(this).attr('url') || null;
          if (targetUrl)
            chrome.runtime.sendMessage({
              opennetzbackEx: targetUrl
            });
          return false;
        });
        $(document).on('dblclick', '.dblcopytable', function() {
          const table = this;
          showChoiceModal(
            'Tableエクスポート　出力形式を選んでください',
            [
              { label: 'CSV', value: 'csv' },
              { label: 'Markdown', value: 'markdown' },
              { label: 'Cancel', value: 'cancel' }
            ],
            choice => {
              switch (choice) {
                case 'csv':
                  clipper(tableToCSV(table, '\t'));
                  PX_Toast('CSVコピー完了');
                  break;
                case 'markdown':
                  clipper(tableToMarkdown(table));
                  PX_Toast('Markdownコピー完了');
                  break;
              }
            }
          );
        });
        $(document).on('click', '.reloadbtn', function() {
          _this.getFunc[$(this).attr('target')]({ force: true });
        });
        $(document).on('click', '.copytext', function() {
          var copytext = false;
          if ($(this).attr('url')) copytext = $(this).attr('url');
          if ($(this).attr('data-copy')) copytext = $(this).attr('data-copy');
          if (copytext) {
            clipper(copytext);
            PX_Toast('コピーしました');
          }
        });
      }
      notify(title, faname, url) {
        new FaIcon({
          name: `fa-solid fa-lg ${faname}`,
          addClass: 'contextlink',
          wrapper: true,
          attr: {
            title: title,
            url: url,
            target: '_blank'
          }
        })
          .getNode()
          .appendTo(this.UI.HeadItem.notify);
        return this;
      }
    }
    const DM = new DashMan();
  };
  FUNCTION_T.index_test = {};
  FUNCTION_T.index_test.analysis = function() {
    if (NX.SEARCHPARAMS.get('mode') != 'analysis') return false;
    //テスト問題のページを分析ページに　→　保留中（ダッシュボード上で運用）
    const $body = $('body');
    $body
      .html('')
      .addClass('pxdb_main')
      .append('<h2>分析</h2>');
    //CSSでこのページだけスクロールバーを細く
    $('body').before(`<style>
          ::-webkit-scrollbar {
            width: 10px;
          }
          ::-webkit-scrollbar-track {
            background: #fff;
            border: none;
            border-radius: 10px;
            box-shadow: inset 0 0 2px #777;
          }
          ::-webkit-scrollbar-thumb {
            background: #ccc;
            border-radius: 10px;
            box-shadow: none;
          }</style>`);
    //タイトルの変更
    $('title').text('分析');
  };
  FUNCTION_T.booth_select_head = {};
  FUNCTION_T.booth_select_head.CTXboothopen = function() {
    $('input[value="表示"]').on('contextmenu', function() {
      const params = {
        input1_dt: $('input[name=input1_dt]').val(),
        input2_dt: $('input[name=input2_dt]').val(),
        tenpo_cd: $('select[name=tenpo_cd]').val(),
        basename: $('select[name=tenpo_cd] option:selected').text()
      };
      window.open(`${NX.CONST.host}/kanren/booth2.aspx?hyoji_cb=2&${$.param(params)}`);
      return false;
    });
  };
  FUNCTION_T.student_schedule = {};
  FUNCTION_T.student_schedule.F2menu = function() {
    function shaping() {
      $('td').each(function() {
        $(this)
          .css('width', '14%')
          .attr('class', 'verysmall');
      });
      const $trs = $('tbody').find('tr');
      $trs
        .eq(0)
        .find('td')
        .text(localStorage.getItem('scheduletext') || 'アプリで最新の指導スケジュールがいつでも確認できます。是非、ご活用ください。');
      $trs
        .eq(1)
        .find('td')
        .attr('class', 'normal')
        .css('text-align', 'right');
      $trs
        .eq(2)
        .find('td')
        .attr('class', 'normal');
      $trs.eq(3).css('background-color', 'lightgray');
      $('table').attr('class', 'verysmall');
    }
    shaping();
  };
  FUNCTION_T.student_mailsend_input = {};
  FUNCTION_T.student_mailsend_input.chParam = async function() {
    const limit = getparameter('limit');
    const clip = getparameter('clip');
    if (limit) {
      $('#app_kigen_dt').val(limit);
      $('#app_flg,#aps_flg').prop('checked', true);
    }
    if (clip === 'true') {
      const textFromClip = await navigator.clipboard.readText();
      $('[name="message_nm"]').val(textFromClip);
    }
  };
})(this);

//Insertmenuの下側
(function() {
  popmenut_F2.setContentFunction(function() {
    $('<button>', {
      type: 'button',
      text: '$("form").serialize()',
      on: {
        click: () => {
          console.log('URL', location.href);
          //prettier-ignore
          console.log('form', $('form').serialize().toString())
        }
      }
    }).appendTo(this);
    $('<button>', {
      type: 'button',
      text: '右クリtr削除モード',
      on: {
        click: () => {
          $('tr').on('contextmenu', function() {
            $(this).remove();
            return false;
          });
          popmenut_F2.closemenu();
        }
      }
    }).appendTo(this);
    $('<button>', {
      type: 'button',
      text: '$("input,select").remove()',
      on: {
        click: () => {
          $('input,select').remove();
          popmenut_F2.closemenu();
        }
      }
    }).appendTo(this);
    $('<button>', {
      type: 'button',
      text: '$("br").remove()',
      on: {
        click: () => {
          $('br').remove();
          popmenut_F2.closemenu();
        }
      }
    }).appendTo(this);
    $('<button>', {
      type: 'button',
      text: '$("table").netztabler()',
      on: {
        click: () => {
          $('table').netztabler();
          popmenut_F2.closemenu();
        }
      }
    }).appendTo(this);

    $('<hr>').appendTo(this);
  });
})(this);
