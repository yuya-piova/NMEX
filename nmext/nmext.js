///<reference path="../jquery-3.4.1.min.js"/>
///<reference path="../jquery-ui.min.js"/>
///<reference path="../checker.js"/>
///<reference path="../dts/JQuery.d.ts"/>
///<reference path="../dts/jqueryui.d.ts"/>
///<reference path="../dts/global.d.ts"/>
///<reference path="../dts/chrome.d.ts"/>
///<reference path="../nmex-longconst.js"/>
///<reference path="../nmext/nmextg.js"/>
///<reference path="../nmexo/nmexog.js"/>
///<reference path="../nmext/nmextf.js"/>
///<reference path="../nmexo/nmexof.js"/>
///<reference path="../nmexo/nmexo.js"/>
/* eslint-disable no-duplicate-case */
/* eslint-disable no-fallthrough */

$(function() {
  console.log('new_nmext.js');
  /*/■■■■■■■■■■■■■■■■■■■■常に働く機能■■■■■■■■■■■■■■■■■■■■/*/
  if (document.domain != 'menu.edu-netz.com' && document.domain != 'menu2.edu-netz.com') return;
  //Caps Lock２回でisSpecialEnabledをOFFに
  FUNCTION_T.general.capsescaper();
  /*/■■■■■■■■■■■■■■■■■■■■以下スペシャルモードのみ■■■■■■■■■■■■■■■■■■■■/*/
  if (myprofiles.getone({ isSpecialEnabled: 0 }) == 1) {
    //スペシャルモードで全ページ発火
    //エリアモードなら自エリア以外除外
    FUNCTION_T.general.isAreaMode();
    //DatePickerを設定
    FUNCTION_T.general.set_datepicker();
    //一時的に必要な機能を入れる関数
    FUNCTION_T.general.temporary();
    //生徒名を右クリックして生徒メニューを表示
    FUNCTION_T.general.SLM();
    //社員ピッカーのセット
    FUNCTION_T.general.EMP_Picker();
    //教室の生徒講師情報保存
    FUNCTION_T.general.infoSave();
    //講師cdのinput要素にswipeを付与
    FUNCTION_T.general.teacherSwipe();
    //radio or checkboxのクリック範囲を拡大
    FUNCTION_T.general.checkboxClickHelper();
    //教室名右クリックでプロファイルに設定した教室にする
    FUNCTION_T.general.tenpoClicker();
    //ここからページ別発火
    switch (location.pathname) {
      //●●●●●●●●●●●●●●●●●●●●●●●●●●●●Genre：NMのレイアウト修正
      case '/netz/netz1/tehai/shido2_input_sp.aspx':
        //初回手配画面のレイアウトが崩れているので修正
        $('frameset').attr('rows', '136,*');
        break;
      case '/netz/netz1/s/teian_list.aspx':
        //ヘッド画面が微妙に小さい、、、
        $('frameset').attr('rows', '165,*');
        break;
      case '/netz/netz1/t/teacher_toroku_list.aspx':
        //なぜかスクロール禁止なので許可
        $('frame[name=teacher_toroku_list_head]')
          .removeAttr('scrolling')
          .removeAttr('noresize');
        break;
      case '/netz/netz1/kanren/booth2.aspx':
        //印刷時ボタンを非表示にする＆印刷をA3横にする
        $('body').before('<style>@media print {input{display:none;} size} @page {size: 420mm 297mm;}</style>');
        //教室名が送られてきたらタイトルに教室名を載せる
        if (getparameter('basename')) $('title').text(`ブース表${getparameter('basename')}`);
        break;
      case '/netz/netz1/kanren/booth_list_print.aspx':
        //A4タテで印刷
        $('body').before('<style>@page {size: 210mm 297mm;}</style>');
        const paramMode = NX.SEARCHPARAMS.get('mode');
        switch (paramMode) {
          case 'lecture':
            deleteExercise();
            break;
          case 'exercise':
            deleteLecture();
            break;
        }
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            text: 'リーダー講師なし削除',
            on: {
              click: () => {
                deleteNoLeader();
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
          $('<button>', {
            text: '指導のみ',
            on: {
              click: () => {
                deleteNoLeader();
                deleteExercise();
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
          $('<button>', {
            text: '演習のみ',
            on: {
              click: () => {
                deleteNoLeader();
                deleteLecture();
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
          $('<button>', {
            text: '演習番号削除',
            on: {
              click: () => {
                deteleExerNumber();
                popmenuo_F2.closemenu();
              }
            }
          }).appendTo(this);
        });
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
        break;
      case '/netz/netz1/schedule/shain_yotei.aspx':
        //社員予定表にswipe仕込む
        $('input[name=b_today]').swipe('今日～翌月', () => {
          $('input[name="input_f_dt"]').val(NX.DT.today.slash);
          $('input[name="input_t_dt"]').val(dateslash(window.dtnextmonth));
          $('input[name=b_submit]').trigger('click');
        });
        //tdに日付を仕込む
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
      case '/netz/netz1/schedule/yotei_input2_save.aspx':
        $('[name=b_close]').trigger('click');
        break;
      case '/netz/netz1/shingaku/kouza_enshu_shido_input_save.aspx':
        $('[name=b_close]').trigger('click');
        break;
      case '/netz/netz1/schedule/yotei2.aspx':
        $('[name=b_submit]').swipe('通常予定画面', () => {
          window.location.href = `${NX.CONST.host}/schedule/yotei.aspx`;
        });
      case '/netz/netz1/tehai/shido2_base_input.aspx':
        //すべてautocompleteをoffにする
        $('input').offAutocomplete();

        //startの変更で備考を自動的に入れる＆翌月末ボタンを追加
        $('#start_dt')
          .on('input', function() {
            $('textarea[name=bikou_nm]').val($NX(new ExDate($(this).val()).as('yyyy/mm ')).toFullWidth());
          })
          .swipe('翌月～', function() {
            this.val(
              new ExDate()
                .setDateTry(null, null, 1)
                .aftermonths(1)
                .as('yyyy/mm/dd')
            ).trigger('input');
            $('#end_dt').val('');
          });

        //科目名演習テンプレ
        $('input[name=kyoka_nm]')
          .swipe('atama+●●', function() {
            this.val('atama+');
            $('select[name=shido_jk_cb]')
              .val(3)
              .trigger('change');
          })
          .swipe('Diverse●級●●', function() {
            this.val('Diverse');
            $('select[name=shido_jk_cb]')
              .val(3)
              .trigger('change');
          });

        $('textarea[name=bikou_nm]').on('contextmenu', function() {
          const start_dt = $('#start_dt').val();
          $(this).val(`${$NX(new ExDate(start_dt).as('yyyy/mm')).toFullWidth()}　`);
          return false;
        });
        //バリデーション
        $('input[value="登録"]').prop('disabled', true);
        shido2_input_check();
        $(
          'select[name=teacher_cd],select[name=shido_jk_cb],input[name=kyoka_nm],input[name^=shido_flg],select[name=add_time],input[name=start_dt],input[name=end_dt],textarea[name=bikou_nm],input[month_vl]'
        ).on('change', function() {
          shido2_input_check();
        });
        $('td').on('click', function() {
          shido2_input_check();
        });
        function shido2_input_check() {
          let flg = false;
          const isTeacher = $('select[name=teacher_cd]').val() != '';
          const isSubject = $('input[name=kyoka_nm]').val() != '';
          const isSchedule = $('input[name^=shido_flg][value=1]').length == 1;
          const isAddTime = $('select[name=add_time]').val() != '';
          switch ($('select[name=shido_jk_cb]').val()) {
            case '7':
              //１対１指導
              flg = isTeacher && isSubject && isSchedule;
              break;
            case 'd':
              //Diverse1on1
              flg = isTeacher && isSubject && isSchedule;
              $('input[name=month_vl]').val([1]);
              $('input[name=kyoka_nm]').val('Diverse1on1');
              break;
            case '3':
            case 'b':
              //個別演習・来校
              flg = isSubject && isSchedule;
              break;
            case '9':
              //1on1
              flg = isTeacher && isSubject && isSchedule && isAddTime;
              break;
            default:
              flg = false;
              break;
          }
          $('input[value="登録"]').prop('disabled', !flg);
        }
        break;
      case '/netz/netz1/schedule/yotei.aspx':
        //エリア予定表に本日のswipeを仕込む
        $('button[class="ui-datepicker-trigger"]').swipe('本日', () => {
          $('form[name=form1]')['0'].action = 'yotei.aspx';
          $('form[name=form1]')['0'].input_dt.value = NX.DT.today.slash;
          $('form[name=form1]')['0'].submit();
        });
        break;
      case '/netz/netz1/text/text_haifu_save.aspx':
        //テキスト配布CH完了の確認ページはスキップ
        window.close();
        break;
      case '/netz/netz1/schedule/yotei_input.aspx':
        //予定表のその他と訪問をタスクとして利用
        FUNCTION_T.yotei_input.inputsupport();
        //予定表 → goole calendar → outlook
        FUNCTION_T.yotei_input.togas();
        //テンプレート機能
        FUNCTION_T.yotei_input.addtemplate();
        //連続登録の機能不全対策
        FUNCTION_T.yotei_input.renzoku();

        $('input[name=b_submit]').setshortcutkey('Enter', { ctrlkey: true });
        break;
      case '/netz/netz1/tehai/kanren_input_save.aspx':
      case '/netz/netz1/kanren/kanren_input_save.aspx':
        //関連登録画面開いたら即送信
        $('form[name=form1]')['0'].submit();
        break;
      case '/netz/netz1/shingaku/enshu_teacher_edit_save.aspx':
      case '/netz/netz1/shingaku/shingaku_teacher_edit_save.aspx':
      case '/netz/netz1/s/student_renraku_rireki_input_save.aspx':
        //関連登録画面開いたら即閉じる
        $('input[name=b_close]').trigger('click');
        break;
      case '/netz/netz1/tenpo.aspx':
        $('a[href^="java"]').on('contextmenu', async function() {
          //prettier-ignore
          const tenpo_cd = $(this).attr('href').getStrBetween("'", "'");
          const data = await $.get(`${NX.CONST.host}/inout/inout_open_log2.aspx?tenpo_cd=${tenpo_cd}&input_dt=${NX.DT.today.slash}`);
          console.log('ajxdata', data);
          $(data).appendTo('body');
          return false;
        });
        break;
      case '/netz/netz1/index_menu.html':
        $('td:contains("メンテナンス")').on('contextmenu', function() {
          window.open(`${NX.CONST.host}/index_system.aspx`);
          return false;
        });
        $('td:contains("テスト問題")').on('contextmenu', function() {
          window.open(`${NX.CONST.host}/index_test.aspx?mode=analysis`);
          return false;
        });
        $('td:contains("データベース")').on('contextmenu', function() {
          //別フレーム操作ってこんなにむずかったっけ・・・？
          parent.index.document.location.href = `${NX.CONST.host}/index_database.aspx?pal=score`;
          return false;
        });
        break;
      case '/netz/netz1/student_list.aspx':
        $('frameset').attr('rows', '150,*');
        if (getparameter('tenpo_cd')) {
          $('select[name=tempo_cd]').val(getparameter('tenpo_cd'));
          $('input[name=b_submit]').trigger('click');
        }
        break;
      //●●●●●●●●●●●●●●●●●●●●●●●●●●●●Genre：新規関連
      case '/netz/netz1/u/gessya_tenpo.aspx':
        //一時停止 mergeを垂直にやりたい
        if ($('[name=gakunen_cb]').val() == '' && $('#hyoji_cb').prop('checked') && false) {
          const storedNXT = new NXTable(JSON.parse(localStorage.getItem('studentCountNXT')));
          const shido_ng = $('#shido_ng').val();
          const parsedNXT = $NX('table')
            .makeNXTable({ omitSubrow: true })
            .analyze('校舎', ['合計(月謝発生生徒数)_1', 'sum', shido_ng])
            .transpose();
          storedNXT.merge(parsedNXT, true);
          localStorage.setItem('studentCountNXT', JSON.stringify(storedNXT.export('object')));

          console.log('storedNXT', storedNXT);
        }

        break;
      case '/netz/netz1/u/yosandata.aspx':
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            type: 'button',
            text: '取得',
            on: {
              click: async () => {
                $('hr')
                  .next('div')
                  .remove();
                $('table').remove();
                //const tenpo_cd = $('select[name=tenpo_cd]').val();
                const ymlist = ['2025/04', '2025/05', '2025/06', '2025/07', '2025/08'];
                const unitList = ['b3401', 'b3403', 'b3302', 'b3303', 'b3701'];
                const resultNXT = new NXTable();
                for (const tenpo_cd of unitList) {
                  for (const yyyymm of ymlist) {
                    await $.get(`${NX.CONST.host}/u/yosandata.aspx?tenpo_cd=${tenpo_cd}&shido_ng=${yyyymm}`, function(data) {
                      //$(`<h3>年月：${yyyymm}</h3>`).appendTo('body');
                      const table = $(data).find('table');
                      //table.appendTo('body');
                      const nxtable = $NX(table)
                        .makeNXTable()
                        .transpose()
                        .appendColumnEx(['ユニット', '年月'], () => [tenpo_cd, yyyymm], 0)
                        .deleteColumn('title');
                      resultNXT.merge(nxtable, true);
                    });
                  }
                }

                resultNXT.export('table').appendTo('body');
              }
            }
          }).appendTo(this);
        });
        break;
      case '/netz/netz1/toiawase_input.aspx':
        //名前のスペースと電話番号整形
        FUNCTION_T.toiawase_input.namenoformatter();
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
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            type: 'button',
            text: '連絡事項',
            class: 'nx',
            on: {
              click: () => {
                const student_cd = $('input[name=student_cd]').val();
                window.open(`${NX.CONST.host}/s/student_renraku_list.aspx?student_cd=${student_cd}`, '_blank');
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
          $('<button>', {
            type: 'button',
            text: '指導予定',
            class: 'nx',
            on: {
              click: () => {
                const student_cd = $('input[name=student_cd]').val();
                window.open(`${NX.CONST.host}/kanren/student_shido_yotei.aspx?student_cd=${student_cd}`, '_blank');
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
          $('<button>', {
            type: 'button',
            text: '新規用プロファイル',
            class: 'nx offsecondary',
            on: {
              click: () => {
                const student_cd = $('input[name=student_cd]').val();
                const toi_id = $('input[name=toi_id]').val();
                window.open(`${NX.CONST.host}/s/student_profile_nyukai_input.aspx?student_cd=${student_cd}&toi_id=${toi_id}`, '_blank');
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
        });
        break;
      case '/netz/netz1/toiawase_input_save.aspx':
        $('input[name=b_close]').trigger('click');
        break;
      case '/netz/netz1/toiawase_list_head.aspx':
        $('input[value="今日"][onclick^=dataset2]').swipe('本日以降', () => {
          $('input[name=input_dt11]').val(dateslash(window.dt));
          $('input[name=input_dt12]').val('');
        });
        break;
      case '/netz/netz1/s/student_renraku_list.aspx': {
        const student_cd = $('[name=student_cd]').val();

        //連絡事項の上部にiframe用ボタンを仕込む
        FUNCTION_T.student_renraku_list.topbuttons();

        FUNCTION_T.student_renraku_list.F2menu();

        //タブタイトルを生徒名に
        const renraku_student = $('td:contains("生徒名"):not(:contains("受付者"))')
          .next()
          .text();
        $('title').text(`${renraku_student}_連絡事項`);

        //アプリ連絡をサイズ可変に
        $('iframe').css('resize', 'vertical');

        //relpopを仕込む
        if ($NX(student_cd).isHexaNumber()) {
          $(document).on('contextmenu', '[text="関連"]', () => {
            relpop(student_cd);
            return false;
          });
        }

        break;
      }
      //●●●●●●●●●●●●●●●●●●●●●●●●●●●●Genre：現生徒面談関連
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

        //GASでzoom会議室作成をする
        FUNCTION_T.student_mendan_input.F2menu();
        break;
      }
      case '/netz/netz1/kanren/enshu_check_list.aspx':
        const { mode } = getparameter();
        if (mode == 'onlyDiverse') onlyDiverse();
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            text: 'Diverseのみ',
            on: {
              click: () => {
                onlyDiverse();
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
          $('<button>', {
            text: '保存',
            on: {
              click: () => {
                const outRuled = JSON.parse(localStorage.getItem('outRuled')) || {};
                $('tr:gt(0)').each(function() {
                  const texts = $(this).findTdGetTxt();
                  if (texts[3].includes('Diverse')) outRuled[`${texts[0]}_${texts[1]}_${texts[2]}`] = true;
                });
                localStorage.setItem('outRuled', JSON.stringify(outRuled));
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
          $('<button>', {
            text: '表示',
            on: {
              click: () => {
                const outRuled = JSON.parse(localStorage.getItem('outRuled')) || {};
                $('tr:gt(0)').each(function() {
                  const texts = $(this).findTdGetTxt();
                  if (outRuled[`${texts[0]}_${texts[1]}_${texts[2]}`]) $(this).append('<td>★</td>');
                });
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
        });
        function onlyDiverse() {
          $('tr:gt(0)').each(function() {
            if (
              !$(this)
                .findTdGetTxt(3)
                .includes('Diverse')
            )
              $(this).remove();
          });
        }
        break;

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
          $('[name=course_ng]').val('2025/11');
        });

        $('input[name=b_reload]').setshortcutkey('Enter');
        break;
      case '/netz/netz1/s/koshu_gakunen_shukei.aspx':
        const parentDoc = parent.teian_list_head.document;
        $('table')
          .find('tr:gt(0)')
          .each(function() {
            const $gradeTD = $(this)
              .find('td')
              .eq(0);
            const gakunenStr = $gradeTD.text();
            const params = {
              nendo_season_cb: $('select[name=nendo_season_cb] option:selected').val(),
              tenpo_cd: $('select[name=tenpo_cd] option:selected').val(),
              gakunen_cb: LCT.STUDENT.gradeTable[gakunenStr]
            };
            const gakunenURL = `${NX.CONST.host}/s/teian_list_body.aspx?${$.param(params)}`;
            $gradeTD.html(`<a class="silent" href="${gakunenURL}">${gakunenStr}</a>`).on('contextmenu', () => {
              for (let key in params) {
                $(parentDoc)
                  .find(`[name=${key}]`)
                  .val(params[key]);
              }
              return false;
            });
          });
        //平均単価を保存
        const LF_MendanAverage = localforage.createInstance({
          name: 'SnapData',
          storeName: 'MendanAvTable'
        });
        const savedTablesDiv = $('<div>', { class: 'unshown' }).appendTo('body');
        const savedTablesDiv2 = $('<div>', { class: 'unshown' }).appendTo('body');
        $('<button>', {
          class: 'px',
          text: '保存',
          on: {
            click: () => {
              const table = $('table');
              const NXTable = $NX(table).makeNXTable();
              LF_MendanAverage.setItem(new ExDate().as('yyyymmdd_HHMM'), NXTable.export('object'));
              refleshSelect();
            }
          }
        }).appendTo(savedTablesDiv);
        const savedTableSelect = $('<select>', {
          class: 'px',
          on: {
            change: async function() {
              if ($(this).val() == '') return false;
              const savedTable = await LF_MendanAverage.getItem($(this).val());
              savedTablesDiv2.html('').append(new NXTable(savedTable).export('table', { class: 'pxdb_table singleCaption' }));
            }
          }
        }).appendTo(savedTablesDiv);
        refleshSelect();
        async function refleshSelect() {
          savedTableSelect.html('<option value="">ーーー</option>');
          (await LF_MendanAverage.keys()).forEach(elem => {
            savedTableSelect.append(`<option value="${elem}">${elem}</option>`);
          });
        }
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            class: 'px offwarning',
            text: '平均単価保存',
            on: {
              click: () => {
                savedTablesDiv.toggleClass('unshown');
                savedTablesDiv2.toggleClass('unshown');
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
        });

        break;
      case '/netz/netz1/s/teian_list_body.aspx':
        //開くにスワイプボタン設置
        FUNCTION_T.teian_list_body.appendSwipeButton();
        //面談の集計をF2menuに入れる
        FUNCTION_T.teian_list_body.F2menu();
        //提案予定管理画面のメモ
        FUNCTION_T.teian_list_body.teianmemo();

        popmenut_F2.setContentFunction(function() {
          $(document).on('contextmenu', 'table', function() {
            clipper(tableToCSV($(this)[0], '\t'));
            PX_Toast('table copied');
            return false;
          });
        });
        break;
      case '/netz/netz1/k/moshikomi4_course_select.aspx':
        $('input[name*=_vl],input[name^=tmp]')
          .isAllNumeric(false)
          .offAutocomplete();
        break;
      case '/netz/netz1/k/moshikomi4_seikyu_input.aspx':
        //請求額を合計に合わせる
        $('[name=seikyu_gk1]').on('contextmenu', function() {
          $(this).val($('[name=sum_gk]').val());
          fireonpage('cluc_sum()');
          return false;
        });
        break;
      case '/netz/netz1/s/student_profile_mendan_input.aspx':
        FUNCTION_T.student_profile_mendan_input.notesaver();
        break;
      case '/netz/netz1/s/student_mailsend_input.aspx':
        //パラメータCH
        FUNCTION_T.student_mailsend_input.chParam();
        //開校予定メール
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            text: '開校予定メール',
            class: 'nx offprimary',
            on: {
              click: async () => {
                popmenut_F2.closemenu();
                const suggestedStart = new ExDate()
                  .aftermonths(1)
                  .setDateTry(null, null, 1)
                  .as('yyyy/mm/dd');
                const params = {
                  tenpo_cd: prompt('教室番号', '3416'),
                  input_f_dt: prompt('開始日', suggestedStart),
                  input_t_dt: null
                };
                const suggetedEnd = new ExDate(f_dt)
                  .aftermonths(1)
                  .setDateTry(null, null, 1)
                  .afterdays(-1)
                  .as('yyyy/mm/dd');
                params.input_t_dt = prompt('終了日', suggetedEnd);

                const url = `${NX.CONST.host}/tenpo_yotei.aspx?${$.param(params)}`;
                const ajxdata = await $.get(url);
                const timeList = [];
                const tenpo_nm = $(ajxdata)
                  .find('select[name=tenpo_cd]')
                  .find('option:selected')
                  .text();
                $(ajxdata)
                  .find('table')
                  .find('tr:gt(1)')
                  .each(function() {
                    const $tr = $(this);
                    const isClose = $tr.find('input[name^=kyuko_flg]').prop('checked');
                    const timeRange = `${$tr.findTdGetInput(3)}～${$tr.findTdGetInput(7)}`;
                    timeList.push(`${$tr.findTdGetTxt(0)} ${isClose ? '休校日' : timeRange}`);
                  });
                const monthStr = $NX(new ExDate(params.input_f_dt).as('mm')).toFullWidth();
                const mailTemplate = [
                  'お世話になります。ネッツです。',
                  `${monthStr}月の開校日時と休校日に関するお知らせです。`,
                  '自習も可能ですのでぜひご来校ください。',
                  '',
                  '【開校時間】',
                  '　平日　１６：３０～２２：００',
                  '　　※水曜を除く',
                  '　土曜　１０：４０～２１：２０',
                  '　日曜　１０：４０～１８：４０',
                  '',
                  '',
                  `【${monthStr}月の開校予定】`,
                  timeList.join('\n'),
                  '',
                  '１対１ネッツ'
                ].join('\n');
                $('input[name=title_nm').val(`【${tenpo_nm}校】${monthStr}月の開校日時と休校日のお知らせ`);
                $('textarea[name=message_nm]').val(mailTemplate);
                $('input[name=app_kigen_dt]').val(params.input_t_dt);
                $('input[name=app_flg],input[name=aps_flg]').prop('checked', true);
              }
            }
          }).appendTo(this);
        });
        break;
      case '/netz/netz1/k/moshikomi4_input.aspx':
      case '/netz/netz1/k/moshikomi4_keiyaku_input.aspx':
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            type: 'button',
            text: '作成日を今日に',
            on: {
              click: () => {
                $('#input_dt')
                  .attr('value', new ExDate().as('yyyy/mm/dd'))
                  .datepicker('update', new ExDate().as('yyyy-mm-dd'));
                $('#online_kigen_dt')
                  .attr('value', new ExDate().afterdays(7).as('yyyy/mm/dd'))
                  .datepicker('update', new ExDate().afterdays(7).as('yyyy-mm-dd'));
              }
            }
          }).appendTo(this);
        });
        break;
      case '/netz/netz1/k/moshikomi4_osusume_input.aspx':
        //おススメ講座選択に学年フィルターを付ける
        FUNCTION_T.moshikomi4_osusume_input.support();
        break;
      case '/netz/netz1/s/teian_shukei.aspx':
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            type: 'button',
            text: '集計',
            on: {
              click: () => {
                $('tr').each(function(e) {
                  const $tr = $(this);
                  if (e == 0) $tr.append('<td colspan="3">集計</td>');
                  if (e == 1) $tr.append('<td>達成-進捗</td><td>保留率(/申保)</td><td>無率(/申保無)</td>');
                  if ($tr.attr('style') == 'background-color:#dfdfff;') return true;
                  //達成-進捗
                  const tassei = $tr.findTdGetTxt(3, txt => parseFloat(txt.replace('%', '')));
                  const shintyoku = $tr.findTdGetTxt(9, txt => parseFloat(txt.replace('%', '')));
                  //保留率
                  const done = $tr.findTdGetTxt(10, txt => parseFloat(txt));
                  const pend = $tr.findTdGetTxt(12, txt => parseFloat(txt));
                  const nocontract = $tr.findTdGetTxt(13, txt => parseFloat(txt));
                  $tr.append(
                    `<td style="text-align:right;">${Math.round((tassei - shintyoku) * 10) / 10 ||
                      ''}%</td><td style="text-align:right;">${Math.round((pend / (done + pend)) * 100) ||
                      ''}%</td><td style="text-align:right;">${Math.round((nocontract / (done + nocontract + pend)) * 100) || ''}%</td>`
                  );
                });
              }
            }
          }).appendTo(this);
        });
        break;
      case '/netz/netz1/s/student_info_input.aspx':
        //生徒基本情報
        FUNCTION_T.student_info_input.template();
        break;
      case '/netz/netz1/s/shibo_input.aspx':
        //志望校情報
        //頭の悪いことに同じwindowで開くようになっているのでボタンを置き換えている
        const btnOnShibo_input = $('input[value="受験情報画面を開く"]');

        $('<button>', {
          type: 'button',
          text: '受験情報画面を開く',
          on: {
            click: () => {
              const student_cd = $('input[name=student_cd]').val();
              if ($NX(student_cd).isHexaNumber()) window.open(`${NX.CONST.host}/jyuken/goukaku_input.aspx?student_cd=${student_cd}`);
            }
          }
        }).insertAfter(btnOnShibo_input);

        btnOnShibo_input.remove();
        break;
      case '/netz/netz1/shingaku/shingaku_shido_input.aspx':
        $('select').on('contextmenu', function() {
          $(this).val($(this).val() == 0 ? 1 : 0);
          return false;
        });
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            type: 'button',
            text: '全員欠席に変更',
            on: {
              click: () => {
                $('select').val(0);
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
          $('<button>', {
            type: 'button',
            text: '生徒特記事項を削除',
            on: {
              click: () => {
                $('[name^=bikou_nm]').val('');
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
        });
        //出欠機能　特記事項に記載して右クリックすると発動
        $('textarea[name=shido_bikou_nm]').on('contextmenu', function() {
          const noassigned = $('<div style="position:absolute; top:100px;left:400px;border:1px solid gray"></div>')
            .draggable()
            .appendTo('body');
          const $targetTable = $('input[name=theme_nm]').closest('table');
          $targetTable.find('tr').each(function() {
            const $tr = $(this);
            const replacetxt = $tr.findTdGetTxt(0, txt => txt.replace('　', '').replace(' ', ''));
            $tr
              .find('td')
              .eq(0)
              .text(replacetxt);
          });
          const studentlist = $(this)
            .val()
            .split('\n')
            .map(name =>
              name
                .replace(/\(.+\)/g, '')
                .replace('　', '')
                .replace(' ', '')
            );

          const tdMap = new Map();
          $('td').each(function() {
            const text = $(this)
              .text()
              .trim();
            const $tr = $(this).closest('tr');
            tdMap.set(text, $tr);
          });
          studentlist.forEach(elem => {
            const $matchedTr = tdMap.get(elem);
            if ($matchedTr) {
              $matchedTr.find('input').val(elem);
            } else {
              $('<p>')
                .text(elem)
                .appendTo(noassigned);
            }
          });
          $(this).val('');
          return false;
        });
        break;
      case '/netz/netz1/jyuken/goukaku_input.aspx':
        $('<button>', {
          type: 'button',
          text: '志望校情報変更',
          on: {
            click: () => {
              window.open(`${NX.CONST.host}/s/shibo_input.aspx?student_cd=${$('input[name=gou_student_cd]').val()}`);
            }
          }
        }).appendTo('.shibo');
        break;
      //●●●●●●●●●●●●●●●●●●●●●●●●●●●●Genre：講師関連
      case '/netz/netz1/t/teacher_toroku_list_head.aspx':
        $('select[name=area_cd]').on('contextmenu', function() {
          $(this).val(['g']);
          return false;
        });
        break;
      case '/netz/netz1/t/teacher_toroku_input.aspx':
        //zoomメール作成（要URL作成＆特記事項に入力）
        FUNCTION_T.teacher_toroku_input.makezoommail();
        //電話番号や名前、メアドの整形セット
        FUNCTION_T.teacher_toroku_input.inputsupport();
        //右クリックで広島に
        $('select[name=area_cd]').on('contextmenu', function() {
          $(this).val(['g']);
          return false;
        });
        break;
      case '/netz/netz1/kanren/shido_leader_input.aspx':
        //リーダー講師設定
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            type: 'button',
            text: '号令講師自動設定',
            on: {
              click: function() {
                $('select[name^=teacher_cd]').each(function() {
                  const $select = $(this);
                  //講師ミーティング担当は”なし”に。name同じ。。。
                  if ($select.attr('name') == 'teacher_cd0') {
                    $select.val('000000');
                    return true;
                  }
                  //講師番号が若い順に並び替え
                  $select
                    .find('option')
                    .sort(function(a, b) {
                      return parseInt($(a).val()) - parseInt($(b).val());
                    })
                    .appendTo($select);
                  //一旦なしに変更（問題ないが並び替えると見た目だけ変わってしまう）
                  $select.val('000000');
                  //最も上にある◎に設定
                  $select.find('option').each(function() {
                    const $option = $(this);
                    if ($option.text().indexOf('◎') != -1) {
                      $select.val($option.val());
                      return false;
                    }
                  });
                });
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
        });
        break;
      case '/netz/netz1/t/worktime_daily_list.aspx':
        $.fn.isAllEmpty = function(startIndex = 0, endIndex = -1) {
          const cells = $(this)
            .find('td')
            .slice(startIndex, endIndex);
          let allEmpty = true;
          cells.each(function() {
            const isNotBlank =
              $(this)
                .text()
                .trim() !== '';
            if (isNotBlank) {
              allEmpty = false;
              return false;
            }
          });
          return allEmpty;
        };
        //出勤簿自動CH
        const isAutoMode = NX.SEARCHPARAMS.get('mode') == 'auto';
        if (isAutoMode) autoCheck();

        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            type: 'button',
            class: 'nx',
            text: '自動CH',
            on: {
              click: () => {
                autoCheck();
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
        });
        function autoCheck() {
          $('table')
            .find('tr')
            .each(function() {
              const $tr = $(this);
              const baseName = $tr.findTdGetTxt(1);
              const isApproved = $tr.findTdGetTxt(16).indexOf('済') != -1;

              //教室名が広島駅前or古江でなければスキップ　※一時的にユニット全部
              //if (baseName != '広島駅前' && baseName != '古江') return true;

              //すでに承認済みならスキップ
              if (isApproved) return true;

              const hasTime = !$tr.isAllEmpty(5, 12);
              const hasContent = $tr.findTdGetTxt(13) != '';

              //時間がない（＝交通費のみorただ入れただけ）もしくは、時間があって、コメント有にチェックを入れる
              if (!hasTime || (hasTime && hasContent)) $tr.find('[type=checkbox]').prop('checked', true);
            });
        }
        break;
      case '/netz/netz1/t/teacher_list_body.aspx':
        //teacherInfoを保存
        FUNCTION_T.teacher_list_body.saveTeacherInfo();

        //講師メモ
        FUNCTION_T.teacher_list_body.showMemo();

        $('table').netztabler();
        break;
      case '/netz/netz1/kanren/teacher_jikyu_input_save.aspx':
        $('input[value="閉じる（※元画面は更新されません）"]').click();
        break;
      case '/netz/netz1/kanren/teacher_jikyu_check.aspx':
        $('input[value="時給入力画面"]').each(function() {
          $(this).on('contextmenu', function() {
            const onclickStr = $(this).attr('onclick');
            const teacher_cd = onclickStr.getStrBetween("'", "'", 0);
            const student_cd = onclickStr.getStrBetween("'", "'", 1);
            const hourlyWage = JSON.parse(localStorage.getItem('hourlyWage')) || {};
            const inputWage = prompt('時給を入力', hourlyWage[teacher_cd] || '');
            if (!/\d{4}/.test(inputWage) && inputWage != '0') {
              window.alert('４桁の整数および０円ではありません');
              return false;
            }
            if ((inputWage || '') == '') return false;
            const shido_ng = $('input[name=shido_ng]').val();
            const dataStr = `shido_ng_ym=${shido_ng}&shido_gk=${inputWage}&ai_gk=${inputWage}&enshu_gk=${inputWage}&taiken_gk=${inputWage}&oneonone_gk=${inputWage}&bikou_nm=&student_cd=${student_cd}&teacher_cd=${teacher_cd}`;
            $.ajax({
              type: 'POST',
              url: `${NX.CONST.host}/kanren/teacher_jikyu_input_save_ajax.aspx`,
              dataType: 'text',
              cache: 'false',
              data: dataStr
            })
              .done(function(data) {
                console.log('Ajax Done: teacher_jikyu_input_save_ajax', data, dataStr);
                hourlyWage[teacher_cd] = inputWage;
                localStorage.setItem('hourlyWage', JSON.stringify(hourlyWage));
              })
              .fail(function(data) {
                console.log('Ajax Failed: teacher_jikyu_input_save_ajax', data, dataStr);
              });
            return false;
          });
        });
        break;
      case '/netz/netz1/k/moshikomi4_tsuika_input.aspx':
        $('[name=tmp_shido_gk]').on('contextmenu', function() {
          const bikouText = $('[name=memo_nm]').val();
          $(this).val(extractAndCalc(bikouText));
          return false;
        });

        //講習備考欄に数式を入れたら合計金額を出す
        function extractAndCalc(input) {
          // 半角の数字・記号だけを取り出し
          const expr = input.match(/[0-9+\-*/().]+/g)?.join('') ?? '';
          if (!expr) return 0;

          return evaluateExpression(expr);
        }

        // 括弧対応の計算ロジック
        function evaluateExpression(expr) {
          const tokens = tokenize(expr);
          const [result] = parseExpression(tokens);
          return result;
        }

        function tokenize(expr) {
          const regex = /\d+|\+|\-|\*|\/|\(|\)/g;
          return [...expr.matchAll(regex)].map(m => m[0]);
        }

        function parseExpression(tokens) {
          const stack = [];

          const parse = () => {
            const output = [];
            let opStack = [];

            const precedence = { '+': 1, '-': 1, '*': 2, '/': 2 };

            const applyOp = () => {
              const op = opStack.pop();
              const b = output.pop();
              const a = output.pop();
              switch (op) {
                case '+':
                  output.push(a + b);
                  break;
                case '-':
                  output.push(a - b);
                  break;
                case '*':
                  output.push(a * b);
                  break;
                case '/':
                  output.push(a / b);
                  break;
              }
            };

            while (tokens.length) {
              const token = tokens.shift();

              if (!isNaN(token)) {
                output.push(Number(token));
              } else if (token === '(') {
                output.push(parse()[0]);
              } else if (token === ')') {
                break;
              } else if (['+', '-', '*', '/'].includes(token)) {
                while (opStack.length && precedence[opStack[opStack.length - 1]] >= precedence[token]) {
                  applyOp();
                }
                opStack.push(token);
              }
            }

            while (opStack.length) applyOp();
            return [output[0]];
          };

          return parse();
        }

        break;
      case '/netz/netz1/kanren/teacher_jikyu_input.aspx':
        //prettier-ignore
        const isNotGroup =  $('body').html().match('進学教室') == null
        const hourlyWage = JSON.parse(localStorage.getItem('hourlyWage')) || {};
        const teacher_cd = $('input[name=teacher_cd]').val();

        //数字のみ入力可
        $('input[name$=_gk]').isAllNumeric();

        //元画面をリロードしないで登録
        const hackedBtn = $('<button>', {
          type: 'button',
          text: '登録',
          on: {
            click: function() {
              $.ajax({
                type: 'POST',
                url: './teacher_jikyu_input_save_ajax.aspx',
                dataType: 'text',
                cache: false,
                data: $('#form1').serialize()
              })
                .done(
                  // 取得成功時
                  function(data) {
                    const vl = data.split(',');
                    if (vl[0] == 'ok') {
                      //window.opener.location.reload();
                      hourlyWage[teacher_cd] = $('input[name=shido_gk]').val();
                      localStorage.setItem('hourlyWage', JSON.stringify(hourlyWage));
                      window.open('about:blank', '_self').close();
                    }
                  }
                )
                .fail(function(data) {
                  alert('エラーが発生しました');
                });
            }
          }
        }).insertAfter('input[name=b_update]');
        $('input[name=b_update]').remove();

        //保存されていたら自動反映
        if (isNotGroup && hourlyWage[teacher_cd]) {
          $('input[name$=_gk]').val(hourlyWage[teacher_cd]);
          hackedBtn.trigger('focus');
        }
        break;
      //●●●●●●●●●●●●●●●●●●●●●●●●●●●●Genre：現生徒運用関連
      case '/netz/netz1/moshi/moshi_list_body.aspx':
        $('table').studentLinker(1);
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
                  if (coachs[student_cd]) $(`<td>${coachs[student_cd]['担任']}</td>`).appendTo(this);
                });
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
        });
        break;
      case '/netz/netz1/s/student_renraku_rireki_input.aspx':
      case '/netz/netz1/s/student_renraku_input.aspx':
        FUNCTION_T.student_renraku_input.inputsupport();
        FUNCTION_T.student_renraku_input.notesaver();
        break;
      case '/netz/netz1/student_data_input.aspx':
        //googlemapを開く問い合わせ情報と詳細情報と２箇所あるので一般関数化
        //eslint-disable-next-line no-undef
        post_to_addr_setter();

        //兄弟情報にリンク　※div[text=兄弟情報]で捕まえられず、、
        $('table').studentLinker(0);
        break;
      case '/netz/netz1/s/student_studyplan_list.aspx':
        //仮会員証ページにしちゃう
        FUNCTION_T.student_studyplan_list();
        break;
      case '/netz/netz1/kanren/student_shido_yotei.aspx':
        //生徒の指導予定表示期間にswipe仕込む
        FUNCTION_T.student_shido_yotei.SWrange();

        //右クリックで手配の不要な文字列を削除（数学：など）
        $('input[name=b_edit]').each(function() {
          $(this).on('contextmenu', function() {
            const shido_id = $(this)
              .attr('onclick')
              .getStrBetween("'", "'");
            chrome.runtime.sendMessage({
              opennetzbackEx: `${NX.CONST.host}/kanren/shido_yotei_edit.aspx?id=${shido_id}&autoClean=true`
            });
            return false;
          });
        });
        break;
      case '/netz/netz1/text/text_list_body.aspx':
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            type: 'button',
            text: '（システム）にチェック',
            on: {
              click: () => {
                $('tr:contains("（システム）")')
                  .find('input[type=checkbox]')
                  .prop('checked', true);
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
        });
        break;
      case '/netz/netz1/k/kaiyaku_list_body.aspx':
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            text: '月謝取得',
            on: {
              click: function() {
                const yyyymm = prompt('年月を入力 yyyy/mm', new ExDate().as('yyyy/mm'));
                const regex = /^(19|20)\d{2}\/(0[1-9]|1[0-2])$/;
                if (!regex.test(yyyymm)) {
                  window.alert('yyyy/mmになっていません');
                  return false;
                }
                popmenut_F2.closemenu();
                $('tr').each(async function() {
                  const $tr = $(this);
                  const student_cd = $tr.findTdGetTxt(4);
                  if ($NX(student_cd).isHexaNumber()) {
                    const feeData = await new AjaxstudentInfoClass().fee(student_cd, '2025/11', '月謝');
                    $tr.append(`<td>${feeData.fee}</td>`);
                  }
                });
              }
            }
          }).appendTo(this);
        });
        break;
      case '/netz/netz1/tehai/shido_furikae_input.aspx':
        $('input').offAutocomplete();

        //現時刻ボタンの拡張（区分と担当もいれる）
        $('input[value="現時刻"]').on('click', function() {
          const $tr = $(this).parents('tr');
          $tr.find('select').val(2);
          $tr.find('[name$="tanto_nm"]').val(myprofiles.getone({ myname: '　' }).split('　')[0]);
        });

        //指導予定連絡事項ボタンを追加
        FUNCTION_T.shido_furikae_input.F2menu();

        //半角限定
        $('input[name=kekka_shido_tm_y],[name=kekka_shido_tm_m],[name=kekka_shido_tm_d]').isAllNumeric(false);

        //時間picker
        $('input[name=kekka_shido_tm]').netztimepicker(true);

        //曜日表示
        FUNCTION_T.shido_furikae_input.weekday();

        //講師名検索
        $('select[name=kekka_teacher_cd]').selectSearcher();

        //iframe用に短くする
        $('hr')
          .css('width', 650)
          .css('margin-left', '0px');
        break;
      case '/netz/netz1/kanren/tenpo_shido_kiroku_list.aspx':
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            type: 'button',
            text: '指導報告取得',
            on: {
              click: () => {
                $('table')
                  .find('tr')
                  .each(async function() {
                    const shido_id = $(this)
                      .attr('id')
                      ?.replace('td', '');
                    if (($(this).find('input[value="入力"]').length = 1)) {
                      const res = await ASI.lectureReport(shido_id, '1to1', true);
                      $(`<td>${res.comment}</td>`).appendTo(this);
                    }
                    if (($(this).find('input[value="1on1結果入力"]').length = 1)) {
                      const res = await ASI.lectureReport(shido_id, '1on1');
                      let txt = '';
                      for (let key in res) {
                        if (key != 'student_cd') txt = txt + res[key];
                      }
                      $(`<td>${txt}</td>`).appendTo(this);
                    }
                  });
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
          $('<button>', {
            type: 'button',
            text: '日割りの宿題取得',
            on: {
              click: () => {
                $('table tr').each(async function() {
                  const shido_id = $(this)
                    .attr('id')
                    ?.replace('td', '');
                  if (($(this).find('input[value="入力"]').length = 1)) {
                    const res = await ASI.lectureReport(shido_id, '1to1', true);
                    $(`<td>${res['kiroku1']}</td><td>${res['kiroku2']}</td>`).appendTo(this);
                  }
                });
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
        });
        break;
      case '/netz/netz1/u/uriage_list_body.aspx':
        $('table').neoTabler(0, 1);
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            text: '月謝コース取得',
            class: 'nx offajax',
            on: {
              click: () => {
                const yyyymm = prompt('取得したい年月は？ yyyy/mm', new ExDate().as('yyyy/mm'));
                if ($NX(yyyymm).isValidDateFormat('yyyy/mm')) {
                  console.error('正しくない日付形式です。yyyy/mmである必要があります。', yyyymm);
                  return false;
                }
                $('tr').each(async function() {
                  const $tr = $(this);
                  const student_cd = $tr.findTdGetTxt(1);
                  //tablerのフィルタリング行、ヘッダー行を弾く
                  if ($tr.css('visibility') == 'collapse' || !$NX(student_cd).isHexaNumber()) return true;
                  const feeData = await new AjaxstudentInfoClass().fee(student_cd, '2024/05');
                  $tr.append(`<td>${feeData.fee}</td><td>${feeData.course}</td>`);
                });
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
        });
        break;
      case '/netz/netz1/tehai/shido_edit_list.aspx':
        FUNCTION_T.shido_edit_list.F2menu();
        let isSupportApplied = false;

        //常時表示ONなら即適用
        if (myprofiles.getone({ showShidoEditSupport: 0 }) == 1) supportApply();
        //常時表示OFFならF2menuで適用
        popmenut_F2.setContentFunction(function() {
          if (isSupportApplied) return false;
          supportApply();
          popmenut_F2.closemenu();
        });

        function supportApply() {
          //レイアウト調整
          //FUNCTION_T.shido_edit_list.layoutchange();
          //autocompleteをオフに
          $('input[type=text]').offAutocomplete();
          //tracer,newCopy,Count
          FUNCTION_T.shido_edit_list.support();
          //曜日を表示＆timePicker
          FUNCTION_T.shido_edit_list.showYoubiSetPicker();
          //変更に色付け
          FUNCTION_T.shido_edit_list.changecolor();
          //swipeで備考欄変更
          FUNCTION_T.shido_edit_list.bikouSwipe();

          //新規追加にデフォルト値
          $('input[name=kt_jk]').val('0');
          $('input[name=shido_jikan]').val('45');
          $('input[name=pt_jk]').val('5');

          isSupportApplied = true;
        }
        break;
      case '/netz/netz1/tehai/shido_edit_check.aspx':
        //登録ボタンを右クリックで登録＆再表示
        const params = sessionStorage.getItem('params');
        $('[value="登録"]').on('contextmenu', function() {
          if (params) {
            chrome.runtime.sendMessage({
              opennetzbackEx: `${NX.CONST.host}/tehai/shido_edit_list.aspx?${params}`
            });
          }
          $(this).trigger('click');
          return false;
        });
        break;
      case '/netz/netz1/tehai/shido_input_save.aspx':
        $('[name=b_close]').trigger('click');
        break;
      case '/netz/netz1/s/student_info_input.aspx':
        //基本情報に引き継ぎ連絡事項のフォーマット挿入
        FUNCTION_T.student_info_input.F2menu();
        break;
      case '/netz/netz1/student_list_body.aspx':
        //生徒一覧画面で右クリックで連絡事項を開く
        FUNCTION_T.student_list_body.CTXrenrakuopen();

        //studentInfoを保存
        FUNCTION_T.student_list_body.saveStudentInfo();

        //生徒メモ
        FUNCTION_T.student_list_body.showMemo();

        //headの初期表示変更を即反映
        FUNCTION_T.student_list_body.shokiSync();

        //popメニュー（表示設定）
        FUNCTION_T.student_list_body.popmenu();

        $('table').netztabler(0);

        //学習計画（仮会員証）を追加
        $('select').each(function() {
          $(this).append('<option value="sp">仮会員証</option>');
        });
        break;
      case '/netz/netz1/kanren/student_schedule.aspx':
        //生徒スケジュール表を印刷仕様に
        FUNCTION_T.student_schedule.F2menu();
        break;
      case '/netz/netz1/shingaku/kouza_jyuko_list.aspx':
        //td内のstudent_cdに対してリンクを貼る
        $('table:contains("CD")').studentLinker();
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            type: 'button',
            text: 'ajxで担任取得',
            on: {
              click: function() {
                $('table:contains("CD")')
                  .find('tr')
                  .each(async function(e) {
                    if (e == 0) {
                      $(this).append('<td>担任</td><td>副担任</td>');
                      return true;
                    }
                    const student_cd = $(this).findTdGetTxt(2);
                    const ajx = await $.get(`${NX.CONST.host}/s/student_tanto_input.aspx?student_cd=${student_cd}`);
                    const tr = $(ajx)
                      .find('tr')
                      .eq(1);
                    const main = tr.findTdGetTxt(5);
                    const sub = tr.findTdGetTxt(6);
                    $(this).append(`<td>${main}</td><td>${sub}</td>`);
                  });
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
        });
        break;
      case '/netz/netz1/kanren/shido_first_list.aspx':
        //生徒情報ボタンを右クリックしたら連絡事項を開く
        $('input[value="生徒情報"]').on('contextmenu', function() {
          // eslint-disable-next-line no-undef,quotes
          const student_cd = $(this)
            .attr('onclick')
            .getstrbetween("'", "'", 0);
          window.open(`${NX.CONST.host}/s/student_renraku_list.aspx?student_cd=${student_cd}`);
          return false;
        });
        break;
      case '/netz/netz1/ai/1on1_input.aspx':
        const infotr = $('table:contains("生徒名")').find('tr');
        const student_name = infotr.eq(0).findTdGetTxt(1);
        const shido_date_str = infotr.eq(1).findTdGetTxt(3);
        const shido_date = new ExDate().setDateTry(null, shido_date_str.slice(0, 2), shido_date_str.slice(3, 5)).aftermonths(-1);
        $('title').text(`${shido_date.as('mm/dd')}_${student_name}_1ON1記録入力`);
        break;
      case '/netz/netz1/kanren/student_shido_kiroku_list.aspx':
      case '/netz/netz1/kanren/teacher_shido_kiroku_list.aspx':
        $('input[type="button"][value="1on1結果入力"]').on('contextmenu', function() {
          const shido_id = $(this)
            .attr('onclick')
            .getStrBetween("'", "'");
          window.open(`${NX.CONST.host}/ai/1on1_input.aspx?shido_id=${shido_id}`);
          return false;
        });
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            type: 'button',
            text: '講師コメント一覧',
            on: {
              click: () => {
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
          }).appendTo(this);
        });
        break;
      //トークで生徒名を選択できるようにする
      case '/netz/netz1/talk/talkmenu.aspx':
        $('#talk_title')
          .removeClass('txt_readonly')
          .css({
            'border-style': 'none',
            'text-align': 'center',
            'background-color': 'transparent',
            color: 'white',
            'font-weight': 'bold',
            width: '500px'
          });
        break;
      //個別演習報告
      case '/netz/netz1/attendance/shido_attendance_list.aspx':
        $('[name=tenpo_select]').append('<option value="a5031">中四国B</option>');
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            text: '備考欄取得',
            on: {
              click: function() {
                $('input[value="出欠登録"]').each(async function() {
                  const $this = $(this);
                  const onClick = $this
                    .attr('onclick')
                    .getStrBetween('(', ')')
                    .replaceAll("'", '')
                    .split(',');
                  const url = `${NX.CONST.host}/attendance/shido_attendance_input.aspx?shingaku_id=${onClick[2]}&tenpo_cd=${onClick[0]}&shido_tm=${onClick[1]}`;
                  const ajx = await $.get(url);
                  const bikou = $(ajx)
                    .find('[name=bikou_nm]')
                    .text();
                  $this.parents('tr').append(`<td>${bikou}</td>`);
                });
              }
            }
          }).appendTo(this);
        });
        break;
      //●●●●●●●●●●●●●●●●●●●●●●●●●●●●Genre：ブース・手配関連
      case '/netz/netz1/t/teacher_schedule_day.aspx':
        const schedule = {};
        $('table:contains("週間基本")')
          .find('tr:gt(0)')
          .each(function() {
            const $tr = $(this);
            const td0 = $tr.findTdGetTxt(0);
            const date = new ExDate(td0).resolveYear();
            schedule[+date] = {
              str: date.as('yyyy/mm/dd'),
              time: $tr.findTdGetTxt(1)
            };
          });
        break;
      case '/netz/netz1/kanren/booth_select_head.aspx':
        FUNCTION_T.booth_select_head.CTXboothopen();
        $('input[name=input2_dt]')
          .swipe('～月末', () => {
            $('[name=input1_dt]').val(NX.DT.today.slash);
            $('[name=input2_dt]').val(NX.DT.EOM.slash);
          })
          .swipe('～講習期間', () => {
            $('[name=input1_dt]').val(NX.DT.today.slash);
            $('[name=input2_dt]').val(NX.DT.Koshu_END.slash);
          })
          .swipe('講習期間', () => {
            $('[name=input1_dt]').val(NX.DT.Koshu_START.slash);
            $('[name=input2_dt]').val(NX.DT.Koshu_END.slash);
          });
        break;
      case '/netz/netz1/kanren/booth_list.aspx':
        //報告済チェックボタンの右クリックかスワイプで、すべてCHし登録
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
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            text: 'Diverse登録画面を開く',
            on: {
              click: () => {
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
                          // 8番目のtdの中のa要素のテキストを取得し、トリムして返す
                          return $(this).find('td').eq(eqStudentName).find('a').text().trim();
                        }
                        return null;
                      })
                      .get()
                  )
                ];
                popmenut_F2.closemenu();

                //遷移先のロードを待って反映
                const diverseWindow = window.open('https://lms2.s-diverse.com/');
                setTimeout(() => {
                  diverseWindow.postMessage(DiverseList, 'https://lms2.s-diverse.com');
                }, 3000);
              }
            }
          }).appendTo(this);
        });
        break;
      case '/netz/netz1/tehai/tehai_input.aspx': {
        const { doAction, forceSubject } = getparameter();
        //数値だけの入力、オートコンプリートオフ
        $('input[name$=_vl]').isAllNumeric();
        $('input').offAutocomplete();

        //自動入力（整形＆エラー回避）
        //回数空欄の場合は時間と期間を削除
        FUNCTION_T.tehai_input.setRange();

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

        const student_cd = $('input[name=student_cd').val();
        const iframe = new IframeMakerEx({ x: 1100, y: 10, draggable: true });

        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            text: '手配中にして登録',
            class: 'nx',
            on: {
              click: () => {
                applyToSubject();
                $('select[name=jyotai_cb]').val('1');
                $('input[name=b_submit]').trigger('click');
              }
            }
          }).appendTo(this);
          $('<button>', {
            text: '手配済にして登録',
            class: 'nx offwarning',
            on: {
              click: () => {
                applyToSubject();
                $('select[name=jyotai_cb]').val('5');
                $('input[name=b_submit]').trigger('click');
              }
            }
          }).appendTo(this);
          $('<button>', {
            text: 'プロファイル',
            class: 'nx offsecondary',
            on: {
              click: () => {
                iframe.loadUrl(`${NX.CONST.host}/s/student_profile_input.aspx?student_cd=${student_cd}`);
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
          $('<button>', {
            text: '契約情報',
            class: 'nx offsecondary',
            on: {
              click: () => {
                iframe.loadUrl(`${NX.CONST.host}/k/student_keiyaku_data.aspx?student_cd=${student_cd}`);
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
        });

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

        break;
      }
      case '/netz/netz1/tehai/shido2_input_sp_check.aspx':
        //手配入力画面でマスターを使う
        FUNCTION_T.shido2_input_sp_check.setmaster();
        break;
      case '/netz/netz1/kanren/shido_yotei_input.aspx':
        const student_cd = $(document)
          .find('input[name=student_cd]')
          .val();

        //relpop
        $('input[name=kanren]').on('contextmenu', function() {
          relpop(student_cd);
          return false;
        });

        //時間入力のサポート
        $('input[name=shido_tm_h],input[name=shido_tm_m]')
          .offAutocomplete()
          .isAllNumeric(false)
          .netztimepicker(true, 'input[name=shido_tm_h]', 'input[name=shido_tm_m]');

        //追加指導予定のデフォルトは45分
        $('input[name=shido_jikan]').val(45);

        //適切に入っていなければ登録ボタンを押せなくする
        FUNCTION_T.shido_yotei_input.validation();

        //曜日をクリックしたら一括設定
        FUNCTION_T.shido_yotei_input.tracer();

        FUNCTION_T.shido_yotei_input.F2menu();

        break;
      case '/netz/netz1/kanren/shido_yotei_edit.aspx': {
        //autoCleanモードだったら不要文字種を消す
        if (NX.SEARCHPARAMS.get('autoClean') == 'true') {
          $('[name=bikou_nm]')
            .valReplace('[ ↑ ]')
            .valReplace('[ ↓ ]')
            .valReplace('△')
            .valRegexReplace(/^.*?：/)
            .valReplace('(', '（')
            .valReplace(')', '）');
          $('input[value=修正登録する]').trigger('click');
        }

        const student_cd = $('input[name=student_cd]').val();

        //数値のみ
        $('input[name=shido_tm_y],[name=shido_tm_m],[name=shido_tm_d]').isAllNumeric(false);

        //指導時間picker
        $('input[name=shido_tm_hn]').netztimepicker(true);
        //ブース番号picker
        // prettier-ignore
        $('input[name=booth_no]')
            .offAutocomplete()
            .netzpicker([1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20]);

        //指導時間のpickerと教科名に備考をswipeで仕込む
        FUNCTION_T.shido_yotei_edit.inputsupport();

        //relpop
        if ($NX(student_cd).isHexaNumber()) {
          $('select[name=teacher_cd]').swipe('関連P', () => relpop(student_cd));
          popmenut_F2.setContentFunction(function() {
            $('<button>', { type: 'button', text: '関連P', class: 'nx', on: { click: () => relpop(student_cd) } }).appendTo(this);
          });
        }
        break;
      }
      case '/netz/netz1/shingaku/kouza_list.aspx':
        popmenut_F2.setContentFunction(function() {
          //進学教室生徒一覧取得
          $('<button>', {
            type: 'button',
            text: '生徒一覧取得',
            on: {
              click: async function() {
                const trs = $('tr:gt(0)').toArray();

                let resultTable;

                for (let i = 0; i < trs.length; i++) {
                  const tr = trs[i];
                  const $tr = $(tr);
                  const shingaku_id = $tr.findTdGetTxt(5);

                  if (/^\d{5}$/.test(shingaku_id)) {
                    const html = await $.get(`${NX.CONST.host}/shingaku/kouza_jyuko_list.aspx?shingaku_id=${shingaku_id}`);
                    if (i === 0) {
                      resultTable = $(html)
                        .find('table:contains("生徒名")')
                        .appendTo('body');
                    } else {
                      $(html)
                        .find('table:contains("生徒名")')
                        .find('tr:gt(0)')
                        .appendTo(resultTable);
                    }
                  }
                }
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
        });

        break;
      case '/netz/netz1/shingaku/kouza_enshu_jyuko_list.aspx':
        //演習講座の名簿作成
        FUNCTION_T.kouza_enshu_jyuko_list.F2menu();
        //生徒CDを右クリックで連絡事項を開く
        $('table').studentLinker(1);
        break;
      case '/netz/netz1/shingaku/kouza_enshu_shido_input.aspx':
        //disabledを強制的に外す
        $('tr')
          .has('input:disabled')
          .on('dblclick', function() {
            $(this)
              .find('input:disabled')
              .prop('disabled', false);
          });
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            type: 'button',
            class: 'nx',
            text: 'disabled解除',
            on: {
              click: () => {
                $('input[type=checkbox]:disabled').prop('checked', false);
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
          //日付指定のUIを作るのが手間なので、データでのみ処理をする
          $('<button>', {
            type: 'button',
            class: 'nx offajax',
            text: '複数日程一括登録',
            on: {
              click: () => {
                //return window.alert('一時停止中。スクリプトのaddDatasを変更して実行してください'), false;

                const commonData = {
                  id: $('input[name=shingaku_id]').val(),
                  shingaku_id: $('input[name=shingaku_id]').val(),
                  tenpo_cd: $('input[name=tenpo_cd]').val(),
                  kaiko_tenpo_cd: $('input[name=kaiko_tenpo_cd]').val(),
                  add_student_cd: $('select[name=add_student_cd]').val(), //'526560',
                  add_teacher_cd: '000396',
                  add_kyoka_nm: '',
                  add_tm: '20:15',
                  doSave: 'true'
                };
                const addStudentName = $(`select[name=add_student_cd] option[value="${commonData.add_student_cd}"]`).text();
                if (!addStudentName) return window.alert('add_student_cdが存在しません', commonData.add_student_cd), false;

                if (!confirm(`共通パラメータは${commonData.add_teacher_cd},${commonData.add_tm},${addStudentName} です。`)) return false;

                const addDatas = [
                  { add_dt: '2025/10/09' },
                  { add_dt: '2025/10/16' },
                  { add_dt: '2025/10/23' },
                  { add_dt: '2025/10/30' },
                  { add_dt: '2025/11/06' },
                  { add_dt: '2025/11/13' },
                  { add_dt: '2025/11/20' },
                  { add_dt: '2025/11/27' },
                  { add_dt: '2025/12/04' },
                  { add_dt: '2025/12/11' },
                  { add_dt: '2025/12/18' }
                ];
                if (
                  !confirm(
                    `追加日時は、${addDatas[0]?.add_dt || ''}、${addDatas[1]?.add_dt || ''}、${addDatas[2]?.add_dt || ''}...です。よろしいですか`
                  )
                )
                  return false;
                const addDatas_mon = [
                  { add_dt: '2025/09/01' },
                  { add_dt: '2025/09/08' },
                  { add_dt: '2025/09/15' },
                  { add_dt: '2025/09/22' },
                  { add_dt: '2025/10/06' },
                  { add_dt: '2025/10/13' },
                  { add_dt: '2025/10/20' },
                  { add_dt: '2025/10/27' },
                  { add_dt: '2025/11/03' },
                  { add_dt: '2025/11/10' },
                  { add_dt: '2025/11/17' },
                  { add_dt: '2025/11/24' },
                  { add_dt: '2025/12/01' },
                  { add_dt: '2025/12/08' },
                  { add_dt: '2025/12/15' }
                ];
                const addDatas_tue = [
                  { add_dt: '2025/09/02' },
                  { add_dt: '2025/09/09' },
                  { add_dt: '2025/09/16' },
                  { add_dt: '2025/09/23' },
                  { add_dt: '2025/10/07' },
                  { add_dt: '2025/10/14' },
                  { add_dt: '2025/10/21' },
                  { add_dt: '2025/10/28' },
                  { add_dt: '2025/11/04' },
                  { add_dt: '2025/11/11' },
                  { add_dt: '2025/11/18' },
                  { add_dt: '2025/11/25' },
                  { add_dt: '2025/12/02' },
                  { add_dt: '2025/12/09' },
                  { add_dt: '2025/12/16' }
                ];
                const addDatas_thu = [
                  { add_dt: '2025/09/04' },
                  { add_dt: '2025/09/11' },
                  { add_dt: '2025/09/18' },
                  { add_dt: '2025/09/25' },
                  { add_dt: '2025/10/09' },
                  { add_dt: '2025/10/16' },
                  { add_dt: '2025/10/23' },
                  { add_dt: '2025/10/30' },
                  { add_dt: '2025/11/06' },
                  { add_dt: '2025/11/13' },
                  { add_dt: '2025/11/20' },
                  { add_dt: '2025/11/27' },
                  { add_dt: '2025/12/04' },
                  { add_dt: '2025/12/11' },
                  { add_dt: '2025/12/18' }
                ];
                const addDatas_fri = [
                  { add_dt: '2025/09/05' },
                  { add_dt: '2025/09/12' },
                  { add_dt: '2025/09/19' },
                  { add_dt: '2025/09/26' },
                  { add_dt: '2025/10/10' },
                  { add_dt: '2025/10/17' },
                  { add_dt: '2025/10/24' },
                  { add_dt: '2025/10/31' },
                  { add_dt: '2025/11/07' },
                  { add_dt: '2025/11/14' },
                  { add_dt: '2025/11/21' },
                  { add_dt: '2025/11/28' },
                  { add_dt: '2025/12/05' },
                  { add_dt: '2025/12/12' },
                  { add_dt: '2025/12/19' }
                ];
                const addDatas_sat = [
                  { add_dt: '2025/09/06' },
                  { add_dt: '2025/09/13' },
                  { add_dt: '2025/09/20' },
                  { add_dt: '2025/09/27' },
                  { add_dt: '2025/10/04' },
                  { add_dt: '2025/10/11' },
                  { add_dt: '2025/10/18' },
                  { add_dt: '2025/10/25' },
                  { add_dt: '2025/11/01' },
                  { add_dt: '2025/11/08' },
                  { add_dt: '2025/11/15' },
                  { add_dt: '2025/11/22' },
                  { add_dt: '2025/11/29' },
                  { add_dt: '2025/12/06' },
                  { add_dt: '2025/12/13' }
                ];
                addDatas.forEach((addData, index) => {
                  const params = { ...commonData, ...addData };
                  setTimeout(() => {
                    chrome.runtime.sendMessage({
                      opennetzbackEx: `${NX.CONST.host}/shingaku/kouza_enshu_shido_input.aspx?${$.param(params)}`
                    });
                  }, index * 2000);
                });
              }
            }
          }).appendTo(this);
        });
        //パラメーターを持ってきたら自動登録
        const getpal = getparameter();
        if (getpal.add_dt && getpal.add_dt && getpal.add_teacher_cd) {
          ['add_dt', 'add_tm', 'add_student_cd', 'add_teacher_cd', 'add_kyoka_nm'].forEach(key => {
            if (getpal[key]) $(`[name=${key}]`).val(getpal[key]);
          });
          $('input[name=add_jikan]').val(45);
          if (getpal.doSave === 'true') $('input[name=b_submit]').trigger('click');
        }
        break;
      case '/shingaku/kouza_enshu_shido_input_save.aspx':
        $('input[name=b_close]').trigger('click');
        break;
      case '/netz/netz1/shingaku/kouza_enshu_shido_input_check.aspx':
        $('input[name=b_submit]').trigger('click');
        break;
      case '/netz/netz1/tehai/kanren_input.aspx':
      case '/netz/netz1/kanren/kanren_input.aspx':
        //生徒NG登録
        if (sessionStorage.kanrendel == 'true') {
          $('input[name=status_cb]').val(['1']);
          sessionStorage.kanrendel = 'false';
          $('input[value="　登録　"]').trigger('click');
        }
        $('input[name=ng_nm]').swipe('生徒NG', () => {
          $(this).val('生徒NG');
          $('table')
            .find('input[type=radio][name$=_cb]')
            .val([0]);
          $('input[name=status_cb]').val([2]);
          $('input[value="　登録　"]').trigger('click');
        });
        break;
      case '/netz/netz1/kanren/shido3_kaisu_check.aspx':
        const $table = $('table');
        $table.studentLinker(0);
        const loadKiteimemoData = function() {
          kiteimemolist = JSON.parse(localStorage.getItem('kiteimemolist')) || {};
          $('.kiteimemo').each(function() {
            if (kiteimemolist[$(this).attr('data-studentcd')]) {
              $(this).text(kiteimemolist[$(this).attr('data-studentcd')] || '');
            }
          });
        };
        //規定回数CH用
        var kiteimemolist;
        var studentcd;
        $('tr').each(function(e) {
          if (e == 0) $('<td>規定メモ</td>').appendTo(this);
          studentcd = $(this)
            .find('td')
            .eq(0)
            .text();
          $(`<td class="kiteimemo" data-studentcd="${studentcd}"></td>`).appendTo(this);
        });
        loadKiteimemoData();
        $(document).on('dblclick', '.kiteimemo', function() {
          const inputtxt = prompt('Input text', $(this).text() || '');
          if (inputtxt != null) {
            kiteimemolist = JSON.parse(localStorage.getItem('kiteimemolist')) || {};
            kiteimemolist[$(this).attr('data-studentcd')] = inputtxt;
            localStorage.setItem('kiteimemolist', JSON.stringify(kiteimemolist));
            loadKiteimemoData();
          }
        });
        break;
      case '/netz/netz1/tenpo_input.aspx':
        //autoOpenだったら開店をクリック（ダッシュボードから開く場合）
        if (NX.SEARCHPARAMS.get('mode') == 'autoOpen') $('input[value="開店報告をする"]').trigger('click');
        break;
      case '/netz/netz1/s/student_tanto_list.aspx':
        //student_linker設置
        $('.ch_student').each(function() {
          const student_cd = $(this).val();
          const studentTD = $(this)
            .closest('tr')
            .find('td')
            .eq(2);
          const student_nm = studentTD.text();
          studentTD.html(
            $('<a></a>', {
              href: `${NX.CONST.host}/s/student_renraku_list.aspx?student_cd=${student_cd}`,
              target: `student_renraku_list_${student_cd}`,
              text: student_nm,
              class: `studentLinker silent`,
              student_cd,
              student_nm
            })
          );
        });
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            type: 'button',
            text: '担任数計算',
            on: {
              click: () => {
                const coachCountMap = {};
                // 担任・副担任のカウント
                $('table tr:gt(0)').each(function() {
                  const $tr = $(this);
                  const mainCoach = $tr.findTdGetTxt(6);
                  const subCoach = $tr.findTdGetTxt(7);

                  if (!coachCountMap[mainCoach]) coachCountMap[mainCoach] = { main: 0, sub: 0 };
                  if (!coachCountMap[subCoach]) coachCountMap[subCoach] = { main: 0, sub: 0 };

                  coachCountMap[mainCoach].main += 1;
                  coachCountMap[subCoach].sub += 1;
                });

                const $resultTable = $('<table>')
                  .append(`<tr><td>社員</td><td>担任数</td><td>副担数</td></tr>`)
                  .appendTo('body');

                for (const coach in coachCountMap) {
                  const { main, sub } = coachCountMap[coach];
                  $resultTable.append(`<tr><td>${coach}</td><td>${main}</td><td>${sub}</td></tr>`);
                }
              }
            }
          }).appendTo(this);
        });
        break;
      case '/netz/netz1/tenpo_yotei.aspx':
        /*
        //開校予定一括入力
        const basedTable = $('table');
        const templateTable = $('<table>', {
          border: '1',
          cellpadding: '1',
          cellspacing: '1',
          style: 'border-collapse: collapse'
        }).appendTo('body');
        //prettier-ignore
        basedTable.find('tr').eq(1).clone().appendTo(templateTable);

        //３行目を基準に週の行を作る
        const basedTr = basedTable.find('tr').eq(2);
        ['月', '火', '水', '木', '金', '土', '日'].forEach(date => {
          const tr = basedTr.clone();
          tr.find('td')
            .eq(0)
            .text(date);
          tr.find('input').each(function() {
            $(this)
              .removeAttr('name title id')
              .addClass('template')
              .data('date', date)
              .prop('checked', false)
              .val('');
          });
          tr.appendTo(templateTable);
        });
        //つくりかけ。name消したらトレーシングできなかった、、、
        */

        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            type: 'button',
            text: 'メール送付用',
            on: {
              click: () => {
                let summaryText = '';

                $('[name^=kyuko_flg]').each(function() {
                  const $tr = $(this).closest('tr');
                  const dayText = $tr.findTdGetTxt(0);

                  if ($(this).prop('checked')) {
                    summaryText += `\n${dayText}　休校日`;
                  } else {
                    const openTime = $tr.find('[name^=open_tm]').val() || '';
                    const closeTime = $tr.find('[name^=close_tm]').val() || '';
                    summaryText += `\n${dayText}　${openTime}～${closeTime}`;
                  }
                });

                $('<textarea>', {
                  text: summaryText.trim()
                }).appendTo('body');

                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
        });
        break;
      //●●●●●●●●●●●●●●●●●●●●●●●●●●●●Genre：成績関連
      case '/netz/netz1/seiseki/seiseki_search_body.aspx':
        //テスト名一括設定
        FUNCTION_T.seiseki_serch_body.F2menu();
      //break不要
      // eslint-disable-next-line no-fallthrough
      case '/netz/netz1/seiseki/seiseki_input.aspx':
      case '/netz/netz1/seiseki/seiseki_input2.aspx':
        //autocompleteを消す
        $('input[type=text],input[type=url]').attr('autocomplete', 'off');
        break;
      case '/netz/netz1/s/student_schedule_app_day.aspx':
        let iframe;
        $('<button>', {
          type: 'button',
          text: '指導予定',
          on: {
            //prettier-ignore
            click: function() {
              const student_cd = $('input[name=ch_student_cd]').val().replaceAll("'", '');
              const $trs = $('#mainarea').find('tr');
              const from_dt = new ExDate($trs.eq(1).attr('id')).as('yyyy/mm/dd');
              const to_dt = new ExDate($trs.eq($trs.length - 2).attr('id')).as('yyyy/mm/dd');
              iframe = new IframeMakerEx({ iframeName: 'yotei', x: 600, y: 100, draggable: true }).loadUrl(
                `${NX.CONST.host}/kanren/student_shido_yotei.aspx?student_cd=${student_cd}&input1_dt=${from_dt}&input2_dt=${to_dt}`
              );
            }
          }
        }).insertAfter('input[value="ネッツメニューにデータ反映"]');

        break;
      //●●●●●●●●●●●●●●●●●●●●●●●●●●●●Genre：タスク関連
      case '/netz/netz1/todo/todo_rireki_input.aspx':
        //生徒タスクでstudentInfoClassにあったらstudentLinkerを設定する
        const $taskNameTD = $('tr')
          .eq(0)
          .find('td')
          .eq(1);
        const studentName = $taskNameTD
          .text()
          .trim()
          .replace('生徒：', '');
        const matchedInfo = new studentInfoClass().search(['生徒名', studentName]);
        if (matchedInfo?.['生徒NO']) {
          $taskNameTD.html(
            $('<a></a>', {
              href: `${NX.CONST.host}/s/student_renraku_list.aspx?student_cd=${matchedInfo['生徒NO']}`,
              target: `student_renraku_list_${matchedInfo['生徒NO']}`,
              text: $taskNameTD.text().trim(),
              class: `studentLinker silent`,
              student_cd: matchedInfo['生徒NO'],
              student_nm: studentName,
              title: `カナ：${matchedInfo['カナ']},学年：${matchedInfo['学年']}`
            })
          );
        }
        //パラメーターを持ってきてたら自動処理する
        switch (getparameter('flag')) {
          case 'done':
            $('select[name=jyotai_cb]').val('F');
            $('input[name^=checklist]')
              .val(1)
              .prop('checked', true);
            $('#progress_vl,#progress_vl2').val(100);
            //$('input[name=b_submit]').click();
            $.ajax({
              type: 'POST',
              url: `${NX.CONST.host}/todo/todo_rireki_input_save_ajax.aspx`,
              dataType: 'text',
              cache: false,
              data: $('form').serialize()
            })
              .done(function(data) {
                if (data.split(',')[0] == 'ok') window.close();
              })
              .fail(function() {
                alert('エラーが発生しました');
              });
            break;
        }
        //右クリックで小項目CHをした場合、％を変える
        $('input[name^=checklist]').on('contextmenu', function() {
          $(this).prop('checked', !$(this).prop('checked'));
          const totalcount = $('input[name^=checklist]').length;
          const nowcount = $('input[name^=checklist]:checked').length;
          const ratio = Math.round((nowcount / totalcount) * 100);
          $('#progress_vl').val(ratio);
          if (ratio == 100) $('#jyotai_cb').val('F');
          if (ratio < 100 && ratio > 0) $('#jyotai_cb').val('D');
          if (ratio == 0) $('#jyotai_cb').val('A');
          fireonpage('progress_range()');
          return false;
        });
        break;
      case '/netz/netz1/todo/todo_input.aspx': {
        const start_dt = $('#start_dt');
        const end_dt = $('#end_dt');
        const kigen_dt = $('#kigen_dt');
        const kigen_tm = $('#kigen_tm');
        const jyotai_cb = $('select[name=jyotai_cb]');
        //パラメーターを持ってきてたら自動処理する
        let { setStart, setEnd, setDeadLine, setTime, doSave, setState, doAction } = getparameter();
        switch (doAction) {
          case 'autoClose':
            const nextTue = new ExDate().nextday('火').as('yyyy/mm/dd');
            const hasDeadLine = kigen_dt.val() != '';
            const [nowStart, nowEnd, nowKigen] = [start_dt.val(), end_dt.val(), kigen_dt.val()];
            const dtslash = new ExDate().afterdays(-1).as('yyyy/mm/dd');
            if (hasDeadLine) {
              //終了日が空欄なら、終了日＝最終期限
              setEnd = nowEnd != '' ? nowEnd : nowKigen;
              //開始日が空欄なら、開始日＝終了日or最終期限、今日の早い方
              if (nowStart == '') setStart = new ExDate(Math.min(new Date(nowKigen), new Date(setEnd), new Date())).as('yyyy/mm/dd');
            } else {
              if (nowEnd == '') {
                //空欄ならすべて今日、もしくは開始日
                setStart = nowStart != '' ? nowStart : dtslash;
                setEnd = setStart;
                setDeadLine = setStart;
              } else {
                //終了日があれば、開始日は本日か終了日の早い方、期限は終了日
                setStart = new ExDate(Math.min(new Date(nowEnd), new ExDate())).as('yyyy/mm/dd');
                setDeadLine = nowEnd;
              }
            }
            if (kigen_tm.val() == '00:00' || kigen_tm.val() == '') setTime = '21:00';
            $('#kigen_flg').prop('checked', false);
            doSave = true;
            break;
        }
        //状態を変更する
        const allowedState = ['F', 'X', 'D', 'C'];
        if (allowedState.includes(setState || '')) jyotai_cb.val(setState);
        //完了なら全チェックを入れる
        if (setState == 'F') $('input[name^=checklist_flg]').prop('checked', true);
        //開始日を変更する
        if (setStart) start_dt.val(setStart);
        //終了日を変更する
        if (setEnd) end_dt.val(setEnd);
        //期限を変更する
        if (setDeadLine) kigen_dt.val(setDeadLine);
        //時間を変更する
        if (setTime) kigen_tm.val(setTime);
        //保存する
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
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            type: 'button',
            text: '完了',
            on: {
              click: () => {
                jyotai_cb.val('F');
                $('#b_submit').trigger('click');
              }
            }
          }).appendTo(this);
          $('<button>', {
            type: 'button',
            text: '講師一覧を取得',
            on: {
              click: async () => {
                const tenpo_cd = prompt('校舎cdを入力してください', myprofiles.getone({ mybase: '3416' }));
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
                  PX_Toast('講師データの取得に失敗しました', { type: 'error' });
                }
              }
            }
          }).appendTo(this);
        });
        $('#start_dt,#end_dt,#kigen_dt').offAutocomplete();
        $('#start_dt').on('contextmenu', function() {
          $(this).val(new ExDate().as('yyyy/mm/dd'));
          return false;
        });
        $('#end_dt,#kigen_dt')
          .on('contextmenu', function() {
            $(this).val(new ExDate().as('yyyy/mm/dd'));
            return false;
          })
          .on('change', function() {
            const thisval = $(this).val();
            end_dt.val(thisval);
            kigen_dt.val(thisval);
          });
        $(document).on('contextmenu', '#cd_select', function() {
          $(this).emppicker();
        });
        //初期設定
        if (kigen_tm.val() == '00:00') kigen_tm.val('21:00');

        //テンプレート
        $('input[name=base_id]').netzpicker([['終了調整', 80323]]);

        break;
      }
      case '/netz/netz1/todo/todo_tenpo_list.aspx':
      case '/netz/netz1/todo/todo_list.aspx':
        //日付のオートコンプリートをOFFにする
        $('[name$=_dt]').offAutocomplete();
        //生徒タスクでstudentInfoClassにあったらstudentLinkerを設定する
        const studentInfo = new studentInfoClass();
        $('tr').each(function() {
          const $tr = $(this);
          const taskName = $tr.findTdGetTxt(2);
          const matchedInfo = studentInfo.search(['生徒名', taskName.replace('生徒：', '')]);
          if (!matchedInfo?.['生徒NO']) return true;
          $tr
            .find('td')
            .eq(2)
            .html(
              $('<a>', {
                href: `${NX.CONST.host}/s/student_renraku_list.aspx?student_cd=${matchedInfo['生徒NO']}`,
                target: `student_renraku_list_${matchedInfo['生徒NO']}`,
                text: taskName,
                class: `studentLinker silent`,
                student_cd: matchedInfo['生徒NO'],
                student_nm: matchedInfo['生徒名'],
                title: `カナ：${matchedInfo['カナ']},学年：${matchedInfo['学年']}`
              })
            );
        });
        //フラグ右クリックで全選択
        $('#personal_flg,#student_flg,#teacher_flg,#tenpo_flg,label').on('contextmenu', function() {
          $('#personal_flg,#student_flg,#teacher_flg,#tenpo_flg').prop('checked', !$(this).prop('checked'));
          return false;
        });

        //１回目に開く場合はチェックボックスを作る
        let init = false;
        popmenut_F2.setContentFunction(function() {
          if (!init) {
            $('input[value="修正"]').each(function() {
              const $btn = $(this);

              //taskidをonclickから取得
              const onclickAttr = $btn.attr('onclick');
              if (!onclickAttr) return;
              const taskidMatch = onclickAttr.match(/'([^']+)'/);
              if (!taskidMatch || !taskidMatch[1]) return;
              const taskid = taskidMatch[1];

              // チェックボックスを作成・挿入
              $('<input>', {
                type: 'checkbox',
                name: 'apbalk_ch',
                taskid: taskid
              }).insertAfter($btn);

              //修正ボタン右クリックで完了に
              $btn.off('contextmenu.apbalk').on('contextmenu.apbalk', function(e) {
                e.preventDefault();
                $(this)
                  .parents('tr')
                  .remove();
                chrome.runtime.sendMessage({
                  opennetzbackEx: `${NX.CONST.host}/todo/todo_input.aspx?setState=F&doSave=true&id=${taskid}`
                });
              });
            });
            init = true;
          }

          $('<button>', {
            type: 'button',
            class: 'nx',
            text: 'CHタスク完了',
            on: {
              click: () => applyToCheckedTask({ setState: 'F', doSave: true }, { trRemove: true, closeMenu: true })
            }
          }).appendTo(this);
          $('<button>', {
            type: 'button',
            class: 'nx',
            text: 'CHタスク作業中',
            on: {
              click: () => applyToCheckedTask({ setState: 'D', doSave: true }, { unChecked: true, closeMenu: true })
            }
          }).appendTo(this);
          $('<button>', {
            type: 'button',
            class: 'nx offdanger',
            text: 'CHタスク中止',
            on: {
              click: () => applyToCheckedTask({ setState: 'C', doSave: true }, { trRemove: true, closeMenu: true })
            }
          }).appendTo(this);

          $('<button>', {
            type: 'button',
            class: 'nx offsecondary',
            text: '不適切期日にCH',
            on: {
              click: function() {
                const maxCount = prompt('最大数を入力', 50);
                let count = 0;
                //prettier-ignore
                $('[name=apbalk_ch]').each(function() {
                  const $this = $(this);
                  if (count >= maxCount) return false;
                  const duration = $this.closest('tr').findTdGetTxt(7);
                  if (duration == '' || duration.endsWith('～')) {
                    $this.prop('checked', true);
                    count++;
                  }
                });
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
          $('<button>', {
            type: 'button',
            class: 'nx offsecondary',
            text: '要指導フォローにCH',
            on: {
              click: function() {
                const maxCount = prompt('最大数を入力', 50);
                let count = 0;
                //prettier-ignore
                $('tr:contains("１対１指導要フォロー")').each(function() {
                  const $this = $(this);
                  if (count >= maxCount) return false;
                  $(this).find('input[type="checkbox"]').prop('checked', true);
                  count++;
                });
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
          $('<button>', {
            type: 'button',
            class: 'nx offajax',
            text: 'CHタスク期限を適正化',
            on: {
              click: () => applyToCheckedTask({ doAction: 'autoClose' }, { unChecked: true, closeMenu: true })
            }
          }).appendTo(this);
          $('<button>', {
            type: 'button',
            class: 'nx offajax',
            text: 'CHタスク期限を適正化（Delay）',
            on: {
              click: () => applyToCheckedTask({ doAction: 'autoClose' }, { unChecked: true, closeMenu: true, delay: true })
            }
          }).appendTo(this);

          /**
           * 指定されたパラメータを使って、チェックされたタスクに対して処理を実行します。
           *
           * @param {Object} params - URLに付加するパラメータオブジェクト。
           * @param {Object} [options={}] - オプション設定。
           * @param {boolean} [options.unChecked=false] - 処理後にチェックを外すかどうか。
           * @param {boolean} [options.trRemove=false] - 処理後に親の<tr>要素をDOMから削除するか。
           * @param {boolean} [options.closeMenu=true] - 処理後にメニューを閉じるかどうか。
           * @returns {boolean|undefined} - paramsが未指定の場合は false を返す。それ以外は何も返さない。
           */
          function applyToCheckedTask(params, options = {}) {
            const { unChecked = false, trRemove = false, closeMenu = true, delay = false } = options;
            if (!params) {
              console.warn('noParameters');
              return false;
            }
            $('input[name=apbalk_ch]:checked').each(function(index) {
              const $this = $(this);
              const taskid = $this.attr('taskid');
              const url = `${NX.CONST.host}/todo/todo_input.aspx?${$.param(params)}&id=${taskid}`;
              if (delay) {
                setTimeout(function() {
                  chrome.runtime.sendMessage({
                    opennetzbackEx: url
                  });
                }, index * 1000);
              } else {
                chrome.runtime.sendMessage({
                  opennetzbackEx: url
                });
              }

              if (unChecked) $this.prop('checked', false);
              if (trRemove) $this.parents('tr').remove();
            });
            if (closeMenu) popmenut_F2.closemenu();
          }
        });
        break;
      //●●●●●●●●●●●●●●●●●●●●●●●●●●●●Genre：出社関連
      case '/netz/netz1/kintai/yotei_input.aspx':
        //出社予定の一括入力
        $(document).on('input', '[name=bulkinp]', function() {
          const $master = $(this);
          const day = $master.attr('day');
          const target = $master.attr('target');
          if ($master.attr('type') == 'checkbox') {
            $(`tr:contains("${day}")`)
              .find(`[name^=${target}]`)
              .prop('checked', $master.prop('checked'));
          } else {
            $(`tr:contains("${day}")`)
              .find(`[name^=${target}]`)
              .val($master.val());
          }
        });
        popmenut_F2.setContentFunction(function() {
          $('<style>button{width:auto!important}</style>').appendTo('body');
          $('<button>一括入力表示</button>')
            .appendTo(this)
            .on('click', () => {
              const temptable = $('<table>').appendTo('body');
              ['月', '火', '水', '木', '金', '土', '日'].forEach(day => {
                $('<tr></tr>')
                  .append(`<td>${day}</td>`)
                  .append(`<td><input type="text" name="bulkinp" target="basho" day="${day}"></td>`)
                  .append(`<td><input type="time" name="bulkinp" target="yotei_tm" day="${day}" size="6" value=""></td>`)
                  .append(`<td><input type="time" name="bulkinp" target="t_yotei_tm" day="${day}" size="6" value=""></td>`)
                  .append(`<input type="checkbox" name="bulkinp" target="holiday_flg" day="${day}" value="">`)
                  .append(`<button type="button" class="timeset" data-name="usual" day="${day}">通常</button>`)
                  .append(`<button type="button" class="timeset" data-name="vacA" day="${day}">A勤怠</button>`)
                  .append(`<button type="button" class="timeset" data-name="vacB" day="${day}">B勤怠</button>`)
                  .append(`<button type="button" class="timeset" data-name="vacC" day="${day}">C勤怠</button>`)
                  .append(`<button type="button" class="timeset" data-name="exam" day="${day}">模試</button>`)
                  .append(`<button type="button" class="timeset" data-name="headU" day="${day}">本部通常</button>`)
                  .append(`<button type="button" class="timeset" data-name="headV" day="${day}">本部講習</button>`)
                  .appendTo(temptable);
              });
              popmenut_F2.closemenu();
            });
        });
        $(document).on('click', '.timeset', function() {
          const timeval = TG.workingHours[$(this).attr('data-name')][$(this).attr('day')];
          $(this)
            .closest('tr')
            .find('[target=yotei_tm]')
            .val(timeval.from)
            .trigger('input');
          $(this)
            .closest('tr')
            .find('[target=t_yotei_tm]')
            .val(timeval.to)
            .trigger('input');
        });
        break;
      case '/netz/netz1/index_system.aspx':
        //メンテナンスのページをダッシュボードに
        FUNCTION_T.index_system.dashboard();
        break;
      case '/netz/netz1/index_test.aspx':
        //テスト問題のページを分析ページに
        FUNCTION_T.index_test.analysis();
        break;
      case '/netz/netz1/t/health_check_input.aspx':
        //出社時報告
        FUNCTION_T.start_input_kintai.auto();
        break;
      case '/netz/netz1/kintai/start_input_kintai.aspx':
        //健康チェック
        FUNCTION_T.start_input_kintai.auto();
        //勤怠入力せずにトップメニューに行く
        $('h2').on('contextmenu', function() {
          location.href = `${NX.CONST.host}/index1.html`;
          return false;
        });
        break;
      case '/netz/netz1/s/schedule_input_check.aspx':
        //予定表をタスクマネージャーとして使う
        FUNCTION_T.schedule_input_check.inputsupport();
        break;
    }
  }
});
