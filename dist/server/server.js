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
const PORT = 3000;
class App {
    constructor(port) {
        this.port = port;
        const app = express_1.default();
        app.use(express_1.default.static(path_1.default.join(__dirname, "../client")));
        this.server = new http_1.default.Server(app);
        this.io = socket_io_1.default(this.server);
        this.game = new gameEngine_1.default();
        this.io.on("connection", (socket) => {
            console.log("User Connected: ", socket.id);
            socket.on("disconnect", () => console.log("User disconnected", socket.id));
        });
    }
    Start() {
        this.server.listen(this.port);
        console.log("Server is listening on port", this.port);
    }
}
new App(PORT).Start();
//# sourceMappingURL=server.js.map