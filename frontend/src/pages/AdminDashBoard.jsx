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

  const [activeMenu, setActiveMenu] = useState("account-list");
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(true);

  // --- 상태 관리 ---
  const [userid, setUserid] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [serviceMonths, setServiceMonths] = useState(1);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [tempPassword, setTempPassword] = useState("");

  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setMessage(""); setTempPassword(""); setIsError(false);

    // 1. 빈칸 검사 (이름, 개월 수 추가됨)
    if (!userid.trim() || !username.trim() || !phone.trim() || !email.trim() || !serviceMonths) {
      setMessage("모든 칸을 꽉꽉 채워주세요 대장!");
      setIsError(true);
      return;
    }

    // 2. 서비스 만료일(service_expires_at) 자동 계산 로직! ⏱️
    const expiresDate = new Date(); // 현재 시간 캡처
    expiresDate.setMonth(expiresDate.getMonth() + Number(serviceMonths)); // 개월 수 더하기
    const service_expires_at = expiresDate.toISOString(); // 백엔드가 좋아하는 표준 시간 포맷으로 변환!

    // 3. 생성자 ID 가져오기 (로그인 시 로컬스토리지에 저장해둔 값)
    // 🚧 만약 아직 로그인 로직에 userId 저장을 안 해뒀다면 임시로 'admin'이 들어감
    const created_by_id = localStorage.getItem("userId") || "admin"; 

    // 4. 백엔드로 보낼 완벽한 데이터 꾸러미(Payload) 완성! 📦
    const payload = {
      userid: userid,
      username: username,
      phone: phone, // 백엔드에서 이 값을 임시 비번으로 써야 함!
      email: email,
      role_code: "CUSTOMER",      // 강제 고정!
      service_expires_at: service_expires_at, // 계산된 날짜
      created_by_id: created_by_id // 생성자
    };

    try {
      const response = await fetch("http://localhost:8000/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload), // 싹 묶어서 발사!
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.detail || "계정 생성에 실패했습니다.");
        setIsError(true); return;
      }

      setMessage(data.message); 
      setTempPassword(data.temp_password); // 백엔드에서 생성된 임시비번 받아오기
      setIsError(false); 
      
      // 전송 성공하면 폼 초기화!
      setUserid(""); setUsername(""); setPhone(""); setEmail(""); setServiceMonths(1);
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
    body { margin: 0; padding: 0; background-color: #F3F4F6; font-family: 'Pretendard', -apple-system, sans-serif; overflow: hidden; }
    * { box-sizing: border-box; }
    
    /* 🚨 Vite의 보이지 않는 1280px 유리벽 강제 철거!!! */
    #root { 
      max-width: none !important; 
      width: 100% !important; 
      margin: 0 !important; 
      padding: 0 !important; 
      text-align: left !important; 
    }
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

  const SubMenuItem = ({ id, label }) => {
    const isActive = activeMenu === id;
    return (
      <div
        onClick={() => setActiveMenu(id)}
        style={{
          padding: "0.8rem 1rem", cursor: "pointer", marginBottom: "5px",
          background: isActive ? "#F3F4F6" : "transparent",
          borderRadius: "12px", transition: "all 0.2s",
          color: isActive ? "#111827" : "#6b7280",
          fontWeight: isActive ? "bold" : "500",
          fontSize: "0.95rem", display: "flex", alignItems: "center"
        }}
      >
        <span style={{ marginRight: "8px", color: isActive ? "#000" : "transparent" }}>•</span>
        {label}
      </div>
    );
  };

  // ==========================================
  // 📺 벤토 화면 렌더링
  // ==========================================
  const renderAccountManager = () => (
    <div style={bentoGridStyle}>
      {/* 폼 영역 (8칸 차지) */}
      <div style={{ ...baseCardStyle, gridColumn: "span 8" }}>
        <h2 style={{ marginBottom: "0.5rem", color: "#111827", fontSize: "1.8rem" }}>고객 계정 발급</h2>
        <p style={{ marginBottom: "2.5rem", color: "#6b7280" }}>
          새로운 병원 고객의 전용 계정을 생성합니다. 입력하신 연락처가 초기 임시 비밀번호로 설정됩니다.
        </p>
        <form onSubmit={handleCreateAccount}>
          {/* 🌟 폼 그리드 구성 (이름, 개월 수 칸 추가) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
            <input style={{...inputStyle, gridColumn: "span 2"}} type="text" placeholder="로그인 아이디" value={userid} onChange={(e) => setUserid(e.target.value)} />          
            <input style={inputStyle} type="text" placeholder="이름" value={username} onChange={(e) => setUsername(e.target.value)} />
            
            {/* 🌟 서비스 개월 수 입력칸 (디자인 특화) */}
            <div style={{ display: "flex", alignItems: "center", background: "#F3F4F6", borderRadius: "16px", padding: "0 1rem", marginBottom: "1rem" }}>
              <span style={{color: "#6b7280", marginRight: "10px", whiteSpace: "nowrap", fontWeight: "bold"}}>이용 기간:</span>
              <input 
                style={{ width: "30%", padding: "1rem 0", border: "none", background: "transparent", outline: "none", fontSize: "1rem", fontWeight: "bold", color: "#111827" }} 
                type="number" min="1" max="120" value={serviceMonths} onChange={(e) => setServiceMonths(e.target.value)} 
              />
              <span style={{color: "#6b7280", marginLeft: "10px", fontWeight: "bold"}}>개월</span>
            </div>

            <input style={{...inputStyle, gridColumn: "span 2"}} type="email" placeholder="이메일" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input style={{...inputStyle, gridColumn: "span 2", border: "2px solid #E5E7EB"}} type="text" placeholder="연락처 (- 없이 숫자만, 임시 비밀번호로 사용)" value={phone} onChange={(e) => setPhone(e.target.value)} />

          </div>

          <button type="submit" style={buttonStyle}
            onMouseDown={(e) => e.target.style.transform = "scale(0.98)"}
            onMouseUp={(e) => e.target.style.transform = "scale(1)"}
          >
            + 새 계정 발급하기
          </button>
        </form>
      </div>

      {/* 결과 창 (기존과 동일하게 유지) */}
      <div style={{ ...baseCardStyle, gridColumn: "span 4", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", background: isError ? "#FEF2F2" : (tempPassword ? "#F0FDF4" : "#FFFFFF"), border: tempPassword ? "2px solid #22C55E" : "none" }}>
        {message ? (
          <>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
              {isError ? "🚨" : "🎉"}
            </div>
            <h3 style={{ color: isError ? "#991B1B" : "#166534", marginBottom: "1rem" }}>{message}</h3>
            {tempPassword && (
              <div style={{ padding: "1.5rem", background: "#FFFFFF", borderRadius: "16px", width: "100%", border: "2px dashed #22C55E" }}>
                <p style={{ margin: "0 0 0.5rem 0", color: "#166534", fontSize: "0.9rem", fontWeight: "bold" }}>초기 임시 비밀번호</p>
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

  const renderAccountList = () => (
    <div style={bentoGridStyle}>
      <div style={{ ...baseCardStyle, gridColumn: "span 12", minHeight: "500px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h2 style={{ marginBottom: "0.5rem", color: "#111827", fontSize: "1.8rem" }}>고객 계정 목록</h2>
            <p style={{ color: "#6b7280" }}>현재 스케줄링 시스템을 이용 중인 전체 병원 고객 리스트입니다.</p>
          </div>
          <button 
            onClick={() => setActiveMenu("account-create")}
            style={{ padding: "0.8rem 1.5rem", background: "#000", color: "#fff", borderRadius: "12px", border: "none", cursor: "pointer", fontWeight: "bold" }}
          >
            + 새 계정 발급
          </button>
        </div>
        
        {/* 임시 테이블 레이아웃 (나중에 DB 데이터 받아와서 맵핑할 곳!) */}
        <div style={{ width: "100%", background: "#F9FAFB", borderRadius: "16px", padding: "4rem 2rem", textAlign: "center", border: "1px dashed #D1D5DB" }}>
          <span style={{ fontSize: "3rem", display: "block", marginBottom: "1rem" }}>📋</span>
          <h3 style={{ color: "#4B5563", marginBottom: "0.5rem" }}>아직 불러온 데이터가 없습니다.</h3>
          <p style={{ color: "#9CA3AF" }}>백엔드 API를 연결하면 여기에 병원 목록이 테이블 형태로 표시됩니다.</p>
        </div>
      </div>
    </div>
  );

  return (
<>
      <style>{globalReset}</style>
      
      <div style={layoutStyle}>
        {/* 👈 좌측 벤토 사이드바 영역 교체 */}
        <div style={sidebarStyle}>
          <div style={logoStyle}>⚡ AI SCHEDULER</div>

          {/* 🌟 메인 메뉴: 계정 관리 (클릭 시 토글) */}
          <div
            onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
            style={{
              padding: "1.2rem 1.5rem", cursor: "pointer", marginBottom: "10px",
              background: (activeMenu.includes("account")) ? "#000000" : "transparent",
              borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "space-between",
              color: (activeMenu.includes("account")) ? "#fff" : "#6b7280", 
              fontWeight: "bold", transition: "all 0.3s"
            }}
          >
            <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
              <span style={{ fontSize: "1.2rem" }}>👥</span>
              <span>계정 관리</span>
            </div>
            <span style={{ fontSize: "0.8rem", transition: "transform 0.3s", transform: isAccountMenuOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
              ▼
            </span>
          </div>

          {/* 🌟 서브 메뉴 영역 (isAccountMenuOpen이 true일 때만 보임) */}
          {isAccountMenuOpen && (
            <div style={{ paddingLeft: "15px", marginBottom: "15px" }}>
              <SubMenuItem id="account-list" label="계정 목록" />
              <SubMenuItem id="account-create" label="계정 발급" />
            </div>
          )}

          {/* 나머지 메뉴들 */}
          <MenuItem id="payment" icon="💳" label="결제 내역 관리" />
          <MenuItem id="stats" icon="📊" label="사용량 통계" />
          <MenuItem id="settings" icon="⚙️" label="시스템 설정" />
        </div>

        {/* 👉 우측 메인 콘텐츠 분기 처리 교체 */}
        <div style={contentWrapperStyle}>
          <div style={headerStyle}>
            <span>
              {activeMenu === "account-list"   ? "👥 계정 관리 > 계정 목록" :
               activeMenu === "account-create" ? "👥 계정 관리 > 계정 발급" :
               activeMenu === "payment"        ? "💳 결제 내역 관리" :
               activeMenu === "stats"          ? "📊 사용량 통계" :
                                                 "⚙️ 시스템 설정"}
            </span>
          </div>
          
          {activeMenu === "account-list"   ? renderAccountList() :
           activeMenu === "account-create" ? renderAccountManager() :
           (
            <div style={{...baseCardStyle, display: "flex", justifyContent: "center", alignItems: "center", minHeight: "400px"}}>
              <div style={{ textAlign: "center", color: "#9CA3AF" }}>
                <span style={{ fontSize: "4rem", display: "block", marginBottom: "1rem" }}>🚧</span>
                <h2>대장! 이 기능은 아직 공사 중입니다!</h2>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;