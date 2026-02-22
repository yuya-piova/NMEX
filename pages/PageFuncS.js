import PopMenu from '../core/PopMenu.js';

export default class PageFuncS {
  constructor() {
    this.path = location.pathname;
  }
  setZoomMaker() {
    const popmenu = new PopMenu({ id: 'main' }); // 定義済みのmainを取得する

    //n8nでzoom会議室作成をする
    const student_cd = $('input[name=student_cd]').val();

    popmenu.appendItems([
      {
        text: '面談組案内文',
        handler: () => {
          const date = new ExDate($('#mendan_dt').val() + ' ' + $('#mendan_tm').val());
          const dateStr = $NX(`${date.as('m月d日（aaa） H:MM')}～（最大６０分）`).toFullWidth();
          const way = $('input[name=mendan_way_cb]:checked').val();
          $('<textarea id="invite" rows="10" cols="80"></textarea>')
            .appendTo('body')
            .val(LCT.TEMPLATE.Meeting[way](dateStr));
          navigator.clipboard.writeText(LCT.TEMPLATE.Meeting[way](dateStr));
          PX_Toast('クリップボードにコピーしました');
          const note = {
            1: '★日程案内済',
            2: '日程案内済※要zoomURL'
          };
          $(`[name=bikou_nm]`).valPrepend(note[way]);
          $('[name=shido_data_flg]').prop('checked', true);
        }
      },
      {
        text: 'Zoom作成',
        handler: () => {
          const mendt = new ExDate($('#mendan_dt').val());
          const topic = `三者面談【${$('.studentLinker').text()}】`;
          const startdt = `${mendt.as('yyyy-mm-dd')}T${$('#mendan_tm').val()}:00`;
          const duration = parseInt($('[name=mendan_jk]').val()) || 50;
          $.post(NX.ENDPOINT.zoomMaker, { topic, startdt, duration }, function(data) {
            console.log('Response from Server', data);
            const { join_url, id, password } = JSON.parse(JSON.stringify(data));
            const meetingID = `${String(id).slice(0, 3)} ${String(id).slice(3, 7)} ${String(id).slice(7, 11)}`;
            const dateStr = $NX(mendt.as('m月d日（aaa） ') + $('#mendan_tm').val()).toFullWidth();
            const template = LCT.TEMPLATE.joinAnnounce(dateStr, join_url, meetingID, password);
            $('<textarea id="invite" rows="10" cols="80"></textarea>')
              .appendTo('body')
              .val(template);
            navigator.clipboard.writeText(template);
            PX_Toast('クリップボードにコピーしました');
            $(`[name=bikou_nm]`)
              .valReplace('日程案内済※要zoomURL', '')
              .valPrepend('★URL送付済');
            $('#url_dt').val(join_url);
            $('#meeting_id').val(meetingID);
            $('#passcode').val(password);
          });
        }
      },
      {
        text: 'メール送付',
        handler: () => {
          const clip = $('#invite').length == 1 ? 'true' : 'false';
          const param = {
            student_cd,
            limit: $('#mendan_dt').val(),
            clip
          };
          window.open(`${NX.CONST.host}/s/student_mailsend_input.aspx?${$.param(param)}`);
        }
      },
      {
        text: '履歴入力済',
        handler: () => {
          $('[name=bikou_nm]')
            .valReplace('▽履歴未入力')
            .valReplace('★日程案内済')
            .valReplace('★URL送付済')
            .valPrepend('■');
          $('#edt_cb').prop('checked', false);
          $('[name=b_submit]').trigger('click');
        }
      },
      {
        text: '指導予定',
        handler: () => {
          if (!student_cd) return false;
          const iframe = new IframeMakerEx({ iframeName: 'yotei', x: 800, y: 10, draggable: true }).loadUrl(
            `${NX.CONST.host}/kanren/student_shido_yotei.aspx?student_cd=${student_cd}`
          );
        }
      }
    ]);
  }
}
