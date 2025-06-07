import Point from "./Point"
import Ship from "./Ship"

export enum Cell {
    empty,
    ship,
    destroyedShip,
    destroyedEmpty
}
export class Field {
    private _n: number
    private _m: number
    private _field: Cell[]
    private arrShips: Ship[]
    constructor(n: number = 0, m: number = 0) {
        this._n = n
        this._m = m
        this._field = Array.from({ length: this._n * this._m }, () => Cell.empty)
        this.arrShips = []

    }
    get length() {
        return this._field.length
    }
    get n(): number {
        return this._n
    }
    get m(): number {
        return this._m
    }
    get field(): Cell[] {
        return this._field
    }
    get(point: Point): Cell | undefined {
        if (point.x >= 0 && point.y >= 0 && point.x < this._n && point.y < this._m)
            return this._field[point.getIndex(this._n)]
    }
    set(point: Point, cell: Cell) {
        if (point.x >= 0 && point.y >= 0 && point.x < this._n && point.y < this._m) {
            this._field[point.getIndex(this._n)] = cell
            return true
        }
        return false
    }
    getNewField(field: { [key: number]: Cell }): Field {
        const newField = new Field(this.n, this.m)
        newField._field = [...this._field]
        for (const key in field) {
            newField._field[key] = field[key]
        }
        return newField
    }
    setShip(ship: Ship, point: Point, shipCenter?: Point): { [key: number]: Cell } {
        ship.movToPoint(point, shipCenter)
        this.arrShips.push(ship)
        const result: { [key: number]: Cell } = {}
        ship.arrPoint.forEach(item => {
            this.set(item, Cell.ship)
            result[item.getIndex(this.n)] = Cell.ship
        })
        return result
    }
    canSetShip(ship: Ship, point: Point, shipCenter?: Point, ignorShip: Ship = ship): boolean {
        const shipCopy: Ship = ship.copy()
        shipCopy.movToPoint(point, shipCenter)
        if (shipCopy.arrPoint.find(item => this.get(item) === undefined))
            return false
        const arrDirect: Point[] = [
            new Point(0, 0),
            new Point(1, 0),
            new Point(1, 1),
            new Point(0, 1),
            new Point(-1, 1),
            new Point(-1, 0),
            new Point(-1, -1),
            new Point(0, -1),
            new Point(1, -1),
        ]
        const isEsc: { [key: number]: boolean } = {}
        shipCopy.arrPoint.forEach(i => {
            arrDirect.forEach(j => {
                const tempPoint = new Point(i.x + j.x, i.y + j.y)
                if (this.get(tempPoint) !== undefined)
                    isEsc[tempPoint.getIndex(this.n)] = false
            })
        })
        ignorShip.arrPoint.forEach(i => {
            isEsc[i.getIndex(this.n)] = true
        })
        for (const i in isEsc) {
            if (!isEsc[i] && (this._field[i] === Cell.ship || this._field[i] === Cell.destroyedShip))
                return false
        }
        return true
    }
    getIndexShip(point: Point): number {
        return this.arrShips.findIndex(ship =>
            ship.arrPoint.find(pnt => pnt.x === point.x && pnt.y === point.y))
    }
    getShip(point: Point): Ship | undefined {
        const index = this.getIndexShip(point)
        return this.arrShips[index]
    }
    deleteShip(point: Point) {
        const index = this.getIndexShip(point)
        if (index === undefined)
            return
        const ship = this.arrShips[index]
        ship.arrPoint.forEach(item => {
            this.set(item, Cell.empty)
        })
        return this.arrShips.splice(index, 1).at(0)
    }
    canMovShip(oldPoint: Point, newPoint: Point): boolean {
        const ship = this.getShip(oldPoint)
        return ship ? this.canSetShip(ship, newPoint, oldPoint) : false
    }
    movShip(oldPoint: Point, newPoint: Point): { [key: number]: Cell } | undefined {
        const ship = this.deleteShip(oldPoint)
        const result: { [key: number]: Cell } = {}
        if (!ship)
            return
        ship.arrPoint.forEach(item => {
            result[item.getIndex(this.n)] = Cell.empty
        })
        return { ...result, ...this.setShip(ship, newPoint, oldPoint) }

    }
    canTurn_clockwise(point: Point): boolean {
        const ship = this.getShip(point)?.copy()
        if (!ship)
            return false
        ship.turn_clockwise(point)
        return this.canSetShip(ship, point, point, this.getShip(point))
    }
    turn_clockwise(point: Point): { [key: number]: Cell } | undefined {
        const ship = this.deleteShip(point)
        if (!ship)
            return
        const result: { [key: number]: Cell } = {}
        ship.arrPoint.forEach(item => {
            result[item.getIndex(this.n)] = Cell.empty
        })
        ship.turn_clockwise(point)
        return { ...result, ...this.setShip(ship, point, point) }
    }
    canShoot(point: Point): boolean {
        return this.get(point) !== Cell.destroyedEmpty && this.get(point) !== Cell.destroyedShip
    }
    shoot(point: Point): { change: { [key: number]: Cell }, isShoot: boolean } {
        if (this.get(point) !== Cell.ship) {
            this.set(point, Cell.destroyedEmpty)
            return { change: { [point.getIndex(this.n)]: Cell.destroyedEmpty }, isShoot: false }
        }
        this.set(point, Cell.destroyedShip)
        const change: { [key: number]: Cell } = {
            [point.getIndex(this.n)]: Cell.destroyedShip
        }
        const arrDirect: Point[] = [
            new Point(1, 1),
            new Point(-1, 1),
            new Point(-1, -1),
            new Point(1, -1)
        ]
        arrDirect.forEach(i => {
            const tempPoint = new Point(point.x + i.x, point.y + i.y)
            if (this.get(tempPoint) !== undefined) {
                this.set(tempPoint, Cell.destroyedEmpty)
                change[tempPoint.getIndex(this.n)] = Cell.destroyedEmpty
            }
        })

        const ship = this.getShip(point)
        const arrShipPoint = ship!.arrPoint
        let isShipDead = true
        for (const key in arrShipPoint) {
            if (this.get(arrShipPoint[key]) === Cell.ship) {
                isShipDead = false
                break
            }
        }
        if (!isShipDead) {
            return { change, isShoot: true }
        }
        const arrDirect2 = [
            new Point(1, 0),
            new Point(0, 1),
            new Point(-1, 0),
            new Point(0, -1)
        ]
        arrShipPoint.forEach(i => {
            arrDirect2.forEach(j => {
                const tempPoint = new Point(i.x + j.x, i.y + j.y)
                const cell = this.get(tempPoint)
                if (cell !== Cell.destroyedShip && cell !== undefined) {
                    this.set(tempPoint, Cell.destroyedEmpty)
                    change[tempPoint.getIndex(this.n)] = Cell.destroyedEmpty
                }
            })
        })
        return { change, isShoot: true }
    }
    // setField(field: Field) {
    //     this.n = field.n
    //     this.m = field.m
    //     this.arr = Array.from({ length: this.n * this.m }, () => Cell.empty)
    //     this.arrShips = field.arrShips.map(item => {
    //         const ship = new Ship()
    //         ship.setShip(item)
    //         return ship
    //     })
    //     field.arr.forEach((item, index) => {
    //         const point = new Point()
    //         point.setIndex(index, this.n)
    //         this.set(point, item)
    //     })
    // }





    // canMovShip(oldPoint, newPoint) {
    //     const ship = this.getShip(oldPoint)
    //     return this.canSetShip(ship, newPoint, oldPoint)
    // }
    // movShip(oldPoint, newPoint) {
    //     const ship = this.deleteShip(oldPoint)
    //     if (ship)
    //         this.setShip(ship, newPoint, oldPoint)
    // }
    // canTurn_clockwise(point) {
    //     const ship = this.getShip(point).copy()
    //     ship.turn_clockwise(point)
    //     return this.canSetShip(ship, point, point, this.getShip(point))
    // }
    // turn_clockwise(point) {
    //     const ship = this.deleteShip(point)
    //     ship.turn_clockwise(point)
    //     this.setShip(ship, point, point)
    // }
    // canShoot(point) {
    //     return this.get(point) !== "destroyedShip" && this.get(point) !== "destroyedEmpty"
    // }
    // shoot(point) {
    //     const changeField = {}
    //     let type = "toEmpty"
    //     if (this.get(point) === "ship") {
    //         type = "toShip"
    //         const arrPoint = [
    //             new Point(1, 1),
    //             new Point(-1, 1),
    //             new Point(-1, -1),
    //             new Point(1, -1)
    //         ]
    //         this.set(point, "destroyedShip")
    //         changeField[point.getIndex(this.n)] = "destroyedShip"

    //         arrPoint.forEach(item => {
    //             const point1 = new Point(point.x + item.x, point.y + item.y)
    //             if (this.set(point1, "destroyedEmpty"))
    //                 changeField[point1.getIndex(this.n)] = "destroyedEmpty"
    //         })

    //         const ship = this.getShip(point)
    //         if (!ship.pointArray.find(item => this.get(item) === "ship")) {
    //             type = "shipIsDead"
    //             const arrPoint1 = [
    //                 new Point(1, 0),
    //                 new Point(1, 1),
    //                 new Point(0, 1),
    //                 new Point(-1, 1),
    //                 new Point(-1, 0),
    //                 new Point(-1, -1),
    //                 new Point(0, -1),
    //                 new Point(1, -1)
    //             ]
    //             ship.pointArray.forEach(item => {
    //                 arrPoint1.forEach(i => {
    //                     const point1 = new Point(item.x + i.x, item.y + i.y)
    //                     if (this.get(point1) !== "destroyedShip") {
    //                         if (this.set(point1, "destroyedEmpty"))
    //                             changeField[point1.getIndex(this.n)] = "destroyedEmpty"
    //                     }
    //                 })
    //             })
    //         }
    //     }
    //     else if (this.get(point) === "empty") {
    //         this.set(point, "destroyedEmpty")
    //         changeField[point.getIndex(this.n)] = "destroyedEmpty"
    //     }
    //     return { type, changeField }
    // }
}
// const field = new Field(10, 10)
// const ship = new Ship(3)
// field.setShip(ship, new Point(4, 5))
// console.log(field)
// field.deleteShip(new Point(3, 5))
// console.log(field)