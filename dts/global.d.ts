interface JQuery {
  netzpicker: (
    content: (string | number)[],
    // tslint:disable:no-irregular-whitespace
    size?: number | undefined,
    column?: number | undefined,
    cursor?: number | undefined,
    nextfocus?: JQuery<HTMLElement> | undefined
  ) => JQuery<HTMLElement>;
  netzpicker2: (
    object: { [x: string]: string },
    textobject?: JQuery<HTMLElement> | undefined
  ) => JQuery<HTMLElement>;
  netztracer: (selecter: string, addoption?: boolean) => JQuery<HTMLElement>;
  isAllNumeric: (strict?: boolean) => JQuery<HTMLElement>;
  netztimepicker: (
    shidotime: boolean,
    selecterhour?: string | undefined,
    selectermin?: string | undefined
  ) => JQuery<HTMLElement>;
  inputremover: () => JQuery<HTMLElement>;
  setweekday: () => JQuery<HTMLElement>;
  clickToggle: (a: any, b: any) => JQuery<HTMLElement>;
  selectSwitcher: (array: any[]) => JQuery<HTMLElement>;
  keydownAwait: (func: Function, awaittime?: number) => JQuery<HTMLElement>;
  afterdayer: (object1: JQuery<HTMLElement>) => JQuery<HTMLElement>;
  addDataforTable: (func: Function, headnum?: number) => void;
  netztabler: (headnum?: number | undefined) => JQuery<HTMLElement>;
  mouseposition: () => JQuery<HTMLElement>;
  swipe: (funcorobj: Function | JQuery<HTMLElement>) => JQuery<HTMLElement>;
  fireswipe: () => JQuery<HTMLElement>;
  documentswipe: (
    funcorobj: Function | JQuery<HTMLElement>,
    selecter: string
  ) => JQuery<HTMLElement>;
  swipebutton: (func: Function, func2?: Function | undefined) => JQuery<HTMLElement>;
  swipebuttonclick: () => void;
  setRight: (obj: JQuery<HTMLElement>) => JQuery<HTMLElement>;
  setUnder: (obj: JQuery<HTMLElement>) => JQuery<HTMLElement>;
  buttonHold: (time: any, func: any) => void;
  tabletradd: (removeflag: any) => any;
  selectSearcher: (always?: boolean) => JQuery<HTMLElement>;
  addDatafortr: (attrname: string, func: Function) => JQuery<HTMLElement>;
  valuetooltip: () => JQuery<HTMLElement>;
  setshortcutkey: (key: KeyboardEvent.key, keyoption?: KeyOption) => JQuery<HTMLElement>;
}
