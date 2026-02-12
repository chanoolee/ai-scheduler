from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date
import calendar

from app.core.database import get_db  # pyright: ignore[reportMissingImports]
from app.models.tables import WorkSchedule  # pyright: ignore[reportMissingImports]
from pydantic import BaseModel

router = APIRouter(
    prefix="/api/schedule",
    tags=["schedule"],
)


class WorkerInput(BaseModel):
    name: str
    position: str


class GenerateRequest(BaseModel):
    workers: List[WorkerInput]


@router.post("/generate-schedule/", response_model=List[dict])
def generate_work_schedule(
    payload: GenerateRequest,
    year: int = Query(..., description="Year for schedule"),
    month: int = Query(..., ge=1, le=12, description="Month for schedule (1-12)"),
    db: Session = Depends(get_db),
):
    """
    입력받은 근무자 목록(이름, 직급)을 이용해
    해당 연/월의 날짜별로 근무자를 골고루(라운드 로빈) 배치합니다.

    - 현재는 DB에 스케줄을 저장하지 않고, 생성된 스케줄 목록만 반환합니다.
    """
    workers = [w for w in payload.workers if w.name.strip()]
    if not workers:
        return []

    # 해당 월의 마지막 일자 계산
    _, last_day = calendar.monthrange(year, month)

    results: List[dict] = []
    worker_count = len(workers)

    for idx, day in enumerate(range(1, last_day + 1)):
        worker = workers[idx % worker_count]
        work_date = date(year, month, day)

        results.append(
            {
                "user_id": idx % worker_count + 1,  # 화면 표시용 더미 ID
                "name": worker.name,
                "position": worker.position,
                "date": work_date.isoformat(),
                "shift_type": "Day",
            }
        )

    return results


class ScheduleResponse(BaseModel):
    user_id: int
    date: str  # ISO8601 string
    shift_type: str

@router.get("/", response_model=List[ScheduleResponse])
def read_schedules(
    year: int = Query(..., description="Year for schedule"),
    month: int = Query(..., ge=1, le=12, description="Month for schedule (1-12)"),
    db: Session = Depends(get_db)
):
    """
    해당 연/월의 모든 WorkSchedule을 조회하여 반환합니다.
    """
    schedules = (
        db.query(WorkSchedule)
        .filter(
            WorkSchedule.date >= f"{year}-{month:02d}-01",
            WorkSchedule.date < (f"{year}-{month + 1 if month < 12 else 1:02d}-01" if month < 12 else f"{year + 1}-01-01")
        )
        .all()
    )
    return [
        ScheduleResponse(
            user_id=s.user_id,
            date=s.date.isoformat(),
            shift_type=s.shift_type,
        )
        for s in schedules
    ]