// flux/widgets/features/TaskWidget.js

import { Widget } from '../../core/Widget.js';
import { DashboardActions } from '../../actions/DashboardAction.js';

export class TaskWidget extends Widget {
  render(state) {
    const tasks = state.tasks || [];

    // リストのHTML生成
    const listHtml = tasks
      .map(task => {
        // 期限切れの場合のスタイル
        const dateClass = task.isOverdue ? 'flux-text-danger' : 'flux-text-muted';

        // 生徒連絡リンク
        const contactLink = task.student_cd
          ? `<a href="${NX.CONST.host}/s/student_renraku_list.aspx?student_cd=${task.student_cd}" target="_blank" class="flux-icon-link" title="生徒連絡"><i class="fa-solid fa-envelope"></i></a>`
          : '';

        return `
        <div class="flux-task-row" data-id="${task.id}">
          <div class="flux-task-check">
            <button class="flux-btn-check complete-btn" title="完了にする">
              <i class="fa-regular fa-square"></i>
            </button>
          </div>
          <div class="flux-task-main">
            <div class="flux-task-title">
              <a href="${NX.CONST.host}/todo/todo_input.aspx?id=${task.id}" target="_blank" class="flux-link">
                ${task.target} ${task.title}
              </a>
              ${contactLink}
            </div>
            <div class="flux-task-meta">
              <span class="${dateClass}"><i class="fa-regular fa-clock"></i> ${task.due}</span>
              <span class="flux-progress">(${task.progress})</span>
            </div>
          </div>
        </div>
      `;
      })
      .join('');

    // 全体枠
    this.root.innerHTML = `
      <div class="flux-card">
        <div class="flux-card-header">
            <h3><i class="fa-solid fa-list-check"></i> My Tasks</h3>
            <div class="flux-header-actions">
                <button class="flux-btn-icon add-btn" title="新規タスク"><i class="fa-solid fa-plus"></i></button>
                <button class="flux-btn-icon reload-btn"><i class="fa-solid fa-rotate"></i></button>
            </div>
        </div>
        <div class="flux-card-body">
            <div class="flux-task-list">
                ${tasks.length > 0 ? listHtml : '<div class="flux-empty-state">タスクはありません</div>'}
            </div>
        </div>
      </div>
    `;

    // --- イベント設定 ---

    // 1. 更新ボタン
    this.root.querySelector('.reload-btn')?.addEventListener('click', () => {
      this.core.dispatch(DashboardActions.fetchTasks);
    });

    // 2. 新規追加ボタン
    this.root.querySelector('.add-btn')?.addEventListener('click', () => {
      window.open(`${NX.CONST.host}/todo/todo_input.aspx`, '_blank');
    });

    // 3. 完了ボタン (動的に生成される要素なので forEach で設定)
    this.root.querySelectorAll('.complete-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        // ボタンの親要素からIDを取得
        const row = e.target.closest('.flux-task-row');
        const taskId = row.dataset.id;

        if (confirm('このタスクを完了にしますか？')) {
          // ActionをDispatch (taskIdを渡す)
          this.core.dispatch(DashboardActions.completeTask, taskId);
        }
      });
    });
  }
}
