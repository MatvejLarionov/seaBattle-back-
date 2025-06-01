import { Socket } from "socket.io";
import { User } from "./user";
import { GameStage, Status } from "./enums";

type GamingSocket = Socket<
  {
    authorization: (userId: string) => void

    requestToJoin: (partnerLogin: string) => void
    acceptToJoin: () => void
    rejectToJoin: () => void
  },
  {
    requestToJoin: (partnerLogin: string) => void
    rejectToJoin: () => void
    notFound: () => void

    setPartner: (partner: User) => void
    deletePartner: () => void

    setGameStage: (gameStage: GameStage) => void
    setPartnerStatus: (status: Status) => void
  }
>

export default GamingSocket