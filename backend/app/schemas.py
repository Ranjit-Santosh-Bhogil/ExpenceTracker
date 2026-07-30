# backend/app/schemas.py

from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import Optional, List


# ==========================
# USER SCHEMAS
# ==========================

class UserBase(BaseModel):
    """
    Base schema with common user fields.
    Other schemas inherit from this to avoid repetition.
    """
    name: str = Field(..., min_length=1, max_length=100, description="User's full name")
    email: EmailStr = Field(..., description="Must be a valid email address")


class UserCreate(UserBase):
    """
    Schema for registering a new user.
    Includes password which is only needed during creation.
    """
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")


class UserLogin(BaseModel):
    """
    Schema for login requests.
    Only email and password are required.
    """
    email: EmailStr = Field(..., description="Must be a valid email address")
    password: str = Field(..., min_length=1, description="Account password")


class UserResponse(UserBase):
    """
    Schema for returning user data in API responses.
    Does NOT include password — security best practice.
    """
    id: int

    class Config:
        # This tells Pydantic to read data from SQLAlchemy objects
        # SQLAlchemy returns objects, not dictionaries, so this is required
        from_attributes = True


# ==========================
# EXPENSE SCHEMAS
# ==========================

class ExpenseBase(BaseModel):
    """
    Base schema with common expense fields.
    """
    title: str = Field(..., min_length=1, max_length=200, description="Title of the expense")
    amount: float = Field(..., gt=0, description="Amount must be greater than zero")
    category: str = Field(..., min_length=1, description="Category like Food, Transport, etc.")
    description: Optional[str] = Field(default=None, max_length=500, description="Optional details")
    date: datetime = Field(default_factory=datetime.utcnow, description="Date of the expense")


class ExpenseCreate(ExpenseBase):
    """
    Schema for creating a new expense.
    All fields come from ExpenseBase — no extra fields needed.
    """
    pass


class ExpenseUpdate(BaseModel):
    """
    Schema for updating an existing expense.
    All fields are optional because you might update just one field.
    """
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    amount: Optional[float] = Field(default=None, gt=0)
    category: Optional[str] = Field(default=None, min_length=1)
    description: Optional[str] = Field(default=None, max_length=500)
    date: Optional[datetime] = Field(default=None)


class ExpenseResponse(ExpenseBase):
    """
    Schema for returning expense data in API responses.
    Includes the ID and user_id so the frontend knows who owns it.
    """
    id: int
    user_id: int

    class Config:
        from_attributes = True


# ==========================
# INCOME SCHEMAS
# ==========================

class IncomeBase(BaseModel):
    """
    Base schema with common income fields.
    """
    title: str = Field(..., min_length=1, max_length=200, description="Source of income")
    amount: float = Field(..., gt=0, description="Amount must be greater than zero")
    date: datetime = Field(default_factory=datetime.utcnow, description="Date of the income")


class IncomeCreate(IncomeBase):
    """
    Schema for creating a new income entry.
    """
    pass


class IncomeUpdate(BaseModel):
    """
    Schema for updating an existing income entry.
    """
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    amount: Optional[float] = Field(default=None, gt=0)
    date: Optional[datetime] = Field(default=None)


class IncomeResponse(IncomeBase):
    """
    Schema for returning income data in API responses.
    """
    id: int
    user_id: int

    class Config:
        from_attributes = True


# ==========================
# AUTH SCHEMAS
# ==========================

class Token(BaseModel):
    """
    Schema for the login response.
    Returns the JWT access token and its type.
    """
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """
    Schema for the data stored inside the JWT token.
    We only store the user_id (called 'sub' in JWT standard).
    """
    user_id: Optional[int] = None


# ==========================
# DASHBOARD SCHEMA
# ==========================

class DashboardResponse(BaseModel):
    """
    Schema for the dashboard summary.
    Returns totals and a list of recent expenses.
    """
    total_income: float
    total_expense: float
    current_balance: float
    # BUG FIX: Use List[ExpenseResponse] instead of list[ExpenseResponse]
    # to support Python 3.8 (lowercase `list` as generic requires Python 3.9+)
    recent_expenses: List[ExpenseResponse]