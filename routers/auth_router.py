# app/routers/auth_router.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from core.database import get_db # type: ignore
from models.tables import User # type: ignore
from core.security import verify_password # type: ignore

router = APIRouter()

# 프론트에서 넘어올 로그인 데이터 규격
class LoginRequest(BaseModel):
    userid: str
    password: str

@router.post("/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):

    # 1. DB에서 사용자 조회
    user = db.query(User).filter(User.userid == req.userid).first()

    # 2. 아이디가 없거나 비밀번호가 틀린 경우
    if not user or not verify_password(req.password, user.password):
        
        raise HTTPException(status_code=401, detail="아이디 또는 비밀번호가 일치하지 않습니다!")

    # 3. 비활성화된 계정 차단
    if not user.is_active:
        raise HTTPException(status_code=403, detail="사용이 중지된 계정입니다.")

    # 4. 🌟 핵심: 임시 비밀번호 상태인지 체크!
    if user.must_change_password:
        return {
            "status": "REQUIRE_PASSWORD_CHANGE",
            "message": "임시 비밀번호로 로그인하셨습니다. 비밀번호 변경 페이지로 이동합니다.",
            "userId": user.userId # 비밀번호 변경 API를 호출할 때 쓰기 위해 ID만 던져줌
            # 🚨 주의: 이때는 아직 정상 로그인이 아니므로 JWT 인증 토큰을 주면 안 돼!
        }

    # 5. 정상 로그인 성공 (추후 여기에 JWT 토큰 발급 로직 추가)
    return {
        "status": "SUCCESS",
        "message": "로그인 성공!",
        "token": "여기에_진짜_JWT_토큰이_들어갑니다",
        "role": user.role_code
    }