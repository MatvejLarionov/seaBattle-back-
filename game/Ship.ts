import Point from "./Point"

export default class Ship {
    private arr: Point[]
    constructor(size: number = 0) {
        this.arr = Array<Point>(size)

        this.arr[0] = new Point()
        let j = 1
        for (let i = 1; i < this.arr.length - 1; i += 2, j++) {
            this.arr[i] = new Point(j, 0)
            this.arr[i + 1] = new Point(-j, 0)
        }
        if (size % 2 === 0)
            this.arr[size - 1] = new Point(j, 0)
    }
    get arrPoint() {
        return this.arr
    }
    get length() {
        return this.arr.length
    }
    copy() {
        const ship = new Ship()
        ship.arr = this.arr.map(item => new Point(item.x, item.y))
        return ship
    }
    setShip(ship: Ship) {
        this.arr = ship.arr.map(item => new Point(item.x, item.y))

    }
    turn_clockwise(shipCenter: Point) {
        const center: Point = shipCenter || this.arr[0];

        let difference_x = 0;
        let difference_y = 0;

        for (let i = 0; i < this.arr.length; i++) {
            difference_x = center.x - this.arr[i].x;//0
            difference_y = center.y - this.arr[i].y;//1
            this.arr[i].x = center.x + difference_y;//2
            this.arr[i].y = center.y - difference_x;//1

        }
        return this.arr;
    }
    movToPoint(point: Point, shipCenter: Point = this.arr[0]) {
        const difference = new Point(point.x - shipCenter.x, point.y - shipCenter.y)
        for (let i = 0; i < this.arr.length; i++) {
            this.arr[i].x += difference.x
            this.arr[i].y += difference.y
        }
    }
}

module.exports = Ship