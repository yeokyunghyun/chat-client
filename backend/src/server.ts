import path from "path";
import express from "express";
import { createServer } from "http";
import { setSocketIOServer, emitAgentMessageToCustomer, notifyConsultationAssigned, notifyConsultationStarted } from "./SocketIOServer";
import router from "./router"
import dotenv from "dotenv"

const env = process.env.NODE_ENV || "local"; // 기본값 local
dotenv.config({ path: path.join(process.cwd(), `.env.${env}`) });

const app = express();
const httpServer = createServer(app);

app.use(express.json());

setSocketIOServer(httpServer); 

const PORT = 3000;

// 정적 파일 서빙 (빌드된 react dist)
app.use(express.static(path.join(__dirname, "../../frontend/dist")));
app.use("/api", router);
app.post("/api/send-to-customer", (req, res) => {
  const { customerId, content } = req.body || {};
  console.log("/api/send-to-customer");
  
  if (!customerId) {
    return res.status(400).json({ error: "customerId is required" });
  }
  const ok = emitAgentMessageToCustomer(customerId, content);
  if (!ok) {
    return res.status(404).json({ error: "customer socket not found" });
  }
  return res.sendStatus(200);
});

// 상담사 배분 완료 알림
app.post("/api/consultation-assigned", (req, res) => {
  const { customerId } = req.body || {};
  console.log("/api/consultation-assigned", customerId);
  
  if (!customerId) {
    return res.status(400).json({ error: "customerId is required" });
  }
  const ok = notifyConsultationAssigned(customerId);
  if (!ok) {
    return res.status(404).json({ error: "customer socket not found" });
  }
  return res.sendStatus(200);
});

// 상담 시작 알림 (상담사가 상담건 클릭)
app.post("/api/consultation-started", (req, res) => {
  const { customerId } = req.body || {};
  console.log("/api/consultation-started", customerId);
  
  if (!customerId) {
    return res.status(400).json({ error: "customerId is required" });
  }
  const ok = notifyConsultationStarted(customerId);
  if (!ok) {
    return res.status(404).json({ error: "customer socket not found" });
  }
  return res.sendStatus(200);
});

httpServer.listen(PORT, () => {
  console.log(`Server running http://localhost:${PORT}`);
});
