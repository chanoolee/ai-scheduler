import React, { useState } from "react";

const UserDashboard = () => {
  // API 연동을 위한 임시 유저 ID
  const TEST_USER_ID = "test"; // 🚨 대장 DB에 있는 실제 userid로 꼭 바꿔줘!

  // ==========================================
  // 💾 1. 직원 관리 동적 Grid State & API
  // ==========================================
  const [empList, setEmpList] = useState([{ id: Date.now(), name: "", position: "" }]);

  const handleAddEmpRow = () => {
    setEmpList([...empList, { id: Date.now(), name: "", position: "" }]);
  };

  const handleRemoveEmpRow = (id) => {
    if (empList.length === 1) return alert("최소 1개의 행은 필요합니다!");
    setEmpList(empList.filter(emp => emp.id !== id));
  };

  const handleEmpChange = (id, field, value) => {
    setEmpList(empList.map(emp => emp.id === id ? { ...emp, [field]: value } : emp));
  };

  const handleSaveEmployees = async () => {
    const validEmps = empList.filter(emp => emp.name.trim() !== "");
    if (validEmps.length === 0) return alert("입력된 직원 이름이 없습니다!");

    try {
      const res = await fetch(`http://localhost:8000/settings/employees/${TEST_USER_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validEmps.map(emp => ({ name: emp.name, position: emp.position })))
      });
      const data = await res.json();
      alert(data.message);
      setEmpList([{ id: Date.now(), name: "", position: "" }]); // 폼 초기화
    } catch (err) { console.error(err); alert("대량 등록 실패!"); }
  };

  // ==========================================
  // 💾 2. 근무 타입 설정 동적 Grid State & API
  // ==========================================
  const [shiftList, setShiftList] = useState([{ id: Date.now(), name: "", start_time: "09:00", end_time: "18:00", color: "#DBEAFE" }]);

  const handleAddShiftRow = () => {
    setShiftList([...shiftList, { id: Date.now(), name: "", start_time: "09:00", end_time: "18:00", color: "#DBEAFE" }]);
  };

  const handleRemoveShiftRow = (id) => {
    if (shiftList.length === 1) return alert("최소 1개의 행은 필요합니다!");
    setShiftList(shiftList.filter(shift => shift.id !== id));
  };

  const handleShiftChange = (id, field, value) => {
    setShiftList(shiftList.map(shift => shift.id === id ? { ...shift, [field]: value } : shift));
  };

  const handleSaveShiftTypes = async () => {
    const validShifts = shiftList.filter(s => s.name.trim() !== "");
    if (validShifts.length === 0) return alert("입력된 근무 타입명이 없습니다!");

    try {
      const res = await fetch(`http://localhost:8000/settings/shift-types/${TEST_USER_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validShifts.map(s => ({ 
          name: s.name, 
          start_time: `${s.start_time}:00`, 
          end_time: `${s.end_time}:00`, 
          color: s.color 
        })))
      });
      const data = await res.json();
      alert(data.message);
      setShiftList([{ id: Date.now(), name: "", start_time: "09:00", end_time: "18:00", color: "#DBEAFE" }]);
    } catch (err) { console.error(err); alert("대량 등록 실패!"); }
  };

  // ==========================================
  // 💾 3. 자동화 고정 조건 State & API
  // ==========================================
  const [maxWorkHours, setMaxWorkHours] = useState(160);
  const [opStart, setOpStart] = useState("09:00");
  const [opEnd, setOpEnd] = useState("18:00");
  const [promptText, setPromptText] = useState("");

  const handleSaveConditions = async () => {
    try {
      const res = await fetch(`http://localhost:8000/settings/conditions/${TEST_USER_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          max_work_hours: maxWorkHours, op_start_time: `${opStart}:00`, op_end_time: `${opEnd}:00`, prompt_text: promptText 
        })
      });
      const data = await res.json();
      alert(data.message);
    } catch (err) { console.error(err); alert("고정 조건 저장 실패!"); }
  };
  
  // 🌟 메뉴 상태 관리
  const [activeMenu, setActiveMenu] = useState("shift-settings");

  // ==========================================
  // 🎨 스타일 정의
  // ==========================================
  const layoutStyle = { display: "flex", height: "100vh", width: "100%", padding: "20px", gap: "20px" };
  const sidebarStyle = { width: "280px", height: "100%", background: "#FFFFFF", borderRadius: "30px", display: "flex", flexDirection: "column", padding: "30px 20px", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", flexShrink: 0 };
  const contentWrapperStyle = { flex: 1, height: "100%", display: "flex", flexDirection: "column", gap: "20px" };
  const bentoGridStyle = { display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "20px", flex: 1, minHeight: 0 };
  const baseCardStyle = { background: "#FFFFFF", borderRadius: "30px", padding: "30px", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", overflowY: "auto" };

  // 사이드바 메뉴 렌더링 헬퍼
  const MenuItem = ({ id, icon, label, isSub = false }) => {
    const isActive = activeMenu === id;
    return (
      <div
        onClick={() => setActiveMenu(id)}
        style={{
          padding: isSub ? "0.8rem 1rem 0.8rem 2.5rem" : "1rem 1.2rem",
          cursor: "pointer", marginBottom: "8px",
          background: isActive ? "#000000" : "transparent", 
          borderRadius: "16px",
          color: isActive ? "#fff" : "#6b7280", 
          fontWeight: isActive ? "bold" : "600",
          display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s",
          fontSize: isSub ? "0.95rem" : "1rem"
        }}
      >
        <span>{icon}</span>
        <span>{label}</span>
      </div>
    );
  };

  // ==========================================
  // 📺 1-1. 직원 관리 화면 (일괄 등록 Grid)
  // ==========================================
  const renderEmployeeManage = () => (
    <div style={bentoGridStyle}>
      <div style={{ ...baseCardStyle, gridColumn: "span 12" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", margin: 0 }}>👨‍⚕️ 직원 일괄 등록</h2>
          <button onClick={handleAddEmpRow} style={{ padding: "0.6rem 1rem", background: "#F3F4F6", color: "#111827", borderRadius: "8px", border: "1px solid #D1D5DB", fontWeight: "bold", cursor: "pointer" }}>
            + 행 추가
          </button>
        </div>
        
        {/* 표 헤더 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: "15px", paddingBottom: "10px", borderBottom: "2px solid #E5E7EB", fontWeight: "bold", color: "#4B5563" }}>
          <div>직원 이름</div>
          <div>직급 (선택)</div>
          <div style={{ textAlign: "center" }}>관리</div>
        </div>

        {/* 동적 행 렌더링 */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px", flex: 1, overflowY: "auto" }}>
          {empList.map((emp) => (
            <div key={emp.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 80px", gap: "15px", alignItems: "center" }}>
              <input placeholder="예: 홍길동" value={emp.name} onChange={e => handleEmpChange(emp.id, "name", e.target.value)} style={{ padding: "0.8rem", borderRadius: "8px", border: "1px solid #E5E7EB", outline: "none" }} />
              <input placeholder="예: 수간호사" value={emp.position} onChange={e => handleEmpChange(emp.id, "position", e.target.value)} style={{ padding: "0.8rem", borderRadius: "8px", border: "1px solid #E5E7EB", outline: "none" }} />
              <button onClick={() => handleRemoveEmpRow(emp.id)} style={{ padding: "0.8rem", background: "#FEE2E2", color: "#991B1B", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>삭제</button>
            </div>
          ))}
        </div>

        <button onClick={handleSaveEmployees} style={{ padding: "1.2rem", background: "#000", color: "#fff", borderRadius: "12px", border: "none", fontWeight: "bold", cursor: "pointer", marginTop: "1.5rem" }}>
          💾 직원 목록 한 번에 저장하기
        </button>
      </div>
    </div>
  );

  // ==========================================
  // 📺 1-2. 근무 타입 설정 화면 (일괄 등록 Grid)
  // ==========================================
  const renderShiftSettings = () => (
    <div style={bentoGridStyle}>
      <div style={{ ...baseCardStyle, gridColumn: "span 12" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.5rem", margin: 0 }}>⏰ 근무 타입 일괄 등록</h2>
          <button onClick={handleAddShiftRow} style={{ padding: "0.6rem 1rem", background: "#F3F4F6", color: "#111827", borderRadius: "8px", border: "1px solid #D1D5DB", fontWeight: "bold", cursor: "pointer" }}>
            + 행 추가
          </button>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 80px", gap: "15px", paddingBottom: "10px", borderBottom: "2px solid #E5E7EB", fontWeight: "bold", color: "#4B5563" }}>
          <div>타입명</div>
          <div>시작 시간</div>
          <div>종료 시간</div>
          <div>달력 색상</div>
          <div style={{ textAlign: "center" }}>관리</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px", flex: 1, overflowY: "auto" }}>
          {shiftList.map((shift) => (
            <div key={shift.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr 80px", gap: "15px", alignItems: "center" }}>
              <input placeholder="예: Day" value={shift.name} onChange={e => handleShiftChange(shift.id, "name", e.target.value)} style={{ padding: "0.8rem", borderRadius: "8px", border: "1px solid #E5E7EB", outline: "none" }} />
              <input type="time" value={shift.start_time} onChange={e => handleShiftChange(shift.id, "start_time", e.target.value)} style={{ padding: "0.8rem", borderRadius: "8px", border: "1px solid #E5E7EB", outline: "none" }} />
              <input type="time" value={shift.end_time} onChange={e => handleShiftChange(shift.id, "end_time", e.target.value)} style={{ padding: "0.8rem", borderRadius: "8px", border: "1px solid #E5E7EB", outline: "none" }} />
              <select value={shift.color} onChange={e => handleShiftChange(shift.id, "color", e.target.value)} style={{ padding: "0.8rem", borderRadius: "8px", border: "1px solid #E5E7EB", outline: "none", background: shift.color }}>
                <option value="#DBEAFE">파랑 (Day)</option>
                <option value="#FEF9C3">노랑 (Eve)</option>
                <option value="#F3E8FF">보라 (Night)</option>
                <option value="#FEE2E2">빨강 (Off)</option>
                <option value="#D1FAE5">초록</option>
              </select>
              <button onClick={() => handleRemoveShiftRow(shift.id)} style={{ padding: "0.8rem", background: "#FEE2E2", color: "#991B1B", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold" }}>삭제</button>
            </div>
          ))}
        </div>

        <button onClick={handleSaveShiftTypes} style={{ padding: "1.2rem", background: "#000", color: "#fff", borderRadius: "12px", border: "none", fontWeight: "bold", cursor: "pointer", marginTop: "1.5rem" }}>
          💾 근무 타입 한 번에 저장하기
        </button>
      </div>
    </div>
  );

  // ==========================================
  // 📺 1-3. 자동화 고정 조건 화면
  // ==========================================
  const renderAutoConditions = () => (
    <div style={bentoGridStyle}>
      {/* 👈 좌측: 기본 수치 설정 (4칸) */}
      <div style={{ ...baseCardStyle, gridColumn: "span 4", background: "#F8FAFC" }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>⚙️ 기본 운영 설정</h2>
        <p style={{ color: "#6b7280", marginBottom: "1.5rem", fontSize: "0.9rem" }}>스케줄링의 뼈대가 되는 기본 수치입니다.</p>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "15px", flex: 1 }}>
          <div>
            <label style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#374151" }}>인당 월별 만근 시간 (시간)</label>
            <input type="number" value={maxWorkHours} onChange={e => setMaxWorkHours(Number(e.target.value))} defaultValue={160} style={{ width: "100%", padding: "1rem", marginTop: "5px", borderRadius: "12px", border: "1px solid #E5E7EB", outline: "none" }} />
          </div>
          <div>
            <label style={{ fontWeight: "bold", fontSize: "0.9rem", color: "#374151" }}>병원 운영 시간</label>
            <div style={{ display: "flex", gap: "10px", marginTop: "5px" }}>
              <input type="time" value={opStart} onChange={e => setOpStart(e.target.value)} defaultValue="09:00" style={{ flex: 1, padding: "1rem", borderRadius: "12px", border: "1px solid #E5E7EB", outline: "none" }} />
              <span style={{ display: "flex", alignItems: "center" }}>~</span>
              <input type="time" value={opEnd} onChange={e => setOpEnd(e.target.value)} defaultValue="18:00" style={{ flex: 1, padding: "1rem", borderRadius: "12px", border: "1px solid #E5E7EB", outline: "none" }} />
            </div>
          </div>
        </div>
      </div>

      {/* 👉 우측: AI 자연어 고정 규칙 (8칸) */}
      <div style={{ ...baseCardStyle, gridColumn: "span 8" }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>🤖 AI 맞춤 고정 규칙 (자연어)</h2>
        <p style={{ color: "#6b7280", marginBottom: "1.5rem", fontSize: "0.9rem" }}>
          매월 변하지 않고 <b>항상 적용되어야 할</b> 병원만의 특별한 제약 조건을 자연어로 자유롭게 입력해 주세요.
        </p>
        
        <textarea value={promptText} onChange={e => setPromptText(e.target.value)}
          placeholder="예시:&#13;&#10;- 간호사는 연속 3일 이상 나이트(N) 근무를 할 수 없습니다.&#13;&#10;- 나이트(N) 근무 다음 날은 반드시 오프(O)를 부여해야 합니다.&#13;&#10;- 수간호사는 주말(토, 일) 근무에서 제외합니다.&#13;&#10;- 이브닝(E) 근무 다음 날 데이(D) 근무 배정을 금지합니다."
          style={{ 
            width: "100%", flex: 1, padding: "1.5rem", borderRadius: "16px", 
            background: "#F9FAFB", color: "#111827", border: "1px solid #D1D5DB", 
            outline: "none", resize: "none", lineHeight: "1.6", fontSize: "0.95rem",
            marginBottom: "1.5rem", whiteSpace: "pre-wrap"
          }}
        />
        
        <button onClick={handleSaveConditions}
          style={{ 
            width: "100%", padding: "1.2rem", background: "#000", color: "#fff", 
            border: "none", borderRadius: "16px", fontSize: "1.1rem", fontWeight: "bold", 
            cursor: "pointer", transition: "transform 0.1s" 
          }}
          onMouseDown={(e) => e.target.style.transform = "scale(0.99)"}
          onMouseUp={(e) => e.target.style.transform = "scale(1)"}
        >
          💾 설정 및 고정 규칙 저장하기 (DB 반영)
        </button>
      </div>
    </div>
  );

  return (
    <div style={layoutStyle}>
      {/* 👈 좌측 사이드바 */}
      <div style={sidebarStyle}>
        <div style={{ fontSize: "1.2rem", fontWeight: "900", textAlign: "center", marginBottom: "2rem", color: "#111827", background: "#F3F4F6", padding: "15px", borderRadius: "20px" }}>
          ⚡ SCHEDULER
        </div>

        {/* 🌟 1. 설정 그룹 (상위 타이틀 + 하위 메뉴 3개) */}
        <div style={{ padding: "0 10px", fontSize: "1.2rem", color: "#9CA3AF", marginBottom: "10px", fontWeight: "bold" }}>⚙️ 직원 관리 및 설정</div>
        <MenuItem id="employee-manage" icon="👨‍⚕️" label="직원 관리" isSub={true} />
        <MenuItem id="shift-settings" icon="⏰" label="근무 타입 설정" isSub={true} />
        <MenuItem id="auto-conditions" icon="🤖" label="자동화 고정 조건" isSub={true} />

        {/* 🌟 2. 스케줄링 그룹 */}
        <div style={{ padding: "0 10px", fontSize: "1.2rem", color: "#9CA3AF", marginBottom: "10px", marginTop: "20px", fontWeight: "bold" }}>📅 스케줄링 작업</div>
        <MenuItem id="schedule-create" icon="✨" label="시간표 짜기" />
        <MenuItem id="schedule-view" icon="📊" label="근무표 월별 조회" />
      </div>

      {/* 👉 우측 메인 콘텐츠 */}
      <div style={contentWrapperStyle}>
        {/* 상단 헤더 (동적 타이틀) */}
        <div style={{ background: "#FFFFFF", borderRadius: "30px", padding: "20px 40px", display: "flex", alignItems: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", fontSize: "1.2rem", fontWeight: "bold", color: "#1f2937", flexShrink: 0 }}>
          {activeMenu === "employee-manage" ? "👨‍⚕️ 직원 관리" :
           activeMenu === "shift-settings"  ? "⏰ 근무 타입 설정" :
           activeMenu === "auto-conditions" ? "🤖 자동화 고정 조건 설정" :
           activeMenu === "schedule-create" ? "✨ 시간표 짜기 (AI 자동화)" :
                                              "📊 근무표 월별 조회"}
        </div>
        
        {/* 렌더링 스위치 */}
        {activeMenu === "employee-manage" && renderEmployeeManage()}
        {activeMenu === "shift-settings"  && renderShiftSettings()}
        {activeMenu === "auto-conditions" && renderAutoConditions()}
        {activeMenu === "schedule-create" && <div>(아까 만든 시간표 화면 대기중...)</div>}
        {activeMenu === "schedule-view"   && <div>(월별 조회 화면 대기중...)</div>}
      </div>
    </div>
  );
};

export default UserDashboard;