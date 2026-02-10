# app/routers/user_router.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.user_schema import UserCreate, UserResponse
from app.services import user_service

# URL Prefix 설정 (/users)
router = APIRouter(
    prefix="/users",
    tags=["users"], # Swagger UI에서 그룹핑할 이름
)

# 1. 사용자 등록 API (POST /users)
@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    try:
        return user_service.create_user(db=db, user=user)
    except IntegrityError: # DB 무결성 위반 에러 발생 시 (중복 ID 등)
        db.rollback()      # 트랜잭션 롤백 (필수!)
        raise HTTPException(status_code=400, detail="이미 존재하는 사용자 이름입니다.")

# 2. 사용자 목록 조회 API (GET /users)
@router.get("/", response_model=List[UserResponse])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = user_service.get_users(db, skip=skip, limit=limit)
    return users