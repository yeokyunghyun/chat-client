import { useNavigate } from "react-router-dom";
import { useRef } from "react";

export default function Home() {
  const navigate = useNavigate();
  const customerIdRef = useRef<string>(crypto.randomUUID());

  const handleRequestConsultation = () => {
    // customerId를 state로 전달하여 MainPage로 이동
    navigate("/client", { state: { customerId: customerIdRef.current } });
  };

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
        {/* 헤더 영역 */}
        <div style={{
          background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
          padding: "40px 32px",
          textAlign: "center",
          borderTopLeftRadius: "20px",
          borderTopRightRadius: "20px",
          boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* 장식용 배경 요소 */}
          <div style={{
            position: "absolute",
            top: "-50px",
            right: "-50px",
            width: "200px",
            height: "200px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.1)",
            zIndex: 0
          }}></div>
          <div style={{
            position: "absolute",
            bottom: "-30px",
            left: "-30px",
            width: "150px",
            height: "150px",
            borderRadius: "50%",
            background: "rgba(255, 255, 255, 0.08)",
            zIndex: 0
          }}></div>
          
          <div style={{ position: "relative", zIndex: 1 }}>
            <h1 style={{
              margin: 0,
              fontSize: "36px",
              fontWeight: "800",
              color: "#ffffff",
              letterSpacing: "-0.5px",
              marginBottom: "8px",
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.1)"
            }}>
              YL_CHT_PROJECT
            </h1>


          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "40px 32px",
          overflowY: "auto",
          position: "relative",
          minHeight: 0
        }}>
          {/* 중앙 아이콘 - 화면 정가운데 고정 */}
          <div style={{
            flex: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 0
          }}>
            <div style={{
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
              <svg
                width="100"
                height="100"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
                  stroke="#6366f1"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {/* 상담 요청하기 버튼 - 하단 중앙 */}
          <div style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            paddingTop: "20px",
            position: "relative",
            zIndex: 1,
            pointerEvents: "auto"
          }}>
            <button
              onClick={handleRequestConsultation}
              style={{
                padding: "20px 64px",
                fontSize: "22px",
                fontWeight: "700",
                backgroundColor: "#6366f1",
                color: "#ffffff",
                border: "none",
                borderRadius: "16px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 6px 20px rgba(99, 102, 241, 0.4)",
                minWidth: "280px",
                letterSpacing: "0.5px"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#4f46e5";
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(99, 102, 241, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#6366f1";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 20px rgba(99, 102, 241, 0.4)";
              }}
            >
              상담 요청하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}