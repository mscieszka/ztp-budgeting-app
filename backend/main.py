from fastapi import FastAPI, HTTPException, Depends
from pydantic import BaseModel, Field
from datetime import date
from sqlalchemy import create_engine, Column, Integer, String, Boolean, Date, Double
from sqlalchemy.orm import sessionmaker, Session, declarative_base
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class DBTransaction(Base):
    __tablename__ = "transactions"
    id = Column(Integer, primary_key=True, index=True)
    transaction_date = Column(Date, nullable=False)
    title = Column(String(200), nullable=False)
    is_income = Column(Boolean, nullable=False)
    spending = Column(Double, nullable=False)

Base.metadata.create_all(bind=engine)

class Transaction(BaseModel):
    transaction_date: date = Field(..., description="Date of the transaction")
    title: str = Field(..., min_length=1, max_length=200, description="Transaction title")
    is_income: bool = Field(..., description="True if this is income, False if expense")
    spending: float = Field(..., ge=0, description="Transaction amount")
    id: int = None 

    class Config:
        json_schema_extra = {
            "example": {
                "id": 1,
                "transaction_date": "2025-01-13",
                "title": "Grocery shopping",
                "is_income": True,
                "spending": 21.37
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
    db_transaction = DBTransaction(
        transaction_date=transaction.transaction_date,
        title=transaction.title,
        is_income=transaction.is_income,
        spending=transaction.spending
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    
    transaction_response = Transaction(
        id=db_transaction.id,
        transaction_date=db_transaction.transaction_date,
        title=db_transaction.title,
        is_income=db_transaction.is_income,
        spending=db_transaction.spending
    )
    
    return transaction_response

@app.get("/transactions/total_income", status_code=200)
async def get_summary(db: Session = Depends(get_db)):
    income_total = db.query(DBTransaction).filter(DBTransaction.is_income == True).with_entities(DBTransaction.spending).all()
    income_sum = sum(x[0] for x in income_total)

    return {
        "total_income": income_sum
    }

@app.get("/transactions/total_spending", status_code=200)
async def get_summary(db: Session = Depends(get_db)):
    spending_total = db.query(DBTransaction).filter(DBTransaction.is_income == False).with_entities(DBTransaction.spending).all()
    spending_sum = sum(x[0] for x in spending_total)

    return {
        "total_spending": spending_sum
    }

@app.get("/transactions/balance", status_code=200)
async def get_summary(db: Session = Depends(get_db)):
    spending_total = db.query(DBTransaction).filter(DBTransaction.is_income == False).with_entities(DBTransaction.spending).all()
    spending_sum = sum(x[0] for x in spending_total)

    income_total = db.query(DBTransaction).filter(DBTransaction.is_income == True).with_entities(DBTransaction.spending).all()
    income_sum = sum(x[0] for x in income_total)

    return {
        "balance": round(income_sum - spending_sum, 2)
    }

@app.get("/transactions", response_model=list[Transaction], status_code=200)
async def get_transactions(db: Session = Depends(get_db)):
    transactions = db.query(DBTransaction).all()  
    return transactions


@app.delete("/transactions/{transaction_id}", status_code=204)
async def delete_transaction(transaction_id: int, db: Session = Depends(get_db)):
    db_transaction = db.query(DBTransaction).filter(DBTransaction.id == transaction_id).first()
    
    if db_transaction:
        db.delete(db_transaction)
        db.commit()
        return {"message": "Transaction successfully deleted"}
    else:
        raise HTTPException(status_code=404, detail="Transaction not found")
