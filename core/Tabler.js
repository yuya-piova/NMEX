// core/Tabler.js

export default class Tabler {
  /**
   * @param {HTMLElement|JQuery} table - 対象のテーブル要素
   * @param {number} [headnum=0] - ヘッダーとする行番号
   */
  constructor(table, headnum = 0) {
    this.$table = $(table);
    this.headnum = headnum;
    this.init();
  }

  init() {
    this._parseGrid(); // applyTablerGrid の処理（座標付与）
    this._markHeaders();
    this._bindEvents();
  }

  /**
   *  テーブルの結合を解析し、DOMに座標属性を付与する
   */
  _parseGrid() {
    if (this.$table.attr('applyTablerGrid') === 'true') return;
    this.$table.attr('applyTablerGrid', 'true');

    const grid = [];
    this.$table.find('tr').each(function(rowIndex) {
      const $tr = $(this);
      if (!grid[rowIndex]) grid[rowIndex] = [];

      let colIndex = 0;
      let trRowMax = rowIndex;

      $tr.find('td, th').each(function() {
        const $td = $(this);
        const rowspan = parseInt($td.attr('rowspan'), 10) || 1;
        const colspan = parseInt($td.attr('colspan'), 10) || 1;

        while (grid[rowIndex][colIndex] !== undefined) colIndex++;

        const rowmax = rowIndex + rowspan - 1;
        const colmax = colIndex + colspan - 1;

        $td.attr({ row: rowIndex, col: colIndex, rowmax: rowmax, colmax: colmax });
        if (rowmax > trRowMax) trRowMax = rowmax;

        for (let r = 0; r < rowspan; r++) {
          if (!grid[rowIndex + r]) grid[rowIndex + r] = [];
          for (let c = 0; c < colspan; c++) {
            grid[rowIndex + r][colIndex + c] = true; // 陣地確保マーカー
          }
        }
      });
      $tr.attr({ row: rowIndex, rowmax: trRowMax });
    });
  }

  /**
   * 指定行までのセルに tablehead="true" を付与する
   */
  _markHeaders() {
    // 高速化のため、属性セレクタを使わず、計算済みの row 属性で判定
    this.$table.find('tr').each((index, tr) => {
      if (index > this.headnum) return false; // headnum を超えたらループ終了
      $(tr)
        .find('td, th')
        .attr('tablehead', 'true');
    });
  }

  /**
   * TDから不要な要素を除去して純粋なテキストを取得する
   */
  _getTDText($td) {
    const $clone = $td.clone();

    // 既存の inputremover プラグインがあれば使用、なければ汎用処理
    if (typeof $clone.inputremover === 'function') {
      $clone.find('input[type=button],input[type=text]').inputremover();
    } else {
      $clone.find('input[type=button],input[type=text]').remove();
    }

    $clone.find('select option:not(:selected)').remove();
    const text = ($clone.prop('innerText') || '').replace(/　|\t/g, ' ').replace(/\s+/g, ' ');
    return text.trim();
  }

  /**
   * ソート用の値変換ロジック
   */
  _dataConvertForSort(elem) {
    if (typeof elem === 'number') return elem;
    if (typeof elem === 'string' && elem.includes('%')) return parseInt(elem.replace('%', ''), 10);

    if (typeof LCT !== 'undefined') {
      if (LCT.STUDENT?.gradeTable?.[elem]) return LCT.STUDENT.gradeTable[elem];
      if (LCT.UNIT?.blockOrder?.[elem]) return LCT.UNIT.blockOrder[elem];
      if (LCT.UNIT?.unitOrder?.[elem]) return LCT.UNIT.unitOrder[elem];
      if (LCT.UNIT?.baseOrder?.[elem]) return LCT.UNIT.baseOrder[elem];
    }
    return elem;
  }

  /**
   * 列がソート可能かチェックする（列数の乱れがないか）
   */
  _isSortable(colIndex) {
    let isSortable = true;
    let maxTdLength = 0;

    this.$table.find(`td[col=${colIndex}], th[col=${colIndex}]`).each((_, cell) => {
      const row = $(cell).attr('row');
      const tdLength = this.$table.find(`td[row=${row}], th[row=${row}]`).length;
      if (maxTdLength < tdLength) {
        maxTdLength = tdLength;
      } else if (maxTdLength > tdLength) {
        isSortable = false;
        return false; // ループを抜ける
      }
    });
    return isSortable;
  }

  /**
   * イベントのバインド
   */
  _bindEvents() {
    const self = this;

    this.$table.on('contextmenu', 'td[tablehead=true], th[tablehead=true]', function(e) {
      if (!['TD', 'TH'].includes(e.target.tagName)) return;

      const colIndex = $(this).attr('col');
      if (!self._isSortable(colIndex)) return;

      self._handleSort($(this), colIndex);
      return false;
    });

    this.$table.on('click', 'td[tablehead=true], th[tablehead=true]', function(e) {
      if (!['TD', 'TH'].includes(e.target.tagName)) return;

      const colIndex = $(this).attr('col');
      self._handleFilter($(this), colIndex);
    });
  }

  /**
   * ソート処理の本体
   */
  _handleSort($th, colIndex) {
    //$th.find('input[name=sorter]').remove();
    //$th.append('<input name="sorter" class="tablerbutton netzblind" type="button" value="S" style="padding-left:0px;padding-right:0px;" disabled>');

    $th.toggleClass('sortAscending');
    const isAsc = $th.hasClass('sortAscending');
    const DX = isAsc ? 1 : -1;
    const DY = isAsc ? -1 : 1;

    // ソート対象の行（TR）を配列化
    const $tbody = this.$table.find('tbody').length ? this.$table.find('tbody') : this.$table;
    const rows = this.$table.find(`tr:gt(${this.headnum})`).get();

    let beforeText = '';

    // 行ごとにソート用の値を事前計算
    rows.forEach(tr => {
      const $td = $(tr).find(`td[col=${colIndex}]`);
      let text = '';
      if ($td.length !== 0) {
        text = this._getTDText($td).replace(/,/g, '');
      } else {
        text = beforeText;
      }
      beforeText = text;

      let parsed = Number.isNaN(Number(text)) || text === '' ? text : parseInt(text, 10);
      tr._sortValue = this._dataConvertForSort(parsed);
      tr._originalIndex = $(tr).index(); // 安定ソート用
    });

    // ソート実行
    rows.sort((a, b) => {
      const ev_a = a._sortValue;
      const ev_b = b._sortValue;
      const fina = isFinite(ev_a);
      const finb = isFinite(ev_b);

      if (ev_a === ev_b) return a._originalIndex > b._originalIndex ? 1 : -1;
      if (fina && finb) return ev_a > ev_b ? DX : DY;
      if (!fina && finb) return DY;
      if (fina && !finb) return DX;
      return String(ev_a).localeCompare(String(ev_b)) === 1 ? DX : DY;
    });

    // DOMの一括更新（爆速化の要）
    $(rows)
      .find('td')
      .removeAttr('rank'); // 旧 rank 属性の削除
    $tbody.append(rows);
  }

  /**
   * フィルターUIの表示と処理
   */
  _handleFilter($th, colIndex) {
    const sorttable = this.$table.find(`tr:gt(${this.headnum})`);

    // テキストごとの件数・表示状態を集計
    const textCount = {};
    const textState = {}; // true:全表示, false:全非表示, 'indeterminate':一部非表示
    let shownum = 0;

    sorttable.each((_, tr) => {
      const $td = $(tr).find(`td[col=${colIndex}]`);
      if ($td.length === 0) return;

      const text = this._getTDText($td);
      if (!textCount[text]) textCount[text] = { all: 0, show: 0 };
      textCount[text].all += 1;

      const isVisible = $(tr).css('visibility') !== 'collapse';
      if (isVisible) {
        shownum++;
        textCount[text].show += 1;
      }

      if (textState[text] == null || textState[text] === isVisible) {
        textState[text] = isVisible;
      } else {
        textState[text] = 'indeterminate';
      }
    });

    const uniqueTexts = Object.keys(textCount);

    // 既存のメニューを削除して新規作成
    const selectname = 'tablerdiv';
    $(`div[name=${selectname}]`).remove();

    const $menu = $(`<div class="onetzpicker opopups" name="${selectname}" eq="${colIndex}"></div>`);

    // 既存プラグイン（mouseposition, draggable 等）の適用
    if (typeof $menu.mouseposition === 'function') $menu.mouseposition();
    if (typeof $menu.draggable === 'function') $menu.draggable();

    $menu.on('contextmenu touchend', function(e) {
      if (e.target.tagName !== 'INPUT') $(this).remove();
      return false;
    });

    // 外部クリック・右クリックで閉じる
    $('html').one('contextmenu', () => $menu.remove());

    // UIの組み立て
    $menu.append(`${shownum}件 ${uniqueTexts.filter(t => textState[t] !== false).length}種類表示中<br>`);

    // 全表示ボタン
    $('<input type="button" value="全表示">')
      .on('click', () => {
        $menu.find('input[name=filters]').prop('checked', true);
        $th.find('input[name=filter]').remove();
        sorttable.css('visibility', 'visible');
      })
      .appendTo($menu);

    // 全非表示ボタン
    const makeFilterButton = () => {
      if ($th.find('input[name="filter"]').length === 0) {
        $th.append(
          '<input name="filter" class="tablerbutton netzblind" type="button" value="F" style="padding-left:0px;padding-right:0px;" disabled>'
        );
      }
    };

    $('<input type="button" value="全非表示">')
      .on('click', () => {
        $menu.find('input[name=filters]').prop('checked', false);
        makeFilterButton();
        sorttable.css('visibility', 'collapse');
      })
      .appendTo($menu);

    // 各種ボタン
    $('<input type="button" value="列非表示">')
      .on('click', () => {
        this.$table
          .find('tr')
          .find(`td:eq(${colIndex}), th:eq(${colIndex})`)
          .hide();
      })
      .appendTo($menu);

    $('<br>').appendTo($menu);

    $('<input type="button" value="列コピー">')
      .on('click', () => {
        const $clone = this.$table.clone(false);
        $clone
          .find('tr')
          .find(`td:not([col=${colIndex}]), th:not([col=${colIndex}])`)
          .remove();
        $clone
          .find('tr')
          .filter(function() {
            return $(this).css('visibility') === 'collapse';
          })
          .remove();
        $clone.find('div[name=tablerdiv]').remove();
        navigator.clipboard.writeText($clone.prop('outerHTML'));
      })
      .appendTo($menu);

    $('<input type="button" value="全体コピー">')
      .on('click', () => {
        const $clone = this.$table.clone(false);
        if (typeof $clone.find('input').inputremover === 'function') $clone.find('input').inputremover();
        $clone.find('select, div[name=tablerdiv]').remove();
        $clone
          .find('tr')
          .filter(function() {
            return $(this).css('visibility') === 'collapse' || $(this).css('visibility') === 'hidden';
          })
          .remove();
        navigator.clipboard.writeText($clone.prop('outerHTML'));
      })
      .appendTo($menu);

    $menu.append('<br><span style="color:#808080;">右クリックで閉じる</span><br>');

    // 検索窓
    const $searchInput = $('<input type="text" name="filtertext">').appendTo($menu);
    if (typeof $searchInput.keydownAwait === 'function') {
      $searchInput.keydownAwait(function() {
        const text = $(this).val();
        if (text === '') {
          $menu.find('input[value="全表示"]').trigger('click');
          return;
        }
        const selector = text
          .split(',')
          .map(one => `[value*="${one}"]`)
          .join(',');
        $menu.find('input[value="全非表示"]').trigger('click');
        $menu
          .find('input[name=filters]')
          .filter(selector)
          .prop('checked', true)
          .trigger('change');
      });
    }

    // 合計値計算
    const numericData = sorttable
      .filter(function() {
        return $(this).css('visibility') !== 'collapse';
      })
      .map((_, tr) =>
        $(tr)
          .find(`td[col=${colIndex}]`)
          .text()
          .replace(/,/g, '')
      )
      .get()
      .filter(val => !isNaN(val) && val !== '');

    if (numericData.length > 0) {
      const sum = numericData.reduce((acc, val) => acc + parseFloat(val), 0);
      $menu.append(`<br><span style="color:#808080;">SUM:${sum}    AVERAGE:${Math.round((sum / numericData.length) * 100) / 100}</span>`);
    }

    $menu.append('<br>');

    // チェックボックス生成
    uniqueTexts.forEach(text => {
      const $cb = $('<input>', { class: 'tablercheck', type: 'checkbox', name: 'filters', value: text });
      const $label = $('<label/>')
        .append($cb)
        .append(` ${text} `)
        .append($(`<span style="font-size:0.8rem; vertical-align:super;">(${textCount[text].show || '-'})</span>`));

      $menu.append($label).append('<br>');

      if (textState[text] === true) $cb.prop('checked', true);
      else if (textState[text] === false) $cb.prop('checked', false);
      else if (textState[text] === 'indeterminate') $cb.prop('indeterminate', true);
    });

    // チェックボックスの変更イベント
    $menu.on('change', 'input[name=filters]', function() {
      const $cb = $(this);
      const isChecked = $cb.prop('checked');

      sorttable
        .find(`td[col=${colIndex}]`)
        .filter(function() {
          return self._getTDText($(this)) === $cb.val();
        })
        .each(function() {
          const $tr = $(this).closest('tr');
          const rowspan = parseInt($(this).attr('rowspan'), 10) || 1;

          $tr.css('visibility', isChecked ? 'visible' : 'collapse');
          if (rowspan > 1) {
            $tr.nextUntil(`[row=${parseInt($(this).attr('row')) + rowspan}]`).css('visibility', isChecked ? 'visible' : 'collapse');
          }
        });

      if ($menu.find('input[name=filters]:not(:checked)').length !== 0) {
        makeFilterButton();
      } else {
        $th.find('input[name="filter"]').remove();
      }
    });

    // 右クリックでその項目のみ表示
    $menu.on('contextmenu', 'label', function() {
      $(this)
        .find('input')
        .prop('checked', true)
        .trigger('click');
      return false;
    });

    $menu.appendTo($th).trigger('create');
    $searchInput.focus();
  }
}
