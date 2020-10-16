var Client = /** @class */ (function () {
    function Client() {
        var _this = this;
        this.setScreenName = function () {
            var enteredName = $("#screenNameInput").val();
            console.log("Screen Name", enteredName);
            if (enteredName.length > 0) {
                $("#modal").modal("hide");
                var _a = enteredName.split(" "), firstName = _a[0], lastName = _a[1];
                var screenName = {
                    name: enteredName,
                    abbreviation: lastName ?
                        firstName[0].toUpperCase() + lastName[0].toUpperCase() :
                        firstName.slice(0, 2).toUpperCase()
                };
                // Send the screen name to the server to create player details.
                _this.socket.emit("screenName", screenName);
            }
        };
        this.scrollChatWindow = function () {
            $("#messages").animate({
                scrollTop: $("#messages").prop("scrollHeight")
            }, 200);
            setTimeout(function () {
                var messagesLength = $("#messages li");
                if (messagesLength.length > 50) {
                    messagesLength.eq(0).remove();
                }
            }, 500);
        };
        this.socket = io();
        this.socket.on("connect", function () { return console.log("Connected"); });
        this.socket.on("disconnect", function (message) {
            console.log("Disconnected", message);
            setTimeout(function () {
                location.reload();
            }, 1000);
        });
        this.socket.on("chatMessage", function (chatMessage) {
            $("#messages").append("<li>" +
                "<span class='float-right'>" +
                '<span class="circle">' +
                chatMessage.from +
                '</span>' +
                '</span>' +
                '<div class="otherMessage">' +
                chatMessage.message +
                '</div>' +
                '</li>');
            _this.scrollChatWindow();
        });
        this.socket.on("playerDetails", function (player) {
            _this.player = player;
            $(".screenName").text(player.screenName.name);
            $(".score").text(player.score);
        });
        this.socket.on("GameStates", function (gameStates) {
            gameStates.forEach(function (gameState) {
                var gid = gameState.id;
                if (gameState.gameClock >= 0) {
                    if (gameState.gameClock >= gameState.duration) {
                        $("#gamephase" + gid).text("New game. Time to check your luck.");
                    }
                    $("#timer" + gid).css("display", "block");
                    $("#timer" + gid).text(gameState.gameClock.toString());
                    var progressParent = (gameState.gameClock / gameState.duration) * 100;
                    $("#timerBar" + gid).css("background-color", "#4caf50");
                    $("#timerBar" + gid).css("width", progressParent + "%");
                }
                else {
                    $("#timerBar" + gid).css("background-color", "#ff0000");
                    $("#timerBar" + gid).css("width", "100%");
                    $("#timer" + gid).css("display", "none");
                    $("#gamePhase" + gid).text("Game Closed.");
                }
            });
        });
        $(document).ready(function () {
            $("#messageText").keypress(function (e) {
                var key = e.which;
                if (key == 13) {
                    _this.sendMessage();
                    return false;
                }
            });
            $("#screenNameInput").keypress(function (e) {
                var key = e.which;
                if (key == 13) {
                    _this.setScreenName();
                    return false;
                }
            });
        });
    }
    Client.prototype.sendMessage = function () {
        var messageText = $("#messageText").val();
        if (messageText.toString().length > 0) {
            this.socket.emit("chatMessage", { message: messageText, from: this.player.screenName.abbreviation });
            $("#messages").append('<li>' +
                '<span class="float-left">' +
                '<span class="circle">' +
                this.player.screenName.abbreviation +
                '</span>' +
                '</span>' +
                '<div class="myMessage">' +
                messageText +
                '</div>' +
                '</li>');
            this.scrollChatWindow();
            $("#messageText").val("");
        }
    };
    Client.prototype.showGame = function (id) {
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
    };
    return Client;
}());
var client = new Client();
