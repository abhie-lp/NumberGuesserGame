interface PlayerInterface {
  score: number,
  screenName: ScreenName
}

export default class Player implements PlayerInterface {
  private _score: number = 0;
  private _screenName: ScreenName;

  constructor(screenName: ScreenName) {
    this._screenName = screenName;
  }

  get score(): number {
    return this._score;
  }

  get screenName(): ScreenName {
    return this._screenName;
  }

  get player(): PlayerInterface {
    return <PlayerInterface>{score: this._score, screenName: this._screenName};
  }

  adjustScore = (amount: number) => {
    this._score += amount
  }
}
