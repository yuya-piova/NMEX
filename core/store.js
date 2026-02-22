// core/store.js
import Saver from './Saver.js';

// ここでアプリケーション全体で使うストレージを一元管理します
export const myprofile = new Saver('myprofile');
//export const memos = new Saver('memos');
//export const mySettings = new Saver('mySettings'); // 他にもあればここに追加
