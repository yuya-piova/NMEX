// flux/widgets/pages/ToolsPageWidget.js

import { Widget } from '../../core/Widget.js';

export class ToolsPageWidget extends Widget {
  render(state) {
    this.root.innerHTML = `
      <div class="flux-page-header">
        <h2 class="flux-page-title"><i class="fa-solid fa-toolbox"></i> Tools (Converter)</h2>
        <div class="flux-page-actions">
           <button class="flux-btn flux-btn-secondary" id="btn-tools-clear"><i class="fa-solid fa-eraser"></i> 一括クリア</button>
        </div>
      </div>

      <div class="flux-manage-container" style="flex-direction: row; gap: 15px; align-items: stretch; padding: 15px;">
        
        <div style="flex: 1; display: flex; flex-direction: column; gap: 5px;">
          <label style="font-weight:bold; color:#555;">Excel / TSV (CSV)</label>
          <textarea id="tool-csv" class="flux-input" style="flex: 1; resize: none; font-family: monospace; padding: 10px;" placeholder="ペーストしてください..."></textarea>
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; gap: 5px;">
          <label style="font-weight:bold; color:#555;">NXTable (JSON)</label>
          <textarea id="tool-nxt" class="flux-input" style="flex: 1; resize: none; font-family: monospace; padding: 10px;" placeholder="JSON..."></textarea>
        </div>

        <div style="flex: 1; display: flex; flex-direction: column; gap: 5px;">
          <label style="font-weight:bold; color:#555;">Markdown Table</label>
          <textarea id="tool-md" class="flux-input" style="flex: 1; resize: none; font-family: monospace; padding: 10px;" placeholder="| Header |..."></textarea>
        </div>

      </div>
    `;

    const taCSV = this.root.querySelector('#tool-csv');
    const taNXT = this.root.querySelector('#tool-nxt');
    const taMD = this.root.querySelector('#tool-md');

    // --- イベントリスナ ---
    this.root.querySelector('#btn-tools-clear').addEventListener('click', () => {
      taCSV.value = '';
      taNXT.value = '';
      taMD.value = '';
    });

    taCSV.addEventListener('input', () => {
      const raw = taCSV.value;
      if (!raw.trim()) return this.clearAll(taCSV, taNXT, taMD);
      const rows = raw
        .trim()
        .split('\n')
        .map(r => r.split('\t'));
      this.reflect(rows, [taNXT, taMD], taCSV, taNXT, taMD);
    });

    taNXT.addEventListener('input', () => {
      const raw = taNXT.value;
      if (!raw.trim()) return this.clearAll(taCSV, taNXT, taMD);
      try {
        if (typeof NMEX_Utils !== 'undefined') {
          const rows = NMEX_Utils.nxtableToArray(raw);
          this.reflect(rows, [taCSV, taMD], taCSV, taNXT, taMD);
        }
      } catch (e) {}
    });

    taMD.addEventListener('input', () => {
      const raw = taMD.value;
      if (!raw.trim()) return this.clearAll(taCSV, taNXT, taMD);
      if (typeof NMEX_Utils !== 'undefined') {
        const rows = NMEX_Utils.markdownTableToArray(raw);
        if (rows.length > 0) {
          this.reflect(rows, [taCSV, taNXT], taCSV, taNXT, taMD);
        }
      }
    });
  }

  clearAll(taCSV, taNXT, taMD) {
    taCSV.value = '';
    taNXT.value = '';
    taMD.value = '';
  }

  reflect(rows, targets, taCSV, taNXT, taMD) {
    targets.forEach($target => {
      if ($target === taCSV) {
        $target.value = rows.map(r => r.join('\t')).join('\n');
      } else if ($target === taNXT) {
        $target.value = JSON.stringify({ head: rows[0], body: rows.slice(1) }, null, 2);
      } else if ($target === taMD) {
        if (typeof NMEX_Utils !== 'undefined') {
          $target.value = NMEX_Utils.arrayToMarkdownTable(rows);
        }
      }
    });
  }
}
