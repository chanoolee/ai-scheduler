# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import engine, Base   # type: ignore
from models import tables  # type: ignore # <-- 우리가 만든 모델 임포트 (필수!) 

# 라우터 임포트
from routers import user_router, request_router, schedule_router, auth_router, admin_router # type: ignore

# 1. DB 테이블 자동 생성 (DDL Auto)
# models에 정의된 클래스들을 보고 DB에 테이블을 찍어냅니다.
Base.metadata.create_all(bind=engine)

# 2. 앱 생성 (Spring의 @SpringBootApplication)
app = FastAPI(
    title="WorkFlow AI Scheduler",
    description="AI 기반 근무 스케줄링 자동화 서비스",
    version="0.1.0"
)

# 🌟 3. CORS 미들웨어 등록 (이게 405 에러의 철벽을 허물어 줍니다!)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # 개발 중에는 프론트(3000포트)든 뭐든 다 허용!
    allow_credentials=True,
    allow_methods=["*"], # POST, OPTIONS 등 모든 메서드 허용
    allow_headers=["*"],
)

# 앱에 라우터 등록
app.include_router(user_router.router)
app.include_router(request_router.router)
app.include_router(schedule_router.router)
app.include_router(auth_router.router)
app.include_router(admin_router.router)

# 2. 기본 경로 (Spring의 @RestController + @GetMapping)
@app.get("/")
def read_root():
    # Dict를 리턴하면 자동으로 JSON으로 변환됩니다. (Jackson 라이브러리 필요 없음!)
    return {"message": "Hello, WorkFlow AI!", "status": "Running"}

# 3. 헬스 체크
@app.get("/health")
def health_check():
    return {"status": "ok"}