# app/core/database.py

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# 1. 현재 파일(database.py)의 위치: .../app/core/database.py
CURRENT_FILE_PATH = os.path.abspath(__file__)

# 2. 프로젝트 루트 찾기
# dirname 1번 -> .../app/core
# dirname 2번 -> .../app  (여기가 딱 좋습니다!)
BASE_DIR = os.path.dirname(os.path.dirname(CURRENT_FILE_PATH))

# 3. DB 파일 경로 만들기 (.../app/workflow.db)
DB_NAME = "workflow.db"
DB_PATH = os.path.join(BASE_DIR, DB_NAME)

# 윈도우 경로(\) 이슈 해결
DB_PATH = DB_PATH.replace("\\", "/")

# 4. 최종 연결 URL
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

# [디버깅] 이번엔 경로가 C:/app/workflow.db 처럼 나와야 합니다.
print(f"--------------")
print(f"✅ DB 저장 위치: {SQLALCHEMY_DATABASE_URL}")
print(f"--------------")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()