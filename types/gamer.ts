import { Cell, Field } from "../game/Field";
import Point from "../game/Point";
import Ship from "../game/Ship";
import { GameStage, Status } from "./enums";
import GamerForClient from "./gamerForClient";
import GamingSocket from "./gamingSocket";
import { User } from "./user";

export default class Gamer {
  private _login: string
  private _avatar: string
  private _id: string
  private _status: Status
  private _gameStage: GameStage
  private _socket: GamingSocket
  private _partner: Gamer | null
  private _timeoutIdForDeleteGamer?: NodeJS.Timeout

  private _field: Field
  private _partnerField: Field
  private _isStep: boolean
  private _numberOfHits: number
  private _numberOfMisses: number
  private _isWinner: boolean

  static arrShipSize = [4, 3, 3, 2, 2, 2, 1, 1, 1, 1]
  constructor(
    login: string,
    avatar: string,
    id: string,
    status: Status,
    gameStage: GameStage,
    socket: GamingSocket,
    partner?: Gamer,
    timeoutIdForDeleteGamer?: NodeJS.Timeout
  ) {
    this._login = login
    this._avatar = avatar
    this._id = id
    this._status = status
    this._gameStage = gameStage
    this._socket = socket
    this._partner = partner || null
    this._timeoutIdForDeleteGamer = timeoutIdForDeleteGamer

    this._field = new Field()
    this._partnerField = new Field()
    this._isStep = false
    this._numberOfHits = 0
    this._numberOfMisses = 0
    this._isWinner = false

  }
  get login(): string {
    return this._login
  }
  set login(value: string) {
    this._login = value
  }
  get avatar(): string {
    return this._avatar
  }
  set avatar(value: string) {
    this._avatar = value
  }
  get id(): string {
    return this._id
  }
  get status(): Status {
    return this._status
  }
  set status(value: Status) {
    this._status = value
  }
  get gameStage(): GameStage {
    return this._gameStage
  }
  set gameStage(value: GameStage) {
    this._gameStage = value
  }
  get socket(): GamingSocket {
    return this._socket
  }
  set socket(value: GamingSocket) {
    this._socket = value
  }
  get partner(): Gamer | null {
    return this._partner
  }
  get timeoutIdForDeleteGamer(): NodeJS.Timeout | undefined {
    return this._timeoutIdForDeleteGamer
  }
  set timeoutIdForDeleteGamer(value: NodeJS.Timeout | undefined) {
    this._timeoutIdForDeleteGamer = value
  }
  get numberOfHits(): number {
    return this._numberOfHits
  }
  set numberOfHits(value: number) {
    this._numberOfHits = value
  }
  get numberOfMisses(): number {
    return this._numberOfMisses
  }
  set numberOfMisses(value: number) {
    this._numberOfMisses = value
  }
  get isWinner(): boolean {
    return this._isWinner
  }
  set isWinner(value: boolean) {
    this._isWinner = value
  }
  setPartner(partner: Gamer | null) {
    if (!partner) {
      if (this._partner) {
        this._partner._partner = null
        this._partner = null
      } else
        this._partner = null
      return
    }
    this._partner = partner
    partner._partner = this
  }

  get field(): Field {
    return this._field
  }
  get partnerField(): Field {
    return this._partnerField
  }
  get isStep(): boolean {
    return this._isStep
  }
  private createField(): Field {
    const field = new Field(10, 10)
    const point = new Point()
    Gamer.arrShipSize.forEach(shipSize => {
      const ship = new Ship(shipSize)
      for (const i in field.field) {
        point.setIndex(Number(i), field.n)
        if (field.canSetShip(ship, point)) {
          field.setShip(ship, point)
          return
        }
      }
    })
    return field
  }
  initFields() {
    const fieldSize = 10
    this._field = this.createField()
    this._partnerField = new Field(fieldSize, fieldSize)
    if (this.partner) {
      this.partner._field = this.createField()
      this.partner._partnerField = new Field(fieldSize, fieldSize)
    }
  }

  toUser(): User {
    return { login: this.login, avatar: this.avatar, id: "" }
  }
  toGamerForClient(): GamerForClient {
    return {
      login: this.login,
      avatar: this.avatar,
      status: this.status,
      gameStage: this.gameStage,
      isStep: this.isStep
    }
  }


  syncLogin(value?: string, isSyncWithPartner: boolean = true) {
    if (value !== undefined)
      this.login = value
    this.socket.emit("setGamer", { login: this.login })
    if (isSyncWithPartner && this.partner)
      this.partner?.socket.emit("setPartner", { login: this.login })
  }
  syncAvatar(value?: string, isSyncWithPartner: boolean = true) {
    if (value !== undefined)
      this.avatar = value
    this.socket.emit("setGamer", { avatar: this.avatar })
    if (isSyncWithPartner && this.partner)
      this.partner.socket.emit("setPartner", { avatar: this.avatar })
  }
  syncStatus(value?: Status, isSyncWithPartner: boolean = true) {
    if (value !== undefined)
      this.status = value
    this.socket.emit("setGamer", { status: this.status })
    if (isSyncWithPartner && this.partner)
      this.partner.socket.emit("setPartner", { status: this.status })
  }
  syncGameStage(value?: GameStage, isSyncWithPartner: boolean = true) {
    if (value !== undefined) {
      this.gameStage = value
      if (this.partner)
        this.partner.gameStage = value
    }
    this.socket.emit("setGamer", { gameStage: this.gameStage })
    if (isSyncWithPartner && this.partner)
      this.partner.socket.emit("setGamer", { gameStage: this.gameStage })
  }
  syncPartner(value?: Gamer | null, isSyncWithPartner: boolean = true) {
    if (value !== undefined)
      this.setPartner(value)
    this.socket.emit("setPartner", this.partner?.toGamerForClient() || null)

    if (this.partner && isSyncWithPartner) {
      this.partner.socket.emit("setPartner", this.toGamerForClient())
    }
  }
  syncField(isSyncWithPartner: boolean = true) {
    this.socket.emit("initField", this.field.n, this.field.m)
    this.syncFieldChanges(this.field.field, isSyncWithPartner)
    if (this.partner && isSyncWithPartner) {
      this.partner.socket.emit("initField", this.partner.field.n, this.partner.field.m)
      this.partner.syncFieldChanges(this.partner.field.field)
    }
  }

  syncFieldChanges(fieldChanges: { [key: number]: Cell }, isSyncWithPartner: boolean = true) {
    this.socket.emit("setOnField", fieldChanges)
    if (this.partner) {
      const temp = { ...fieldChanges }
      for (const i in temp) {
        if (temp[i] === Cell.ship)
          temp[i] = Cell.empty
      }
      this.partner._partnerField = this.partner.partnerField.getNewField(temp)
      if (isSyncWithPartner)
        this.partner.socket.emit("setOnPartnerField", temp)
    }
  }
  syncIsStep(value?: boolean, isSyncWithPartner: boolean = true) {
    if (value !== undefined) {
      this._isStep = value
      if (this.partner)
        this.partner._isStep = !value
    }
    this.socket.emit("setGamer", { isStep: this.isStep })
    if (this.partner && isSyncWithPartner)
      this.partner.socket.emit("setGamer", { isStep: this.partner.isStep })
  }
  syncNumberOfHits(value?: number, isSyncWithPartner: boolean = true) {
    if (value !== undefined)
      this.numberOfHits = value
    this.socket.emit("setGamer", { numberOfHits: this.numberOfHits })
    if (isSyncWithPartner && this.partner)
      this.partner.socket.emit("setPartner", { numberOfHits: this.numberOfHits })
  }
  syncNumberOfMisses(value?: number, isSyncWithPartner: boolean = true) {
    if (value !== undefined)
      this.numberOfMisses = value
    this.socket.emit("setGamer", { numberOfMisses: this.numberOfMisses })
    if (isSyncWithPartner && this.partner)
      this.partner.socket.emit("setPartner", { numberOfMisses: this.numberOfMisses })
  }
  syncIsWinner(value?: boolean, isSyncWithPartner: boolean = true) {
    if (value !== undefined)
      this.isWinner = value
    this.socket.emit("setGamer", { isWinner: this.isWinner })
    if (isSyncWithPartner && this.partner)
      this.partner.socket.emit("setPartner", { isWinner: this.isWinner })
  }
}