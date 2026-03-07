// core/features/BaseMan.js

export class BaseMan {
  constructor() {
    // 依存関係: NXBase がグローバルに存在するかチェック
    this.NXDatabase = typeof NXBase !== 'undefined' ? new NXBase() : null;
    this.uiElements = {};

    this.initUI();
    this.addEventListener();
    this.enableDrag();
    this.close(); // 初期状態は非表示
  }

  initUI() {
    // 1. Wrapper (Flux Card をそのまま活用)
    this.uiElements.wrapper = document.createElement('div');
    this.uiElements.wrapper.className = 'flux-card';
    Object.assign(this.uiElements.wrapper.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '450px',
      zIndex: '10000',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)' // フローティング感を強調
    });
    document.body.appendChild(this.uiElements.wrapper);

    // 2. Header
    this.uiElements.header = document.createElement('div');
    this.uiElements.header.className = 'flux-card-header';
    this.uiElements.header.style.cursor = 'grab';
    this.uiElements.header.style.padding = '8px 12px';
    this.uiElements.wrapper.appendChild(this.uiElements.header);

    // Header Flex Container (Tailwind風ユーティリティを活用)
    const headerContainer = document.createElement('div');
    headerContainer.className = 'fx-flex fx-items-center fx-gap-2';
    headerContainer.style.width = '100%';
    this.uiElements.header.appendChild(headerContainer);

    // 検索アイコン (現在のセレクタから取得用)
    this.uiElements.searchIcon = document.createElement('button');
    this.uiElements.searchIcon.className = 'flux-btn-icon mini';
    this.uiElements.searchIcon.title = 'セレクトボックスから取得';
    this.uiElements.searchIcon.innerHTML = '<i class="fa-solid fa-magnifying-glass"></i>';
    this.uiElements.searchIcon.addEventListener('click', () => {
      const selectedOption = document.querySelector('select[name=tenpo_cd] option:checked');
      if (selectedOption) {
        this.uiElements.searchBox.value = selectedOption.textContent;
        this.uiElements.searchBox.dispatchEvent(new Event('input'));
      }
    });
    headerContainer.appendChild(this.uiElements.searchIcon);

    // 検索ボックス
    this.uiElements.searchBox = document.createElement('input');
    this.uiElements.searchBox.type = 'text';
    this.uiElements.searchBox.className = 'flux-input';
    this.uiElements.searchBox.style.flex = '1';
    this.uiElements.searchBox.placeholder = '教室・ユニット・ブロック・cd';
    this.uiElements.searchBox.addEventListener('input', () => this.updateSearchResults());
    headerContainer.appendChild(this.uiElements.searchBox);

    // 閉じるボタン
    this.uiElements.closeBtn = document.createElement('button');
    this.uiElements.closeBtn.className = 'flux-btn-icon mini';
    this.uiElements.closeBtn.title = '閉じる';
    this.uiElements.closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    this.uiElements.closeBtn.addEventListener('click', () => this.close());
    headerContainer.appendChild(this.uiElements.closeBtn);

    // 3. Body (スクロール可能なリスト領域)
    this.uiElements.body = document.createElement('div');
    this.uiElements.body.className = 'flux-card-body fx-no-scrollbar';
    this.uiElements.body.style.maxHeight = '400px';
    this.uiElements.body.style.overflowY = 'auto';
    this.uiElements.body.style.padding = '10px';
    this.uiElements.wrapper.appendChild(this.uiElements.body);

    // 4. Result Table
    this.uiElements.resultTable = document.createElement('table');
    this.uiElements.resultTable.className = 'flux-table-full'; // Fluxのテーブルデザインを適用
    this.uiElements.resultTable.style.marginBottom = '0';
    this.uiElements.body.appendChild(this.uiElements.resultTable);
  }

  updateSearchResults() {
    this.uiElements.resultTable.innerHTML = '';
    const query = this.uiElements.searchBox.value.trim();

    if (!query || !this.NXDatabase) return;
    this.NXDatabase.include(query);
    this.NXDatabase.searchNXT.filterByCondition(['closed', '']); // 閉校教室は除く

    const head = this.NXDatabase.rawNXT.head;
    const tbody = document.createElement('tbody');
    this.uiElements.resultTable.appendChild(tbody);

    this.NXDatabase.searchNXT.body.forEach(row => {
      const pickedData = this.extractByHead(row, head, ['basecd', 'unitname', 'unitcd', 'basename']);
      const tr = document.createElement('tr');

      // リンクアイコン群 (flux-btn-iconで綺麗に並べる)
      const links = `
        <div class="fx-flex fx-gap-1">
          <button class="flux-btn-icon mini bm-link" title="教室基本情報" data-cd="${pickedData.basecd}">
            <i class="fa-solid fa-circle-info"></i>
          </button>
          <button class="flux-btn-icon mini bm-link" title="教室予定" data-cd="${pickedData.basecd}">
            <i class="fa-solid fa-calendar-days"></i>
          </button>
          <button class="flux-btn-icon mini bm-link" title="開校予定" data-cd="${pickedData.basecd}">
            <i class="fa-solid fa-door-open"></i>
          </button>
        </div>
      `;

      tr.innerHTML = `
        <td style="font-family: monospace; font-size: 0.85rem; color: var(--fx-text-muted); width: 60px;">${pickedData.basecd}</td>
        <td style="font-size: 0.8rem;" title="${pickedData.unitcd}">
           <span class="flux-status-chip flux-status-open" style="font-weight:normal;">${pickedData.unitname}</span>
        </td>
        <td style="font-weight: bold; font-size: 0.95rem; color: var(--fx-text-main);">${pickedData.basename}</td>
        <td style="width: 120px; padding-right: 5px;">${links}</td>
      `;
      tbody.appendChild(tr);
    });
  }

  extractByHead(row, head, pick) {
    return pick.reduce((acc, key) => {
      const index = head.indexOf(key);
      if (index !== -1) acc[key] = row[index];
      return acc;
    }, {});
  }

  addEventListener() {
    // イベント委譲を利用してリンククリックを処理
    this.uiElements.resultTable.addEventListener('click', event => {
      const btn = event.target.closest('.bm-link');
      if (!btn) return;

      const tenpoCd = btn.dataset.cd;
      let url = null;
      const host = typeof NX !== 'undefined' && NX.CONST ? NX.CONST.host : '';

      switch (btn.title) {
        case '教室基本情報':
          url = `${host}/tenpo/tenpo_info_list.aspx?tenpo_cd=${tenpoCd}`;
          break;
        case '教室予定':
          url = `${host}/schedule/yotei.aspx?tenpo_cd=${tenpoCd}`;
          break;
        case '開校予定':
          const today = typeof ExDate !== 'undefined' ? new ExDate().as('yyyy/mm/dd') : '';
          const nextMonth = typeof ExDate !== 'undefined' ? new ExDate().aftermonths(1).as('yyyy/mm/dd') : '';
          url = `${host}/tenpo_yotei.aspx?tenpo_cd=${tenpoCd}&input_f_dt=${today}&input_t_dt=${nextMonth}`;
          break;
      }

      if (url) window.open(url, '_blank');
    });
  }

  enableDrag() {
    let offsetX = 0,
      offsetY = 0,
      isDragging = false;

    // ヘッダーを掴んでドラッグ
    this.uiElements.header.addEventListener('pointerdown', event => {
      // InputやButtonをクリックした時はドラッグ開始しない
      if (event.target.closest('input') || event.target.closest('button')) return;

      isDragging = true;
      const rect = this.uiElements.wrapper.getBoundingClientRect();
      offsetX = event.clientX - rect.left;
      offsetY = event.clientY - rect.top;
      this.uiElements.header.style.cursor = 'grabbing';

      event.preventDefault(); // テキスト選択防止
    });

    window.addEventListener('pointermove', event => {
      if (!isDragging) return;
      event.preventDefault();

      // fixedに対する画面上の座標をそのまま指定
      this.uiElements.wrapper.style.left = `${event.clientX - offsetX}px`;
      this.uiElements.wrapper.style.top = `${event.clientY - offsetY}px`;
      this.uiElements.wrapper.style.right = 'auto'; // left優先にするためrightを無効化
    });

    window.addEventListener('pointerup', () => {
      if (isDragging) {
        isDragging = false;
        this.uiElements.header.style.cursor = 'grab';
      }
    });
  }

  show() {
    this.uiElements.wrapper.style.display = 'block';
    this.uiElements.searchBox.focus();
  }

  close() {
    this.uiElements.wrapper.style.display = 'none';
  }
}
