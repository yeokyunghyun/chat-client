import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import SocketIO from "@/utils/SocketIO"

type MessageItem = string | { userId: string; content: string; [key: string]: any };

type ConsultationStatus = "assigning" | "assigned" | "started";

export default function MainPage() {
  const location = useLocation();
  const customerIdFromState = location.state?.customerId;
  const customerIdRef = useRef<string>(customerIdFromState || crypto.randomUUID());
  const customerId = customerIdRef.current;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [consultationStatus, setConsultationStatus] = useState<ConsultationStatus>("assigning");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    SocketIO.connect();

    // 고객 ID를 SocketIO 서버에서 등록
    SocketIO.emit("register", customerId);

    // 상담사 배분 완료 이벤트 수신
    SocketIO.on("consultationAssigned", () => {
      setConsultationStatus("assigned");
    });

    // 상담 시작 이벤트 수신 (상담사가 상담건 클릭)
    SocketIO.on("consultationStarted", () => {
      setConsultationStatus("started");
    });

    SocketIO.on("message", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    SocketIO.on("agentMessage", (msg) => {
      setMessages((prev) => [...prev, "상담사 : " + msg]);
      // 상담사 메시지가 오면 채팅이 시작된 것으로 간주
      if (consultationStatus !== "started") {
        setConsultationStatus("started");
      }
    });

    return () => {
      SocketIO.disconnect();
    };

  }, [consultationStatus])

  // 새 메시지가 올 때마다 스크롤을 맨 아래로
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 메시지 타입과 내용 추출
  const getMessageInfo = (msg: MessageItem) => {
    if (typeof msg === "string") {
      if (msg.startsWith("나:")) {
        return { type: "me", content: msg.replace("나: ", "") };
      }
      if (msg.startsWith("상담사 :")) {
        return { type: "agent", content: msg.replace("상담사 : ", "") };
      }
      return { type: "other", content: msg };
    }
    return { type: "other", content: `${msg.userId}: ${msg.content}` };
  };

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

  // 상담 상태에 따른 화면 렌더링
  if (consultationStatus === "assigning") {
    return (
      <div style={{ 
        padding: 40, 
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>⏳</div>
        <h2 style={{ marginBottom: "15px", color: "#333" }}>상담사 배분 중입니다</h2>
        <p style={{ color: "#666", fontSize: "16px", marginBottom: "30px" }}>
          잠시만 기다려주세요. 곧 상담사가 배정됩니다.
        </p>
        <div style={{ 
          width: "40px", 
          height: "40px", 
          border: "4px solid #f3f3f3",
          borderTop: "4px solid #007bff",
          borderRadius: "50%",
          animation: "spin 1s linear infinite"
        }}></div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <div style={{ marginTop: "30px" }}>
          <Link to="/">
            <button style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}>
              홈으로 돌아가기
            </button>
          </Link>
        </div>
      </div>
    );
  }

  if (consultationStatus === "assigned") {
    return (
      <div style={{ 
        padding: 40, 
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh"
      }}>
        <div style={{ fontSize: "48px", marginBottom: "20px" }}>✅</div>
        <h2 style={{ marginBottom: "15px", color: "#28a745" }}>상담사 배분이 완료되었습니다</h2>
        <p style={{ color: "#666", fontSize: "16px", marginBottom: "10px" }}>
          상담사가 곧 상담을 시작할 예정입니다.
        </p>
        <p style={{ color: "#999", fontSize: "14px", marginBottom: "30px" }}>
          잠시만 기다려주세요...
        </p>
        <div style={{ marginTop: "30px" }}>
          <Link to="/">
            <button style={{
              padding: "10px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer"
            }}>
              홈으로 돌아가기
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // consultationStatus === "started" - 채팅 화면
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "#f0f2f5",
      padding: "20px",
      margin: 0,
      boxSizing: "border-box"
    }}>
      <div style={{
        width: "100%",
        maxWidth: "480px",
        height: "85vh",
        maxHeight: "800px",
        backgroundColor: "#ffffff",
        borderRadius: "20px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        {/* 헤더 */}
        <div style={{
          backgroundColor: "#6366f1",
          color: "#ffffff",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderRadius: "20px 20px 0 0"
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", fontWeight: "600" }}>
              상담사와의 대화
            </h2>
            <p style={{ margin: "4px 0 0 0", fontSize: "12px", opacity: 0.9 }}>
              실시간 채팅 상담
            </p>
          </div>
          <Link to="/" style={{ textDecoration: "none" }}>
            <button style={{
              padding: "6px 12px",
              backgroundColor: "rgba(255, 255, 255, 0.2)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "500"
            }}>
              닫기
            </button>
          </Link>
        </div>

        {/* 메시지 영역 */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "24px 20px",
          backgroundColor: "#f8f9fa",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}>
          {messages.length === 0 ? (
            <div style={{
              textAlign: "center",
              color: "#9ca3af",
              padding: "40px 20px",
              fontSize: "14px"
            }}>
              상담이 시작되었습니다. 메시지를 입력해주세요.
            </div>
          ) : (
            <>
              {messages.map((m, idx) => {
                const { type, content } = getMessageInfo(m);
                const isMe = type === "me";

                return (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      justifyContent: isMe ? "flex-end" : "flex-start",
                      alignItems: "flex-end",
                      gap: "8px"
                    }}
                  >
                    {!isMe && (
                      <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: "#6366f1",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        fontSize: "14px",
                        fontWeight: "600",
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)"
                      }}>
                        상담
                      </div>
                    )}
                    <div style={{
                      maxWidth: "75%",
                      position: "relative"
                    }}>
                      <div style={{
                        backgroundColor: isMe ? "#6366f1" : "#ffffff",
                        color: isMe ? "#ffffff" : "#1f2937",
                        padding: "12px 16px",
                        borderRadius: isMe ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        fontSize: "15px",
                        lineHeight: "1.5",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                        wordBreak: "break-word"
                      }}>
                        {content}
                      </div>
                    </div>
                    {isMe && (
                      <div style={{
                        width: "36px",
                        height: "36px",
                        borderRadius: "50%",
                        backgroundColor: "#10b981",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                        fontSize: "14px",
                        fontWeight: "600",
                        flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)"
                      }}>
                        나
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* 입력 영역 */}
        <div style={{
          backgroundColor: "#ffffff",
          padding: "16px 20px",
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          gap: "12px",
          alignItems: "center"
        }}>
          <input
            type="text"
            placeholder="메시지를 입력하세요..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={onKeyDown}
            style={{
              flex: 1,
              padding: "12px 16px",
              fontSize: "15px",
              border: "1px solid #e5e7eb",
              borderRadius: "24px",
              outline: "none",
              backgroundColor: "#f8f9fa",
              transition: "all 0.2s"
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#6366f1";
              e.target.style.backgroundColor = "#ffffff";
              e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e5e7eb";
              e.target.style.backgroundColor = "#f8f9fa";
              e.target.style.boxShadow = "none";
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim()}
            style={{
              width: "44px",
              height: "44px",
              backgroundColor: message.trim() ? "#6366f1" : "#d1d5db",
              color: "#ffffff",
              border: "none",
              borderRadius: "50%",
              cursor: message.trim() ? "pointer" : "not-allowed",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              flexShrink: 0,
              boxShadow: message.trim() ? "0 4px 12px rgba(99, 102, 241, 0.4)" : "none"
            }}
            onMouseEnter={(e) => {
              if (message.trim()) {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(99, 102, 241, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (message.trim()) {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(99, 102, 241, 0.4)";
              }
            }}
          >
            →
          </button>
        </div>
      </div>
    </div>
  );
}