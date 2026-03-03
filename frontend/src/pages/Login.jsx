import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    // 🚧 1단계: 일단 프론트엔드 UI 테스트용 가짜 로그인 통과 로직!
    // 나중에 여기에 백엔드 API(fetch) 연동해서 진짜 토큰 받아올 거야!
    if (username === "admin" && password === "1234") {
      // 관리자 로그인 성공 가정 -> 어드민 페이지로 이동!
      localStorage.setItem("token", "fake-admin-token"); // 임시 토큰 발급
      localStorage.setItem("role", "SUPER_ADMIN");
      navigate("/admin");
    } else if (username === "user" && password === "temp1234") {
      // 일반 유저 임시 비밀번호 로그인 가정 -> 비밀번호 변경 화면으로 납치!
      navigate("/change-password");
    } else {
      setErrorMsg("아이디 또는 비밀번호가 틀렸습니다 대장!");
    }
  };

  // ==========================================
  // 🎨 스타일 정의 (모던 & 깔끔)
  // ==========================================
  const layoutStyle = {
    display: "flex", justifyContent: "center", alignItems: "center",
    minHeight: "100vh", width: "100%", backgroundColor: "#F3F4F6",
    fontFamily: "'Pretendard', -apple-system, sans-serif"
  };

  const cardStyle = {
    background: "#FFFFFF", padding: "3rem", borderRadius: "24px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.05)", width: "100%", maxWidth: "420px",
    textAlign: "center"
  };

  const inputStyle = {
    width: "100%", padding: "1rem", border: "1px solid #E5E7EB", background: "#F9FAFB",
    borderRadius: "12px", marginBottom: "1rem", outline: "none", fontSize: "1rem",
    boxSizing: "border-box", transition: "border-color 0.2s"
  };

  const buttonStyle = {
    width: "100%", padding: "1rem", background: "#000000", color: "#fff", 
    border: "none", borderRadius: "12px", fontSize: "1.1rem", fontWeight: "bold", 
    cursor: "pointer", marginTop: "1rem", transition: "transform 0.1s"
  };

  return (
    <div style={layoutStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⚡</div>
        <h2 style={{ marginBottom: "0.5rem", color: "#111827", fontSize: "1.8rem" }}>AI SCHEDULER</h2>
        <p style={{ color: "#6B7280", marginBottom: "2rem" }}>관리자 및 고객 로그인</p>

        <form onSubmit={handleLogin}>
          <input 
            style={inputStyle} 
            type="text" 
            placeholder="아이디를 입력하세요" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
          />
          <input 
            style={inputStyle} 
            type="password" 
            placeholder="비밀번호를 입력하세요" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          
          {errorMsg && (
            <div style={{ color: "#EF4444", fontSize: "0.9rem", marginTop: "0.5rem", textAlign: "left" }}>
              🚨 {errorMsg}
            </div>
          )}

          <button 
            type="submit" 
            style={buttonStyle}
            onMouseDown={(e) => e.target.style.transform = "scale(0.98)"}
            onMouseUp={(e) => e.target.style.transform = "scale(1)"}
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;