import os
import sys

# 현재 폴더를 파이썬 경로에 추가해서 core랑 models를 찾게 해줌!
sys.path.append(os.getcwd()) 

# 대장의 진짜 도면(Base)과 테이블 설계도(models) 가져오기!
from core.database import Base
import models

from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

from dotenv import load_dotenv

load_dotenv()

# -----------------------------------------------------------------
# [중요!] 'app' 모듈을 찾기위해 프로젝트 루트 경로를 sys.path에 추가
# env.py (alembic/) → 상위(alembic) → 상위(프로젝트 루트: app가 위치한 상위)
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)
# -----------------------------------------------------------------

# Alembic Config 객체 가져오기
config = context.config

# 로그 설정 (alembic.ini에 설정된 경우만)
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# 실제 DB URL을 app.core.database에서 가져와 주입
try:
    from core.database import SQLALCHEMY_DATABASE_URL
except ImportError as e:
    raise ImportError(
        "DB URL을 app.core.database에서 불러오기 실패! (모듈 경로, sys.path 등 재확인 필요)\n"
        f"sys.path: {sys.path}"
    ) from e

config.set_main_option("sqlalchemy.url", SQLALCHEMY_DATABASE_URL)

# Base metadata를 models.tables에서 import
try:
    from models.tables import Base
except ImportError as e:
    raise ImportError(
        "Base를 app.models.tables에서 불러오기 실패! (모듈 경로 및 PYTHONPATH 확인)\n"
        f"sys.path: {sys.path}"
    ) from e

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    """'offline' 모드로 migration 실행 (DB 연결X)."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """'online' 모드로 migration 실행 (DB 연결O)."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()


ENCRYPTION_KEY=os.environ.get("ENCRYPTION_KEY")