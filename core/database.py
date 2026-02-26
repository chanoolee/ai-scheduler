# app/core/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# PostgreSQL 연결 정보 설정
# 아래에서 [아이디], [비밀번호], [DB이름]을 실제 환경에 맞게 입력하세요.
SQLALCHEMY_DATABASE_URL = "postgresql://admin:1234@localhost:5432/scheduler_db"

# [디버깅] DB 연결 주소 출력 (필요 시 주석 해제해서 사용)
# print("--------------")
# print(f\"DB 연결 주소: {SQLALCHEMY_DATABASE_URL}\")
# print("--------------")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL
    # PostgreSQL에선 connect_args 필요 없음
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()