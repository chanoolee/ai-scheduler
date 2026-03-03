# app/core/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

from dotenv import load_dotenv

# 🚨 1. 현재 파일(database.py) 위치를 기준으로 .env 파일의 절대 경로 찾기!
# (database.py가 core 폴더 안에 있고, .env가 그 바깥 최상단에 있다고 가정)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(BASE_DIR, ".env")

# 🚨 2. 찾아낸 경로를 억지로 먹여주기!
load_dotenv(dotenv_path=env_path)

# PostgreSQL 연결 정보 설정
SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL")
ENCRYPTION_KEY = os.environ.get("ENCRYPTION_KEY")

# [디버깅] 확실하게 찾았는지 터미널에 찍어보기!
print("--------------")
print(f"🕵️‍♂️ 파이썬이 뒤진 .env 위치: {env_path}")
print(f"DB 연결 주소: {SQLALCHEMY_DATABASE_URL}")
print("--------------")

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