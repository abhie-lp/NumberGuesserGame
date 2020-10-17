import Player from "./player";

export default class GuessNumberGame {
  private _id: number;
  private _title: string;
  private _logo: string;
  private _duration: number;
  private _gamePhase: number = 0;
  private _gameClock: number = 0;
  private _gameState: GameState;
  private _result: number = -1;

  private _players: {[id: string]: Player} = {};
  private _guesses: {[id: string]: number[]} = {};
  private _enterPoints: number; // Points to be incremented or decremented.
  private _updateChatCallback: (chatMessag: ChatMessage) => void;

  constructor(
    id: number,
    title: string,
    logo: string,
    duration: number,
    enterPoints: number,
    players: {[id: string]: Player},
    updateChatCallback: (chatMessage: ChatMessage) => void
  ) {
    this._id = id;
    this._title = title;
    this._logo = logo;
    this._duration = duration;
    this._enterPoints = enterPoints;
    this._players = players
    this._updateChatCallback = updateChatCallback;

    setInterval(() => {
      if (this._gamePhase === 0) {
        this._gameClock = this._duration;
        this._gamePhase = 1;
        this._guesses = {};
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
        if (this._gameClock === -2) {
          this._result = (Math.floor(Math.random() * 10) + 1);
          this._updateChatCallback(<ChatMessage>{message: "Result: " + this._result,
                                                 from: this._logo,
                                                 type: "gameMessage"});
        } else if (this._gameClock <= -5) {
          this._gamePhase = 0;
        }
      }
      this._gameState = {
        id: this._id,
        title: this._title,
        logo: this._logo,
        duration: this._duration,
        gameClock: this._gameClock,
        gamePhase: this._gamePhase,
        result: this._result
      };
      this._gameClock -= 1;
    }, 1000)
  }

  get gameState() { return this._gameState }

  submitGuess = (playerSocketId: string, guess: number): boolean => {
    if (!this._guesses[playerSocketId]) {
      this._guesses[playerSocketId] = []
    }

    this._players[playerSocketId].adjustScore(this._enterPoints * -1);
    this._guesses[playerSocketId].push(guess);

    if (this._guesses[playerSocketId].length == 1) {
      let chatMessage = <ChatMessage>{
        message: this._players[playerSocketId].screenName.name + " is playing",
        from: this._logo,
        type: "gameMessage"
      };
      this._updateChatCallback(chatMessage);
    }
    return true
  }
}