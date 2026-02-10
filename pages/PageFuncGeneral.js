const FUNCTION_General = {};

FUNCTION_T.general.isAreaMode = function() {
  if (myprofiles.getone({ isAreaMode: 0 }) == 1) {
    if (location.pathname != '/netz/netz1/schedule/yotei.aspx') {
      ['tenpo_cd', 'main_tenpo_cd'].forEach(function(elem) {
        $(`select[name=${elem}] option`).hide();
        $(`select[name=${elem}] optgroup`).hide();
        $(`select[name=${elem}]`).append(
          `${makeOption(NX.NOWBASE[myprofiles.getone({ mynumber: '000231' })])}<option value="allmode">全教室表示</option>`
        );
      });
    }
  }
  $('select[name=tenpo_cd],select[name=main_tenpo_cd]').on('change', function() {
    if ($(this).val() == 'allmode')
      $(this)
        .find('[style="display: none;"]')
        .show();
  });
};
