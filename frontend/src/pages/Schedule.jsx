import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Schedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState(localStorage.getItem("username") || "");
  const [workers, setWorkers] = useState([{ name: "", position: "" }]);

  useEffect(() => {
    if (!username) return;
    setLoading(true);
    axios
      .get(`/api/schedule/?year=${year}&month=${month}`)
      .then((res) => {
        setSchedules(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [year, month, username]);

  const handleGenerate = () => {
    const validWorkers = workers.filter((w) => w.name.trim());
    if (validWorkers.length === 0) {
      alert("최소 한 명 이상의 근무자를 입력해주세요.");
      return;
    }

    setLoading(true);
    axios
      .post(
        `/api/schedule/generate-schedule/?year=${year}&month=${month}`,
        { workers: validWorkers }
      )
      .then((res) => {
        setSchedules(res.data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleWorkerChange = (index, field, value) => {
    setWorkers((prev) =>
      prev.map((w, i) => (i === index ? { ...w, [field]: value } : w))
    );
  };

  const addWorkerRow = () => {
    setWorkers((prev) => [...prev, { name: "", position: "" }]);
  };

  const removeWorkerRow = (index) => {
    setWorkers((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMonthChange = (e) => {
    setMonth(Number(e.target.value));
  };

  const handleYearChange = (e) => {
    setYear(Number(e.target.value));
  };

  if (!username) {
    return (
      <div
        style={{
          padding: "3rem 2rem",
          textAlign: "center",
          background: "rgba(255,255,255,0.9)",
          borderRadius: 18,
          boxShadow:
            "0 22px 45px rgba(15,23,42,0.10), 0 8px 18px rgba(15,23,42,0.06)",
          border: "1px solid rgba(148,163,184,0.3)",
        }}
      >
        <h2 style={{ marginBottom: 12, color: "#0f172a" }}>로그인이 필요합니다.</h2>
        <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
          먼저 로그인 화면에서 사용자 이름을 입력해 주세요.
        </p>
      </div>
    );
  }

  // 날짜별 스케줄을 빠르게 찾기 위한 맵
  const schedulesByDate = Array.isArray(schedules)
    ? schedules.reduce((acc, s) => {
        if (!s.date) return acc;
        if (!acc[s.date]) acc[s.date] = [];
        acc[s.date].push(s);
        return acc;
      }, {})
    : {};

  // 달력용 주(week) 단위 데이터 생성
  const buildCalendar = () => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0); // 이 달의 마지막 날
    const startWeekday = firstDay.getDay(); // 0(일) ~ 6(토)
    const totalDays = lastDay.getDate();

    const weeks = [];
    let currentDay = 1 - startWeekday; // 첫 주에서 이전달 빈 칸 처리

    while (currentDay <= totalDays) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        if (currentDay < 1 || currentDay > totalDays) {
          week.push(null);
        } else {
          const dateStr = new Date(year, month - 1, currentDay)
            .toISOString()
            .slice(0, 10); // YYYY-MM-DD
          week.push({
            day: currentDay,
            dateStr,
          });
        }
        currentDay++;
      }
      weeks.push(week);
    }
    return weeks;
  };

  const weeks = buildCalendar();

  return (
    <div
      style={{
        padding: "2.25rem 2rem",
        borderRadius: 20,
        background: "rgba(255,255,255,0.96)",
        boxShadow:
          "0 22px 45px rgba(15,23,42,0.12), 0 8px 18px rgba(15,23,42,0.08)",
        border: "1px solid rgba(148,163,184,0.28)",
      }}
    >
      <div
        style={{
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 12,
          justifyContent: "space-between",
        }}
      >
        <h2 style={{ margin: 0, fontSize: "1.5rem", color: "#0f172a" }}>
          근무 스케줄
        </h2>
      </div>
      <div style={{ marginBottom: 16, display: "flex", gap: 16 }}>
        <input
          type="number"
          min="2000"
          max="2100"
          value={year}
          onChange={handleYearChange}
          style={{
            width: 100,
            padding: "0.5rem 0.65rem",
            borderRadius: 10,
            border: "1px solid #d1d5db",
            fontSize: 14,
          }}
        />
        <select
          value={month}
          onChange={handleMonthChange}
          style={{
            padding: "0.5rem 0.75rem",
            borderRadius: 10,
            border: "1px solid #d1d5db",
            fontSize: 14,
          }}
        >
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}월
            </option>
          ))}
        </select>
        <button
          style={{
            marginLeft: "auto",
            background: "linear-gradient(135deg, #2563eb, #4f46e5)",
            color: "#fff",
            border: "none",
            borderRadius: 999,
            padding: "0.55rem 1.3rem",
            fontWeight: 600,
            fontSize: 14,
            cursor: "pointer",
            boxShadow: "0 12px 30px rgba(37,99,235,0.3)",
          }}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "생성중..." : "자동 생성"}
        </button>
      </div>

      {/* 근무자 인적사항 입력 영역 */}
      <div
        style={{
          marginBottom: 24,
          padding: "1rem 1.25rem",
          background: "#f9fafb",
          borderRadius: 14,
          border: "1px solid #e5e7eb",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
          <span style={{ fontWeight: 600 }}>근무자 인적사항</span>
          <button
            type="button"
            onClick={addWorkerRow}
            style={{
              padding: "0.25rem 0.75rem",
              borderRadius: 6,
              border: "1px solid #d1d5db",
              background: "#fff",
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            + 근무자 추가
          </button>
        </div>
        {workers.map((worker, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <input
              type="text"
              placeholder="이름"
              value={worker.name}
              onChange={(e) => handleWorkerChange(index, "name", e.target.value)}
              style={{
                flex: 1,
                padding: "0.5rem 0.75rem",
                borderRadius: 6,
                border: "1px solid #d1d5db",
              }}
            />
            <input
              type="text"
              placeholder="직급"
              value={worker.position}
              onChange={(e) => handleWorkerChange(index, "position", e.target.value)}
              style={{
                flex: 1,
                padding: "0.5rem 0.75rem",
                borderRadius: 6,
                border: "1px solid #d1d5db",
              }}
            />
            {workers.length > 1 && (
              <button
                type="button"
                onClick={() => removeWorkerRow(index)}
                style={{
                  padding: "0.4rem 0.6rem",
                  borderRadius: 6,
                  border: "1px solid #fecaca",
                  background: "#fee2e2",
                  color: "#b91c1c",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                삭제
              </button>
            )}
          </div>
        ))}
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.03)", color: "#000" }}>
        <thead>
          <tr style={{ background: "#f6f8fa" }}>
            {["일", "월", "화", "수", "목", "금", "토"].map((d) => (
              <th key={d} style={{ padding: 8, border: "1px solid #eee", textAlign: "center" }}>
                {d}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={7} style={{ padding: 24, textAlign: "center" }}>불러오는 중...</td>
            </tr>
          ) : !Array.isArray(schedules) ? (
            <tr>
              <td colSpan={7} style={{ padding: 24, textAlign: "center" }}>데이터 형식 오류: 스케줄을 불러올 수 없습니다.</td>
            </tr>
          ) : weeks.length === 0 ? (
            <tr>
              <td colSpan={7} style={{ padding: 24, textAlign: "center" }}>스케줄이 없습니다.</td>
            </tr>
          ) : (
            weeks.map((week, wi) => (
              <tr key={wi}>
                {week.map((day, di) => {
                  if (!day) {
                    return (
                      <td
                        key={di}
                        style={{
                          width: `${100 / 7}%`,
                          height: 100,
                          border: "1px solid #f0f0f0",
                          background: "#fafafa",
                        }}
                      />
                    );
                  }

                  const daySchedules = schedulesByDate[day.dateStr] || [];

                  return (
                    <td
                      key={di}
                      style={{
                        width: `${100 / 7}%`,
                        height: 120,
                        verticalAlign: "top",
                        border: "1px solid #f0f0f0",
                        padding: 6,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                        {day.day}
                      </div>
                      <div style={{ fontSize: 11, lineHeight: 1.3 }}>
                        {daySchedules.length === 0 ? (
                          <span style={{ color: "#9ca3af" }}>근무 없음</span>
                        ) : (
                          daySchedules.map((s, si) => (
                            <div
                              key={si}
                              style={{
                                marginBottom: 2,
                                padding: "2px 4px",
                                borderRadius: 4,
                                background: "#eef2ff",
                              }}
                            >
                              <div style={{ fontWeight: 500 }}>
                                {s.name || s.full_name || `ID ${s.user_id}`}
                              </div>
                              <div style={{ fontSize: 10 }}>
                                {s.position || s.role || ""} {s.shift_type && `(${s.shift_type})`}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Schedule;