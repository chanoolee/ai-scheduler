# app/routers/admin_router.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
import uuid

# 경로(app.core / app.models)는 대장 프로젝트 폴더 구조에 맞게 수정해주세요!
from core.database import get_db  # type: ignore
from models.tables import User # type: ignore
from core.security import get_password_hash, encrypt_data # type: ignore

# URL 앞에 '/admin'을 붙여서 관리자용 API라는 걸 명시!
router = APIRouter(prefix="/admin", tags=["Admin"])

# --- 관리자가 프론트에서 보낼 데이터 규격 ---
class UserCreateByAdmin(BaseModel):
    username: str  # 아이디 (겸 병원명)
    phone: str     # 연락처 (contact -> phone으로 변경 반영!)
    email: str     # 이메일

# --- 고객 계정 생성 API ---
@router.post("/users")
def create_customer_account(user_in: UserCreateByAdmin, db: Session = Depends(get_db)):
    
    # 1. 아이디 중복 체크
    existing_user = db.query(User).filter(User.username == user_in.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="이미 등록된 아이디(병원명)입니다 대장!")

    # 2. 🌟 핵심: 임시 비밀번호 자동 발급 (예: 일단 '123456'으로 통일하거나 랜덤 발급)
    # 나중에는 폰번호 뒷자리 등으로 자동 조합하게 만들 수도 있어!
    temp_password = "password123!" 
    hashed_pw = get_password_hash(temp_password)

    # 3. 개인정보 암호화
    enc_phone = encrypt_data(user_in.phone)
    enc_email = encrypt_data(user_in.email)

    # 4. DB에 넣을 객체 조립 (대장이 수정한 DB 구조 반영)
    new_user = User(
        userId=f"U-{uuid.uuid4().hex[:15].upper()}",
        username=user_in.username,
        password=hashed_pw,
        phone=enc_phone,    # 👈 phone으로 이름 변경된 부분!
        email=enc_email,
        role_code="CUSTOMER",
        is_active=True,
        first_login_check=True # 👈 첫 로그인 시 무조건 비번 바꾸게 강제!
    )

    # 5. DB 저장
    db.add(new_user)
    db.commit()

    return {
        "message": "고객 계정이 성공적으로 발급되었습니다!",
        "username": user_in.username,
        "temp_password": temp_password # 프론트엔드에서 관리자에게 "이 비번으로 안내하세요"라고 띄워줄 용도!
    }