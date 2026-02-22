// pages/PageFuncToiawases.js
import { NX_Utils } from '../core/utils.js';

export default class PageFuncToiawases {
  constructor() {
    this.path = location.pathname;
  }
  detailPrettier() {
    $('input[name=tel_no],input[name=keitai_tel_no1]').on('contextmenu', function() {
      $(this).valFunction(now => NX_Utils.phoneformat(now));
      return false;
    });
    $('input[name=parent_kg],input[name=parent_kt],input[name=student_kg],input[name=student_kt]').on('contextmenu', function() {
      $(this).valReplace(' ', '　');
      return false;
    });
  }
}
