import React, { useState } from "react";

const AdminDashboard = () => {
  const navigate = useNavigate(); // 👈 네비게이트 객체 생성

  // 🌟 핵심: 화면이 켜지자마자 권한부터 검사하는 문지기 로직
  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // 토큰이 아예 없거나, 권한이 'SUPER_ADMIN'이 아니면?
    if (!token || role !== "SUPER_ADMIN") {
      alert("🚨 접근 권한이 없습니다.");
      navigate("/"); // 로그인 화면으로 강제 추방!
    }
  }, [navigate]); // 의존성 배열에 navigate 넣기
    
  // 🌟 현재 선택된 메뉴 상태 (기본값: 'account')
  const [activeMenu, setActiveMenu] = useState("account");

  // --- [계정 생성] 메뉴용 상태 ---
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [tempPassword, setTempPassword] = useState("");

  // --- 계정 발급 로직 (아까 만든 것 그대로!) ---
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setMessage("");
    setTempPassword("");
    setIsError(false);

    if (!username.trim() || !phone.trim() || !email.trim()) {
      setMessage("모든 칸을 꽉꽉 채워주세요 대장!");
      setIsError(true);
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, phone, email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "계정 생성에 실패했습니다.");
        setIsError(true);
        return;
      }

      setMessage(data.message);
      setTempPassword(data.temp_password);
      setIsError(false);
      setUsername("");
      setPhone("");
      setEmail("");
    } catch (error) {
      setMessage("서버와 통신할 수 없습니다. 백엔드 서버를 확인해주세요!");
      setIsError(true);
    }
  };

  // ==========================================
  // 🎨 스타일 정의
  // ==========================================
  const layoutStyle = { display: "flex", minHeight: "100vh", fontFamily: "sans-serif" };
  
  // 좌측 사이드바 스타일
  const sidebarStyle = {
    width: "250px",
    background: "#1e293b", // 다크 네이비톤 (관리자 느낌!)
    color: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    padding: "2rem 0",
  };

  const logoStyle = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: "2.5rem",
    letterSpacing: "1px",
  };

  // 우측 메인 콘텐츠 영역 스타일
  const contentStyle = {
    flex: 1,
    background: "#f1f5f9",
    padding: "3rem",
    overflowY: "auto",
  };

  const cardStyle = {
    background: "#ffffff",
    padding: "2.5rem",
    borderRadius: "15px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.05)",
    maxWidth: "500px",
  };

  const inputStyle = {
    width: "100%", padding: "0.8rem", border: "1px solid #d1d5db", 
    borderRadius: "8px", marginBottom: "1rem", outline: "none", boxSizing: "border-box"
  };

  const buttonStyle = {
    width: "100%", padding: "0.9rem", background: "#10b981", color: "#fff", 
    border: "none", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", marginTop: "1rem"
  };

  // 메뉴 버튼 렌더링 헬퍼 함수
  const MenuItem = ({ id, icon, label }) => {
    const isActive = activeMenu === id;
    return (
      <div
        onClick={() => setActiveMenu(id)}
        style={{
          padding: "1rem 2rem",
          cursor: "pointer",
          background: isActive ? "#334155" : "transparent",
          borderLeft: isActive ? "4px solid #10b981" : "4px solid transparent",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          color: isActive ? "#fff" : "#cbd5e1",
          fontWeight: isActive ? "bold" : "normal"
        }}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </div>
    );
  };

  // ==========================================
  // 📺 메뉴별 화면 렌더링 함수
  // ==========================================
  const renderAccountManager = () => (
    <div style={cardStyle}>
      <h2 style={{ marginBottom: "0.5rem", color: "#0f172a" }}>고객 계정 발급</h2>
      <p style={{ marginBottom: "2rem", color: "#64748b", fontSize: "0.9rem" }}>
        크몽 결제 고객(병원)의 새 계정을 생성합니다.
      </p>
      <form onSubmit={handleCreateAccount}>
        <input style={inputStyle} type="text" placeholder="병원명 (아이디)" value={username} onChange={(e) => setUsername(e.target.value)} />
        <input style={inputStyle} type="text" placeholder="연락처" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input style={inputStyle} type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
        <button type="submit" style={buttonStyle}>계정 생성하기</button>
      </form>

      {message && (
        <div style={{ marginTop: "1.5rem", padding: "1rem", borderRadius: "8px", background: isError ? "#fee2e2" : "#dcfce7", color: isError ? "#991b1b" : "#166534" }}>
          <p style={{ margin: 0, fontWeight: "bold" }}>{message}</p>
          {tempPassword && (
            <div style={{ marginTop: "1rem", padding: "0.8rem", background: "#fff", borderRadius: "5px", border: "1px dashed #166534" }}>
              <span style={{ fontSize: "0.9rem" }}>임시 비밀번호: </span>
              <strong style={{ fontSize: "1.2rem", letterSpacing: "2px" }}>{tempPassword}</strong>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderPlaceholder = (title, desc) => (
    <div style={cardStyle}>
      <h2 style={{ marginBottom: "1rem", color: "#0f172a" }}>{title}</h2>
      <p style={{ color: "#64748b" }}>{desc}</p>
      <div style={{ marginTop: "2rem", padding: "2rem", background: "#f8fafc", borderRadius: "8px", textAlign: "center", color: "#94a3b8", border: "2px dashed #e2e8f0" }}>
        🚧 대장! 이 기능은 아직 공사 중입니다! 🚧
      </div>
    </div>
  );

  return (
    <div style={layoutStyle}>
      {/* 👈 좌측 사이드바 영역 */}
      <div style={sidebarStyle}>
        <div style={logoStyle}>👑 SUPER ADMIN</div>
        <MenuItem id="account" icon="👤" label="계정 발급 관리" />
        <MenuItem id="payment" icon="💳" label="결제 내역 관리" />
        <MenuItem id="stats" icon="📊" label="사용량 통계" />
        <MenuItem id="settings" icon="⚙️" label="시스템 설정" />
      </div>

      {/* 👉 우측 메인 콘텐츠 영역 */}
      <div style={contentStyle}>
        {activeMenu === "account" && renderAccountManager()}
        {activeMenu === "payment" && renderPlaceholder("결제 내역 관리", "크몽 등에서 결제된 내역을 확인하고 연동하는 메뉴입니다.")}
        {activeMenu === "stats" && renderPlaceholder("사용량 통계", "각 병원별 스케줄 생성 횟수 및 시스템 부하를 확인합니다.")}
        {activeMenu === "settings" && renderPlaceholder("시스템 설정", "전체 시스템 점검 및 공지사항을 관리합니다.")}
      </div>
    </div>
  );
};

export default AdminDashboard;