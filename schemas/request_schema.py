# app/schemas/request_schema.py

from pydantic import BaseModel
from datetime import date
from typing import Optional

# 1. 기본 속성
class RequestBase(BaseModel):
    date: date          # 날짜 (YYYY-MM-DD)
    type: str           # "leave" (휴무) or "work" (근무)

# 2. 신청 생성용 (Request DTO)
class RequestCreate(RequestBase):
    user_id: int        # 누가 신청했는지 (나중엔 로그인 정보로 대체)

# 3. 응답용 (Response DTO)
class RequestResponse(RequestBase):
    id: int
    status: str         # 대기중/승인됨 등 상태
    
    class Config:
        from_attributes = True