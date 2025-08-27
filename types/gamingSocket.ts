import { Socket } from "socket.io";
import GamerForClient from "./gamerForClient";
import { Cell } from "../game/Field";

type GamingSocket = Socket<
  {
    authorization: (userId: string) => void

    requestToJoin: (partnerLogin: string) => void
    acceptToJoin: () => void
    rejectToJoin: () => void

    setGameReady: (value: boolean) => void
    deletePartner: () => void

    movShip: (oldIndex: number, newIndex: number) => void
    turnClockwiseShip: (index: number) => void
    shoot: (index: number) => void

    finishGame: () => void
  },
  {
    requestToJoin: (partnerLogin: string) => void
    rejectToJoin: () => void
    notFound: () => void

    setGamer: (gamer: GamerForClient) => void
    setPartner: (partner: GamerForClient | null) => void

    initField: (n: number, m: number) => void
    setOnField: (field: { [key: number]: Cell }) => void
    setOnPartnerField: (field: { [key: number]: Cell }) => void
    fieldChangeIsCompleted: () => void
  }
>

export default GamingSocket