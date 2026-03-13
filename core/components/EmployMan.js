// core/components/EmployMan.js

// ※ NXEmpが別ファイルでモジュール化されている場合はここでimportしてください
// import { NXEmp } from '../path/to/NXEmp.js';

export default class EmployMan {
  /**
   * @param {HTMLElement} triggerElement - ピッカーを呼び出したinput要素
   * @param {Object} offset - { top, left } 呼び出し元の座標
   * @param {boolean} multiple - 複数選択モードかどうか
   */
  constructor(triggerElement, offset, multiple = false) {
    this.NXDatabase = new NXEmp(); // グローバルまたはimportされたNXEmp
    this.triggerElement = triggerElement;
    this.offset = offset;
    this.multiple = multiple;

    // 現在の入力値を配列として保持（空文字は除去）
    this.selectedValues = (triggerElement.value || '')
      .split(',')
      .map(val => val.trim())
      .filter(Boolean);
    this.originalValues = [...this.selectedValues];

    this.initUI();
  }

  initUI() {
    // 1. 全体を覆うラッパー (Fluxのカードとフレックスボックスを活用)
    this.$wrapper = $('<div>', {
      class: 'flux-card flux-flex flux-flex-col'
    })
      .css({
        position: 'absolute',
        zIndex: 9999,
        width: '240px',
        display: 'none'
      })
      .appendTo('body');

    // 2. ヘッダーエリア (検索ボックスと閉じるボタン)
    const $header = $('<div>', {
      class: 'flux-flex flux-items-center flux-justify-between flux-gap-2 flux-p-2'
    }).css({ borderBottom: '1px solid var(--flux-border)' });

    this.$searchBox = $('<input>', {
      type: 'text',
      class: 'flux-input',
      placeholder: '社員名・グループ'
    }).css({ flexGrow: 1, padding: '4px 8px' });

    const $closeBtn = $('<button>', { class: 'flux-btn-icon' })
      .html('&#10005;')
      .css({ width: '24px', height: '24px' });

    $header.append(this.$searchBox, $closeBtn);

    // 3. 検索結果リスト (selectボックス)
    this.$resultList = $('<select>', {
      class: 'flux-input flux-no-scrollbar',
      multiple: this.multiple,
      size: 5
    }).css({
      border: 'none',
      borderRadius: '0',
      outline: 'none',
      padding: '4px'
    });

    this.$wrapper.append($header, this.$resultList);

    // 4. イベントリスナーの設定
    this.$searchBox.on('input', () => this.updateSearchResults());

    this.$searchBox.on('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const $options = this.$resultList.find('option');
        if ($options.length === 1) {
          this._applySelection([$options.val()]);
        }
      }
    });

    $closeBtn.on('click', () => this.close());

    this.$resultList.on('change', () => {
      // .val()は単一選択だと文字列、複数選択だと配列を返すため、必ず配列に統一する
      const rawVal = this.$resultList.val();
      const newSelectedValues = Array.isArray(rawVal) ? rawVal : rawVal ? [rawVal] : [];

      // 複数選択の場合は既存の値とマージ、単一の場合は上書き
      const finalValues = this.multiple ? Array.from(new Set([...this.selectedValues, ...newSelectedValues])) : newSelectedValues;

      this._applySelection(finalValues);
    });
  }

  updateSearchResults() {
    this.$resultList.empty();
    const query = this.$searchBox.val().trim();
    if (!query) return;

    this.NXDatabase.include(query);
    this.NXDatabase.searchNXT.filterByCondition(['retire', '']); // 退職者を除く

    const head = this.NXDatabase.rawNXT.head;
    const body = this.NXDatabase.searchNXT.body;

    body.forEach(row => {
      const pickedData = this._extractByHead(row, head, ['name', 'cd']);
      const isSelected = this.originalValues.includes(pickedData.cd);

      $('<option>', {
        value: pickedData.cd,
        text: pickedData.name,
        selected: isSelected
      }).appendTo(this.$resultList);
    });
  }

  _applySelection(values) {
    if (!this.triggerElement) return;

    this.selectedValues = values;
    this.triggerElement.value = this.selectedValues.join(',');

    // 1. ネイティブな change イベントを作成して発火（これが一番確実）
    const nativeEvent = new Event('change', { bubbles: true, cancelable: true });
    this.triggerElement.dispatchEvent(nativeEvent);

    // 2. 念のため jQuery の trigger も呼んでおく（jQuery依存のスクリプト対策）
    // ※ ネイティブ発火だけで動く場合は消しても構いません
    $(this.triggerElement).trigger('change');

    // 複数選択でなければ即座に閉じる
    if (!this.multiple) this.close();
  }

  _extractByHead(row, head, pick) {
    return pick.reduce((acc, key) => {
      const index = head.indexOf(key);
      if (index !== -1) acc[key] = row[index];
      return acc;
    }, {});
  }

  show() {
    this.$wrapper.show();

    // はみ出し補正 (表示してから高さを取得して計算)
    const rect = this.$wrapper[0].getBoundingClientRect();
    let top = this.offset.top;
    let left = this.offset.left;

    if (top + rect.height > window.innerHeight + window.scrollY) {
      top = window.innerHeight + window.scrollY - rect.height - 10;
    }
    if (left + rect.width > window.innerWidth + window.scrollX) {
      left = window.innerWidth + window.scrollX - rect.width - 10;
    }

    this.$wrapper.css({ top: `${top}px`, left: `${left}px` });
    this.$searchBox.focus();
  }

  close() {
    // DOMから完全に削除してメモリリークを防ぐ
    this.$wrapper.remove();
  }
}
