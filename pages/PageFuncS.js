// pages/PageFuncS.js
import { NX_Utils, createZoomMeetingAsync } from '../core/utils.js';
import { toast } from '../core/components/FluxToast.js';
import PopMenu from '../core/PopMenu.js';
import ConsoleBot from '../core/components/ConsoleBot.js';

export default class PageFuncS {
  constructor() {
    this.path = location.pathname;
    this.bot = new ConsoleBot();
  }
  setZoomMaker() {
    const popmenu = new PopMenu({ id: 'main' });
    const student_cd = $('input[name=student_cd]').val();

    popmenu.appendItems([
      {
        text: '✉️ 面談組メール送付',
        handler: () => {
          const data = this._extractData();
          if (!data.dateObj) {
            toast.error('エラー: 面接日時が正しく入力されていません');
            return;
          }

          const dateStr = NX_Utils.toFullWidth(`${data.dateObj.as('m月d日（aaa） H:MM')}～（最大６０分）`);
          const way = $('input[name=mendan_way_cb]:checked').val();
          const message = LCT.TEMPLATE.Meeting[way](dateStr);

          this._openMailSending(message, student_cd);

          const note = {
            1: '★日程案内済',
            2: '日程案内済※要zoomURL'
          };
          $(`[name=bikou_nm]`).valPrepend(note[way]);
          $('[name=shido_data_flg]').prop('checked', true);
        }
      },
      {
        text: '✉️ zoom招待メール送付',
        handler: () => {
          const zoomInvitationText = this._makeZoomInvitaion();
          this._openMailSending(zoomInvitationText, student_cd);
        }
      },
      {
        text: '🎦 Zoom作成',
        handler: () => this.handleCreateZoom()
      },
      {
        text: '☑️ 履歴入力済',
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
        text: '📅 指導予定',
        handler: () => {
          if (!student_cd) return false;
          new IframeMakerEx({ iframeName: 'yotei', x: 800, y: 10, draggable: true }).loadUrl(
            `${NX.CONST.host}/kanren/student_shido_yotei.aspx?student_cd=${student_cd}`
          );
        }
      }
    ]);
  }
  async handleCreateZoom() {
    const data = this._extractData();
    if (!data.dateObj) {
      this.bot.print('⚠️ エラー: 面接日時が正しく入力されていません。');
      return;
    }

    const topic = `三者面談【${data.student_nm}】`;
    const startdt = `${data.dateObj.as('yyyy-mm-ddTHH:MM:00')}`;
    const duration = data.duration;

    const $msg = this.bot.print('⏳ Zoom会議室を作成中...');

    try {
      const result = await createZoomMeetingAsync({ topic, startdt, duration });

      const zoomInvitationText = this._makeZoomInvitaion(data.dateObj, result.join_url, result.formattedId, result.password);
      const displayText = `✅ Zoom会議室を作成しました\n\n${zoomInvitationText}`;

      $msg.text(displayText);

      this.bot.addButton(
        '✉️ メール送信',
        () => {
          const student_cd = $('input[name=student_cd]').val();
          this._openMailSending(zoomInvitationText, student_cd);
        },
        $msg
      );

      $(`[name=bikou_nm]`)
        .valReplace('日程案内済※要zoomURL', '')
        .valPrepend('★URL送付済');
      $('#url_dt').val(result.join_url);
      $('#meeting_id').val(result.formattedId);
      $('#passcode').val(result.password);
    } catch (error) {
      $msg.text(error.message);
    }
  }
  /**
   * ヘルパー: 画面からデータを抽出する
   */
  _extractData() {
    const dt = $('#mendan_dt').val() || '';
    const tm = $('#mendan_tm').val() || '';
    const student_nm = $('.studentLinker').text() || '';
    const duration = parseInt($('[name=mendan_jk]').val()) || 50;
    const formattedId = $('#meeting_id').val() || '';
    const password = $('#passcode').val() || '';
    const join_url = $('#url_dt').val() || '';
    let dateObj = null;
    if ([dt, tm].every(val => val !== '')) dateObj = new ExDate(`${dt} ${tm}`);

    return { dt, tm, student_nm, duration, formattedId, password, join_url, dateObj };
  }
  _makeZoomInvitaion(dateObj, join_url, formattedId, password) {
    const data = dateObj && join_url && formattedId && password ? { dateObj, join_url, formattedId, password } : this._extractData(); // 引数がない場合は画面から抽出
    const dateStr = NX_Utils.toFullWidth(data.dateObj.as(`m月d日(aaa) HH:MM`));
    return LCT.TEMPLATE.joinAnnounce(dateStr, data.join_url, data.formattedId, data.password);
  }
  async _openMailSending(message, student_cd) {
    navigator.clipboard.writeText(message);
    const param = {
      student_cd,
      limit: $('#mendan_dt').val(),
      clip: 'true'
    };
    window.open(`${NX.CONST.host}/s/student_mailsend_input.aspx?${$.param(param)}`);
  }
  async mailSendChParam() {
    const { limit, clip } = NX_Utils.getPageParams();
    if (limit) {
      $('#app_kigen_dt').val(limit);
      $('#app_flg,#aps_flg').prop('checked', true);
    }
    if (clip === 'true') {
      const textFromClip = await navigator.clipboard.readText();
      $('[name="message_nm"]').val(textFromClip);
    }
  }
}
