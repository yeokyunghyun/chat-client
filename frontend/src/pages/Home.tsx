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
          position: "relative"
        }}>
          {/* 좌우 사이드 영역 */}
          <div style={{
            display: "flex",
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: "none"
          }}>
            {/* 왼쪽 사이드 */}
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "20px",
              padding: "20px"
            }}>
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px"
              }}>💬</div>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                marginTop: "20px"
              }}>✨</div>
            </div>

            {/* 중앙 콘텐츠 */}
            <div style={{
              width: "300px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "32px"
            }}>
              {/* 귀여운 캐릭터 */}
              <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
              }}>
                <svg
                  width="200"
                  height="200"
                  viewBox="0 0 200 200"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* 얼굴 */}
                  <circle cx="100" cy="100" r="70" fill="#FFE5B4" stroke="#FFD700" strokeWidth="2"/>
                  
                  {/* 왼쪽 눈 */}
                  <circle cx="80" cy="85" r="8" fill="#333"/>
                  <circle cx="82" cy="83" r="3" fill="#fff"/>
                  
                  {/* 오른쪽 눈 */}
                  <circle cx="120" cy="85" r="8" fill="#333"/>
                  <circle cx="122" cy="83" r="3" fill="#fff"/>
                  
                  {/* 볼 홍조 */}
                  <ellipse cx="70" cy="100" rx="12" ry="8" fill="#FFB6C1" opacity="0.6"/>
                  <ellipse cx="130" cy="100" rx="12" ry="8" fill="#FFB6C1" opacity="0.6"/>
                  
                  {/* 입 */}
                  <path d="M 85 115 Q 100 125 115 115" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round"/>
                  
                  {/* 귀 */}
                  <ellipse cx="50" cy="60" rx="15" ry="25" fill="#FFE5B4" stroke="#FFD700" strokeWidth="2"/>
                  <ellipse cx="150" cy="60" rx="15" ry="25" fill="#FFE5B4" stroke="#FFD700" strokeWidth="2"/>
                  
                  {/* 귀 안쪽 */}
                  <ellipse cx="50" cy="60" rx="8" ry="12" fill="#FFB6C1" opacity="0.5"/>
                  <ellipse cx="150" cy="60" rx="8" ry="12" fill="#FFB6C1" opacity="0.5"/>
                  
                  {/* 안테나 (선택사항) */}
                  <circle cx="100" cy="30" r="8" fill="#6366f1"/>
                  <line x1="100" y1="30" x2="100" y2="50" stroke="#6366f1" strokeWidth="3"/>
                </svg>
              </div>
            </div>

            {/* 오른쪽 사이드 */}
            <div style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "20px",
              padding: "20px"
            }}>
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px"
              }}>📞</div>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.08) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                marginTop: "20px"
              }}>🌟</div>
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