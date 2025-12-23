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
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>고객 상담 서비스</h1>
      <p style={{ marginTop: 20, fontSize: "18px", color: "#666" }}>
        상담이 필요하신가요? 아래 버튼을 클릭하여 상담을 요청해주세요.
      </p>
      <button
        onClick={handleRequestConsultation}
        style={{
          marginTop: 30,
          padding: "15px 40px",
          fontSize: "18px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
        }}
      >
        상담 요청하기
      </button>
    </div>
  );
}