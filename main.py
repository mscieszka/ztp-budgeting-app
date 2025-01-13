from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from datetime import date
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Date
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session

app = FastAPI()

DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class DBTansaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    transaction_date = Column(Date, nullable=False)
    title = Column(String(200), nullable=False)
    is_income = Column(Boolean, nullable=False)

Base.metadata.create_all(bind=engine)

class Transaction(BaseModel):
    transaction_date: date = Field(..., description="Date of the transaction")
    title: str = Field(..., min_length=1, max_length=200, description="Transaction title")
    is_income: bool = Field(..., description="True if this is income, False if expense")

    class Config:
        json_schema_extra = {
            "example": {
                "transaction_date": "2025-01-13",
                "title": "Grocery shopping",
                "is_income": False
            }
        }

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/transactions", response_model=Transaction, status_code=201)
async def add_transaction(transaction: Transaction, db: Session = Depends(get_db)):
    db_transaction = DBTansaction(
        transaction_date=transaction.transaction_date,
        title=transaction.title,
        is_income=transaction.is_income,
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    db_transaction_check = db.query(DBTansaction).filter(DBTansaction.id == db_transaction.id).first()
    
    if db_transaction_check:
        return db_transaction_check
    else:
        raise HTTPException(
            status_code=500,
            detail="Failed to create transaction"
        )