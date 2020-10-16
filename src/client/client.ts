class Client {
  private socket: SocketIOClient.Socket;

  constructor() {
    this.socket = io();

    this.socket.on("connect", () => console.log("Connected"));
    this.socket.on("disconnect", (message: any) => {
      console.log("Disconnected", message);
      setTimeout(() => {
        location.reload()
      }, 1000)
    })
  }
}

const client = new Client();