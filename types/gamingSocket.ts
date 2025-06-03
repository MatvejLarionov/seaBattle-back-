import { Socket } from "socket.io";
import GamerForClient from "./gamerForClient";

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

    setGamer: (gamer: GamerForClient) => void
    setPartner: (partner: GamerForClient | null) => void
  }
>

export default GamingSocket