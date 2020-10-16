type ChatMessage = {
  message: string,
  from: string
}

type ScreenName = {
  name: string,
  abbreviation: string
}


class Client {
  private socket: SocketIOClient.Socket;
  private screenName: ScreenName;

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
        $("#messages").append(
          "<li>" +
            "<span class='float-right'>" +
              '<span class="circle">' +
                  chatMessage.from +
              '</span>' +
            '</span>' +
            '<div class="otherMessage">' +
              chatMessage.message +
            '</div>' +
          '</li>'
        );
        this.scrollChatWindow();
      }
    );

    $(document).ready(() => {
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

  setScreenName = () => {
    const enteredName: string = <string>$("#screenNameInput").val();
    console.log("Screen Name", enteredName);
    if (enteredName.length > 0) {
      (<any>$("#modal")).modal("hide");
      const [firstName, lastName] = enteredName.split(" ");
      this.screenName = {
        name: enteredName,
        abbreviation: lastName ? 
                      firstName[0].toUpperCase() + lastName[0].toUpperCase() :
                      firstName.slice(0, 2).toUpperCase()
      }
      $(".screenName").text(this.screenName.name);
    }

    console.log(this.screenName)
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
        <ChatMessage>{message: messageText, from: this.screenName.abbreviation}
      );
      $("#messages").append(
        '<li>' + 
          '<span class="float-left">' +
            '<span class="circle">' +
              this.screenName.abbreviation +
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