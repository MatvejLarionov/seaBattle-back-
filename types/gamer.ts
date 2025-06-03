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
  toUser(): User {
    return { login: this.login, avatar: this.avatar, id: "" }
  }
  toGamerForClient(): GamerForClient {
    return {
      login: this.login,
      avatar: this.avatar,
      status: this.status,
      gameStage: this.gameStage
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
}