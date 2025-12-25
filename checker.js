var CheckerJS = CheckerJS || {};

//オブジェクト作成
//pathnameにpathnameを
//checkにチェック内容を走らせる
//palにその時のURLパラメータ

CheckerJS.tenpo_shido_kiroku_list = {
  time: 60,
  pathname: '/netz/netz1/kanren/tenpo_shido_kiroku_list.aspx',
  pal: {
    from_dt: dateslash(afterdays(dt, -7)),
    to_dt: dateslash(afterdays(dt, -1)),
    tenpo_cd: myprofiles.getone({ mybase: 4401 })
  },
  check: function() {
    var table = $('table:contains("日付")');
    var tablehead = gettableHead(table, 0);
    var kekka = {};
    var date;
    $(table)
      .find('tr')
      .each(function(e) {
        if (e == 0) return true;
        if ($(this).find('input[name=b_check]').length == 0) return true;
        date = getstrDate(
          $(this)
            .find('td')
            .eq(tablehead['日付'])
            .text()
            .substr(0, 5),
          'mm/dd'
        );
        kekka[date.getTime()] = kekka[date.getTime()] || 0;
        if (
          $(this)
            .find('td')
            .eq(tablehead['CH'])
            .text() == ''
        ) {
          kekka[date.getTime()]++;
        }
        console.log(kekka, date, date.getTime());
      });
    var NGs = false;
    for (var key in kekka) {
      DailyScore.setScore(new Date(parseInt(key)), 'micheck', kekka[key]);
      if (kekka[key] != 0) NGs = true;
    }
    if (NGs) netznotification('micheck', '指導報告未チェックがあります');
  }
};

CheckerJS.clock = 0;
CheckerJS.timerSet = function() {
  //1分毎にタイマーを進める
  setInterval(function() {
    CheckerJS.clock++;
    CheckerJS.timecheckAll();
  }, 60 * 1000);
};
CheckerJS.timecheck = function(key) {
  clock = CheckerJS.clock;
  if (CheckerJS[key].pathname) {
    //時間取得
    var time = CheckerJS[key].time || 60;
    if (clock % time == 0) {
      CheckerOne(key);
    }
  }
};
CheckerJS.timecheckAll = function() {
  if (myprofiles.getone({ nonotification: 1 }) == 0) {
    for (var key in CheckerJS) {
      CheckerJS.timecheck(key);
    }
  }
};

var CheckerAll = function() {
  //nonotificationがONなら中止
  if (myprofiles.getone({ nonotification: 1 }) == 0) {
    for (var key in CheckerJS) {
      CheckerOne(key);
    }
  }
};

var CheckerOne = function(key) {
  var pal = '';
  console.log(`CheckOne:${key}`);
  if ($.isPlainObject(CheckerJS[key].pal)) {
    for (var palkey in CheckerJS[key].pal) {
      pal = pal + '&' + palkey + '=' + CheckerJS[key].pal[palkey];
    }
  }
  if (CheckerJS[key].pathname) {
    chrome.runtime.sendMessage({
      opennetzback: CheckerJS[key].pathname + '?checker=on&close=on' + pal
    });
  }
};

function mslashd(dateobj) {
  return dateobj.getMonth() + 1 + '/' + dateobj.getDate();
}

DailyScore = {
  loadScore: function() {
    this.dailyscore = JSON.parse(localStorage.getItem('dailyscore')) || {};
    return this.dailyscore;
  },
  saveScore: function(dailyscore) {
    localStorage.setItem('dailyscore', JSON.stringify(dailyscore) || {});
  },
  getScore: function() {
    var kekka = {};
    for (var key in this.dailyscore) {
      kekka[key] = array2object(this.dailyscore, this.objectname);
    }
    return kekka;
  },
  setScore: function(dateobj, name, score) {
    var nowscore = this.loadScore();
    var setdate = mslashd(dateobj);
    nowscore[setdate] = nowscore[setdate] || {};
    nowscore[setdate][name] = score;
    this.saveScore(nowscore);
  },
  getSeries: function(name, daycount) {
    var nowscore = this.loadScore();
    var setdate;
    var resultarray = [];
    for (i = daycount - 1; i >= 0; i--) {
      setdate = mslashd(afterdays(dttomorrow, -1 * i));
      resultarray.push((nowscore[setdate] || {})[name] || 0);
    }
    return resultarray;
  },
  ///////////////////////////////////////////////設定
  setpurpose: function(name, purpose) {
    DailyScore[name] = DailyScore[name] || purpose;
  },
  getpurpoe: function(name) {
    return DailyScore.purpose[name];
  },
  purpose: {}
};
