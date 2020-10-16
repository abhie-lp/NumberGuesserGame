var Client = /** @class */ (function () {
    function Client() {
        this.socket = io();
        this.socket.on("connect", function () { return console.log("Connected"); });
        this.socket.on("disconnect", function (message) {
            console.log("Disconnected", message);
            setTimeout(function () {
                location.reload();
            }, 1000);
        });
    }
    return Client;
}());
var client = new Client();
