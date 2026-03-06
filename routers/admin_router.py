# app/routers/admin_router.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

# 경로(app.core / app.models)는 대장 프로젝트 폴더 구조에 맞게 수정해주세요!
from core.database import get_db
from models.tables import User
from core.security import get_password_hash, encrypt_data
from schemas.user_schema import UserCreateByAdmin

# URL 앞에 '/admin'을 붙여서 관리자용 API라는 걸 명시!
router = APIRouter(prefix="/admin", tags=["Admin"])

# --- 고객 계정 생성 API ---
@router.post("/users")
def create_customer_account(user_in: UserCreateByAdmin, db: Session = Depends(get_db)):
    
    # 1. 중복 체크 (로그인 아이디 & 병원 이름 둘 다 체크!)
    if db.query(User).filter(User.userid == user_in.userid).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 로그인 아이디입니다 대장!")
        
    # 2. 연락처(phone)를 임시 비밀번호로 세팅!
    temp_password = user_in.phone 
    hashed_pw = get_password_hash(temp_password)

    # 3. 개인정보 암호화
    enc_phone = encrypt_data(user_in.phone)
    enc_email = encrypt_data(user_in.email)

    # 4. 🌟 DB 객체 조립 (프론트에서 넘어온 userid 꽂아 넣기!)
    new_user = User(
        userid=user_in.userid,
        username=user_in.username,
        password=hashed_pw,                          
        phone=enc_phone,    
        email=enc_email,
        role_code=user_in.role_code,                 
        service_expires_at=user_in.service_expires_at, 
        created_by_id=user_in.created_by_id,         
        is_active=True,
        first_login_check=True 
    )

    db.add(new_user)
    db.commit()

    return {
        "message": f"🎉 {user_in.username} 고객님의 계정이 성공적으로 발급되었습니다!",
        "username": user_in.username,
        "temp_password": temp_password 
    }