# app/routers/setting_router.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json

# 대장 프로젝트 경로에 맞게 임포트!
from core.database import get_db
from models.tables import Employee, ShiftType, ScheduleCondition
from schemas.setting_schema import EmployeeCreate, ShiftTypeCreate, ScheduleConditionCreate

router = APIRouter(prefix="/settings", tags=["Settings"])

# =======================================
# 1. 👨‍⚕️ 직원 등록 API
# =======================================
@router.post("/employees/{userid}")
def create_employees(userid: str, data: List[EmployeeCreate], db: Session = Depends(get_db)):
    # 🌟 프론트에서 넘어온 배열(data)을 한 번에 Employee 객체 리스트로 만들기
    new_emps = [
        Employee(
            manager_id=userid,
            name=emp.name,
            position=emp.position,
            created_by_id=userid
        ) for emp in data
    ]
    
    db.add_all(new_emps) # 🌟 한 방에 DB에 꽂아넣기! (성능 압도적)
    db.commit()
    return {"message": f"총 {len(new_emps)}명의 직원이 등록되었습니다!"}

# =======================================
# 2. ⏰ 근무 타입 등록 API
# =======================================
@router.post("/shift-types/{userid}")
def create_shift_types(userid: str, data: List[ShiftTypeCreate], db: Session = Depends(get_db)):
    new_shifts = [
        ShiftType(
            owner_id=userid,
            name=shift.name,
            start_time=shift.start_time,
            end_time=shift.end_time,
            color=shift.color,
            created_by_id=userid
        ) for shift in data
    ]
    
    db.add_all(new_shifts) # 🌟 한 방에 저장!
    db.commit()
    return {"message": f"총 {len(new_shifts)}개의 근무 타입이 추가되었습니다!"}

# =======================================
# 3. 🤖 고정 조건 (AI 프롬프트 포함) 저장 API
# =======================================
@router.post("/conditions/{userid}")
def save_schedule_condition(userid: str, data: ScheduleConditionCreate, db: Session = Depends(get_db)):
    # 🌟 여러 데이터를 하나의 JSON 딕셔너리로 묶기!
    condition_data = {
        "max_work_hours": data.max_work_hours,
        "op_start_time": data.op_start_time.strftime("%H:%M"),
        "op_end_time": data.op_end_time.strftime("%H:%M"),
        "prompt_text": data.prompt_text
    }
    
    # 🌟 한글 깨짐 방지 & JSON 문자열로 변환 (ensure_ascii=False 필수!)
    json_string = json.dumps(condition_data, ensure_ascii=False)
    
    # DB에 이미 해당 병원(userid)의 조건이 있는지 확인 (있으면 덮어쓰기, 없으면 새로 생성)
    existing_cond = db.query(ScheduleCondition).filter(ScheduleCondition.userid == userid).first()
    
    if existing_cond:
        existing_cond.fixed_conditions = json_string
        existing_cond.updated_by_id = userid
        db.commit()
        return {"message": "기존 고정 조건이 성공적으로 업데이트되었습니다!"}
    else:
        new_cond = ScheduleCondition(
            userid=userid,
            fixed_conditions=json_string,
            use_at=True,
            created_by_id=userid
        )
        db.add(new_cond)
        db.commit()
        return {"message": "새로운 고정 조건이 성공적으로 저장되었습니다!"}