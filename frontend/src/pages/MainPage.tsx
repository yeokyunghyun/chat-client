import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import SocketIO from "@/utils/SocketIO"

type MessageItem = string | { userId: string; content: string; [key: string]: any };

export default function MainPage() {
  const customerIdRef = useRef<string>(crypto.randomUUID());
  const customerId = customerIdRef.current;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);

  useEffect(() => {
    SocketIO.connect();

    // 고객 ID를 SocketIO 서버에서 등록
    SocketIO.emit("register", customerId);

    SocketIO.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    SocketIO.on("agentMessage", (msg) => {
      setMessages((prev) => [...prev, "상담사 : " + msg]);
    });

    // SocketIO.onMessage((msg) => {
    //   setMessages((prev) => [...prev, msg]);
    // });

    return () => {
      SocketIO.disconnect();
    };

  }, [])

  const sendMessage = async () => {
    if (!message.trim()) return;
    
    // SocketIO.sendMessage({
    //   userId: "client001",
    //   content: message,
    // });
    SocketIO.emit("message", {
      userId: customerId,
      customerId: customerId,
      content: message,
      timeStamp: new Date().toISOString(),
    });

    setMessages((prev) => [...prev, "나: " + message]);

    setMessage(""); // 입력창 초기화
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>채팅 페이지 (Socket only) : 고객-{customerId.substring(0, 5)}</h1>

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