///<reference path="./nmexog.js" />
///<reference path="./nmexof.js"/>
///<reference path="./nmexo.js"/>
var FUNCTION_O = FUNCTION_O || {};
$(function() {
  if (document.domain != 'portal.edu-netz.com') return;
  console.log('nmexop.js');
  console.log(location.pathname);

  switch (location.pathname) {
    case '/portal/Workflow/GeneralPurpose':
      console.log($('h4').text());
      switch ($('h4').text()) {
        case '問合せ情報重複削除':
          popmenuo_ins.setContentFunction(function() {
            $('<input type="button" value="問合検索">')
              .appendTo(this)
              .on('click', function() {
                let student_kt = $('input[name=txt_student_name]')
                  .val()
                  .trim();
                window.open(
                  `https://menu.edu-netz.com/netz/netz1/toiawase_list_body.aspx?tenpo_cd=&menu_cb=1&student_kt=${netzencodeURIComponent(
                    student_kt
                  )}&tel_no=&mailaddress_nm=&head_cb=2`,
                  '_blank',
                  'noreferrer'
                );
              });
          });
          break;
        case '講師ライセンスカード再発行':
        case 'スタッフID削除依頼':
          popmenuo_ins.setContentFunction(function() {
            let teacherbuttons = new NetzButtonsofteacher($('#teacher').val() || $('#staff').val(), null, '_blank');
            teacherbuttons.makebuttons('list', '講師一覧', { menu_cb: 'i' }).appendTo(this);
          });
          break;
        case '生徒IDカード再発行':
          popmenuo_ins.setContentFunction(function() {
            let seitobuttons = new NetzButtonsofseito($('#student').val(), null, '_blank');
            seitobuttons.makebuttons('renraku', '生徒連絡事項').appendTo(this);
          });
          break;
        case '管轄教室(連絡事項送信先)変更':
          popmenuo_ins.setContentFunction(function() {
            $('<button />', {
              text: '社員管轄教室'
            })
              .appendTo(this)
              .on('click', function() {
                window.open(`https://menu.edu-netz.com/netz/netz1/user/shain_tenpo_input.aspx?shain_cd=${$('#shain').val()}`);
              });
            //コピペ用
            $('<div />')
              .text($('#tenpo_cd').val())
              .insertAfter('#tenpo_cd');
          });
          $('#tenpo_cd')
            .swipe(
              $('<i/>', {
                class: 'fa-solid fa-clipboard cliptext',
                clipcontent: $('#tenpo_cd').val()
              })
            )
            .setContentFunction(function() {
              $(this).trigger('click');
            });
          break;
      }
      break;
    case '/portal/Kintai/ShusshaYoteiInput':
      {
        $('input[name^="button-group_"][value="99"],label[for^=pattern][for*="99"]').on('change', function() {
          console.log('test');
          $(this)
            .closest('tr')
            .next('tr')
            .find('input.basho[type=text]')
            .val('');
        });
      }
      break;
    //閉じるボタンだけ
    case '/portal/Workflow/WorkFlowProcessing': {
      if ($('input,button,select').length == 1) return;
      myclosetab();
      break;
    }
    case '/portal/Seiseki/StudentMenu': {
      $('script').each(function() {
        console.log($(this).html());
      });
      break;
    }
    case 'portal/Nalu/DailyMenuForAdmin': {
    }
    case '/portal/Seiseki/StudentList': {
      var getexamname = function() {
        /**@type {string} */
        let exams;
        switch ($('input[name=termitem_id]:checked').val()) {
          case '11':
            exams = '１学期中間';
            break;
          case '12':
            exams = '１学期期末';
            break;
          case '13':
            exams = '２学期中間';
            break;
          case '14':
            exams = '２学期期末';
            break;
          case '15':
            exams = '学年末';
            break;
        }
        return exams;
      };
      popmenuo_F2.setContentFunction(function() {
        $('<input>', { type: 'button', name: 'addexam' })
          .val('定期テスト日程追加')
          .appendTo(this)
          .on('click', async function() {
            let exams = getexamname();
            let student_exams_data = JSON.parse(await localStorageLoader(student_exams.localname)) || {};
            console.log(exams, student_exams_data);

            $('thead').each(function() {
              let tbody = $(this).next('tbody');
              console.log(this, tbody);
              //let thead = $(this);
              $(tbody)
                .find('tr')
                .each(function() {
                  let student_cd = $(this)
                    .find('td')
                    .eq(0)
                    .text();
                  let student_exam = student_exams_data[student_cd] || {};
                  let td = $('<td />').appendTo(this);
                  if (student_exam[exams] != null) $(td).text(`${student_exam[exams].from_dt}～${student_exam[exams].to_dt}`);
                });
            });
          });
      });

      let mutationObserver = new MutationObserver(function(mutationsList) {
        mutationsList.forEach(function(nodes) {
          if (nodes.addedNodes.length > 0) {
            //それぞれのtheadを取得
            let exams = getexamname();
            console.log(exams);
            $('thead').each(function() {
              let tbody = $(this).next('tbody');
              $(tbody)
                .find('tr')
                .each(function() {
                  let student_cd = $(this)
                    .find('td')
                    .eq(0)
                    .text();
                  /**
                   * 入力済みならtrue,未入力ならfalseを返す
                   * @param {JQuery} tr
                   * @return {boolean}
                   */
                  let allinputted = function(tr) {
                    //ボタンがあれば未入力
                    if (
                      $(tr)
                        .find('td:eq(7)')
                        .find('button').length > 0
                    )
                      return false;
                    //7個目以降に空欄があれば未入力
                    let ret = true;
                    $(tr)
                      .find('td:gt(6)')
                      .each(function() {
                        if ($(this).text() == '') {
                          ret = false;
                          return false;
                        }
                      });
                    return ret;
                  };
                  student_exams.deepsave({
                    [student_cd]: {
                      [exams]: { allinputted: allinputted(this) }
                    }
                  });
                });
            });
          }
        });
      });
      mutationObserver.observe(document.getElementById('tbl_studentlist'), {
        childList: true
      });
      break;
    }
    //NALU運用画面
    case '/portal/Nalu/DailyMenuForAdmin': {
      $('#btn_search_student').setshortcutkey('Enter', { ctrlkey: true });
      $('#btn_studyreport_regist').setshortcutkey('Enter');

      class DD {
        dragjyotai = false;
        drag;
        /**
         *
         * @param {JQuery} draggable
         * @param {JQuery} dropable
         */
        constructor(draggable, dropable) {
          this.ddStart(draggable, dropable);
        }
        /**
         *
         * @param {JQuery} draggable
         * @param {JQuery} dropable
         */
        ddStart(draggable, dropable) {
          let _this = this;
          //ドラッグ開始
          draggable.attr('draggable', 'true').on('dragstart', function() {
            _this.handleDragStart(this);
          });

          //ドラッグ中
          dropable
            .on('dragenter dragover', function(e) {
              if (_this.dragjyotai === false || $(e.currentTarget).attr('id') !== $(dropable).attr('id')) {
                return;
              }
              e.stopPropagation();
              e.preventDefault();
            })
            //ドロップ処理
            .on('drop', () => this.handleDrop());
        }
        handleDragStart(obj) {
          this.drag = $(obj);
          this.dragjyotai = true;
        }
        /**@abstract */
        handleDrop() {}
      }
      //出席処理
      class shussekiDD extends DD {
        constructor() {
          super($('#tbl_uplabologin_students tr'), $('#tbl_studying_students').parent('div'));
        }
        handleDrop() {
          $(this.drag)
            .find('input[type=checkbox]')
            .prop('checked', true);
          $('#btn_shusseki').trigger('click');
        }
      }
      //出席取消処理
      class shussekiTorikeshiDD extends DD {
        constructor() {
          super($('#tbl_studying_students tr'), $('#tbl_uplabologin_students').parent('div'));
        }
        handleDrop() {
          $(this.drag)
            .find('button.btn-shusseki-cancel')
            .trigger('click');
        }
      }

      new shussekiDD();
      new shussekiTorikeshiDD();

      const observer = new MutationObserver(mutationsList => {
        mutationsList.forEach(nodes => {
          if (nodes.addedNodes.length > 0) {
            new shussekiDD();
            new shussekiTorikeshiDD();
          }
        });
      });

      observer.observe(document.getElementById('partialViewContainer'), {
        childList: true
      });
    }
  }
});
