# app/services/request_service.py

from sqlalchemy.orm import Session
from app.models.tables import WorkRequest
from app.schemas.request_schema import RequestCreate

# 1. 신청서 생성 (INSERT)
def create_request(db: Session, request: RequestCreate):
    db_request = WorkRequest(
        user_id=request.user_id,
        date=request.date,
        type=request.type,
        # status는 DB 기본값(대기중)으로 들어갑니다.
    )
    db.add(db_request)
    db.commit()
    db.refresh(db_request)
    return db_request

# 2. 모든 신청 내역 조회 (SELECT)
def get_requests(db: Session, skip: int = 0, limit: int = 100):
    return db.query(WorkRequest).offset(skip).limit(limit).all()