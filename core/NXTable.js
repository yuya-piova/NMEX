/**
 * NXTable ver 3.0
 * 高機能なテーブルデータ操作クラス
 * 依存: なし (ただし toTable() を使う場合のみ jQuery が必要)
 */
class NXTable {
  /**
   * @param {string[]|{head:string[], body:any[][]}} [arg1]
   * @param {any[][]} [arg2]
   */
  constructor(arg1, arg2) {
    if (!arg1) {
      this.reset();
    } else if (arg1.head && arg1.body) {
      this.head = arg1.head;
      this.body = arg1.body;
    } else if (Array.isArray(arg1) && Array.isArray(arg2)) {
      this.head = arg1;
      this.body = arg2;
    } else {
      console.warn('NXTable: Invalid arguments. Resetting.', arg1);
      this.reset();
    }

    if (!this._isOneDimArray(this.head)) {
      console.warn('NXTable: Head is not 1D array. Resetting.');
      this.reset();
    }
    this.rebuildIndices();
  }

  rebuildIndices() {
    this.headIndices = new Map(this.head.map((header, index) => [header, index]));
  }

  reset() {
    this.head = [];
    this.body = [];
    this.headIndices = new Map();
  }

  _isOneDimArray(arr) {
    return Array.isArray(arr) && arr.every(el => !Array.isArray(el));
  }

  _getIndex(head, strict = true) {
    const index = typeof head === 'number' ? head : this.headIndices.get(head);
    if (strict && index === undefined) {
      console.warn(`NXTable: Column "${head}" not found.`);
      return undefined;
    }
    return index;
  }

  _convertToNumber(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const num = parseFloat(value.replace(/,/g, ''));
      return isNaN(num) ? 0 : num;
    }
    return 0;
  }

  // --- 出力・変換 ---

  toObject() {
    return { head: this.head, body: this.body };
  }

  toObjectArray() {
    return this.body.map(row => {
      const obj = {};
      this.head.forEach((h, i) => (obj[h] = row[i]));
      return obj;
    });
  }

  toDictionary(pivotHead = 0) {
    const dict = {};
    const pivotIndex = this._getIndex(pivotHead);
    if (pivotIndex === undefined) return {};
    this.body.forEach(row => {
      const obj = {};
      this.head.forEach((h, i) => (obj[h] = row[i]));
      dict[row[pivotIndex]] = obj;
    });
    return dict;
  }

  /**
   * jQueryテーブル要素を生成
   */
  toTable(attrs = {}) {
    if (typeof jQuery === 'undefined') throw new Error('NXTable: jQuery required for toTable()');
    const $table = $('<table>', attrs);
    const $thead = $('<thead>').appendTo($table);
    const $trHead = $('<tr>').appendTo($thead);
    this.head.forEach(h =>
      $trHead.append(
        $('<th>')
          .text(h)
          .attr('title', h)
      )
    );
    const $tbody = $('<tbody>').appendTo($table);
    this.body.forEach(row => {
      const $tr = $('<tr>').appendTo($tbody);
      row.forEach(cell =>
        $tr.append(
          $('<td>')
            .text(cell)
            .attr('data-value', cell)
        )
      );
    });
    return $table;
  }

  getColumn(head) {
    const index = this._getIndex(head);
    return index === undefined ? [] : this.body.map(row => row[index]);
  }

  // --- フィルタ・検索 ---

  _filterRows(conditions) {
    const filters = conditions.map(cond => {
      if (!cond) return null;
      const [head, query, exact = true] = cond;
      const index = this._getIndex(head, false);
      return index === undefined ? null : { index, query, exact };
    });
    if (filters.some(f => f && f.index === undefined)) return [];

    return this.body.filter(row => {
      return filters.every(f => {
        if (!f) return true;
        const val = String(row[f.index] || '');
        const queries = Array.isArray(f.query) ? f.query : [f.query];
        return queries.some(q => (f.exact ? val === String(q) : val.includes(String(q))));
      });
    });
  }

  filterByCondition(...conditions) {
    this.body = this._filterRows(conditions);
    return this;
  }

  filter(targetHead, callback) {
    const index = this._getIndex(targetHead);
    if (index === undefined) return this;
    this.body = this.body.filter(row => callback(row[index], row));
    return this;
  }

  filterByQuery(query) {
    const qStr = String(query);
    this.body = this.body.filter(row => row.some(cell => cell != null && String(cell) === qStr));
    return this;
  }

  include(query) {
    const qStr = String(query);
    this.body = this.body.filter(row => row.some(cell => cell != null && String(cell).includes(qStr)));
    return this;
  }

  match(conditions) {
    return this._filterRows(conditions);
  }

  matchFirst(conditions) {
    const row = this._filterRows(conditions)[0];
    if (!row) return {};
    const dict = {};
    this.head.forEach((h, i) => (dict[h] = row[i]));
    return dict;
  }

  xlookup(lookupValue, lookupHead, returnHead) {
    const lookupIndex = this._getIndex(lookupHead);
    const returnIndex = this._getIndex(returnHead);
    if (lookupIndex === undefined || returnIndex === undefined) return null;

    const lookupStr = String(lookupValue);
    const row = this.body.find(r => String(r[lookupIndex] || '') === lookupStr);
    return row ? row[returnIndex] : null;
  }

  // --- 集計・分析 ---

  sumifs(sumHead, ...conditions) {
    const index = this._getIndex(sumHead);
    if (index === undefined) return 0;
    return this._filterRows(conditions).reduce((acc, row) => acc + this._convertToNumber(row[index]), 0);
  }

  countifs(...conditions) {
    return this._filterRows(conditions).length;
  }

  averageifs(avgHead, ...conditions) {
    const rows = this._filterRows(conditions);
    if (rows.length === 0) return 0;
    const index = this._getIndex(avgHead);
    const sum = rows.reduce((acc, row) => acc + this._convertToNumber(row[index]), 0);
    return sum / rows.length;
  }

  conditionalSum(sumHead, targetHead, testFunc) {
    const sumIdx = this._getIndex(sumHead);
    const tgtIdx = this._getIndex(targetHead);
    if (sumIdx === undefined || tgtIdx === undefined) return 0;
    return this.body.reduce((acc, row) => (testFunc(row[tgtIdx]) ? acc + this._convertToNumber(row[sumIdx]) : acc), 0);
  }

  conditionalCount(targetHead, testFunc) {
    const idx = this._getIndex(targetHead);
    if (idx === undefined) return 0;
    return this.body.reduce((acc, row) => (testFunc(row[idx]) ? acc + 1 : acc), 0);
  }

  unique(targetHead) {
    const index = this._getIndex(targetHead);
    if (index === undefined) return [];
    return [...new Set(this.body.map(row => row[index]))];
  }

  createRanking(targetHead) {
    const index = this._getIndex(targetHead);
    if (index === undefined) return null;
    const countMap = new Map();
    this.body.forEach(row => {
      const val = row[index];
      countMap.set(val, (countMap.get(val) || 0) + 1);
    });
    const sorted = [...countMap.entries()].sort((a, b) => b[1] - a[1]);
    const rankingBody = [];
    let currentRank = 1,
      lastCount = null;
    sorted.forEach(([val, count], i) => {
      if (count !== lastCount) currentRank = i + 1;
      rankingBody.push([currentRank, val, count]);
      lastCount = count;
    });
    return new NXTable(['Rank', targetHead, 'Count'], rankingBody);
  }

  analyze(pivotHead, ...conditions) {
    const uniqueList = this.unique(pivotHead);
    const newHead = [pivotHead];
    const newBody = uniqueList.map(q => [q]);

    conditions.forEach((cond, i) => {
      const [analyzeHead, method, label, ...subConds] = cond;
      newHead.push(label || `${analyzeHead}(${method})`);
      uniqueList.forEach((q, rowIdx) => {
        const condList = [[pivotHead, q], ...(subConds[0] || [])];
        let val = 0;
        if (method === 'sum') val = this.sumifs(analyzeHead, ...condList);
        else if (method === 'count') val = this.countifs(...condList);
        else if (method === 'average') val = this.averageifs(analyzeHead, ...condList);
        newBody[rowIdx][i + 1] = val;
      });
    });
    return new NXTable(newHead, newBody);
  }

  // --- 編集 ---

  /**
   * 列の追加（配列を返せば複数列追加）
   */
  appendColumn(caption, callback, targetHead) {
    let index = targetHead === undefined ? this.head.length : this._getIndex(targetHead);
    if (index === undefined) index = this.head.length;

    const captions = Array.isArray(caption) ? caption : [caption];
    this.head.splice(index + 1, 0, ...captions);

    this.body = this.body.map(row => {
      const val = callback(row);
      const vals = Array.isArray(val) ? val : [val];
      row.splice(index + 1, 0, ...vals);
      return row;
    });
    this.rebuildIndices();
    return this;
  }
  /**
   * 別のNXTableと結合する
   * ヘッダーの和集合を取り、足りない列は null で埋める
   */
  merge(otherTable, inPlace = true) {
    if (!(otherTable instanceof NXTable)) {
      throw new Error('NXTable: Argument must be an instance of NXTable.');
    }

    // ヘッダーのマージ（重複排除）
    const newHead = [...new Set([...this.head, ...otherTable.head])];

    // ヘッダー位置マップ（一時的）
    const thisIdx = this.headIndices;
    const otherIdx = otherTable.headIndices;

    // 行データを新ヘッダーに合わせて再配置する関数
    const adaptRow = (row, indices) => {
      // 存在しない列は null で埋める
      return newHead.map(h => (indices.has(h) ? row[indices.get(h)] : null));
    };

    const newBody = [...this.body.map(row => adaptRow(row, thisIdx)), ...otherTable.body.map(row => adaptRow(row, otherIdx))];

    if (inPlace) {
      this.head = newHead;
      this.body = newBody;
      this.rebuildIndices();
      return this;
    } else {
      return new NXTable(newHead, newBody);
    }
  }

  replace(targetHead, callback) {
    const index = this._getIndex(targetHead);
    if (index === undefined) return this;
    this.body.forEach(row => {
      row[index] = callback(row[index], row);
    });
    return this;
  }

  deleteColumns(...heads) {
    const indices = heads
      .map(h => this._getIndex(h, false))
      .filter(i => i !== undefined)
      .sort((a, b) => b - a);
    indices.forEach(i => {
      this.head.splice(i, 1);
      this.body.forEach(row => row.splice(i, 1));
    });
    this.rebuildIndices();
    return this;
  }

  pickColumns(heads) {
    const indices = heads.map(h => this._getIndex(h, false)).filter(i => i !== undefined);
    const newHead = indices.map(i => this.head[i]);
    const newBody = this.body.map(row => indices.map(i => row[i]));
    return new NXTable(newHead, newBody);
  }

  makeTotalRow(label = '合計') {
    const totalRow = this.head.map((_, i) => {
      if (i === 0) return label;
      return this.body.reduce((acc, row) => acc + this._convertToNumber(row[i]), 0) || '';
    });
    this.body.push(totalRow);
    return this;
  }

  transpose(pivotHeadOrIndex = 0, inPlace = false) {
    const index = this._getIndex(pivotHeadOrIndex);
    if (index === undefined) throw new Error('NXTable: Invalid pivot.');

    const newHead = ['title', ...this.body.map(row => row[index])];
    const newBody = [];

    for (let col = 0; col < this.head.length; col++) {
      if (col === index) continue;
      const newRow = [this.head[col]];
      for (let row = 0; row < this.body.length; row++) {
        newRow.push(this.body[row][col]);
      }
      newBody.push(newRow);
    }

    if (inPlace) {
      this.head = newHead;
      this.body = newBody;
      this.rebuildIndices();
      return this;
    }
    return new NXTable(newHead, newBody);
  }

  appendFromArray(array) {
    array.forEach(obj => {
      const newRow = this.head.map(h => (obj[h] !== undefined ? obj[h] : ''));
      Object.keys(obj).forEach(key => {
        if (!this.headIndices.has(key)) {
          this.head.push(key);
          this.headIndices.set(key, this.head.length - 1);
          newRow.push(obj[key]);
        }
      });
      this.body.push(newRow);
    });
    return this;
  }

  sort(pivotHead, direction = 'descending', sortFunc = null) {
    const idx = this._getIndex(pivotHead);
    if (idx === undefined) throw new Error(`NXTable: Column "${pivotHead}" not found.`);

    const isAsc = direction === 'ascending' || direction === 1;
    const compare =
      sortFunc ||
      ((a, b) => {
        const valA = dataConvertForSort(a[idx]),
          valB = dataConvertForSort(b[idx]);
        if (valA == valB) return 0;
        if (valA == null) return isAsc ? -1 : 1;
        if (valB == null) return isAsc ? 1 : -1;
        return (valA < valB ? -1 : 1) * (isAsc ? 1 : -1);
      });

    this.body.sort(compare);

    return this;

    function dataConvertForSort(elem) {
      if (typeof elem === 'number') return elem;
      if (typeof elem === 'string') {
        //定数の場合順位に変換
        //学年番号
        if (LCT.STUDENT.gradeTable[elem]) return LCT.STUDENT.gradeTable[elem];
        //ブロック名
        if (LCT.UNIT.blockOrder[elem]) return LCT.UNIT.blockOrder[elem];
        //ユニット名
        if (LCT.UNIT.unitOrder[elem]) return LCT.UNIT.unitOrder[elem];
        //教室名
        if (LCT.UNIT.baseOrder[elem]) return LCT.UNIT.baseOrder[elem];

        //該当しなければ%を除外した数値に変換
        return parseInt(elem.replace('%', ''));
      }
      //すべてに当てはまらなければそのまま返す
      return elem;
    }
  }

  clone() {
    return new NXTable(JSON.parse(JSON.stringify(this.head)), JSON.parse(JSON.stringify(this.body)));
  }

  fromTSV(tsvString) {
    const rows = tsvString
      .trim()
      .split('\n')
      .map(r => r.split('\t'));
    if (rows.length === 0) return this;
    if (this.head.length === 0) this.head = rows.shift();
    this.body = rows;
    this.rebuildIndices();
    return this;
  }
}
