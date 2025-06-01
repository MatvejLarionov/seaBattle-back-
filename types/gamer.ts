import { GameStage, Status } from "./enums";
import GamingSocket from "./gamingSocket";
import { User } from "./user";

export default class Gamer {
  constructor(
    private _login: string,
    private _avatar: string,
    private _id: string,
    private _status: Status,
    private _gameStage: GameStage,
    private _socket: GamingSocket,
    private _partner?: Gamer,
    private _timeoutIdForDeleteGamer?: NodeJS.Timeout
  ) { }
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
  get partner(): Gamer | undefined {
    return this._partner
  }
  get timeoutIdForDeleteGamer(): NodeJS.Timeout | undefined {
    return this._timeoutIdForDeleteGamer
  }
  set timeoutIdForDeleteGamer(value: NodeJS.Timeout | undefined) {
    this._timeoutIdForDeleteGamer = value
  }
  setPartner(partner: Gamer) {
    this._partner = partner
    partner._partner = this
  }
  deletePartner() {
    delete this._partner?._partner
    delete this._partner
  }
  toUser(): User {
    return { login: this.login, avatar: this.avatar, id: "" }
  }
}