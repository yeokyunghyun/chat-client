import {Server} from "socket.io"
import http from "http"

export function setSocketIOServer(server: http.Server) {
    const io = new Server(server, {
        cors: {
            origin: "*"
        }
    })

    io.on("connection", (socket) => {
        console.log('SocketIOServer Connected, socket.id >> ', socket.id);

        socket.on("message", (msg) => {
            console.log("sendMessageToAgent >> ", msg);
            io.emit("message", msg);
        })

        socket.on("disconnect", (reason) => {
            console.log(`SocketIOServer disconnected: id=${socket.id}, reason=${reason}`);
        })
    })
    
    return io;
}