import express from "express";
import http from "http";
import path from "path";
import socketIO from "socket.io";

import GuessNumberGame from "./gameEngine";
import Player from "./player";

const PORT: number = 3000;


class App {
  private server: http.Server;
  private io: socketIO.Server;
  private games: {[id: number]: GuessNumberGame} = {};
  private players: {[id: string]: Player} = {};

  constructor(private port: number) {
    const app = express();
    app.use(express.static(path.join(__dirname, "../client")));
    app.use(
      "/jquery",
      express.static(path.join(__dirname, "../../node_modules/jquery/dist"))
    );
    app.use(
      "/bootstrap",
      express.static(path.join(__dirname, "../../node_modules/bootstrap/dist"))
    );

    this.server = new http.Server(app);
    this.io = socketIO(this.server);
    this.games[0] = new GuessNumberGame(
      0, "Bronze Game", "🥉", 10, 1, 10, this.players, this.updateChat, this.sendPlayerDetails
    );
    this.games[1] = new GuessNumberGame(
      1, "Silver Game", "🥈", 16, 3, 20, this.players, this.updateChat, this.sendPlayerDetails
    );
    this.games[2] = new GuessNumberGame(
      2, "Gold Game", "🥇", 35, 5, 50, this.players, this.updateChat, this.sendPlayerDetails
    );

    this.io.on("connection", (socket: socketIO.Socket) => {
      console.log("User Connected: ", socket.id);

      socket.on("disconnect", () => {
        console.log("User disconnected", socket.id);

        // Delete the player detail with current socket ID if present
        if (this.players && this.players[socket.id]) {
          const screenName = this.players[socket.id].screenName.name;
          delete this.players[socket.id];
          socket.broadcast.emit(
            "chatMessage",
            <ChatMessage>{message: `Bye bye <strong>${screenName}</strong>`, from: "🤖", type: "gameMessage"}
          );
        }
      });

      // Send the chat message to everyone else connected.
      socket.on(
        "chatMessage",
        (chatMessage: ChatMessage) => socket.broadcast.emit("chatMessage", chatMessage)
      );

      socket.on("screenName", (enteredName: ScreenName) => {
        let screenName: ScreenName = enteredName;

        // Create a new player with the given socket ID
        this.players[socket.id] = new Player(screenName);

        // Send the new player details to the client.
        socket.emit("playerDetails", this.players[socket.id].player);
        socket.broadcast.emit(
          "chatMessage",
          <ChatMessage>{message: `Welcome <strong>${screenName.name}</strong>`, from: "🤖", type: "gameMessage"}
        );
      });

      socket.on("submitGuess", (gameId: number, guess: number) => {
        if (guess >= 0 && guess <= 10) {
          if (this.games[gameId].submitGuess(socket.id, guess)) {
            socket.emit("confirmGuess", gameId, guess, this.players[socket.id].player.score)
          }
        }
      })
    });

    setInterval(() => {
      this.io.emit(
        "GameStates",
        [this.games[0].gameState, this.games[1].gameState, this.games[2].gameState]
      )
    }, 1000)
  }

  updateChat = (chatMessage: ChatMessage) => this.io.emit("chatMessage", chatMessage);

  sendPlayerDetails = (playerSocketID: string) => this.io.to(playerSocketID).emit("playerDetails", this.players[playerSocketID].player)

  Start() {
    this.server.listen(this.port);
    console.log("Server is listening on port", this.port);
  }
}


new App(PORT).Start();
