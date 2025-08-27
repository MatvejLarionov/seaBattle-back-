export default class Point {
    private _x
    private _y
    constructor(x?: number, y?: number) {
        this._x = x || 0
        this._y = y || 0
    }
    get x(): number {
        return this._x
    }
    set x(value: number) {
        this._x = value
    }
    get y(): number {
        return this._y
    }
    set y(value: number) {
        this._y = value
    }
    getIndex(n: number) {
        return n * this.y + this.x
    }
    setIndex(index: number, n: number) {
        this.x = index % n
        this.y = Math.floor(index / n)

    }
    convertToNewPoint(arr: Point[], point: Point) {
        const differenceX = point.x - arr[0].x
        const differenceY = point.y - arr[0].y

        return arr.map(item => {
            return new Point(item.x + differenceX, item.y + differenceY)
        })
    }
}