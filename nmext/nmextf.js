///<reference path="../libraries/jquery-3.4.1.min.js"/>
///<reference path="../libraries/jquery-ui.min.js"/>
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

//F8はpopmenu移行用の避難場所とする
const popmenut_F8 = new Popmenumaker('popmenut_F8', 119);

(function() {
  console.log('走る走るFUNCTION_Tたち');
  FUNCTION_T.general = {};

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
    popmenut_F8.setContentFunction(function() {
      //モード切り替え
      const onoff = [
        { title: 'OFF', value: 0 },
        { title: 'ON', value: 1 }
      ];
      myprofiles.maketogglebutton('生徒メモ', 'showMemo', onoff).appendTo(this);
      myprofiles.maketogglebutton('生徒情報保存', 'showInfosave', onoff).appendTo(this);
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
    popmenut_F8.setContentFunction(function() {
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
  FUNCTION_T.shido_furikae_input = {};
  FUNCTION_T.shido_furikae_input.F2menu = function() {
    const tableWidth = $('table')['0'].clientWidth;
    const iframe = new IframeMakerEx({ iframeName: 'shido_furikae_input', x: tableWidth + 20, y: 10, draggable: true, savePosition: false });
    const student_cd = $('input[name=student_cd]').val();

    popmenut_F8.setContentFunction(function() {
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
    popmenut_F8.setContentFunction(function() {
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
    popmenut_F8.setContentFunction(function() {
      $('<button>', {
        type: 'button',
        text: 'ログ読み込み',
        class: 'nx',
        on: {
          click: () => {
            menlog.loadAll();
            popmenut_F8.closemenu();
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
            popmenut_F8.closemenu();
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
            popmenut_F8.closemenu();
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
    popmenut_F8.setContentFunction(function() {
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
            popmenut_F8.closemenu();
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
            popmenut_F8.closemenu();
          }
        }
      }).appendTo(this);
      $('<button>', {
        type: 'button',
        text: '仮会員証',
        on: {
          click: () => {
            window.open(`${NX.CONST.host}/s/student_studyplan_list.aspx?student_cd=${student_cd}`);
            popmenut_F8.closemenu();
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
  FUNCTION_T.teian_list_body = {};
  FUNCTION_T.teian_list_body.F2menu = function() {
    popmenut_F8.setContentFunction(function() {
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
    popmenut_F8.setContentFunction(function() {
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
            popmenut_F8.closemenu();
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
            popmenut_F8.closemenu();
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
            popmenut_F8.closemenu();
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
                  openTabBack: `${NX.CONST.host}/s/student_mendan_input.aspx?nendo_season_cb=${inputNendo}${inputSeason_cb}&student_cd=${student_cd}&mode=autoChange&teacher_cd=${teacher_cd}&mendan_jk=${inputLength}`
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
            popmenut_F8.closemenu();
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
                openTabBack: `${NX.CONST.host}/s/student_mendan_input.aspx?nendo_season_cb=${inputNendo}${inputSeason_cb}&student_cd=${student_cd}&mode=autoChange&mendan_status_cb=d&bikou_nm=月謝固定&mendan_tm=9:00&mendan_dt=2025/10/01&mendan_jk=30`
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
            popmenut_F8.closemenu();
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
            popmenut_F8.closemenu();
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
            popmenut_F8.closemenu();
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
          popmenut_F8.closemenu();
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
        popmenut_F8.closemenu();
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
      popmenut_F8.setContentFunction(function() {
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
    popmenut_F8.setContentFunction(function() {
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
            popmenut_F8.closemenu();
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
            popmenut_F8.closemenu();
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
            popmenut_F8.closemenu();
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
    popmenut_F8.setContentFunction(function() {
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
    popmenut_F8.setContentFunction(function() {
      $('<button>', {
        text: '長期目標テンプレ',
        on: {
          click: () => {
            $('textarea[name=mokuhyo1_nm]').val(LCT.TEMPLATE.Student.future);
            popmenut_F8.closemenu();
          }
        }
      }).appendTo(this);
      $('<button>', {
        text: '基本情報テンプレ',
        on: {
          click: () => {
            $('textarea[name=student_info_detail_nm]').val(LCT.TEMPLATE.Student.kihoninfo);
            popmenut_F8.closemenu();
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
            SeasonalLog: $('<div class="unshown pxdb_main" page="SeasonalLog" order="11"></div>'),
            Marathon: $('<div class="unshown pxdb_main" page="Marathon" order="13" />')
          },
          DashItem: {},
          HeadItem: {
            title: $('<div style="font-size:1.5rem;line-height:2" class="pagetitle fg-10">Dashboard</div>')
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
              openTabBack: targetUrl
            });
          return false;
        });

        $(document).on('click', '.reloadbtn', function() {
          _this.getFunc[$(this).attr('target')]({ force: true });
        });
        $(document).on('click', '.copytext', function() {
          var copytext = false;
          if ($(this).attr('url')) copytext = $(this).attr('url');
          if ($(this).attr('data-copy')) copytext = $(this).attr('data-copy');
          if (copytext) {
            navigator.clipboard.writeText(copytext);
            PX_Toast('コピーしました');
          }
        });
      }
    }
    const DM = new DashMan();
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
})(this);
