# app/main.py

from fastapi import FastAPI
from app.core.database import engine, Base
from app.models import tables  # <-- 우리가 만든 모델 임포트 (필수!)

# 라우터 임포트
from app.routers import user_router
from app.routers import user_router, request_router

# 1. DB 테이블 자동 생성 (DDL Auto)
# models에 정의된 클래스들을 보고 DB에 테이블을 찍어냅니다.
Base.metadata.create_all(bind=engine)

# 1. 앱 생성 (Spring의 @SpringBootApplication)
app = FastAPI(
    title="WorkFlow AI Scheduler",
    description="AI 기반 근무 스케줄링 자동화 서비스",
    version="0.1.0"
)

# 앱에 라우터 등록
app.include_router(user_router.router)
app.include_router(user_router.router)
app.include_router(request_router.router)

# 2. 기본 경로 (Spring의 @RestController + @GetMapping)
@app.get("/")
def read_root():
    # Dict를 리턴하면 자동으로 JSON으로 변환됩니다. (Jackson 라이브러리 필요 없음!)
    return {"message": "Hello, WorkFlow AI!", "status": "Running"}

# 3. 헬스 체크
@app.get("/health")
def health_check():
    return {"status": "ok"}