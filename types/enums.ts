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
  battle
}

export enum Status{
  connected,
  disconnected,
  readyToPlay
}