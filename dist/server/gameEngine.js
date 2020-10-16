"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class GuessNumberGame {
    constructor(id, title, logo, duration) {
        this._gamePhase = 0;
        this._gameClock = 0;
        this._id = id;
        this._title = title;
        this._logo = logo;
        this._duration = duration;
        setInterval(() => {
            if (this._gamePhase === 0) {
                this._gameClock = this._duration;
                this._gamePhase = 1;
            }
            else if (this._gamePhase === 1) {
                if (this._gameClock < 0) {
                    this._gamePhase = 2;
                }
            }
            else if (this._gamePhase === 2) {
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
        }, 1000);
    }
    get gameState() { return this._gameState; }
}
exports.default = GuessNumberGame;
//# sourceMappingURL=gameEngine.js.map