import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (username.trim()) {
      localStorage.setItem("username", username);
      navigate("/schedule");
    }
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.98)",
    padding: "2.5rem 2.25rem",
    borderRadius: "18px",
    boxShadow:
      "0 22px 45px rgba(15,23,42,0.12), 0 8px 18px rgba(15,23,42,0.08)",
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
    marginBottom: "1.5rem",
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
        <input
          type="text"
          style={inputStyle}
          placeholder="사용자 이름을 입력하세요"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
        />
        <button style={buttonStyle} type="submit">
          입장하기
        </button>
      </form>
    </div>
  );
};

export default Login;