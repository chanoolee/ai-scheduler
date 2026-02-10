# app/models/tables.py

from sqlalchemy import Column, Integer, String, Boolean, Date, ForeignKey, Enum
from sqlalchemy.orm import relationship
import enum
from app.core.database import Base

# --- Enum 타입 정의 (Java의 enum과 동일) ---
class Role(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"

class RequestType(str, enum.Enum):
    LEAVE = "leave"       # 연차/휴무
    WORK = "work"         # 근무 희망

# --- 1. 사용자 (User) 테이블 ---
class User(Base):
    __tablename__ = "users"  # DB 테이블 이름

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True) # 로그인 ID
    password = Column(String) # 암호화된 비번
    full_name = Column(String)
    role = Column(String, default=Role.USER) # 권한
    
    # 양방향 관계 설정 (User.requests로 접근 가능)
    requests = relationship("WorkRequest", back_populates="owner")
    schedules = relationship("WorkSchedule", back_populates="owner")

# --- 2. 근무/휴무 신청 (WorkRequest) 테이블 ---
class WorkRequest(Base):
    __tablename__ = "work_requests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id")) # FK
    date = Column(Date)
    type = Column(String) # LEAVE or WORK
    
    status = Column(String, default="PENDING")

    # 관계 매핑 (Java의 @ManyToOne)
    owner = relationship("User", back_populates="requests")

# --- 3. 최종 스케줄 (WorkSchedule) 테이블 ---
class WorkSchedule(Base):
    __tablename__ = "work_schedules"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date)
    shift_type = Column(String) # 오전/오후/야간 등
    
    owner = relationship("User", back_populates="schedules")