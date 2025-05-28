import { Socket } from "socket.io";
import { User } from "./user";

type GamingSocket = Socket<
  {
    authorization: (userId: string) => void
    
    requestToJoin: (partnerLogin: string) => void
    acceptToJoin: () => void
    rejectToJoin: () => void
  },
  {
    requestToJoin: (partnerLogin: string) => void
    acceptToJoin: (partner: User) => void
    rejectToJoin: () => void
  }
>

export default GamingSocket