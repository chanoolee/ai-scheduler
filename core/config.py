from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "your-secret-key-here"
    ALGORITHM: str = "HS256"
    # Fernet.generate_key()로 생성된 유효한 키여야 합니다.
    ENCRYPTION_KEY: str = "hgHDiSOdSgtsROEjKoMaTHBRpY1XoVG6jgUAD8_aACg="

    class Config:
        env_file = ".env"

settings = Settings()
