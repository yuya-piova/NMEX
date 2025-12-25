///<reference path="./nmexog.js" />
///<reference path="./nmexof.js"/>
///<reference path="../nmext/nmextg.js"/>
///<reference path="../dts/JQuery.d.ts"/>
///<reference path="../dts/jqueryui.d.ts"/>
///<reference path="../dts/global.d.ts"/>
///<reference path="../dts/chrome.d.ts"/>
/*
///<reference path="../libraries/pivot.min.js"/>
*/
//グローバル変数
/**@type {Popmenumaker} */
var popmenuo_F2 = new Popmenumaker('popmenuo_F2', 113);
/**@type {Popmenumaker} */
var popmenuo_ins = new Popmenumaker('popmenuo_ins', 45);
/**@type {Popmenumaker} */
var popmenuo_PB = new Popmenumaker('popmenuo_PB', 19);

/**@type {Popmenumaker} */
var popmenuo_F2_mode = new Popmenumaker('popmenuo_F2_mode', 113);
Popmenumaker.makeAndroidbutton(113);

$(function() {
  //popmenu
  FUNCTION_O.all_page.popmenu();
  FUNCTION_O.all_page.viewSelectval();
  new MakeAtamaLinks().all_links();
  //予定表の
  $('input[name$=tm][type="text"]').attr('type', 'tel');

  if (document.domain != 'menu.edu-netz.com' && document.domain != 'menu2.edu-netz.com') return;
  var pal = getparameter();
  var i;

  //チェックモード
  if (pal.checker == 'on') {
    for (var key in CheckerJS) {
      if (location.pathname == CheckerJS[key].pathname) CheckerJS[key].check();
    }
  }

  //class="netztablerbutton"は印刷時に消える
  $('body').append('<style>@media print { .netztablerbutton{display:none;}}</style>');

  if (localStorage.getItem('blind') === 'true') $('body').append('<style>.netzblind{opacity:0.1;}</style>');

  //jsrenderファイルのロード
  FUNCTION_O.all_page.loadtemplate();

  //すべてのtdにつけたいツールチップ
  FUNCTION_O.all_page.tdtips();

  //TODO datepickerにスワイプ機能を付けたい
  /*new Rightdragger(".ui-datepicker-trigger,td:has(.ui-state-default)",
		function(){
			$(this.startobject).click();
		},function(){
			$(this.endobject).click();
			console.log(this);
		})*/

  //スワイプ用多分不要
  /*
  $('html').on('mouseup', function() {
    $('.swipeobj').remove();
    removeswipediv();
  });
  */

  switch (location.pathname) {
    case '/netz/netz1/s/teian_list_body.aspx':
      FUNCTION_O.teian_list_body.karutehyouji();
      break;
  }

  console.log('nmexo.js');
  //変数系

  //自動オンオフ機能(名前が違うならば強制的に通常モード変更)
  FUNCTION_O.all_page.autoNormalmode();

  //開校とかで入力したときに右に名前が載るやつを自動的に
  if (myprofiles.getone({ isSpecialEnabled: 0 })) {
    console.log(location.pathname);
    switch (location.pathname) {
      //問合せ
      case '/netz/netz1/toiawase_list_head.aspx':
        $('input[name=b_submit]').setshortcutkey('Enter');
        //本日対応を表示させる
        FUNCTION_O.toiawase_list_head.default();

        FUNCTION_O.toiawase_list_head.daybuttons();
        break;
      case '/netz/netz1/toiawase_list_head2.aspx': {
        $('input[name=b_submit]').setshortcutkey('Enter');

        break;
      }

      case '/netz/netz1/toiawase_list_body.aspx':
        //trにいろんな情報追加
        $('table tr').each(function() {
          $(this)
            .addDatafortr('toi_id', function() {
              console.log(String($(this).attr('id')).substring(2));
              return String($(this).attr('id')).substring(2);
            })
            .addDatafortr('student_cd', function() {
              return getStrBetween(
                $(this)
                  .find('input[value="開く"]')
                  .attr('onclick'),
                "'",
                "'",
                0
              );
            });
        });
        //Trim
        FUNCTION_O.student_list_body.trim();

        if (top?.frames.length != 0) $('select[name=menu_cb]', top?.frames[0].document.body).netztracer('select[name^=d]');

        $('table').netztabler();
        break;

      //ブース
      case '/netz/netz1/kanren/booth_select_head.aspx':
        //ボタンを改造
        $('input[name=input1_dt],input[name=input2_dt]').attr('type', 'url');
        $('input[name=b_submit]').setshortcutkey('Enter');
        //デフォルト表示
        FUNCTION_O.booth_select_head.default();
        //日付ボタン編集
        FUNCTION_O.booth_select_head.changebuttons();
        //日付ボタン追加
        FUNCTION_O.booth_select_head.adddays();

        //$('input[name=input2_dt]').afterdayer($('input[name=input1_dt]'));

        //曜日追加
        $('input[name$=_dt]').setweekday();
        break;

      case '/netz/netz1/kanren/booth_list.aspx':
        //テーブルの頭のところ、科目のところがないから科目を追加する。なんで科目がないんや！
        $('table:contains("結果") tr:eq(0) td:eq(10)').text('科目');

        //new ShidoManager().removeBefore();
        //new ShidoManager().savefromBoothHTML();

        //ブース比較
        //インラインでブース表示機能の追加
        /*   
        let inlinediv = $('<div />')
          .css({
            position: 'absolute',
            top: '0px',
            left: '1600px',
            display: 'flex',
            'flex-direction': 'row-reverse',
            zoom: '0.75'
          })
          .appendTo('body');

        $('<input>', { type: 'button', value: 'インラインブース表示' })
          .appendTo('body')
          .on('click', function() {
            $(inlinediv)
              .find('div')
              .remove();
            let par = {
              input1_dt: $('input[name="input1_dt"]').val(),
              input2_dt: $('input[name="input2_dt"]').val(),
              sort_cb: 3,
              hyoji_cb: 2
            };
            $('input[name="tenpo_cd_inlinebooth"]:checked').each(function() {
              $.get(`${NX.CONST.host}/kanren/booth2.aspx?tenpo_cd=${$(this).val()}&${$.param(par)}`).then(function(data) {
                let html = $('<div />').append(data);

                $(inlinediv).append(html);
                FUNCTION_O.all_page.all_teacher_links();
              });
            });
          });

        let makecheckbox = function(tenpo_cd) {
          let tenpo_nm =(LCT.UNIT.baseListM.get(tenpo_cd)?.basename);
          $('<input>', {
            type: 'checkbox',
            value: tenpo_cd,
            name: 'tenpo_cd_inlinebooth',
            id: tenpo_cd + 'inlinebooth'
          })
            .prop('checked', true)
            .appendTo('body');
          $('<label>', { for: tenpo_cd + 'inlinebooth' })
            .text(tenpo_nm)
            .appendTo('body');
        };
        //チェックボックス作成
        let set = new Set();
        set.add($('input[name="tenpo_cd"]').val());
        if (myprofiles.getone({ mybase: undefined }) != undefined) set.add(myprofiles.getone({ mybase: undefined }));

        for (let i = 2; myprofiles.getone({ ['mybase' + i]: undefined }) != undefined; i++) set.add(myprofiles.getone({ ['mybase' + i]: undefined }));
        set.forEach(one => {
          makecheckbox(one);
        });
        */

        $('table:contains("結果")').netztabler();
        break;

      //予定入力画面
      case '/netz/netz1/schedule/yotei_input.aspx':
        //その他がval選択でも無理やり反映させる
        var select = $('select[name=yotei_cb]');
        $(select).on('change', function() {
          $(select).attr('onclick', $(select).attr('onchange'));
          $(select).click();
          $(select).removeAttr('onclick');
        });
        break;

      //予定表
      case '/netz/netz1/schedule/yotei.aspx':
        $('input[name=b_submit][value="表示更新"]').setshortcutkey('Enter');
        $('input[name=b_yesterday]').setshortcutkey('ArrowLeft');
        $('input[name=b_tommorow]').setshortcutkey('ArrowRight');
        FUNCTION_O.yotei.default();

        FUNCTION_O.yotei.float();
      // eslint-disable no-fallthrough
      case '/netz/netz1/schedule/yotei2.aspx':
        //右クリックで予定表に入れるやつ
        FUNCTION_O.yotei.addYoteibySwipe();

        FUNCTION_O.yotei.popmenu();

        break;

      //振替head
      case '/netz/netz1/tehai/shido_furikae_list_head.aspx':
        $('input[name=b_submit]')
          .setshortcutkey('Enter')
          .on('contextmenu', function() {
            console.log(
              $(this)
                .closest('form')
                .serialize()
            );
          });
        //デフォルト表示
        FUNCTION_O.shido_furikae_list_head.default();
        break;

      //連絡事項
      case '/netz/netz1/s/student_renraku_head.aspx':
        $('input[name=b_submit][value="　表示　"]').setshortcutkey('Enter');
        FUNCTION_O.student_renraku_head.default();
        break;
      //生徒情報
      case '/netz/netz1/student_list_head.aspx':
        $('input[name=b_submit]').setshortcutkey('Enter');
        //デフォルト表示
        FUNCTION_O.student_list_head.default();

        //生徒番号を数字のみ入力に
        $('input[name=student_cd]').isAllNumeric();
        //cd_select用にチェックを保存する
        sessionStorage.setItem(
          'hyojibuttons_student_list',
          '並び順' +
            getStrBetween(
              $('form')
                .html()
                .replace(/(\n|\r\n)/g, ''),
              '並び順',
              '<br>'
            ) +
            '<br>表示：' +
            getStrBetween(
              $('form')
                .html()
                .replace(/(\n|\r\n)/g, ''),
              '表示：',
              '<br>'
            )
        );

        break;

      //生徒情報中身
      case '/netz/netz1/student_list_body.aspx':
        //改行削除
        FUNCTION_O.student_list_body.trim();

        //idとnameをtrに設定
        FUNCTION_O.student_list_body.setidname();

        //メモ表示
        FUNCTION_O.student_list_body.shoexamdates();

        break;
      case '/netz/netz1/index_info.aspx':
        window.document.onkeydown = function(evt) {
          console.log(`key: ${evt.key}`);
          console.log(`${evt.shiftKey}`);
        };
        break;
      //ネッツメニューのメイン上部
      case '/netz/netz1/index_head.aspx':
        FUNCTION_O.index_head.headspan();

        FUNCTION_O.index_head.reminderbutton();

        break;
      case '/netz/netz1/user/login.aspx':
        $('input[name=login]').setshortcutkey('Enter');
        FUNCTION_O.login.login();
        //ログアウトしたときの処理
        FUNCTION_O.login.logout();
        break;
      case '/netz/netz1/kanren/shido_kiroku_input.aspx':
      case '/netz/netz1/kanren/shido_kiroku_input_new.aspx':
        //テキストトレース
        FUNCTION_O.shido_kiroku_input.texttrace();

        //日付追加
        FUNCTION_O.shido_kiroku_input.adddate();

        //色々追加
        FUNCTION_O.shido_kiroku_input.frames();

        FUNCTION_O.shido_kiroku_input.showmenu();

        FUNCTION_O.shido_kiroku_input.savekiroku();

        break;
      case '/netz/netz1/kanren/shido_kiroku_input2.aspx':
        //左寄せ
        $('body').css('margin-left', '0px');
        FUNCTION_O.shido_kiroku_input.frames();

        FUNCTION_O.shido_kiroku_input.showmenu();
        break;
      //左側の部分
      case '/netz/netz1/index_menu.html':
        FUNCTION_O.index_menu.reloder();
        FUNCTION_O.index_menu.localStorager();
        break;
      //登録しましたはすぐ消す
      case '/netz/netz1/t/teacher_schedule_day_save.aspx':
      case '/netz/netz1/s/student_mendan_input_save.aspx':
      case '/netz/netz1/tehai/tehai_input_save.aspx':
        $('input[name="b_close"]').click();
        break;
      //スケジュール印刷
      case '/netz/netz1/kanren/schedule_list.aspx':
        FUNCTION_O.schedule_list.addbuttons();
        break;
      case '/netz/netz1/kanren/shido_yotei_edit2.aspx':
        $('input[name=shido_tm_n],input[name=shido_tm_h]').netztimepicker(true, 'input[name=shido_tm_h]', 'input[name=shido_tm_n]');
        break;
      case '/netz/netz1/s/teian_list_body.aspx': {
        FUNCTION_O.teian_list_body.popmenu();

        //学年取得
        var tableindex = getTableHead($('table'), 0);

        //idを各trに格納
        $('tr').each(function() {
          var id = $(this)
            .find(`td:eq(${tableindex['準備・処理']})`)
            .find('select[name^=d]')
            .attr('name');
          if (id != undefined) {
            id = id.slice(1);
            $(this).attr('id', id);
            $(this).attr('student_cd', id);
          }
        });

        $('table').netztabler(0);

        break;
      }
      //予定表一覧
      case '/netz/netz1/schedule/yotei_list.aspx':
        FUNCTION_O.yotei_list.popmenu();
        $('table').netztabler();
        break;

      //指導報告
      case '/netz/netz1/kanren/tenpo_shido_kiroku_list.aspx':
        //tablerを仕込む
        $('table').netztabler();

        //ＣＨボタンを押せばそこの部分を済に変更
        $('input[name=b_check]').each(function() {
          $(this).on('click', function() {
            $(this)
              .parent()
              .parent()
              .find('td:last')
              .text('済');
          });
        });

        //CHボタン開くと次のCHボタンをフォーカスする＝Enterキーのみで全部順にチェックできる
        $('input[name=b_check]').on('click', function() {
          $(this)
            .closest('tr')
            .nextAll()
            .find('input[name=b_check]')[0]
            .focus();
        });
        break;
      case '/netz/netz1/tehai/shido_data_set_confirm.aspx':
        //全ＣＨ外し
        $('input[name=b_submit][value=表示]').after('<input type="button" name="alldecheck" value="CH外す">');
        $('input[name=alldecheck]').on('click', function() {
          $('input[type=checkbox]').each(function() {
            $(this).prop('checked', false);
          });
        });
        break;
      case '/netz/netz1/text/text_list_body.aspx':
        var table = $('table:contains("教室")');
        var tablehead = getTableHead($(table), 0);
        $('table tr').each(function() {
          if (
            $(this)
              .find('td:eq(' + tablehead['納品日'] + ')')
              .text() == ''
          ) {
            $(this)
              .find('input[name=text]')
              .each(function() {
                $(this).prop('disabled', true);
              });
          }
          if (
            $(this).find('td:eq(' + tablehead['準備CH'] + ') input[name=text]').length == true &&
            $(this).find('td:eq(' + tablehead['配布CH'] + ') input[name=text]').length == false
          ) {
            $(this)
              .find('td:eq(' + tablehead['準備CH'] + ') input[name=text]')
              .prop('checked', true);
          } //*/
        });

        $('input[type=checkbox]')
          .parent()
          .on('contextmenu', function() {
            var table = $(this).closest('table');
            var tablehead = getTableHead(table, 0);
            var index = $(this).index();
            var student_name = $(this)
              .closest('tr')
              .find('td:eq(' + tablehead['生徒名'] + ')')
              .text();
            console.log(
              $(this)
                .closest('tr')
                .find('td:eq(' + tablehead['生徒名'] + ')')
            );
            console.log(tablehead);
            var i, tr;
            for (i = 0; i < $(table).find('tr').length; i++) {
              tr = $(table).find('tr:eq(' + i + ')');
              if (
                $(tr)
                  .find('td:eq(' + tablehead['生徒名'] + ')')
                  .text() == student_name
              ) {
                //console.log($(tr));
                $(tr)
                  .find('td:eq(' + index + ')')
                  .find('input[type=checkbox]')
                  .prop('checked', true);
              }
            }
            return false;
          });

        $('table').netztabler();
        break;
      case '/netz/netz1/tehai/tehai_list_head.aspx':
        $('select[name="tenpo_cd"]').val(myprofiles.getone({ mybase: '' }));
        $('input[name="b_submit"]').click();
        break;
      case '/netz/netz1/tehai/shido2_base_input.aspx':
        var id = $('form[name=form1]')['0'].student_cd.value;
        var tabletext = $('table:contains("教室")').prop('outerHTML');
        var content = [id, tabletext];
        var kihonbooths = JSON.parse(localStorage.getItem('kihonbooths')) || [];
        for (var i = 0; i < kihonbooths.length; i++) {
          if (kihonbooths[i][0] == id) {
            kihonbooths.splice(i, 1);
          }
        }
        kihonbooths.push(content);
        localStorage.setItem('kihonbooths', JSON.stringify(kihonbooths));

        //関連POP
        $('input[name=b_kanren]').on('contextmenu', function() {
          var student_cd = $('input[name="student_cd"]').val();
          relpop(student_cd);
          return false;
        });
        $('select[name=shido_jk_cb]').on('contextmenu', function() {
          $(this)
            .selectSwitcher(['7', '3'])
            .attr('onclick', $(this).attr('onchange'))
            .click()
            .removeAttr('onclick');
          return false;
        });
      case '/netz/netz1/tehai/shido2_base_input_n.aspx':
        $('#start_dt,#end_dt').attr('autocomplete', 'off');

        break;
      case '/netz/netz1/kanren/shido_kiroku_check_save.aspx':
        $('input[value=閉じる]').trigger('click');
        break;
      case '/netz/netz1/k/moshikomi3_osusume_input.aspx':
        $('table:contains("選択分のみ表示")')
          .after('<BR><select name="teian_template"></select>')
          .after('<BR>テンプレ名<input type="text" name="teian_template_name" value=""><input type="button" name="teian_regist" value="登録">');
        //提案書テンプレート登録
        $('input[name=teian_regist]').on('click', function() {
          var checklist = [];
          checklist.push($('input[name=teian_template_name]').val());
          checklist.push(sessionStorage.teian_grade);
          $('input[name=osusume_id]:checked').each(function() {
            //チェックがついている全部のおススメ講座取得
            checklist.push($(this).attr('id'));
          });
          var teian_template_list = JSON.parse(localStorage.getItem('teian_template_list')) || [];
          teian_template_list.push(checklist);
          localStorage.setItem('teian_template_list', JSON.stringify(teian_template_list));
        });
        //提案書セレクトにする
        if (localStorage.teian_template_list != null) {
          var teian_template_list = JSON.parse(localStorage.getItem('teian_template_list'));
          $('select[name=teian_template]').append(
            $('<option>')
              .html('')
              .val(-1)
          );
          console.log(teian_template_list);
          for (var i = 0; i < teian_template_list.length; i++) {
            var checklist = teian_template_list[i];
            $('select[name=teian_template]').append(
              $('<option>')
                .html(checklist[0])
                .val(i)
            );
            console.log(
              $('<option>')
                .html(checklist[0])
                .val(i)
            );
          }
        }
        //変化取得
        $('select[name=teian_template]').on('change', function() {
          //全部外す
          $('input[name=osusume_id]').each(function() {
            $(this).prop('checked', false);
          });

          //チェック付ける
          if ($(this).val() >= 0) {
            var teian_template_list = JSON.parse(localStorage.teian_template_list);
            var checklist = teian_template_list[$(this).val()];
            for (i = 2; i < checklist.length; i++) {
              $('input[id=' + checklist[i] + ']').prop('checked', true);
            }
          }
        });
        $('<select name="gradeselecter"></select>')
          .insertAfter('table:contains("選択分のみ表示")')
          .append(listoptioner(['', '小', '中', '高']))
          .on('change', function() {
            var table = $('table:contains("受講")');
            var tablehead = getTableHead($(table), 0);
            var text = $(this).val();
            $(table)
              .find('tr')
              .show();
            $(table)
              .find('tr:gt(0)')
              .each(function() {
                console.log(
                  $(this)
                    .find('td')
                    .eq(tablehead['学年'])
                    .text()
                );
                if (
                  $(this)
                    .find('td')
                    .eq(tablehead['学年'])
                    .text()
                    .indexOf(text) == -1
                ) {
                  $(this)
                    .closest('tr')
                    .hide();
                }
              });
          });
        break;
      //提案書作成の画面
      case '/netz/netz1/k/moshikomi3_input.aspx':
      case '/netz/netz1/k/moshikomi4_input.aspx': {
        //学年取得
        let grade;
        switch ($('select[name=ryokin_gakunen_cb]').val()) {
          case '10':
            grade = '小学生';
            break;
          case '60':
            grade = '中学受験生';
            break;
          case '20':
          case '23':
            grade = '中学生';
            break;
          case '70':
          case '30':
            grade = '中高一貫、高１２生';
            break;
          case '33':
            grade = '高３生';
            break;
          default:
            grade = null;
            break;
        }
        sessionStorage.setItem('teian_grade', grade);
        if ($('select[name=keiyaku_cb]').val() == 1) {
          $('body').after('<div name="kyouzaihidiv" class="onetzpicker">');
        }
        //計算可能に
        $('input[name$=_gk]').on('contextmenu', function() {
          $(this).val(new Function('return ' + $(this).val())());
          return false;
        });
        break;
      }
      case '/netz/netz1/k/moshikomi3_tsuika_input.aspx':
        $('input[name=b_osusume]').on('click', function() {
          var teian_grade = sessionStorage.teian_grade;
          if (teian_grade != null) {
            var syori = [];
            switch (teian_grade) {
              case '小学生':
              case '中学受験生':
                syori.push(['select[name=gakunen_cb]', 'val', 10]);
                break;
              case '中学生':
                syori.push(['select[name=gakunen_cb]', 'val', 20]);
                break;
              case '中高一貫、高１２生':
              case '高３生':
                syori.push(['select[name=gakunen_cb]', 'val', 30]);
                break;
            }
            syori.push(['input[value="　表示更新　"]', 'click', 'nextpage']);
            console.log(syori);
            sessionStorage.setItem('syori', JSON.stringify(syori));
          }
        });

        /*$('input[value=特訓講座]')
					//.after('<input type="checkbox" name="syori_sc" value="6" sub="理科">理科')
					//.after('<input type="checkbox" name="syori_so" value="5" sub="社会">社会')
					//.after('<input type="checkbox" name="syori_j" value="4" sub="国語">国語')
					.after('<input type="checkbox" name="syori_e" value="3" sub="英語">英語')
					.after('<input type="checkbox" name="syori_m" value="2" sub="数学">数学');
				$('input[name=b_tokkun]').on("click",function(){
					if( $('input[name^="syori_"]:checked').length > 0 ){
						var syori = [
							['select[name=season_cb]','val','2'],
							['select[name=nendo]','val','2018']
						];
						//小６だったら学年をあげる
						if(sessionStorage.getItem('gakunen') == '小６' || sessionStorage.getItem('gakunen') == '受験小６'){
							syori.push(['select[name=gakunen_cb]','val','20']);
						}
						syori.push(['input[value="　表示更新　"]','click','nextpage']);
						$('input[name^=syori_]').each(function(){
							console.log($(this).prop("checked"));
							if( $(this).prop("checked") == true ){
								switch( $(this).attr("sub")){
									case "数学":
										syori.push(['input[id=ch43001-1],[id=ch43002-1]','click']);
										break;
									case "英語":
										syori.push(['input[id=ch43001-2]','click']);
										break;
									case "国語":
										break;
									case "社会":
										break;
									case "理科":
										break;
								}
							}
						});
						syori.push(['input[value="データセット(金額計算)"','click']);
						sessionStorage.setItem('syori',JSON.stringify(syori));
					}
				});*/
        var gakki = $('<select name="gakki"></select>')
          .insertAfter('input[value=日程選択型]')
          .append('<option value></option>')
          .append('<option value="4">春期</option>')
          .append('<option value="2" selected>夏期</option>')
          .append('<option value="3">冬期</option>');
        var grade = $('<select name="grade"></select>')
          .insertAfter('input[value=日程選択型]')
          .append('<option value></option>')
          .append('<option value="中１">中１</option>')
          .append('<option value="中２">中２</option>')
          .append('<option value="中３">中３</option>');
        var kamoku = $('<select name="kamoku">')
          .insertAfter('input[value=日程選択型]')
          .append('<option value></option>')
          .append($('<option selected>数英</option>').val(JSON.stringify(['m', 'e'])))
          .append($('<option>理社</option>').val(JSON.stringify(['sc', 'ss'])))
          .append($('<option>４科目</option>').val(JSON.stringify(['m', 'e', 'sc', 'ss'])));
        syori = [];
        var list = {
          中１: {
            m: ['#ch46426-15', '#ch47501-20'],
            e: ['#ch46426-16', '#ch47501-22'],
            sc: ['#ch46426-17', '#ch47501-24'],
            ss: ['#ch46426-18', '#ch47501-26']
          },
          中２: {
            m: ['#ch46426-19', '#ch47501-21'],
            e: ['#ch46426-20', '#ch47501-23'],
            sc: ['#ch46426-21', '#ch47501-25'],
            ss: ['#ch46426-22', '#ch47501-27']
          },
          中３: {
            m: ['#ch46426-23'],
            e: ['#ch46426-24'],
            sc: ['#ch46426-25'],
            ss: ['#ch46426-26']
          }
        };
        $('input[name=b_tokkun]').on('click', function() {
          if ($(gakki).val() != '') {
            syori.push(['select[name=season_cb]', 'val', $(gakki).val()], ['input[value="　表示更新　"', 'click', 'nextpage']);
            if ($(grade).val() != null && $(kamoku).val() != null) {
              var kamokulist = JSON.parse($(kamoku).val());
              var g = $(grade).val();
              for (var k of kamokulist) {
                /*m,e,aなど*/
                console.log(list[g][k].length);
                for (var i = 0; i < list[g][k].length; i++) {
                  syori.push([list[g][k][i], 'click']);
                }
              }
            }
            syori.push(['input[value="データセット(金額計算)"', 'click']);
            sessionStorage.setItem('syori', JSON.stringify(syori));
          }
        });

        //100分70分バグ解消
        $('select[name^=osusume]').val('100');
        break;
      case '/netz/netz1/kanren/booth2.aspx':
        popmenuo_F2.setContentFunction(function() {
          $('<input>', { type: 'button', value: 'colrow表示' })
            .appendTo(this)
            .on('click', function() {
              $('table').netztabler();
              $('table')
                .find('td')
                .each(function() {
                  $(this).text(`row:${$(this).attr('row')}、col:${$(this).attr('col')}`);
                });
            });
        });
        //TODO 何月何日とかの部分からブース一覧に直行したい
        /*var alltext = $("body").html();
				var text = alltext.match(/..\/..\(.\)　店舗：.*?\n/g);
				console.log(text);
				var tables = $("table");
				for(var i=0;i<text.length;i++){
					alltext = alltext.replace(text[i],"test");
					$(tables).eq(i).attr("date",dateslash(getstrDate(String(text[i].match(/..\/..\(.\)/)),"mm/dd(aaa)")));
					console.log(text[i]);
				}*/
        //$('table').netztabler();
        /*$('td').each(function() {
          $(this).text(`col:${$(this).attr('col')},row:${$(this).attr('row')}`);
        });
        popmenuo_ins.setContentFunction(function() {
          $('<input>', {
            name: 'shain_del',
            type: 'button',
            value: '社員非表示'
          })
            .appendTo(this)
            .on('click', function() {
              $('table')
                .find('td[row=1]')
                .each(function() {
                  let col = $(this).attr('col');
                  if (
                    $(this)
                      .attr('teacher_cd')
                      ?.substring(0, 3) == '000'
                  )
                    $('table')
                      .find(`td[col=${col}]`)
                      .css({ display: 'none' });
                });
            });
        });*/
        break;
      case '/netz/netz1/kanren/kanren_input.aspx':
        break;
      case '/netz/netz1/tehai/shido2_input_sp_b.aspx':
        let datadiv = $('<div>', { name: 'datadiv', class: 'onetzpicker' })
          .css({
            display: 'flex',
            'flex-flow': 'column',
            left: 800,
            top: 200,

            height: '900px',
            width: '900px'
          })
          .appendTo('body');
        var kihonbooths = JSON.parse(localStorage.getItem('kihonbooths')) || [];
        var nowstudentcb = parseInt($('input[name=student_cd]').val());
        console.log(nowstudentcb);
        for (i = 0; i < kihonbooths.length; i++) {
          if (kihonbooths[i][0] == nowstudentcb) {
            /*$('div[name=kihonbooths]').css('left', 800);
            $('div[name=kihonbooths]').css('top', 200);*/
            $('<div name="kihonbooths">').appendTo(datadiv);
            $('div[name=kihonbooths]').css('font-size', '75%');
            $('div[name=kihonbooths]').append(kihonbooths[i][1]);
            $('div[name=kihonbooths]')
              .find('input[type="button"]')
              .remove();
          }
        }

        //現在の指導日程も出す
        var iframemaker = new IframeMaker('div_shido_shido2_input_sp_b');
        iframemaker.getdivobject().appendTo(datadiv);
        var netzbuttons = new NetzButtonsofseito($('input[name=student_cd]').val(), null, iframemaker.getframename(), iframemaker);
        netzbuttons
          .makebuttons('shido_edit', 'ブース表示', {
            input1_dt: $('input[name=input_f_dt]').val(),
            input2_dt: $('input[name=input_t_dt]').val()
          })
          .click()
          .remove();
        break;
      case '/netz/netz1/tehai/tehai_input.aspx': {
        /**@type {string} */
        /*
        const student_cd = $('input[name=student_cd]').val();
        const grade = $('td:contains(学年)')
          .next()
          .text();
        const list = {
          小学生: ['小１', '小２', '小３', '小４', '小５', '小６'],
          中学生: ['中１', '中２', '中３', '一貫中１', '一貫中２', '一貫中３']
        };
        for (let key in list) {
          if (!list[key].includes(grade)) continue;
          $('select[name$=kamoku_cb]').each(function() {
            const $this = $(this);
            $this.val($this.find(`option:contains(${key})`).val());
          });
        }


        FUNCTION_O.tehai_input.osusumelist();

        $('input[name^=shido_][name$=vl]').on('change', function() {
          $(this)
            .closest('tr')
            .find('input[name$=_flg]')
            .prop('checked', $(this).val() != '' && $(this).val() > 0)
            .trigger('change');
        });

        $('input[name^=shido_]')
          .on('change', function() {
            var sub = getStrBetween($(this).attr('name'), '_', '_');
            if ($(`input[name$=${sub}_flg]`).prop('checked')) {
              $(`input[name^=shido_${sub}]`).each(function() {
                if ($(this).val() != '' || localStorage.getItem('blind') == 'true') $(this).css('background-color', '');
                else $(this).css('background-color', '#FFCCCC');
              });
            } else $(`input[name^=shido_${sub}]`).css('background-color', '');
          })
          .trigger('change');

        let osusumekouza = JSON.parse(localStorage.getItem('osusumekouza') || '{}');
        if (osusumekouza[student_cd] != null) {
          $('<div/>')
            .appendTo('body')
            .text(osusumekouza[student_cd])
            .css('top', '0px')
            .css('left', '1000px');
        }
                    */
        break;
      }
      case '/netz/netz1/kintai/yotei_input.aspx':
        $('table').netztabler(1);
        FUNCTION_O.kintai_yotei_input.ikkatu();
        break;
      case '/netz/netz1/s/schedule_input_check.aspx':
        //自分を追加
        FUNCTION_O.schedule_input_check.addme();

        //popmenu
        FUNCTION_O.schedule_input_check.popmenu();

        $('table').netztabler();
        break;
      case '/netz/netz1/s/student_renraku_app_input.aspx':
      case '/netz/netz1/s/student_renraku_rireki_input.aspx':
        if ($('td[student_cd]').length > 0)
          $('<input>', {
            name: 'student_cd',
            type: 'hidden',
            value: $('td[student_cd]').attr('student_cd')
          }).appendTo('body');

        FUNCTION_O.student_renraku_rireki_input.youbi();

        $('input[name=next_tm]').netztimepicker(false);
        break;
      case '/netz/netz1/tenpo_yotei.aspx':
        var startday = getstrDate($('input[name=input_f_dt]').val(), 'yyyy/mm/dd');
        var i = 0;
        $('table:contains(開校担当) tr').each(function(e) {
          if (e > 1) {
            var date = weekdaylist[afterdays(startday, i).getDay()];
            $(this)
              .find('input')
              .attr('class', date);
            $(this)
              .find('input[type=text]')
              .on('change', function() {
                $(this).attr('onclick', $(this).attr('onchange'));
                $(this).click();
                $(this).removeAttr('onclick');
              });
            i++;
            console.log(date);
          }
        });
        var tableobject = $(
          '<table name="templater" border="1" cellpadding="1" cellspacing="1" style="border-collapse: collapse" class="small"><tr style="background-color:#dfdfff"><td>日付</td><td>指導開始</td><td>状態</td><td>開校予定</td><td>開校担当(CD入力)</td><td>CH</td><td>指導終了</td><td>閉校予定</td><td>閉校担当</td><td>休校</td><td>備考</td></tr></table>'
        );
        var kaikoutemplater = function(youbi, tableobject) {
          /**
           *
           * @param {JQuery<HTMLElement>} origintr
           * @param {string} youbi
           * @returns {JQuery<HTMLElement>}
           */
          let maketr = function(origintr, youbi) {
            let tr = $(origintr).clone(true);
            $(tr).attr('id', youbi);
            $(tr)
              .find('input,span')
              .each(function() {
                let name = $(this).attr('name') || '';
                name = name.match(/.+?(?=[0-9])/) || '';
                $(this).attr('name', name);
                let id = $(this).attr('id') || '';
                id = id.match(/.+?(?=[0-9])/) || '';
                $(this).attr('id', id);
                $(this).attr('value', '');
                $(this).attr('class', youbi);
                $(this).val('');
                if ($(this).text != '') $(this).text('');
              });
            $(tr)
              .find('td:first')
              .text(youbi);
            $(tr)
              .attr('onmouseover', '')
              .attr('onmouseout', '')
              .attr('style', '');
            return tr;
          };
          //trのコピーを生成
          let object = $(maketr($('table:first').find('tr:last'), youbi)).appendTo(tableobject);
          //トレースを割り当て
          object.find('input').each(function() {
            $(this).netztracer('input[name^=' + $(this).attr('name') + '][class=' + youbi + ']');
          });
        };
        for (var i = 0; i < weekdaylist.length; i++) {
          kaikoutemplater(weekdaylist[i], tableobject);
        }
        tableobject.insertBefore('#b_submit');

        var kaikoulist = {
          講習: {
            日: ['休校'],
            月: [10, 40, 21, 20],
            火: [10, 40, 21, 20],
            水: ['休校'],
            木: [10, 40, 21, 20],
            金: [10, 40, 21, 20],
            土: [10, 40, 21, 20]
          },
          通常: {
            日: ['休校'],
            月: [16, 30, 22, 0],
            火: [16, 30, 22, 0],
            水: ['休校'],
            木: [16, 30, 22, 0],
            金: [16, 30, 22, 0],
            土: [10, 40, 21, 20]
          }
        };
        var timetemplater = function(jiki) {
          var timelist;
          if (kaikoulist[jiki] == false) return false;
          $(tableobject)
            .find('tr')
            .each(function(e) {
              if (e > 0) {
                timelist = kaikoulist[jiki][$(this).attr('id')] || [];
                if (timelist[0] == '休校')
                  $(this)
                    .find('input[name=kyuko_flg]')
                    .prop('checked', true)
                    .trigger('change');
                else {
                  $(this)
                    .find('input[name=open_tm]')
                    .val(`${zeroPadding(timelist[0], 2)}:${zeroPadding(timelist[1], 2)}`)
                    .trigger('change');
                  $(this)
                    .find('input[name=close_tm]')
                    .val(`${zeroPadding(timelist[2], 2)}:${zeroPadding(timelist[3], 2)}`)
                    .trigger('change');
                }
              }
            });
        };

        $('<input type="button" name="koushuu" value="講習">')
          .insertAfter($('input[value="登録"]'))
          .on('click', function() {
            timetemplater($(this).val());
          });
        $('<input type="button" name="tuujou" value="通常">')
          .insertAfter($('input[value="登録"]'))
          .on('click', function() {
            timetemplater($(this).val());
          });
        //講師cd入力
        var teacher_info = new teacher_info_class(myprofiles.getone({ mybase: '' }));
        if (teacher_info != false) {
          var object = {};
          var namelist = teacher_info.list('講師名');
          for (var i = 0; i < namelist.length; i++) {
            object[namelist[i]] = teacher_info.search('講師名', namelist[i]).cd;
          }
          $('input[name^=open_tanto_cd],input[name^=close_tanto_cd]').each(function() {
            $(this).netzpicker2(object, $(this).nextAll());
          });
        }
        $('table:contains("教室")').netztabler(1);
        break;
      case '/netz/netz1/tehai/shido_furikae_list_body.aspx':
        $('table:contains(生徒名)').netztabler(0);
        break;
      case '/netz/netz1/tehai/shido_base_list_body.aspx':
        popmenuo_F2.setContentFunction(function() {
          /*$('<input type="button" name="list" value="リスト化">')
					.appendTo('body')
					.on("click",function(){
						makebooth(getkihonbooth());
					});*/
          var tenpo_cd = $('frame[name=header]', parent.document)
            .contents()
            .find('select[name=tenpo_cd]')
            .val();
          $('body').append('<table id="noboothlist" border="1px"><tr><td>基本ブースなし</td></tr></table>');
          var students = new seito_info_class(tenpo_cd).list('生徒名');
          var search;
          var kihonbooth = getkihonbooth();
          console.log(kihonbooth);
          for (var i = 0; i < kihonbooth.length; i++) {
            search = $.inArray(kihonbooth[i]['student_name'], students);
            if (search != -1) students.splice(search, 1);
          }
          var obj = $('#noboothlist');
          for (var i = 0; i < students.length; i++) {
            $(obj).append('<td>' + students[i] + '</td>');
          }
        });

        //trに情報を付加
        var table = $('table:contains("指導教室")');
        var tablehead = getTableHead($(table), 0);
        var student_cd, teacher_cd, weekday, intime;
        var seito_info = new seito_info_class();
        var teacher_info = new teacher_info_class();
        var seito_scheduler, teacher_scheduler;
        $(table)
          .find('tr:not(:first)')
          .each(function() {
            //生徒名
            student_cd = seito_info.search(
              '生徒名',
              $(this)
                .find('td')
                .eq(tablehead['生徒'])
                .text()
            )['生徒NO'];
            teacher_cd = teacher_info.search(
              '講師名',
              $(this)
                .find('td')
                .eq(tablehead['講師'])
                .text()
            )['cd'];
            weekday = $(this)
              .find('td')
              .eq(tablehead['曜'])
              .text();
            intime = new Intime(
              $(this)
                .find('td')
                .eq(tablehead['時間'])
                .text()
                .slice(7)
                .replace(/～/g, '-')
            ).gettimelist()[0];

            var startday = $(this)
              .find('td')
              .eq(tablehead['期間'])
              .text()
              .substr(0, 10);
            $(this).attr('student_cd', student_cd);
            $(this).attr('teacher_cd', teacher_cd);
            $(this).attr('weekday', weekday);
            $(this).attr('intime', intime);
            $(this).attr('startday', startday);

            /*曜日不可を表示*/
            /*seito_scheduler = Scheduler.getscheduler("student_cd",student_cd);
					teacher_scheduler = Scheduler.getscheduler("teacher_cd",teacher_cd);

					if(!seito_scheduler.inkihoncheck(weekday,intime)){
						$(this).find("td").eq(tablehead["生徒"]).css("background-color","yellow");
					}
					if(!teacher_scheduler.inkihoncheck(weekday,intime)){
						$(this).find("td").eq(tablehead["講師"]).css("background-color","yellow");
					}*/
          });

        $(table)
          .find('tr:not(:first)')
          .each(function() {
            var startday = new Date($(this).attr('startday'));
            if (startday.getTime() > dt.getTime()) {
              $(this)
                .find('td')
                .eq(tablehead['期間'])
                .css('background-color', '#AAFFAA');
            }
          });
        $('table:contains("予定作成")').netztabler(0);
        break;
      case '/netz/netz1/kanren/teacher_shido_yotei.aspx': {
        $('input[name=b_kikan]').setshortcutkey('Enter');

        FUNCTION_O.teacher_shido_yotei.schedulecheck();

        $('table').netztabler();

        break;
      }
      case '/netz/netz1/seiseki/seiseki_list.aspx':
        FUNCTION_O.seiseki_list.showmenu();
        if ($('input[value="編集"]').length > 0 && $('tr:contains("目標"):not(:contains("点数"))').length == 0) {
          $('input[name=d_hensa]').prop('checked', true);
          $('input[name=b_reload]').click();
        }
        break;
      case '/netz/netz1/kanren/shido_kiroku_check_input.aspx':
        $('input[name=b_submit]').focus();
        break;
      case '/netz/netz1/u/gessya_tenpo.aspx':
        $('table').netztabler(1);
        break;
      //講師情報
      case '/netz/netz1/t/teacher_list_head.aspx':
        $('input[name=b_submit]').setshortcutkey('Enter');
        FUNCTION_O.teacher_list_head.default();

        FUNCTION_O.teacher_list_head.syokitracer();
        break;
      case '/netz/netz1/t/teacher_list_head_cdselect.aspx':
        //講師NO選択画面にデフォルトの値がほしい
        $('<option value="6" style="background-color: lightcyan;">指導予定</option>').appendTo('#menu_cb');
        $('<option value="5" style="background-color: lightcyan;">スケジュール</option>').appendTo('#menu_cb');
        break;
      case '/netz/netz1/schedule/shain_yotei.aspx':
        $('input[name=b_submit]').setshortcutkey('Enter');
        break;
      case '/netz/netz1/shingaku/kouza_jyuko_list.aspx':
      case '/netz/netz1/shingaku/kouza_enshu_jyuko_list.aspx':
        $('table').netztabler();
        break;
      case '/netz/netz1/jyuken/goukaku_list_body.aspx':
        $('table').netztabler(0);
        break;
      case '/netz/netz1/u/uriage_list_head.aspx':
        $('input[name^=uriage_ng],input[name^=seikyu_ng]').isAllNumeric(false);
        break;
      case '/netz/netz1/u/uriage_list_body.aspx':
        //1000行未満なら自動でtabler
        //if ($('tr').length < 1000) $('table').netztabler(0);
        popmenuo_ins.setContentFunction(function() {
          var lasttr = $('table').find('tr:last');
          var noshohizei = $(lasttr).clone(true);
          $(noshohizei).insertAfter(lasttr);
          $(noshohizei)
            .find('td')
            .each(function() {
              $(this).text(
                parseInt(
                  $(this)
                    .text()
                    .replace(/,/g, '')
                ) / 1.1
              );
            });
        });
        break;
      case '/netz/netz1/s/student_renraku_shukei.aspx':
        $('table').netztabler(1);
        break;
      case '/netz/netz1/t/teacher_toroku_list_body.aspx':
        $('table').netztabler(0);
        break;
      case '/netz/netz1/kanren/student_shido_kiroku_list.aspx':
        $('<input type="button" name="b_lastmonth" value="前月">')
          .insertAfter('input[value="今月"]')
          .on('click', function() {
            $('input[name=from_dt]').val(dateslash(dtlmstart));
            $('input[name=to_dt]').val(dateslash(dtlmlast));
            $('input[name=b_reload]').click();
          });
        break;
      case '/netz/netz1/k/keiyaku_list_body.aspx':
        $('table').netztabler();
        /*student_cdの列と契約情報の列を追加する*/
        popmenuo_ins.setContentFunction(function() {
          let table = $('table');
          let tablehead = $(table).find('tr:eq(0)');
          let tablebody = $(table).find('tr:gt(0)');
          $('<td />', {})
            .appendTo(tablehead)
            .text('student_cd');
          $(tablebody).each(function() {
            $('<td />')
              .appendTo(this)
              .text(
                getStrBetween(
                  $(this)
                    .find('a')
                    .attr('href'),
                  "'",
                  "'"
                )
              );
          });
        });
        break;
      case '/netz/netz1/kanren/staff_kyuyo_input.aspx':
        $('input[name$=_gk]').on('contextmenu', function() {
          $(this).val(new Function('return ' + $(this).val())());
          return false;
        });
        $('input[name^=jikan]').isAllNumeric();
        break;
      case '/netz/netz1/tehai/shido_enshu_input.aspx':
        FUNCTION_O.shido_enshu_input.enshuauto();

        $('table:contains("年度")').netztabler();
        break;
      case '/netz/netz1/kanren/shido_schedule_check.aspx':
        $('select[name=shido_cb]').val(1);
        break;
      case '/netz/netz1/tehai/tehai_list_body.aspx':
        $('table').netztabler();
        break;
      case '/netz/netz1/t/teacher_schedule_list.aspx':
        var scheduler = new Scheduler('teacher_cd', $('input[name=teacher_cd]').val());
        scheduler.setschedule();
        scheduler.save();
        popmenuo_ins.setContentFunction(function() {
          var kihonscarray = [];
          for (var key in scheduler.kihonsc) kihonscarray.push([key, scheduler.kihonsc[key].gettimetext()]);
          $('body').append(array2table(kihonscarray));
          var nitibetuscarray = [];
          for (var key in scheduler.nitibetusc)
            nitibetuscarray.push([`${key}(${weekdaylist[getstrDate(key, 'yyyy/mm/dd').getDay()]})`, scheduler.nitibetusc[key].gettimetext()]);
          $('body').append(array2table(nitibetuscarray));
        });
        break;
      case '/netz/netz1/s/student_schedule_list.aspx': {
        var iframemaker = new IframeMaker('div_student_schedule_list_shido', 10, 800);
        var student_cd = $('input[name=student_cd]').val();
        var netzbuttons = new NetzButtonsofseito(student_cd, null, iframemaker.getframename(), iframemaker);

        popmenuo_F2.setContentFunction(() => {
          netzbuttons.makebuttons('yotei', '指導予定').appendTo(this);
        });

        var scheduler = new Scheduler('student_cd', $('input[name=student_cd]').val());
        scheduler.setschedule();
        scheduler.save();
        break;
      }
      case '/netz/netz1/s/student_renraku_input.aspx':
        $('input[name=next_tm]').netztimepicker(false);

        //登録できる状態じゃないと登録できないように
        $('input,select,textarea')
          .on('click change', function() {
            if ($('input[name=way_cb]:checked').length == 0 || $('input[type=checkbox]:checked').length == 0)
              $('input[name=b_submit]').prop('disabled', true);
            else $('input[name=b_submit]').prop('disabled', false);
          })
          .change();

        //F2に住所不備を追加
        popmenuo_F2.setContentFunction(function() {
          $('<input type="button" value="住所不備">')
            .appendTo(this)
            .on('click', function() {
              $('input[name=aite_nm]').text('メモ');
              $('#n9').prop('checked', true);
              $('#way_cb8').prop('checked', true);
              $('input[name=title_nm]').val('住所不備');
              $('textarea[name=naiyo_nm]').text(
                '住所が入力されていません。\n生徒詳細情報に入力後、ワークフローの[生徒IDカード再発行]で申請をお願いします。'
              );
              $('select[name=jyotai_cb]')
                .val(1)
                .trigger('click');
            });
        });

        break;
      case '/netz/netz1/moshi/moshi_list_body.aspx':
        $('table').netztabler();
        break;
      case '/netz/netz1/kanren/getsumatsu_check.aspx':
        $('table:eq(0)').netztabler(1);
        break;
      case '/netz/netz1/student_kouza_list_body.aspx':
        $('table').netztabler();
        break;
      case '/netz/netz1/tehai/shido2_input_sp_h.aspx': {
        const mybasename = myprofiles.getone({ mybasename: '南大分' });
        const mybase = myprofiles.getone({ mybase: 4401 });
        const input_f_dt = $('input[name=input_f_dt]').val();
        const input_t_dt = $('input[name=input_t_dt]').val();
        /**@type {string} */
        const student_cd = $('input[name=student_cd]').val();
        let student_scheduler = Scheduler.getscheduler('student_cd', student_cd);
        var tlist = new teacher_info_class(mybase).searchlist('教室', mybasename);
        var select = $('select[name="teacher_cd"]');
        /**
         *
         * @param {Date} from_dt
         * @param {Date} to_dt
         * @param {Scheduler} student_scheduler
         * @param {Scheduler} teacher_scheduler
         */
        function akikomanum(from_dt, to_dt, student_scheduler, teacher_scheduler) {
          /**@type {number} */
          let koma = 0;
          for (let dt = from_dt; dt <= to_dt; dt.setDate(dt.getDate() + 1)) {
            koma += student_scheduler.getdatetime(dateslash(dt)).matchnum(teacher_scheduler.getdatetime(dateslash(dt)).gettimelist());
          }
          return koma;
        }
        tlist.forEach(elem => {
          /**@type {string} */
          let teacher_cd = elem['cd'];
          let teacher_scheduler = Scheduler.getscheduler('teacher_cd', teacher_cd);
          let koma = akikomanum(new Date(input_f_dt), new Date(input_t_dt), student_scheduler, teacher_scheduler);
          //すでに存在すれば飛ばす
          if (select.children(`option[value="${teacher_cd}"]`).length != 0)
            select.children(`option[value="${teacher_cd}"]`).each(function() {
              $(this).text($(this).text() + `(${koma})`);
            });
          else $(`<option value="${teacher_cd}" style="background-color:lightcyan;">${elem['講師名']}(${koma})</option>`).appendTo(select);
        });
        $(select).selectSearcher();
        break;
      }
      case '/netz/netz1/s/student_renraku_body.aspx':
        //それぞれのtableにstudent_cdを保存
        $('input[name=b_student]').each(function() {
          var student_cd = getStrBetween($(this).attr('onclick'), "'", "'");
          $(this)
            .closest('table')
            .attr('student_cd', student_cd);
        });
        break;
      case '/netz/netz1/tehai/tehai_kanren_list.aspx':
        $('table tr').each(function(e) {
          var td = $('<td></td>').appendTo(this);
          if (e != 0)
            $('<input type="button" value="終了">')
              .appendTo(td)
              .on('click', function() {
                var dataid = getStrBetween(
                  $(this)
                    .closest('tr')
                    .find('input[name=b_edit]')
                    .attr('onclick'),
                  "'",
                  "'"
                );
                var send = {
                  kanren_cd: dataid,
                  syori: JSON.stringify([['#status_cb1', 'click'], ['input[value="　登録　"]', 'click', 'nextpage'], ['close']])
                };
                chrome.runtime.sendMessage({
                  opennetzback: '/netz/netz1/tehai/kanren_input.aspx?' + $.param(send)
                });
              });
        });
        break;
      case '/netz/netz1/k/keiyaku_list_head.aspx':
        $('input[name=b_submit]').setshortcutkey('Enter');
        const from_dt = $('input[name=input_dt1]');
        const to_dt = $('input[name=input_dt2]');
        $('input[value="今月"]')
          .swipe('今月(昨日まで)', () => {
            from_dt.val(dateslash(dtstart));
            to_dt.val(dateslash(dtyesterday));
          })
          .swipe('前月', () => {
            from_dt.val(dateslash(dtlmstart));
            to_dt.val(dateslash(dtlmlast));
          })
          .swipe('昨年同月', () => {
            from_dt.val(dateslash(dtlystart));
            to_dt.val(dateslash(dtlylast));
          })
          .swipe('昨年翌月', () => {
            from_dt.val(dateslash(dtlynmstart));
            to_dt.val(dateslash(dtlynmlast));
          });
        $('input[name=input_dt2]')
          .swipe('昨年同日', () => {
            from_dt.val(dateslash(dtstart));
            to_dt.val(dateslash(dtyesterday));
          })
          .swipe('前月', () => {
            from_dt.val(dateslash(dtlmstart));
            to_dt.val(dateslash(dtlmlast));
          });
        break;
      case '/netz/netz1/kanren/booth_list_print.aspx':
        $('table').netztabler();
        popmenuo_ins.setContentFunction(function() {
          $('<input name="memo" type="text">')
            .css('width', '100%')
            .css('font-size', '25px')
            .prependTo('body')
            .before('<br>★お知らせ★<br>')
            .after('<br>');
        });
        popmenuo_F2.setContentFunction(function() {
          $('<hr>').appendTo(this);
          $('<input>', { type: 'button', name: 'addexam' })
            .val('定期テスト日程追加')
            .appendTo(this)
            .on('click', function() {
              $('table').each(function() {
                let table = $(this);
                let tablehead = getTableHead(table, 0);
                let exams = myprofiles.getone({
                  exams: myprofilesObject['exams'][0]
                });
                $(table)
                  .find('tr:not(:first)')
                  .each(function() {
                    /**@type {string} */
                    let student_cd = $(this)
                      .find('td')
                      .eq(tablehead['生徒名'])
                      .attr('student_cd');
                    let student_exam = student_exams.getone({
                      [student_cd]: {}
                    });
                    let td = $('<td />').appendTo(this);
                    if (student_exam[exams] != null) $(td).text(`${student_exam[exams].from_dt}～${student_exam[exams].to_dt}`);
                  });
              });
            });
        });
        break;
      case '/netz/netz1/shingaku/contest_input_body.aspx':
        $('table').netztabler();
        break;
      case '/netz/netz1/k/kaiyaku_list_body.aspx':
        $('table').netztabler();
        break;
      case '/netz/netz1/shingaku/kouza_enshu_teacher_input.aspx':
        FUNCTION_O.kouza_enshu_teacher_input.tracer();
        break;
      case '/netz/netz1/seiseki/seiseki_input2.aspx':
        $('input[name$=_ten],input[name$=_dev],input[name$=_moku]').isAllNumeric();
        break;
      case '/netz/netz1/shingaku/kouza_enshu_shido_input.aspx':
        popmenuo_F2.setContentFunction(function() {
          $('<button />', {
            type: 'button',
            name: 'inputselectcopier',
            text: 'input,selectコピー',
            on: {
              click: function() {
                sessionStorage.setItem('inputselectcopier', JSON.stringify(inputselectcopy()));
              }
            }
          }).appendTo($(this));
        });
        if (sessionStorage.getItem('inputselectcopier') != undefined) {
          inputselectpaste(JSON.parse(sessionStorage.getItem('inputselectcopier')));
        }
        $('#add_dt').attr('autocomplete', 'off');
        $('#add_tm')
          .attr('autocomplete', 'off')
          .netztimepicker(true);
        break;
      case '/netz/netz1/shingaku/shingaku_teacher_edit.aspx': {
        var table = $('table:contains("教科")');
        var tablehead = getTableHead(table, 0);
        var text, date;
        $(table)
          .find('tr:not(:first)')
          .each(function() {
            text = $(this)
              .find('td')
              .eq(tablehead['日'])
              .text();
            date = getstrDate(text, 'mm/dd');
            $(this)
              .find('td')
              .eq(tablehead['日'])
              .text(`${text}(${weekdaylist[date.getDay()]})`);
          });
        break;
      }
      case '/netz/netz1/shingaku/kouza_enshu_select.aspx':
        $('<button type="button" name="before_gakki">前年度3学期</button>')
          .insertAfter('input[name=b_reload]')
          .on('click', function() {
            $('select[name=nendo]').val(parseInt($('select[name=nendo]').val()) - 1);
            $('select[name=season_cb]').val('c');
            $('input[name=b_reload]').click();
          });
        $('input[type=text][name^=shido]').attr('type', 'tel');
        break;
      case '/netz/netz1/s/student_inout_list_tenpo.aspx':
        $('input[name=input_dt]').datepicker({
          showOtherMonths: true,
          selectOtherMonths: true,
          numberOfMonths: 2,
          showCurrentAtPos: 1
        });
        break;
      case '/netz/netz1/shingaku/kouza_enshu_list.aspx': {
        $('#kouza_id').prop('checked', true);
        $('table').netztabler();
        break;
      }
      case '/netz/netz1/shingaku/kouza_list.aspx':
      case '/netz/netz1/shingaku/kouza_list2.aspx': {
        $('select[name=season_cb]').selectNextbyRightclick();
        $('#kouza_id').prop('checked', true);
        $('input[name=b_reload]').setshortcutkey('Enter');
        //クリックを無反応に変更
        popmenuo_F2.setContentFunction(function() {
          $('<input>', { type: 'button', value: 'クリック消去' })
            .appendTo(this)
            .on('click', function() {
              $('[onclick]')
                .removeAttr('onclick')
                .off('click');
            });
        });
        break;
      }
      case '/netz/netz1/kintai/kintai_list2.aspx':
        $('table').netztabler(2);
        popmenuo_ins.setContentFunction(function() {
          /**@type {JQuery} */
          let datesetinput = $('<input>', {
            type: 'button',
            value: '指定日移動'
          }).insertAfter('input[name=b_nex]');
          $('<input>', {
            type: 'text',
            name: 'dateinput',
            value: $('input[name=input_dt0]').val()
          })
            .insertAfter('input[name=b_nex]')
            .on('change', function() {
              $(datesetinput).attr('onclick', `change_dt('${$(this).val()}')`);
            })
            .trigger('change')
            .datepicker();
        });
        break;
      case '/netz/netz1/text/course2015_list.aspx':
        $('table').netztabler(0);
        $('select[name=course_id]').selectSearcher();
        break;
      case '/netz/netz1/s/teian_shukei_day.aspx':
        $('table').netztabler(2);
        break;
      case '/netz/netz1/user/shain_tenpo_list.aspx':
        FUNCTION_O.shain_tenpo_list.default();
        $('table').netztabler();
        break;
      case '/netz/netz1/u/uriage_input.aspx':
        $('table').netztabler();
        break;
      case '/netz/netz1/toiawase_input.aspx':
        if (myprofiles.getone({ myname: 'test' }) == '乙藤')
          popmenuo_F2.setContentFunction(function() {
            $('<input type="button" value="問合削除">')
              .appendTo(this)
              .on('click', function() {
                $('#toi_dt').val('2000/01/01');
                $('input[name=toi_taio_nm]').val('削除依頼');
                $('select[name=tenpo_cd]').val(9901);
                $('select[name=jyotai_cb]').val(0);
                $('select[name=jyotai_cb]')
                  .attr('onclick', $('select[name=jyotai_cb]').attr('onchange'))
                  .trigger('click')
                  .removeAttr('onclick');
              });
          });
        /**textareaの処理 */
        $('#bikou_nm,#kansa_naiyo_nm')
          .css('width', '100%')
          .css('box-sizing', 'border-box')
          .on('keyup', function() {
            //textareaの入力内容の高さを取得
            let scrollHeight = $(this).get(0).scrollHeight;
            //textareaの高さに入力内容の高さを設定
            $(this).css('height', `${scrollHeight}px`);
          })
          .trigger('keyup');
        break;
      case '/netz/netz1/s/student_mailsend_input.aspx':
        /**
         * @typedef Maildatas
         * @property {string} student_cd
         * @property {string} title_nm
         * @property {string} message_nm
         */
        /**
         * @type {Array<Maildatas>}
         */
        var maildatas = JSON.parse(localStorage.getItem('maildata') || '[]');
        var maildata = maildatas.filter(
          one =>
            one.student_cd ==
            $('input[name=student_cd]')
              .val()
              .substr(0, 6)
        );
        console.log(maildatas, maildata);
        if (maildata.length == 0) break;
        $('input[name=title_nm]')
          .val(maildata[0].title_nm)
          .css('width', '800px');
        $('textarea[name=message_nm]')
          .text(maildata[0].message_nm.replace(/\\r\\n/g, '\n'))
          .css('width', '800px')
          .css('height', '700px');
        break;
      case '/netz/netz1/student_list_head_cdselect.aspx':
        {
          let hyojibuttons_student_list = sessionStorage.getItem('hyojibuttons_student_list');
          if (hyojibuttons_student_list != null) $('form[name=form1]').append(hyojibuttons_student_list);
          let framesetrow = $('frameset', parent.document).attr('rows');
          //$('frameset', parent.document).attr('frameset', );
        }
        break;
      case '/netz/netz1/tenpo.aspx':
        $('table').netztabler(1);
        break;
      case '/netz/netz1/s/student_schedule_import.aspx':
        $('table').netztabler();
        break;
      case '/netz/netz1/kanren/app_shido_release_list.aspx':
        $('table').netztabler();
        break;
      case '/netz/netz1/s/toiawase_mailsend_input.aspx':
        //区分があれば
        if ($('#template_id option:contains("【")').length > 0) {
          /**@type {Array<string>} セレクトボックスを作る文字列 aa：bb形式 */
          let templatestr = $('#template_id option:contains("【")')
            .map(function() {
              // prettier-ignore
              return $(this).text().match(/(?<=【).*(?=】)/)[0];
            })
            .get();
          /**@type {number} 何個にわかれているか */
          let kubunnum = Math.max(...templatestr.map(one => one.split('：').length));
          /**@type {Array<Set<string>>} */
          let templateSelectstr = Array(kubunnum);
          for (let i = 0; i < kubunnum; i++) templateSelectstr[i] = new Set();
          templatestr.forEach(one => {
            let tmp = one.split('：');
            for (let i = 0; i < tmp.length; i++)
              for (let j = 0; j < tmp[i].length; j++) {
                templateSelectstr[i].add(...tmp[i][j]);
              }
          });
          //ここからセレクトボックスを作る
          templateSelectstr.forEach(function(one, i) {
            let select = $(`<select name="selectfilter" num=${i}><option></option><select>`).insertBefore('#b_dataset');
            one.forEach(one_one => {
              $(`<option value=${one_one}>${one_one}</option>`).appendTo(select);
            });
          });
          $(document).on('change', 'select[name=selectfilter]', function() {
            $('#template_id option:contains("【")').each(function() {
              let one = $(this);
              $(one).show();
              $('select[name=selectfilter]').each(function() {
                let num = $(this).attr('num');
                let filtertext = $(this).val();
                if (
                  filtertext != null &&
                  $(one)
                    .text()
                    .split('：')
                    [num].indexOf(filtertext) == -1
                )
                  $(one).hide();
              });
            });
          });
        }

        break;
      case '/netz/netz1/kintai/yotei_list.aspx':
        $('select[name=select_tanto_cd]').selectSearcher();
        $('input[name=input_f_dt],input[name=input_t_dt]').datepicker();
        break;
      case '/netz/netz1/todo/todo_list.aspx':
        {
          $('table:first').netztabler();
          //生徒NO記載
          popmenuo_ins.setContentFunction(function() {
            let table = $('table');
            let tablebody = $(table).find('tr:not(:first)');
            let tablehead = getTableHead($('table'), 0);
            let seito_info = new seito_info_class();
            $(tablebody).each(function() {
              let tr = $(this);
              let student_name = $(tr)
                .find('td')
                .eq(tablehead['対象'])
                .text()
                .substring(3);
              let one_infos = seito_info.search('生徒名', student_name);
              if (one_infos.length > 0) $(tr).attr('student_cd', one_infos[0].生徒NO);
              if (one_infos.生徒NO != null) $(tr).attr('student_cd', one_infos.生徒NO);
            });
            $('table')
              .find('tr')
              .each(function(i) {
                if (i == 0) $('<td student_cd="true">student_cd</td>').appendTo(this);
                else $(`<td student_cd="true">${$(this).attr('student_cd')}</td>`).appendTo(this);
              });
          });
        }
        break;

      case '/netz/netz1/todo/todo_input.aspx':
        if (localStorage.getItem('testplay') == 'true') {
          popmenuo_F2.setContentFunction(function() {
            let tehaihyo = $('<button type="button">手配票</button>')
              .appendTo(this)
              .on('click', function() {
                //番号セット
                $('#select_base_data')[0].dispatchEvent(new Event('click'));
                $('#base_id').val('8516');
                $('#b_todo_base_reload')[0].dispatchEvent(new Event('click'));
                setTimeout(function() {
                  $('#b_todo_base_set')[0].dispatchEvent(new Event('click'));
                }, 2000);

                $('#start_dt').val(dateslash(dt));
              });
            $('<button type="button">手配票(状態未着手)</button>')
              .appendTo(this)
              .on('click', function() {
                $('select[name=jyotai_cb]').val('A');
                $(tehaihyo).trigger('click');
              });
          });
        }
        /**
         * @typedef Todo
         * @prop {number} student_cd
         * @prop {string} title_nm
         * @prop {Array<string>} checklist_nm
         * @prop {Array<string>} tanto_cd
         * @prop {string} start_dt
         * @prop {string} end_dt
         * @prop {string} kigen_dt
         */
        /**@type {Array<Todo>} */
        var tododata = JSON.parse(localStorage.getItem('tododata')) || [];
        console.log(tododata);
        let todoone = tododata.find(one => one.student_cd == $('input[name=user_cd]').val());
        console.log(todoone);
        for (let property in todoone) {
          switch (property) {
            case 'checklist_nm': {
              /*for (let i of todoone[property]) {
                $(`checklist_nm[${i}]`).val(todoone[property][i]);
                $('input[value="項目追加"]').trigger('click');
              }*/
              $('[name^=checklist_nm]')
                .eq(0)
                .val(todoone[property])[0]
                .dispatchEvent(new Event('change'));
              break;
            }
            case 'base_id': {
              $('#select_base_data')[0].dispatchEvent(new Event('click'));
              $('#base_id').val(todoone[property])[0];
              $('#b_todo_base_reload')[0].dispatchEvent(new Event('click'));
              setTimeout(function() {
                $('#b_todo_base_set')[0].dispatchEvent(new Event('click'));
              }, 2000);
              break;
            }
            case 'tanto_cd': {
              let tanto_cd = todoone[property];
              /*
              for (let i of todoone[property]) {

              }*/
              setTimeout(async function() {
                console.log(tanto_cd);
                $('input[onclick="tanto_change()"]').trigger('click');
                $('#cd_select').val(tanto_cd);
                $('#tenpo_cd')[0].dispatchEvent(new Event('change'));
                //$('#tanto_set')[0].dispatchEvent(new Event('click'));
                setTimeout(() => {
                  $('#tanto_set').trigger('click');
                }, 2000);
              }, 2000);
              break;
            }
            default: {
              $(`[name=${property}]`).val(todoone[property].replace(/<br>/g, '\n'));
              break;
            }
          }
        }
        break;
      case '/netz/netz1/k/moshikomi4_keiyaku_input.aspx': {
        let div = $('input[name=koshu_nm]')
          .closest('tr')
          .next('tr')
          .find('div');
        /**@type {string} */
        let student_cd = $('input[name=student_cd_ch]').val();
        let adddata = {};
        adddata[student_cd] = $(div).text();
        localStorageSaverSync('osusumekouza', adddata);
        break;
      }
      case '/netz/netz1/s/student_mailaddress_list_body.aspx': {
        $('table').netztabler(0);
        break;
      }
      case '/netz/netz1/s/student_mailaddress_list_shukei.aspx': {
        $('table').netztabler(1);
        break;
      }
      case '/netz/netz1/t/worktime_kyuyo_list.aspx': {
        $('table')
          .find('tr:gt(0)')
          .addDatafortr('teacher_cd', function() {
            console.log(this);
            let button = $(this).find('input[value="時給設定"]');
            return getStrBetween($(button).attr('onclick'), "'", "'");
          });
        break;
      }
      case '/netz/netz1/kanren/shido_kekka_list.aspx': {
        //tableに情報追加
        $('table')
          .find('tr')
          .eq(0)
          .find('td')
          .eq(2)
          .text('分');
        $('table').netztabler();

        let tablehead = getTableHead($('table'), 0);
        $('table')
          .find('tr:gt(0)')
          .addDatafortr('jikyutime', function() {
            let tdtext = $(this)
              .find('td')
              .eq(tablehead['分'])
              .text();
            return tdtext.match(/^.*(?=分)/);
          });
        break;
      }
      case '/netz/netz1/todo/todo_rireki_input.aspx': {
        $('table').netztabler();
        break;
      }
      case '/netz/netz1/s/koshu_personal_shukei.aspx': {
        $('table').netztabler();
        break;
      }
      case '/netz/netz1/tehai/shain_shidojikan_list.aspx': {
        $('table').netztabler();
        break;
      }
      case '/netz/netz1/tehai/shido_base_list.aspx': {
        $('table').netztabler();
        popmenuo_ins.setContentFunction(function() {
          $('<button>')
            .text('講師空欄削除')
            .on('click', function() {
              let tablehead = getTableHead($('table'), 0);
              $('table')
                .find('tr:not(:first)')
                .each(function() {
                  if (
                    $(this)
                      .find('td')
                      .eq(tablehead['講師'])
                      .text() == ''
                  )
                    $(this).remove();
                });
            })
            .appendTo(this);
        });

        //ここからブース情報を取得
        /**
         * @typedef {Object} Kihonbooth
         * @property {string} student_kg
         * @property {string} weekday
         * @property {Array<number>} time
         * @property {string} teacher_kg
         */

        let table = $('table');
        let tablehead = getTableHead($(table));
        /**@type {Array<Kihonbooth>} */

        /* pivot
        let kihondata = [];
        $(table)
          .find('tr:not(:first)')
          .each(function() {

            // prettier-ignore
            const gettext = (tr, headtext) => $(tr).find('td').eq(tablehead[headtext]).text();

            let student_kg = gettext(this, '生徒');
            let weekday = gettext(this, '曜');
            let time = Fromtotime.texttimelist(gettext(this, '時間').replace(/\(.*?\)/, ''));
            let teacher_kg = gettext(this, '講師');
            //講師が空だったら除く
            if (teacher_kg == '') return true;
            kihondata.push({
              student_kg: student_kg,
              weekday: weekday,
              time: time,
              teacher_kg: teacher_kg
            });
          });
        let booth = $('<div />', { id: 'booth', style: 'resize: both;' }).appendTo('body');
        $(booth).pivotUI(kihondata, {
          cols: ['teacher_kg'],
          rows: ['weekday', 'time'],
          vals: ['student_kg'],
          aggregatorName: 'List Unique Values',
          renderers: $.extend($.pivotUtilities.renderers, $.pivotUtilities.plotly_renderers, $.pivotUtilities.export_renderers),
          rendererName: 'Heatmap',
          onRefresh: function() {
            $(booth)
              .find('.pvtVal')
              .each(function() {
                if (
                  $(this)
                    .text()
                    .indexOf(',') != -1
                )
                  $(this).css('background-color', '#FF8888');
              });
          },
          sorters: {
            weekday: $.pivotUtilities.sortAs(['日', '月', '火', '水', '木', '金', '土'])
          }
        });
        $(
          '<style>thead > tr > th.pvtTotalLabel, .rowTotal, .pvtGrandTotal { display: none; }</style><style>tbody > tr > th.pvtTotalLabel, .colTotal, .pvtGrandTotal { display: none; }</style>'
        ).appendTo('body');
        $('<style>td.pvtRendererArea > table > thead{position:sticky; top:0px;}</style>').appendTo('body');
        $('.pvtFilterBox').css({ position: 'relative' });

        makePivotTable(kihondata, {
          columns: ['teacher_kg'],
          rows: ['weekday', 'time']
        }).appendTo('body');
        */
        break;
      }
      case '/netz/netz1/t/teacher_schedule_app_day.aspx': {
        let teacher_cd = $('[name=ch_teacher_cd]')
          .val()
          .replace(/'/g, '');
        let iframemaker = new IframeMaker('teacher_schedule_app_day', 800, 0);
        let netzbuttonsofteacher = new NetzButtonsofteacher(
          teacher_cd,
          $('input[value="ネッツメニューにデータ反映"]'),
          iframemaker.divname,
          iframemaker
        );
        netzbuttonsofteacher.makebuttons('shido', '指導予定');
        break;
      }
      case '/netz/netz1/online/zoom_url_input.aspx': {
        $('input[value="登録"]').setshortcutkey('Enter', { ctrlkey: true });
        break;
      }

      case '/netz/netz1/talk/originalimage.aspx': {
        $('.image').on('contextmenu', function() {
          const image64 = $(this).attr('src');
          var a = document.createElement('a');
          a.href = image64;
          a.download = 'image.jpg';
          a.click();
          return false;
        });
      }
    }

    FUNCTION_O.all_page.syori();
  }
});
