// flux/widgets/pages/TaskPageWidget.js

import { Widget } from '../../core/Widget.js';
import { DashboardActions } from '../../actions/DashboardAction.js';

export class TaskPageWidget extends Widget {
  render(state) {
    const tasks = state.errorTasks || [];
    const hasRangeError = tasks.some(t => t.isIncorrectRange);
    const hasFollowError = tasks.some(t => t.isNeedFollow);

    // リストHTML生成
    const rowsHtml = tasks
      .map(t => {
        // 状態に応じたスタイル
        const rowClass = [];
        if (t.isIncorrectRange) rowClass.push('flux-row-error-range');
        if (t.isPast) rowClass.push('flux-row-error-past');
        if (t.isNeedFollow) rowClass.push('flux-row-error-follow');

        return `
        <tr class="${rowClass.join(' ')}" data-id="${t.id}">
          <td class="flux-cell-icon">
            <button class="flux-btn-icon action-complete" title="完了"><i class="fa-regular fa-square"></i></button>
            <button class="flux-btn-icon action-cancel" title="中止"><i class="fa-solid fa-ban"></i></button>
          </td>
          <td>${t.taskName}</td>
          <td>${t.state}</td>
          <td class="${t.isIncorrectRange ? 'flux-text-danger' : ''}">${t.range || '×'}</td>
          <td class="${t.isPast ? 'flux-text-danger' : ''}">${t.due}</td>
          <td class="flux-cell-action">
            <button class="flux-btn-icon action-fix" title="期間適正化"><i class="fa-solid fa-calendar-days"></i></button>
            <button class="flux-btn-icon action-detail" title="詳細"><i class="fa-solid fa-pen-to-square"></i></button>
          </td>
        </tr>
      `;
      })
      .join('');

    // 全体レイアウト (ヘッダー + フルサイズテーブル)
    this.root.innerHTML = `
      <div class="flux-page-header">
        <h2 class="flux-page-title"><i class="fa-solid fa-list-check"></i> Error Tasks</h2>
        <div class="flux-page-actions">
          ${hasFollowError ? `<button class="flux-btn flux-btn-danger" id="btn-del-follow">指導F削除</button>` : ''}
          ${hasRangeError ? `<button class="flux-btn flux-btn-warning" id="btn-fix-range">期限適正化</button>` : ''}
          <button class="flux-btn flux-btn-secondary" id="btn-reload"><i class="fa-solid fa-rotate"></i> 更新</button>
        </div>
      </div>
      
      <div class="flux-table-container">
        <table class="flux-table-full">
          <thead>
            <tr>
              <th style="width: 80px;">Action</th>
              <th>タスク名</th>
              <th style="width: 80px;">状態</th>
              <th style="width: 150px;">期間</th>
              <th style="width: 100px;">期限</th>
              <th style="width: 80px;">Edit</th>
            </tr>
          </thead>
          <tbody>
            ${tasks.length > 0 ? rowsHtml : '<tr><td colspan="6" class="flux-empty-cell">エラータスクはありません</td></tr>'}
          </tbody>
        </table>
      </div>
    `;

    // --- イベントリスナ ---

    // 一括操作ボタン
    this.root.querySelector('#btn-reload')?.addEventListener('click', () => {
      this.core.dispatch(DashboardActions.fetchErrorTasks);
    });

    this.root.querySelector('#btn-fix-range')?.addEventListener('click', () => {
      const targetIds = tasks.filter(t => t.isIncorrectRange).map(t => t.id);
      if (confirm(`${targetIds.length}件のタスク期限を適正化しますか？`)) {
        this.core.dispatch(DashboardActions.fixTaskDeadline, targetIds);
      }
    });

    this.root.querySelector('#btn-del-follow')?.addEventListener('click', () => {
      const targetIds = tasks.filter(t => t.isNeedFollow).map(t => t.id);
      if (confirm(`${targetIds.length}件の指導フォロータスクを削除（中止）しますか？`)) {
        this.core.dispatch(DashboardActions.deleteInstructionTask, targetIds);
      }
    });

    // 行ごとのボタン
    this.root.querySelectorAll('tr[data-id]').forEach(tr => {
      const id = tr.dataset.id;

      tr.querySelector('.action-complete')?.addEventListener('click', () => {
        this.core.dispatch(DashboardActions.completeTask, id);
      });
      tr.querySelector('.action-cancel')?.addEventListener('click', () => {
        this.core.dispatch(DashboardActions.deleteInstructionTask, id); // 中止扱い
      });
      tr.querySelector('.action-fix')?.addEventListener('click', () => {
        this.core.dispatch(DashboardActions.fixTaskDeadline, id);
      });
      tr.querySelector('.action-detail')?.addEventListener('click', () => {
        window.open(`${NX.CONST.host}/todo/todo_input.aspx?id=${id}`);
      });
    });
  }
}
