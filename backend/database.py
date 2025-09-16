
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# Load .env file and override existing variables
load_dotenv(override=True)

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./trading.db")
print(f"Using database: {DATABASE_URL}")

# Create shared directory if using shared database path
if "shared" in DATABASE_URL:
    shared_dir = os.path.join(os.getcwd(), "shared")
    os.makedirs(shared_dir, exist_ok=True)

# Use appropriate connection args for SQLite
connect_args = {"check_same_thread": False} if "sqlite" in DATABASE_URL else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
