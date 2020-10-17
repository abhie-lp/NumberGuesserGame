type ChatMessage = {
  message: string,
  from: string,
  type: "playerMessage" | "gameMessage"
}

type ScreenName = {
  name: string,
  abbreviation: string
}

type Player = {
  score: number,
  screenName: ScreenName
}

type GameState = {
  id: number,
  title: string,
  logo: string,
  gamePhase: number,
  gameClock: number,
  duration: number,
  result: number
}


class Client {
  private socket: SocketIOClient.Socket;
  private player: Player;
  // To track whether the player has made guesses in any game i.e 0 or 1 or 2
  private inThisRound: boolean[] = [false, false, false];

  constructor() {
    this.socket = io();
    
    this.socket.on("connect", () => console.log("Connected"));
    this.socket.on("disconnect", (message: any) => {
      console.log("Disconnected", message);
      setTimeout(() => {
        location.reload()
      }, 1000)
    });

    this.socket.on(
      "chatMessage",
      (chatMessage: ChatMessage) => {
        let [floatDirection, messageClass] = ["right", "otherMessage"];

        if (chatMessage.type == "gameMessage") {
          [floatDirection, messageClass] = ["left", "gameMessage"]
        }

        $("#messages").append(
          "<li>" +
            `<span class='float-${floatDirection}'>` +
              '<span class="circle">' +
                  chatMessage.from +
              '</span>' +
            '</span>' +
            `<div class="${messageClass}">` +
              chatMessage.message +
            '</div>' +
          '</li>'
        );
        this.scrollChatWindow();
      }
    );

    this.socket.on("playerDetails", (player: Player) => {
      this.player = player;
      $(".screenName").text(player.screenName.name);
      $(".score").text(player.score);
    })

    this.socket.on("GameStates", (gameStates: GameState[]) => {
      gameStates.forEach(gameState => {
        let gid = gameState.id;
        if (gameState.gameClock >= 0) { // New game begins.
          if (gameState.gameClock >= gameState.duration) {
            $("#gamephase" + gid).text("New game. Time to check your luck.");
            for (let x = 0; x < 10; x++) {
              // Enable all buttons to be clicked on a new game.
              $("#submitButton" + gid + x).prop("disabled", false);
            }
          }

          if (gameState.gameClock === gameState.duration - 5) {
            (<any>$("#resultAlert" + gid)).alert().fadeOut(500);
          }

          $("#timer" + gid).css("display", "block");
          $("#timer" + gid).text(gameState.gameClock.toString());

          let progressParent = (gameState.gameClock / gameState.duration) * 100;
          $("#timerBar" + gid).css("background-color", "#4caf50");
          $("#timerBar" + gid).css("width", progressParent + "%");
        } else {
          $("#timerBar" + gid).css("background-color", "#ff0000");
          $("#timerBar" + gid).css("width", "100%");
          $("#timer" + gid).css("display", "none");
          $("#gamePhase" + gid).text("Game Closed.");
          
          // Disable the buttons while new game is started.
          for (let x = 0; x < 10; x++) {
            $("#submitButton" + gid + x).prop("disabled", true);
          }
          $("#goodLuckMessage" + gid).css("display", "none");

          if (gameState.gameClock === -2 && gameState.result !== -1) {
            $("#resultValue" + gid).text(gameState.result);
            $("#resultAlert" + gid).fadeIn(100);

            //  Animate the button clicked and then remove the animation
            $("#submitButton" + gid + (gameState.result - 1)).css("animation", "glowing 1000ms infinite")
            setTimeout(() => {
              $("#submitButton" + gid + (gameState.result - 1)).css("animation", "");
            }, 4000)
          }
        }
      })
    });

    // Handle the response from server
    this.socket.on("confirmGuess", (gameId: number, guess: number, score: number) => {
      this.inThisRound[gameId] = true;
      $("#submitButton" + gameId + (guess - 1)).prop("disabled", true);
      $("#goodLuckMessage" + gameId).css("display", "inline-block");
      $(".score").text(score);
    })

    $(document).ready(() => {

      $("#resultValue0").addClass("spinnner");
      $("#resultValue1").addClass("spinnner");
      $("#resultValue2").addClass("spinnner");
      (<any>$("#resultAlert0")).alert().hide();
      (<any>$("#resultAlert1")).alert().hide();
      (<any>$("#resultAlert2")).alert().hide();

      $("#messageText").keypress((e) => {
        let key = e.which;
        if (key == 13) {
          this.sendMessage();
          return false;
        }
      });

      $("#screenNameInput").keypress((e) => {
        let key = e.which;
        if (key == 13) {
          this.setScreenName();
          return false;
        }
      });
    });
  }

  submitGuess = (gameId: number, guess: number) => this.socket.emit("submitGuess", gameId, guess);

  setScreenName = () => {
    const enteredName: string = <string>$("#screenNameInput").val();
    console.log("Screen Name", enteredName);
    if (enteredName.length > 0) {
      (<any>$("#modal")).modal("hide");
      const [firstName, lastName] = enteredName.split(" ");
      let screenName: ScreenName = {
        name: enteredName,
        abbreviation: lastName ? 
                      firstName[0].toUpperCase() + lastName[0].toUpperCase() :
                      firstName.slice(0, 2).toUpperCase()
      }
      
      // Send the screen name to the server to create player details.
      this.socket.emit("screenName", screenName);
    }
  }

  private scrollChatWindow = () => {
    $("#messages").animate({
      scrollTop: $("#messages").prop("scrollHeight")
    }, 200);

    setTimeout(() => {
      let messagesLength = $("#messages li");
      if (messagesLength.length > 50) {
        messagesLength.eq(0).remove();
      }
    }, 500);
  }

  sendMessage() {
    let messageText = $("#messageText").val();
    if (messageText.toString().length > 0) {
      this.socket.emit(
        "chatMessage",
        <ChatMessage>{message: messageText, from: this.player.screenName.abbreviation}
      );
      $("#messages").append(
        '<li>' + 
          '<span class="float-left">' +
            '<span class="circle">' +
              this.player.screenName.abbreviation +
            '</span>' +
          '</span>' +
          '<div class="myMessage">' +
            messageText +
          '</div>' +
        '</li>'
      );
      this.scrollChatWindow();
      $("#messageText").val("");
    }
  }

  showGame(id: number) {
    switch (id) {
      case 0:
        $("#gamePanel1").fadeOut(100);
        $("#gamePanel2").fadeOut(100);
        $("#gamePanel0").delay(100).fadeIn(100);
        break;
      case 1:
        $("#gamePanel0").fadeOut(100);
        $("#gamePanel2").fadeOut(100);
        $("#gamePanel1").delay(100).fadeIn(100);
        break;
      case 2:
        $("#gamePanel0").fadeOut(100);
        $("#gamePanel1").fadeOut(100);
        $("#gamePanel2").delay(100).fadeIn(100);
        break;
    }
  }
}

const client = new Client();