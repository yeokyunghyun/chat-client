import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function MainPage() {
  const [message, setMessage] = useState("");

  const sendMessage = async () => {
    if (!message.trim()) return;
    await axios.post("http://localhost:8443/api/messages", {
      userId: "client001",
      content: message,
    });
    setMessage(""); // 입력창 초기화
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>채팅 페이지</h1>

      <input
        type="text"
        placeholder="메시지를 입력하세요"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={onKeyDown}
        style={{ width: "300px", padding: "8px", fontSize: "16px" }}
      />
      <button onClick={sendMessage}>전송</button>
      <div style={{ marginTop: 20 }}>
        <Link to="/"><button>홈으로 돌아가기</button></Link>
      </div>
    </div>
  );
}