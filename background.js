/*global chrome */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  console.log('request', request, 'sender', sender);
  if (request.nof != '' && request.nof != undefined) {
    chrome.notifications.create(
      'id1',
      {
        type: 'basic',
        iconUrl: 'icon19.png',
        title: 'お知らせ',
        message: '新しい' + request.nof + 'があります。',
        priority: 0
      },
      function() {}
    );
    //chrome.browserAction.setBadgeText({text:request.nof});
  }
  if (request.alarttime == 'alarttime') {
    chrome.notifications.create(
      'id2',
      {
        type: 'basic',
        iconUrl: 'icon19.png',
        title: 'お知らせ',
        message: 'リマインダーの時間です。',
        priority: 0
      },
      function() {}
    );
  }
  if (request.outofdatetask != '' && request.outofdatetask != undefined) {
    chrome.notifications.create(
      'id3',
      {
        type: 'basic',
        iconUrl: 'icon19.png',
        title: 'お知らせ',
        message: request.outofdatetask,
        priority: 0
      },
      function() {}
    );
  }
  if (request.nof != undefined && request.nof != '') {
    chrome.notifications.create(
      request.notificationid,
      {
        type: 'basic',
        iconUrl: 'icon19.png',
        title: request.noftitle || 'お知らせ',
        message: request.nof,
        priority: 0
      },
      function() {}
    );
  }
  if (request.opennetzback != undefined) {
    chrome.tabs
      .create({
        url: 'https://menu.edu-netz.com' + request.opennetzback,
        active: false
      })
      .catch(function(e) {
        console.log(e.message);
      });
  }
  if (request.opennetzbackEx != undefined) {
    chrome.tabs
      .create({
        url: request.opennetzbackEx,
        active: false
      })
      .catch(function(e) {
        console.log(e.message);
      });
  }
  if (request.openatamaback != undefined) {
    chrome.tabs
      .create({
        url: 'https://api.atama.plus' + request.openatamaback,
        active: false
      })
      .catch(function(e) {
        console.log(e.message);
      });
  }
  if (request.closetab != undefined) {
    chrome.tabs.query({ windowId: null }, function(tabs) {
      for (var i = 0, len = tabs.length; i < len; i++) {
        var tab = tabs[i];
        if (tab.url == request.closetab) {
          chrome.tabs.remove(tab.id);
        }
      }
    });
  }
  if (request.startexe != undefined) {
    console.log('test');
    var port = chrome.runtime.connectNative(request.startexe);
    console.log(port);
    port.postMessage();
  }
  if (request.closemytab != undefined) {
    console.log(sender.tab.id);
    chrome.tabs.remove(sender.tab.id);
    //完了したらその事実を
  }
  if (request.doPost != undefined) {
    if (request.doPost.url == undefined) {
      console.log('doPost.urlが未定義');
      return null;
    }
    if (request.doPost.dat == undefined) {
      console.log('doPost.datが未定義');
      return null;
    }
    const method = 'POST';
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
    const body = request.doPost.dat;
    fetch(request.doPost.url, { method, headers, body })
      .then(function(e) {
        console.log('success');
        console.log(e);
        if (request.doPost.callback != undefined) request.doPost.callback(e);
      })
      .catch(function(e) {
        console.log('failed');
        console.log(e);
      });
    return true;
  }
  if (request.doGet != undefined) {
    if (request.doGet.url == undefined) {
      console.log('doGet.urlが未定義');
      return null;
    }
    fetch(request.doGet.url)
      .then(function(e) {
        console.log('success');
        console.log(e);
        if (request.doPost.callback != undefined) request.doPost.callback(e);
      })
      .catch(function(e) {
        console.log('failed');
        console.log(e);
      });
    return true;
  }
  /**
   *
   * @param {number} tabid
   * @param {*} data
   */
  let sendTotabdata = function(tabid, data) {
    chrome.tabs.sendMessage(tabid, data, null, function(response) {
      console.log(response);
      sendResponse(response);
    });
  };
  /**
   * sendDatatoOtherTab = {url:url,data:data}
   */
  if (request.sendDatatoOtherTab != undefined) {
    console.log(request.sendDatatoOtherTab);
    chrome.tabs.query({ url: request.sendDatatoOtherTab.url }, function(result) {
      console.log('送信先', result);
      if (request.sendDatatoOtherTab.onlyfirsttab == false)
        result.forEach(function(tab) {
          sendTotabdata(tab.id, request.sendDatatoOtherTab.data);
        });
      else sendTotabdata(result[0].id, request.sendDatatoOtherTab.data);
    });
  }
  //var notification = window.webkitNotifications.createNotification("icon19.png", "通知", "新着メッセージがあります。");
  //notification.show();
});
const blockedUrls = [
  'https://menu.edu-netz.com/netz/netz1/closewindow2.html',
  'https://menu2.edu-netz.com/netz/netz1/closewindow2.html',
  'https://menu.edu-netz.com/netz/netz1/tehai/shido_furikae_input_save_utf8.aspx'
];
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    for (const url of blockedUrls) {
      if (tab.url && tab.url.startsWith(url)) {
        chrome.tabs.remove(tabId);
        break;
      }
    }
    /*
    switch (tab.url) {
      case 'https://menu.edu-netz.com/netz/netz1/index1.html':
        break;
    }
    console.log(tabId);
    console.log(changeInfo);
    console.log(tab);
    */
  }
});
/*
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'ctxMenu_menus',
    title: 'menus',
    type: 'normal',
    contexts: ['all']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  switch (info.menuItemId) {
    case 'ctxMenu_menus':
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: ctxMenu_menus
      });
      break;
  }
});

function ctxMenu_menus() {
  //http://var.blog.jp/archives/52377390.html
  //chrome.tabs.sendMessageでcontent script へメッセージ送信ができる
  //https://github.com/1000ch/chrome-extension-hands-on/wiki/3.2.%E3%83%96%E3%83%83%E3%82%AF%E3%83%9E%E3%83%BC%E3%82%AF%E3%81%95%E3%82%8C%E3%81%9F%E3%82%89ContentScript%E3%81%AB%E4%BC%9D%E3%81%88%E3%82%8B
  //現在タブも取得できる？
  var text = window.getSelection().toString();
  alert(text);
  //if (text.length > 0) { 右クリックメニューに応用する？
  //  chrome.extension.sendMessage({ text: text }, function(response) {});
  //}
}
*/
