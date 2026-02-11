import PageFuncAll from './PageFuncAll.js';

$(function() {
  console.log('PageFunction.js');
  /* ■■■■■■■■■■■■■■■■■■■■常に働く機能■■■■■■■■■■■■■■■■■■■■ */
  // ドメイン・設定チェック
  if (location.hostname != 'menu.edu-netz.com' && location.hostname != 'menu2.edu-netz.com') return;
  if (typeof myprofiles === 'undefined' || myprofiles.getone({ isSpecialEnabled: 0 }) != 1) return;

  const pageFuncAll = new PageFuncAll();

  //エリアモード
  pageFuncAll.applyAreaMode();
});
