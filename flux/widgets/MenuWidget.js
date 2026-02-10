import { Widget } from '../core/Widget.js';

export class MenuWidget extends Widget {
  render(state) {
    const activePage = state.currentPage || 'Dashboard';

    const menuItems = [
      { id: 'Dashboard', icon: 'fa-gauge-high', label: 'Dashboard' },
      { id: 'AsCoach', icon: 'fa-user-clock', label: 'AsCoach' },
      { id: 'Tasks', icon: 'fa-list-check', label: 'Tasks' },
      { id: 'BlockSales', icon: 'fa-chart-simple', label: 'Block Sales' },
      { id: 'Management', icon: 'fa-briefcase', label: 'Management' },
      { id: 'StudentCount', icon: 'fa-users', label: 'Student Count' }
    ];

    this.root.innerHTML = `
      <nav class="flux-sidebar-nav">
        ${menuItems
          .map(
            item => `
          <div class="flux-menu-item ${item.id === activePage ? 'active' : ''}" data-page="${item.id}">
            <div class="flux-menu-icon"><i class="fa-solid ${item.icon}"></i></div>
            <span class="flux-menu-text">${item.label}</span>
          </div>
        `
          )
          .join('')}
      </nav>
    `;

    // クリックイベント
    this.root.querySelectorAll('.flux-menu-item').forEach(el => {
      el.addEventListener('click', () => {
        const page = el.dataset.page;
        this.core.setState({ currentPage: page });
      });
    });
  }
}
