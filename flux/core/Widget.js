export class Widget {
  constructor(fluxCore) {
    this.core = fluxCore;
    this.root = document.createElement('div');
    this.root.className = 'flux-widget';
  }

  mount(selector) {
    const parent = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (parent) {
      parent.appendChild(this.root);
      this.init();
    }
  }

  init() {
    this.render(this.core.getState());
    this.core.subscribe(state => this.render(state));
  }

  render(state) {
    this.root.innerHTML = '';
  }
}
