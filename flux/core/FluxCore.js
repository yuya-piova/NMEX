export class FluxCore {
  constructor(initialState = {}) {
    this.state = initialState;
    this.listeners = [];
  }

  getState() {
    return this.state;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
    // console.log('FluxState:', this.state); // デバッグ用
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Actionを実行するためのメソッド
  async dispatch(actionFunc, payload) {
    if (typeof actionFunc === 'function') {
      await actionFunc(newState => this.setState(newState), this.state, payload);
    }
  }
}
