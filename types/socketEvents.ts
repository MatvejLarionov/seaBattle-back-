export interface ToServer {
  authorization: (userId: string) => void
}


export interface ToClient {
  temp: (str: string) => void
}
