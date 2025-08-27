export enum ServerErrors{
  notFound,
  emptyFields,
  loginRepeat,
  passwordIsNotCorrect
}

export enum GameStage{
  connecting,
  preparingForGame,
  fillingInField,
  battle,
  endGame
}

export enum Status{
  connected,
  disconnected,
  readyToPlay
}