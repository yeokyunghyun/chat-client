import {Server} from "socket.io"
import http from "http"
import axios from "axios"

export function setSocketIOServer(server: http.Server) {
    const io = new Server(server, {
        cors: {
            origin: "*"
        }
    })

    io.on("connection", (socket) => {
        console.log('SocketIOServer Connected, socket.id >> ', socket.id);

        socket.on("message", async (msg) => {
            try {
                await axios.post(process.env.API_MESSAGE_URL!, msg);
                console.log("Spring API로 메시지 전송 완료");
            } catch (err: any) {
                console.error("Spring API 호출 실패: ", err.message);
            }
        })

        socket.on("disconnect", (reason) => {
            console.log(`SocketIOServer disconnected: id=${socket.id}, reason=${reason}`);
        })
    })
    
    return io;
}