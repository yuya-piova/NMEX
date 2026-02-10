///<reference path="./nmexo.js"/>
///<reference path="./nmexog.js"/>
///<reference path="../nmext/nmextg.js"/>
///<reference path="../dts/JQuery.d.ts"/>
///<reference path="../dts/jqueryui.d.ts"/>
///<reference path="../dts/global.d.ts"/>
///<reference path="../dts/chrome.d.ts"/>

console.log('nmexof');

//*********************************************************************
/**@type {Object<string,Object<string,Function>>} */
var FUNCTION_O;
FUNCTION_O = FUNCTION_O || {};

FUNCTION_O.all_page = {};

FUNCTION_O.all_page.autoNormalmode = function() {
  if (localStorage.specialname !== undefined) {
    if (location.pathname == '/netz/netz1/index_head.aspx' && $('input[name=b_kintai]').length != 0) {
      let specialnamemode = false,
        specialname = JSON.parse(localStorage.specialname);
      for (let i = 0; i < specialname.length; i++) {
        if (
          $('body')
            .text()
            .indexOf(specialname[i]) != -1
        )
          specialnamemode = true;
      }
      if (specialnamemode == false) myprofiles.save({ isSpecialEnabled: 0 });
    }
  }
};

FUNCTION_O.all_page.loadtemplate = function() {
  $('<div/>', { name: 'template' })
    .appendTo('body')
    .load(chrome.runtime.getURL('templates.html'));
};

FUNCTION_O.all_page.tdtips = function() {
  $('td').each(function() {
    const text = $(this).text();
    const tenpo_cd = new NXBase(text).getCd();
    if (tenpo_cd) $(this).attr('title', tenpo_cd);
  });
};

FUNCTION_O.all_page.popmenu = function() {
  /*
  eval使用不可
  使う場合はmanifestファイルに以下を追記
    "content_security_policy": {
    "extension_pages": "script-src 'self' 'unsafe-eval'; object-src 'self'"
    }

  popmenuo_PB.setContentFunction(function() {
    $('[swipeobject=1]').css('font-weight', 'bold');
    var consoleinput = $('<input>', {
      type: 'text',
      css: { width: '200px' },
      placeholder: 'Javascript console',
      on: {
        contextmenu: function() {
          const inputFunction = new Function($(this).val());
          const rtn = inputFunction();
          $(this).val(rtn);
          console.log(rtn);
          return false;
        }
      }
    }).appendTo(this);
    $(consoleinput).focus();
  });
  */
  popmenuo_F2.setContentFunction(function() {
    //insertメニューがあればその旨の通知
    if (popmenuo_ins.hasFunction())
      $('<div/>', { text: 'Insert有' })
        .appendTo(this)
        .after('<hr>');
  });
  popmenuo_F2_mode.setContentFunction(function() {
    let modediv = $('<div/>').appendTo(this);
    //アドイン切り替え
    const on_offnumber = [
      { title: 'OFF', value: 0 },
      { title: 'ON', value: 1 }
    ];

    myprofiles.maketogglebutton('NMEXアドイン', 'isSpecialEnabled', on_offnumber).appendTo(modediv);
    $('<br>').appendTo(modediv);

    //NMモード切り替え
    const NMmodes = [
      { title: '通常教室', value: 'normal' },
      { title: '本部', value: 'honbu' },
      { title: 'オンライン', value: 'online' }
    ];
    myprofiles.maketogglebutton('部門設定', 'NMmode', NMmodes).appendTo(modediv);
    $('<br>').appendTo(modediv);
    //全社⇔エリア切り替え
    const Area_mode = [
      { title: '全社', value: 0 },
      { title: 'エリア', value: 1 }
    ];
    myprofiles.maketogglebutton('教室フィルター', 'isAreaMode', Area_mode).appendTo(modediv);

    $('<hr>').appendTo($(modediv));

    $('<button>', {
      type: 'button',
      text: 'LS初期化',
      on: {
        click: () => {
          const teacher_cd = prompt('社員番号を入れてください');
          if (!teacher_cd) {
            PX_Toast('入力がキャンセルされました');
            popmenut_F2.closemenu();
            return;
          }

          const lsData = NX.LS[teacher_cd];
          if (lsData && typeof lsData === 'object') {
            Object.entries(lsData).forEach(([key, value]) => {
              localStorage.setItem(key, JSON.stringify(value));
            });
            PX_Toast('初期化完了');
          } else {
            PX_Toast('社員データが存在しません');
          }

          popmenut_F2.closemenu();
        }
      }
    }).appendTo(this);
  });
};

/* リファクタリング済　念の為保存
FUNCTION_O.all_page.syori = function() {
  //一括処理部分
  //sessionStorage.syoriに入れる。
  //["selecter","val","値"]			代入
  //["selecter","click","nextpage"]	クリック(ページ遷移あり)
  //["selecter","click"]				クリック(ページ遷移なし)

  let syori;
  var pal = getparameter();
  if (sessionStorage.getItem('syori') != null) syori = JSON.parse(sessionStorage.syori);
  if (pal.syori != null) syori = JSON.parse(decodeURIComponent(pal.syori));
  console.log('syori', location.pathname, syori);
  if (syori != undefined) {
    var maxlength = syori.length;
    for (var i = 0; i < maxlength; i++) {
      var thissyori = syori['0'];
      console.log(thissyori);
      syori.shift();
      switch (thissyori['1']) {
        case 'val':
          $(thissyori['0']).val(thissyori['2']);
          $(thissyori['0']).change();
          break;
        case 'click':
          $(thissyori['0']).click();
          break;
        case '':
          break;
        case 'text':
          $(thissyori['0']).text(thissyori['2']);
      }
      if (thissyori['1'] == 'click' && thissyori['2'] == 'nextpage') {
        break;
      }
      if (thissyori['0'] == 'close') {
        myclosetab();
        break;
      }
      if (thissyori['0'] == 'closeiframe') {
        mycloseiframe();
        break;
      }
    }
    sessionStorage.setItem('syori', JSON.stringify(syori));
  }
};
*/

FUNCTION_O.all_page.syori = function() {
  //一括処理
  //sessionStorage.syoriに入れる。
  //["selecter","val","値"]			代入
  //["selecter","click","nextpage"]	クリック(ページ遷移あり)
  //["selecter","click"]				クリック(ページ遷移なし)
  /** @type {Syori} */
  let syori;
  const pal = getparameter();

  if (sessionStorage.getItem('syori')) syori = JSON.parse(sessionStorage.getItem('syori'));
  if (pal.syori) syori = JSON.parse(decodeURIComponent(pal.syori));

  if (!syori) return;

  while (syori.length > 0) {
    const step = syori[0];
    const [selector, action, value] = step;

    switch (action) {
      case 'val':
        $(selector)
          .val(value)
          .trigger('change');
        break;
      case 'text':
        $(selector).text(value);
        break;
      case 'click':
        $(selector).trigger('click');
        break;
    }

    // ページ遷移を伴う場合一時中断
    if (action === 'click' && value === 'nextpage') break;
    if (selector === 'close') {
      myclosetab();
      break;
    }
    if (selector === 'closeiframe') {
      mycloseiframe();
      break;
    }
    syori.shift();
  }
  sessionStorage.setItem('syori', JSON.stringify(syori));
};

FUNCTION_O.all_page.viewSelectval = function() {
  $('select')
    .on('dblclick', function() {
      console.log($(this).val());
    })
    .valuetooltip();
  $('input').valuetooltip();
};

FUNCTION_O.booth_select_head = {};

FUNCTION_O.booth_select_head.default = function() {
  $('#hyoji_cb2,#select_cb1').prop('checked', true);
};

FUNCTION_O.booth_select_head.changebuttons = function() {
  /*$('input[name="b_today"]').removeAttr("onclick").off("click")
  .on("click",function(){
    $('input[name="input1_dt]').val(dateslash(dt)).change();
  });*/
};

FUNCTION_O.booth_select_head.adddays = function() {
  function setDays(day1, day2) {
    $('input[name=input1_dt]').val(dateslash(day1));
    $('input[name=input2_dt]').val(dateslash(day2));
  }
  $('input[name="b_today"]')
    .swipe('今月', () => setDays(dtstart, dtlast))
    .swipe('来月', () => setDays(dtnxstart, dtnxlast))
    .swipe('今日～今月', () => setDays(dt, dtlast))
    .swipe('今日～翌月', () => setDays(dt, dtnxlast))
    .swipe('今日～講習前', () => setDays(dt, new Date(NX.VAR.koshu_kikan['開始'])))
    .swipe('講習', () => setDays(new Date(NX.VAR.koshu_kikan['開始']), new Date(NX.VAR.koshu_kikan['終了'])))
    .swipe('今日～講習終了', () => setDays(dt, new Date(NX.VAR.koshu_kikan['終了'])))
    .swipe('昨日', () => setDays(dtyesterday, dtyesterday));
};

FUNCTION_O.index_head = {};

FUNCTION_O.index_head.headspan = function() {
  $('input[value=パスワード変更]')
    .after('<span targ="netzreminder" style="display:none;"></span>')
    .on('contextmenu', function() {
      $('[targ="netzreminder"]').toggle();
      return false;
    })
    .on('contextmenu');
};

FUNCTION_O.index_head.reminderbutton = function() {
  $('[targ="netzreminder"]').append('リマインダー<input type="time" name="remindertime" value="' + localStorage.remindertime + '">');
  $('input[name=remindertime]').on('keyup change', function() {
    localStorage.setItem('remindertime', $(this).val());
  });
};

FUNCTION_O.index_menu = {};
FUNCTION_O.index_menu.reloder = function() {
  /*
  //上を更新
  setInterval(function() {
    top.index_h.location.href = `${NX.CONST.host}/index_head.aspx`;
  }, 1000 * 60);
  //問合せ更新
  setInterval(function() {
    if (new Date().getHours() > 8 && new Date().getHours() < 23 && myprofiles.getone({ nonotification: 1 }) == false) {
      chrome.runtime.sendMessage({
        opennetzback: '/netz/netz1/toiawase_list_body.aspx?newcheck=on&close=on&tenpo_cd=m&input_dt1=' + dateslash(dt)
      });
    }
  }, 5 * 1000 * 60);
  */

  //CheckerJSを走らせる
  CheckerJS.timerSet();
};

FUNCTION_O.index_menu.localStorager = function() {
  /**
   * @typedef {Object} localStorageSaverSync
   * @property {string} id
   * @property {Object} data
   * @property {string} data.storagename
   * @property {boolean} data.deepcopy
   * @property {*} data.savedata
   */

  console.log('Listener');
  chrome.runtime.onMessage.addListener(
    /**
     *
     * @param {localStorageSaverSync} message
     * @param {*} sender
     * @param {*} sendResponse
     */
    function(message, sender, sendResponse) {
      console.log(message);
      switch (message.id) {
        case 'localStorageSaverSync':
          console.log('Savestart', message.data.savedata);
          var data = JSON.parse(localStorage.getItem(message.data.storagename));
          if (data === null) data = message.data.savedata;
          else if ($.isPlainObject(message.data.savedata)) {
            if (message.data.deepcopy == true) data = $.extend(true, data, message.data.savedata);
            else data = Object.assign(data, message.data.savedata);
          } else if (Array.isArray(message.data.savedata)) {
            data = message.data.savedata.concat(data);
          } else data = message.data.savedata;
          localStorage.setItem(message.data.storagename, JSON.stringify(data));
          console.log('Saveend', message.data.savedata);
          sendResponse('done');
          break;
        case 'localStorageLoaderSender': {
          /**
           * @type {{storagename:string,fromurl:string}}
           */
          let data = message.data;
          sendDatatoOthertab(data.fromurl, {
            id: 'localStorageLoaderReceiver',
            data: localStorage.getItem(data.storagename)
          });
          break;
        }
      }
    }
  );
};

FUNCTION_O.kintai_yotei_input = {};

FUNCTION_O.kintai_yotei_input.ikkatu = function() {
  /**
   *
   * @param {JQuery<HTMLElement>} tr
   * @param {number} shusha_hour
   * @param {number} shusha_min
   * @param {number} taisha_hour
   * @param {number} taisha_min
   */
  let timeinput = function(tr, shusha_hour, shusha_min, taisha_hour, taisha_min) {
    $(tr)
      .find('input[name^=yotei_tm]')
      .val(`${shusha_hour}:${shusha_min}`);
    $(tr)
      .find('input[name^=t_yotei_tm]')
      .val(`${taisha_hour}:${taisha_min}`);
  };
};

FUNCTION_O.kouza_enshu_teacher_input = {};
FUNCTION_O.kouza_enshu_teacher_input.tracer = function() {
  var table = $('table:contains("人数")');
  var tablecontents = $(table).find('tr:not(:first)');
  var tablehead = getTableHead(table, 0);
  table2arrayspecial($(table));

  var gettrData = function(trObject) {
    return {
      weekday: $(trObject)
        .find('td')
        .eq(tablehead['曜'])
        .text(),
      time: $(trObject)
        .find('td')
        .eq(tablehead['時間'])
        .text(),
      month: getstrDate(
        $(trObject)
          .find('td')
          .eq(tablehead['日'])
          .text(),
        'mm/dd'
      )
    };
  };

  $('<input>', { type: 'checkbox', name: 'tracer' }).appendTo($(tablecontents).find(`td:eq(${tablehead['備考']})`));
  $(document).on('contextmenu', '[name=tracer],[name=ch_dt]', function() {
    var name = $(this).attr('name');
    if (name == 'tracer') $(`[name=${name}]`).prop('checked', false);
    var thistrdata = gettrData($(this).closest('tr'));
    $(tablecontents).each(function() {
      var trdata = gettrData($(this));
      console.log(trdata, thistrdata);
      if (trdata.weekday == thistrdata.weekday && trdata.time == thistrdata.time && trdata.month.getMonth() == thistrdata.month.getMonth())
        $(this)
          .find(`[name=${name}]`)
          .prop('checked', true);
    });
    $(`[name=${name}]`).change();
    return false;
  });
  $(document).on('change', '[name=tracer]', function() {
    $(this)
      .closest('tr')
      .find('input')
      .attr('tracer', $(this).prop('checked'));
  });
  $('input:not([name=tracer])').each(function() {
    var td = $(this).closest('td');
    $(this).attr('col', $(td).attr('col'));
    $(this).netztracer(`[tracer="true"][col="${$(this).attr('col')}"]`);
  });
};

FUNCTION_O.login = {};

FUNCTION_O.login.login = function() {
  //数字のみに変更
  $('input[name=u_id]').isAllNumeric();
  //右クリックログインでisSpecialEnabled解除
  $('input[name=login]').on('contextmenu', function() {
    myprofiles.save({ isSpecialEnabled: 0 });
    $(this).trigger('click');
    return false;
  });
};

FUNCTION_O.login.logout = function() {
  localStorage.removeItem('toiawasenum');
};

FUNCTION_O.schedule_input_check = {};

FUNCTION_O.schedule_input_check.addme = function() {
  if ($('#cb2').prop('checked')) {
    var last = $('table tr:last').clone(true);
    var tablehead = getTableHead($('table'), 0);
    var mybasename = myprofiles.getone({ mybasename: '' });
    var mynumber = myprofiles.getone({ mynumber: '000000' });
    var myname = myprofiles.getone({ myname: '名前がないよ' });
    $(last).appendTo('table');
    last = $('table tr:last');
    var tds = $(last).find('td');
    console.log(tds.eq(0), mynumber, tablehead);
    $(tds)
      .eq(tablehead['教室'])
      .html(mybasename);
    $(tds)
      .eq(tablehead['cd'])
      .html('<a href="javascript:open_sc(\'' + mynumber + '\')">' + mynumber + '</a>');
    $(tds)
      .eq(tablehead['氏名'])
      .text(myname)
      .nextAll()
      .text('');
  }
};

FUNCTION_O.schedule_input_check.popmenu = function() {
  popmenuo_F2.setContentFunction(function() {
    $('<input type="button" value="全エリア結合">')
      .on('click', async function() {
        for (var one of Object.keys(areablocklist.block).map(key => `a${areablocklist.block[key]}`)) {
          console.log(
            `https://menu.edu-netz.com${location.pathname}/?${$.param({
              tenpo_cd: one,
              input1_dt: $('#input1_dt').val(),
              input2_dt: $('#input2_dt').val(),
              input_cb: $('input[name=input_cb]:checked').val()
            })}`
          );
          var data = await $.get(
            `https://menu.edu-netz.com${location.pathname}/?${$.param({
              tenpo_cd: one,
              input1_dt: $('#input1_dt').val(),
              input2_dt: $('#input2_dt').val(),
              input_cb: $('input[name=input_cb]:checked').val()
            })}`
          );
          $(data)
            .find('table')
            .find('tr:gt(1)')
            .appendTo('tbody');
        }
      })
      .appendTo(this);
  });
};

FUNCTION_O.schedule_list = {};

FUNCTION_O.schedule_list.addbuttons = function() {
  $('input[value=今月]').swipe('今日～今月', () => {
    $('#input1_dt').val(dateslash(dt));
    $('#input2_dt').val(dateslash(dtlast));
  });
};

FUNCTION_O.seiseki_list = {};

FUNCTION_O.seiseki_list.showmenu = function() {
  popmenuo_ins.setContentFunction(function() {
    var seisekiManager = new SeisekiManager(
      $('tr > td:contains("合計")')
        .closest('table')
        .eq(1)
    );
    var txt = '';
    for (var i = 0; seisekiManager.geteq(i) != undefined; i++) {
      console.log(i, seisekiManager.geteq(i));
      txt += `${seisekiManager.geteq(i).makeformat()}\n`;
    }
    $('<textarea/>')
      .css('width', '900px')
      .css('height', '200px')
      .css('font-size', '50%')
      .appendTo('body')
      .text(txt);
  });
};

FUNCTION_O.shain_tenpo_list = {};

FUNCTION_O.shain_tenpo_list.default = function() {
  //初期表示以外だったら実施しない
  if ($('select[name=tenpo_cd]').val() != 'z') return;
  $('select[name=tenpo_cd]').val(null);
  $('input[name=b_submit]').trigger('click');
};

FUNCTION_O.shain_yotei = {};

FUNCTION_O.shido_enshu_input = {};

FUNCTION_O.shido_enshu_input.enshuauto = function() {
  $('input[name^=bikou_nm]').on('change', function() {
    if ($(this).val() != '') {
      $(this)
        .closest('tr')
        .find('input[name=add_id]')
        .prop('checked', true);
    } else {
      $(this)
        .closest('tr')
        .find('input[name=add_id]')
        .prop('checked', false);
    }
  });
};

FUNCTION_O.shido_furikae_list_head = {};

FUNCTION_O.shido_furikae_list_head.default = function() {
  $('select[name="tenpo_cd"]').val(mybase);
  $('input[name="b_submit"]').click();
};

FUNCTION_O.shido_kiroku_input = {};

FUNCTION_O.shido_kiroku_input.adddate = function() {
  $('input[value="行追加"]').on('click', function() {
    var par = $(this)
      .closest('tr')
      .prev();
    var month = par.find('input[name^=hw_dt_m]').val();
    var day = par.find('input[name^=hw_dt_d]').val();
    var ndt = afterdays(getstrDate(month + '/' + day, 'mm/dd'), 1);
    var syori = [
      ['input[name^=hw_dt_m]:last', 'val', ndt.getMonth() + 1],
      ['input[name^=hw_dt_d]:last', 'val', ndt.getDate()]
    ];
    sessionStorage.setItem('syori', JSON.stringify(syori));
  });
};

FUNCTION_O.shido_kiroku_input.texttrace = function() {
  $('table:contains("日付") tr td:contains("テキスト")').append('<input type="text" name="textall">一括');
  $('<input type="checkbox" name="traces" checked>')
    .insertAfter('input[name^=hw_text_nm]')
    .on('change', function() {
      var boolean = $(this).prop('checked');
      $(this)
        .parent()
        .find('input[name^=hw_text_nm]')
        .attr('trace', boolean);
    })
    .change();
  $('input[name=textall]').netztracer('input[name^=hw_text_nm][trace=true]');
};

FUNCTION_O.shido_kiroku_input.frames = function() {
  var table = $('td:contains("生徒")').closest('table');
  var name = table
    .find('td:contains("生徒")')
    .next()
    .text();
  var students = new seito_info_class();
  var student_cd = students.search('生徒名', name)['生徒NO'];
  if (student_cd != null) {
    let iframemaker = new IframeMaker('shidoframe', 850, 10);
    let buttons = new NetzButtonsofseito(student_cd, table, iframemaker.getframename(), iframemaker);
    buttons.makebuttons('houkoku', '報', {
      from_dt: dateslash(afterdays(dt, -30)),
      to_dt: dateslash(afterdays(dt, 30))
    });
    buttons.makebuttons('yotei', '予');
    buttons.makebuttons('seisekij', '成');
  }

  $('hr')
    .css('width', 800)
    .css('margin-left', '0px');
};

FUNCTION_O.shido_kiroku_input.showmenu = function() {
  popmenuo_F2.setContentFunction(function() {
    $('<input type="button" name="objectcopier" value="select,textareaなどコピー">')
      .appendTo(this)
      .on('click', function() {
        sessionStorage.setItem('objectcopier', JSON.stringify(inputselectcopy()));
      });
    $('<input type="button" name="objectpaster" value="select,textareaなど貼り付け">')
      .appendTo(this)
      .on('click', function() {
        inputselectpaste(JSON.parse(sessionStorage.getItem('objectcopier')) || {});
      });
  });
};

FUNCTION_O.shido_kiroku_input.savekiroku = function() {
  $('input[name=b_submit]').on('click', function() {
    sessionStorage.setItem('objectcopier', JSON.stringify(inputselectcopy()));
  });
  if (sessionStorage.getItem('objectcopier')) inputselectpaste(JSON.parse(sessionStorage.getItem('objectcopier')) || {});
};

FUNCTION_O.student_renraku_head = {};

FUNCTION_O.student_renraku_head.default = function() {
  if (localStorage.scorechmode != '1' && myprofiles.getone({ mybase: undefined })) {
    $('select[name="tenpo_cd"]').val('m');
    $('#jyotai').prop('checked', true);
    $('select[name="jyotai_cb"]').val(12);
    $('input[value="　表示　"]').trigger('click');
  }
};

FUNCTION_O.student_list_head = {};

FUNCTION_O.student_list_head.default = function() {
  //mybaseが記載されていたら
  if (myprofiles.getone({ mybase: undefined })) {
    var showTokki = myprofiles.getone({ showTokki: 1 });
    $('#info_flg')
      .prop('checked', showTokki)
      .on('click', function() {
        showTokki = $(this).prop('checked') ? 1 : 0;
        myprofiles.save({ showTokki: showTokki });
      });
    $('#gakkou_flg').prop('checked', true);
    //とりあえず担任の指導中を開く。
    //student_ktが入っていたら当てはめてはいけない。
    //でもそれはここで判定できないからsyoriで動作させる。
    $('#jyotai_cb').val('0');
    $('select[name="gakunen_cb"]').val('');
    $('select[name="tenpo_cd"]').val('h');
    $('select[name="menu_cb"]').val('5');

    form1.submit();
  }
};

FUNCTION_O.student_list_body = {};

FUNCTION_O.student_list_body.trim = function() {
  $('select[name^=d]').each(function() {
    $(this).html(
      $(this)
        .html()
        .replace(/(\r|\n)/g, '')
    );
  });
};

FUNCTION_O.student_list_body.setidname = function() {
  $('table tr').each(function(e) {
    var tableindex = getTableHead($('table'), 0);
    if (e != 0) {
      var student_cd = $(this)
        .attr('id')
        .replace(/td/g, '');
      var name = $(this)
        .find('td:eq(' + tableindex['生徒名'] + ')')
        .text();
      var kakko = name.match(/\(.+?\)/);
      if (kakko != null) name = name.substring(0, name.length - kakko[0].length);
      //とりあえずtrのstudent_cdにstudent_cdを振り分ける
      $(this).attr('student_cd', student_cd);
      //seitoinfo用
      $(this).attr('name', name);
    }
  });
};

FUNCTION_O.student_list_body.shoexamdates = function() {
  if (myprofiles.getone({ showexamdates: 0 }) == 1) {
    var tableindex = getTableHead($('table'), 0);
    /**@type {string} */
    let exams = myprofiles.getone({
      exams: myprofilesObject['exams'][0]
    });
    $('table tr').each(function(i) {
      var td = $('<td></td>').insertAfter($(this).find('td:eq(' + tableindex['状態'] + ')'));
      if (i != 0) {
        /**@type {string} */
        var student_cd = $(this).attr('student_cd');
        if (student_cd == undefined) return true;
        /**@type {Object<string,*>} */
        let student_exam = student_exams.getone({ [student_cd]: {} });
        /**
         * @param {string} dataname
         * @return {Date|undefined}
         */
        let makedatainput = function(dataname) {
          let data = student_exam[exams]?.[dataname];
          /**@type {Date|undefined} */
          let date;
          /**@type {string} */
          let valdata;
          if (!isNaN(new Date(data).getTime()) && data != null) {
            date = new ExDate(data);
            valdata = new ExDate(data).as('mm/dd');
          } else valdata = '';

          $('<input>', {
            type: 'text',
            name: `exam${dataname}_${student_cd}`,
            student_cd: student_cd
          })
            .css({ width: '3em' })
            .val(valdata)
            .on('change', function() {
              student_exams.deepsave({
                [student_cd]: { [exams]: { [dataname]: $(this).val() } }
              });
              if ($(this).val().length > 6) $(this).css({ width: '5em' });
              else $(this).css({ width: '3em' });
            })
            .netztracer(`input[name^=exam${dataname}][netzall="true"]`)
            .datepicker()
            .appendTo(td);
          return date;
        };
        makedatainput('from_dt');
        $(td).append('～');
        let todata = makedatainput('to_dt');
        //日付が過去だったらtdを若干灰色にする
        if (typeof todata != 'undefined' && todata.getTime() < new Date().getTime())
          if (student_exams.getallinputted(student_cd, exams)) $(td).addClass('seisekiinputed');
          else $(td).addClass('seisekirequired');

        $('<input>', { type: 'checkbox', name: 'examtracer' })
          .appendTo(td)
          .on('change', function() {
            $(this)
              .closest('td')
              .find('input')
              .attr('netzall', $(this).prop('checked'));
          })
          .on('contextmenu', function() {
            let schoolname = $(this)
              .closest('tr')
              .find('td')
              .eq(tableindex['学校'])
              .text();
            $('tr:not(:first)').each(function() {
              if (
                $(this)
                  .find('td')
                  .eq(tableindex['学校'])
                  .text() == schoolname
              )
                $(this)
                  .find('input[name=examtracer]')
                  .prop('checked', true)
                  .trigger('change');
              else
                $(this)
                  .find('input[name=examtracer]')
                  .prop('checked', false)
                  .trigger('change');
            });
            return false;
          });
        $('<span>')
          .text(`${student_exams.getallinputted(student_cd, exams) ? '●' : '×'}`)
          .appendTo(td);
      } else {
        $(td).html(`テスト日程：${exams}`);
      }
    });
  }
};

FUNCTION_O.student_renraku_rireki_input = {};

FUNCTION_O.student_renraku_rireki_input.youbi = function() {
  $('input[name=next_dt]').setweekday();
  $('input[name=input_dt]').setweekday();
};

FUNCTION_O.teacher_list_head = {};

FUNCTION_O.teacher_list_head.default = function() {
  if (myprofiles.getone({ mybase: undefined })) {
    $('select[name="main_tenpo_cd"]').val('m');
    $('input[name="b_submit"]').click();
  }
};

FUNCTION_O.teacher_list_head.syokitracer = function() {
  if (top.frames.length != 0) $('select[name=menu_cb]').netztracer($('select[name^=d]', top.frames[1].document.body));
};

FUNCTION_O.teacher_select_body = {};

FUNCTION_O.teacher_select_body.nowtab = function() {
  $('input[name=b_select]').on('contextmenu', function() {
    $('form[name=form1]')[0].target = '';
    $(this).click();
    return false;
  });
};

FUNCTION_O.teacher_shido_yotei = {};

FUNCTION_O.teacher_shido_yotei.schedulecheck = function() {
  //TOOO修正予定
  let teacher_cd = $('input[name=teacher_cd]').val();
  let tablehead = getTableHead($('table'));
  let scheduler = Scheduler.getscheduler('teacher_cd', teacher_cd);
  //prettier-ignore
  $('table')
    .find('tr:not(:first)')
    .each(function() {
      const dateStr = $(this).find('input[name=b_edit]').attr('onclick').getStrBetween("'","'",4)
      const date = dateslash(new Date(dateStr));
      const time = $(this).find('td').eq(tablehead['時間']).text();
      if (scheduler.incheck(date, Fromtotime.texttimelist(time)) == false)
        $(this)
          .find('td')
          .eq(tablehead['講師名'])
          .addClass('schedule_ng');
    });
};

FUNCTION_O.yotei = {};

FUNCTION_O.yotei.addYoteibySwipe = function() {
  const { x: mouseX, y: mouseY } = getMousePosition();
  var iframemaker = new IframeMaker('new_syain_yotei', mouseX + 1, mouseY + 1);
  new Rightdragger(
    $('table')
      .find('tr:gt(2)')
      .find('td[colspan],td[ondblclick]'),
    function() {},
    function() {
      iframemaker.movediv(mouseX + 1, mouseY + 1);
      newsyainSchedule(
        getStrBetween($(this.startobject).attr('ondblclick'), "'", "'"),
        new Yoteidata(this.startobject).getTime().starttime,
        new Yoteidata(this.endobject).getTime().endtime,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        iframemaker
      );
      iframemaker.getdivobject().draggable();
    }
  );
};

FUNCTION_O.yotei.default = function() {
  if (
    $('a').length == 0 &&
    $('option[value="' + $('select[name=tenpo_cd]').val() + '"]')
      .text()
      .match(/(会場|×)/) == null
  ) {
    $('input[value="表示更新"]').trigger('click');
  }
};

FUNCTION_O.yotei.float = function() {
  /*popmenuo_ins.setContentFunction(function() {
    var trfirst = $('table').find('tr:first');
    $(trfirst)
      .css('background', 'white')
      .clone(false)
      .insertAfter(trfirst)
      .find('input,select')
      .remove();
    $(trfirst).netznotscroll(1);
    popmenuo_ins.closemenu();
  });*/
};

FUNCTION_O.yotei.popmenu = function() {
  popmenuo_F2.setContentFunction(function() {
    $('<input type="button" value="全エリア結合">')
      .on('click', async function() {
        for (var one of Object.keys(areablocklist.block).map(key => `a${areablocklist.block[key]}`)) {
          let form = $('form[name=form1]').clone(false);
          $(form)
            .find('select[name=tenpo_cd]')
            .val(one);
          var data = await $.get(`${NX.CONST.host}/schedule/yotei.aspx?${$(form).serialize()}`);
          $(data)
            .find('table')
            .find('tr')
            .slice(
              3,
              $(data)
                .find('table')
                .find('tr').length - 2
            )
            .appendTo('tbody');
        }
      })
      .appendTo(this);
  });
};

FUNCTION_O.teian_list_body = {};

FUNCTION_O.teian_list_body.karutehyouji = function() {
  $('input[name=ch_student_cd]').on('contextmenu', function() {
    var student_cd = $(this)
      .closest('tr')
      .find('input[value="開く"]')
      .attr('name')
      .slice(1, 100);
    $(this)
      .closest('table')
      .find('input[name=ch_student_cd]')
      .prop('checked', false);
    $(this)
      .closest('tr')
      .find('input[name=ch_student_cd]')
      .prop('checked', true);
    $('input[name=b_print2]')[0].click();
    return false;
  });
};

FUNCTION_O.teian_list_body.popmenu = function() {
  popmenuo_F2.setContentFunction(function() {
    $('<input type="button" name="addmemo" value="メモ追加">')
      .appendTo(this)
      .on('click', function() {
        var table = $('table:contains("面談予定")');
        var tablehead = getTableHead($(table), 0);
        $(table)
          .find('tr')
          .each(function(e) {
            if (e > 0) {
              var student_cd = $(this).attr('id');
              var td = $(this).find('td:eq(' + tablehead['教室'] + ')');

              $(td).append(
                $('<input type="text" name="memo' + student_cd + '" size ="10">')
                  .appendTo(td)
                  .val(memos.getone({ [student_cd]: '' }))
                  .on('change', function() {
                    memos.save({ [student_cd]: $(this).val() });
                  })
              );
            }
          });
      });
  });
};

FUNCTION_O.tehai_input = {};

FUNCTION_O.tehai_input.osusumelist = function() {
  FUNCTION_O.shido_edit_list.osusumelist();
};

FUNCTION_O.toiawase_list_head = {};

FUNCTION_O.toiawase_list_head.default = function() {
  $('select[name="tenpo_cd"]').val('m');
  $('input[onclick^=dataset2][value=今日]').click();
  $('input[name="b_submit"]').click();
  $('input[onclick^=dataset2][value=指定なし]').click();
};

FUNCTION_O.toiawase_list_head.daybuttons = function() {
  function setToiDays(day1, day2) {
    $('input[name=input_dt1]').val(dateslash(day1));
    $('input[name=input_dt2]').val(dateslash(day2));
  }
  $('input[value="今月"]')
    .swipe('前月', () => setToiDays(dtlmstart, dtlmlast))
    .swipe('去年同月', () => setToiDays(dtlystart, dtlylast))
    .swipe('昨年同月（同日まで）', () => setToiDays(dtlystart, new ExDate().aftermonths(-12)))
    .swipe('去年前月', () => setToiDays(dtlylmstart, dtlylmlast))
    .swipe('前月＋今月', () => setToiDays(dtlmstart, dtlast))
    .swipe('前々月', () => setToiDays(dtblmstart, dtblmlast))
    .swipe('ｷｬﾝﾍﾟｰﾝ', () => setToiDays(new Date(NX.VAR.campaign['開始']), new Date(NX.VAR.campaign['終了'])));
};
