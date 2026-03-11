# app/schemas/schedule_schema.py

from pydantic import BaseModel
from typing import Dict, Any

class ScheduleGenerateRequest(BaseModel):
    year: int
    month: int
    ai_prompt: str                  # 이번 달 특별 요청사항 (자연어)
    manual_shifts: Dict[str, Any]   # 수동 고정 스케줄 (예: {"1_15": {"id": 2, "name": "Day", ...}})