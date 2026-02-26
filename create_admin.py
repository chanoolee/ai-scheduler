# create_admin.py

# 경로(app.core 등)는 대장 폴더 구조에 맞게 맞춰주세요!
from app.core.database import SessionLocal # type: ignore # DB 세션
from app.models.tables import User, Role # type: ignore
from app.core.security import get_password_hash, encrypt_data # type: ignore
import uuid

def create_super_admin():
    db = SessionLocal()
    
    try:
        # 1. 권한(Role) 테이블에 'SUPER_ADMIN'과 'CUSTOMER'가 없으면 먼저 만들어줌!
        # (이게 없으면 User 만들 때 외래키 에러 남)
        roles_to_create = [
            {"code": "SUPER_ADMIN", "name": "총관리자", "desc": "관리자권한"},
            {"code": "CUSTOMER", "name": "병원관리자", "desc": "일반사용자"}
        ]
        
        for r in roles_to_create:
            existing_role = db.query(Role).filter(Role.role_code == r["code"]).first()
            if not existing_role:
                new_role = Role(role_code=r["code"], role_name=r["name"], description=r["desc"])
                db.add(new_role)
        db.commit()

        # 2. 대장(admin) 계정이 이미 있는지 확인
        admin_userid = "chanulee_admin" # 대장이 쓸 아이디
        admin_password = "1234" # 대장이 쓸 임시 비밀번호 (나중에 바꿔!)
        
        existing_admin = db.query(User).filter(User.userid == admin_userid).first()
        
        if existing_admin:
            print("😎 이미 '" + admin_userid + "' 계정이 존재합니다.")
            return

        # 3. 비밀번호 암호화 & 계정 생성
        print("🚀 최고 관리자 계정 생성 중...")
        hashed_pw = get_password_hash(admin_password)
        print("암호화 값" + hashed_pw)
        new_admin = User(
            userid=admin_userid,
            password=hashed_pw,
            username="관리자",
            phone=encrypt_data("010-0000-0000"), # 암호화 로직 태워야 에러 안 남
            email=encrypt_data("admin@example.com"),
            role_code="SUPER_ADMIN",
            is_active=True,
            first_login_check=False # 대장은 굳이 비번 강제 변경 안 해도 되니까 False!
        )
        
        db.add(new_admin)
        db.commit()
        print(f"🎉 성공! [ID: {admin_userid} / PW: {admin_password}] 로 로그인하세요!")

    except Exception as e:
        print(f"🚨 에러 발생: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_super_admin()