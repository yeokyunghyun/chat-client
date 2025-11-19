import { io, Socket } from "socket.io-client";

class SocketIO {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io("http://localhost:3000", {
        autoConnect: false,
      });
      this.socket.connect();
      console.log("Socket connected:", this.socket.id);
    }
  }

  onMessage(callback: (msg: any) => void) {
    if (!this.socket) return;
    this.socket.on("message", callback);
  }

  sendMessage(payload: any) {
    if (!this.socket) return;
    console.log('this.socket.id >>', this.socket.id);
    this.socket.emit("message", payload);
  }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }
}

export default new SocketIO();