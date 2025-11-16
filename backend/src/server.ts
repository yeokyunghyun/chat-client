import path from "path";
import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*"
  }
});

const PORT = 3000;

// 정적 파일 서빙 (빌드된 react dist)
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

app.get("/api/hello", (req, res) => {
  res.json({ message: "hello client!" });
});

// WebSocket
io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on("chat", (msg) => {
    console.log("chat msg:", msg);
    io.emit("chat", msg);
  });

  socket.on("disconnect", () => {
    console.log("socket disconnected");
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server running http://localhost:${PORT}`);
});
