// core/features/MemberLinker.js

import PopMenu from '../PopMenu.js'; // パスは適宜調整してください

export default class MemberLinker {
  constructor() {
    // PopMenuインスタンスを生成（IDを指定）
    this.popMenu = new PopMenu({
      id: 'member-linker-menu',
      keyCode: null, // ショートカット起動ではなくクリック起動なのでnull
      showFloatingButton: false // フローティングボタンは不要
    });

    // 現在選択中のメンバー情報を保持
    this.currentMember = {
      cd: null,
      name: null,
      type: null // 'student' or 'teacher'
    };
  }

  init() {
    this.setListeners();
  }

  setListeners() {
    // --- 生徒用 (右クリック ＆ 左クリック) ---
    $(document).on('contextmenu', '.studentLinker', e => {
      e.preventDefault();
      this.openMenu(e.currentTarget, 'student', e.pageX, e.pageY);
    });

    $(document).on('click', '.studentLinker', e => {
      // 左クリック時のデフォルト動作（連絡事項ページへ遷移など）
      e.preventDefault();
      const cd = $(e.currentTarget).attr('student_cd');
      if (this.isValidCd(cd)) {
        window.open(`${NX.CONST.host}/s/student_renraku_list.aspx?student_cd=${cd}`);
      }
    });

    // --- 講師用 (右クリック) ---
    $(document).on('contextmenu', '.teacherLinker', e => {
      e.preventDefault();
      this.openMenu(e.currentTarget, 'teacher', e.pageX, e.pageY);
    });
  }

  isValidCd(cd) {
    return cd && /^\d{6}$/.test(cd);
  }

  openMenu(targetElement, type, x, y) {
    const $el = $(targetElement);
    const cd = $el.attr(`${type}_cd`);
    const name = $el.attr(`${type}_nm`) || `cd:${cd}`;

    if (!this.isValidCd(cd)) return;

    this.currentMember = { cd, name, type };

    // メニューの中身を動的に構築
    this.popMenu.clearDynamic();

    // 共通ヘッダー（名前とCDのコピー）
    this.popMenu.appendDynamic(`${name} (コピー)`, {
      icon: 'fa-clipboard',
      type: 'default',
      handler: () => this.copyToClipboard(name)
    });
    this.popMenu.appendDynamic(`${cd} (コピー)`, {
      icon: 'fa-clipboard',
      type: 'default',
      handler: () => this.copyToClipboard(cd)
    });
    this.popMenu.appendDynamic('<hr>'); // 区切り線

    // タイプ別のメニューアイテムを追加
    if (type === 'student') {
      this.buildStudentMenu();
    } else if (type === 'teacher') {
      this.buildTeacherMenu();
    }

    // メニューを表示
    this.popMenu.show(x, y);
  }

  // --- メニュー構築メソッド ---

  buildStudentMenu() {
    const cd = this.currentMember.cd;
    const items = [
      { label: '連絡事項(m)', icon: 'fa-rectangle-list', url: `/s/student_renraku_list.aspx?student_cd=${cd}` },
      { label: '生徒プロファイル(p)', icon: 'fa-user', url: `/s/student_profile_input.aspx?student_cd=${cd}` },
      {
        label: '生徒教務ボード',
        icon: 'fa-tachograph-digital',
        url: `/sso/mobilenetzmenu.aspx?student_cd=${cd}&app_name=forlecturer&page_kind=3&method_name=tannincheck`
      },
      {
        label: '成績管理(s)',
        icon: 'fa-chart-line',
        url: `/sso/mobilenetzmenu.aspx?student_cd=${cd}&app_name=forlecturer&page_kind=3&method_name=seiseki`
      },
      {
        label: 'トーク(t)',
        icon: 'fa-comment',
        url: `/talk/talkmenu.aspx?student_cd=${cd}&talk_type=student&personal_talk=true`
      },
      {
        label: 'アプリスケジュール(a)',
        icon: 'fa-calendar-days',
        url: `/sso/mobilenetzmenu.aspx?student_cd=${cd}&app_name=forlecturer&page_kind=3&method_name=tsuujuku`
      }
    ];

    items.forEach(item => {
      this.popMenu.appendDynamic(item.label, {
        icon: item.icon,
        type: 'page', // 紫色のレイヤー
        handler: () => window.open(`${NX.CONST.host}${item.url}`)
      });
    });

    // 特殊なアクション（タスク確認など）
    this.popMenu.appendDynamic('<hr>');
    this.popMenu.appendDynamic('タスク確認', {
      icon: 'fa-circle-exclamation',
      type: 'common', // 青色のレイヤー
      handler: () => this.fetchTaskCount(cd)
    });
  }

  buildTeacherMenu() {
    const cd = this.currentMember.cd;
    const items = [
      { label: '講師情報(i)', icon: 'fa-user', url: `/t/teacher_data.aspx?teacher_cd=${cd}` },
      { label: '指導予定(l)', icon: 'fa-person-chalkboard', url: `/kanren/teacher_shido_yotei.aspx?teacher_cd=${cd}` },
      { label: '講師スケ(s)', icon: 'fa-calendar-days', url: `/t/teacher_schedule_list.aspx?teacher_cd=${cd}` },
      { label: '出勤簿(w)', icon: 'fa-building-circle-check', url: `/t/worktime_teacher_list.aspx?teacher_cd=${cd}` },
      {
        label: 'トーク(t)',
        icon: 'fa-comment',
        url: `/talk/talkmenu.aspx?teacher_cd=${cd}&talk_type=Lecturer&personal_talk=true`
      }
    ];

    items.forEach(item => {
      this.popMenu.appendDynamic(item.label, {
        icon: item.icon,
        type: 'page', // 紫色のレイヤー
        handler: () => window.open(`${NX.CONST.host}${item.url}`)
      });
    });
  }

  // --- ユーティリティ ---

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      if (typeof PX_Toast === 'function') PX_Toast(`${text} をコピーしました`);
    });
  }

  fetchTaskCount(cd) {
    const url = `${NX.CONST.host}/todo/todo_list.aspx?user_cd=${cd}&todo_cb=1`;
    $.get(url, data => {
      const count = $(data).find('tr').length - 1;
      if (typeof PX_Toast === 'function') PX_Toast(`タスク ${count} 件`);
    });
  }
}
