# app/models/tables.py

"""
새 비즈니스 로직 기준 전체 도메인 모델 정의.

1) AuditMixin: 공통 감사 컬럼
2) Role: 권한
3) User: 계정/병원
4) ShiftType: 근무타입
5) Employee: 병원 직원
6) WorkSchedule: 근무 스케줄
7) LoginHistory: 로그인 이력
"""

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    Date,
    DateTime,
    Time,
    ForeignKey,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship, declarative_mixin, declared_attr # 🌟 추가됨!
from sqlalchemy.sql import func
from datetime import datetime, timezone # 🌟 timezone 추가됨!

from core.database import Base # type: ignore


@declarative_mixin # 🌟 Mixin 클래스임을 명시
class AuditMixin:
    """
    모든 테이블이 상속받는 공통 감사(Meta) 컬럼.
    """

    # PostgreSQL에 맞게 timezone=True 설정 및 컬럼명 변경
    create_dt = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    update_dt = Column(
        DateTime(timezone=True),
        nullable=True,
        onupdate=func.now(),
    )
    
    # Mixin에서 컬럼을 정의할 땐 @declared_attr 사용이 정석!
    @declared_attr
    def created_by_id(cls):
        return Column(String(20), nullable=True)

    @declared_attr
    def updated_by_id(cls):
        return Column(String(20), nullable=True)


# 🌟 상속 순서는 (Base, AuditMixin)이 관례적으로 더 안정적입니다.
class Role(Base, AuditMixin):
    """
    권한(Role)
    """
    __tablename__ = "roles"

    role_code = Column(String(50), primary_key=True, index=True)
    role_name = Column(String(100), nullable=False)
    description = Column(String(255), nullable=True)

    users = relationship("User", back_populates="role")


class User(Base, AuditMixin):
    """
    계정 / 병원 정보
    """
    __tablename__ = "users"

    userid = Column(String(20), primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    password = Column(String(255), nullable=False)
    phone = Column(String(150), nullable=True)
    email = Column(String(150), nullable=True)

    role_code = Column(
        String(50),
        ForeignKey("roles.role_code", ondelete="RESTRICT"),
        nullable=False,
    )
    is_active = Column(Boolean, nullable=False, server_default="true")
    
    # PostgreSQL 타임존 적용
    service_expires_at = Column(DateTime(timezone=True), nullable=True)
    first_login_check = Column(Boolean, nullable=False, server_default="true")

    # 관계
    role = relationship("Role", back_populates="users")
    shift_types = relationship("ShiftType", back_populates="owner")
    employees = relationship("Employee", back_populates="manager")
    login_histories = relationship("LoginHistory", back_populates="user")
    work_requests = relationship("WorkRequest", back_populates="user")

    @property
    def is_service_expired(self) -> bool:
        if self.service_expires_at is None:
            return False

        # 🌟 파이썬 최신 표준 권장 방식 (timezone-aware)
        now = datetime.now(timezone.utc)
        return now > self.service_expires_at


class ShiftType(Base, AuditMixin):
    """
    근무타입 정의
    """
    __tablename__ = "shift_types"

    id = Column(Integer, primary_key=True, index=True)

    owner_id = Column(
        String(20),
        ForeignKey("users.userid", ondelete="CASCADE"),
        nullable=False,
    )

    name = Column(String(50), nullable=False)
    start_time = Column(Time, nullable=True)
    end_time = Column(Time, nullable=True)
    color = Column(String(20), nullable=True)

    # 관계
    owner = relationship("User", back_populates="shift_types")
    work_schedules = relationship("WorkSchedule", back_populates="shift_type")


class Employee(Base, AuditMixin):
    """
    병원 직원 명부
    """
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)

    manager_id = Column(
        String(20),
        ForeignKey("users.userid", ondelete="CASCADE"),
        nullable=False,
    )

    name = Column(String(100), nullable=False)
    position = Column(String(50), nullable=True)

    # 관계
    manager = relationship("User", back_populates="employees")
    work_schedules = relationship("WorkSchedule", back_populates="employee")


class WorkSchedule(Base, AuditMixin):
    """
    실제 근무 스케줄(시간표)
    """
    __tablename__ = "work_schedules"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)

    employee_id = Column(
        Integer,
        ForeignKey("employees.id", ondelete="CASCADE"),
        nullable=False,
    )
    shift_type_id = Column(
        Integer,
        ForeignKey("shift_types.id", ondelete="RESTRICT"),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint(
            "date",
            "employee_id",
            name="uq_work_schedule_date_employee",
        ),
    )

    # 관계
    employee = relationship("Employee", back_populates="work_schedules")
    shift_type = relationship("ShiftType", back_populates="work_schedules")


class LoginHistory(Base, AuditMixin):
    """
    로그인 이력
    """
    __tablename__ = "login_histories"

    id = Column(Integer, primary_key=True, index=True)

    userid = Column(
        String(20),
        ForeignKey("users.userid", ondelete="CASCADE"),
        nullable=False,
    )
    ip_address = Column(String(45), nullable=True)
    
    # 여기도 timezone 적용
    login_at = Column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    # 관계
    user = relationship("User", back_populates="login_histories")


class RequestType:
    LEAVE = "leave"
    WORK = "work"


class WorkRequest(Base, AuditMixin):
    """
    근무/휴무 신청 정보
    """
    __tablename__ = "work_requests"

    id = Column(Integer, primary_key=True, index=True)
    userid = Column(
        String(20),
        ForeignKey("users.userid", ondelete="CASCADE"),
        nullable=False,
    )
    date = Column(Date, nullable=False)
    type = Column(String(50), nullable=False)
    status = Column(
        String(50), nullable=False, server_default="pending"
    )

    # 관계
    user = relationship("User", back_populates="work_requests")