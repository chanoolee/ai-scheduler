import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // 🚧 공사 중: 문지기 로직 임시 비활성화
  useEffect(() => {
    // const token = localStorage.getItem("token");
    // const role = localStorage.getItem("role");
    // if (!token || role !== "SUPER_ADMIN") {
    //   alert("🚨 접근 권한이 없습니다.");
    //   navigate("/"); 
    // }
  }, [navigate]);

  const [activeMenu, setActiveMenu] = useState("account");

  // --- 상태 관리 ---
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [tempPassword, setTempPassword] = useState("");

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setMessage(""); setTempPassword(""); setIsError(false);

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
        setIsError(true); return;
      }
      setMessage(data.message); setTempPassword(data.temp_password);
      setIsError(false); setUsername(""); setPhone(""); setEmail("");
    } catch (error) {
      setMessage("서버와 통신할 수 없습니다. 백엔드 서버를 확인해주세요!");
      setIsError(true);
    }
  };

  // ==========================================
  // 🎨 벤토 그리드 & 전체 화면 스타일링
  // ==========================================
  // 💡 리액트 기본 여백을 없애는 마법의 꼼수 (전체 화면 꽉 차게!)
  const globalReset = `
    body { margin: 0; padding: 0; background-color: #F3F4F6; font-family: 'Pretendard', -apple-system, sans-serif; }
    * { box-sizing: border-box; }
  `;

const layoutStyle = {
    display: "flex",
    height: "100vh",
    width: "100%",       // 🚨 100vw 를 100% 로 변경! (핵심)
    boxSizing: "border-box", // 👈 테두리 삐져나감 방지용 추가
    overflow: "hidden", 
    padding: "20px",
    gap: "20px",
  };
  
  // 사이드바 (벤토의 첫 번째 큰 칸)
  const sidebarStyle = {
    width: "280px",
    background: "#FFFFFF", 
    borderRadius: "30px", // 벤토 특유의 둥근 쉐입
    display: "flex",
    flexDirection: "column",
    padding: "30px 20px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.03)",
  };

  const logoStyle = {
    fontSize: "1.4rem", fontWeight: "900", textAlign: "center",
    marginBottom: "3rem", color: "#111827", letterSpacing: "1px",
    background: "#F3F4F6", padding: "15px", borderRadius: "20px"
  };

  // 우측 영역 (벤토 그리드 판)
  const contentWrapperStyle = {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "20px",
    overflowY: "auto", // 내용 많아지면 여기만 스크롤
  };

  const headerStyle = {
    background: "#FFFFFF", borderRadius: "30px", padding: "20px 40px",
    display: "flex", alignItems: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.03)",
    fontSize: "1.2rem", fontWeight: "bold", color: "#1f2937"
  };

  // ⭐️ 핵심: 벤토 그리드 컨테이너
  const bentoGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(12, 1fr)", // 12칸으로 나누고 조합해서 씀
    gap: "20px",
  };

  const baseCardStyle = {
    background: "#FFFFFF", borderRadius: "30px", padding: "40px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.03)",
  };

  const inputStyle = {
    width: "100%", padding: "1rem 1.2rem", border: "none", background: "#F3F4F6",
    borderRadius: "16px", marginBottom: "1rem", outline: "none", fontSize: "1rem",
    transition: "box-shadow 0.2s",
  };

  const buttonStyle = {
    width: "100%", padding: "1.2rem", background: "#000000", color: "#fff", 
    border: "none", borderRadius: "16px", fontSize: "1rem", fontWeight: "bold", 
    cursor: "pointer", marginTop: "1rem", transition: "transform 0.1s"
  };

  const MenuItem = ({ id, icon, label }) => {
    const isActive = activeMenu === id;
    return (
      <div
        onClick={() => setActiveMenu(id)}
        style={{
          padding: "1.2rem 1.5rem", cursor: "pointer", marginBottom: "10px",
          background: isActive ? "#000000" : "transparent",
          borderRadius: "16px", transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)", 
          display: "flex", alignItems: "center", gap: "15px",
          color: isActive ? "#fff" : "#6b7280", fontWeight: isActive ? "bold" : "600"
        }}
      >
        <span style={{ fontSize: "1.2rem" }}>{icon}</span>
        <span>{label}</span>
      </div>
    );
  };

  // ==========================================
  // 📺 벤토 화면 렌더링
  // ==========================================
  const renderAccountManager = () => (
    <div style={bentoGridStyle}>
      {/* 큰 상자: 입력 폼 (8칸 차지) */}
      <div style={{ ...baseCardStyle, gridColumn: "span 8" }}>
        <h2 style={{ marginBottom: "0.5rem", color: "#111827", fontSize: "1.8rem" }}>고객 계정 발급</h2>
        <p style={{ marginBottom: "2.5rem", color: "#6b7280" }}>
          새로운 병원 고객의 전용 계정을 생성하고 임시 비밀번호를 부여합니다.
        </p>
        <form onSubmit={handleCreateAccount}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <input style={{...inputStyle, gridColumn: "span 2"}} type="text" placeholder="병원명 (로그인 아이디로 사용됨)" value={username} onChange={(e) => setUsername(e.target.value)} />
            <input style={inputStyle} type="text" placeholder="담당자 연락처" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input style={inputStyle} type="email" placeholder="담당자 이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <button type="submit" style={buttonStyle}
            onMouseDown={(e) => e.target.style.transform = "scale(0.98)"}
            onMouseUp={(e) => e.target.style.transform = "scale(1)"}
          >
            + 새 계정 발급하기
          </button>
        </form>
      </div>

      {/* 작은 상자: 결과 창 (4칸 차지) */}
      <div style={{ ...baseCardStyle, gridColumn: "span 4", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", background: isError ? "#FEF2F2" : (tempPassword ? "#F0FDF4" : "#FFFFFF"), border: tempPassword ? "2px solid #22C55E" : "none" }}>
        {message ? (
          <>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
              {isError ? "🚨" : "🎉"}
            </div>
            <h3 style={{ color: isError ? "#991B1B" : "#166534", marginBottom: "1rem" }}>{message}</h3>
            {tempPassword && (
              <div style={{ padding: "1.5rem", background: "#FFFFFF", borderRadius: "16px", width: "100%", border: "2px dashed #22C55E" }}>
                <p style={{ margin: "0 0 0.5rem 0", color: "#166534", fontSize: "0.9rem" }}>초기 임시 비밀번호</p>
                <strong style={{ fontSize: "1.8rem", letterSpacing: "2px", color: "#000" }}>{tempPassword}</strong>
              </div>
            )}
          </>
        ) : (
          <div style={{ color: "#9CA3AF" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>💬</div>
            <p>계정을 발급하면<br/>여기에 결과가 표시됩니다.</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* 리액트 기본 여백 파괴 공작! */}
      <style>{globalReset}</style>
      
      <div style={layoutStyle}>
        {/* 👈 좌측 벤토 사이드바 */}
        <div style={sidebarStyle}>
          <div style={logoStyle}>⚡ AI SCHEDULER</div>
          <MenuItem id="account" icon="👤" label="계정 발급 관리" />
          <MenuItem id="payment" icon="💳" label="결제 내역 관리" />
          <MenuItem id="stats" icon="📊" label="사용량 통계" />
          <MenuItem id="settings" icon="⚙️" label="시스템 설정" />
        </div>

        {/* 👉 우측 메인 콘텐츠 (헤더 + 벤토 그리드) */}
        <div style={contentWrapperStyle}>
          {/* 🚨 수정 1: 헤더 글자를 span으로 감싸고 삼항 연산자로 깔끔하게 분기! */}
          <div style={headerStyle}>
            <span>
              {activeMenu === "account" ? "👤 계정 발급 관리 (Admin Center)" :
               activeMenu === "payment" ? "💳 결제 내역 관리" :
               activeMenu === "stats"   ? "📊 사용량 통계" :
                                          "⚙️ 시스템 설정"}
            </span>
          </div>
          
          {/* 🚨 수정 2: && 대신 삼항 연산자(? :)를 써서 컴포넌트 교체 시 충돌 방지! */}
          {activeMenu === "account" ? (
            renderAccountManager()
          ) : (
            <div style={{...baseCardStyle, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px"}}>
              <div style={{ textAlign: "center", color: "#9CA3AF" }}>
                <span style={{ fontSize: "4rem", display: "block", marginBottom: "1rem" }}>🚧</span>
                <h2>대장! 이 기능은 아직 공사 중입니다!</h2>
                <p>도시락통(Bento) 레이아웃에 맞게 추가 개발이 필요합니다.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;