/*global chrome */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('request', request, 'sender', sender);

  // --------------------------------------------------
  // 1. バックグラウンドでタブを開く
  // --------------------------------------------------
  if (request.openTabBack !== undefined) {
    chrome.tabs
      .create({ url: request.openTabBack, active: false })
      .then(() => sendResponse({ status: 'ok' }))
      .catch(e => {
        console.error(e.message);
        sendResponse({ status: 'error', message: e.message });
      });
    return true; // 非同期処理のために必須
  }

  // --------------------------------------------------
  // 2. 指定したURLのタブを閉じる
  // --------------------------------------------------
  if (request.closetab !== undefined) {
    chrome.tabs.query({ windowId: chrome.windows.WINDOW_ID_CURRENT }, tabs => {
      const tabsToRemove = tabs.filter(tab => tab.url === request.closetab).map(tab => tab.id);
      if (tabsToRemove.length > 0) {
        chrome.tabs.remove(tabsToRemove, () => sendResponse({ status: 'ok' }));
      } else {
        sendResponse({ status: 'not_found' });
      }
    });
    return true; // 非同期処理のために必須
  }

  // --------------------------------------------------
  // 3. 送信元のタブを閉じる
  // --------------------------------------------------
  if (request.closemytab !== undefined) {
    if (sender.tab && sender.tab.id) {
      console.log('Closing tab ID:', sender.tab.id);
      chrome.tabs.remove(sender.tab.id, () => sendResponse({ status: 'ok' }));
      return true; // 非同期処理のために必須
    }
  }

  // --------------------------------------------------
  // 4. POSTリクエストの代理実行 (CORS回避など)
  // --------------------------------------------------
  if (request.doPost !== undefined) {
    if (!request.doPost.url || !request.doPost.dat) {
      console.error('doPost.url or dat is undefined');
      sendResponse({ status: 'error', message: 'Invalid parameters' });
      return; // 同期的なエラーの場合は return false で良いが、ここでは何も返さない
    }

    fetch(request.doPost.url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request.doPost.dat) // JSON化が必要な場合が多い
    })
      .then(res => res.text()) // json() か text() で中身を取り出す
      .then(data => {
        console.log('POST success:', data);
        sendResponse({ status: 'success', data: data });
      })
      .catch(e => {
        console.error('POST failed:', e);
        sendResponse({ status: 'error', message: e.message });
      });

    return true; // 非同期処理のために必須
  }

  // --------------------------------------------------
  // 5. GETリクエストの代理実行
  // --------------------------------------------------
  if (request.doGet !== undefined) {
    if (!request.doGet.url) {
      sendResponse({ status: 'error', message: 'Invalid parameters' });
      return;
    }

    fetch(request.doGet.url)
      .then(res => res.text())
      .then(data => {
        console.log('GET success');
        sendResponse({ status: 'success', data: data });
      })
      .catch(e => {
        console.error('GET failed:', e);
        sendResponse({ status: 'error', message: e.message });
      });

    return true; // 非同期処理のために必須
  }

  // --------------------------------------------------
  // 6. 他のタブへデータを転送する
  // --------------------------------------------------
  if (request.sendDatatoOtherTab !== undefined) {
    const { url, data, onlyfirsttab } = request.sendDatatoOtherTab;

    chrome.tabs.query({ url: url }, result => {
      console.log('送信先', result);
      if (!result || result.length === 0) {
        sendResponse({ status: 'error', message: 'No matching tabs found' });
        return;
      }

      // 非同期で全てのタブにメッセージを送り、結果を待つ
      const targetTabs = onlyfirsttab !== false ? [result[0]] : result;
      const promises = targetTabs.map(tab => {
        return new Promise(resolve => {
          chrome.tabs.sendMessage(tab.id, data, response => resolve(response));
        });
      });

      Promise.all(promises).then(responses => {
        sendResponse({ status: 'success', responses: responses });
      });
    });

    return true; // 非同期処理のために必須
  }
});

// --------------------------------------------------
// 特定のURLのタブが開かれたら即座に閉じる処理
// --------------------------------------------------
const blockedUrls = [
  'https://menu.edu-netz.com/netz/netz1/closewindow2.html',
  'https://menu2.edu-netz.com/netz/netz1/closewindow2.html',
  'https://menu.edu-netz.com/netz/netz1/tehai/shido_furikae_input_save_utf8.aspx'
];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    for (const url of blockedUrls) {
      if (tab.url.startsWith(url)) {
        chrome.tabs.remove(tabId).catch(err => console.error('Tab remove error:', err));
        break;
      }
    }
  }
});
