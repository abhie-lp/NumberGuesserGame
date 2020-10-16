import express from "express";
import http from "http";
import path from "path";
import socketIO from "socket.io";

import GuessNumberGame from "./gameEngine";

const PORT: number = 3000;


class App {
  private server: http.Server;
  private io: socketIO.Server;
  private game: GuessNumberGame;

  constructor(private port: number) {
    const app = express();
    app.use(express.static(path.join(__dirname, "../client")));

    this.server = new http.Server(app);
    this.io = socketIO(this.server);
    this.game = new GuessNumberGame();

    this.io.on("connection", (socket: socketIO.Socket) => {
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