import usersData from "../data/usersData"
import Point from "../game/Point"
import ArrayGamers from "../types/arrayGamers"
import { GameStage, Status } from "../types/enums"
import Gamer from "../types/gamer"
import GamingSocket from "../types/gamingSocket"
const arrGamers = new ArrayGamers([])
const socketRouter = (socket: GamingSocket) => {
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
            gamer.syncGameStage(undefined, false)
            gamer.syncPartner(gamer.partner || null, false)
            switch (gamer.gameStage) {
                case GameStage.fillingInField:
                    gamer.syncField(false)
                    break;
                case GameStage.battle:
                    gamer.syncField(false)
                    socket.emit("setOnPartnerField", gamer.partnerField.field)
                    gamer.syncIsStep()
                    break;
                case GameStage.endGame:
                    gamer.syncNumberOfHits(undefined, false)
                    gamer.syncNumberOfMisses(undefined, false)
                    gamer.syncIsWinner(gamer.isWinner, false)
                    break;
                default:
                    break;
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
        gamer.partner.syncFieldChanges(result.change)
        if (!result.isShoot) {
            gamer.numberOfMisses++
            gamer.syncIsStep(!gamer.isStep)
            return
        }
        gamer.numberOfHits++
        if (gamer.numberOfHits === Gamer.arrShipSize.reduce((previousValue, currentValue) => previousValue + currentValue)) {
            gamer.syncGameStage(GameStage.endGame)
            gamer.syncNumberOfHits(undefined, false)
            gamer.syncNumberOfMisses(undefined, false)
            gamer.syncIsWinner(true, false)

            gamer.partner.syncGameStage(GameStage.endGame)
            gamer.partner.syncNumberOfHits(undefined, false)
            gamer.partner.syncNumberOfMisses(undefined, false)
        }
    })
    socket.on("finishGame", () => {
        gamer.gameStage = GameStage.preparingForGame
        socket.emit("setGamer", { gameStage: GameStage.preparingForGame })
        gamer.isWinner = false
        gamer.numberOfHits = 0
        gamer.numberOfMisses = 0
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