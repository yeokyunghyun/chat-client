import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SocketIO from "@/utils/SocketIO"
import axios from "axios";

export default function MainPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    SocketIO.connect();
    
    SocketIO.onMessage((msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      SocketIO.disconnect();
    };

  }, [])

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    SocketIO.sendMessage({
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
      <h1>채팅 페이지 (Socket only)</h1>

      <input
        type="text"
        placeholder="메시지를 입력하세요"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={onKeyDown}
        style={{ width: "300px", padding: "8px", fontSize: "16px" }}
      />
      <button onClick={sendMessage}>전송</button>

      <ul style={{ marginTop: 20 }}>
        {messages.map((m, idx) => (
          <li key={idx}>
            {typeof m === "string" ? m : `${m.userId}: ${m.content}`}
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 20 }}>
        <Link to="/">
          <button>홈으로 돌아가기</button>
        </Link>
      </div>
    </div>
  );
}