var FUNCTION_T = FUNCTION_T || {};
$(function() {
  if (document.domain != 'portal.edu-netz.com') return;
  console.log('nmextp.js');
  $('select[name=tenpo_cd]')
    .prepend(`${makeOption(NX.NOWBASE[myprofiles.getone({ mynumber: '000231' })])}<option value="allmode">全教室表示</option>`)
    .selectSearcher();
  setEmppicker();
  //成績情報の目標非表示をデフォに
  $('input[name=score_only]')
    .prop('checked', true)
    .val('true');
  //load終了を監視
  var mutationObserver = new MutationObserver(function(mutationsList) {
    mutationsList.forEach(function(nodes) {
      nodes.removedNodes.forEach(function(elem) {
        if ($(elem).attr('id') == 'loading') {
          setTimeout(CheckSave, 1000);
          setTimeout(setSTM, 1100);
          switch (location.pathname) {
            case '/portal/Seiseki/StudentList':
              setTimeout(loadexamdate, 1200);
              break;
          }
        }
      });
    });
  });
  mutationObserver.observe(document.getElementsByTagName('body')[0], {
    childList: true
  });
  switch (location.pathname) {
    case '/portal/Menu/ShainPortal':
      $('a[data-original-title="旧ネッツメニュー"]').on('contextmenu', function() {
        window.open(`${NX.CONST.host}/index_system.aspx`, '_blank');
        return false;
      });
      break;
    case '/portal/Booth/FurikaeIraiList':
      //portal振替一覧画面にstudentLinkerを仕込む
      $(document).on('contextmenu', 'td:has(.btn-shidoukaisuu-50)', function() {
        const match = $(this)
          .find('.btn-shidoukaisuu-50')
          ?.val()
          ?.match(/^(.+?)_/);
        const student_cd = match ? match[1] : false;
        const student_nm = $NX($(this)).getOnlyNode();
        if ($NX(student_cd).isHexaNumber()) new studentLinkMenu().setMember(student_cd, student_nm);
        return false;
      });
      break;
    case '/portal/Booth/Furikae121': {
      //portal振替画面にstudentLinkerを仕込む
      const [student_cd, student_nm] = $('.student-info')
        .text()
        ?.split(' ');
      if ($NX(student_cd).isHexaNumber())
        $('.student-info').on('contextmenu', function() {
          new studentLinkMenu().setMember(student_cd, student_nm);
          return false;
        });
      break;
    }
    case '/portal/ICTContents/StudentList':
      popmenut_F2.setContentFunction(function() {
        $('<button>全教室追加</button>')
          .appendTo(this)
          .on('click', function() {
            $('select[name=tenpo_cd]')
              .append('<option value="whole">全教室（Portal）</option>')
              .val('whole');
            popmenut_F2.closemenu();
          });
        $('<button>順位加工</button>')
          .appendTo(this)
          .on('click', function() {
            $(document)
              .find('#tbl_resultlist')
              .find('tr')
              .each(function(e) {
                const $this = $(this);
                [6, 4, 2, 1].forEach(function(ind) {
                  $this
                    .find('td')
                    .eq(ind)
                    .remove();
                });
                $(`<td>${e < 3 ? '' : e - 2}</td>`).prependTo($this);
                $this.find('.btn-link').remove();
              });
            popmenut_F2.closemenu();
          });
      });
      break;
    case '/portal/StudyManagement/StudentListKakomon':
      $('h4').on('contextmenu', function() {
        var kako100 = JSON.parse(localStorage.getItem('kako100')) || {};
        var studentcd, flg;
        $('#tbl_resultlist')
          .find('.list')
          .each(function() {
            flg = false;
            studentcd = $(this)
              .find('td')
              .eq(2)
              .text();
            if (kako100[studentcd] && kako100[studentcd].prevcount && kako100[studentcd].prevcount < 100 && kako100[studentcd].count >= 100) {
              flg = true;
            }
            if (!flg) $(this).remove();
          });
        return false;
      });
      $('h4').on('dblclick', function() {
        var kako100 = JSON.parse(localStorage.getItem('kako100')) || {};
        var studentcd, basename, blockname;
        var summary = {
          関東: { allstudents: 15 },
          福岡: { allstudents: 160 },
          九州: { allstudents: 200 },
          中四国: { allstudents: 150 },
          オンライン: { allstudents: 7 }
        };

        $('#tbl_resultlist')
          .find('.list')
          .each(function() {
            studentcd = $(this)
              .find('td')
              .eq(2)
              .text();
            basename = $(this)
              .find('td')
              .eq(4)
              .text();
            blockname = new NXBase(basename).toBlockName();
            if (kako100[studentcd]) {
              $(this)
                .find('td')
                .eq(12)
                .text(new ExDate(kako100[studentcd].lastupdate).as('mm/dd HH:MM'));
              $(this)
                .find('td')
                .eq(11)
                .text(kako100[studentcd].updatecount)
                .attr('style', '');
              $(this)
                .find('td')
                .eq(10)
                .text(blockname);
            } else {
              $(this)
                .find('td')
                .eq(12)
                .text('');
            }
            summary[blockname] = summary[blockname] || {};
            summary[blockname].startstudents = (summary[blockname].startstudents || 0) + 1;
            summary[blockname].totalcount =
              (summary[blockname].totalcount || 0) +
              parseInt(
                $(this)
                  .find('td')
                  .eq(7)
                  .text()
              );
          });
        for (let key in summary) {
          summary[key].startrate = `${Math.ceil((summary[key].startstudents / summary[key].allstudents) * 100)}%`;
        }
        console.log(summary);
        fireonpage('setTableSorter()');
      });
      $.post(
        'https://portal.edu-netz.com/portal/StudyManagement/SearchStudentsListKakomonMarathon',
        {
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
        },
        res => {
          const table = $(res);
          const NXTable = $NX(table).makeNXTable();
          console.log(NXTable);
        }
      );
      break;
    //模試結果を画像として保存
    case '/portal/Utility/MoshikekkaDetail':
      $('#div_omote,#div_ura').on('dblclick', function() {
        const target = this.getAttribute('id').slice(4);
        const image64 = document.getElementById(`image_${target}`).getAttribute('src');
        $('<a>', {
          href: image64,
          download: 'image.jpg'
        })
          .appendTo('body')[0]
          .click()
          .remove();
      });
      break;
    case '/portal/StudyManagement/DailyAchivement':
      popmenut_F8.setContentFunction(function() {
        $('[name=result_homework]').val(0);
        $('#btn_regist').trigger('click');
        popmenut_F8.closemenu();
      });
      break;
    case '/portal/StudyManagement/StudentDailyCheck':
      var student_cd = $('#student_cd').val();
      $(`td:contains("${student_cd}")`).on('contextmenu', function() {
        STM.set_student(student_cd);
        return false;
      });
      //学習時間グラフの縦が長すぎる問題
      var barchart = $('[src*="h=600"]');
      barchart.each(function() {
        $(this).attr(
          'src',
          $(this)
            .attr('src')
            .replace('600', '400')
        );
      });
      break;
    case '/portal/Homework/KouzaDetail':
      $('table')
        .find('tr:gt(0)')
        .each(function() {
          const td0 = $(this)
            .find('td')
            .eq(0);
          if (td0.text().match('[0-9]{6}'))
            td0.on('contextmenu', function() {
              STM.set_student($(this).text());
              return false;
            });
        });
      break;
    //成績入力画面
    case '/portal/Seiseki/EditScore':
      popmenut_F2.setContentFunction(function() {
        $('<button>トグル入れ替え</button>')
          .appendTo(this)
          .on('click', function() {
            $('input[type=checkbox]').each(function() {
              $(this).trigger('click');
            });
            popmenut_F2.closemenu();
          });
      });
      break;
    //汎用データ
    case '/portal/DataExtract/SearchRecords': {
      const tableHead = $('table').getTableHead();

      //studentcdlinker
      const eqStudentcd = tableHead['生徒no'] || 7;
      $('table').studentLinker(eqStudentcd);

      const title = $('h5').text();
      if (title.indexOf('受験校入力状態') != -1) {
        popmenut_F2.setContentFunction(function() {
          $('<button>', {
            type: 'button',
            text: '合格者を後ろに',
            on: {
              click: () => {
                $('tr:contains("進学")').each(function() {
                  $(this).appendTo('#tbl_resultlist');
                });
                popmenut_F2.closemenu();
              }
            }
          }).appendTo(this);
        });
      }
      break;
    }
    //勤怠管理メニュー
    case '/portal/Kintai/ShusshaYoteiView':
      const timeParse = {
        '13:00-22:00': '木',
        '14:00-22:00': '通常',
        '10:40-21:20': '土/C',
        '10:40-18:40': '日',
        '09:00-17:00': 'フレンド',
        '10:40-19:00': 'A',
        '13:00-21:20': 'B',
        '08:30-17:00': '模'
      };
      popmenut_F2.setContentFunction(function() {
        $('<button>', {
          type: 'button',
          text: '勤怠チェック',
          on: {
            click: () => {
              $('td.day').each(function() {
                const $td = $(this);
                const innerText = $td.text();
                $td.text(`${timeParse[innerText] || innerText}`);
              });
            }
          }
        }).appendTo(this);
      });
      break;
    //ブース組
    case '/portal/Booth/EditTehai121':
      $(document).on('contextmenu', '.student-info', function() {
        const student_cd = $('[name=user_id]').val();
        window.open(`${NX.CONST.host}/s/student_renraku_list.aspx?student_cd=${student_cd}`, '_blank');
        return false;
      });
      break;
    case '/portal/Booth/EditTehaiNitteiSentakuKouza':
      $(document).on('contextmenu', '.card-student', function() {
        const scheduleBtn = $(this).find('button.btn-show-schedule');
        if (scheduleBtn.length == 0) return false;
        const student_cd = scheduleBtn.val();
        window.open(`${NX.CONST.host}/s/student_renraku_list.aspx?student_cd=${student_cd}`);
      });
      const bikouQuery = 'input[name^=shidou_bikou]';
      $(document)
        .on('change', bikouQuery, function() {
          localStorage.setItem('trainingRemarks', $(this).val());
        })
        .on('dblclick', bikouQuery, function() {
          $(this).val(localStorage.getItem('trainingRemarks'));
        })
        .on('contextmenu', bikouQuery, function() {
          $(this).val(localStorage.getItem('trainingRemarks'));
          $(this)
            .parents('tr')
            .find('input[type=radio][value=true]')
            .parents('label')
            .trigger('click');
          return false;
        });
      break;
  }
});
function loadexamdate() {
  var examnum = parseInt($('input[name=termitem_id]:checked').val()) - 11;
  console.log($('input[name=termitem_id]:checked').val());
  console.log('examnum', examnum);
  const examlist = JSON.parse(localStorage.getItem('SD_examlist')) || {};
  console.log(examlist);
  var schoolname;
  $('tr').each(function() {
    schoolname = $(this)
      .find('td')
      .eq(4)
      .text();
    if (examlist[schoolname]) $(this).append(`<td>${new ExDate(examlist[schoolname][examnum]).as('mm/dd')}</td>`);
  });
}
function CheckSave() {
  if (location.pathname != '/portal/StudyManagement/StudentListKakomon') return false;
  var kako100 = JSON.parse(localStorage.getItem('kako100')) || {};
  var studentcd, loadcount, updatecount, prevcount;
  $('#tbl_resultlist')
    .find('.list')
    .each(function() {
      studentcd = $(this)
        .find('td')
        .eq(2)
        .text();
      loadcount =
        parseInt(
          $(this)
            .find('td')
            .eq(7)
            .text()
        ) || 0;
      prevcount = (kako100[studentcd] || {}).count || 0;
      if (loadcount > 0 && (kako100[studentcd] || {}).count != loadcount) {
        $(this)
          .find('td')
          .eq(2)
          .css('font-weight', 'bold');
        updatecount = (kako100[studentcd] || {}).updatecount + 1 || 1;
        kako100[studentcd] = {
          count: loadcount,
          lastupdate: new ExDate().as('yyyy/mm/dd HH:MM'),
          updatecount: updatecount,
          prevcount: prevcount
        };
      }
    });
  localStorage.setItem('kako100', JSON.stringify(kako100));
}
function setSTM() {
  switch (location.pathname) {
    case '/portal/ICTContents/StudentList':
    case '/portal/Seiseki/StudentList':
    case '/portal/StudyManagement/StudentList':
    case '/portal/StudyManagement/StudentListKakomon':
    case '/portal/StudyManagement/StudentListDailyCheck':
      const eqlist = {
        '/portal/ICTContents/StudentList': {
          cd: 2,
          school: 4
        },
        '/portal/Seiseki/StudentList': {
          cd: 0,
          school: 4
        },
        '/portal/StudyManagement/StudentList': {
          cd: 2,
          school: 4
        },
        '/portal/StudyManagement/StudentListKakomon': {
          cd: 2,
          school: 5
        },
        '/portal/StudyManagement/StudentListDailyCheck': {
          cd: 2,
          school: 5
        }
      };
      const eq = eqlist[location.pathname];
      $('#tbl_resultlist,#tbl_studentlist,tbody').each(function() {
        $(this)
          .find('tr')
          .each(function() {
            if ($(this).attr('super') == 'true') return true;
            $(this)
              .find('td')
              .eq(eq.cd)
              .on('contextmenu', function() {
                STM.set_student($(this).text());
                return false;
              });
            $(this)
              .find('td')
              .eq(eq.school)
              .on('contextmenu', function() {
                SIG.getschedule($(this).text(), 60);
                return false;
              });
            $(this).attr('super', 'true');
          });
      });
      break;
  }
}
function setEmppicker() {
  switch (location.pathname) {
    case '/portal/Workflow/TakeOver':
      $('#shain_code').emppicker();
      break;
    case '/portal/Workflow/GeneralPurpose':
      $('[id^="shain"]').each(function() {
        $(this).emppicker();
      });
      break;
    case '/portal/Kintai/ShusshaYoteiInput':
      $('[id^="dairi_shain_cd"]').each(function() {
        $(this).emppicker();
      });
      break;
  }
}
