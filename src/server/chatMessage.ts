type ChatMessage = {
  message: string,
  from: string,
  type: "playerMessage" | "gameMessage",
  gameID?: number
}