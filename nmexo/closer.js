$(function() {
  var pal = getparameter();
  //パラメータにclose=onを持っていたら閉じる
  if (pal.close == 'on' || sessionStorage.getItem('close') == 'on') {
    setTimeout(function() {
      myclosetab();
    }, 500);
  }

  function getparameter() {
    var arg = {};
    var pair = location.search.substring(1).split('&');
    for (var i = 0; pair[i]; i++) {
      var kv = pair[i].split('=');
      arg[kv[0]] = kv[1];
    }
    return arg;
  }
});
function myclosetab() {
  if (window == window.parent) {
    chrome.runtime.sendMessage({ closemytab: 'closemytab' });
  } else {
    $('iframe', parent.document).remove();
  }
}
function mycloseiframe() {
  $('iframe', parent.document).remove();
}
