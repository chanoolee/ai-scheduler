import os
from pydantic_settings import BaseSettings, SettingsConfigDict

# 1. 절대 경로로 .env 파일 위치 찾기 (database.py랑 똑같은 철벽 방어!)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
env_path = os.path.join(BASE_DIR, ".env")

class Settings(BaseSettings):
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    # Fernet.generate_key()로 생성된 유효한 키여야 합니다.
    ENCRYPTION_KEY: str = "hgHDiSOdSgtsROEjKoMaTHBRpY1XoVG6jgUAD8_aACg="

    # 💡 (선택 사항) 만약 DB 주소도 여기서 안전하게 관리하고 싶다면 이 줄을 추가해! 
    # DATABASE_URL: str

    # 2. 🚨 핵심: Pydantic v2 최신 문법으로 네비게이션 달아주기!
    model_config = SettingsConfigDict(
        env_file=env_path, 
        env_file_encoding="utf-8",
        extra="ignore"  # .env에 다른 변수(DATABASE_URL 등)가 있어도 튕기지 않게 방어!
    )

settings = Settings()