var Client = /** @class */ (function () {
    function Client() {
        var _this = this;
        this.scrollChatWindow = function () {
            $("#messages").animate({
                scrollTop: $("#messages li:last-child").position().top
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
        $(document).ready(function () {
            $("#messageText").keypress(function (e) {
                var key = e.which;
                if (key == 13) {
                    _this.sendMessage();
                    return false;
                }
            });
        });
    }
    Client.prototype.sendMessage = function () {
        var messageText = $("#messageText").val();
        if (messageText.toString().length > 0) {
            this.socket.emit("chatMessage", { message: messageText, from: "AB" });
            $("#messages").append('<li>' +
                '<span class="float-left">' +
                '<span class="circle">' +
                'AB' +
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
