export default class PageFuncAll {
  constructor() {
    this.path = location.pathname;
  }

  applyAreaMode() {
    //予定表ページは除外
    if (this.path === '/netz/netz1/schedule/yotei.aspx') return;
    const myNumber = myprofiles.getone({ mynumber: '000231' });
    const nowBaseArr = NX.NOWBASE[myNumber] || [];

    ['tenpo_cd', 'main_tenpo_cd'].forEach(name => {
      const $select = $(`select[name=${elem}]`);
      if (!$select.length) return; // 要素が存在しない場合はスキップ

      $select.find('option, optgroup').hide();

      const optionsHtml = NMEX_Utils.makeOption(nowBaseArr) + '<option value="allmode">全教室表示</option>';
      $select.append(optionsHtml);

      $select.on('change', e => {
        const $this = $(e.currentTarget);
        if ($this.val() === 'allmode') {
          $this.find('option, optgroup').show();
          $this.find('option[value="allmode"]').remove();
        }
      });
    });
  }
}
