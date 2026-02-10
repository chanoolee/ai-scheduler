# app/schemas/user_schema.py

from pydantic import BaseModel
from typing import Optional

# 1. 공통 속성 (Base DTO)
class UserBase(BaseModel):
    username: str
    full_name: Optional[str] = None # null 허용

# 2. 회원가입 요청용 (Request DTO)
# 사용자가 입력해야 할 필드만 정의
class UserCreate(UserBase):
    password: str 

# 3. 응답용 (Response DTO)
# DB에서 꺼내서 사용자에게 보여줄 필드 (비밀번호 제외!)
class UserResponse(UserBase):
    id: int
    role: str

    # [중요] JPA Entity -> DTO 자동 변환 설정
    # 이걸 켜면 user.id 처럼 객체 속성을 읽어서 JSON으로 만들어줍니다.
    class Config:
        from_attributes = True