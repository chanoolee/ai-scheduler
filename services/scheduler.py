# app/services/scheduler.py

from ortools.sat.python import cp_model
from sqlalchemy.orm import Session
from datetime import date
import calendar
from app.models.tables import User, WorkRequest, WorkSchedule, RequestType  # pyright: ignore[reportMissingImports]

def generate_schedule(db: Session, year: int, month: int):
    # 1. 기초 데이터 준비 (달력 정보)
    _, last_day = calendar.monthrange(year, month)
    days = range(1, last_day + 1)

    # 2. DB 데이터 조회
    users = db.query(User).all()
    
    # 해당 월의 신청 내역만 가져오기
    start_date = date(year, month, 1)
    end_date = date(year, month, last_day)
    requests = db.query(WorkRequest).filter(
        WorkRequest.date >= start_date,
        WorkRequest.date <= end_date
    ).all()

    # 3. 모델 생성 (OR-Tools)
    model = cp_model.CpModel()
    shifts = {} # 변수 저장소

    # 4. 변수 생성 (모든 유저 x 모든 날짜)
    # shifts[(user_id, day)] = 1(근무) or 0(휴무)
    for user in users:
        for day in days:
            shifts[(user.id, day)] = model.NewBoolVar(f'shift_u{user.id}_d{day}')

    # 5. 제약조건 추가
    
    # (1) 휴무 신청(LEAVE) 처리: 해당 날짜 근무를 0으로 고정
    for req in requests:
        if req.type == RequestType.LEAVE:
            d = req.date.day
            if (req.user_id, d) in shifts:
                model.Add(shifts[(req.user_id, d)] == 0)

    # (2) 최소 근무 인원: 매일 최소 1명 이상 근무
    for day in days:
        daily_workers = [shifts[(user.id, day)] for user in users]
        model.Add(sum(daily_workers) >= 1)

    # 6. 문제 해결 (Solver)
    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    results = []
    
    # 7. 결과 저장 (해를 찾았을 경우)
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        # 기존 스케줄 삭제 (덮어쓰기)
        db.query(WorkSchedule).filter(
            WorkSchedule.date >= start_date,
            WorkSchedule.date <= end_date
        ).delete()
        
        # 새 스케줄 저장
        for day in days:
            for user in users:
                if solver.Value(shifts[(user.id, day)]) == 1:
                    new_schedule = WorkSchedule(
                        user_id=user.id,
                        date=date(year, month, day),
                        shift_type="Day"
                    )
                    db.add(new_schedule)
                    results.append(new_schedule)
        
        db.commit() # 커밋 필수!
    
    return results