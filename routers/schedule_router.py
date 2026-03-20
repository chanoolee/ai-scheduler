# app/routers/schedule_router.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import os
import json
import calendar
import google.generativeai as genai # 🌟 구글 AI 라이브러리 임포트!

from dotenv import load_dotenv
from core.database import get_db
from models.tables import Employee, ShiftType, ScheduleCondition
from schemas.schedule_schema import ScheduleGenerateRequest

# ==========================================
# 🔑 구글 Gemini API 키 세팅 (대장 키로 변경!)
# ==========================================

# 🚨 1. 현재 파일(database.py) 위치를 기준으로 .env 파일의 절대 경로 찾기!
# (database.py가 core 폴더 안에 있고, .env가 그 바깥 최상단에 있다)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(BASE_DIR, ".env")

# 🚨 2. 찾아낸 경로를 억지로 먹여주기!
load_dotenv(dotenv_path=env_path)

GENAI_API_KEY = os.environ.get("GENAI_API_KEY")

genai.configure(api_key=GENAI_API_KEY)

router = APIRouter(prefix="/schedule", tags=["Schedule"])

# ==========================================
# 🕵️‍♂️ [핵심] 스케줄 검증기 (Validator) 함수
# ==========================================
def validate_schedule(schedule_data, employees, shift_types, request_manual_shifts, days_in_month):
    errors = []
    
    # 1. 모든 칸이 채워졌는지 검사
    for emp in employees:
        for day in range(1, days_in_month + 1):
            key = f"{emp.id}_{day}"
            if key not in schedule_data:
                errors.append(f"[{emp.name}] 직원의 {day}일 근무가 누락되었습니다.")

    # 2. 수동 고정 스케줄을 AI가 마음대로 바꿨는지 검사! (LLM의 흔한 실수 방지)
    for key, fixed_shift in request_manual_shifts.items():
        if str(schedule_data.get(key, {}).get('id')) != str(fixed_shift.get('id')):
            errors.append(f"수동으로 고정된 '{key}'의 스케줄을 AI가 임의로 변경했습니다.")

    # 3. 추가적인 하드 룰(연속 나이트 금지 등)은 나중에 여기에 파이썬 로직으로 추가하면 됨!
    # 예: if 나이트가 3번 연속이면 -> errors.append("홍길동 연속 나이트 초과!")

    return errors

# ==========================================
# ✨ AI 스케줄 생성 API (Retry Loop 적용)
# ==========================================
@router.post("/generate/{userid}")
async def generate_ai_schedule(userid: str, request: ScheduleGenerateRequest, db: Session = Depends(get_db)):
    
    # 1. DB에서 재료 긁어오기
    employees = db.query(Employee).filter(Employee.manager_id == userid).all()
    shift_types = db.query(ShiftType).filter(ShiftType.owner_id == userid).all()
    condition = db.query(ScheduleCondition).filter(ScheduleCondition.userid == userid).first()

    if not employees or not shift_types:
        raise HTTPException(status_code=400, detail="직원 정보나 근무 타입이 부족합니다 대장!")

    emp_info = [{"id": e.id, "name": e.name, "position": e.position} for e in employees]
    shift_info = [{"id": s.id, "name": s.name, "time": f"{s.start_time}~{s.end_time}"} for s in shift_types]
    fixed_rules = json.loads(condition.fixed_conditions) if condition and condition.fixed_conditions else {}
    days_in_month = calendar.monthrange(request.year, request.month)[1]

    # 🌟 Gemini 모델 세팅 (JSON 형식으로만 대답하도록 강제!)
    model = genai.GenerativeModel(
        'gemini-2.5-flash', # 혹은 'gemini-2.5-pro' 사용
        generation_config={"response_mime_type": "application/json"}
    )

    max_retries = 3     # AI가 헛소리하면 최대 3번까지 다시 시키기!
    current_attempt = 1
    last_errors = []

    while current_attempt <= max_retries:
        # 🌟 에러가 있었다면 프롬프트에 추가해서 AI 혼내기!
        error_msg = f"\n\n[🚨 이전 시도에서 발생한 치명적 오류 (반드시 수정할 것)]\n{', '.join(last_errors)}" if last_errors else ""

        system_prompt = f"""
당신은 완벽한 병원 스케줄러 AI입니다.
{request.year}년 {request.month}월의 직원 근무표를 아래 형식에 맞게 JSON으로만 출력하세요.

[기본 정보]
- 총 일수: {days_in_month}일
- 직원 목록: {json.dumps(emp_info, ensure_ascii=False)}
- 사용 가능한 근무 타입: {json.dumps(shift_info, ensure_ascii=False)}

[절대 지켜야 할 운영 기준 (DB 설정)]
- 인당 월 최대 근무(만근) 시간: {fixed_rules.get('max_work_hours', '제한없음')}시간
- 병원 운영 시간: {fixed_rules.get('op_start_time', '지정안됨')} ~ {fixed_rules.get('op_end_time', '지정안됨')}

[절대 지켜야 할 규칙]
- {fixed_rules.get('prompt_text', '특별한 규칙 없음')}
- 수동 확정 스케줄: {json.dumps(request.manual_shifts, ensure_ascii=False)} (이건 절대 바꾸지 마세요!)
- 이번 달 추가 요청사항: {request.ai_prompt}

[출력 형식 예시]
{{
  "직원ID_날짜": {{"id": 근무타입ID, "name": "타입명", "color": "색상코드"}},
  "1_1": {{"id": 2, "name": "Day", "color": "#DBEAFE"}},
  ... (모든 직원의 1일~말일까지의 데이터가 빠짐없이 있어야 함)
}}{error_msg}
        """

        try:
            print(f"--- 🤖 AI 스케줄 생성 시도 중 ({current_attempt}/{max_retries})... ---")
            
            # AI에게 프롬프트 전송!
            response = model.generate_content(system_prompt)
            schedule_result = json.loads(response.text)

            # 🌟 파이썬 검증기(Validator) 통과 확인
            validation_errors = validate_schedule(schedule_result, employees, shift_types, request.manual_shifts, days_in_month)

            if not validation_errors:
                print("--- ✅ AI가 완벽하게 통과했습니다! ---")
                return {"message": f"✨ AI가 {current_attempt}번의 시도 끝에 조건에 맞는 근무표를 완성했습니다!", "schedule": schedule_result}
            else:
                last_errors = validation_errors
                print(f"--- ❌ {current_attempt}차 시도 실패. 사유: {validation_errors[:2]}... ---")
                current_attempt += 1

        except Exception as e:
            print(f"--- ❌ {current_attempt}차 생성 중 에러 발생: {e} ---")
            last_errors = [f"JSON 파싱 또는 시스템 에러: {str(e)}"]
            current_attempt += 1

    # 3번 다 실패했을 때
    raise HTTPException(status_code=500, detail="AI가 모든 조건을 만족하는 스케줄을 짜는 데 실패했습니다. 조건을 조금 완화하거나 수동으로 빈칸을 채워주세요!")