import { Server } from "socket.io";
import http from "http";
import axios from "axios";

const customerToSocket = new Map<string, string>(); // customerId -> socket.id
const socketToCustomer = new Map<string, string>(); // socket.id -> customerId

// ✅ "이미 상담요청을 보냈는지" 기억 (중복 요청 방지)
const activeRequestSent = new Set<string>(); // customerId

let ioRef: Server | null = null;

export function setSocketIOServer(server: http.Server) {
  const io = new Server(server, { cors: { origin: "*" } });
  ioRef = io;

  io.on("connection", (socket) => {
    console.log("SocketIOServer Connected, socket.id >> ", socket.id);

    socket.on("register", async (customerId) => {
      // 매핑 갱신
      customerToSocket.set(customerId, socket.id);
      socketToCustomer.set(socket.id, customerId);

      console.log(`register: customerId=${customerId}, socket.id=${socket.id}`);

      // ✅ 중복 상담요청 방지 (핵심)
      if (activeRequestSent.has(customerId)) {
        console.log(`이미 상담요청 전송됨: customerId=${customerId} (skip)`);
        return;
      }

      const newRequest = {
        customerId,
        customerName: `고객-${customerId.substring(0, 5)}`,
        status: "pending",
      };

      try {
        await axios.post(process.env.API_REQUEST_URL!, newRequest);
        activeRequestSent.add(customerId); // ✅ 성공 시에만 표시
        console.log("Spring 신규 상담 요청 전달 완료");
      } catch (err: any) {
        console.error("Spring 신규 요청 전달 실패:", err.message);
      }
    });

    socket.on("message", async (msg) => {
      try {
        await axios.post(process.env.API_MESSAGE_URL!, msg);
        console.log("Spring API로 메시지 전송 완료");
      } catch (err: any) {
        console.error("Spring API 호출 실패: ", err.message);
      }
    });

    socket.on("disconnect", (reason) => {
      const customerId = socketToCustomer.get(socket.id);
      console.log(`SocketIOServer disconnected: id=${socket.id}, reason=${reason}, customerId=${customerId}`);

      // ✅ 매핑 정리
      socketToCustomer.delete(socket.id);
      if (customerId && customerToSocket.get(customerId) === socket.id) {
        customerToSocket.delete(customerId);
        // ⚠️ 여기서 activeRequestSent는 지우면 "재접속=새 요청"이 돼서 또 배정됨
        // 상황에 따라 정책 선택:
        // - 상담요청을 세션 단위로만 유지하려면 delete
        // - 상담요청을 '상담 종료'까지 유지하려면 유지
        // activeRequestSent.delete(customerId);
      }
    });
  });

  return io;
}


export function emitAgentMessageToCustomer(customerId: string, message: any) {
    if (!ioRef) return false;
    const targetSocketId = customerToSocket.get(customerId);
    if (!targetSocketId) return false;
    ioRef.to(targetSocketId).emit("agentMessage", message);
    console.log(`상담사 메시지 전송 완료: customerId=${customerId}, message=${message}`);
    return true;
}

export function notifyConsultationAssigned(customerId: string) {
    if (!ioRef) return false;
    const targetSocketId = customerToSocket.get(customerId);
    if (!targetSocketId) return false;
    ioRef.to(targetSocketId).emit("consultationAssigned");
    console.log(`상담사 배분 완료 알림: customerId=${customerId}`);
    return true;
}

export function notifyConsultationStarted(customerId: string) {
    if (!ioRef) return false;
    const targetSocketId = customerToSocket.get(customerId);
    if (!targetSocketId) return false;
    ioRef.to(targetSocketId).emit("consultationStarted");
    console.log(`상담 시작 알림: customerId=${customerId}`);
    return true;
}