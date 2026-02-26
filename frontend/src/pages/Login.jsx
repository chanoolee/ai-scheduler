import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [userid, setUserid] = useState("");
  const [password, setPassword] = useState(""); // 🌟 비밀번호 상태 추가
  const [errorMessage, setErrorMessage] = useState(""); // 🚨 에러 메시지 상태 추가
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage(""); // 로그인 시도 시 기존 에러 초기화

    // 입력값 검증
    if (!userid.trim() || !password.trim()) {
      setErrorMessage("아이디와 비밀번호를 모두 입력해주세요 대장!");
      return;
    }

    try {
      // 🌟 백엔드 로그인 API 호출 (FastAPI 기본 주소인 8000포트 가정)
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userid, password }),
      });

      const data = await response.json();

      // 서버에서 에러(401, 403 등)를 뱉었을 때
      if (!response.ok) {
        setErrorMessage(data.detail || "로그인에 실패했습니다.");
        return;
      }

      // 🌟 정상 응답을 받았을 때의 분기 처리
      if (data.status === "REQUIRE_PASSWORD_CHANGE") {
        // 1. 임시 비밀번호 사용자 -> 비밀번호 변경 페이지로 강제 이동!
        alert(data.message);
        // 이동할 때 userId를 몰래 챙겨서 보냄 (다음 화면에서 써먹기 위해)
        navigate("/change-password", { state: { userId: data.userId } });
      } else if (data.status === "SUCCESS") {
        // 2. 정상 사용자 -> 토큰 저장 후 근무표 화면으로 이동!
        localStorage.setItem("userid", userid);
        localStorage.setItem("token", data.token); // JWT 토큰 저장
        localStorage.setItem("role", data.role);   // 권한(Role) 저장

        if (data.role === "SUPER_ADMIN") {
          navigate("/admin");
        } else {
          navigate("/schedule");
        }
      }
    } catch (error) {
      console.error("Login error:", error);
      setErrorMessage("서버와 통신할 수 없습니다. 백엔드가 켜져있는지 확인해주세요!");
    }
  };

  // --- 기존 스타일 유지 + 에러 메시지 스타일 추가 ---
  const cardStyle = {
    background: "rgba(255,255,255,0.98)",
    padding: "2.5rem 2.25rem",
    borderRadius: "18px",
    boxShadow: "0 22px 45px rgba(15,23,42,0.12), 0 8px 18px rgba(15,23,42,0.08)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    minWidth: "320px",
    border: "1px solid rgba(148,163,184,0.25)",
  };

  const inputStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "1px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "1rem",
    marginBottom: "1rem", // 간격 살짝 조절
    outline: "none",
    background: "#f9fafb",
    color: "#000",
  };

  const buttonStyle = {
    width: "100%",
    padding: "0.8rem 1.1rem",
    background: "linear-gradient(135deg, #2563eb, #4f46e5)",
    color: "#fff",
    border: "none",
    borderRadius: "999px",
    fontSize: "1.05rem",
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: "0 14px 35px rgba(37,99,235,0.35)",
    transition: "background 0.18s ease, transform 0.12s ease, box-shadow 0.18s ease",
    marginTop: "0.5rem", // 버튼 위 여백 추가
  };

  const errorStyle = {
    color: "#dc2626", // 빨간색 에러
    fontSize: "0.9rem",
    marginBottom: "1rem",
    textAlign: "center",
    fontWeight: "500",
  };

  return (
    <div>
      <form style={cardStyle} onSubmit={handleLogin}>
        <h2
          style={{
            marginBottom: "1.75rem",
            color: "#0f172a",
            letterSpacing: "0.02em",
            fontSize: "1.6rem",
          }}
        >
          로그인
        </h2>
        
        {/* 에러 메시지가 있으면 띄워줌 */}
        {errorMessage && <div style={errorStyle}>{errorMessage}</div>}

        <input
          type="text"
          style={inputStyle}
          placeholder="아이디를 입력하세요"
          value={userid}
          onChange={(e) => setUserid(e.target.value)}
          autoFocus
        />
        
        {/* 🌟 추가된 비밀번호 입력칸 */}
        <input
          type="password"
          style={inputStyle}
          placeholder="비밀번호를 입력하세요"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        
        <button style={buttonStyle} type="submit">
          로그인
        </button>
      </form>
    </div>
  );
};

export default Login;