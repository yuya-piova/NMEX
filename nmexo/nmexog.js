///<reference path="../jquery-3.4.1.min.js"/>
///<reference path="../jquery-ui.min.js"/>
///<reference path="../checker.js"/>
///<reference path="./closer.js"/>
///<reference path="../dts/JQuery.d.ts"/>
///<reference path="../dts/jqueryui.d.ts"/>
///<reference path="../dts/global.d.ts"/>
///<reference path="../dts/chrome.d.ts"/>
///<reference path="../nmex-longconst.js"/>
///<reference path="../nmext/nmextg.js"/>

/**
 * @external "JQuery.fn"
 */

class Saver_old {
  /**
   *
   * @param {string} localname
   */
  constructor(localname) {
    this.localname = localname;
  }
  /**
   * 全データの取得
   * @return {Object}
   */
  getall() {
    this.storagecheck();
    return JSON.parse(localStorage.getItem(this.localname) || '{}');
  }
  /**
   * gets データ取得
   * @param {Object<string,*>} captionObject {key:data}で、keyのデータを探すがなければdataを返す
   * @return {Object<string,*>}} Object形式のデータ
   */
  gets(captionObject) {
    var myprofile = this.getall();
    var result = {};
    if ($.isPlainObject(captionObject)) {
      for (var key in captionObject) {
        result[key] = myprofile[key] == undefined ? captionObject[key] : myprofile[key];
      }
    } else {
      result = { error: 'captionがObjectではありません' };
      console.log(this.localname + 'は首を吊りました');
    }
    return result;
  }
  /**
   * データ取得
   * @param {Object<string,*>} captionObject {key:data}で、keyのデータを探すがなければdataを返す
   * @return {*} keyの中身
   */
  getone(captionObject) {
    const gets = this.gets(captionObject);
    const key = Object.keys(gets)[0];
    return gets[key];
  }
  /**
   *
   * @param {Object<string,*>} captionObject 保存するデータ
   * @returns {boolean} 保存に成功したらtrue,失敗でfalse
   */
  save(captionObject) {
    if (!$.isPlainObject(captionObject)) {
      console.error('object言ってるやろが！！！');
      return false;
    }
    var myprofile = this.getall();
    for (var key in captionObject) {
      myprofile[key] = captionObject[key];
    }
    localStorage.setItem(this.localname, JSON.stringify(myprofile));
    return true;
  }
  /**
   * オブジェクトが入れ子になっていても保存する
   * 元データ：{data:{a:"123"}}　追加データ：{data:{b:"456"}}　→ {data:{a:"123",b:"456"}}}
   * @param {Object<string,*>} captionObject 保存するデータ
   * @returns {Promise<*|boolean>} 保存に成功したら保存したデータを,失敗でfalseを返す
   */
  async deepsave(captionObject) {
    if (!$.isPlainObject(captionObject)) {
      console.error('object言ってるやろが!!!');
      return false;
    }
    return await localStorageSaverSync(this.localname, captionObject, true);
  }
  /**
   *
   * @param {Object<string,*>|string} captionObject
   * @returns
   */
  delete(captionObject) {
    var myprofile = this.getall();
    if (typeof captionObject === 'object') {
      for (var key in captionObject) {
        delete myprofile[key];
      }
    } else {
      delete myprofile[captionObject];
    }
    localStorage.setItem(this.localname, JSON.stringify(myprofile));
    return true;
  }
  storagecheck() {
    if (localStorage.getItem(this.localname) == undefined) {
      return true;
    }
    if (isJSON(localStorage.getItem(this.localname)) == false) {
      console.warn(this.localname + 'がJSONではありません');
      return false;
    }
    if ($.isPlainObject(JSON.parse(localStorage.getItem(this.localname) || '"')) == false) {
      console.warn(this.localname + 'がObjectではありません');
      return false;
    }
    return true;
  }
  /**
   *
   * @param {string} objectcaption
   * @returns
   */
  makesaveinput(objectcaption) {
    var _this = this;
    return $(`<input type="text" name="teacher_memo" cd="${objectcaption}">`)
      .on('change', function() {
        _this.save({ [objectcaption]: $(this).val() });
      })
      .val(_this.getone({ [objectcaption]: '' }));
  }
  /**
   *
   * @param {string} caption
   * @param {Array<*>} togglearray
   */
  toggle(caption, togglearray) {
    var one = this.getone({ [caption]: null });
    var index = togglearray.indexOf(one);
    this.save({ [caption]: togglearray[(index + 1) % togglearray.length] });
  }
  /**
   *
   * @param {string} buttontext
   * @param {string} caption
   * @param {Array<{title:string,value:string|number}>} toggleObject
   * @returns {JQuery}
   */
  maketogglebutton(buttontext, caption, toggleObject) {
    const _thisClass = this;
    return $('<button>', { type: 'button', name: caption })
      .on('update', function() {
        const text = toggleObject.filter(one => one.value == _this.getone({ [caption]: null }))[0]?.title;
        $(this).val(`${buttontext}：${text}`);
      })
      .on('click', function() {
        _thisClass.toggle(
          caption,
          toggleObject.map(one => one.value)
        );
        $(this).trigger('update');
      })
      .trigger('update');
  }
}

/**
 * @typedef {Object} Examdata
 * @property {string?} from_dt
 * @property {string?} to_dt
 * @property {boolean?} allinputted
 */

class ExamSaver extends Saver {
  /**
   *
   * @param {string} student_cd
   * @param {Date} dt
   * @return {string|null}
   */
  getcloseexam_afterdt(student_cd, dt = new Date()) {
    /**@type {Object<string,Examdata>} */
    let student_exam = this.getone({ [student_cd]: {} });
    /**@type {string|null} */
    var exam = null;
    for (var key in student_exam) {
      if (new Date(student_exam[key]?.from_dt).getTime() > dt.getTime()) {
        if (exam == null) exam = key;
        else if (new Date(student_exam[key]?.from_dt).getTime() < new Date(student_exams[exam]?.from_dt).getTime()) exam = key;
      }
    }
    return exam;
  }
  /**
   *
   * @param {string} student_cd
   * @param {Date} dt
   * @return {string|null}
   */
  getcloseexam_beforedt(student_cd, dt = new Date()) {
    /**@type {Object<string,Examdata>} */
    let student_exam = this.getone({ [student_cd]: {} });
    /**@type {string|null} */
    var exam = null;
    for (var key in student_exam) {
      if (new Date(student_exam[key]?.from_dt).getTime() < dt.getTime()) {
        if (exam == null) exam = key;
        else if (new Date(student_exam[key]?.from_dt).getTime() > new Date(student_exams[exam]?.from_dt).getTime()) exam = key;
      }
    }
    return exam;
  }
  /**
   * examに点数が全部入力済みならtrueを、そうでなければfalseを返す
   * @param {string} student_cd
   * @param {string} exam
   * @return {boolean}
   */
  getallinputted(student_cd, exam) {
    /**@type {Object<string,Examdata>} */
    let student_exam = this.getone({ [student_cd]: {} });
    console.log(student_cd, student_exam);
    if (student_exam[exam]?.allinputted == null) return false;
    return student_exam[exam]?.allinputted;
  }
  /**
   *
   * @param {string} student_cd
   * @param {Date} dt
   * @param {string|null} exams
   * @return {{exams:string|null,nokori:number|null}}
   */
  getnokoridate(student_cd, dt = new Date(), exams = this.getcloseexam_afterdt(student_cd, dt)) {
    let student_exam = this.getone({
      [student_cd]: {}
    });
    if (exams == null) return { exams: null, nokori: null };
    let from_dt = new ExDate(student_exam[exams]?.from_dt || null);
    let nokori = parseInt('' + from_dt.compare(dt).difference / (1000 * 60 * 60 * 24)) + 1;
    return { exams: exams, nokori: nokori };
  }
}

console.log('nmexog');
//プロファイル保存
const myprofiles = new Saver('myprofile');
const memos = new Saver('memotexts');
const teacher_memos = new Saver('teacher_memotexts');
const student_exams = new ExamSaver('student_exams');

//グローバル変数
var dt = new Date();
var dttomorrow = afterdays(dt, 1);
var dtyesterday = afterdays(dt, -1);
var dtdatomorrow = afterdays(dt, 2);
var dtnextweek = afterdays(dt, 7);
var dtlastweek = afterdays(dt, -7);
var dtnextmonth = new Date(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
var dtstart = getdays(dt, undefined, 0, 'start'); //今月最初の日
var dtlast = getdays(dt, undefined, 0, 'last'); //今月最後の日
var dtlystart = getdays(dt, 'year', 'before', 'start'); //前年同月最初の日
var dtlylast = getdays(dt, 'year', 'before', 'last'); //前年同月最後の日
var dtlmstart = getdays(dt, 'month', 'before', 'start'); //前月最初の日
var dtlmlast = getdays(dt, 'month', 'before', 'last'); //前月最後の日
var dtlylmstart = getdays(dtlystart, 'month', 'before', 'start'); //前年前月最初の日
var dtlylmlast = getdays(dtlystart, 'month', 'before', 'last'); //前年前月最後の日
var dtlynmstart = getdays(dtlystart, 'month', 'next', 'start'); //前年来月最初の日
var dtlynmlast = getdays(dtlystart, 'month', 'next', 'last'); //前年来月最後の日
var dtblmstart = getdays(dtlmstart, 'month', 'before', 'start'); //前々月最初の日
var dtblmlast = getdays(dtlmstart, 'month', 'before', 'last'); //前々月最後の日
var dtnxstart = getdays(dt, 'month', 'next', 'start'); //来月最初の日
var dtnxlast = getdays(dt, 'month', 'next', 'last'); //来月最後の日
var weekdaylist = ['日', '月', '火', '水', '木', '金', '土'];
const areablocklist = {
  block: {
    関東: 5011,
    北部九州: 5021,
    西部九州: 5022,
    中南部九州: 5023,
    中四国西: 5031,
    中四国東: 5032,
    オンライン: 7001,
    本部: 9900
  },
  area: {
    東京: 1301,
    島根: 3201,
    岡山: 3301,
    広島: 3401,
    山口: 3501,
    香川: 3701,
    福岡西: 4001,
    福岡東: 4002,
    福岡中央: 4004,
    北九州: 4005,
    佐賀: 4101,
    長崎: 4201,
    熊本: 4301,
    大分: 4401,
    宮崎: 4501,
    鹿児島: 4601,
    オンライン: 7001,
    NALU: 7004,
    本部: 9900
  }
};

const myprofilesObject = {
  NMmode: ['normal', 'honbu', 'online'],
  nalucolor: ['false', 'true'],
  exams: ['１学期中間', '１学期期末', '２学期中間', '２学期期末', '学年末']
};
//面談組の時期
//これはmyprfiles管理させたほうが楽そう。
var nendo_season_cb = myprofiles.getone({ nendo_season_cb: '20224' });

//日付関係

/**
 * [afterdays description] [Date]days後の日付取得
 * @param  {Date} dt   [起点の日時]
 * @param  {number} days  [日後]
 * @return {Date}
 */
function afterdays(dt, days) {
  var result = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + days);
  return result;
}

/**
 * [getdays description] [Date]dt起点の日付を取得
 * @param  {Date} dt   [Date]
 * @param  {"year"|"month"|undefined} yorm   ["year"or"month"]
 * @param  {"next"|"before"|"next2"|number} norb   ["next"or"before"]
 * @param  {"start"|"last"} storla ["start"or"last"]
 * @return {Date}	 [Date]
 */
function getdays(dt, yorm, norb, storla) {
  var norbnum = 0;
  if (norb == 'next') {
    norbnum = 1;
  } else if (norb == 'before') {
    norbnum = -1;
  } else if (norb == 'next2') {
    norbnum = 2;
  } else if (isNaN(norb) == false) {
    norbnum = norb;
  }
  var returndt;
  switch (yorm) {
    case 'month':
      switch (storla) {
        case 'start':
          returndt = new Date(dt.getFullYear(), dt.getMonth() + 0 + norbnum, 1);
          break;
        case 'last':
          returndt = new Date(dt.getFullYear(), dt.getMonth() + 1 + norbnum, 0);
          break;
        default:
          returndt = new Date(dt.getFullYear(), dt.getMonth() + 0 + norbnum, dt.getDate());
          break;
      }
      break;

    case 'year':
      switch (storla) {
        case 'start':
          returndt = new Date(dt.getFullYear() + norbnum, dt.getMonth(), 1);
          break;
        case 'last':
          returndt = new Date(dt.getFullYear() + norbnum, dt.getMonth() + 1, 0);
          break;
        default:
          returndt = new Date(dt.getFullYear() + norbnum, dt.getMonth() + 1, dt.getDate());
          break;
      }
      break;
    default:
      switch (storla) {
        case 'start':
          returndt = new Date(dt.getFullYear(), dt.getMonth(), 1);
          break;
        case 'last':
          returndt = new Date(dt.getFullYear(), dt.getMonth() + 1, 0);
          break;
        default:
          returndt = new Date(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
          break;
      }
  }
  return returndt;
}
/**
 * [getstrDate description] 文字列をDateに変換
 * @param  {string} datestr   [description]
 * @param  {"yyyy/mm/dd"|"mm/dd"|"mm/dd(aaa)"|"mm/dd hh:nn"} pattern yyyy/mm/dd 又は mm/dd [description]
 * @return {Date}	 [Date形式]
 */
function getstrDate(datestr, pattern) {
  var kekka;
  switch (pattern) {
    case 'yyyy/mm/dd':
      kekka = new Date(datestr);
      break;
    case 'mm/dd':
      var year = dt.getFullYear();
      //console.log(year+'/'+datestr);
      kekka = new Date(year + '/' + datestr);
      break;
    case 'mm/dd(aaa)':
      var str = datestr.substr(0, 5);
      kekka = getstrDate(str, 'mm/dd');
      break;
    case 'mm/dd hh:nn':
      var str = datestr.substr(0, 5);
      var hour = datestr.substr(6, 2);
      var min = datestr.substr(9, 2);
      kekka = getstrDate(str, 'mm/dd');
      kekka.setHours(parseInt(hour), parseInt(min));
      break;
  }
  return kekka;
}
/**
 * 文字列を時間に変換する
 * @param {string} timestr 時間の文字列
 * @param {string} [pattern='hh:mm'] どういう形なのか
 */
function getstrTime(timestr, pattern = 'hh:mm') {
  var kekka;
  switch (pattern) {
    case 'hh:mm':
      kekka = new Date(`${dateslash(new Date())} ${timestr}`);
  }
  return kekka;
}

/**
 *
 * @param {number} num
 * @param {number} len
 * @returns
 */
function zeroPadding(num, len) {
  return (Array(len).join('0') + num).slice(-len);
}

/**
 * @typedef {Object} Seito_info
 * @property {string} 生徒NO
 * @property {string} 生徒名
 * @property {string} カナ
 * @property {string} 学校
 * @property {string} 学年
 * @property {string} 内線
 * @property {!string} 特記
 * @property {!string} 性別
 * @property {!string} 担任
 */

/**
 * @class
 * @template {{}} T
 */
class Tenpo_info_classBase {
  /**
   * コンストラクタ
   * @param {string|number} [tenpo] テンポコード（省略可能）
   */
  constructor(tenpo) {
    const classData = this.classData();

    /** @type {string} ストレージ名 */
    this.storagename = classData.storagename;
    this.tenpo = tenpo;

    /** @type {Array<T>} テンポ情報 */
    this.tenpo_info = [];

    const mybase = myprofiles.getone({ mybase: null });
    const storedTenpoInfo = JSON.parse(localStorage.getItem(this.storagename)) || {};

    if (tenpo) {
      // 指定されたテンポコードが存在すればその情報を取得
      if (storedTenpoInfo[tenpo] && storedTenpoInfo[tenpo].length !== 0) {
        this.tenpo_info = storedTenpoInfo[tenpo];
      }
    } else {
      // 全テンポ情報を結合
      if (Object.keys(storedTenpoInfo).length > 0) {
        if (mybase) {
          this.tenpo_info = this.tenpo_info.concat(storedTenpoInfo[mybase]);
        }
        for (let key in storedTenpoInfo) {
          this.tenpo_info = this.tenpo_info.concat(storedTenpoInfo[key]);
        }
      }
    }

    /** @type {[{4401:[{生徒NO:string}]}]} テンポ情報リスト */
    this.tenpo_info_list = storedTenpoInfo;

    // 未定義のデータを除外
    this.tenpo_info = this.tenpo_info.filter(item => item !== undefined);
  }

  /**
   * 継承必須
   * @abstract
   * @return {{storagename:string, defaultObject:T}} ストレージ名とデフォルトオブジェクト
   */
  classData() {
    return {
      storagename: '',
      defaultObject: {}
    };
  }

  /**
   * データをストレージに保存する
   * @param {Array<Object.<string,*>>} arrayObject 保存するデータ
   * @param {string|number} [tenpo] テンポコード（省略可能）
   */
  saveData(arrayObject, tenpo = this.tenpo) {
    if (tenpo !== undefined) {
      localStorageSaverSync(this.classData().storagename, {
        [tenpo]: arrayObject
      });
    } else {
      throw new Error(`${this.classData().storagename} エラー: tenpo が undefined です。this.tenpo の値: ${tenpo}`);
    }
  }

  /**
   * タグに完全一致する最初のデータを返す
   * @param {string} tag 検索するタグ（例: 生徒名）
   * @param {string} str 完全一致させたい文字列（例: ネッツ太郎）
   * @return {T} 一致した生徒情報
   */
  search(tag, str) {
    if (this.tenpo_info.length === 0) {
      console.warn('tenpo_infoが空です');
      return {};
    }

    return this.tenpo_info.find(item => item[tag] === str) || {};
  }

  /**
   * 正規表現でタグに一致するデータをすべて返す
   * @param {string} tag タグ名
   * @param {string} regstr 正規表現の文字列
   * @return {Array<T>} 一致するデータの配列
   */
  match(tag, regstr) {
    if (this.tenpo_info.length === 0) {
      console.warn('tenpo_infoが空です');
      return [{}];
    }

    const reg = new RegExp(regstr);
    return this.tenpo_info.filter(item => reg.test(item[tag]));
  }

  /**
   * 指定したタグの一覧を返す
   * @param {string} tag タグ名（例: 生徒名）
   * @return {Array} タグの一覧
   */
  list(tag) {
    return this.tenpo_info.map(item => item[tag]);
  }

  /**
   * タグに当てはまる一覧を返す
   * @param {string} tag タグ名（例: 生徒名）
   * @param {string} str 検索する文字列
   * @return {Array<T>} 一致するデータの配列
   */
  searchlist(tag, str) {
    return this.tenpo_info.filter(item => item[tag]?.includes(str));
  }

  /**
   * データに新しい情報を追加する
   * @param {{}} searchObject 検索条件（例: {生徒NO: 123456}）
   * @param {{}} addObject 追加する情報（例: {特記: '○○'}）
   */
  addData(searchObject, addObject) {
    const tenpoInfoList = JSON.parse(localStorage.getItem(this.storagename) || '{}');

    for (let tenpo in tenpoInfoList) {
      tenpoInfoList[tenpo] = tenpoInfoList[tenpo].map(item => {
        for (let key in searchObject) {
          if (item[key] !== searchObject[key]) return item;
        }
        return { ...item, ...addObject };
      });
    }

    localStorageSaverSync(this.classData().storagename, tenpoInfoList);
  }
}

/**
 * 	var kousya = new seito_info_class(4401)で
 	 kousyaに校舎番号4401でインスタンス化する
	 new seito_info_class()だと保存している全校舎分

	 kousya.search("生徒名","乙藤 大樹")で
	 {"生徒NO":"111111","生徒名":"乙藤 大樹","学校":"●●中","学年":"中３","カナ":"オトフジ ヒロキ"}の
	 連想配列で返ってくる
	 kousya.search("生徒名","乙藤 大樹")["生徒NO"]で生徒番号取得可能
	 一行でしたいなら
   new seito_info_class(4401).search("生徒名","乙藤 大樹")["生徒NO"]
   @class
   @extends {Tenpo_info_classBase<Seito_info>}
 */
class seito_info_class extends Tenpo_info_classBase {
  /**
   *
   * @param {string|number} [tenpo]
   */
  constructor(tenpo) {
    super(tenpo);
  }
  /**
   *
   */
  classData() {
    return {
      storagename: 'seito_info',
      defaultObject: {
        生徒NO: '111111',
        生徒名: '乙藤 大樹',
        学校: '●●中',
        学年: '中３',
        カナ: 'オトフジ ヒロキ',
        内線: '',
        性別: '',
        担任: '',
        特記: ''
      }
    };
  }
}
/**
 * @typedef {Object} Teacher_info
 * @property {string} cd
 * @property {string} 講師名
 * @property {string} 教室
 * @property {string} 特記
 * @property {string} フリガナ
 * @property {string} 電話番号
 */

/**
   @class
 * @extends {Tenpo_info_classBase<Teacher_info>}
 */
class teacher_info_class extends Tenpo_info_classBase {
  /**
   *
   * @param {string|number} [tenpo]
   */
  constructor(tenpo) {
    super(tenpo);
    this.tenpo_info_list['社員'] = Object.keys(LCT.TEACHER.emplist).map(key => {
      let one = LCT.TEACHER.emplist[key];
      return { cd: key, 講師名: one.name, 教室: 'null' };
    });
    this.tenpo_info = Array(this.tenpo_info, this.tenpo_info_list['社員']).flat();
  }
  /**
   */
  classData() {
    return {
      storagename: 'teacher_info',
      defaultObject: {
        cd: '111111',
        講師名: '乙藤 大樹',
        教室: 'NALUオンライン',
        特記: '',
        フリガナ: 'オトフジ ヒロキ',
        電話番号: '000-0000-0000'
      }
    };
  }
}

/**
 * [IframeMaker iframeを作る]
 * @class
 * @param {string} divname [DIVの名前]
 * @param {number} [x]       [表示されるx座標]
 * @param {number} [y]       [表示されるy座標]
 */
class IframeMaker {
  constructor(divname, x, y) {
    $(window.frameElement).attr('name');
    divname = `${$(window.frameElement).attr('name') || ''}_${divname}`;
    this.divobject = $('<div/>', {
      name: divname,
      class: 'onetzpicker',
      css: { 'background-color': 'white' }
    });
    $(this.divobject).prependTo('body');
    if (x == undefined && y == undefined) {
      this.divobject.css('position', 'relative');
      this.divobject.css('display', 'block');
    } else {
      if (x != undefined) $(this.divobject).css('left', x);
      if (y != undefined) $(this.divobject).css('top', y);
    }
    this.divx = x;
    this.divy = y;
    this.divname = divname;
    /**@type {JQuery} */
    this.frameobject = $();
    /**@type {string} */
    this.framename = this.divname;
    this.positionStoragename = 'iframemakerposition';
  }
  /**
   * フレームの中身の作成
   * @param {string} framename iframeのname
   * @return {Object} this
   */
  makeframe(framename) {
    let _this = this;
    this.framename = framename;
    console.log(this.divname, framename);
    $(this.divobject).html('<iframe name="' + framename + '" scrolling="yes" height="' + (window.innerHeight * 0.9 + 50) + 'px" ></iframe>');
    var frame = $('iframe[name=' + framename + ']');
    $(frame).css({ width: window.innerWidth * 0.5 + 50 + 'px' });
    frame
      .on('load', function() {
        console.log(document);
        /**@type {Document} */
        let doc = $(this).get(0).contentWindow.document;
        frame.css({ width: '1920px' });
        var framewidth = doc.body.scrollWidth;
        var frameheight = doc.body.scrollHeight;
        var addwidth = $(this).attr('childwidth') != null ? Number($(this).attr('childwidth')) : 0;
        framewidth += addwidth;
        frame.css({ width: framewidth }); //height:frameheight
        frame.parent().css({ width: framewidth }); //height:frameheight
        console.log(
          doc,
          'addwidth' + addwidth,
          'framewidth:' + framewidth,
          'frameheight:' + frameheight,
          'clientWidth' + doc.documentElement.clientWidth,
          'scrollWidth' + doc.body.scrollWidth,
          'JQuery' + $(doc).width()
        );
        console.log(doc, 'parent', parent.document);
        /*if(window.frameElement != null)
				$(window.frameElement).triggerHandler('load');*/
        if (parent.document != document)
          $('iframe', parent.document)
            .attr('childwidth', framewidth)
            .triggerHandler('load');
        $();
      })
      .triggerHandler('load');
    this.frameobject = frame;
    return this;
  }
  /**
   * @return framename
   */
  getframename() {
    return this.framename;
  }
  /**
   * @return divobject
   */
  getdivobject() {
    return this.divobject;
  }
  /**
   * @return divname
   */
  getdivname() {
    return this.divname;
  }
  /**
   * divを指定位置に動かす
   * @param {number} x 動かすx座標
   * @param {number} y 動かすy座標
   * @return {Object} this
   */
  movediv(x, y) {
    this.divx = x || this.divx;
    this.divy = y || this.divy;
    if (this.divx != undefined) $(this.divobject).css('left', this.divx);
    if (this.divy != undefined) $(this.divobject).css('top', this.divy);
    return this;
  }
  /**
   * iframeに×ボタンを追加する
   * @return {Object} this
   */
  addremoveButton() {
    var removebutton = $('<button name="removebutton">×</button>')
      .css('font-size', '20px')
      .css('position', 'absolute')
      .css('top', 0)
      .css('right', 0)
      .appendTo(this.divobject);
    var divobject = $(this.divobject);
    $(removebutton).on('click', function() {
      $(divobject).html('');
    });
    return this;
  }
  /**
   * 指定のurlでmakeframeする
   * @param {string} url 開くurl
   */
  openurl(url) {
    this.makeframe(this.divname);
    $(this.frameobject).attr('src', url);
    return this;
  }
  /**
   *
   * @param {boolean} positionsave_flg
   */
  draggable(positionsave_flg = false) {
    let _this = this;
    this.divobject.css('padding', '10px');
    /**
     * @typedef IframePositiondata
     * @property {number} x
     * @property {number} y
     */
    /**@type {IframePositiondata} */
    let positiondata = { x: 0, y: 0 };
    /**@type {Object<string,IframePositiondata>} */
    let positiondatas = {};
    /**
     * positiondataの呼び出し
     */
    let loadpositiondatas = function() {
      positiondatas = JSON.parse(localStorage.getItem(_this.positionStoragename) || '{}');
    };
    let savepositiondatas = function() {
      localStorage.setItem(_this.positionStoragename, JSON.stringify(positiondatas));
    };
    if (positionsave_flg == false) {
      //ドラッグ機能だけ
      $(this.divobject).draggable();
    } else {
      //位置を保存する仕組み
      $(this.divobject).draggable({
        create: function(event, ui) {
          //位置を復活させる
          loadpositiondatas();
          console.log(positiondatas, _this.divname, positiondatas[_this.divname]);
          if (positiondatas[_this.divname] != undefined) {
            positiondata = positiondatas[_this.divname];
            console.log(positiondata);
            _this.movediv(positiondata.x, positiondata.y);
          }
        },
        stop: function(event, ui) {
          //位置を保存する
          positiondata.x = ui.position.left;
          positiondata.y = ui.position.top;
          loadpositiondatas();
          positiondatas[_this.divname] = positiondata;
          console.log(positiondatas, _this.divname, positiondatas[_this.divname]);
          savepositiondatas();
        }
      });
    }
    return $(this);
  }
}
//多分要らない
function Reminder(id, datetime, text) {
  this.datetime = datetime;
  this.text = text;
  this.id = id;
  this.add(id, datetime, text);
}

Reminder.prototype = {
  add: function(id, datetime, text) {
    this.datetime = datetime;
    this.text = text;
    this.id = id;
    Reminder.list[id] = this;
  },
  check: function() {
    if (Math.trunc(this.datetime.getTime() / 1000 / 60) == Math.trunc(new Date().getTime() / 1000 / 60)) {
      netznotification(this.id, this.text);
    }
  },
  toObject: function() {
    return {
      id: this.id,
      text: this.text,
      datetime: this.datetime.toLocaleString()
    };
  },
  remove: function() {
    Reminder.loadAll();
    delete Reminder.list[this.id];
    Reminder.saveAll();
  },
  save: function() {
    Reminder.loadAll();
    this.add(this.id, this.datetime, this.text);
    Reminder.saveAll();
  }
};
Reminder.list = {};
Reminder.checkAll = function() {
  for (var key in Reminder.list) {
    Reminder.list[key].check();
  }
};
Reminder.loadAll = function() {
  var reminders = JSON.parse(localStorage.getItem('reminders') || '{}');
  var reminder;
  for (var key in reminders) {
    reminder = reminders[key];
    new Reminder(reminder['id'], new Date(reminder['datetime']), reminder['text']);
  }
  return Reminder.list;
};
Reminder.saveAll = function() {
  var object = {};
  for (var key in Reminder.list) {
    object[key] = Reminder.list[key].toObject();
  }
  localStorage.setItem('reminders', JSON.stringify(object));
};
Reminder.search = function(id) {
  Reminder.loadAll();
  for (var key in Reminder.list) {
    if (id == key) return Reminder.list[key];
  }
  return {};
};
/**
 * @typedef {Object<string,Fromtotime>} Kihonsc
 */
/**
 * @typedef {Object<string,Fromtotime>} Monthsc
 * Object<Date,Array<Fromtotime>>
 */
class Scheduler {
  /**
   *
   * @param {"teacher_cd"|"student_cd"|""} codename
   * @param {string|number} code
   */
  constructor(codename, code) {
    this.codename = codename; //teacher_cdなど
    this.code = String(code); //000248など
    /**@type {Monthsc} */
    this.monthsc = {};
    /**@type {Kihonsc} */
    this.kihonsc = {};
    this.nitibetusc = {};
    this.saver = new Saver(Scheduler.storagename);
  }
  /**
   * @param {string} date
   * @returns {Fromtotime}
   */
  getdatetime(date) {
    return this.monthsc[date] || new Fromtotime();
  }
  /**
   *
   * @param {"日"|"月"|"火"|"水"|"木"|"金"|"土"} weekyday 日～土
   * @returns {Fromtotime}
   */
  getweekdaytime(weekyday) {
    return this.kihonsc[weekyday] || new Fromtotime();
  }
  /**
   *
   * @param {string} date
   * @param {Array<number>|number} timenumber_or_array Fromtotime.texttimelist(string)
   * @returns
   */
  incheck(date, timenumber_or_array) {
    var datetime = this.getdatetime(date);
    return datetime.incheck(timenumber_or_array);
  }
  /**
   *
   * @param {"日"|"月"|"火"|"水"|"木"|"金"|"土"} weekday
   * @param {Array<number>|number} timenumber_or_array Fromtotime.texttimelist(string)
   * @returns
   */
  inkihoncheck(weekday, timenumber_or_array) {
    var datetime = this.getweekdaytime(weekday);
    return datetime.incheck(timenumber_or_array);
  }
  setschedule() {
    var scheduler = this;
    scheduler.kihonsc = {};
    // prettier-ignore
    var kihonsc = $('input[value="変更・修正"]').eq(0).closest('tr');
    var kihontext = {};
    var tablehead = getTableHead($(kihonsc).closest('table'), 0);
    var weekday;
    for (var i = 0; i < weekdaylist.length; i++) {
      weekday = weekdaylist[i];
      // prettier-ignore
      kihontext[weekday] = $(kihonsc).children('td').eq(tablehead[weekday]).text();
      //this.kihonsc[weekday] = new Intime(kihontext[weekday]);
      this.kihonsc[weekday] = new Fromtotime().addtimetext(kihontext[weekday]);
    }

    scheduler.monthsc = {};
    var monthobj = $('a').closest('td');
    var date, time;
    $(monthobj).each(function() {
      // prettier-ignore
      date = getStrBetween(/**@type {string}*/ ($(this).find('a').attr('href')),"'","'");
      // prettier-ignore
      time = $(this).find('div').eq(1).text();
      scheduler.monthsc[date] = new Fromtotime().addtimetext(time);
    });

    //日別で入力(黄色だけ抽出)
    scheduler.nitibetusc = {};
    var nitibetusc = $('a').closest('td[bgcolor="#ffff66"]');
    $(nitibetusc).each(function() {
      // prettier-ignore
      date = getStrBetween(/**@type {string}*/ ($(this).find('a').attr('href')), "'", "'" );
      // prettier-ignore
      time = $(this).find('div').eq(1).text();
      scheduler.nitibetusc[date] = new Fromtotime().addtimetext(time);
    });
    console.log(scheduler);
  }
  save() {
    //var list = Scheduler.#allload();
    let blankdata = {};
    blankdata[this.codename] = blankdata[this.codename] || {};
    blankdata[this.codename][this.code] = {
      kihonsc: '',
      monthsc: '',
      nitibetusc: ''
    };

    let list = {};
    list[this.codename] = list[this.codename] || {};
    list[this.codename][this.code] = {
      kihonsc: this.kihonsc,
      monthsc: this.monthsc,
      nitibetusc: this.nitibetusc
    };
    //localStorage.setItem(Scheduler.storagename, JSON.stringify(list));
    this.saver.deepsave(blankdata).then(() => {
      this.saver.deepsave(list);
    });
  }
  load(kihonsc, monthsc) {
    this.kihonsc = kihonsc;
    this.monthsc = monthsc;
  }
  searchset() {
    var mylist = Scheduler.#allload()[this.codename][this.code] || {};
    this.kihonsc = mylist['kihonsc'] || {};
    this.monthsc = mylist['monthsc'] || {};
  }
  getalldate() {
    return Object.keys(this.monthsc) || [];
  }
  /**
   *
   * @param {string} codename
   * @param {string} code
   * @returns
   */
  check(codename, code) {
    if (this.codename == codename && this.code == code) return true;
    else return false;
  }
  static storagename = 'scheduler';
  /**@type {Array<Scheduler>} */
  static list;
  /**
   *
   * @returns {Object<string,{kihonsc:Object<string,Array<number>>,monthsc:Object<string,Array<number>>}}
   */
  static #allload() {
    return JSON.parse(localStorage.getItem(Scheduler.storagename) || '{}');
  }
  static allget() {
    if (Scheduler.list != undefined) return;
    Scheduler.list = [];
    let storage = Scheduler.#allload();
    for (var key in storage) {
      /*codenameごとの処理*/
      for (var keycode in storage[key]) {
        /*codeごとの処理(人ごとの処理)*/
        let one = new Scheduler(key, keycode);
        let fromtotimemonth = {};
        let fromtotimekihon = {};
        for (var keysc in storage[key][keycode]) {
          switch (keysc) {
            case 'monthsc':
              for (var keydate in storage[key][keycode][keysc]) {
                fromtotimemonth[keydate] = new Fromtotime().settimelist(storage[key][keycode][keysc][keydate].timelist);
              }
              break;
            case 'kihonsc':
              for (var keyweek in storage[key][keycode][keysc]) {
                fromtotimekihon[keyweek] = new Fromtotime().settimelist(storage[key][keycode][keysc][keyweek].timelist);
              }
              break;
          }
        }
        one.load(fromtotimekihon, fromtotimemonth);
        Scheduler.list.push(one);
      }
    }
  }
  /**
   *
   * @param {string} codename
   * @param {string} cd
   * @returns {Scheduler}
   */
  static getscheduler(codename, cd) {
    Scheduler.allget();
    for (var i = 0; i < Scheduler.list.length; i++) {
      if (Scheduler.list[i].check(codename, cd)) return Scheduler.list[i];
    }
    return new Scheduler('', '');
  }
  static getcodelist(codename) {
    var list = Scheduler.#allload();
    console.log(list);
    return Object.keys(list[codename]) || [];
  }
}

//依存なし
/**
 * @typedef {Object} Shidodata
 * @property {string} shido_id
 * @property {string} [student_cd]
 * @property {string} [teacher_cd]
 * @property {Date} shido_from_tm
 * @property {Date} shido_to_tm
 * @property {string} tenpo_nm
 * @property {string} kubun
 * @property {string} bikou
 */
class ShidoManager {
  static #saver = new Saver('shido_data');
  constructor() {
    /**@type {Object<string,Shidodata>} */
    this.shidodatas = {};
  }
  #save() {
    ShidoManager.#saver.deepsave(this.shidodatas);
    return this;
  }
  /**
   *
   * @param {Object<string,*>} filterObject
   */
  filter(filterObject) {
    /**@type {Object<string,Shidodata>} */
    let newshidodatas = {};
    for (var id in this.shidodatas) {
      /**@type {boolean} */
      let flag = true;
      for (var key in filterObject) if (filterObject[key] != this.shidodatas[id][key]) flag = false;
      if (flag) newshidodatas[id] = this.shidodatas[id];
    }
    this.shidodatas = newshidodatas;
    return this;
  }
  /**
   *
   * @param {Array<BoothData>} booths
   */
  savefromBoothData(booths) {}
  /**
   * 生徒、講師の指導予定から情報を保存する
   */
  savefromHTML() {
    let _this = this;
    let table = $('table');
    let tablehead = getTableHead($(table), 0);
    /**@type {string|undefined} */
    let student_cd = $('input[name=student_cd]').val();
    /**@type {string|undefined} */
    let teacher_cd = $('input[name=teacher_cd]').val();
    if (student_cd == '') student_cd = undefined;
    if (teacher_cd == '') teacher_cd = undefined;
    $(table)
      .find('tr:not(:first)')
      .each(function() {
        // prettier-ignore
        /**@type {string} */
        let id = /**@type {number} */getStrBetween($(this).find("input[name=b_edit]").attr("onclick"),"'","'");
        // prettier-ignore
        let date = new ExDate($(this).find("td").eq(tablehead["日付"]).text().substring(0,5)).resolveYear(dtyesterday);
        // prettier-ignore
        let shido_from_tm = new ExDate(date.setHours(...$(this).find("td").eq(tablehead["時間"]).text().substring(0,5).split(":")));
        // prettier-ignore
        let shido_to_tm = new ExDate(date.setHours(...$(this).find("td").eq(tablehead["時間"]).text().substring(6,11).split(":")));
        // prettier-ignore
        /**@type {string} */
        let tenpo_nm = $(this).find("td").eq(tablehead["教室"]).text()
        // prettier-ignore
        /**@type {string} */
        let kubun = $(this).find("td").eq(tablehead["区分"]).text()
        // prettier-ignore
        /**@type {string} */
        let bikou = $(this).find("td").eq(tablehead["備考"]).text()
        /**@type {Shidodata} */
        let data = {
          shido_id: id,
          student_cd: student_cd,
          teacher_cd: teacher_cd,
          shido_from_tm: shido_from_tm,
          shido_to_tm: shido_to_tm,
          tenpo_nm: tenpo_nm,
          kubun: kubun,
          bikou: bikou
        };
        _this.shidodatas[id] = data;
      });
    this.#save();
    return this;
  }
  async savefromBoothHTML() {
    let _this = this;
    let table = $('table:first');
    let tablehead = getTableHead($(table), 0);
    $(table)
      .find('tr:not(:first)')
      .each(function() {
        // prettier-ignore
        /**@type {string} */
        let id = /**@type {number} */getStrBetween($(this).find("input[name=b_kekka]").attr("onclick"),"'","'");
        // prettier-ignore
        let date = getbetweendate(new Date($('input[name=input1_dt]').val()),new Date($('input[name=input2_dt]').val()),Number($(this).find("td").eq(tablehead["日付"]).text().substring(0,2))-1,Number($(this).find("td").eq(tablehead["日付"]).text().substring(3,5)));
        // prettier-ignore
        let shido_from_tm = new ExDate(date.setHours(...$(this).find("td").eq(tablehead["時間"]).text().substring(0,5).split(":")));
        // prettier-ignore
        let shido_to_tm = new ExDate(date.setHours(...$(this).find("td").eq(tablehead["時間"]).text().substring(6,11).split(":")));
        // prettier-ignore
        /**@type {string} */
        let tenpo_nm = $(this).find("td").eq(tablehead["教室"]).text()
        // prettier-ignore
        /**@type {string} */
        let kubun = $(this).find("td").eq(tablehead["区分"]).text()
        // prettier-ignore
        /**@type {string} */
        let bikou = $(this).find("td").eq(tablehead["科目"]).text()
        // prettier-ignore
        let student_cd = getStrBetween($(this).find("input[name=b_todo1]").attr("onclick"),"'","'",2)
        // prettier-ignore
        let teacher_cd = getStrBetween($(this).find("input[name=b_todo2]").attr("onclick"),"'","'",2)
        /**@type {Shidodata} */
        let data = {
          shido_id: id,
          student_cd: student_cd,
          teacher_cd: teacher_cd,
          shido_from_tm: shido_from_tm,
          shido_to_tm: shido_to_tm,
          tenpo_nm: tenpo_nm,
          kubun: kubun,
          bikou: bikou
        };
        _this.shidodatas[id] = data;
      });
    this.#save();
    return this;
  }
  loadAll() {
    this.shidodatas = ShidoManager.#saver.getall();
    for (var key in this.shidodatas) {
      this.shidodatas[key].shido_from_tm = new Date(this.shidodatas[key].shido_from_tm);
      this.shidodatas[key].shido_to_tm = new Date(this.shidodatas[key].shido_to_tm);
    }
    return this;
  }
  removeBefore() {
    this.loadAll();
    for (var key in this.shidodatas) {
      if (this.shidodatas[key].shido_from_tm < dtlmstart) ShidoManager.#saver.delete(this.shidodatas[key].shido_id);
    }
  }
}

function BeforeInputerControl(submitObject, url) {
  var _this = this;
  this.url = url || location.pathname;
  this.BeforeInputerlist = [];
  /*$(window).on("beforeunload",function(){
		_this.beforeInputersave();
	});*/
  $(submitObject).on('click', function() {
    _this.beforeInputersave();
  });
}
BeforeInputerControl.prototype = {
  beforeInputerregist: function(BeforeInputer) {
    this.BeforeInputerlist.push(BeforeInputer);
  },
  beforeInputersave: function() {
    for (var i = 0; i < this.BeforeInputerlist.length; i++) this.BeforeInputerlist[i].save();
  },
  setswipe: function() {
    this.BeforeInputerlist.forEach(beforeInputer => {
      if (this.url == beforeInputer.geturl()) {
        var selecterarray = beforeInputer.getselecter();
        var valuelist = beforeInputer.getvaluelist();
        var object = beforeInputer.getobject();
        console.log(valuelist, object);
        selecterarray.forEach(selecter => {
          console.log(selecter);
          console.log(valuelist, object);
          for (var i = 0; i < valuelist.length; i++) {
            var obj = Object.assign({}, object[i]);
            var value = [].concat(valuelist[i]);
            console.log(JSON.stringify(value));
            $(selecter).swipe(
              $('<input type="button" name="beforeInputer">')
                .val(JSON.stringify(value))
                .swipebutton(function() {
                  console.log(obj);
                  for (var key in obj) {
                    $(key).val(obj[key]);
                  }
                })
            );
          }
        });
      }
    });
  }
};
//new BeforeInputerControl().beforeInputerregist(new BeforeInputer(["#input_f_dt","#input_t_dt"],"/netz/netz1/schedule/shain_yotei.aspx"))
/*
Alldataの中身
{
	url:{
		"selecterarrayjson":[{"name1":valu1,"name2":value2},{"name1":valu3,"name2":value4}],
		"sele"
	}
	
}
１．グループを作りたい
２．複数記憶させたい
３．保存のタイミングが同時だと、複数登録したときに消える可能性がある
 */
class BeforeInputer {
  constructor(selecterarray, url) {
    this.storagename = 'BeforeInputer';
    this.url = url || location.pathname;
    this.Load();
    if (!$.isArray(selecterarray)) selecterarray = [selecterarray];
    this.selecterarray = selecterarray;
    this.object = {};
  }
  Load() {
    this.Alldata = JSON.parse(localStorage.getItem(this.storagename) || '{}');
  }
  save() {
    this.Load();
    this.makeURLobject();
    localStorage.setItem(this.storagename, JSON.stringify(this.Alldata));
  }
  getValueobject() {
    var ret = {};
    this.selecterarray.forEach(selecter => {
      ret[selecter] = $(selecter).val();
    });
    return ret;
  }
  geturl() {
    return this.url;
  }
  getobject() {
    return this.Alldata[this.url][JSON.stringify(this.selecterarray)];
  }
  getvaluelist() {
    this.Alldata[this.url] = this.Alldata[this.url] || {};
    var obj = this.Alldata[this.url][JSON.stringify(this.selecterarray)] || [];
    var ret = [];
    var one = [];
    for (var i = 0; i < obj.length; i++) {
      one = [];
      for (var key in obj[i]) one.push(obj[i][key]);
      ret.push(one);
    }
    return ret;
  }
  getselecter() {
    return this.selecterarray;
  }
  makeURLobject() {
    this.Alldata[this.url] = this.Alldata[this.url] || {};
    this.Alldata[this.url][JSON.stringify(this.selecterarray)] = this.Alldata[this.url][JSON.stringify(this.selecterarray)] || [];
    this.Alldata[this.url][JSON.stringify(this.selecterarray)].unshift(this.getValueobject());
    this.Alldata[this.url][JSON.stringify(this.selecterarray)].splice(3); //記憶するのは３つまで
  }
}

/**
 * thisのJQueryオブジェクトをスワイプ時、objectのkeyをボタンで表示し、それに対応するvalueを代入する
 * @param {Object<string,string>} object
 * @param {JQuery} [textobject]
 */
$.fn.netzpicker2 = function(object, textobject) {
  for (var key in object) {
    $(this).swipe(
      $(`<button type="button" name="${String(key)}" value="${object[key]}">${key}</button>`).swipebutton(function() {
        /**@type {string} */
        let name = /**@type{string} */ ($(this).attr('name'));
        $(':focus')
          .val($(this).val())
          .change();
        if (textobject != undefined)
          $(textobject)
            .val(name)
            .text(name)
            .change();
      })
    );
  }
  return this;
};

/**
 * [inputremover inputのvalueだけ表示する]
 * @return {JQuery} [description]
 */
$.fn.inputremover = function() {
  $(this).each(function() {
    var obj = $(this);
    switch ($(this).attr('type')) {
      case 'text':
      case 'button':
      case 'time':
        $(obj).after(String($(obj).val()));
        break;
    }
    obj.remove();
  });
  return $(this);
};

/**
 * クリックされるたびに、a,bのfunctionを実行する
 * @param {Function} a
 * @param {Function} b
 * @returns
 */
$.fn.clickToggle = function(a, b) {
  return this.each(function() {
    var clicked = false;
    $(this).on('click', function() {
      clicked = !clicked;
      if (clicked) {
        return a.apply(this, arguments);
      }
      return b.apply(this, arguments);
    });
  });
};

/**
 * keyの入力ストップ後、awaittimeミリ秒後にfuncが発火
 * @param {function} func func内のthisはJQuery内のthisそのもの
 * @param {number} awaittime
 */
$.fn.keydownAwait = function(func, awaittime = 1000) {
  let _this = this;
  let timeout;
  $(this).on('keydown', function(e) {
    let enter = e.key == 'Enter';
    try {
      clearTimeout(timeout);
    } catch (err) {
      console.log(err);
    }
    timeout = setTimeout(
      () => {
        func.call(_this);
      },
      enter ? 0 : awaittime
    );
    if (enter) return false;
  });
  return this;
};
/**
 * [afterdayer thisにobject1の〇日後を固定して表示する]
 * @param  {JQuery} object1
 * @return
 */
$.fn.afterdayer = function(object1) {
  //input:追加するオブジェクト
  //_this:日程を変更する(inputの左側の)object
  //object1:_thisの参照先
  var _this = $(this);
  $(object1).on('keyup change', function() {
    //console.log("change");
    var val = $(this).attr('afterdayer') || '';
    if (val != '') {
      var after = parseInt(val) - 1;
      var date1 = getstrDate($(object1).val() || dateslash(dt), 'yyyy/mm/dd');
      $(_this)
        .val(dateslash(afterdays(date1, after)))
        .trigger('change');
      $(_this).attr('readonly', 'true');
      var span = $('span[name=afterdayerspan]').length ? $('span[name=afterdayerspan]') : $('<span name="afterdayerspan"></span>').insertAfter(_this);
      $(span).text(val + '日間');
    } else {
      $(_this).removeAttr('readonly');
      $('span[name=afterdayerspan]').remove();
    }
  });
  /**
   *
   * @param {string} text
   */
  function setafterdayer(text = '') {
    $(object1)
      .attr('afterdayer', text)
      .trigger('change');
  }
  $(this)
    .swipe(
      $('<input type="tel" size="3px" name="afterinput" value="">').on('keyup change', function() {
        setafterdayer($(this).val());
      })
    )
    .swipe($('<input>', { type: 'button', value: '１日' }).swipebutton(() => setafterdayer('1')))
    .swipe($('<input>', { type: 'button', value: '１週' }).swipebutton(() => setafterdayer('7')))
    .swipe($('<input>', { type: 'button', value: 'ﾘｾｯﾄ' }).swipebutton(() => setafterdayer('')));
  $(this).swipe(function() {
    $('input[name=afterinput]')
      .val($(object1).attr('afterdayer'))
      .trigger('focus');
  });
  return $(this);
};

/**
 *
 * @param {JQuery} addtable
 */
$.fn.tableMergeRight = function(addtable) {
  if ($(this).find('tr').length != $(addtable).find('tr').length) throw new Error('テーブルの行数が一致していません');
  $(this)
    .find('tr')
    .each(function(i) {
      $(this).append(
        $(addtable)
          .find('tr')
          .eq(i)
          .html()
      );
    });
};
/**
 *
 * @param {JQuery} JQueryObject
 * @param {number} headnum
 */
async function maketabler(JQueryObject, headnum) {
  /**
   *
   * @param {JQuery} td
   */
  var getTDText = function(td) {
    let clonetd = $(td).clone();
    //テキスト部分抽出
    $(clonetd)
      .find('input[type=button],input[type=text]')
      .inputremover();
    //selectboxは選ばれてるものだけに
    $(clonetd)
      .find('select')
      .find('option:not(:selected)')
      .remove();
    let rettext = String($(clonetd).prop('innerText')).trim();
    //console.log(rettext);
    rettext = rettext.replace(/　|\t/g, ' ').replace(/\s+/g, ' ');

    $(clonetd).remove();
    return rettext.trim();
  };

  console.log(new Date(), 'tablerStart');
  headnum = headnum === undefined ? 0 : headnum;
  $(JQueryObject).each(function() {
    var tablehead = $(this).find(`tr:eq(${headnum})`);
    table2arrayspecial($(this));
    console.log(new Date(), 'table2arrayspecial完了');
    for (var i = 0; i < 50; i++) {
      for (var j = headnum; j >= 0; j--) {
        if ($(`td[row=${j}][col=${i}]`).length != 0) {
          $(`td[row=${j}][col=${i}]`).attr('tablehead', 'true');
          break;
        }
      }
    }
    console.log(new Date(), 'tablerHead処理完了');
    //console.log(tablearray);
    var alltable = $(tablehead).closest('table');
    var sorttable = $(alltable).find(`tr:gt(${headnum})`);
    console.log(new Date(), 'tablertable処理範囲取得');
    function dataConvertForSort(elem) {
      //数字なら問題ない
      if (typeof elem === 'number') return elem;
      //%対応
      if (typeof elem === 'string' && elem.indexOf('%') != -1) return parseInt(elem.replace('%', ''));
      //NMの学年であれば、数値に変換
      if (typeof elem === 'string' && LCT.STUDENT.gradeTable[elem]) return LCT.STUDENT.gradeTable[elem];
      //ブロック名であればブロックの順番に
      if (typeof elem === 'string' && LCT.UNIT.blockOrder[elem]) return LCT.UNIT.blockOrder[elem];
      //ユニット名であればユニットの順番に
      if (typeof elem === 'string' && LCT.UNIT.unitOrder[elem]) return LCT.UNIT.unitOrder[elem];
      //教室名であれば教室の順番に
      if (typeof elem === 'string' && LCT.UNIT.baseOrder[elem]) return LCT.UNIT.baseOrder[elem];
      //何もなければそのまま返す
      return elem;
    }
    /**
     * ソートできるかどうか
     * 各列の行を１つずつチェックしていき、列数が一致していたら　※減らなかったら対象にする
     * @param {JQuery} td
     * @return {boolean}
     */
    function checksortable(td) {
      const table = $(this).closest('table');
      const col = $(td).attr('col');
      let ret = true;
      let maxtdlength = 0;
      $(td)
        .closest('table')
        .find(`td[col=${col}]`)
        .each(function() {
          let row = $(this).attr('row');
          let tdlength = $(table).find(`td[row=${row}]`).length;
          if (maxtdlength < tdlength) maxtdlength = tdlength;
          else if (maxtdlength > tdlength) {
            ret = false;
            return false;
          }
        });
      return ret;
    }
    $(alltable)
      .find('td[tablehead=true]')
      .on('contextmenu', function(e) {
        const _this = $(this);
        if (e.target.tagName != 'TD') return;
        if (checksortable($(_this)) == false) return;
        //sort
        $('input[name=sorter]').remove();
        $(
          '<input name="sorter" class="netztablerbutton netzblind" type="button" value="S" style="padding-left:0px;padding-right:0px;" disabled>'
        ).appendTo(this);
        var eq = $(this).attr('col');
        /**@type {Array<Array<string|number,number>>} */
        var tableobjectarray = [];
        //[[tdの中身,0],[tdの中身,1]…]の多次元配列を作成し、1つ目の要素でソート、全てのtrを保存→2つ目の要素の順に追加していく
        //console.log($(this),eq,sorttable);
        let beforetext = '';
        $(sorttable).each(function(e) {
          let text = '';
          //なければ飛ばす
          if ($(this).find(`td[col=${eq}]`).length != 0) text = getTDText($(this).find(`td[col=${eq}]`)).replace(/,/g, '');
          else text = beforetext;
          beforetext = text;
          tableobjectarray.push([Number.isNaN(Number(text)) || text == '' ? text : parseInt(text), e]);
        });
        //ソート判定を出す
        $(this).toggleClass('sortAscending');
        tableobjectarray.sort(function(a, b) {
          //ソートをすでにかけていれば逆順になるようにする
          const DX = _this.hasClass('sortAscending') ? 1 : -1;
          const DY = _this.hasClass('sortAscending') ? -1 : 1;
          //dataConvertForSortで　%,学年,教室名等に対応させた。重ければ上記%のみの対応に戻す
          const ev_a = dataConvertForSort(a[0]);
          const ev_b = dataConvertForSort(b[0]);
          //両方数値であれば
          const fina = isFinite(ev_a);
          const finb = isFinite(ev_b);
          //完全一致していたら順序を変えない
          if (ev_a == ev_b) return a[2] > b[2] ? -1 : 1;
          else if (fina && finb) return ev_a > ev_b ? DX : DY;
          else if (!fina && finb) return DY;
          else if (fina && !finb) return DX;
          else return [ev_a, ev_b].sort()[0] == ev_b ? DX : DY;
        });
        //tableobjectarray.sort();
        //console.log(tableobjectarray);
        //tableobjectarrayの[1]要素は実際のtableの位置、順番は順位
        //実際のtableの(tableobjectarray[1])番目の要素は(順番)目の順位
        //rankを消す
        $(sorttable)
          .find('td')
          .removeAttr('rank');
        var kekkatable = {};
        for (let i = 0; i < $(sorttable).length; i++) {
          $(sorttable).each(function(e) {
            if (tableobjectarray[i] && tableobjectarray[i][1] == e) {
              kekkatable[i] = $(this);
            }
          });
        }
        var beforeobj = kekkatable[0];
        for (let i = 1; i < $(sorttable).length; i++) {
          var obj = kekkatable[i];
          $(beforeobj).after(obj);
          beforeobj = obj;
        }
        return false;
      }) //フィルタリング機能
      .on('click', function(e) {
        tablehead = $(this).closest('tr');
        alltable = $(tablehead).closest('table');
        sorttable = $(alltable).find('tr:gt(' + headnum + ')');
        if (e.target.tagName != 'TD') return;
        var eq = $(this).attr('col');
        var tabletextarray = [];
        console.log(tablehead, sorttable);
        $(sorttable).each(function(e) {
          tabletextarray.push(getTDText($(this).find(`td[col=${eq}]`)));
        });
        tabletextarray = tabletextarray.filter(function(x, i, self) {
          return self.indexOf(x) === i;
        });
        //TODO 何個あるか表示する仕組み
        /**
         * @type {Object<string,(boolean|'indeterminate')>}
         * @summary stringはtrue->表示,false->非表示,indeterminate->一部非表示
         */
        var tabletextobject = {};
        /**
         * @type {Object<string,{all:number,show:number}>} tabletextCount
         * @summary stringがall件あって、show件表示されている
         */
        let tabletextCount = {};
        var shownum = 0;
        //hideかチェック
        var hidecheck = function() {
          $(sorttable).each(function() {
            //列に該当セルがなければ次へ
            if ($(this).find(`td[col=${eq}]`).length == 0) return true;
            //テキストを取得する
            var text = getTDText($(this).find(`td[col=${eq}]`));
            //tabletextCountに追加
            //未定義なら定義
            if (tabletextCount[text] == undefined) tabletextCount[text] = { all: 0, show: 0 };
            tabletextCount[text].all += 1;
            //見えてる状態なら
            if ($(this).css('visibility') != 'collapse') {
              //shownumを増やす
              shownum++;
              tabletextCount[text].show += 1;
            }
            if (tabletextobject[text] == null || tabletextobject[text] == ($(this).css('visibility') != 'collapse')) {
              tabletextobject[text] = $(this).css('visibility') != 'collapse';
            } else {
              tabletextobject[text] = 'indeterminate';
            }
          });
        };
        hidecheck();
        console.log(tabletextobject);

        //フィルター画面作成
        var selectname = 'netztablerdiv';
        $(`div[name=${selectname}]`).remove();
        var pickdiv = $(`<div class="onetzpicker opopups" name="${selectname}" eq="${eq}">`);
        var obj = $(this);

        var makefilterbutton = function(obj) {
          var buttonsettd = $(obj).closest('td');
          if ($(buttonsettd).find('input[name="filter"]').length == 0)
            $(
              '<input name="filter" class="netztablerbutton netzblind" type="button" value="F" style="padding-left:0px;padding-right:0px;" disabled>'
            ).appendTo($(buttonsettd));
        };

        $(pickdiv)
          .mouseposition()
          .draggable()
          .on('contextmenu touchend', function() {
            if ($(this).get(0)?.tagName != 'INPUT') $(this).remove();
            return false;
          });
        $('html').on('contextmenu', function() {
          $(pickdiv).remove();
        });
        $(pickdiv).append(`${shownum}件 ${Object.keys(tabletextobject).filter(one => tabletextobject[one] != false).length}種類表示中`);
        $(pickdiv)
          .appendTo(this)
          .trigger('create');
        $('<input type="button" value="全表示">')
          .on('click', function() {
            $(pickdiv)
              .find('input')
              .prop('checked', true);
            $('input[name=filter]').remove();
            $(sorttable).css('visibility', 'visible');
          })
          .appendTo(pickdiv);

        $('<input type="button" value="全非表示">')
          .on('click', function() {
            $(pickdiv)
              .find('input')
              .prop('checked', false);
            makefilterbutton($(this));
            $(sorttable).css('visibility', 'collapse');
          })
          .appendTo(pickdiv);
        $('<input type="button" value="列非表示">')
          .on('click', function() {
            var eq = $(this)
              .closest('div')
              .attr('eq');
            $(alltable)
              .find('tr')
              .find(`td:eq(${eq})`)
              .hide();
          })
          .appendTo(pickdiv);
        $('<br>').appendTo(pickdiv);
        $('<input type="button" value="列コピー">')
          .on('click', function() {
            var eq = $(this)
              .closest('div')
              .attr('eq');
            //テーブルのクローンを生成
            var tableclone = $(this)
              .closest('table')
              .clone(false);
            //異なる列を消去
            $(tableclone)
              .find('tr')
              .find('td:not(:eq(' + eq + '))')
              .remove();
            $(tableclone)
              .find('tr')
              .each(function() {
                if ($(this).css('visibility') == 'collapse') $(this).remove();
              });
            console.log(tableclone);
            $(tableclone)
              .find('div[name=netztablerdiv]')
              .remove();
            navigator.clipboard.writeText($(tableclone).prop('outerHTML'));
          })
          .appendTo(pickdiv);
        $('<input>', { type: 'button', value: '全体コピー' })
          .appendTo(pickdiv)
          .on('click', function() {
            // prettier-ignore
            let tableclone = $(this).closest('table').clone(false);
            // prettier-ignore
            $(tableclone).find("input").inputremover();
            // prettier-ignore
            $(tableclone).find("select,div[name=netztablerdiv]").remove();
            // prettier-ignore
            $(tableclone).find("tr").each(function(){
              if($(this).css("visibility") == "collapse")$(this).remove()
              if($(this).css("visibility") == "hidden")$(this).remove()
            })
            navigator.clipboard.writeText($(tableclone).prop('outerHTML'));
          });
        $('<br>').appendTo(pickdiv);
        /*$('<input>',{type:"button",value:"重複ハイライト"}).appendTo(pickdiv)
        .on("click",function(){})*/
        $('<br><span style="color:#808080;">右クリックで閉じる</span><br>').appendTo(pickdiv);
        $('<input type="text" name="filtertext">')
          .appendTo(pickdiv)
          .keydownAwait(function() {
            let text = $(this).val();
            //空なら即終了
            if (text == '') {
              $(pickdiv)
                .find('input[value="全表示"]')
                .trigger('click');
              return;
            }
            let splittext = $(this)
              .val()
              .split(',')
              .map(one => `[value *= "${one}"]`)
              .join(',');
            let filters = $(pickdiv).find('input[name=filters]');
            $('input[value="全非表示"]').trigger('click');
            $(filters)
              .filter(splittext)
              .prop('checked', true)
              .trigger('change');
          });
        $('input[name="filtertext"]').focus();
        //合計値を出す
        let numberdata = $(sorttable)
          .filter(':visible')
          .filter((index, element) => {
            return $(element).css('visibility') != 'collapse';
          })
          .map((i, element) => {
            return $(element)
              .find(`td[col=${eq}]`)
              .text()
              .replace(/,/g, '');
          })
          .get()
          .filter(one => {
            return isNaN(one) == false && one != '';
          });
        if (numberdata.length > 0) {
          let sum = numberdata.reduce((s, element) => {
            return parseFloat(s) + (isNaN(element) ? 0 : parseFloat(element));
          });
          $(pickdiv).append(`<br><span style="color:#808080;">SUM:${sum}    AVERAGE:${Math.round((sum / numberdata.length) * 100) / 100}</span>`);
        }
        $(pickdiv).append('<br>');
        for (var i = 0; i < tabletextarray.length; i++) {
          const text = tabletextarray[i];
          var checkbox = $('<input>', {
            class: 'tablercheck',
            type: 'checkbox',
            name: 'filters',
            value: text
          });
          let showCount = $('<p/>', {
            css: {
              display: 'inline',
              'vertical-align': 'super',
              'font-size': '0.8rem'
            },
            text: `(${tabletextCount[text]?.show || '-'})`
          });
          //let showCount = tabletextCount[text]?.show || '-';
          let label = $('<label/>');
          $(label)
            .appendTo(pickdiv)
            .append(checkbox)
            .append(text)
            .append(showCount)
            .append('<br>');
          switch (tabletextobject[text]) {
            case true:
              $(checkbox).prop('checked', true);
              break;
            case false:
              $(checkbox).prop('checked', false);
              break;
            case 'indeterminate':
              $(checkbox).prop('indeterminate', true);
              break;
          }
        }
        //フィルターボタンの操作
        $(pickdiv)
          .find('input[name=filters]')
          .on('change', function() {
            var checkbox = $(this);
            var eq = $(this)
              .closest('div')
              .attr('eq');
            var filtertds = sorttable.find(`td[col=${eq}]`).filter(function() {
              return getTDText($(this)) == $(checkbox).val();
            });
            filtertds.each(function() {
              if ($(checkbox).prop('checked')) {
                let tr = $(this).closest('tr');
                let td = $(this);
                $(tr).css('visibility', 'visible');
                if ($(td).attr('rowspan') != null)
                  $(tr)
                    .nextUntil(`[row=${parseInt($(td).attr('rowspan')) + parseInt($(td).attr('row'))}]`)
                    .css('visibility', 'visible');
              } else {
                let tr = $(this).closest('tr');
                let td = $(this);
                $(tr).css('visibility', 'collapse');
                if ($(td).attr('rowspan') != null) {
                  console.log(parseInt($(td).attr('rowspan')) + parseInt($(td).attr('row')));
                  $(tr)
                    .nextUntil(`[row=${parseInt($(td).attr('rowspan')) + parseInt($(td).attr('row'))}]`)
                    .css('visibility', 'collapse');
                }
              }
            });
            //全CHでなければフィルターをかける
            if (
              $(this)
                .closest('div')
                .find('input[type="checkbox"]:not(:checked)').length != 0
            ) {
              makefilterbutton($(this));
            } else
              $(this)
                .closest('td')
                .find('input[name="filter"]')
                .remove();
          })
          .on('contextmenu', function() {
            //右クリックしたら非表示にする
            $(this)
              .prop('checked', true)
              .trigger('click');
            hidecheck();
            return false;
          });
      });
  });
  console.log(new Date(), 'tablerEnd');
  return;
}

/**
 * @param {number} [headnum=0] 何番目をヘッダーにするか()
 */
$.fn.netztabler = function(headnum = 0) {
  maketabler(this, headnum);
  return $(this);
};
/**
 * thisをマウスの位置に移動
 * @returns
 */
$.fn.mouseposition = function() {
  const { x, y } = getMousePosition();
  $(this).css({
    left: x,
    top: y,
    position: 'absolute'
  });
  return $(this);
};

var keylist = {};
$(document).keydown(function(event) {
  keylist[event.keyCode] = true;
});
$(document).keyup(function(event) {
  keylist[event.keyCode] = false;
});

$(document).on('mousedown', function() {
  keylist[1] = true;
});
$(document).on('mouseup', function() {
  keylist[1] = false;
});

/*var attrname = "CtrSelect";
$('td').each(function(){
	$(this).hover(
	function(event){
		if(event.ctrlKey && keylist[1]){
			$(this).attr(attrname,true);
		}
	});
});

$(document).keyup(function(event){
	console.log(event.keyCode);
	if(event.keyCode == 17 && $('td['+attrname+'=true]').length){
		$('td:not(['+attrname+'=true])').remove();
		$('tr').each(function(){
			if($(this).children().length == false)
				$(this).remove();
		});
		$('td['+attrname+'=true]').removeAttr(attrname);
	}
});*/

$.fn.buttonHold = function(time, func) {
  let timeoutfunc;
  $(this)
    .mousedown(function() {
      var obj = $(this);
      /*ボタンを押した時*/
      timeoutfunc = setTimeout(function() {
        func.apply($(obj));
      }, time);
      return false;
    })
    .mouseup(function() {
      /*領域内でマウスを離す時*/
      clearTimeout(timeoutfunc);
    });
};
/**
 * [tabletradd tableの最後にtrを追加する]
 * @return {*} [追加したtr]
 */
$.fn.tabletradd = function(removeflag) {
  var tr = $(this)
    .find('tr:last')
    .clone(false);
  if (removeflag == true) {
    $(tr)
      .find('input,select')
      .remove();
    $(tr)
      .find('td')
      .text('');
  }
  $(tr).appendTo($(this));
  return $(tr);
};

/**
 * thisは[tr]である必要がある。それぞれにfuncを実行、返ってくるstringをattrnameとしてtrに入れる
 * @param {string} attrname
 * @param {Function} func thisがtrで追加データが返ってくる関数
 */
$.fn.addDatafortr = function(attrname, func) {
  $(this).each(function() {
    if ($(this).prop('tagName') != 'TR') throw 'tr以外のオブジェクトに対して$.addDatafortr()を使用しています';
    let data = func.apply($(this));
    $(this).attr(attrname, data);
  });
  return $(this);
};

$.fn.valuetooltip = function() {
  $(this).each(function() {
    $(this)
      .on('change', function() {
        $(this).attr('title', `name:${$(this).attr('name')} value:${$(this).val()}`);
      })
      .trigger('change');
  });
  return $(this);
};

/**
 * 右クリックすると次の項目を選択する
 */
$.fn.selectNextbyRightclick = function() {
  $(this).on('contextmenu', function() {
    let val = $(this).val();
    let nextoption = $(this)
      .find(`option[value=${val}]`)
      .next('option');
    if (nextoption.length == 0) nextoption = $(this).find('option:first');
    $(this).val($(nextoption).val());
    return false;
  });
};

//画面外に出ていたらtrue,画面内ならでfalse
/**
 *
 * @param {JQuery} object
 * @returns
 */
function checkoutofscreen(object) {
  var top = $(object).offset().top;
  var p = top - $(window).height();
  if ($(window).scrollTop() > p) return true;
  else return false;
}

/**
 *
 * @param {Date} dt
 * @returns
 */
function dateslash(dt) {
  return dt.getFullYear() + '/' + ('0' + (dt.getMonth() + 1)).slice(-2) + '/' + ('0' + dt.getDate()).slice(-2);
}
/**
 *
 * @param {Date} dt
 * @returns
 */
function timecolon(dt) {
  return ('0' + dt.getHours()).slice(-2) + ':' + ('0' + dt.getMinutes()).slice(-2);
}
function safeDecode(str) {
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return str; // デコードに失敗したらそのまま返す
  }
}

function getparameter_old(pal) {
  var arg = {};
  var pair = parent.parent.parent.parent.parent.location.search.substring(1).split('&');
  for (var i = 0; pair[i]; i++) {
    var kv = pair[i].split('=');
    var key = safeDecode(kv[0]);
    var value = safeDecode(kv[1] || ''); // 値がない場合でも安全
    arg[key] = value;
  }
  if (pal === undefined) {
    return arg;
  } else {
    return arg[pal];
  }
}

function getparameter(pal, targetWindow) {
  // 参照するウィンドウオブジェクトを指定（省略時は現在のウィンドウ）
  var search = (targetWindow || window).location.search;
  var params = new URLSearchParams(search);
  var arg = {};

  for (const [key, value] of params.entries()) {
    arg[safeDecode(key)] = safeDecode(value);
  }

  return pal === undefined ? arg : arg[pal];
}

/**
 *
 * @param {string} str
 * @returns
 */
function pluscheckdigit(str) {
  // prettier-ignore
  var chlist = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','-','.',' ','$','/','+','%'
  ];
  var chk = 0;
  for (var i = 0; i < str.length; i++) {
    if ($.inArray(str.substr(i, 1), chlist) != -1) {
      chk = chk + $.inArray(str.substr(i, 1), chlist);
    } else {
      console.log('checkdigitError');
      return -1;
    }
  }
  chk = chk % 43;
  return str + chlist[chk];
}

var Base64 = {
  encode: function(str) {
    return btoa(unescape(encodeURIComponent(str)));
  },
  decode: function(str) {
    return decodeURIComponent(escape(atob(str)));
  }
};
function deldouble(selecter) {
  var object = $(selecter);
  var list = [];
  for (var i = 0; i < object.length; i++) {
    if ($.inArray(object[i].val(), list) == -1) list.push(object[i].val());
  }
  return list;
}
function removeswipediv() {
  $('#div_setright').remove();
  $('#div_setunder').remove();
  $('[swipeobject=1]').css('font-weight', 'normal');
}
/**
 * [objectCompare Objectの比較をする。ただし中身に配列、Objectを含んではいけない、かつkeyは一緒]
 * @param  {*} object1 [description]
 * @param  {*} object2 [description]
 * @return {*}         [違うのであればその部分の配列,同じであれば空配列]
 */
function objectCompare_equalkeys(object1, object2) {
  var list = [];
  for (var key in object1) if (object1[key] != object2[key]) list.push(key);
  return list;
}

/**
 * @typedef {Object} BoothData
 * @property {string} id
 * @property {string} teacher_name
 * @property {string} date
 * @property {number} stime
 * @property {number} etime
 * @property {string} student_name
 * @property {string} student_cd
 * @property {string} subject
 * @property {string} boothnum
 * @property {string} shidonum
 * @property {string} kubun
 * @property {string} fulldate
 * @property {string} teacher_cd
 */

class Booth {
  /**
   *
   * @param {boolean} mitehai 未手配(演習など)も追加するかどうか
   * @param {boolean} furikae 振替も追加するかどうか
   * @param {boolean} shingaku 進学教室も追加するかどうか
   * @param {boolean} autobooth
   */
  constructor(mitehai, furikae, shingaku, autobooth = false) {
    mitehai = mitehai == null ? true : mitehai;
    furikae = furikae == null ? true : furikae;
    shingaku = shingaku == null ? true : shingaku;
    this.boothobject = $('table:contains("結果")');
    this.booth = this.analyzebooth(mitehai, furikae, shingaku, autobooth);
    this.boothnumcontrol = new BoothnumControl();
  }

  /**
   *
   * @param {boolean} mitehai
   * @param {boolean} furikae
   * @param {boolean} shingaku
   * @param {boolean} autobooth
   * @returns
   */
  analyzebooth(mitehai, furikae, shingaku, autobooth) {
    /**@type {Array<BoothData>} */
    var boothlist = [];
    var tableobj = this.boothobject;
    if ($(tableobj).length == 0) {
      console.log('boothがないところで呼び出されました');
      return [];
    }
    var head = getTableHead(tableobj, 0);
    var teacher_info = new teacher_info_class();
    //取得
    $(tableobj)
      .find('tr:not(:contains("結果"))')
      .each(function() {
        /**@type {BoothData} */
        var obj = {};
        // prettier-ignore
        obj.id = getStrBetween(/** @type {string}*/ ($(this).find("input[name=b_kekka]").attr("onclick")),"'","'",0)

        // prettier-ignore
        obj.teacher_name = $(this).find('td:eq(' + head['講師名'] + ')').text().replace(/\r?\n/g, '').trim()
        // prettier-ignore
        obj.date = $(this).find('td:eq(' + head['日付'] + ')').text();
        // prettier-ignore
        var time = $(this).find('td:eq(' + head['時間'] + ') a').text();
        let stime = time.substr(0, 5);
        let etime = time.substr(6, 5);
        var timelist = intime(stime, etime);
        obj.stime = timelist.stime;
        obj.etime = timelist.etime;
        // prettier-ignore
        obj.student_name = $(this).find('td:eq(' + head['生徒名'] + ') a').text().replace(/( |\n|\r)/g, '');
        // prettier-ignore
        obj.student_cd = getStrBetween(/** @type {string}*/ ($(this)  .find('td:eq(' + head['時間'] + ')').find('a').attr('href')),"','","','");
        // prettier-ignore
        obj.subject = $(this).find('td:eq(' + head['科目'] + ')').text();
        // prettier-ignore
        obj.boothnum = $(this).find('td:eq(' + head['ブ'] + ')').text();
        // prettier-ignore
        obj.shidonum = getStrBetween(/** @type {string}*/ ($(this).find('td:eq(' + head['時間'] + ')').find('a').attr('href')),"'","'");
        // prettier-ignore
        obj.kubun = $(this).find('td:eq(' + head['区分'] + ')').text();
        // prettier-ignore
        obj.fulldate = getStrBetween(/** @type {string}*/ ($(this).find('td:eq(' + head['時間'] + ')').find('a').attr('href')),"'","'",4).substring(0, 10);
        // prettier-ignore
        obj.teacher_cd = (teacher_info.search('講師名', obj.teacher_name) || {})['cd'];
        // prettier-ignore
        var kekkatext = $(this).find('td:eq(' + head['結果'] + ')').text();
        if (mitehai == false && obj.teacher_name == '(※未手配)') return true;
        if (furikae == false && (kekkatext.indexOf('キャンセル') != -1 || kekkatext.indexOf('振替') != -1)) return true;
        if (shingaku == false && obj.student_name.indexOf('進学教室') != -1) return true;
        //とりあえず模試を除く
        if (autobooth == true) {
          if (obj.kubun == '模試') return true;
          if (obj.kubun == '開閉校') return true;
          if (obj.kubun == '1on1') return true;
        }
        boothlist.push(obj);
      });
    return boothlist;
  }
  getbooth() {
    return this.booth;
  }
  gettr_fromshidonum(shidonum) {
    return $(this.boothobject).find('#td' + shidonum);
  }
  /**
   * ブース番号を決める
   */
  boothnum() {
    //リセット
    this.boothnumcontrol = new BoothnumControl();

    //重複有を先に決めたいので
    var singlebooth = this.getdoublebooth(false);
    var doublebooth = this.getdoublebooth();
    //重複有りを最初に決める
    for (var key in doublebooth) {
      this.setboothnum(doublebooth[key]);
    }
    //重複なしの生徒をその後に決める
    for (var key in singlebooth) {
      this.setboothnum(singlebooth[key]);
    }
    //反映
    var boothnumberarray = JSON.parse(myprofiles.getone({ boothnumberarray: '[]' }));
    boothnumberarray.unshift(0);
    for (var i = 0; i < this.booth.length; i++) {
      var shidonum = this.booth[i].shidonum;
      var num = this.boothnumcontrol.searchShidonum(shidonum);
      if (boothnumberarray.length == 1) this.booth[i].boothnum = num;
      else {
        this.booth[i].boothnum = boothnumberarray[num] || Math.max.apply(null, boothnumberarray) + num - boothnumberarray.length;
      }
    }
  }
  getboothobject() {
    var object = {};
    var booth = this.getbooth();
    for (var i = 0; i < booth.length; i++) object[booth[i].shidonum] = booth[i];
    return object;
  }
  loadbooth(booth) {
    this.booth = booth;
    return this;
  }
  //作成途中
  comparebooth(comparebooth) {
    var objectfilter = function(object, func) {
      var list = Object.keys(object).filter(func);
      console.log(list);
      var retobject = {};
      for (var i = 0; i < list.length; i++) {
        console.log(i, list[i], object[list[i]]);
        retobject[list[i]] = object[list[i]];
      }
      console.log(retobject);
      return retobject;
    };

    var objectmap = function(object, func) {
      var list = Object.keys(object).map(func);
      var retobject = {};
      Object.keys(object).forEach(function(key, i) {
        retobject[key] = list[i];
      });
      return retobject;
    };
    var list = {};
    var returnobject = {};
    if ($.isPlainObject(comparebooth)) comparebooth = comparebooth.getboothobject();
    var booth = this.getboothobject();
    //thisから削除されているものを検査
    returnobject.deletebooth = objectfilter(comparebooth, function(key) {
      return booth[key] == undefined;
    });
    //thisから追加されているものを検査
    returnobject.addbooth = objectfilter(booth, function(key) {
      return comparebooth[key] == undefined;
    });
    console.log(Object.assign(returnobject.addbooth, {}));
    //thisから変更されているものを検査
    returnobject.changebooth = objectfilter(booth, function(v) {
      if (booth[v] == undefined || comparebooth[v] == undefined) return false;
      return objectCompare_equalkeys(booth[v], comparebooth[v]).length != 0;
    });
    returnobject.changeboothobject = objectmap(booth, function(v) {
      if (booth[v] == undefined || comparebooth[v] == undefined) {
        return [];
      } else {
        var change = objectCompare_equalkeys(booth[v], comparebooth[v]);
        //指導番号だけだったら無効に
        if (change.length == 1 && change.indexOf('boothnum') != -1) return [];
        return change;
      }
    });
    returnobject.changeboothobject = objectfilter(returnobject.changeboothobject, function(key) {
      return returnobject.changeboothobject[key].length != 0;
    });

    returnobject.change_studentname = [];
    returnobject.change_teachername = [];
    list.all = Object.assign({}, returnobject.addbooth, returnobject.deletebooth, returnobject.changebooth);
    for (var key in list.all) {
      if (returnobject.change_studentname.indexOf(list.all[key].student_name) == -1) returnobject.change_studentname.push(list.all[key].student_name);
      if (returnobject.change_teachername.indexOf(list.all[key].teacher_name) == -1) returnobject.change_teachername.push(list.all[key].teacher_name);
    }

    return returnobject;
  }
  /**
   *
   * @param {string} id
   * @param {Object<string,string|number>} object
   */
  setdata(id, object) {
    let index = this.booth.findIndex(one => id == one.id);
    let newObject = this.booth[index];
    for (var key in object) newObject[key] = object[key];
    return this;
  }
  setboothnum(booth_name) {
    var timearray = [];
    var i, time;
    //未手配を消す
    for (i = 0; i < booth_name.length; i++) {
      for (time = booth_name[i].stime; time <= booth_name[i].etime; time++) {
        if (timearray.indexOf(time) == -1 && booth_name[i]) timearray.push(time);
      }
    }
    var boothnum = this.boothnumcontrol.blanknumSearchs(timearray);
    var shidonum;
    for (i = 0; i < booth_name.length; i++) {
      for (time = booth_name[i].stime; time <= booth_name[i].etime; time++) {
        shidonum = booth_name[i].shidonum;
        this.boothnumcontrol.setBooth(time, boothnum, shidonum);
      }
    }
  }
  //指導が二つ以上ある生徒をピックアップしてObjectで返す
  //falseなら重複していないものを拾う
  getdoublebooth(trueorfalse) {
    if (trueorfalse == undefined) trueorfalse = true;
    var check = 'student_name';
    var object = {};
    var name;
    for (var i = 0; i < this.booth.length; i++) {
      if (this.duplicatecheck(check, this.booth[i][check]) == trueorfalse) {
        name = this.booth[i][check];
        object[name] = object[name] || [];
        object[name].push(this.booth[i]);
      }
    }
    return object;
  }
  //重複チェック(重複でtrue)
  duplicatecheck(caption, data) {
    var count = 0;
    for (var i = 0; i < this.booth.length; i++) {
      if (this.booth[i][caption] == data) {
        count++;
        if (count > 1) return true;
      }
    }
    return false;
  }
  applyboothnum() {
    $.each(this.booth, function(e) {
      if (this.kubun == '指導' || this.kubun == '体験') {
        chrome.runtime.sendMessage({
          opennetzback:
            '/netz/netz1/kanren/shido_yotei_edit.aspx?action_dt=booth&id=' +
            this.shidonum +
            '&syori=' +
            encodeURIComponent(
              JSON.stringify([['input[name=booth_no]', 'val', this.boothnum], ['input[name="b_submit"]:eq(0)', 'click', 'nextpage'], ['close']])
            )
        });
      }
    });
  }
  //Captionを重複無しでリスト化
  captionlist(caption) {
    var captions = [];
    for (var i = 0; i < this.booth.length; i++) {
      if (captions.indexOf(this.booth[i][caption]) == -1) captions.push(this.booth[i][caption]);
    }
    return captions;
  }
  getperson(student_cdorteacher_cd) {
    this.booth = this.booth.filter(one => {
      var key = student_cdorteacher_cd.keys()[0];
      return key != undefined && student_cdorteacher_cd[key] == one[key];
    });
    return this;
  }
  sort(keystring) {
    this.booth = this.booth.sort((a, b) => a[keystring] - b[keystring]);
    return this;
  }
  /**
   * boothlistの中からcaptionの内容でテーブルを作る
   * @param {string} caption
   */
  makelist(caption) {
    let _this = this;
    var list = [];
    for (var i = 0; i < this.booth.length; i++) list.push(this.booth[i][caption]);
    list = noduplicateion(list);

    var date_list = [];
    for (i = 0; i < this.booth.length; i++) date_list.push(this.booth[i].date);
    date_list = noduplicateion(date_list);

    var newboothtable = $('<table class="small" name="table_' + caption + '" border="1"><tr name="trhead"><td>日付</td><td>時間</td></tr></table>');
    //trを作る
    // prettier-ignore
    var timelist = ['','11:00','11:50','12:40','13:30','14:20','15:10','16:00','16:50','17:50','18:30','19:20','20:10','21:00'];
    //上の部分
    for (var icol = 0; icol < list.length; icol++) {
      $(newboothtable)
        .find('tr[name=trhead]')
        .append('<td name="list">' + list[icol] + '</td>');
    }

    //tdを作る
    for (var irow = 0; irow < date_list.length; irow++) {
      for (var i2row = 1; i2row < timelist.length; i2row++) {
        //tr
        var trobj = $(`<tr id="${date_list[irow]} ${timelist[i2row]}"></tr>`).appendTo(newboothtable);
        $(trobj).append(`<td name="dates">${date_list[irow]}</td><td name="times">${timelist[i2row]}～</td>`);
        for (icol = 0; icol < list.length; icol++) {
          let td = $('<td class="booths"></td>');
          $(td)
            .appendTo(trobj)
            .attr('list', list[icol])
            .attr('date', date_list[irow])
            .attr('time', timelist[i2row]);
          $(td).droppable({
            accept: '.shsido',
            drop: function(e, ui) {
              let id = $(ui.draggable).attr('shido_id');
              let boothnum = $(this).attr('list');
              _this.setdata(id, { boothnum: boothnum });
              console.log(_this.booth);
            }
          });
        }
      }
    }

    //割り当て
    for (i = 0; i < this.booth.length; i++) {
      var student_name = this.booth[i].student_name;
      var teacher_name = this.booth[i].teacher_name;
      var date = this.booth[i].date;
      var stime = this.booth[i].stime;
      var etime = this.booth[i].etime;
      var subject = this.booth[i].subject;
      let id = this.booth[i].id;
      for (var i2 = stime; i2 < etime + 1; i2++) {
        let span = $(`<span class="shsido" shido_id="${id}">${student_name.substr(0, 5)}<br>${subject.substr(0, 5)}</span>`);
        $(newboothtable)
          .find(`td[list="${this.booth[i][caption]}"][date="${date}"][time="${timelist[i2]}"]`)
          .append(span);
        $(span).draggable({
          snap: '.booths',
          snapMode: 'inner',
          snapTolerance: 20,
          revert: 'invalid',
          revertDuration: 100,
          axis: 'x'
        });
      }
    }
    $(newboothtable).appendTo('body');
    return newboothtable;
  }
  /**
   *
   * @param {number} [maxboothnum]
   * @returns
   */
  makeboothlist(maxboothnum) {
    const caption = 'boothnum';
    let _this = this;
    var list = [];
    for (var i = 0; i < this.booth.length; i++) list.push(Number(this.booth[i][caption]));
    if (maxboothnum != undefined) for (var i = 1; i <= maxboothnum; i++) list.push(i);

    //最低でも1～15まで追加する
    for (var i = 1; i <= 15; i++) list.push(i);

    list = noduplicateion(list);
    console.log(maxboothnum, list);

    var date_list = [];
    for (i = 0; i < this.booth.length; i++) date_list.push(this.booth[i].date);
    date_list = noduplicateion(date_list);

    var newboothtable = $('<table class="small" name="table_' + caption + '" border="1"><tr name="trhead"><td>日付</td><td>時間</td></tr></table>');
    //trを作る
    // prettier-ignore
    var timelist = ['','11:00','11:50','12:40','13:30','14:20','15:10','16:00','16:50','17:50','18:30','19:20','20:10','21:00'];
    //上の部分
    for (var icol = 0; icol < list.length; icol++) {
      $(newboothtable)
        .find('tr[name=trhead]')
        .append('<td name="list">' + list[icol] + '</td>');
    }

    //tdを作る
    for (var irow = 0; irow < date_list.length; irow++) {
      for (var i2row = 1; i2row < timelist.length; i2row++) {
        //tr
        var trobj = $(`<tr id="${date_list[irow]} ${timelist[i2row]}"></tr>`).appendTo(newboothtable);
        $(trobj).append(`<td name="dates">${date_list[irow]}</td><td name="times">${timelist[i2row]}～</td>`);
        for (icol = 0; icol < list.length; icol++) {
          let td = $('<td class="booths"></td>');
          $(td)
            .appendTo(trobj)
            .attr('list', list[icol])
            .attr('date', date_list[irow])
            .attr('time', timelist[i2row]);
          $(td).droppable({
            accept: '.shsido',
            drop: function(e, ui) {
              let id = $(ui.draggable).attr('shido_id');
              let boothnum = $(this).attr('list');
              _this.setdata(id, { boothnum: boothnum });
              console.log(_this.booth);
            }
          });
        }
      }
    }

    //割り当て
    for (i = 0; i < this.booth.length; i++) {
      var student_name = this.booth[i].student_name;
      var teacher_name = this.booth[i].teacher_name;
      var date = this.booth[i].date;
      var stime = this.booth[i].stime;
      var etime = this.booth[i].etime;
      var subject = this.booth[i].subject;
      let id = this.booth[i].id;
      for (var i2 = stime; i2 < etime + 1; i2++) {
        let span = $(`<span class="shsido" shido_id="${id}">${student_name.substr(0, 5)}<br>${teacher_name.substr(0, 5)}</span>`);
        $(newboothtable)
          .find(`td[list="${this.booth[i][caption]}"][date="${date}"][time="${timelist[i2]}"]`)
          .append(span);
        $(span).draggable({
          snap: '.booths',
          snapMode: 'inner',
          snapTolerance: 30,
          revert: 'invalid',
          revertDuration: 100,
          axis: 'x'
        });
      }
    }
    $(newboothtable).appendTo('body');
    return newboothtable;
  }
}

class BoothnumControl {
  constructor() {
    this.kekka = {};
    //{"時間":{"ブース番号"}}
  }
  /**
   *
   * @param {number} time
   * @param {string} boothnum
   * @returns
   */
  getBooth(time, boothnum) {
    if (this.kekka[time] == undefined || this.kekka[time][boothnum] == undefined) {
      return null;
    }
    return this.kekka[time][boothnum];
  }
  /**
   *
   * @param {string} shidonum
   * @returns
   */
  searchShidonum(shidonum) {
    for (var keytime in this.kekka) {
      for (var keybooth in this.kekka[keytime]) {
        if (this.kekka[keytime][keybooth] == shidonum) {
          return parseInt(keybooth);
        }
      }
    }
  }
  /**
   *
   * @param {number} time
   * @param {number} boothnum
   * @param {string} shidonum
   */
  setBooth(time, boothnum, shidonum) {
    if (this.kekka[time] == undefined) this.kekka[time] = {};
    this.kekka[time][boothnum] = shidonum;
  }
  /**
   *
   * @param {Array<number>} timearray
   * @returns
   */
  blanknumSearchs(timearray) {
    //チェック
    for (var i = 0; i < timearray.length; i++) {
      if (this.kekka[timearray[i]] == undefined) this.kekka[timearray[i]] = {};
    }
    boothloop: for (var boothnum = 1; boothnum < 100; boothnum++) {
      for (var i = 0; i < timearray.length; i++) {
        if (this.#blankcheck(timearray[i], boothnum) == false) continue boothloop;
      }
      return boothnum;
    }
  }
  /**
   *
   * @param {number} time
   * @param {number} boothnum
   * @returns
   */
  #blankcheck(time, boothnum) {
    if (this.kekka[time][boothnum] != undefined) return false;

    if (this.kekka[time - 1] == undefined) this.kekka[time - 1] = {};
    if (this.kekka[time + 1] == undefined) this.kekka[time + 1] = {};
    //前後が埋まってなければ

    if (this.kekka[time - 1][boothnum] != undefined || this.kekka[time + 1][boothnum] != undefined) return false;
    return true;
  }
}
//重複なしの配列を返す
/**
 * @template T
 * @param {Array<T>} array
 * @returns {Array<T>}
 */
function noduplicateion(array) {
  var kekka = [];
  for (var i = 0; i < array.length; i++) {
    if ($.inArray(array[i], kekka) == -1) {
      kekka.push(array[i]);
    }
  }
  kekka.sort((a, b) => {
    const DX = 1;
    const DY = -1;
    //両方数値であれば
    const fina = isFinite(a);
    const finb = isFinite(b);
    //完全一致していたら順序を変えない
    if (fina && finb) return a > b ? DX : DY;
    else if (!fina && finb) return DY;
    else if (fina && !finb) return DX;
    else return [a, b].sort()[0] == b ? DX : DY;
  });
  return kekka;
}

function getkihonbooth() {
  var boothlist = [];
  var tableobj = $('table:contains("予定作成")');
  var head = getTableHead(tableobj, 0);
  //取得
  $(tableobj)
    .find('tr:not(:contains("予定作成"))')
    .each(function(e) {
      boothlist.push({});
      boothlist[e].teacher_name = $(this)
        .find('td:eq(' + head['講師'] + ')')
        .text()
        .replace(/\r?\n/g, '');
      boothlist[e].date = $(this)
        .find('td:eq(' + head['曜'] + ')')
        .text();
      var time = $(this)
        .find('td:eq(' + head['時間'] + ')')
        .text();
      var stime = time.substr(7, 5);
      var etime = time.substr(13, 5);
      var timelist = intime(stime, etime);
      boothlist[e].stime = timelist.stime;
      boothlist[e].etime = timelist.etime;
      boothlist[e].student_name =
        $(this)
          .find('td:eq(' + head['生徒'] + ')')
          .text() ||
        $(this)
          .find('td:eq(' + head['生徒名'] + ') a')
          .text();
      boothlist[e].subject = $(this)
        .find('td:eq(' + head['教科'] + ')')
        .text();
    });
  console.log(boothlist);
  return boothlist;
}

/**
 *
 * @param {string} text
 * @returns
 */
function splitbyline(text) {
  text = text.replace(/\r\n|\r/g, '\n');
  var lines = text.split('\n');
  /**@type {Array<string>} */
  var outArray = [];

  for (var i = 0; i < lines.length; i++) {
    // 空行は無視する
    if (lines[i] == '') {
      continue;
    }

    outArray.push(lines[i]);
  }

  return outArray;
}
function csv2array(csv) {
  var csvarray = splitbyline(csv);
  var kekka = [];
  for (var i = 0; i < csvarray.length; i++) {
    kekka.push(csvarray[i].split('\t'));
  }
  return kekka;
}
/**
 * [getbetweendate date1とdate2の間にあるmonth,dayの日を返す、間にない日程であれば今年を返す]
 * @param  {Date} date1 [description]
 * @param  {Date} date2 [description]
 * @param  {number} month [description]
 * @param  {number} day   [description]
 * @param  {number} [hour]
 * @param  {number} [minute]
 * @return {Date}       [description]
 */
function getbetweendate(date1, date2, month, day, hour, minute) {
  var year1, year2;
  year1 = date1.getFullYear();
  year2 = date2.getFullYear();
  var kekkadate;
  for (var i = Math.min(year1, year2); i <= Math.max(year1, year2); i++) {
    kekkadate = new Date(i, month, day, hour || 0, minute || 0);
    if (
      (date1.getTime() > kekkadate.getTime() && kekkadate.getTime() > date2.getTime()) ||
      (date2.getTime() > kekkadate.getTime() && kekkadate.getTime() > date1.getTime())
    ) {
      return kekkadate;
    }
  }
  return new Date(new Date().getFullYear(), month, day, hour || 0, minute || 0);
}
/**
 *
 * @param {string} id
 * @param {*} text
 * @param {*} [noftitle]
 */
function netznotification(id, text, noftitle) {
  chrome.runtime.sendMessage({
    notificationid: id,
    nof: text,
    noftitle: noftitle
  });
}

class NetzButtonsofBase {
  /**
   *
   * @param {JQuery|string|null} beforeobject
   * @param {string} target
   * @param {IframeMaker?} iframemaker
   */
  constructor(beforeobject, target, iframemaker) {
    /**@type {JQuery|string|null} */
    this.beforeobject = beforeobject;
    /**@type {string} */
    this.target = target;
    /**@type {IframeMaker|null} */
    this.iframemaker = iframemaker;
  }
  /**
   * 継承必須、student_cdなどのそれぞれのcdを呼びだす
   */
  getcdObject() {
    return {};
  }
  /**
   * 継承必須、値からurlとデータを定義する
   * @param {string} val
   * @param {Object} thisvar
   * @param {JQuery} [thisobject]
   * @param {Object<string, any>} [dataobject]
   * @returns {string|undefined}
   */
  seturlval(val, thisvar, thisobject, dataobject) {
    var url;
    switch (val) {
      case 'booth2':
        url = `${NX.CONST.host}/kanren/booth2.aspx`;
        Object.assign(thisvar, {
          hyoji_cb: 2
        });
        break;
    }
    return url;
  }
  /**
   * ボタンを作成する
   * @param {string} mode urlに紐づけるためのテキスト
   * @param {string} name ボタンに表示するテキスト
   * @param {{}} data 任意のObjectデータ
   * @returns {JQuery} ボタンのオブジェクト
   */
  makebuttons(mode, name, data = {}) {
    var thisclass = this;
    //ボタン用のデータを作る。もし引数でデータが来ていれば追加
    var buttondata = Object.assign(thisclass.getcdObject(), data);
    var obj = $('<button/>', {
      text: name,
      class: 'addbutton_nmex',
      type: 'button',
      name: 'openex',
      value: mode,
      on: {
        click: function() {
          //URLの情報などをセットする
          buttondata = Object.assign(buttondata, thisclass.setactions($(this).val(), $(obj), buttondata));
          thisclass.openurl(mode, buttondata);
        }
      }
    });
    //１回はとりあえずデータセットしておく
    thisclass.setactions(mode, $(obj), buttondata);

    if (thisclass.beforeobject != null) {
      $(obj).insertAfter(thisclass.beforeobject);
      thisclass.beforeobject = obj;
    }
    return obj;
  }
  /**
   *
   * @param {string} mode
   * @param {{}} data
   * @param {boolean} background
   */
  openurl(mode, data = {}, background = false) {
    var thisclass = this;
    var buttondata = Object.assign(thisclass.getcdObject(), data);
    console.log(buttondata);
    let url = this.seturlval(mode, {});
    console.log(url);
    if (thisclass.iframemaker != null) {
      thisclass.iframemaker.makeframe(thisclass.target).openurl(`${url}?${$.param(buttondata)}`);
    } else if (background == true) {
      let pathname = $('<a>', { href: url }).prop('pathname');
      buttondata = Object.assign(buttondata, { close: 'on' });
      chrome.runtime.sendMessage({
        opennetzback: `${pathname}?${$.param(buttondata)}`
      });
    } else {
      window.open(`${url}?${$.param(buttondata)}`, thisclass.target);
    }
    return this;
  }
  /**
   *
   * @param {string} mode
   * @param {{}} data
   * @returns {Promise<*>}
   */
  async gethtml(mode, data = {}) {
    return new Promise((resolve, reject) => {
      var thisclass = this;
      var buttondata = Object.assign(thisclass.getcdObject(), data);
      console.log(buttondata);
      let url = this.seturlval(mode, {});
      $.get(`${url}?${$.param(buttondata)}`).then(
        function(ret) {
          resolve(ret);
        },
        function(reason) {
          reject(reason);
        }
      );
    });
  }
  /**
   * 複数のボタンを作る
   * @param {[[string,string,{}]]} arraydata [mode,name,data={}]のArray
   * @return {this}
   */
  makebuttonsfromArray(arraydata) {
    var _this = this;
    arraydata.forEach(item => {
      _this.makebuttons(item[0], item[1], item[2] || {});
    });
    return this;
  }
  /**
   * 外部参照はしない。テキストからurlを紐づける
   * @param {string} val urlに紐づけるためのテキスト
   * @param {JQuery} thisobject ボタンのオブジェクト
   * @param {Object<string,any>} dataobject 追加データ用のオブジェクト
   * @return {Object<string,any}
   */
  setactions(val, thisobject, dataobject) {
    var thisvar = {};
    let url = this.seturlval(val, thisvar, thisobject, dataobject);
    $(thisobject).attr('url', url);
    dataobject = Object.assign(thisvar, dataobject);
    return dataobject;
  }
  /**
   * ターゲット名を強制変更する
   * @param {string} targetname 変更した後のターゲット名
   * @return {this}
   */
  settarget(targetname) {
    this.target = targetname;
    return this;
  }
  /**
   * beforeObjectの取得、使うのか？
   * @return {JQuery|null}
   */
  getbeforeobject() {
    return this.beforeobject;
  }
}

class NetzButtonsofseito extends NetzButtonsofBase {
  /**
   * 生徒用ボタン
   * @param {string} student_cd   student_cd
   * @param {JQuery|null} beforeobject [undefined、nullならinsertAfterをしない]
   * @param {string} target       [description]
   * @param {IframeMaker?} iframemaker  [description]
   */
  constructor(student_cd, beforeobject, target, iframemaker) {
    super(beforeobject, target, iframemaker);
    this.student_cd = student_cd;
  }
  /**
   * @override
   * @returns {{student_cd:string|number}}
   */
  getcdObject() {
    return { student_cd: this.student_cd };
  }
  static urls = {
    renraku: `${NX.CONST.host}/s/student_renraku_list.aspx`
  };
  /**
   *
   * @param {string} val
   * @param {Object} thisvar
   * @param {JQuery} thisobject
   * @param {JQuery} dataobject
   * @returns {string|undefined}
   */
  seturlval(val, thisvar, thisobject, dataobject) {
    var thisclass = this;
    var url;
    switch (val) {
      //連絡事項
      case 'renraku':
        url = `${NX.CONST.host}/s/student_renraku_list.aspx`;
        break;
      //指導予定一覧
      case 'yotei':
        url = `${NX.CONST.host}/kanren/student_shido_yotei.aspx`;
        break;
      //基本ブース
      case 'kihonb':
        url = `${NX.CONST.host}/tehai/shido2_base_input.aspx`;
        break;
      //関連情報
      case 'kanrenj':
        url = `${NX.CONST.host}/tehai/tehai_kanren_list.aspx`;
        $(thisobject).on('contextmenu', function() {
          relpop(thisclass.student_cd);
          return false;
        });
        break;
      //新規関連情報追加画面
      case 'kanrennew':
        url = `${NX.CONST.host}/tehai/teacher_select_body.aspx`;
        thisvar = Object.assign(thisvar, {
          tenpo_cd: myprofiles.getone({ mybase: '000000' }),
          jyotai_cb: 0
        });
        break;
      //成績情報
      case 'seisekij':
        url = `${NX.CONST.host}/seiseki/seiseki_list.aspx`;
        break;
      //詳細
      case 'shosaij':
        url = `${NX.CONST.host}/student_data_input.aspx`;
        break;
      //契約情報
      case 'keiyakuj':
        url = `${NX.CONST.host}/k/student_keiyaku_data.aspx`;
        break;
      //新規提案書
      case 'teian':
        //thisclass.makevar("nendo_season_cb");
        //thisclass.makevar("teian_id");
        url = `${NX.CONST.host}/s/teiansho.aspx`;
        thisvar = Object.assign(thisvar, {
          nendo_season_cb: nendo_season_cb,
          teian_id: 0
        });
        break;
      //生徒プロファイル
      case 'profile':
        url = `${NX.CONST.host}/s/student_profile_input.aspx`;
        break;
      //新規連絡事項
      case 'newrenraku':
        url = `${NX.CONST.host}/s/student_renraku_input.aspx`;
        thisvar = Object.assign(thisvar, {
          memo_cd: ''
        });
        break;
      case 'rireki':
        //thisclass.makevar("memo_cd");
        url = `${NX.CONST.host}/s/student_renraku_rireki_input.aspx`;
        thisvar = Object.assign(thisvar, {
          memo_cd: undefined
        });
        break;
      case 'furikae':
        url = `${NX.CONST.host}/tehai/furikae_list.aspx`;
        break;
      case 'houkoku':
        url = `${NX.CONST.host}/kanren/student_shido_kiroku_list.aspx`;
        break;
      case 'booth':
        //input1_dt,input2_dtが必要
        url = `${NX.CONST.host}/kanren/student_shift.aspx`;
        break;
      case 'enshutehai':
        url = `${NX.CONST.host}/tehai/tehai_enshu_input.aspx`;
        break;
      case 'seitoinfo':
        url = `${NX.CONST.host}/student_list.aspx`;
        break;
      case 'tehaij':
        url = `${NX.CONST.host}/tehai/student_tehai_list.aspx`;
        break;
      case 'schedule':
        url = `${NX.CONST.host}/s/student_schedule_list.aspx`;
        break;
      case 'textj':
        url = `${NX.CONST.host}/text/text_list_body.aspx`;
        break;
      case 'kitei':
        url = `${NX.CONST.host}/kanren/student_kaisu_list3.aspx`;
        break;
      case 'kiteionline':
        url = `${NX.CONST.host}/kanren/student_kaisu_list3_o.aspx`;
        break;
      //指導一括編集
      //input1_dt,input2_dtが必要
      case 'shido_edit':
        url = `${NX.CONST.host}/tehai/shido_edit_list.aspx`;
        break;
      case 'uriage':
        url = `${NX.CONST.host}/u/uriage_input.aspx`;
        break;
      case 'jukenj':
        url = `${NX.CONST.host}/jyuken/goukaku_input.aspx`;
        break;
      case 'calender':
        url = `${NX.CONST.host}/kanren/student_schedule.aspx`;
        break;
      case 'shingaku':
        url = `${NX.CONST.host}/shingaku/student_shingaku_list.aspx`;
        break;
      case 'inout':
        url = `${NX.CONST.host}/s/student_inout_list.aspx`;
        break;
      //id(指導ID？),shido_tmが必要
      case 'shido_yotei_edit':
        url = `${NX.CONST.host}/kanren/shido_yotei_edit.aspx`;
        break;
      case 'student_ai_mokuhyo_input':
        url = `${NX.CONST.host}/ai/student_ai_mokuhyo_input.aspx`;
        break;
      case 'todo':
        url = `${NX.CONST.host}/todo/todo_list.aspx`;
        thisvar = Object.assign(thisvar, {
          user_cd: this.student_cd,
          todo_cb: 1
        });
        break;
      case 'talk':
        url = `${NX.CONST.host}/talk/talkmenu.aspx`;
        thisvar = Object.assign(thisvar, {
          talk_type: 'student',
          personal_talk: 'true'
        });
        break;
      case 'mendanrireki':
        url = `${NX.CONST.host}/s/student_mendan_result_input.aspx`;
        thisvar = Object.assign(thisvar, {
          nendo_season_cb: myprofiles.getone({ nendo_season_cb: '20233' })
        });
        break;
      //手配_cdが必要
      case 'tehai':
        url = `${NX.CONST.host}/tehai/tehai_input.aspx`;

        break;
      case 'shido_2_input':
        url = `${NX.CONST.host}/tehai/shido2_input_sp.aspx`;
        let tehai_cd = new Tehai_cd_manager(this.student_cd).gettehai_cd();
        thisvar = Object.assign(thisvar, {
          tehai_cd: tehai_cd,
          input_f_dt: dateslash(dt),
          input_t_dt: dateslash(dtlast),
          shido_vl: 12,
          shido_jk: 45,
          open_cb: 4
        });
        break;
      case 'seisekikanri': {
        url = `${NX.CONST.host}/sso/mobilenetzmenu.aspx`;
        thisvar = Object.assign(thisvar, {
          app_name: 'forlecturer',
          page_kind: '3',
          method_name: 'seiseki'
        });
        break;
      }
      case 'student_list': {
        url = `${NX.CONST.host}/student_list_body.aspx`;
        break;
      }
      /*
        case 'booth2':
          url = `${NX.CONST.host}/kanren/booth2.aspx`
          break*/
    }
    return url;
  }
}

/**
 * @extends {NetzButtonsofBase}
 */
class NetzButtonsoftenpo extends NetzButtonsofBase {
  constructor(tenpo_cd, beforeobject, target, iframemaker) {
    super(beforeobject, target, iframemaker);
    this.tenpo_cd = tenpo_cd;
  }
  getcdObject() {
    return { tenpo_cd: this.tenpo_cd };
  }
  /** @override */
  seturlval(val, thisvar, thisobject, dataobject) {
    var url;
    switch (val) {
      case 'booth2':
        url = `${NX.CONST.host}/kanren/booth2.aspx`;
        thisvar = Object.assign(thisvar, {
          hyoji_cb: 2
        });
        break;
      case 'yotei':
        url = `${NX.CONST.host}/schedule/yotei.aspx`;
        break;
      case 'furikaelist':
        url = `${NX.CONST.host}/tehai/shido_furikae_list_body.aspx`;
        thisvar = Object.assign(thisvar, {
          kekka_cb: '01',
          tenpo_cb: 1,
          sort_cb: 1
        });
        break;
    }
    return url;
  }
}
class NetzButtonsofteacher extends NetzButtonsofBase {
  constructor(teacher_cd, beforeobject, target, iframemaker) {
    super(beforeobject, target, iframemaker);
    this.teacher_cd = teacher_cd;
  }
  getcdObject() {
    return { teacher_cd: this.teacher_cd };
  }
  seturlval(val, thisvar, thisobject, dataobject) {
    var url;
    switch (val) {
      case 'list':
        url = `${NX.CONST.host}/t/teacher_list_body.aspx`;
        Object.assign(thisvar, {
          menu_cb: 'r'
        });
        console.log(thisvar);
        break;
      case 'yotei':
        url = `${NX.CONST.host}/t/teacher_schedule_list.aspx`;
        break;
      case 'shido':
        url = `${NX.CONST.host}/kanren/teacher_shido_yotei.aspx`;
        break;
    }
    return url;
  }
}
class NetzButtonsofshain extends NetzButtonsofBase {
  /**
   *
   * @param {string} tanto_cd
   * @param {JQuery?} beforeobject
   * @param {string?} target
   * @param {IframeMaker} iframemaker
   */
  constructor(tanto_cd, beforeobject, target, iframemaker) {
    super(beforeobject, target, iframemaker);
    this.tanto_cd = tanto_cd;
  }
  /**
   * @override
   * @returns {{tanto_cd:string}}
   */
  getcdObject() {
    return { tanto_cd: this.tanto_cd };
  }
  /**
   * 値からurlとデータを定義する
   * @param {string} val
   * @param {string} thisvar
   * @param {JQuery} thisobject
   * @param {Object<string, any>} dataobject
   * @returns {string}
   */
  seturlval(val, thisvar, thisobject, dataobject) {
    let url = '';
    switch (val) {
      case 'shainyotei':
        url = `${NX.CONST.host}/schedule/shain_yotei.aspx`;
        if (dataobject.input_f_dt != null && dataobject.input_t_dt != null) {
          Object.assign(thisvar, {
            input_f_dt: dataobject,
            input_t_dt: dataobject.input_t_dt
          });
        }
        break;
    }
    return url;
  }
}
class Popmenumaker {
  //Popmenuはトリガーボタンと一緒にここに保存
  //Popmenumaker = {
  //	"14" : [Object,Object]
  //}
  //Popmenumaker = {
  //	"14" :
  //		{"1" :[Object,Object]
  //	}
  //}
  /**@type {Object<number,Object<string,Popmenumaker>>}} */
  static list = {};
  static popmenug = {};
  /**@type {JQuery} */
  static maindiv;
  /**
   *
   * @param {string} id
   * @param {number} keycode
   * @param {boolean} [resetflag]
   * @returns
   */
  constructor(id, keycode, resetflag) {
    if (keycode == null) {
      console.warn('Warn : Popmenumakerのkeycodeが指定されていません');
      keycode = 45; //デフォルトはInsert
    }
    if (id == null) {
      console.error('Error : Popmenumakerのidが指定されていません');
      return;
    }
    /**@type {string} */
    this.id = id;
    /**@type {number} */
    this.keycode = keycode;
    /**@type {JQuery} */
    this.object = $(`<span class="opopups" id="${id}" name="popmenu">`);
    this.resetflag = resetflag;
    /**@type {Array<Function>} */
    this.contentfunction = this.contentfunction || [];
    if (Popmenumaker.list[keycode] == undefined) {
      Popmenumaker.list[keycode] = {};
      Popmenumaker.popmenug[keycode] = 0;
      Popmenumaker.viewmenu(keycode);
    }
    Popmenumaker.list[keycode][id] = this;
  }
  getObject() {
    return this.object;
  }
  resetObject() {
    if (this.resetflag == false) return;
    $(this.object).remove();
    this.object = $(`<span class="opopups" id="${this.id}" name="popmenu">`);
  }
  removeObject() {
    $(this.object).remove();
    delete Popmenumaker.list[this.keycode][this.id];
    return;
  }
  closemenu() {
    Popmenumaker.closemenu(this.keycode);
  }
  /**
   *
   * @param {Function} func
   */
  setContentFunction(func) {
    this.contentfunction.push(func);
  }
  applyContentFunction() {
    for (var i = 0; i < this.contentfunction.length; i++) {
      this.contentfunction[i].apply(this.getObject());
    }
  }
  hasFunction() {
    console.log(this.contentfunction.length);
    return this.contentfunction.length != 0;
  }
  /**
   *
   * @param {number} keycode
   */
  static viewmenu(keycode) {
    window.addEventListener('keydown', function(e) {
      if (e.keyCode != keycode) return;
      Popmenumaker.#openmenu(keycode);
    });
    $('html').on('mousedown', function(e) {
      if (!['INPUT', 'BUTTON', 'TEXTAREA', 'SELECT', 'LABEL'].includes(e.target.tagName)) Popmenumaker.closemenu(keycode);
    });
  }
  /**
   *
   * @param {number} keycode
   */
  static #openmenu(keycode) {
    //var maindiv;
    const _this = this;
    Popmenumaker.popmenug[keycode]++;
    console.log(Popmenumaker.popmenug[keycode]);
    switch (Popmenumaker.popmenug[keycode]) {
      case 1:
        console.log(keycode, '表示中');
        _this.maindiv = $(`<div name="popmenudiv" keycode="${keycode}" class="onetzpicker"></div>`)
          .css('padding', '0px')
          .css('margin', '0px')
          .appendTo('body');
        $(_this.maindiv).mouseposition();
        var object;
        for (var key in Popmenumaker.list[keycode]) {
          object = Popmenumaker.list[keycode][key];
          object.resetObject();
          $(_this.maindiv).append(object.getObject());
          object.applyContentFunction();
        }
        //中が空っぽだったらそのまま閉じる
        console.log($(_this.maindiv).find('[name!=popmenu]'));
        if ($(_this.maindiv).find('[name!=popmenu]').length == 0) $(_this.maindiv).remove();
        break;
      default:
        Popmenumaker.closemenu(keycode);
    }
  }
  /**
   *
   * @param {number} keycode
   */
  static closemenu(keycode) {
    $('div[name="popmenudiv"][keycode=' + keycode + ']').remove();
    Popmenumaker.popmenug[keycode] = 0;
  }

  /**
   *
   * @param {number} keycode
   * @param {number} [top]
   */
  static makeAndroidbutton(keycode, top) {
    const _this = this;
    var ua = window.navigator.userAgent.toLowerCase();
    //if (ua.indexOf('android') == -1) return;
    if (myprofiles.getone({ tabletmode: false }) == false) return;
    let button = $('<button>', {
      class: 'popmenubutton',
      name: `makeandroidbutton${keycode}`
    })
      .on('click', function() {
        Popmenumaker.#openmenu(keycode);
        $(_this.maindiv).css({ left: 'auto' });
      })
      .appendTo('body');
    if (top != null) $(button).css('top', top);
  }
}

class Tehai_cd_manager {
  static saver = new Saver('tehai_cd');
  /**@type {string} */
  #student_cd;
  constructor(student_cd) {
    this.#student_cd = student_cd;
    if (Tehai_cd_manager.saver.getone({ [this.#student_cd]: null }) == null) this.#loadtehai_cd();
  }
  async #loadtehai_cd() {
    Tehai_cd_manager.saver.save({ [this.#student_cd]: await gettehai_cd(this.#student_cd) });
  }
  /**
   *
   * @returns {string|null}
   */
  gettehai_cd() {
    return Tehai_cd_manager.saver.getone({ [this.#student_cd]: null });
  }
}

function array2object(array, objectnamearray) {
  var kekka = {};
  for (var i = 0; i < array.length; i++) {
    kekka[[objectnamearray][i]] = array[i];
  }
  return kekka;
}
/**
 *
 * @param {Object} object
 * @param {Array<string>} objectnamearray
 * @returns
 */
function object2array(object, objectnamearray) {
  var kekka = [];
  for (var key in object) {
    for (var i = 0; i < objectnamearray.length; i++) {
      if (key == objectnamearray[i]) kekka[i] = object[key];
    }
  }
  return kekka;
}
/**
 * <option>を生成する
 * list2があればlistがvalue,list2がテキスト
 * @param {Array<string>} list
 * @param {Array<string>} [list2]
 * @returns
 */
function listoptioner(list, list2) {
  var kekka = '';
  var i;
  if (list2 == undefined) {
    for (i = 0; i < list.length; i++) {
      kekka = kekka + '<option value="' + list[i] + '">' + list[i] + '</option>';
    }
  } else {
    for (i = 0; i < list.length; i++) {
      kekka = kekka + '<option value="' + list[i] + '">' + list2[i] + '</option>';
    }
  }

  return kekka;
}
/**
 *
 * @param {string} stimetext 00:00
 * @param {string} etimetext 00:00
 * @returns
 */
function intime(stimetext, etimetext) {
  let slist = ['10:10', '11:00', '11:50', '12:40', '13:30', '14:20', '15:10', '16:00', '16:50', '17:40', '18:30', '19:20', '20:10', '21:00', '21:50'];
  //elist = ["11:00","11:50","12:40","13:30","14:20","15:10","16:00","16:50","17:40","18:30","19:20","20:10","21:00","21:50","22:40"];
  var kekka = {};
  kekka.stime = 0;
  kekka.etime = 0;
  /**@type {number} */
  let btime;
  /**@type {number} */
  let atime;
  /**@type {number} */
  let ttime;
  for (var i = 1; i < slist.length; i++) {
    btime = new Date('2017/10/10 ' + slist[i]).getTime();
    atime = new Date('2017/10/10 ' + slist[i + 1]).getTime();
    ttime = new Date('2017/10/10 ' + stimetext).getTime();
    // console.log('s'+i+'_'+ttime+'_'+atime+'_'+btime);
    if (btime <= ttime && ttime < atime) {
      kekka.stime = i;
      break;
    }
  }
  for (i = 1; i < slist.length; i++) {
    btime = new Date('2017/10/10 ' + slist[i]).getTime();
    atime = new Date('2017/10/10 ' + slist[i + 1]).getTime();
    ttime = new Date('2017/10/10 ' + etimetext).getTime();
    //  console.log('e'+i+'_'+ttime+'_'+atime+'_'+btime);
    if (btime < ttime && ttime <= atime) {
      kekka.etime = i;
      break;
    }
  }
  return kekka;
}
/**
 *
 * @param {string|number} stime 00:00 or number
 * @param {string|number} [etime]
 */
function Intime(stime, etime) {
  if (typeof stime == 'string' && Number.isNaN(Number(stime))) {
    //11字以上なら文字列分割
    if (stime.length > 10) {
      var one = stime.substr(0, 5);
      var two = stime.substr(6, 5);
      var kekka = intime(one, two);
      stime = kekka.stime;
      etime = kekka.etime;
    } else {
      stime = intime(stime, stime)['stime'];
    }
  }
  if (typeof etime == 'string' && Number.isNaN(Number(etime))) {
    etime = intime(etime, etime)['etime'];
  }
  /**@type {number} */
  this.stime = stime;
  /**@type {number} */
  this.etime = etime;
}
Intime.prototype = {
  /**
   *
   * @param {string|number} strorint
   * @returns
   */
  incheck: function(strorint) {
    /**@type {number} */
    let timenumber;
    //strなら00:00
    if (!isFinite(strorint)) {
      //文字列なら数値に直す
      timenumber = new Intime(strorint + '-' + strorint).gettime()['stime'];
    } else timenumber = strorint;
    if (this.stime <= timenumber && timenumber <= this.etime) return true;
    else return false;
  },
  gettime: function() {
    return { stime: this.stime, etime: this.etime };
  },
  gettimelist: function() {
    if (this.stime > this.etime) return [this.stime];
    var kekka = [];
    for (var i = this.stime; i <= this.etime; i++) {
      kekka.push(i);
    }
    return kekka;
  }
};
/**
 * [relpop:関連情報をポップアップで]
 * @param {string} studentcd
 */
function relpop(studentcd) {
  window.open(
    `${NX.CONST.host}/tehai/tehai_kanren_list.aspx?student_cd=${studentcd}&relpop=1`,
    'relpop',
    'popup=1,width=700,height=500,left=1000,top=100'
  );
}
class Fromtotime {
  constructor() {
    //未定義時は[]、不可のときは[0]
    /**@type {Array<number>} */
    this.timelist = [];
    this.resettime();
  }
  /**
   *
   * @param {string} timetext [11:00-21:50 or ①11:00-12:40　or ② 12:40-13:30など]
   * @returns {Array<number>}
   */
  static texttimelist(timetext) {
    if (timetext == '×') return [0];
    if (timetext == '') return [];
    if (timetext == '○') return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

    var kekka;
    if (timetext.indexOf('①') == -1 || timetext.indexOf('②') == -1) {
      //11:00-21:50
      kekka = new Intime(timetext).gettimelist();
    } else {
      //①11:00-12:40
      kekka = new Intime(timetext.match(/(?<=①).*(?=②)/)[0]).gettimelist();
      kekka = kekka.concat(new Intime(timetext.match(/(?<=②).*$/)[0]).gettimelist());
    }
    return kekka;
  }
  /**
   *
   * @param {string} timetext
   * @returns
   */
  addtimetext(timetext) {
    this.timelist = Fromtotime.texttimelist(timetext);
    return this;
  }
  //すべて大丈夫かCHする
  /**
   * スケジュールが入っているか確認する
   * @param {Array<number>|number} timenumber_or_array
   * @returns {boolean|undefined}
   */
  incheck(timenumber_or_array) {
    if (this.timelist.length == 0) return undefined;
    if (Array.isArray(timenumber_or_array)) {
      //配列なら
      for (var i = 0; i < timenumber_or_array.length; i++) if (this.timelist.indexOf(timenumber_or_array[i]) == -1) return false;
      return true;
    } else {
      if (this.timelist.indexOf(timenumber_or_array) != -1) return true;
      else return false;
    }
  }
  /**
   *
   * @returns {string}
   */
  gettimetext() {
    // prettier-ignore
    let slist = ['10:10','11:00','11:50','12:40','13:30','14:20','15:10','16:00','16:50','17:40','18:30','19:20','20:10','21:00','21:50'];
    switch (this.timelist.length) {
      case 0:
        return '×';
      case 1:
        if (this.timelist[0] == 0) return '×';
        else return slist[this.timelist[0]];
      default:
        return `${slist[this.timelist[0]]} - ${slist[this.timelist[this.timelist.length - 1] + 1]}`;
    }
  }
  resettime() {
    this.timelist = [];
  }
  gettimelist() {
    return this.timelist;
  }
  settimelist(timelist) {
    this.timelist = timelist || [];
    return this;
  }
  /**
   * 一致している個数を返す
   * @param {Array<number>} timelist
   * @return {number}
   */
  matchnum(timelist) {
    let num = 0;
    for (let time of this.timelist) if (timelist.indexOf(time) != -1) num++;
    return num;
  }
}
function compareobject(object1, object2) {
  var keys1 = Object.keys(object1).sort();
  var keys2 = Object.keys(object2).sort();
  if (keys1.toString() !== keys2.toString()) return false;
  var wrongIndex = keys1.findIndex(function(value) {
    return object1[value] !== object2[value];
  });

  return wrongIndex === -1;
}

function differenceobject(object1, object2) {
  var differnt = {};
  for (var key in object1) if (object1[key] !== object2[key]) differnt[key] = { before: object1[key], after: object2[key] };
  return differnt;
}

/**
 * fromtotime 11:00-22:00等を[1,2,3…]の来れる時間割の配列へ
 * @param  {string} time [11:00-22:00 or ①11:00-]
 * @return {Array<number>|number}     [可能時間の配列,未入力はfalseを返す]
 */

function fromtotime(time) {
  var kekka, time1, time2;
  kekka = [];
  if (time == '') return -1;
  if (time != '') {
    var i;
    if (time.indexOf('①') == -1) {
      time1 = shidotimept_andend.indexOf(time.substr(0, 5)) + 1;
      time2 = shidotimept_andend.indexOf(time.substr(6, 5)) + 1;
      for (i = time1; i < time2; i++) {
        kekka.push(i);
      }
    } else {
      time1 = shidotimept_andend.indexOf(time.substr(1, 5)) + 1;
      time2 = shidotimept_andend.indexOf(time.substr(7, 5)) + 1;
      for (i = time1; i < time2; i++) {
        kekka.push(i);
      }
      time1 = shidotimept_andend.indexOf(time.substr(14, 5)) + 1;
      time2 = shidotimept_andend.indexOf(time.substr(20, 5)) + 1;
      for (i = time1; i < time2; i++) {
        kekka.push(i);
      }
    }
  }

  return kekka;
}

function SeisekiManager(tableObject) {
  this.tableObject = tableObject;
  this.splitbytest(this.tableObject);
}
SeisekiManager.prototype = {
  splitbytest: function(tableObject) {
    var ret = [];
    var one = $(tableObject).find('tr:first');
    console.log(tableObject, one);
    for (; $(one).length != 0; ) {
      var add = $(one)
        .nextUntil('tr:has("table")')
        .addBack();
      ret.push(new SeisekiAnalyzer(add));
      one = $(add)
        .last()
        .next();
    }
    this.list = ret;
  },
  geteq: function(eq) {
    return this.list[eq];
  }
};

function SeisekiAnalyzer(tableObject) {
  this.tableObject = tableObject;
  this.subjectarray = ['国語', '数学', '英語', '社会', '理科', '合計'];
  this.analyze(this.tableObject);
}

SeisekiAnalyzer.prototype = {
  analyze: function(tableObject) {
    console.log(tableObject);
    var title = $(tableObject)
      .find('table')
      .find('td:first')
      .text();
    var subjectarray = this.subjectarray;
    var _this = this;
    this.year = title.substr(0, 4);
    this.month = title.substr(5, 2);
    this.title = title.match(/(?<=：).*$/);
    this.grade = {};
    $(tableObject)
      .filter('tr:contains("点数")')
      .find('td:not(:first)')
      .each(function(e) {
        console.log(e, _this.grade, subjectarray);
        _this.grade[subjectarray[e]] = {};
        _this.grade[subjectarray[e]]['点数'] = $(this).text();
      });
    $(tableObject)
      .filter('tr:contains("偏差")')
      .find('td:not(:first)')
      .each(function(e) {
        _this.grade[subjectarray[e]]['偏差'] = $(this).text();
      });
  },
  makeformat() {
    var tensuutext = '点数　',
      hensatext = '偏差値　';
    var _this = this;
    for (var subject in _this.grade) {
      tensuutext += `${subject}：${_this.grade[subject]['点数']}、`;
      hensatext += `${subject}：${_this.grade[subject]['偏差']}、`;
    }
    return `${this.title}　${tensuutext}　${hensatext}`;
  }
};

function localStoragesaver(directory) {
  var blob = new Blob([JSON.stringify(localStorage)], { type: 'text/plain' });
  var filename = directory + '\\' + myprofiles.getone({ myname: '君の名は' }) + '.txt';
  console.log(filename);
  chrome.runtime.sendMessage({
    downloadurl: URL.createObjectURL(blob),
    downloadname: filename
  });
}

function table2array(tableobject) {
  var kekka = [];
  $(tableobject)
    .find('tr')
    .each(function() {
      var tr = [];
      $(this)
        .find('td')
        .each(function() {
          tr.push($(this).text());
        });
      kekka.push(tr);
    });
  return kekka;
}
function array2table(array) {
  var kekka = $('<table></table>');
  var i, i2;
  for (i = 0; i < array.length; i++) {
    var tr = $('<tr></tr>');
    for (i2 = 0; i2 < array[i].length; i2++) {
      tr.append('<td>' + array[i][i2] + '</td>');
    }
    kekka.append(tr);
  }
  return kekka;
}

function daychanger(object1, object2) {
  this.object1 = object1;
  this.object2 = object2;
}
daychanger.prototype = {
  change: function(contents1, contents2) {
    if (contents1 != null)
      $(this.object1)
        .val(contents1)
        .change();
    if (contents2 != null)
      $(this.object2)
        .val(contents2)
        .change();
  }
};
/**
 *
 * @param {JQuery} tableobject
 * @returns
 */
function table2arrayspecial(tableobject) {
  if ($(tableobject).attr('table2arrayspecial') == 'true') return;
  $(tableobject).attr('table2arrayspecial', 'true');
  var kekka = [];
  var i, j, k;
  $(tableobject)
    .find('tr')
    .each(function(i) {
      var kekkatr = [];
      $(this)
        .find('td')
        .each(function(j) {
          kekkatr.push({
            text: $(this).html(),
            rowspan: parseInt($(this).attr('rowspan') || 0),
            colspan: parseInt($(this).attr('colspan') || 0),
            beforerow: i,
            beforecol: j
          });
        });
      kekka.push(kekkatr);
    });
  //横処理
  for (i = 0; i < kekka.length; i++) {
    for (j = 0; j < kekka[i].length; j++) {
      if (kekka[i][j].colspan != 0) {
        for (k = 1; k < kekka[i][j].colspan; k++) {
          kekka[i].splice(j + 1, 0, { text: 'colspan' });
        }
      }
    }
  }
  //縦処理
  for (i = 0; i < kekka.length; i++) {
    for (j = 0; j < kekka[i].length; j++) {
      if (kekka[i][j].rowspan != 0) {
        for (k = 1; k < kekka[i][j].rowspan; k++) {
          kekka[i + k].splice(j, 0, { text: 'rowspan' });
        }
      }
    }
  }
  //現在の列を追加
  for (i = 0; i < kekka.length; i++) {
    for (j = 0; j < kekka[i].length; j++) {
      kekka[i][j]['nowrow'] = i;
      kekka[i][j]['nowcol'] = j;
    }
  }
  console.log('tablearrayspecial2.kekka', kekka);
  var object;
  var kekkaone = Array.prototype.concat.apply([], kekka);
  //console.log(kekkaone);
  $(tableobject)
    .find('tr')
    .each(function(i) {
      let tr = $(this);
      $(this)
        .find('td')
        .each(function(j) {
          for (var k = 0; k < kekkaone.length; k++) {
            if (kekkaone[k].beforerow == i && kekkaone[k].beforecol == j) {
              object = kekkaone[k];
              //kekkaone = kekkaone.splice(k, 1);
              break;
            }
          }
          $(this).attr('row', object.nowrow);
          $(this).attr('col', object.nowcol);
          $(this).attr('rowmax', parseInt(object.nowrow) + (parseInt($(this).attr('rowspan')) || 1) - 1);
          $(this).attr('colmax', parseInt(object.nowcol) + (parseInt($(this).attr('colspan')) || 1) - 1);
          if ($(tr).attr('row') == undefined) $(tr).attr('row', object.nowrow);
        });
      $(tr).attr(
        'rowmax',
        Math.max.apply(
          null,
          $(tr)
            .find('td')
            .map(function() {
              return parseInt($(this).attr('rowmax'));
            })
        )
      );
    });
  return kekka;
}

/*
 *日付の差分日数を返却します。
 */
/**
 *
 * @param {Date} date1
 * @param {Date} date2
 * @returns
 */
function getDiff(date1, date2) {
  // getTimeメソッドで経過ミリ秒を取得し、２つの日付の差を求める
  var msDiff = date2.getTime() - date1.getTime();

  // 求めた差分（ミリ秒）を日付へ変換します（経過ミリ秒÷(1000ミリ秒×60秒×60分×24時間)。端数切り捨て）
  var daysDiff = Math.floor(msDiff / (1000 * 60 * 60 * 24));

  return daysDiff;
}

//JSON形式かどうか判定
function isJSON(arg) {
  arg = typeof arg === 'function' ? arg() : arg;
  if (typeof arg !== 'string') {
    return false;
  }
  try {
    arg = !JSON ? eval('(' + arg + ')') : JSON.parse(arg);
    return true;
  } catch (e) {
    return false;
  }
}

function student_search(name) {
  chrome.runtime.sendMessage({
    opennetzback:
      '/netz/netz1/student_list_head.aspx?syori=' +
      encodeURIComponent(
        JSON.stringify([
          ['dummy'],
          ['select[name=tenpo_cd]', 'val', ''],
          ['select[name=jyotai_cb]', 'val', 'all'],
          ['input[name=student_kt]', 'val', name],
          ['input[name=b_submit]', 'click'],
          ['close', 'on']
        ])
      )
  });
}

/**
 *
 * @param {string} url
 * @param {*} dat
 * @param {function} callback 第一引数に返ってきたデータが入る
 */
function doPost(url, dat, callback) {
  chrome.runtime.sendMessage({
    doPost: {
      url: url,
      dat: dat,
      callback: callback
    }
  });
}

/**
 *
 * @param {string} url
 * @param {*} dat
 * @param {function} callback 第一引数に返ってきたデータが入る
 */
function doGet(url, dat, callback) {
  chrome.runtime.sendMessage(
    {
      doGet: {
        url: url,
        dat: dat || {},
        callback: callback
      }
    },
    function(response) {
      console.log(response);
      callback.apply(response);
    }
  );
}

/**
 * [autokanren description]
 * @param  {string} student_cd   [description]
 * @param  {string} teacher_cd   [description]
 * @return {void}              [description]
 */
//${NX.CONST.host}/tehai/kanren_input.aspx?teacher_cd=130426&student_cd=385556
function autokanren(student_cd, teacher_cd) {
  chrome.runtime.sendMessage({
    opennetzback: `/netz/netz1/tehai/kanren_input.aspx?${$.param({
      teacher_cd: teacher_cd,
      student_cd: student_cd,
      syori: JSON.stringify([['input[value="　登録　"]', 'click']])
    })}`
  });
}

/**
 *
 * @param {JQuery} td
 */
function Yoteidata(td) {
  var col_to_time = function(col, dateobject) {
    return new Date(dateobject.getFullYear(), dateobject.getMonth(), dateobject.getDate(), 9, col * 5);
  };
  var date = new Date($('input[name=input_dt]').val() || getStrBetween($(td).attr('ondblclick'), "'", "'"));
  var beforetd = $(td).prevAll('td[colspan],td[ondblclick]');
  var sumall_beforecol = 0;
  $(beforetd).each(function() {
    sumall_beforecol += parseInt($(this).attr('colspan') || 1);
  });
  this.times = {};
  this.times.starttime = col_to_time(sumall_beforecol, date);
  this.times.endtime = col_to_time(sumall_beforecol + parseInt($(td).attr('colspan') || 1), date);
  console.log(this.times);
}
Yoteidata.prototype = {
  getTime: function() {
    return this.times;
  }
};
/**
 * 新しい予定を入れる
 * @param  {string} tanto_cd        [description]
 * @param  {Date} [starttimeobject] [description]
 * @param  {Date} [endtimeobject]   [description]
 * @param  {Date} [date]
 * @param  {string} [yotei_cb]        [description]
 * @param  {string} yotei_nm        [description]
 * @param  {string} basho_nm        [description]
 * @param  {boolean} submit          [ここがtrueなら自動送信]
 * @param  {IframeMaker} [iframemaker]
 * @return {void}                 [description]
 */
function newsyainSchedule(tanto_cd, starttimeobject, endtimeobject, date, yotei_cb, yotei_nm, basho_nm, submit = false, iframemaker) {
  var array = [];
  if (starttimeobject) array.push(['#s_tm', 'val', timecolon(starttimeobject)]);
  if (endtimeobject) array.push(['#e_tm', 'val', timecolon(endtimeobject)]);
  if (date) array.push(['#input_dt', !date || 'val', date]);
  if (yotei_cb) array.push(['select[name=yotei_cb]', 'val', yotei_cb || 1]);
  if (yotei_nm) array.push(['input[name=yotei_nm]', 'val', yotei_nm || '']);
  if (basho_nm) array.push(['input[name=basho_nm]', 'val', basho_nm || '']);
  if (submit) array.push(['input[name=b_submit]', !submit || 'click']);
  array.push(['dummy', 'click', 'nextpage']);
  if (iframemaker == undefined) array.push(['close']);
  else array.push(['closeiframe']);
  if (iframemaker == undefined) {
    window.open(
      `${NX.CONST.host}/schedule/yotei_input.aspx?${$.param({
        input_dt: dateslash(starttimeobject),
        tanto_cd: tanto_cd,
        syori: JSON.stringify(array)
      })}`
    );
  } else {
    iframemaker.openurl(
      `${NX.CONST.host}/schedule/yotei_input.aspx?${$.param({
        input_dt: dateslash(starttimeobject),
        tanto_cd: tanto_cd,
        syori: JSON.stringify(array)
      })}`
    );
  }
}
//newsyainSchedule("000248",new Date(),new Date(new Dateday().getTime()+1000*5*60),"2019/10/08","e","月謝請求","南大分",false);
/**
 * [Rightdragger 右クリックしたときのobjectはthis.startobjectとthis.endobjectで取得可能]
 * @param {JQuery} jqueryobjects [description]
 * @param {Function} startcallback [description]
 * @param {Function} endcallback   [description]
 */
function Rightdragger(jqueryobjects, startcallback, endcallback) {
  var _this = this;
  if (jqueryobjects instanceof jQuery) {
    $(jqueryobjects).on('mousedown', function(e) {
      this.startobject = this;
      if (e.which == 3) startcallback.call(Object.assign(_this, this));
    });
    $(jqueryobjects).on('mouseup', function(e) {
      this.endobject = this;
      if (e.which == 3) endcallback.call(Object.assign(_this, this));
      if (!$(_this.startobject).is(this.endobject)) e.preventDefault();
    });
    $(jqueryobjects).on('contextmenu', function() {
      return false;
    });
  } else {
    $(document).on('mousedown', jqueryobjects, function(e) {
      this.startobject = this;
      if (e.which == 3) startcallback.call(Object.assign(_this, this));
    });
    $(document).on('mouseup', jqueryobjects, function(e) {
      this.endobject = this;
      if (e.which == 3) endcallback.call(Object.assign(_this, this));
      if (!$(_this.startobject).is(this.endobject)) e.preventDefault();
    });
    $(document).on('contextmenu', jqueryobjects, function() {
      return false;
    });
  }
}

/**
 *
 * @param {Array<string>} student_cdArray
 * @param {boolean} newpage
 * @returns
 */
function makeMendanrirekiDiv(student_cdArray, newpage = true) {
  var div = $('<div/>');
  var seito_info = new seito_info_class();
  var storagename = 'mendanrireki';
  var saveobject = JSON.parse(localStorage.getItem(storagename) || '{}');
  var seito_info = new seito_info_class();
  var tablehead = getTableHead($('table'), 0);
  student_cdArray.forEach(function(student_cd) {
    var student = seito_info.search('生徒NO', student_cd);
    var student_name = student['生徒名'];
    var school = student['学校'];
    var grade = student['学年'];
    if (saveobject[student_cd] != undefined) {
      var table = $('<table></table>')
        .append(
          $('<tr/>')
            .css('border', '1px #808080 solid')
            .html('生徒名：' + student_name + '<br>' + '学校　：' + school + '<br>' + '学年　：' + grade + '<br>')
        )
        .append(
          $('<tr/>')
            .css('border', '1px #808080 solid')
            .html(saveobject[student_cd].replace(/\n/g, '<br>'))
        )
        .css('border', '1px #808080 solid')
        .css('margin-left', '70px')
        .appendTo(div);
      if (newpage) $(table).css('page-break-after', 'always');
    }
    if (!newpage) $(div).css('page-break-after', 'always');
  });
  return $(div);
}

//目に見えるselect,input,textarea,checkboxをコピーする
function inputselectcopy() {
  var ret = {};
  $('input[type="text"],input[type="checkbox"],input[type="radio"]:checked,select,textarea').each(function() {
    ret[$(this).attr('name')] = $(this).val();
  });
  return ret;
}

/**
 * key:dataみたいな形式
 * @param {Object<string,string>} objectdata
 */
function inputselectpaste(objectdata) {
  for (var key in objectdata) {
    let jqueryobject = $(`[name=${key}]`);
    if ($(jqueryobject).prop('tagName') == 'input' && $(jqueryobject).attr('name') == 'radio')
      $(jqueryobject)
        .filter(`[value=${objectdata[key]}]`)
        .val();
    else $(jqueryobject).val(objectdata[key]);
  }
}
/**
 * 別のタブにデータを送る、返り値は保存したデータ
 * @param {string} url
 * @param {*} data
 * @param {boolean} onlyfirsttab 最初のタブだけにデータを送るか
 * @return {Promise<*>}
 */
async function sendDatatoOthertab(url, data, onlyfirsttab = false) {
  return new Promise((resolve, reject) => {
    console.log(url, data);
    chrome.runtime.sendMessage(
      {
        sendDatatoOtherTab: {
          url: url,
          data: data,
          onlyfirsttab: onlyfirsttab
        }
      },
      function(response) {
        console.log('saved', data);
        resolve(data);
      }
    );
  });
}
/**
 * NMのローカルストレージにデータを保存する。Object、Arrayならデータを追加、それ以外ならデータの上書き
 * @param {string} storagename localStorageの名前
 * @param {*} savedata 保存するデータ
 * @param {boolean} deepcopy ディープコピーをするかどうか
 * @return {Promise<*>} 保存したデータを返す
 */
async function localStorageSaverSync_old(storagename, savedata, deepcopy = false) {
  return new Promise(async (resolve, reject) => {
    console.log('SendSaveData', storagename, savedata);
    let returndata = await sendDatatoOthertab(
      `${NX.CONST.host}/index1.html`,
      {
        id: 'localStorageSaverSync',
        data: {
          storagename: storagename,
          savedata: savedata,
          deepcopy: deepcopy
        }
      },
      true
    );
    resolve(returndata.data.savedata);
  });
}
/**
 * menu.edu-netz.comからlocalStorageを読み込んでくる
 * @param {string} storagename
 */
async function localStorageLoader_old(storagename) {
  return new Promise((resolve, reject) => {
    let listener = function(message, sender, sendResponse) {
      console.log(message);
      switch (message.id) {
        case 'localStorageLoaderReceiver': {
          resolve(message.data);
          chrome.runtime.onMessage.removeEventListener(listener);
          break;
        }
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    sendDatatoOthertab(
      `${NX.CONST.host}/index1.html`,
      {
        id: 'localStorageLoaderSender',
        data: {
          storagename: storagename,
          fromurl: location.href
        }
      },
      true
    );
  });
}

/**
 * atamaPlusIDを送る
 * @param {{student_cd_forAtamaPlus:"netzs000000",student_kg:"ネッツ太郎",student_kt:"ネッツタロウ",grade:"中１",gakkou_nm:"ネッツ中"}} data
 */
function setatamaPlusID(data) {
  sendDatatoOthertab('https://api.atama.plus/portal/organizations/*/contracts', {
    id: 'setatamaPlusID',
    data: data
  });
}
/**
 * tableをObjectに変換する
 * @param {JQuery} tableobj 変換するtableのグループ。$('table')がおすすめ。
 * @param {[number]} treqs 何列目のどういうデータをObjectにするか
 * @param {number} [headnum=0] tableheadが何番目か
 * @param {string||[string]} [addtrattrs] trの指定の属性も追加する。undefinedなら無視される
 */
function maketrObjectfromtable(tableobj, treqs, headnum = 0, addtrattrs = []) {
  if (!Array.isArray(addtrattrs)) addtrattrs = [addtrattrs];
  //getTableHeadだと{生徒名:1とかなので}、{1:生徒名がほしい}
  var tableheadnum = Object.fromEntries(Object.entries(getTableHead($(tableobj), headnum)).map(([key, val]) => [val, key]));
  return $(tableobj)
    .find(`tr:gt(${headnum})`)
    .map((index, element) => {
      var obj = {};
      treqs.forEach(i => {
        console.log(i);
        obj[tableheadnum[i]] = $(element)
          .find('td')
          .eq(i)
          .text();
      });
      addtrattrs.forEach(addtrattr => {
        obj[addtrattr] = $(element).attr(addtrattr);
      });
      return obj;
    });
}

/**
 * パラメータを持ったウィンドウを開く
 * @param {string} url 開くURL
 * @param {{}} data パラメータ
 */
function windowopenWithpar(url, data = {}) {
  window.open(`${url}?${$.param(data)}`);
}

/**
 *  ２つのObjectが一緒ならtrueを返す
 * @param {Object<*,*>} a
 * @param {Object<*,*>} b
 * @returns
 */
function objectEquals(a, b) {
  if (a === b) {
    // 同一インスタンスならtrueを返す
    return true;
  }

  // 比較対象双方のキー配列を取得する（順番保証のためソートをかける）
  var aKeys = Object.keys(a).sort();
  var bKeys = Object.keys(b).sort();

  // 比較対象同士のキー配列を比較する
  if (aKeys.toString() !== bKeys.toString()) {
    // キーが違う場合はfalse
    return false;
  }

  // 値をすべて調べる。
  var wrongIndex = aKeys.findIndex(function(value) {
    // 注意！これは等価演算子で正常に比較できるもののみを対象としています。
    // つまり、ネストされたObjectやArrayなどには対応していないことに注意してください。
    return a[value] !== b[value];
  });

  // 合致しないvalueがなければ、trueを返す。
  return wrongIndex === -1;
}

class MakeAtamaLinks {
  constructor() {
    /**@type {Object<string,string>} */
    this.list = JSON.parse(localStorage.getItem('atamalinks') || '{}');
  }
  static saveAtamaLinks() {
    var list = {};
    $('.table.table-hover')
      .find('a')
      .each(function() {
        var kousha = $(this)
          .text()
          .replace(/1対1ネッツ_/, '');
        var link = `https://api.atama.plus${$(this).attr('href')}`;
        list[kousha] = link;
      });
    localStorageSaverSync('atamalinks', list);
  }
  /**
   *
   * @param {string} text
   */
  window_open(text) {
    if (this.list[text] != null) {
      window.open(this.list[text]);
    }
  }
  all_links() {
    var _this = this;
    $(document).on('contextmenu', 'td', function() {
      _this.window_open(
        $(this)
          .text()
          .trim()
      );
    });
    /*var _this = this;
    for (var key in this.list) {
      $(td).each(function() {
        if ($(this).text() != key) return true;
        $(this).on('contextmenu', function() {
          window.open(_this.list[$(this).text()]);
        });
      });
    }*/
  }
}
/**
 * ページ上でscriptを実行する
 * @param {string} script
 */
function fireonpage(script) {
  /*$(`<script type="text/javascript">${script}</script>`)
    .appendTo('body')
    .remove();*/
  $(`<input type="button" onclick="${script}">`)
    .appendTo('body')
    .trigger('click')
    .remove();
}
/**
 *
 * @param {string} text
 * @returns {string}
 */
function netzencodeURIComponent(text) {
  return Encoding.urlEncode(
    Encoding.convert(Encoding.stringToCode(text), {
      to: 'SJIS',
      from: 'UNICODE'
    })
  );
}


/**
 *
 * @param {string} student_cd
 * @return {Promise<string>}
 */
async function gettehai_cd(student_cd) {
  /**@type {string} */
  let html = await new NetzButtonsofseito(student_cd, null, '').gethtml('tehaij');
  if ($(html).find('input[value="手配票を開く"]').length == 0) throw Error('tehai_cdがありません');
  return $(html)
    .find('input[value="手配票を開く"]')
    .eq(0)
    .attr('name')
    ?.replace('b_open', '')
    .toString();
}
