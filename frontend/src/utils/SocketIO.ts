import { io, Socket } from "socket.io-client";

class SocketIOService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      this.socket = io("http://localhost:3000", {
        autoConnect: false,
      });
      this.socket.connect();

      this.socket.on("connect", () => {
        console.log("Socket connected:", this.socket?.id);
      });
    }
  }

  emit(event: string, payload: any) {
    if (!this.socket) return;
    this.socket.emit(event, payload);
  }

  on(event: string, handler: (...args: any[]) => void) {
    if (!this.socket) return;
    this.socket.on(event, handler);
  }

  // onMessage(callback: (msg: any) => void) {
  //   if (!this.socket) return;
  //   this.socket.on("message", callback);
  // }

  // sendMessage(payload: any) {
  //   if (!this.socket) return;
  //   console.log('this.socket.id >>', this.socket.id);
  //   this.socket.emit("message", payload);
  // }

  disconnect() {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }
}

const SocketIO = new SocketIOService();
export default SocketIO;