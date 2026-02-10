# app/services/user_service.py

from sqlalchemy.orm import Session
from app.models.tables import User
from app.schemas.user_schema import UserCreate

# 1. 사용자 생성 (INSERT)
def create_user(db: Session, user: UserCreate):
    # Entity 객체 생성 (Builder 패턴 없이 생성자만으로 끝!)
    db_user = User(
        username=user.username,
        password=user.password, # 실무에선 암호화 필수지만, 지금은 평문으로
        full_name=user.full_name
    )
    db.add(db_user)      # persist
    db.commit()          # commit
    db.refresh(db_user)  # DB에서 생성된 ID값 등을 다시 가져옴
    return db_user

# 2. 사용자 목록 조회 (SELECT ALL)
def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(User).offset(skip).limit(limit).all()