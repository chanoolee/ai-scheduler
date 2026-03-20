import React, { useState, useEffect } from "react";

const UserDashboard = () => {
  const TEST_USER_ID = "test"; // 🚨 대장 실제 DB 아이디!
  const [activeMenu, setActiveMenu] = useState("shift-settings");
  const [isLoading, setIsLoading] = useState(false);

  // ==========================================
  // 🔄 데이터 불러오기 (메뉴 바뀔 때마다)
  // ==========================================
  useEffect(() => {
    if (activeMenu === "employee-manage") fetchEmployees();
    if (activeMenu === "shift-settings") fetchShiftTypes();
    // 🌟 시간표 짤 때는 '직원 목록'과 '근무 타입' 둘 다 필요해!
    if (activeMenu === "schedule-create") {
      fetchEmployees();
      fetchShiftTypes();
    }
    if (activeMenu === "auto-conditions") fetchConditions();
  }, [activeMenu]);

  // ==========================================
  // 👨‍⚕️ 1. 직원 관리 (추가 Grid + 기존 목록)
  // ==========================================
  const [existingEmps, setExistingEmps] = useState([]);
  const [newEmps, setNewEmps] = useState([{ id: Date.now(), name: "", position: "" }]);
  const [editModeEmps, setEditModeEmps] = useState({}); 
  const toggleEmpEdit = (id) => setEditModeEmps(prev => ({ ...prev, [id]: !prev[id] }));

  const fetchEmployees = async () => {
    setIsLoading(true); // 🌟 로딩 켜기!
    try {
      const res = await fetch(`http://127.0.0.1:8000/settings/employees/${TEST_USER_ID}`);
      setExistingEmps(await res.json());
    } catch (err) { 
      console.error("직원 로드 에러", err); 
    } finally {
      setIsLoading(false); // 🌟 로딩 끄기!
    }
  };

  // [신규 추가 로직]
  const handleAddNewEmpRow = () => setNewEmps([...newEmps, { id: Date.now(), name: "", position: "" }]);
  const handleRemoveNewEmpRow = (id) => setNewEmps(newEmps.filter(e => e.id !== id));
  const handleNewEmpChange = (id, field, value) => setNewEmps(newEmps.map(e => e.id === id ? { ...e, [field]: value } : e));

  const handleSaveNewEmployees = async () => {
    const valid = newEmps.filter(e => e.name.trim() !== "");
    if (valid.length === 0) return alert("추가할 직원을 입력해주세요!");

    try {
      const res = await fetch(`http://127.0.0.1:8000/settings/employees/${TEST_USER_ID}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valid.map(e => ({ name: e.name, position: e.position })))
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      alert(data.message);
      setNewEmps([{ id: Date.now(), name: "", position: "" }]); // 추가 폼만 리셋
      fetchEmployees(); // 목록 리로드
    } catch (err) { alert(`에러: ${err.message}`); }
  };

  // [기존 수정/삭제 로직]
  const handleExistingEmpChange = (id, field, value) => setExistingEmps(existingEmps.map(e => e.id === id ? { ...e, [field]: value } : e));

  const handleUpdateEmployee = async (emp) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/settings/employees/${TEST_USER_ID}/${emp.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: emp.name, position: emp.position })
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      alert("수정 완료!");
      fetchEmployees();

      setEditModeEmps(prev => ({ ...prev, [emp.id]: false })); 
      fetchEmployees();
    } catch (err) { alert(`수정 실패: ${err.message}`); fetchEmployees(); }
  };

  const handleDeleteEmployee = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await fetch(`http://127.0.0.1:8000/settings/employees/${TEST_USER_ID}/${id}`, { method: "DELETE" });
      alert("삭제 완료!");
      fetchEmployees();
    } catch (err) { alert("삭제 실패"); }
  };

  const handleCancelEmpEdit = (id) => {
    setEditModeEmps(prev => ({ ...prev, [id]: false })); // 편집 모드 끄기
    fetchEmployees(); // 🌟 DB에서 원본 다시 불러와서 입력창 덮어쓰기!
  };


  // ==========================================
  // ⏰ 2. 근무 타입 (추가 Grid + 기존 목록)
  // ==========================================
  const [existingShifts, setExistingShifts] = useState([]);
  const [newShifts, setNewShifts] = useState([{ id: Date.now(), name: "", start_time: "09:00", end_time: "18:00", color: "#DBEAFE" }]);
  const [editModeShifts, setEditModeShifts] = useState({});
  // 휴가(연차) 기본 설정 State
  const [leaveSettings, setLeaveSettings] = useState({
    annual: true,   // 기본적으로 연차는 무조건 쓴다고 가정!
    half: false,    // 반차
    quarter: false  // 반반차
  });

  const toggleShiftEdit = (id) => setEditModeShifts(prev => ({ ...prev, [id]: !prev[id] }));

  const fetchShiftTypes = async () => {
    setIsLoading(true); // 🌟 로딩 켜기!
    try {
      const res = await fetch(`http://127.0.0.1:8000/settings/shift-types/${TEST_USER_ID}`);
      setExistingShifts(await res.json());
    } catch (err) { 
      console.error("근무타입 로드 에러", err); 
    } finally {
      setIsLoading(false); // 🌟 로딩 끄기!
    }
  };

  const handleAddNewShiftRow = () => setNewShifts([...newShifts, { id: Date.now(), name: "", start_time: "09:00", end_time: "18:00", color: "#DBEAFE" }]);
  const handleRemoveNewShiftRow = (id) => setNewShifts(newShifts.filter(s => s.id !== id));
  const handleNewShiftChange = (id, field, value) => setNewShifts(newShifts.map(s => s.id === id ? { ...s, [field]: value } : s));

  const handleSaveNewShiftTypes = async () => {
    const valid = newShifts.filter(s => s.name.trim() !== "");
    if (valid.length === 0) return alert("추가할 근무 타입을 입력해주세요!");
    try {
      const res = await fetch(`http://127.0.0.1:8000/settings/shift-types/${TEST_USER_ID}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(valid.map(s => ({ name: s.name, start_time: `${s.start_time}:00`, end_time: `${s.end_time}:00`, color: s.color })))
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      alert(data.message);
      setNewShifts([{ id: Date.now(), name: "", start_time: "09:00", end_time: "18:00", color: "#DBEAFE" }]);
      fetchShiftTypes();
    } catch (err) { alert(`에러: ${err.message}`); }
  };

  // [기존 수정/삭제 로직]
  const handleExistingShiftChange = (id, field, value) => setExistingShifts(existingShifts.map(s => s.id === id ? { ...s, [field]: value } : s));

  const handleUpdateShift = async (s) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/settings/shift-types/${TEST_USER_ID}/${s.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: s.name, start_time: `${s.start_time}:00`, end_time: `${s.end_time}:00`, color: s.color })
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      alert("수정 완료!");
      fetchShiftTypes();

      setEditModeShifts(prev => ({ ...prev, [s.id]: false }));
      fetchShiftTypes();
    } catch (err) { alert(`수정 실패: ${err.message}`); fetchShiftTypes(); }
  };

  const handleDeleteShift = async (id) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await fetch(`http://127.0.0.1:8000/settings/shift-types/${TEST_USER_ID}/${id}`, { method: "DELETE" });
      alert("삭제 완료!");
      fetchShiftTypes();
    } catch (err) { alert("삭제 실패"); }
  };

  const handleCancelShiftEdit = (id) => {
    setEditModeShifts(prev => ({ ...prev, [id]: false })); // 편집 모드 끄기
    fetchShiftTypes(); // 🌟 DB 원본으로 롤백!
  };

  // 시스템에서 고정으로 제공하는 휴가 타입들
  const SYSTEM_LEAVES = [
    { id: "leave_annual", name: "연차", color: "#FCA5A5", isSystem: true },
    { id: "leave_half", name: "반차", color: "#FCD34D", isSystem: true },
    { id: "leave_quarter", name: "반반차", color: "#FEF08A", isSystem: true }
  ];

  // 사용자가 등록한 근무 + 체크된 시스템 휴가를 하나로 합쳐주는 함수
  const getAvailableShifts = () => {
    const activeLeaves = [];
    if (leaveSettings.annual) activeLeaves.push(SYSTEM_LEAVES[0]);
    if (leaveSettings.half) activeLeaves.push(SYSTEM_LEAVES[1]);
    if (leaveSettings.quarter) activeLeaves.push(SYSTEM_LEAVES[2]);
    return [...existingShifts, ...activeLeaves];
  };

  // ==========================================
  // 🤖 3. 고정 조건 (기존 유지)
  // ==========================================
  const [maxWorkHours, setMaxWorkHours] = useState(160);
  const [opStart, setOpStart] = useState("09:00");
  const [opEnd, setOpEnd] = useState("18:00");
  const [promptText, setPromptText] = useState("");

  const handleSaveConditions = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/settings/conditions/${TEST_USER_ID}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ max_work_hours: maxWorkHours, op_start_time: `${opStart}:00`, op_end_time: `${opEnd}:00`, prompt_text: promptText })
      });
      alert((await res.json()).message);
    } catch (err) { alert("저장 실패!"); }
  };

  // 🌟 [NEW] 고정 조건 데이터 불러오는 함수
  const fetchConditions = async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/settings/conditions/${TEST_USER_ID}`);
      if (res.ok) {
        const data = await res.json();
        // DB에서 가져온 값으로 State를 싹 다 엎어치기!
        setMaxWorkHours(data.max_work_hours || 160);
        setOpStart(data.op_start_time || "09:00");
        setOpEnd(data.op_end_time || "18:00");
        setPromptText(data.prompt_text || "");
      }
    } catch (err) {
      console.error("고정 조건 로드 에러", err);
    }
  };

  // ==========================================
  // ✨ 4. 시간표 짜기 (AI + 엑셀형 매트릭스) State
  // ==========================================
  const [scheduleYear, setScheduleYear] = useState(2026);
  const [scheduleMonth, setScheduleMonth] = useState(3);
  const [schedulePrompt, setSchedulePrompt] = useState("");
  
  // "직원ID_날짜": 근무타입객체 형태로 저장 (예: "1_15": Day객체)
  const [manualShifts, setManualShifts] = useState({});

  // 달력 셀 Select 박스 변경 시
  const handleCellSelect = (empId, day, shiftId) => {
    setManualShifts(prev => {
      const key = `${empId}_${day}`;
      const newShifts = { ...prev };
      
      if (!shiftId) {
        delete newShifts[key]; // '-' 선택 시 빈칸으로 초기화
      } else {
        // 합쳐진 전체 목록(일반 근무 + 켜져있는 휴가)에서 찾기
        const allShifts = getAvailableShifts();

        // 선택한 shiftId와 일치하는 근무 타입 객체 찾아서 배정
        const selectedShift = existingShifts.find(s => s.id.toString() === shiftId);
        if (selectedShift) newShifts[key] = selectedShift;
      }
      return newShifts;
    });
  };

  // AI 스케줄 자동 생성 API 호출 함수
  const handleGenerateSchedule = async () => {
    // 1. 최소한의 데이터가 있는지 확인
    if (existingEmps.length === 0 || existingShifts.length === 0) {
      return alert("🚨 직원 목록과 근무 타입을 먼저 설정해주세요!");
    }

    setIsLoading(true); // 🌟 두근두근 로딩 시작!

    try {
      // 2. 백엔드로 쏠 데이터(Payload) 예쁘게 포장하기
      const payload = {
        year: scheduleYear,
        month: scheduleMonth,
        ai_prompt: schedulePrompt,
        manual_shifts: manualShifts // 대장이 화면에서 콕콕 찍어둔 수동 스케줄
      };

      // 3. 백엔드 AI 라우터로 슛!
      const res = await fetch(`http://127.0.0.1:8000/schedule/generate/${TEST_USER_ID}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.detail || "AI 스케줄 생성 실패");
      }

      const data = await res.json();
      
      // 4. 성공 알림창 띄우고, AI가 짜준 스케줄로 화면(State) 엎어치기!
      alert(data.message);
      if (data.schedule) {
        setManualShifts(data.schedule); // 화면 달력에 데이터가 촤르륵! 채워짐
      }

    } catch (err) {
      console.error(err);
      alert(`🚨 생성 중 오류 발생: ${err.message}`);
    } finally {
      setIsLoading(false); // 로딩 끝!
    }
  };

  // ==========================================
  // 🎨 공통 렌더링 세팅
  // ==========================================
  const layoutStyle = { 
    display: "flex", 
    minHeight: "100vh", // 🌟 핵심: 화면보다 내용이 길면 늘어나도록 허용!
    width: "100%", 
    padding: "20px", 
    gap: "20px",
    alignItems: "flex-start" // 🌟 사이드바가 억지로 늘어나지 않게 상단에 정렬
  };
  const sidebarStyle = { 
    width: "280px", 
    height: "calc(100vh - 40px)", // 🌟 위아래 여백(20px씩) 뺀 모니터 꽉 찬 높이
    position: "sticky",           // 🌟 핵심: 스크롤해도 화면에 고정!
    top: "20px",                  // 🌟 고정될 때 위에서 20px 띄움
    background: "#FFFFFF", 
    borderRadius: "30px", 
    display: "flex", 
    flexDirection: "column", 
    padding: "30px 20px", 
    boxShadow: "0 10px 40px rgba(0,0,0,0.03)", 
    flexShrink: 0 
  };
  const contentWrapperStyle = { 
    flex: 1, 
    display: "flex", 
    flexDirection: "column", 
    gap: "20px" 
  };
  const bentoGridStyle = { display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "20px", flex: 1, minHeight: 0 };
  const baseCardStyle = { background: "#FFFFFF", borderRadius: "30px", padding: "30px", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", overflowY: "auto" };

  const MenuItem = ({ id, icon, label, isSub = false }) => {
    const isActive = activeMenu === id;
    return (
      <div onClick={() => setActiveMenu(id)} style={{ padding: isSub ? "0.8rem 1rem 0.8rem 2.5rem" : "1rem 1.2rem", cursor: "pointer", marginBottom: "8px", background: isActive ? "#000000" : "transparent", borderRadius: "16px", color: isActive ? "#fff" : "#6b7280", fontWeight: isActive ? "bold" : "600", display: "flex", alignItems: "center", gap: "12px", transition: "all 0.2s", fontSize: isSub ? "0.95rem" : "1rem" }}>
        <span>{icon}</span><span>{label}</span>
      </div>
    );
  };

  const basicInputStyle = { padding: "0.8rem", borderRadius: "8px", border: "1px solid #E5E7EB", outline: "none", width: "100%" };
  const btnStyle = (bg, color) => ({ padding: "0.8rem", background: bg, color: color, borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "bold", width: "100%" });

// ==========================================
  // 📺 화면 1. 직원 관리 렌더링 (버튼 스위칭 적용)
  // ==========================================
  const renderEmployeeManage = () => (
    <div style={bentoGridStyle}>
      {/* 🌟 기존 목록 창 (8칸) */}
      <div style={{ ...baseCardStyle, gridColumn: "span 8" }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>📋 등록된 직원 목록</h2>
        
        {/* 관리 버튼 폭을 140px로 넉넉하게 유지 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px", gap: "10px", fontWeight: "bold", borderBottom: "2px solid #E5E7EB", paddingBottom: "10px", color: "#4B5563", fontSize: "0.9rem" }}>
          <div>이름</div><div>직급</div><div style={{ textAlign: "center" }}>관리</div>
        </div>
        
        <div style={{ flex: 1, overflowY: "auto", marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {isLoading ? (
            // 🌟 로딩 중일 때 보여줄 화면
            <div style={{ padding: "30px", textAlign: "center", color: "#6B7280", fontWeight: "bold", background: "#F9FAFB", borderRadius: "12px", animation: "pulse 1.5s infinite" }}>
              ⏳ 데이터를 안전하게 불러오는 중입니다...
            </div>
          ) : (
            // 🌟 로딩이 끝났을 때 보여줄 진짜 데이터
            <>
            {existingEmps.map(emp => {
              const isEditing = editModeEmps[emp.id];
              const inputBg = isEditing ? "#fff" : "transparent";
              const inputBorder = isEditing ? "1px solid #E5E7EB" : "1px solid transparent";

              return (
                <div key={emp.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 140px", gap: "10px", alignItems: "center", background: "#F9FAFB", padding: "10px", borderRadius: "12px" }}>
                  <input value={emp.name} disabled={!isEditing} onChange={e => handleExistingEmpChange(emp.id, "name", e.target.value)} style={{ ...basicInputStyle, background: inputBg, border: inputBorder, color: isEditing ? "#000" : "#4B5563" }} />
                  <input value={emp.position} disabled={!isEditing} onChange={e => handleExistingEmpChange(emp.id, "position", e.target.value)} style={{ ...basicInputStyle, background: inputBg, border: inputBorder, color: isEditing ? "#000" : "#4B5563" }} />
                  
                  {/* 🌟 편집 모드에 따른 버튼 완벽 분리! */}
                  <div style={{ display: "flex", gap: "5px", width: "100%" }}>
                    {!isEditing ? (
                      <>
                        <button onClick={() => toggleEmpEdit(emp.id)} style={{ ...btnStyle("#E5E7EB", "#374151"), padding: "0.6rem", fontSize: "0.85rem" }}>편집</button>
                        <button onClick={() => handleDeleteEmployee(emp.id)} style={{ ...btnStyle("#FEE2E2", "#991B1B"), padding: "0.6rem", fontSize: "0.85rem" }}>삭제</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleUpdateEmployee(emp)} style={{ ...btnStyle("#E0E7FF", "#3730A3"), padding: "0.6rem", fontSize: "0.85rem" }}>수정</button>
                        <button onClick={() => handleCancelEmpEdit(emp.id)} style={{ ...btnStyle("#F3F4F6", "#4B5563"), padding: "0.6rem", fontSize: "0.85rem" }}>취소</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {!isLoading && existingEmps.length === 0 && (
                  <p style={{ textAlign: "center", color: "#9CA3AF", marginTop: "20px" }}>등록된 직원이 없습니다.</p>
                )}
            </>
          )}
        </div>
      </div>

      {/* 🌟 신규 추가 창 (4칸) */}
      <div style={{ ...baseCardStyle, gridColumn: "span 4", background: "#F8FAFC" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.3rem", margin: 0 }}>✨ 신규 직원 추가</h2>
          <button onClick={handleAddNewEmpRow} style={{ padding: "0.4rem 0.8rem", background: "#E5E7EB", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>+ 칸 추가</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {newEmps.map((emp) => (
              <div key={emp.id} style={{ display: "flex", flexDirection: "column", gap: "5px", background: "#fff", padding: "15px", borderRadius: "12px", border: "1px solid #E5E7EB", position: "relative" }}>
                <input placeholder="직원 이름" value={emp.name} onChange={e => handleNewEmpChange(emp.id, "name", e.target.value)} style={basicInputStyle} />
                <input placeholder="직급 (옵션)" value={emp.position} onChange={e => handleNewEmpChange(emp.id, "position", e.target.value)} style={basicInputStyle} />
                {newEmps.length > 1 && <button onClick={() => handleRemoveNewEmpRow(emp.id)} style={{ position: "absolute", top: "5px", right: "5px", background: "none", border: "none", color: "#EF4444", cursor: "pointer" }}>✕</button>}
              </div>
            ))}
          </div>
          <button onClick={handleSaveNewEmployees} style={{ padding: "1.2rem", background: "#000", color: "#fff", borderRadius: "12px", border: "none", fontWeight: "bold", cursor: "pointer", marginTop: "15px", flexShrink: 0 }}>
            💾 추가 반영하기
          </button>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // 📺 화면 2. 근무 타입 설정 렌더링
  // ==========================================
  const renderShiftSettings = () => (
    <div style={bentoGridStyle}>

      {/* 휴가 기본 설정 패널 */}
      <div style={{ ...baseCardStyle, gridColumn: "span 12", padding: "20px 30px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", background: "#FFFBEB", border: "1px solid #FDE68A" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <h2 style={{ fontSize: "1.2rem", margin: 0, color: "#D97706" }}>🌴 공통 휴가(연차) 설정</h2>
          <span style={{ fontSize: "0.85rem", color: "#92400E" }}>병원에서 사용하는 휴가 항목을 켜두면, 시간표 짤 때 자동으로 목록에 나타납니다.</span>
        </div>
        <div style={{ display: "flex", gap: "25px", fontWeight: "bold", fontSize: "1rem", color: "#111827" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={leaveSettings.annual} onChange={e => setLeaveSettings({...leaveSettings, annual: e.target.checked})} style={{ width: "20px", height: "20px", accentColor: "#D97706" }} /> 연차
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={leaveSettings.half} onChange={e => setLeaveSettings({...leaveSettings, half: e.target.checked})} style={{ width: "20px", height: "20px", accentColor: "#D97706" }} /> 반차
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
            <input type="checkbox" checked={leaveSettings.quarter} onChange={e => setLeaveSettings({...leaveSettings, quarter: e.target.checked})} style={{ width: "20px", height: "20px", accentColor: "#D97706" }} /> 반반차
          </label>
        </div>
      </div>

      {/* 🌟 기존 목록 창 (대장의 요청대로 span 7 -> 8칸으로 넓힘!) */}
      <div style={{ ...baseCardStyle, gridColumn: "span 8" }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>📋 등록된 근무 타입</h2>
        
        {/* 넓어진 폭에 맞춰서 버튼 공간(140px) 넉넉하게 확보! */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 40px 140px", gap: "10px", fontWeight: "bold", borderBottom: "2px solid #E5E7EB", paddingBottom: "10px", color: "#4B5563", fontSize: "0.9rem" }}>
          <div>타입명</div>
          <div>시작 시간</div>
          <div>종료 시간</div>
          <div style={{ textAlign: "center" }}>색상</div>
          <div style={{ textAlign: "center" }}>관리</div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", marginTop: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
          {isLoading ? (
            // 🌟 로딩 중일 때 보여줄 화면
            <div style={{ padding: "30px", textAlign: "center", color: "#6B7280", fontWeight: "bold", background: "#F9FAFB", borderRadius: "8px", animation: "pulse 1.5s infinite" }}>
              ⏳ 근무 타입 데이터를 불러오는 중입니다...
            </div>
          ) : (
            // 🌟 로딩이 끝났을 때 보여줄 진짜 데이터
            <>
            {existingShifts.map(s => {
              const isEditing = editModeShifts[s.id];
              const inputBg = isEditing ? "#fff" : "transparent";
              const inputBorder = isEditing ? "1px solid #E5E7EB" : "1px solid transparent";

              return (
                <div key={s.id} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 40px 140px", gap: "10px", alignItems: "center", background: "#F9FAFB", padding: "8px 10px", borderRadius: "8px", borderLeft: `4px solid ${s.color}` }}>
                  <input value={s.name} disabled={!isEditing} onChange={e => handleExistingShiftChange(s.id, "name", e.target.value)} style={{ ...basicInputStyle, padding: "0.6rem", fontSize: "0.9rem", background: inputBg, border: inputBorder, color: isEditing ? "#000" : "#4B5563" }} />
                  <input type="time" value={s.start_time} disabled={!isEditing} onChange={e => handleExistingShiftChange(s.id, "start_time", e.target.value)} style={{ ...basicInputStyle, padding: "0.6rem", fontSize: "0.9rem", background: inputBg, border: inputBorder, color: isEditing ? "#000" : "#4B5563" }} />
                  <input type="time" value={s.end_time} disabled={!isEditing} onChange={e => handleExistingShiftChange(s.id, "end_time", e.target.value)} style={{ ...basicInputStyle, padding: "0.6rem", fontSize: "0.9rem", background: inputBg, border: inputBorder, color: isEditing ? "#000" : "#4B5563" }} />
                  <input type="color" value={s.color} disabled={!isEditing} onChange={e => handleExistingShiftChange(s.id, "color", e.target.value)} style={{ width: "30px", height: "30px", padding: 0, border: "none", cursor: isEditing ? "pointer" : "default", margin: "0 auto", opacity: isEditing ? 1 : 0.7 }} />
                  
                  {/* 🌟 편집 모드에 따른 버튼 스위칭! */}
                  <div style={{ display: "flex", gap: "5px", width: "100%" }}>
                    {!isEditing ? (
                      <>
                        <button onClick={() => toggleShiftEdit(s.id)} style={{ ...btnStyle("#E5E7EB", "#374151"), padding: "0.6rem", fontSize: "0.85rem" }}>편집</button>
                        <button onClick={() => handleDeleteShift(s.id)} style={{ ...btnStyle("#FEE2E2", "#991B1B"), padding: "0.6rem", fontSize: "0.85rem" }}>삭제</button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleUpdateShift(s)} style={{ ...btnStyle("#E0E7FF", "#3730A3"), padding: "0.6rem", fontSize: "0.85rem" }}>수정</button>
                        <button onClick={() => handleCancelShiftEdit(s.id)} style={{ ...btnStyle("#F3F4F6", "#4B5563"), padding: "0.6rem", fontSize: "0.85rem" }}>취소</button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {!isLoading && existingShifts.length === 0 && (
                <p style={{ textAlign: "center", color: "#9CA3AF", marginTop: "20px" }}>등록된 타입이 없습니다.</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* 🌟 신규 추가 창 */}
      <div style={{ ...baseCardStyle, gridColumn: "span 4", background: "#F8FAFC"}}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.3rem", margin: 0 }}>✨ 신규 추가</h2>
          <button onClick={handleAddNewShiftRow} style={{ padding: "0.4rem 0.8rem", background: "#E5E7EB", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", fontSize: "0.85rem" }}>+ 칸 추가</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {newShifts.map((s) => (
              <div key={s.id} style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#fff", padding: "12px", borderRadius: "10px", border: "1px solid #E5E7EB", position: "relative" }}>
                <input placeholder="예: Day" value={s.name} onChange={e => handleNewShiftChange(s.id, "name", e.target.value)} style={{ ...basicInputStyle, padding: "0.7rem" }} />
                <div style={{ display: "flex", gap: "8px" }}>
                  <input type="time" value={s.start_time} onChange={e => handleNewShiftChange(s.id, "start_time", e.target.value)} style={{ ...basicInputStyle, padding: "0.7rem" }} />
                  <input type="time" value={s.end_time} onChange={e => handleNewShiftChange(s.id, "end_time", e.target.value)} style={{ ...basicInputStyle, padding: "0.7rem" }} />
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "2px" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: "bold", color: "#6B7280" }}>색상:</span>
                  <input type="color" value={s.color} onChange={e => handleNewShiftChange(s.id, "color", e.target.value)} style={{ width: "30px", height: "30px", padding: 0, border: "none", cursor: "pointer" }} />
                </div>
                {newShifts.length > 1 && <button onClick={() => handleRemoveNewShiftRow(s.id)} style={{ position: "absolute", top: "5px", right: "5px", background: "none", border: "none", color: "#EF4444", cursor: "pointer", fontSize: "1.2rem" }}>✕</button>}
              </div>
            ))}
          </div>
          <button onClick={handleSaveNewShiftTypes} style={{ padding: "1rem", background: "#000", color: "#fff", borderRadius: "10px", border: "none", fontWeight: "bold", cursor: "pointer", marginTop: "15px", flexShrink: 0 }}>
            💾 추가 반영하기
          </button>
        </div>
      </div>
    </div>
  );

  // ==========================================
  // 📺 화면 3. 자동화 고정 조건 (기존 유지)
  // ==========================================
  const renderAutoConditions = () => (
    <div style={bentoGridStyle}>
      <div style={{ ...baseCardStyle, gridColumn: "span 4", background: "#F8FAFC" }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>⚙️ 기본 운영 설정</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "15px", flex: 1 }}>
          <div><label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>인당 월별 만근 시간 (시간)</label><input type="number" value={maxWorkHours} onChange={e => setMaxWorkHours(Number(e.target.value))} style={{ ...basicInputStyle, marginTop: "5px" }} /></div>
          <div><label style={{ fontWeight: "bold", fontSize: "0.9rem" }}>병원 운영 시간</label><div style={{ display: "flex", gap: "10px", marginTop: "5px" }}><input type="time" value={opStart} onChange={e => setOpStart(e.target.value)} style={basicInputStyle} /><span>~</span><input type="time" value={opEnd} onChange={e => setOpEnd(e.target.value)} style={basicInputStyle} /></div></div>
        </div>
      </div>
      <div style={{ ...baseCardStyle, gridColumn: "span 8" }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>🤖 AI 맞춤 고정 규칙 (자연어)</h2>
        <textarea value={promptText} onChange={e => setPromptText(e.target.value)} placeholder="예: 간호사는 연속 3일 N 불가" style={{ width: "100%", flex: 1, padding: "1.5rem", borderRadius: "16px", background: "#F9FAFB", border: "1px solid #D1D5DB", outline: "none", resize: "none", lineHeight: "1.6", marginBottom: "1.5rem" }} />
        <button onClick={handleSaveConditions} style={btnStyle("#000", "#fff")}>💾 설정 저장하기 (DB 반영)</button>
      </div>
    </div>
  );

// ==========================================
  // 📺 화면 4. 시간표 짜기 (🌟 가로 풀사이즈 레이아웃)
  // ==========================================
const renderScheduleCreate = () => {
    const daysInMonth = new Date(scheduleYear, scheduleMonth, 0).getDate();
    const firstDay = new Date(scheduleYear, scheduleMonth - 1, 1).getDay(); // 0(일) ~ 6(토)
    
    const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const dayNames = ["일", "월", "화", "수", "목", "금", "토"];

    return (
      <div style={bentoGridStyle}>
        
        {/* 🌟 상단: 엑셀 형태 수동 기입 매트릭스 */}
        <div style={{ ...baseCardStyle, gridColumn: "span 12", padding: "20px", display: "flex", flexDirection: "column", minHeight: "600px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ fontSize: "1.5rem", margin: 0 }}>📅 {scheduleYear}년 {scheduleMonth}월 근무표</h2>
              <span style={{ fontSize: "0.9rem", color: "#6B7280" }}>(수동 고정 스케줄)</span>
            </div>
            <span style={{ padding: "0.5rem 1rem", background: "#FEF3C7", color: "#D97706", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "bold" }}>
              💡 칸을 눌러 확정된 근무를 직접 선택하세요.
            </span>
          </div>
          
          {isLoading ? (
            <div style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center", color: "#6B7280", fontWeight: "bold", animation: "pulse 1.5s infinite" }}>⏳ 직원이랑 근무타입 불러오는 중...</div>
          ) : (
            <div style={{ flex: 1, overflowX: "auto", overflowY: "auto", border: "1px solid #E5E7EB", borderRadius: "12px", background: "#fff" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "center", whiteSpace: "nowrap" }}>
                
                <thead style={{ position: "sticky", top: 0, zIndex: 3 }}>
                  <tr>
                    <th style={{ position: "sticky", left: 0, background: "#F3F4F6", padding: "12px", borderBottom: "2px solid #D1D5DB", borderRight: "2px solid #D1D5DB", minWidth: "120px", zIndex: 4, fontWeight: "900" }}>
                      직원명 / 날짜
                    </th>
                    {daysArray.map(day => {
                      const dayOfWeek = dayNames[(firstDay + day - 1) % 7];
                      const color = dayOfWeek === "일" ? "#EF4444" : dayOfWeek === "토" ? "#3B82F6" : "#4B5563";
                      return (
                        <th key={day} style={{ background: "#F9FAFB", padding: "8px 5px", minWidth: "45px", borderBottom: "2px solid #D1D5DB", borderRight: "1px solid #E5E7EB", color: color }}>
                          <div style={{ fontSize: "1rem", fontWeight: "bold" }}>{day}</div>
                          <div style={{ fontSize: "0.75rem", fontWeight: "normal" }}>{dayOfWeek}</div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>

                <tbody>
                  {existingEmps.length === 0 ? (
                    <tr><td colSpan={daysInMonth + 1} style={{ padding: "30px", color: "#9CA3AF" }}>등록된 직원이 없습니다. 설정에서 직원을 추가해주세요.</td></tr>
                  ) : (
                    existingEmps.map(emp => (
                      <tr key={emp.id} style={{ transition: "background 0.1s" }} onMouseOver={e => e.currentTarget.style.background = "#F9FAFB"} onMouseOut={e => e.currentTarget.style.background = "transparent"}>
                        
                        <td style={{ position: "sticky", left: 0, background: "#fff", padding: "10px", borderBottom: "1px solid #E5E7EB", borderRight: "2px solid #D1D5DB", zIndex: 2, textAlign: "left" }}>
                          <div style={{ fontWeight: "bold", color: "#111827" }}>{emp.name}</div>
                          <div style={{ fontSize: "0.75rem", color: "#6B7280" }}>{emp.position || "직급없음"}</div>
                        </td>
                        
                        {/* 🌟 Select 박스가 들어간 근무 칸 */}
                        {daysArray.map(day => {
                          const key = `${emp.id}_${day}`;
                          const shift = manualShifts[key]; 
                          
                          return (
                            <td 
                              key={day} 
                              style={{ 
                                borderBottom: "1px solid #E5E7EB", borderRight: "1px solid #E5E7EB",
                                background: shift ? shift.color : "transparent",
                                padding: "0" // Select 박스가 칸을 꽉 채우도록 패딩 제거!
                              }}
                            >
                              <select
                                value={shift ? shift.id : ""}
                                onChange={(e) => handleCellSelect(emp.id, day, e.target.value)}
                                title="근무 선택"
                                style={{
                                  width: "100%", height: "35px", border: "none", background: "transparent",
                                  color: shift ? "#111827" : "#D1D5DB", // 빈칸일 땐 연한 회색 '-'
                                  fontWeight: "900", fontSize: "0.9rem", cursor: "pointer", outline: "none", 
                                  textAlign: "center", textAlignLast: "center", // 글자 가운데 정렬
                                  appearance: "none" // 🌟 못생긴 기본 화살표(▼) 제거 (클릭하면 목록은 정상적으로 뜸!)
                                }}
                              >
                                <option value="" style={{ color: "#9CA3AF", fontWeight: "normal" }}>-</option>
                                {getAvailableShifts().map(s => (
                                  <option key={s.id} value={s.id} style={{ color: s.isSystem ? "#EF4444" : "#111827", fontWeight: "bold" }}>
                                    {/* {s.name.substring(0, 2)}  */}
                                    {s.name}
                                  </option>
                                ))}
                              </select>
                            </td>
                          )
                        })}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 🌟 하단: AI 프롬프트 패널 (유지) */}
        <div style={{ ...baseCardStyle, gridColumn: "span 12", background: "#111827", color: "#fff", display: "flex", flexDirection: "row", gap: "20px", alignItems: "stretch", padding: "20px 30px" }}>
          <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "0.5rem" }}>✨ AI 스케줄링 프롬프트</h2>
            <p style={{ color: "#9CA3AF", marginBottom: "1rem", fontSize: "0.85rem", lineHeight: "1.4" }}>
              이번 달 특별 요청사항을 자연어로 입력해주세요. (위 표에 고정해둔 스케줄은 AI가 절대 변경하지 않습니다.)
            </p>
            <textarea 
              placeholder="예: 홍길동 간호사는 15일 오프 요청. 김철수 의사는 매주 수요일 데이(D) 고정."
              value={schedulePrompt}
              onChange={(e) => setSchedulePrompt(e.target.value)}
              style={{ width: "100%", flex: 1, minHeight: "300px", padding: "1.2rem", borderRadius: "12px", background: "#1F2937", color: "#fff", border: "1px solid #374151", outline: "none", resize: "none", lineHeight: "1.5", fontSize: "0.95rem" }}
            />
          </div>

          <div style={{ width: "220px", display: "flex", flexDirection: "column" }}>
            <button 
              onClick={handleGenerateSchedule} // 🌟 여기에 딸깍! 연결
              disabled={isLoading}             // 🌟 로딩 중일 땐 광클 방지!
              style={{ 
                flex: 1, width: "100%", padding: "1.2rem", 
                background: isLoading ? "#9CA3AF" : "#3B82F6", // 로딩 중엔 회색으로
                color: "#fff", border: "none", borderRadius: "12px", 
                fontSize: "1.1rem", fontWeight: "bold", 
                cursor: isLoading ? "wait" : "pointer", 
                boxShadow: isLoading ? "none" : "0 4px 14px rgba(59, 130, 246, 0.4)", 
                display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: "5px",
                transition: "all 0.2s"
              }}
            >
              <span style={{ fontSize: "1.8rem" }}>{isLoading ? "⏳" : "✨"}</span>
              <span>{isLoading ? "AI 생성 중..." : "AI 근무표 생성 시작"}</span>
            </button>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div style={layoutStyle}>
      <div style={sidebarStyle}>
        <div style={{ fontSize: "1.2rem", fontWeight: "900", textAlign: "center", marginBottom: "2rem", color: "#111827", background: "#F3F4F6", padding: "15px", borderRadius: "20px" }}>⚡ SCHEDULER</div>
        <div style={{ padding: "0 10px", fontSize: "1.2rem", color: "#9CA3AF", marginBottom: "10px", fontWeight: "bold" }}>⚙️ 직원 관리 및 설정</div>
        <MenuItem id="employee-manage" icon="👨‍⚕️" label="직원 관리" isSub={true} />
        <MenuItem id="shift-settings" icon="⏰" label="근무 타입 설정" isSub={true} />
        <MenuItem id="auto-conditions" icon="🤖" label="자동화 고정 조건" isSub={true} />
        <div style={{ padding: "0 10px", fontSize: "1.2rem", color: "#9CA3AF", marginBottom: "10px", marginTop: "20px", fontWeight: "bold" }}>📅 스케줄링 작업</div>
        <MenuItem id="schedule-create" icon="✨" label="시간표 짜기" />
        <MenuItem id="schedule-view" icon="📊" label="근무표 월별 조회" />
      </div>

      <div style={contentWrapperStyle}>
        <div style={{ background: "#FFFFFF", borderRadius: "30px", padding: "20px 40px", display: "flex", alignItems: "center", boxShadow: "0 10px 40px rgba(0,0,0,0.03)", fontSize: "1.2rem", fontWeight: "bold", color: "#1f2937", flexShrink: 0 }}>
          {activeMenu === "employee-manage" ? "👨‍⚕️ 직원 관리" : activeMenu === "shift-settings" ? "⏰ 근무 타입 설정" : activeMenu === "auto-conditions" ? "🤖 자동화 고정 조건 설정" : "✨ 시간표 짜기"}
        </div>
        {activeMenu === "employee-manage" && renderEmployeeManage()}
        {activeMenu === "shift-settings" && renderShiftSettings()}
        {activeMenu === "auto-conditions" && renderAutoConditions()}
        {activeMenu === "schedule-create" && renderScheduleCreate()}
      </div>
    </div>
  );
};

export default UserDashboard;