# app/routers/request_router.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.request_schema import RequestCreate, RequestResponse
from app.services import request_service

router = APIRouter(
    prefix="/requests",
    tags=["requests"], # Swagger에서 그룹핑될 이름
)

@router.post("/", response_model=RequestResponse)
def create_request(request: RequestCreate, db: Session = Depends(get_db)):
    # 실제로는 여기서 user_id가 유효한지 체크하는 로직이 필요하지만, 일단 패스!
    return request_service.create_request(db, request)

@router.get("/", response_model=List[RequestResponse])
def read_requests(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return request_service.get_requests(db, skip=skip, limit=limit)