# backend/app/main.py

from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import Optional, List
from . import models
from . import schemas
from . import crud
from . import auth
from .database import engine, get_db
from .dependencies import get_current_user

# ==========================
# CREATE DATABASE TABLES
# ==========================

# This creates all tables defined in models.py if they don't already exist
# It runs once when the application starts
models.Base.metadata.create_all(bind=engine)

# ==========================
# FASTAPI APP INSTANCE
# ==========================

app = FastAPI(
    title="Expense Tracker API",
    description="A beginner-friendly Full Stack Expense Tracker built with FastAPI and React",
    version="1.0.0"
)

# ==========================
# CORS MIDDLEWARE
# ==========================

# CORS allows the React frontend to call this API during development.
ALLOWED_ORIGINS = [
   
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================
# AUTH ROUTES
# ==========================

@app.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    Checks if email already exists. If yes, returns 400 error.
    Hashes the password before saving.
    """
    # Check if email is already registered
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create the user
    return crud.create_user(db=db, user=user)


@app.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """
    Login endpoint.
    Validates email and password. If correct, returns a JWT access token.
    """
    # Find user by email
    db_user = crud.get_user_by_email(db, email=user_credentials.email)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not auth.verify_password(user_credentials.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Create JWT token
    access_token = auth.create_access_token(data={"sub": str(db_user.id)})
    
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/me", response_model=schemas.UserResponse)
def read_current_user(current_user: models.User = Depends(get_current_user)):
    """
    Returns the currently logged-in user's profile.
    Requires a valid JWT token in the Authorization header.
    """
    return current_user


# ==========================
# EXPENSE ROUTES
# ==========================

@app.post("/expenses", response_model=schemas.ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense: schemas.ExpenseCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Create a new expense for the logged-in user.
    Protected route — requires JWT token.
    """
    return crud.create_expense(db=db, expense=expense, user_id=current_user.id)


@app.get("/expenses", response_model=List[schemas.ExpenseResponse])
def read_expenses(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
    search: Optional[str] = Query(None, description="Search by title"),
    category: Optional[str] = Query(None, description="Filter by category"),
    sort_by: Optional[str] = Query("date", description="Sort by: date, amount, or title")
):
    """
    Get all expenses for the logged-in user with optional filtering and sorting.
    Protected route — requires JWT token.
    """
    return crud.get_expenses(db=db, user_id=current_user.id, search=search, category=category, sort_by=sort_by)


@app.put("/expenses/{expense_id}", response_model=schemas.ExpenseResponse)
def update_expense(
    expense_id: int,
    expense: schemas.ExpenseUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Update an existing expense.
    Only the owner can update their own expenses.
    """
    db_expense = crud.update_expense(db, expense_id=expense_id, user_id=current_user.id, expense_update=expense)
    if not db_expense:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    return db_expense


@app.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(
    expense_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Delete an expense by ID.
    Only the owner can delete their own expenses.
    Returns 204 No Content on success.
    """
    success = crud.delete_expense(db, expense_id=expense_id, user_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Expense not found"
        )
    return None  # 204 response has no body


# ==========================
# INCOME ROUTES
# ==========================

@app.post("/income", response_model=schemas.IncomeResponse, status_code=status.HTTP_201_CREATED)
def create_income(
    income: schemas.IncomeCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Create a new income entry for the logged-in user.
    Protected route — requires JWT token.
    """
    return crud.create_income(db=db, income=income, user_id=current_user.id)


@app.get("/income", response_model=List[schemas.IncomeResponse])
def read_income(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get all income entries for the logged-in user.
    Protected route — requires JWT token.
    """
    return crud.get_income(db=db, user_id=current_user.id)


@app.put("/income/{income_id}", response_model=schemas.IncomeResponse)
def update_income(
    income_id: int,
    income: schemas.IncomeUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Update an existing income entry.
    """
    db_income = crud.update_income(db, income_id=income_id, user_id=current_user.id, income_update=income)
    if not db_income:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Income not found"
        )
    return db_income


@app.delete("/income/{income_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_income(
    income_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Delete an income entry by ID.
    """
    success = crud.delete_income(db, income_id=income_id, user_id=current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Income not found"
        )
    return None


# ==========================
# DASHBOARD ROUTE
# ==========================

@app.get("/dashboard", response_model=schemas.DashboardResponse)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """
    Get dashboard summary: total income, total expense, balance, and recent expenses.
    Protected route — requires JWT token.
    """
    return crud.get_dashboard_summary(db=db, user_id=current_user.id)