import usersData from "../data/usersData"
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
            gamer.status = Status.connected
            if (gamer.timeoutIdForDeleteGamer) {
                clearTimeout(gamer.timeoutIdForDeleteGamer)
            }
            socket.emit("setGameStage", gamer.gameStage)
            if (gamer.partner) {
                socket.emit("setPartner", gamer.partner.toUser())
                gamer.partner.socket.emit("setPartnerStatus", gamer.status)
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
        gamer.status = Status.disconnected
        gamer.partner.socket.emit("setPartnerStatus", gamer.status)
        gamer.timeoutIdForDeleteGamer = setTimeout(() => {
            gamer.partner?.socket.emit("deletePartner")
            gamer.partner!.gameStage = GameStage.connecting
            gamer.partner?.socket.emit("setGameStage", gamer.partner.gameStage)
            gamer.deletePartner()
        }, 4000)
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
        socket.emit("setPartner", gamer.partner.toUser())
        gamer.partner.socket.emit("setPartner", gamer.toUser())

        gamer.gameStage = gamer.partner.gameStage = GameStage.preparingForGame

        socket.emit("setGameStage", gamer.gameStage)
        gamer.partner.socket.emit("setGameStage", gamer.partner.gameStage)
    })
    socket.on("rejectToJoin", () => {
        if (!gamer.partner)
            return
        gamer.partner.socket.emit("rejectToJoin")
        gamer.partner.deletePartner()
    })
}

setInterval(() => {
    arrGamers.find(((item, index) => {
        console.log(`${index} login : ${item.login}       partnerLogin : ${item.partner?.login}`)
        return false
    }))
    console.log("-------------")
}, 1000)

export default socketRouter