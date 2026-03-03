import logging
from datetime import datetime, timedelta
from typing import Optional

import bcrypt # 🌟 passlib 대신 순수 bcrypt 직결!
from cryptography.fernet import Fernet
from jose import JWTError, jwt

from core.config import settings # type: ignore

# AES 암호화 설정
# settings.ENCRYPTION_KEY는 Fernet.generate_key()로 생성된 유효한 키여야 합니다.
try:
    fernet = Fernet(settings.ENCRYPTION_KEY.encode())
except Exception as e:
    logging.error(f"Fernet key initialization failed: {e}")
    # 키가 잘못된 경우 런타임 에러 방지를 위해 임시 키 사용 (실제 서비스에서는 설정 확인 필요)
    fernet = None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """단방향 비밀번호 검증 (bcrypt 직접 사용)"""
    try:
        # bcrypt는 byte 형식만 취급하므로 인코딩/디코딩 처리
        return bcrypt.checkpw(
            plain_password.encode('utf-8'), 
            hashed_password.encode('utf-8')
        )
    except ValueError:
        # DB에 저장된 해시값이 손상되었거나 형식이 다를 때 뻗지 않도록 방어
        return False

def get_password_hash(password: str) -> str:
    """단방향 비밀번호 해싱 (bcrypt 직접 사용)"""
    # 비밀번호를 바이트로 변환 후 솔트(salt)를 섞어서 해싱
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return hashed.decode('utf-8') # DB에 문자열(VARCHAR)로 넣기 위해 다시 문자열로 변환

def encrypt_data(plain_text: str) -> str:
    """개인정보 양방향 암호화 (AES)"""
    if not plain_text:
        return ""
    if fernet is None:
        logging.error("Encryption failed: Fernet is not initialized")
        return ""
    try:
        return fernet.encrypt(plain_text.encode()).decode()
    except Exception as e:
        logging.error(f"Encryption error: {e}")
        return ""

def decrypt_data(cipher_text: str) -> str:
    """개인정보 양방향 복호화 (AES)"""
    if not cipher_text:
        return ""
    if fernet is None:
        logging.error("Decryption failed: Fernet is not initialized")
        return ""
    try:
        return fernet.decrypt(cipher_text.encode()).decode()
    except Exception as e:
        logging.error(f"Decryption error: {e}")
        return ""