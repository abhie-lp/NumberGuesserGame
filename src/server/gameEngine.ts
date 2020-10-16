export default class GuessNumberGame {
  private _id: number;
  private _title: string;
  private _logo: string;
  private _duration: number;
  private _gamePhase: number = 0;
  private _gameClock: number = 0;
  private _gameState: GameState;
  private _updateChatCallback: (chatMessag: ChatMessage) => void;

  constructor(
    id: number,
    title: string,
    logo: string,
    duration: number,
    updateChatCallback: (chatMessage: ChatMessage) => void
  ) {
    this._id = id;
    this._title = title;
    this._logo = logo;
    this._duration = duration;
    this._updateChatCallback = updateChatCallback;

    setInterval(() => {
      if (this._gamePhase === 0) {
        this._gameClock = this._duration;
        this._gamePhase = 1;
        this._updateChatCallback(<ChatMessage>{message: "New Game",
                                               from: this._logo,
                                               type: "gameMessage"})
      } else if (this._gamePhase === 1) {
        if (this._gameClock < 0) {
          this._gamePhase = 2;
          this._updateChatCallback(<ChatMessage>{message: "Game Closed",
                                                 from: this._logo,
                                                 type: "gameMessage"})
        }
      } else if (this._gamePhase === 2) {
        if (this._gameClock <= -5) {
          this._gamePhase = 0;
        }
      }
      this._gameState = {
        id: this._id,
        title: this._title,
        logo: this._logo,
        duration: this._duration,
        gameClock: this._gameClock,
        gamePhase: this._gamePhase
      };
      this._gameClock -= 1;
    }, 1000)
  }

  get gameState() { return this._gameState }
}