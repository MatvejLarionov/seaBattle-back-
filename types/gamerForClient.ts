import { GameStage, Status } from "./enums";

export default interface GamerForClient {
  login?: string,
  avatar?: string,
  status?: Status,
  gameStage?: GameStage,
  isStep?: boolean
}