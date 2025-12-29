import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import SocketIO from "@/utils/SocketIO";

type MessageItem = string | { userId: string; content: string; [key: string]: any };

export type TreeNode = {
  id: string;
  title: string;
  type: string;
  children?: TreeNode[];
};

const API_BASE_URL = "http://localhost:8443";

export default function MainPage() {
  const location = useLocation();
  const customerIdFromState = location.state?.customerId;
  const customerIdRef = useRef<string>(customerIdFromState || crypto.randomUUID());
  const customerId = customerIdRef.current;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [inquiryTree, setInquiryTree] = useState<TreeNode[]>([]);
  const [currentNode, setCurrentNode] = useState<TreeNode | null>(null);
  const [navigationStack, setNavigationStack] = useState<TreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [isChatActive, setIsChatActive] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 문의유형 트리 조회
  useEffect(() => {
    const fetchInquiryTree = async () => {
      try {
        setLoading(true);
        const response = await axios.get<TreeNode[]>(`${API_BASE_URL}/api/select/inquiryTypeTree`);
        const tree = response.data;
        
        // 백엔드에서 루트 노드는 무조건 1개이거나 0개
        // 빈 배열이면 루트가 없음, 1개면 그게 루트 노드
        if (tree.length === 1) {
          const rootNode = tree[0];
          setInquiryTree(tree);
          setCurrentNode(rootNode);
        } else if (tree.length === 0) {
          // 루트 노드가 없는 경우
          setInquiryTree([]);
          setCurrentNode(null);
        } else {
          // 예상치 못한 경우 (백엔드 로직상 발생하지 않아야 함)
          console.warn("예상치 못한 트리 구조:", tree);
          const rootNode = tree[0];
          setInquiryTree(tree);
          setCurrentNode(rootNode);
        }
      } catch (error) {
        console.error("문의유형 조회 실패:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiryTree();
  }, []);

  // SocketIO 연결 (채팅 활성화일 때만)
  useEffect(() => {
    if (isChatActive) {
      SocketIO.connect();

      // 고객 ID를 SocketIO 서버에서 등록
      SocketIO.emit("register", customerId);

      SocketIO.on("message", (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      SocketIO.on("agentMessage", (msg) => {
        setMessages((prev) => [...prev, "상담사 : " + msg]);
      });

      return () => {
        SocketIO.disconnect();
      };
    }
  }, [isChatActive, customerId]);

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
    
    SocketIO.emit("message", {
      userId: customerId,
      customerId: customerId,
      content: message,
      timeStamp: new Date().toISOString(),
    });

    setMessages((prev) => [...prev, "나: " + message]);
    setMessage("");
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  // 퀵버튼 클릭 핸들러
  const handleQuickButtonClick = async (child: TreeNode) => {
    console.log('>>> child >>>', child);
    
    if (child.type === "counseling") {
      // 채팅 활성화 및 SocketIO 연결
      setIsChatActive(true);
      
      // SocketIO 연결 후 채팅 API 호출
      SocketIO.connect();
      SocketIO.emit("register", customerId);
      
      // 약간의 지연 후 메시지 전송 (연결 완료 대기)
      setTimeout(() => {
        SocketIO.emit("message", {
          userId: customerId,
          customerId: customerId,
          content: child.title,
          timeStamp: new Date().toISOString(),
        });
        
        setMessages((prev) => [...prev, "나: " + child.title]);
      }, 100);
    } else if (child.type === "block") {
      // 다음 children 표시
      if (child.children && child.children.length > 0) {
        setNavigationStack((prev) => [...prev, currentNode!]);
        setCurrentNode(child);
      }
    }
  };

  // 이전으로 버튼
  const handleGoBack = () => {
    if (navigationStack.length > 0) {
      const previousNode = navigationStack[navigationStack.length - 1];
      setNavigationStack((prev) => prev.slice(0, -1));
      setCurrentNode(previousNode);
    }
  };

  // 처음으로 버튼
  const handleGoHome = () => {
    // 백엔드에서 루트 노드는 무조건 1개이거나 0개
    if (inquiryTree.length === 1) {
      setCurrentNode(inquiryTree[0]);
      setNavigationStack([]);
    }
  };

  // 로딩 상태 처리
  if (loading) {
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
        backgroundColor: "#f0f2f5"
      }}>
        <div style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            width: "40px",
            height: "40px",
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #6366f1",
            borderRadius: "50%",
            animation: "spin 1s linear infinite"
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
          <p style={{ marginTop: "20px", color: "#666" }}>문의유형을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // currentNode가 없을 때 처리
  if (!currentNode) {
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
        backgroundColor: "#f0f2f5"
      }}>
        <div style={{
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <p style={{ color: "#666" }}>문의유형을 불러올 수 없습니다.</p>
          <Link to="/" style={{ marginTop: "20px", textDecoration: "none" }}>
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

  // 채팅 화면 (항상 표시)
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
          {/* 문의유형 선택 UI (채팅 메시지처럼 표시) */}
          {!isChatActive && currentNode && (
            <div style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "flex-start",
              gap: "8px"
            }}>
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
              <div style={{
                maxWidth: "75%",
                position: "relative"
              }}>
                <div style={{
                  backgroundColor: "#ffffff",
                  color: "#1f2937",
                  padding: "16px 20px",
                  borderRadius: "18px",
                  fontSize: "15px",
                  lineHeight: "1.5",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                  wordBreak: "break-word"
                }}>
                  <div style={{ marginBottom: "12px", fontWeight: "600" }}>
                    {currentNode.title}
                  </div>
                  
                  {/* 버튼 영역 (하위노드 + 네비게이션 버튼) */}
                  <div style={{
                    display: "flex",
                    flexDirection: "row",
                    flexWrap: "wrap",
                    gap: "8px"
                  }}>
                    {/* 하위노드 버튼들 */}
                    {currentNode.children && currentNode.children.length > 0 && (
                      <>
                        {currentNode.children.map((child) => {
                          return (
                            <button
                              key={child.id}
                              onClick={() => handleQuickButtonClick(child)}
                              style={{
                                padding: "12px 16px",
                                fontSize: "14px",
                                backgroundColor: "#6366f1",
                                color: "#ffffff",
                                border: "none",
                                borderRadius: "8px",
                                cursor: "pointer",
                                fontWeight: "500",
                                transition: "all 0.2s",
                                textAlign: "left",
                                boxShadow: "0 2px 4px rgba(99, 102, 241, 0.2)"
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#4f46e5";
                                e.currentTarget.style.transform = "translateY(-1px)";
                                e.currentTarget.style.boxShadow = "0 4px 8px rgba(99, 102, 241, 0.3)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "#6366f1";
                                e.currentTarget.style.transform = "translateY(0)";
                                e.currentTarget.style.boxShadow = "0 2px 4px rgba(99, 102, 241, 0.2)";
                              }}
                            >
                              {child.title}
                            </button>
                          );
                        })}
                      </>
                    )}
                    
                    {/* 네비게이션 버튼 */}
                    {navigationStack.length > 0 && (
                      <>
                        <button
                          onClick={handleGoBack}
                          style={{
                            padding: "12px 16px",
                            fontSize: "14px",
                            backgroundColor: "#6366f1",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "500",
                            transition: "all 0.2s",
                            boxShadow: "0 2px 4px rgba(99, 102, 241, 0.2)"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#4f46e5";
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.boxShadow = "0 4px 8px rgba(99, 102, 241, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#6366f1";
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 2px 4px rgba(99, 102, 241, 0.2)";
                          }}
                        >
                          이전으로
                        </button>
                        <button
                          onClick={handleGoHome}
                          style={{
                            padding: "12px 16px",
                            fontSize: "14px",
                            backgroundColor: "#6366f1",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontWeight: "500",
                            transition: "all 0.2s",
                            boxShadow: "0 2px 4px rgba(99, 102, 241, 0.2)"
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#4f46e5";
                            e.currentTarget.style.transform = "translateY(-1px)";
                            e.currentTarget.style.boxShadow = "0 4px 8px rgba(99, 102, 241, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#6366f1";
                            e.currentTarget.style.transform = "translateY(0)";
                            e.currentTarget.style.boxShadow = "0 2px 4px rgba(99, 102, 241, 0.2)";
                          }}
                        >
                          처음으로
                        </button>
                      </>
                    )}
                    
                    {(!currentNode.children || currentNode.children.length === 0) && navigationStack.length === 0 && (
                      <p style={{ color: "#666", margin: 0 }}>선택 가능한 항목이 없습니다.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 채팅 메시지들 */}
          {messages.length > 0 && (
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
            </>
          )}
          
          {isChatActive && messages.length === 0 && (
            <div style={{
              textAlign: "center",
              color: "#9ca3af",
              padding: "40px 20px",
              fontSize: "14px"
            }}>
              상담이 시작되었습니다. 메시지를 입력해주세요.
            </div>
          )}
          
          <div ref={messagesEndRef} />
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
            placeholder={isChatActive ? "메시지를 입력하세요..." : "상담을 시작하려면 문의유형을 선택하세요"}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={!isChatActive}
            style={{
              flex: 1,
              padding: "12px 16px",
              fontSize: "15px",
              border: "1px solid #e5e7eb",
              borderRadius: "24px",
              outline: "none",
              backgroundColor: isChatActive ? "#f8f9fa" : "#e5e7eb",
              transition: "all 0.2s",
              cursor: isChatActive ? "text" : "not-allowed",
              opacity: isChatActive ? 1 : 0.6
            }}
            onFocus={(e) => {
              if (isChatActive) {
                e.target.style.borderColor = "#6366f1";
                e.target.style.backgroundColor = "#ffffff";
                e.target.style.boxShadow = "0 0 0 3px rgba(99, 102, 241, 0.1)";
              }
            }}
            onBlur={(e) => {
              if (isChatActive) {
                e.target.style.borderColor = "#e5e7eb";
                e.target.style.backgroundColor = "#f8f9fa";
                e.target.style.boxShadow = "none";
              }
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim() || !isChatActive}
            style={{
              width: "44px",
              height: "44px",
              backgroundColor: (message.trim() && isChatActive) ? "#6366f1" : "#d1d5db",
              color: "#ffffff",
              border: "none",
              borderRadius: "50%",
              cursor: (message.trim() && isChatActive) ? "pointer" : "not-allowed",
              fontSize: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              flexShrink: 0,
              boxShadow: (message.trim() && isChatActive) ? "0 4px 12px rgba(99, 102, 241, 0.4)" : "none"
            }}
            onMouseEnter={(e) => {
              if (message.trim() && isChatActive) {
                e.currentTarget.style.transform = "scale(1.05)";
                e.currentTarget.style.boxShadow = "0 6px 16px rgba(99, 102, 241, 0.5)";
              }
            }}
            onMouseLeave={(e) => {
              if (message.trim() && isChatActive) {
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
