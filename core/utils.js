/**
 * Dispatches a native DOM event on a specific element.
 *
 * @param {Element} element - The DOM element on which to dispatch the event.
 * @param {string} eventName - The name of the event to dispatch (e.g., 'change', 'click').
 */
function dispatchNativeEvent(element, eventName) {
  if (!(element instanceof Element)) {
    console.warn('element must be an HTMLElement');
    return;
  }
  const event = new Event(eventName, { bubbles: true });
  element.dispatchEvent(event);
}

/**
 * jQuery plugin to dispatch a native DOM event on each element in the jQuery collection.
 *
 * @function
 * @name $.fn.dispatchNativeEvent
 * @param {string} eventName - The name of the event to dispatch (e.g., 'change', 'click').
 * @param {Object} [options={ bubbles: true }] - Optional event initialization properties.
 * @returns {jQuery} The original jQuery object, for chaining.
 *
 * @example
 * $('#myInput').dispatchNativeEvent('change');
 */
$.fn.dispatchNativeEvent = function(eventName, options = { bubbles: true }) {
  return this.each(function() {
    if (this instanceof Element) {
      this.dispatchEvent(new Event(eventName, options));
    }
  });
};

// ヘルパー関数：一意のセレクタを生成（#id を優先）
function getUniqueSelector(element) {
  if (element.id) return `#${element.id}`;
  if (element.className && typeof element.className === 'string') {
    const firstClass = element.className.split(/\s+/)[0];
    if (firstClass) return `.${firstClass}`;
  }
  // fallback: タグ＋インデックス指定
  const tag = element.tagName.toLowerCase();
  const all = Array.from(document.getElementsByTagName(tag));
  const index = all.indexOf(element);
  if (index !== -1) return `${tag}:nth-of-type(${index + 1})`;

  return null;
}
/**
 * 任意の文字列をクリップボードにコピー
 * @param {string} text [クリップボードに入れたいテキスト]
 */
function clipper(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.left = '-9999px';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  ta.remove();
}
$.fn.clipper = function() {
  //選択可能なオブジェクトをコピー
  var element = $(this)[0];
  var range = document.createRange();
  //取得した要素の内側を範囲とする
  range.selectNodeContents(element);
  //範囲を選択状態にする
  window.getSelection().addRange(range);
  const result = document.execCommand('copy');
};

//選択解除
function deSelect() {
  var selection;
  if (window.getSelection) {
    selection = window.getSelection();
    selection.collapse(document.body, 0);
  } else {
    selection = document.selection.createRange();
    selection.setEndPoint('EndToStart', selection);
    selection.select();
  }
}
/**
 *
 * @param {boolean} off
 */
function overridedialog(off = false) {
  if (off == false)
    window.onbeforeunload = function(e) {
      e.returnValue = 'このページを離れてもよろしいですか？';
    };
  else
    window.onbeforeunload = function(e) {
      e.returnValue = true;
    };
}
/**
 * Creates a mouse position tracker.
 * This function returns a function that can be used to get the current mouse position.
 *
 * @returns {Function} A function that returns the current mouse position as an object with `x` and `y` properties.
 */
function createMouseTracker() {
  let mouseX = 0;
  let mouseY = 0;

  // Update mouse position when the mouse moves
  document.addEventListener('mousemove', function(event) {
    mouseX = event.pageX;
    mouseY = event.pageY;
  });

  /**
   * Returns the current mouse position.
   *
   * @returns {Object} An object with `x` and `y` properties representing the current mouse position.
   */
  return function() {
    return { x: mouseX, y: mouseY };
  };
}

/**
 * A function to get the current mouse position.
 * This function is created by `createMouseTracker()` and can be used to retrieve the latest mouse position.
 */
const getMousePosition = createMouseTracker();
/**
 * loadScript ver2.0
 * 指定URL(CDN等)を読み込む関数(js,cssのみ対応)
 * v1.0: 作成
 * v1.1: IEを除外し、簡略化
 * v2.0: Promiseに対応
 * @param {string} url [スクリプトのURL]
 * @param {string} scripttype [js,css]
 * @param {function} [callback]
 */
function loadScript(url, scripttype, callback) {
  return new Promise((resolve, reject) => {
    let script;
    if (scripttype === 'js') {
      script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = url;
    } else if (scripttype === 'css') {
      script = document.createElement('link');
      script.type = 'text/css';
      script.href = url;
      script.rel = 'stylesheet';
    }
    if (!script) reject(new Error('Failed to create script tag.'));
    script.onload = () => {
      console.log(`LoadScript ${url}`);
      typeof callback === 'function' && callback();
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load script.'));
    document.head.appendChild(script);
  });
}