import path from "path";
import express from "express";
import { createServer } from "http";
import { setSocketIOServer } from "./SocketIOServer";
import router from "./router"

const app = express();
const httpServer = createServer(app);

setSocketIOServer(httpServer); 

const PORT = 3000;

// 정적 파일 서빙 (빌드된 react dist)
app.use(express.static(path.join(__dirname, "../../frontend/dist")));
app.use("/api", router);

httpServer.listen(PORT, () => {
  console.log(`Server running http://localhost:${PORT}`);
});
