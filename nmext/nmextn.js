$(function() {
  console.log('nmextn.js');
  /*/■■■■■■■■■■■■■■■■■■■■常に働く機能■■■■■■■■■■■■■■■■■■■■/*/
  if (document.domain != 'menu.edu-netz.com') return;
  //Caps Lock２回でmode_specialをOFFに
  FUNCTION_T.general.capsescaper();
  //問い合わせ入力画面ではbasemanager（校舎検索）をInsertKeyで起動
  if (location.pathname == '/netz/netz1/toiawase_input.aspx')
    basemanager.setwakekey(45);

  /*/■■■■■■■■■■■■■■■■■■■■以下スペシャルモードのみ■■■■■■■■■■■■■■■■■■■■/*/
  if (myprofiles.getone({ mode_special: 0 }) == 1) {
    //スペシャルモードで全ページ発火
    //エリアモードなら自エリア以外除外
    FUNCTION_T.general.mode_area();
    //DatePickerを設定
    FUNCTION_T.general.set_datepicker();
    //一時的に必要な機能を入れる関数
    FUNCTION_T.general.temporary();
    //ここからページ別発火
    switch (location.pathname) {
      //●●●●●●●●●●●●●●●●●●●●●●●●●●●●Genre：NMのレイアウト修正
      case '/netz/netz1/tehai/shido2_input_sp.aspx':
        //初回手配画面のレイアウトが崩れているので修正
        $('frameset').attr('rows', '136,*');
        break;
      case '/netz/netz1/t/teacher_toroku_list.aspx':
        //なぜかスクロール禁止なので許可
        $('frame[name=teacher_toroku_list_head]')
          .removeAttr('scrolling')
          .removeAttr('noresize');
        break;
      case '/netz/netz1/kanren/booth2.aspx':
        //印刷時ボタンを非表示にする＆印刷をA3横にする
        $('body').before(
          '<style>@media print {input{display:none;} size} @page {size: 420mm 297mm;}</style>'
        );
        //教室名が送られてきたらタイトルに教室名を載せる
        if (sessionStorage.getItem('basename') != undefined) {
          $('title').text('ブース表' + sessionStorage.basename);
        }
        break;
      case '/netz/netz1/kanren/booth_list_print.aspx':
        //A4タテで印刷
        $('body').before('<style>@page {size: 210mm 297mm;}</style>');
        break;
      case '/netz/netz1/schedule/shain_yotei.aspx':
        //社員予定表にswipe仕込む
        $('input[name=b_today]').swipe(
          $('<button>今日～翌月</button>').swipebutton(function() {
            $('input[name="input_f_dt"]').val(dateslash(window.dt));
            $('input[name="input_t_dt"]').val(dateslash(window.dtnextmonth));
            $('input[name=b_submit]').click();
          })
        );
        break;
      case '/netz/netz1/schedule/yotei.aspx':
        //エリア予定表に本日のswipeを仕込む
        $('button[class="ui-datepicker-trigger"]').swipe(
          $('<button>本日</button>').swipebutton(function() {
            $('form[name=form1]')['0'].action = 'yotei.aspx';
            $('form[name=form1]')['0'].input_dt.value = dateslash(dt);
            $('form[name=form1]')['0'].submit();
          })
        );
        break;
      case '/netz/netz1/text/text_haifu_save.aspx':
        //テキスト配布CH完了の確認ページはスキップ
        window.close();
        break;
      case '/netz/netz1/schedule/yotei_input.aspx':
        //予定表のその他と訪問をタスクとして利用
        FUNCTION_T.yotei_input.inputsupport();
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
        $('input[name=b_close]').click();
        break;
      //●●●●●●●●●●●●●●●●●●●●●●●●●●●●Genre：新規関連
      case '/netz/netz1/toiawase_input.aspx':
        //名前のスペースと電話番号整形
        FUNCTION_T.toiawase_input.namenoformatter();
        //問合せ情報からインポート
        FUNCTION_T.toiawase_input.setFDfunctions();
        //整形などいくつかのツール
        FUNCTION_T.toiawase_input.setSupportfunctions();
        //テキストエリア自動拡張
        $('textarea').textarearesizer();
        break;
      case '/netz/netz1/toiawase_list_head.aspx':
        $('input[value="今日"]').swipe(
          $('<button>対応日本日以降</button>').swipebutton(function() {
            $('input[name=input_dt11]').val(dateslash(window.dt));
            $('input[name=input_dt12]').val('');
          })
        );
        break;
      case '/netz/netz1/s/student_renraku_list.aspx':
        //連絡事項の上部にnetzbuttonsを仕込む
        FUNCTION_T.student_renraku_list.topbuttons();
        break;
      //●●●●●●●●●●●●●●●●●●●●●●●●●●●●Genre：現生徒面談関連
      case '/netz/netz1/s/student_mendan_input.aspx':
        //NMEXサーバーからzoom会議室作成をするためのJSON
        FUNCTION_T.student_mendan_input.F2menu();
        break;
      case '/netz/netz1/s/teian_list_body.aspx':
        //開くにスワイプボタン設置
        FUNCTION_T.teian_list_body.openswipebuttons();
        //面談の集計をF2menuに入れる
        FUNCTION_T.teian_list_body.F2menu();
        break;
      case '/netz/netz1/s/student_mailsend_input.aspx':
        //zoomリンクメールテンプレ
        FUNCTION_T.student_mailsend_input.F2menu();
        break;
      case '/netz/netz1/k/moshikomi4_course_select.aspx':
        //通常コース月謝インプット
        FUNCTION_T.moshikomi4_course_select.feeinput();
        //AI受け放題金額追加
        $('[name=tmp_gessya_gk]')
          .swipe(
            $('<button>AI受け放題１科目+3000</button>').swipebutton(function() {
              $('[name=tmp_gessya_gk]').val(
                parseInt($('[name=tmp_gessya_gk]').val()) + 3000
              );
            })
          )
          .swipe(
            $('<button>AI受け放題２科目+4500</button>').swipebutton(function() {
              $('[name=tmp_gessya_gk]').val(
                parseInt($('[name=tmp_gessya_gk]').val()) + 4500
              );
            })
          );
        $('[name=tmp_gessya2_gk]')
          .swipe(
            $('<button>AI受け放題１科目+3000</button>').swipebutton(function() {
              $('[name=tmp_gessya2_gk]').val(
                parseInt($('[name=tmp_gessya2_gk]').val()) + 3000
              );
            })
          )
          .swipe(
            $('<button>AI受け放題２科目+4500</button>').swipebutton(function() {
              $('[name=tmp_gessya2_gk]').val(
                parseInt($('[name=tmp_gessya2_gk]').val()) + 4500
              );
            })
          );
        break;
      case '/netz/netz1/k/moshikomi4_input.aspx':
      case '/netz/netz1/k/moshikomi4_keiyaku_input.aspx':
        //基準単価を一番下に表示
        FUNCTION_T.moshikomi4_input.tanka();
        //面談履歴を提案書画面で打つ
        FUNCTION_T.moshikomi4_input.mendanrireki();
        break;
      case '/netz/netz1/k/moshikomi4_osusume_input.aspx':
        //おススメ講座選択に学年フィルターを付ける
        FUNCTION_T.moshikomi4_osusume_input.support();
        break;
      case '/netz/netz1/s/teian_shukei_tenpo.aspx':
        //面談集計を保存＆読み込み
        FUNCTION_T.teian_shukei_tenpo.F2menu();
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
      case '/netz/netz1/kintai/teacher_kintai_list.aspx':
        //講師の勤怠漏れ・健康CH漏れの確認
        FUNCTION_T.teacher_kintai_list.checkerror();
        break;
      //●●●●●●●●●●●●●●●●●●●●●●●●●●●●Genre：現生徒運用関連
      case '/netz/netz1/s/student_renraku_rireki_input.aspx':
      case '/netz/netz1/s/student_renraku_input.aspx':
        FUNCTION_T.student_renraku_input.F2menu();
        FUNCTION_T.student_renraku_input.inputsupport();
        FUNCTION_T.student_renraku_input.notesaver();
        break;
      case '/netz/netz1/student_data_input.aspx':
        //googlemapを開く　問い合わせ情報と詳細情報と２箇所あるので一般関数化
        post_to_addr_setter();
        break;
      case '/netz/netz1/s/student_studyplan_list.aspx':
        //仮会員証ページにしちゃう
        FUNCTION_T.student_studyplan_list();
        break;
      case '/netz/netz1/kanren/student_shido_yotei.aspx':
        //生徒の指導予定表示期間にswipe仕込む
        FUNCTION_T.student_shido_yotei.SWrange();
        break;
      case '/netz/netz1/s/student_info_input.aspx':
        //基本情報に引き継ぎ連絡事項のフォーマット挿入
        FUNCTION_T.student_info_input.F2menu();
        break;
      case '/netz/netz1/student_list_body.aspx':
        //生徒一覧画面で右クリックで連絡事項を開く
        FUNCTION_T.student_list_body.CTXrenrakuopen();
        break;
      case '/netz/netz1/kanren/student_schedule.aspx':
        //生徒スケジュール表を印刷仕様に
        FUNCTION_T.student_schedule.F2menu();
        break;
      case '/netz/netz1/shingaku/kouza_jyuko_list.aspx':
        //td内のstudent_cdに対してリンクを貼る
        $('table:contains("CD")').studentcdlinker();
        break;
      //●●●●●●●●●●●●●●●●●●●●●●●●●●●●Genre：ブース・手配関連
      case '/netz/netz1/kanren/booth_select_head.aspx':
        FUNCTION_T.booth_select_head.CTXboothopen();
        break;
      case '/netz/netz1/tehai/tehai_input.aspx':
        //講習期間をグローバルから取得して入力　前倒しはスワイプで
        FUNCTION_T.tehai_input.setKoshu();
        //手配済み、手配中で登録
        FUNCTION_T.tehai_input.swipefinish();
        // 初回の終了タイミングを一週間後で自動入力（エラー回避）
        if ($('input[name=sho_vl]').val() != '') {
          $('input[name=sho_to]').val(
            dateslash(afterdays(new Date($('input[name=sho_from]').val()), 7))
          );
        }
        break;
      case '/netz/netz1/tehai/shido2_input_sp_check.aspx':
        //手配入力画面でマスターを使う
        FUNCTION_T.shido2_input_sp_check.setmaster();
        break;
      case '/netz/netz1/kanren/shido_yotei_input.aspx':
        //指導予定の追加で45分のpicker
        $('input[name=shido_jikan]').netzpicker([45], 50, 2, true);
        break;
      case '/netz/netz1/kanren/shido_yotei_edit.aspx':
        //指導時間のpickerと教科名に備考をswipeで仕込む
        FUNCTION_T.shido_yotei_edit.inputsupport();
        break;
      case '/netz/netz1/shingaku/kouza_enshu_jyuko_list.aspx':
        //演習講座の名簿作成
        FUNCTION_T.kouza_enshu_jyuko_list.F2menu();
        break;
      case '/netz/netz1/tehai/tehai_kanren_list.aspx':
      case '/netz/netz1/kanren/student_kanren_list.aspx':
        //relpop
        $('input[name=b_edit]').each(function() {
          $(this).bind('contextmenu', function() {
            sessionStorage.kanrendel = 'true';
            $(this).click();
            return false;
          });
        });
        if ((getparameter().relpop || 0) == 1) {
          $('tr').each(function() {
            $(this)
              .children()
              .eq(0)
              .remove();
            $(this)
              .children()
              .eq(0)
              .remove();
            $(this)
              .children()
              .eq(1)
              .remove();
            $(this)
              .children()
              .eq(1)
              .remove();
            $(this)
              .children()
              .eq(1)
              .remove();
            $(this)
              .children()
              .eq(2)
              .remove();
          });
        }
        break;
      case '/netz/netz1/tehai/kanren_input.aspx':
      case '/netz/netz1/kanren/kanren_input.aspx':
        //生徒NG登録
        if (sessionStorage.kanrendel == 'true') {
          $('input[name=status_cb]').val(['1']);
          sessionStorage.kanrendel = 'false';
          $('input[value="　登録　"]').click();
        }
        $('input[name=ng_nm]').swipe(function() {
          var parentobj = $(this);
          $('<input type="button" value="生徒NG">')
            .setRight(parentobj)
            .swipebutton(function() {
              $(parentobj).val('生徒NG');
              $('table')
                .find('input[type=radio][name$=_cb]')
                .val([0]);
              $('input[name=status_cb]').val([2]);
              $('input[value="　登録　"]').click();
            });
        });
        break;
      //●●●●●●●●●●●●●●●●●●●●●●●●●●●●Genre：成績関連
      case '/netz/netz1/seiseki/seiseki_search_body.aspx':
        //テスト名一括設定
        FUNCTION_T.seiseki_serch_body.F2menu();
      //break不要
      case '/netz/netz1/seiseki/seiseki_list.aspx':
      case '/netz/netz1/seiseki/seiseki_input_save.aspx':
        //成績一覧からテスト名を一括で変更
        FUNCTION_T.seiseki_input.Modetestnamerepair();
        //学校別テスト名picker
        FUNCTION_T.seiseki_input.testnamepickers();
        break;
      case '/netz/netz1/seiseki/seiseki_input.aspx':
      case '/netz/netz1/seiseki/seiseki_input2.aspx':
        //成績一覧からテスト名を一括で変更
        FUNCTION_T.seiseki_input.Modetestnamerepair();
        FUNCTION_T.seiseki_input.Modetestrewriter();
        //連絡事項用に成績一覧をテキスト形式に
        FUNCTION_T.seiseki_input.exportseisekitext();
        //９科目のテンプレを入れる
        FUNCTION_T.seiseki_input.F2menu();
        break;
      case '/netz/netz1/seiseki/seiseki_input.aspx':
      case '/netz/netz1/seiseki/seiseki_input2.aspx':
        //テストステータス修正モード
        var testrewriter =
          JSON.parse(sessionStorage.getItem('testrewriter')) || [];
        if (Object.keys(testrewriter) != 0) {
          FUNCTION_T.seiseki_input.mode_testrewriter();
        }
        break;
      //●●●●●●●●●●●●●●●●●●●●●●●●●●●●Genre：出社関連
      case '/netz/netz1/index_test.aspx':
        //テスト問題のページに契約情報等の一覧を表示
        FUNCTION_T.index_test.initialcheck();
        break;
      case '/netz/netz1/index_faq.aspx':
        $('body').html('');
        //日次タスク
        FUNCTION_T.index_faq.dailytask();
      case '/netz/netz1/t/worktime_list.aspx':
        //講師出勤簿承認状況確認
        FUNCTION_T.worktime_list.F2menu();
        break;
      case '/netz/netz1/kintai/start_input.aspx':
        //出社時報告
        FUNCTION_T.start_input.auto();
        break;
      case '/netz/netz1/s/schedule_input_check.aspx':
        //予定表をタスクマネージャーとして使う
        FUNCTION_T.schedule_input_check.inputsupport();
        break;
    }
  }
});
