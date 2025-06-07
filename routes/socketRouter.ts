import usersData from "../data/usersData"
import Point from "../game/Point"
import ArrayGamers from "../types/arrayGamers"
import { GameStage, Status } from "../types/enums"
import Gamer from "../types/gamer"
import GamingSocket from "../types/gamingSocket"
const arrGamers = new ArrayGamers([])
const socketRouter = (socket: GamingSocket) => {
    // let user = {
    //     login: null,
    //     id: null,
    //     status: "connect",
    //     field: new Field(10, 10),
    //     partnerField: new Field(10, 10),
    //     countOfDestShip: 0,
    //     gameStage: "connecting",
    //     isStep: false,
    //     partner: undefined,
    //     ws: socket,
    //     timeoutId: undefined,
    //     setUser(userData) {
    //         user = userData
    //         user.ws = socket
    //         return user
    //     },
    //     setStatus(status) {
    //         this.status = status
    //     },
    //     setGameStage(gameStage) {
    //         this.gameStage = gameStage
    //     },
    //     setPartner(partner) {
    //         this.partner = partner
    //         this.partner.partner = this
    //     },
    //     removePartner() {
    //         this.partner.setGameStage("connecting")
    //         this.setGameStage("connecting")
    //         this.partner.partner = undefined
    //         this.partner = undefined
    //     },
    //     switchStep() {
    //         const temp = this.isStep
    //         this.isStep = this.partner.isStep
    //         this.partner.isStep = temp
    //     },
    //     resetGame() {
    //         this.field = new Field(10, 10)
    //         this.partnerField = new Field(10, 10)
    //         this.countOfDestShip = 0
    //         this.isStep = false
    //     },
    //     send(data) {
    //         this.ws.send(JSON.stringify(data))
    //     },
    //     sendPartner() {
    //         this.send({
    //             type: "setPartner",
    //             partner: { login: this.partner.login, status: this.partner.status }
    //         })
    //     },
    //     sendPartnerStatus() {
    //         this.send({
    //             type: "changeStatus",
    //             status: this.partner.status
    //         })
    //     },
    //     sendDataByGameStage(isSendToPartner = false) {
    //         const gameStageToType = {
    //             connecting: { type: "acceptJoin" },
    //             fillingField: { type: "setGameStage", gameStage: this.gameStage, field: this.field },
    //             battle: {
    //                 type: "setGameStage",
    //                 gameStage: this.gameStage,
    //                 field: this.field,
    //                 partnerField: this.partnerField,
    //                 isStep: this.isStep
    //             }
    //         }
    //         this.send(gameStageToType[this.gameStage])
    //         if (isSendToPartner)
    //             this.partner.sendDataByGameStage()
    //     },
    //     sendStep(isSendToPartner = false) {
    //         this.send({
    //             type: "setStep",
    //             isStep: this.isStep
    //         })
    //         if (isSendToPartner)
    //             this.partner.sendStep()
    //     }
    // }
    let gamer: Gamer

    socket.on("authorization", (userId: string) => {
        const tempGamer: Gamer | undefined = arrGamers.find((item) => item.id === userId)
        if (tempGamer) {
            gamer = tempGamer
            gamer.socket = socket
            if (gamer.timeoutIdForDeleteGamer) {
                clearTimeout(gamer.timeoutIdForDeleteGamer)
            }
            gamer.syncStatus(Status.connected)
            gamer.syncGameStage()
            gamer.syncPartner(gamer.partner || null, false)
            if (gamer.gameStage === GameStage.fillingInField)
                gamer.syncField(false)
            if (gamer.gameStage === GameStage.battle) {
                gamer.syncField(false)
                socket.emit("setOnPartnerField", gamer.partnerField.field)
                gamer.syncIsStep()
            }
            return
        }

        const user = usersData.getUserById(userId)
        if (!user)
            return
        gamer = new Gamer(user.login, user.avatar, user.id.toString(),
            Status.connected, GameStage.connecting, socket)
        arrGamers.push(gamer)
    })
    socket.on("disconnect", (reason) => {
        if (!gamer)
            return
        if (!gamer.partner) {
            arrGamers.delete(gamer)
            return
        }
        gamer.syncStatus(Status.disconnected)
        gamer.timeoutIdForDeleteGamer = setTimeout(() => {
            gamer.partner?.syncGameStage(GameStage.connecting)
            gamer.partner?.syncPartner(null)
            arrGamers.delete(gamer)
        }, 10000)
    })
    socket.on("requestToJoin", (partnerLogin: string) => {
        const partner: Gamer | undefined = arrGamers.find(item => item.login === partnerLogin)
        if (!partner || partner.login === gamer.login) {
            socket.emit("notFound")
            return
        }
        gamer.setPartner(partner)
        partner.socket.emit("requestToJoin", gamer.login)
    })
    socket.on("acceptToJoin", () => {
        if (!gamer.partner)
            return
        gamer.syncPartner()
        gamer.syncGameStage(GameStage.preparingForGame)
    })
    socket.on("rejectToJoin", () => {
        if (!gamer.partner)
            return
        gamer.partner.socket.emit("rejectToJoin")
        gamer.partner.setPartner(null)
    })
    socket.on("setGameReady", (value: boolean) => {
        if (gamer.partner?.status !== Status.readyToPlay) {
            gamer.syncStatus(value ? Status.readyToPlay : Status.connected)
            return
        }
        if (gamer.gameStage !== GameStage.fillingInField) {
            gamer.syncGameStage(GameStage.fillingInField)
            gamer.initFields()
            gamer.syncField()
            gamer.partner.syncStatus(Status.connected)
        } else {
            gamer.syncGameStage(GameStage.battle)
            gamer.partner.syncStatus(Status.connected)
            gamer.syncIsStep(Math.round(Math.random() * 100) % 2 === 0)
        }
    })
    socket.on("deletePartner", () => {
        gamer.syncGameStage(GameStage.connecting)
        gamer.syncPartner(null)
    })
    socket.on("movShip", (oldIndex: number, newIndex: number) => {
        if (!gamer)
            return
        if (gamer.gameStage !== GameStage.fillingInField)
            return
        const oldPoint = new Point()
        oldPoint.setIndex(oldIndex, gamer.field.n)
        const newPoint = new Point()
        newPoint.setIndex(newIndex, gamer.field.n)
        if (gamer.field.canMovShip(oldPoint, newPoint)) {
            const change = gamer.field.movShip(oldPoint, newPoint)
            if (change) {
                gamer.syncFieldChanges(change, false)
            }
        }
        socket.emit("fieldChangeIsCompleted")
    })
    socket.on("turnClockwiseShip", (index) => {
        if (!gamer)
            return
        if (gamer.gameStage !== GameStage.fillingInField)
            return
        const point = new Point()
        point.setIndex(index, gamer.field.n)
        if (gamer.field.canTurn_clockwise(point)) {
            const change = gamer.field.turn_clockwise(point)
            if (change)
                gamer.syncFieldChanges(change, false)
        }
    })
    socket.on("shoot", (index) => {
        if (!gamer)
            return
        if (!gamer.partner)
            return
        if (gamer.gameStage !== GameStage.battle)
            return
        const point = new Point()
        point.setIndex(index, gamer.field.n)
        if (!gamer.isStep || !gamer.partner.field.canShoot(point))
            return
        const result = gamer.partner.field.shoot(point)
        if (!result.isShoot) {
            gamer.syncIsStep(!gamer.isStep)
        }
        gamer.partner.syncFieldChanges(result.change)
    })
}

// setInterval(() => {
//     arrGamers.find(((item, index) => {
//         console.log(`${index} login : ${item.login}       partnerLogin : ${item.partner?.login}`)
//         return false
//     }))
//     console.log("-------------")
// }, 1000)

export default socketRouter