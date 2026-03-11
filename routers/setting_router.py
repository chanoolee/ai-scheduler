# app/routers/setting_router.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import json

from core.database import get_db
from models.tables import Employee, ShiftType, ScheduleCondition
from schemas.setting_schema import EmployeeCreate, ShiftTypeCreate, ScheduleConditionCreate

router = APIRouter(prefix="/settings", tags=["Settings"])

# =======================================
# 1. 👨‍⚕️ 직원 관리 API (CRUD)
# =======================================
@router.get("/employees/{userid}")
def get_employees(userid: str, db: Session = Depends(get_db)):
    return db.query(Employee).filter(Employee.manager_id == userid).all()

@router.post("/employees/{userid}")
def add_employees(userid: str, data: List[EmployeeCreate], db: Session = Depends(get_db)):
    # 🚨 검증 1: 새로 추가하는 배열 내에 중복 이름이 있는지 체크
    names = [emp.name for emp in data]
    if len(names) != len(set(names)):
        raise HTTPException(status_code=400, detail="추가하려는 목록 안에 중복된 이름이 있습니다!")

    # 🚨 검증 2: 기존 DB에 이미 등록된 이름인지 체크
    existing_names = [e.name for e in db.query(Employee).filter(Employee.manager_id == userid).all()]
    for name in names:
        if name in existing_names:
            raise HTTPException(status_code=400, detail=f"'{name}'(은)는 이미 등록된 직원입니다!")

    new_emps = [Employee(manager_id=userid, name=emp.name, position=emp.position, created_by_id=userid) for emp in data]
    db.add_all(new_emps)
    db.commit()
    return {"message": f"{len(new_emps)}명의 직원이 추가되었습니다!"}

@router.put("/employees/{userid}/{emp_id}")
def update_employee(userid: str, emp_id: int, data: EmployeeCreate, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == emp_id, Employee.manager_id == userid).first()
    if not emp: raise HTTPException(status_code=404, detail="직원을 찾을 수 없습니다.")

    # 이름이 바뀌었는데, 바뀐 이름이 다른 직원 이름과 겹치는지 체크
    if emp.name != data.name:
        if db.query(Employee).filter(Employee.manager_id == userid, Employee.name == data.name).first():
            raise HTTPException(status_code=400, detail="이미 존재하는 직원 이름으로 수정할 수 없습니다!")

    emp.name = data.name
    emp.position = data.position
    emp.updated_by_id = userid
    db.commit()
    return {"message": "직원 정보가 수정되었습니다!"}

@router.delete("/employees/{userid}/{emp_id}")
def delete_employee(userid: str, emp_id: int, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.id == emp_id, Employee.manager_id == userid).first()
    if not emp: raise HTTPException(status_code=404, detail="직원을 찾을 수 없습니다.")
    db.delete(emp)
    db.commit()
    return {"message": "삭제되었습니다!"}

# =======================================
# 2. ⏰ 근무 타입 API (CRUD)
# =======================================
@router.get("/shift-types/{userid}")
def get_shift_types(userid: str, db: Session = Depends(get_db)):
    shifts = db.query(ShiftType).filter(ShiftType.owner_id == userid).all()
    return [{
        "id": s.id, "name": s.name, 
        "start_time": s.start_time.strftime("%H:%M") if s.start_time else "00:00",
        "end_time": s.end_time.strftime("%H:%M") if s.end_time else "00:00",
        "color": s.color
    } for s in shifts]

@router.post("/shift-types/{userid}")
def add_shift_types(userid: str, data: List[ShiftTypeCreate], db: Session = Depends(get_db)):
    # 🚨 검증: 배열 내 중복 체크
    names = [s.name for s in data]
    if len(names) != len(set(names)):
        raise HTTPException(status_code=400, detail="추가 목록에 중복된 타입명이 있습니다!")
    times = [f"{s.start_time}-{s.end_time}" for s in data]
    if len(times) != len(set(times)):
        raise HTTPException(status_code=400, detail="추가 목록에 시간이 겹치는 타입이 있습니다!")

    # 🚨 검증: DB 기존 데이터와 중복 체크
    existing = db.query(ShiftType).filter(ShiftType.owner_id == userid).all()
    exist_names = [e.name for e in existing]
    exist_times = [f"{e.start_time.strftime('%H:%M:%S')}-{e.end_time.strftime('%H:%M:%S')}" for e in existing if e.start_time and e.end_time]
    
    for s in data:
        if s.name in exist_names: raise HTTPException(status_code=400, detail=f"'{s.name}'(은)는 이미 등록된 타입입니다!")
        if f"{s.start_time}:00-{s.end_time}:00" in exist_times: raise HTTPException(status_code=400, detail=f"이미 동일한 시간대가 존재합니다! ({s.start_time}~{s.end_time})")

    new_shifts = [ShiftType(owner_id=userid, name=s.name, start_time=s.start_time, end_time=s.end_time, color=s.color, created_by_id=userid) for s in data]
    db.add_all(new_shifts)
    db.commit()
    return {"message": f"{len(new_shifts)}개의 근무 타입이 추가되었습니다!"}

@router.put("/shift-types/{userid}/{shift_id}")
def update_shift_type(userid: str, shift_id: int, data: ShiftTypeCreate, db: Session = Depends(get_db)):
    shift = db.query(ShiftType).filter(ShiftType.id == shift_id, ShiftType.owner_id == userid).first()
    if not shift: raise HTTPException(status_code=404, detail="근무 타입을 찾을 수 없습니다.")
    
    shift.name = data.name
    shift.start_time = data.start_time
    shift.end_time = data.end_time
    shift.color = data.color
    shift.updated_by_id = userid
    db.commit()
    return {"message": "근무 타입이 수정되었습니다!"}

@router.delete("/shift-types/{userid}/{shift_id}")
def delete_shift_type(userid: str, shift_id: int, db: Session = Depends(get_db)):
    shift = db.query(ShiftType).filter(ShiftType.id == shift_id, ShiftType.owner_id == userid).first()
    if not shift: raise HTTPException(status_code=404, detail="근무 타입을 찾을 수 없습니다.")
    db.delete(shift)
    db.commit()
    return {"message": "삭제되었습니다!"}

# =======================================
# 3. 🤖 고정 조건 API (조회 GET API 추가!)
# =======================================
@router.get("/conditions/{userid}")
def get_schedule_condition(userid: str, db: Session = Depends(get_db)):
    cond = db.query(ScheduleCondition).filter(ScheduleCondition.userid == userid).first()
    
    # DB에 저장된 조건이 있으면 JSON을 풀어서 반환!
    if cond and cond.fixed_conditions:
        return json.loads(cond.fixed_conditions)
    
    # 아직 저장된 게 없으면 기본값 세팅해서 던져주기
    return {
        "max_work_hours": 160,
        "op_start_time": "09:00",
        "op_end_time": "18:00",
        "prompt_text": ""
    }

# =======================================
# 4. 🤖 고정 조건 API (단일 항목 덮어쓰기 유지)
# =======================================
@router.post("/conditions/{userid}")
def save_schedule_condition(userid: str, data: ScheduleConditionCreate, db: Session = Depends(get_db)):
    condition_data = {
        "max_work_hours": data.max_work_hours,
        "op_start_time": data.op_start_time.strftime("%H:%M"),
        "op_end_time": data.op_end_time.strftime("%H:%M"),
        "prompt_text": data.prompt_text
    }
    json_string = json.dumps(condition_data, ensure_ascii=False)
    
    existing_cond = db.query(ScheduleCondition).filter(ScheduleCondition.userid == userid).first()
    if existing_cond:
        existing_cond.fixed_conditions = json_string
        existing_cond.updated_by_id = userid
    else:
        new_cond = ScheduleCondition(userid=userid, fixed_conditions=json_string, use_at=True, created_by_id=userid)
        db.add(new_cond)
    db.commit()
    return {"message": "고정 조건이 저장되었습니다!"}