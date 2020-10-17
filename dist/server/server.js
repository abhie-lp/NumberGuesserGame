"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = __importDefault(require("socket.io"));
const gameEngine_1 = __importDefault(require("./gameEngine"));
const player_1 = __importDefault(require("./player"));
const PORT = 3000;
class App {
    constructor(port) {
        this.port = port;
        this.games = {};
        this.players = {};
        this.updateChat = (chatMessage) => this.io.emit("chatMessage", chatMessage);
        this.sendPlayerDetails = (playerSocketID) => this.io.to(playerSocketID).emit("playerDetails", this.players[playerSocketID].player);
        const app = express_1.default();
        app.use(express_1.default.static(path_1.default.join(__dirname, "../client")));
        app.use("/jquery", express_1.default.static(path_1.default.join(__dirname, "../../node_modules/jquery/dist")));
        app.use("/bootstrap", express_1.default.static(path_1.default.join(__dirname, "../../node_modules/bootstrap/dist")));
        this.server = new http_1.default.Server(app);
        this.io = socket_io_1.default(this.server);
        this.games[0] = new gameEngine_1.default(0, "Bronze Game", "🥉", 10, 1, 10, this.players, this.updateChat, this.sendPlayerDetails);
        this.games[1] = new gameEngine_1.default(1, "Silver Game", "🥈", 16, 3, 20, this.players, this.updateChat, this.sendPlayerDetails);
        this.games[2] = new gameEngine_1.default(2, "Gold Game", "🥇", 35, 5, 50, this.players, this.updateChat, this.sendPlayerDetails);
        this.io.on("connection", (socket) => {
            console.log("User Connected: ", socket.id);
            socket.on("disconnect", () => {
                console.log("User disconnected", socket.id);
                // Delete the player detail with current socket ID if present
                if (this.players && this.players[socket.id]) {
                    delete this.players[socket.id];
                }
            });
            // Send the chat message to everyone else connected.
            socket.on("chatMessage", (chatMessage) => socket.broadcast.emit("chatMessage", chatMessage));
            socket.on("screenName", (enteredName) => {
                let screenName = enteredName;
                // Create a new player with the given socket ID
                this.players[socket.id] = new player_1.default(screenName);
                // Send the new player details to the client.
                socket.emit("playerDetails", this.players[socket.id].player);
            });
            socket.on("submitGuess", (gameId, guess) => {
                if (guess >= 0 && guess <= 10) {
                    if (this.games[gameId].submitGuess(socket.id, guess)) {
                        socket.emit("confirmGuess", gameId, guess, this.players[socket.id].player.score);
                    }
                }
            });
        });
        setInterval(() => {
            this.io.emit("GameStates", [this.games[0].gameState, this.games[1].gameState, this.games[2].gameState]);
        }, 1000);
    }
    Start() {
        this.server.listen(this.port);
        console.log("Server is listening on port", this.port);
    }
}
new App(PORT).Start();
//# sourceMappingURL=server.js.map