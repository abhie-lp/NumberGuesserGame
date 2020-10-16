"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Player {
    constructor(screenName) {
        this._score = 0;
        this.adjustScore = (amount) => {
            this._score += amount;
        };
        this._screenName = screenName;
    }
    get score() {
        return this._score;
    }
    get screenName() {
        return this._screenName;
    }
    get player() {
        return { score: this._score, screenName: this._screenName };
    }
}
exports.default = Player;
//# sourceMappingURL=player.js.map