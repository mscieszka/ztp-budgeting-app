from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from datetime import date
# from typing import Optional
# from decimal import Decimal # error?

app = FastAPI()

class Transaction(BaseModel):
    transaction_date: date = Field(..., description="Date of the transaction")
    # amount: Decimal = Field(..., gt=0, description="Transaction amount in PLN (must be positive)")
    title: str = Field(..., min_length=1, max_length=200, description="Transaction title")
    is_income: bool = Field(..., description="True if this is income, False if expense")

    class Config:
        json_schema_extra = {
            "example": {
                "transaction_date": "2025-01-13",
                # "amount": "123.45",
                "title": "Grocery shopping",
                "is_income": False
            }
        }

@app.post("/transactions", response_model=Transaction, status_code=201)
async def add_transaction(transaction: Transaction):
    try:
        # Here you would typically add database logic
        # For now, we'll just return the transaction if it's valid
        return transaction
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to create transaction"
        )
