import Gamer from "./gamer";

export default class ArrayGamers {
  constructor(
    private _arrayGamers: Array<Gamer>
  ) { }
  at(index: number): Gamer | undefined {
    return this._arrayGamers.at(index)
  }
  push(gamer: Gamer) {
    this._arrayGamers.push(gamer)
  }
  delete(gamer: Gamer) {
    const index = this._arrayGamers.findIndex((item) => item === gamer)
    if (index !== -1) {
      this._arrayGamers.splice(index, 1)
    }
  }
  find(predicate: (item: Gamer, index: number) => boolean): Gamer | undefined {
    return this._arrayGamers.find(predicate)
  }
}