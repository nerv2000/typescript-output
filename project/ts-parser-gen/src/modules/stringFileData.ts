export default class StringFileData {
  private _data: string
  private readonly newline = '\n';
  private readonly tap = '  ';

  constructor() {
    this._data = '';
  }

  get data() {
    return this._data;
  }

  public writeLine(tapCnt: number, add: string) {
    let tempTap: string = '';
    for(let i=0; i < tapCnt; i++) {
      tempTap += this.tap;
    }

    this._data += (tempTap + add + this.newline);
  }
}