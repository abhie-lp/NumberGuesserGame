"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GuessNumberGame {
    constructor(id, title, logo, duration, enterPoints, winPoints, players, updateChatCallback, sendPlayerDetailsCallback) {
        this._gamePhase = 0;
        this._gameClock = 0;
        this._result = -1;
        this._players = {};
        this._guesses = {};
        this.submitGuess = (playerSocketId, guess) => {
            if (!this._guesses[playerSocketId]) {
                this._guesses[playerSocketId] = [];
            }
            this._players[playerSocketId].adjustScore(this._enterPoints * -1);
            this._guesses[playerSocketId].push(guess);
            if (this._guesses[playerSocketId].length == 1) {
                let chatMessage = {
                    message: this._players[playerSocketId].screenName.name + " is playing",
                    from: this._logo,
                    type: "gameMessage"
                };
                this._updateChatCallback(chatMessage);
            }
            return true;
        };
        this._id = id;
        this._title = title;
        this._logo = logo;
        this._duration = duration;
        this._enterPoints = enterPoints;
        this._players = players;
        this._winPoints = winPoints;
        this._updateChatCallback = updateChatCallback;
        this._sendPlayerDetailsCallback = sendPlayerDetailsCallback;
        setInterval(() => {
            if (this._gamePhase === 0) {
                this._gameClock = this._duration;
                this._gamePhase = 1;
                this._guesses = {};
                this._winners = [];
                this._winnersCalculated = false;
                this._updateChatCallback({ message: "New Game",
                    from: this._logo,
                    type: "gameMessage" });
            }
            else if (this._gamePhase === 1) {
                if (this._gameClock < 0) {
                    this._gamePhase = 2;
                    this._updateChatCallback({ message: "Game Closed",
                        from: this._logo,
                        type: "gameMessage" });
                }
            }
            else if (this._gamePhase === 2) {
                if (this._gameClock === -2) {
                    this._result = (Math.floor(Math.random() * 10) + 1);
                    this._updateChatCallback({ message: "Result: " + this._result,
                        from: this._logo,
                        type: "gameMessage" });
                }
                else if (this._gameClock === -3) {
                    // get winners
                    this._winners = this.calculateWinners(this._result);
                    this._winners.forEach(winner => {
                        this._players[winner].adjustScore(this._winPoints);
                        this._sendPlayerDetailsCallback(winner);
                    });
                    this._winnersCalculated = true;
                }
                else if (this._gameClock <= -5) {
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
                result: this._result,
                winners: this._winners,
                winnersCalculated: this._winnersCalculated
            };
            this._gameClock -= 1;
        }, 1000);
    }
    get gameState() { return this._gameState; }
    calculateWinners(number) {
        let ret = [];
        for (let playerSocketID in this._guesses) {
            for (let guess in this._guesses[playerSocketID]) {
                if (number === this._guesses[playerSocketID][guess]) {
                    ret.push(playerSocketID);
                }
            }
        }
        return ret;
    }
}
exports.default = GuessNumberGame;
//# sourceMappingURL=gameEngine.js.map