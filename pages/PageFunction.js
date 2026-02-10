$(function() {
  console.log('PageFunction.js');
  /*/■■■■■■■■■■■■■■■■■■■■常に働く機能■■■■■■■■■■■■■■■■■■■■/*/
  // ドメイン・設定チェック
  if (document.domain != 'menu.edu-netz.com' && document.domain != 'menu2.edu-netz.com') return;
  if (myprofiles.getone({ isSpecialEnabled: 0 }) != 1) return;
  //FUNCTION_T.general.capsescaper();
})();
