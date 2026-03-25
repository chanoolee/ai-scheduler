# app/schemas/setting_schema.py

from pydantic import BaseModel
from typing import Optional
from datetime import time

# =======================================
# 1. 직원 관리 스키마
# =======================================
class EmployeeCreate(BaseModel):
    name: str
    position: Optional[str] = None

# =======================================
# 2. 근무 타입 스키마
# =======================================
class ShiftTypeCreate(BaseModel):
    name: str             # 예: Day, 오전반
    start_time: time      # 예: 07:00:00
    end_time: time        # 예: 15:00:00
    color: str            # 예: #DBEAFE

# =======================================
# 3. 자동화 고정 조건 스키마
# =======================================
class ScheduleConditionCreate(BaseModel):
    max_work_hours: int   # 만근 시간
    op_start_time: time   # 운영 시작 시간
    op_end_time: time     # 운영 종료 시간
    prompt_text: str      # AI 자연어 조건 텍스트

# =======================================
# 3. 휴가 설정 데이터 스키마
# =======================================
class LeaveSettingCreate(BaseModel):
    annual: bool
    half: bool
    quarter: bool