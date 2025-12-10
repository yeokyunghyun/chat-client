import {Server} from "socket.io"
import http from "http"
import axios from "axios"

const customerMap = new Map<string, string>(); // customerId => socket.id 매핑
let ioRef: Server | null = null;

export function setSocketIOServer(server: http.Server) {
    const io = new Server(server, {
        cors: {
            origin: "*"
        }
    })
    ioRef = io;

    io.on("connection", (socket) => {
        console.log('SocketIOServer Connected, socket.id >> ', socket.id);

        // 고객 등록 시 customerId 전달
        socket.on("register", async (customerId) => {
            customerMap.set(customerId, socket.id);
            console.log(`고객 등록 완료: customerId=${customerId}, socket.id=${socket.id}`);

            const newRequest = {
                id: crypto.randomUUID(),
                customerId: customerId,
                customerName: `고객-${customerId.substring(0, 5)}`,
                requestTime: new Date().toISOString(),
                status: "pending",
            };

            try {
                await axios.post(process.env.API_REQUEST_URL!, newRequest);
                console.log("Spring 신규 상담 요청 전달 완료");
            } catch (err: any) {
                console.error("Spring 신규 요청 전달 실패:", err.message);
            }
        });

        // 고객 => 상담사
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

export function emitAgentMessageToCustomer(customerId: string, message: any) {
    if (!ioRef) return false;
    const targetSocketId = customerMap.get(customerId);
    if (!targetSocketId) return false;
    ioRef.to(targetSocketId).emit("agentMessage", message);
    console.log(`상담사 메시지 전송 완료: customerId=${customerId}, message=${message}`);
    return true;
}