import { Socket } from "socket.io"
import { ToServer, ToClient } from "./socketEvents"
import { GameStage, Status } from "./enums"

class Gamer {
  constructor(
    private _login: string,
    private _id: string,
    private _socket: Socket<ToServer, ToClient>,
    private _status: Status,
    private _gameStage: GameStage,
    private _partner?: Gamer) { }
  get login(): string {
    return this._login
  }
  set login(value: string) {
    this._login = value
  }
  get id(): string {
    return this._id
  }
  set id(value: string) {
    this._id = value
  }
  get socket(): Socket<ToServer, ToClient> {
    return this._socket
  }
  set socket(value: Socket<ToServer, ToClient>) {
    this._socket = value
  }
  get partner(): Gamer | undefined {
    return this._partner
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
  setPartner(value: Gamer) {
    this._partner = value
    value._partner = this
  }
  removePartner(): void {
    if (this._partner) {
      this._partner.gameStage = GameStage.connecting
      this.gameStage = GameStage.connecting
      delete this._partner._partner
      delete this._partner
    }
  }
}