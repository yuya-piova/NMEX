window.addEventListener('keydown', function(e) {
  if (e.keyCode == 120){
    var text = window.getSelection().toString();
    //if (text.length > 0) {　右クリックメニューに応用する？
    //  chrome.extension.sendMessage({ text: text }, function(response) {});
    //}
    
    var seito_cdinfo_invers = JSON.parse(localStorage.getItem("seito_cdinfo_invers"))
    var seitoinfo = seito_cdinfo_invers[text]["cd"]
    alert(seitoinfo);
  }
  //alert("selectedText");
}, false);