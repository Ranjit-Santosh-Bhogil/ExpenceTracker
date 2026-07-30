# backend/app/crud.py

from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from typing import Optional
import models
import schemas
import auth


# ==========================
# USER CRUD
# ==========================

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """
    Finds a user by their email address.
    Returns None if no user is found.
    Used during login and registration to check if email already exists.
    """
    return db.query(models.User).filter(models.User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> Optional[models.User]:
    """
    Finds a user by their ID.
    Used when we need to verify a user from a JWT token.
    """
    return db.query(models.User).filter(models.User.id == user_id).first()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """
    Creates a new user in the database.
    Hashes the password before storing it — NEVER store plain text passwords.
    """
    hashed_password = auth.hash_password(user.password)
    
    db_user = models.User(
        name=user.name,
        email=user.email,
        hashed_password=hashed_password
    )
    
    db.add(db_user)      # Stage the new user for insertion
    db.commit()          # Actually save it to the database
    db.refresh(db_user)  # Refresh to get the auto-generated ID
    return db_user


# ==========================
# EXPENSE CRUD
# ==========================

def get_expenses(
    db: Session,
    user_id: int,
    search: Optional[str] = None,
    category: Optional[str] = None,
    sort_by: Optional[str] = "date"
) -> list[models.Expense]:
    """
    Retrieves all expenses for a specific user with optional filtering and sorting.
    - search: filters by title (case-insensitive partial match)
    - category: filters by exact category match
    - sort_by: sorts results, default is by date descending (newest first)
    """
    query = db.query(models.Expense).filter(models.Expense.user_id == user_id)
    
    # Apply search filter if provided
    if search:
        query = query.filter(models.Expense.title.ilike(f"%{search}%"))
    
    # Apply category filter if provided
    if category:
        query = query.filter(models.Expense.category == category)
    
    # Apply sorting
    if sort_by == "date":
        query = query.order_by(models.Expense.date.desc())
    elif sort_by == "amount":
        query = query.order_by(models.Expense.amount.desc())
    elif sort_by == "title":
        query = query.order_by(models.Expense.title.asc())
    
    return query.all()


def get_expense_by_id(db: Session, expense_id: int, user_id: int) -> Optional[models.Expense]:
    """
    Finds a specific expense by ID, but only if it belongs to the given user.
    This ensures users cannot access other users' expenses.
    """
    return db.query(models.Expense).filter(
        models.Expense.id == expense_id,
        models.Expense.user_id == user_id
    ).first()


def create_expense(db: Session, expense: schemas.ExpenseCreate, user_id: int) -> models.Expense:
    """
    Creates a new expense for a user.
    """
    db_expense = models.Expense(
        title=expense.title,
        amount=expense.amount,
        category=expense.category,
        date=expense.date,
        description=expense.description,
        user_id=user_id
    )
    
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense


def update_expense(
    db: Session,
    expense_id: int,
    user_id: int,
    expense_update: schemas.ExpenseUpdate
) -> Optional[models.Expense]:
    """
    Updates an existing expense.
    Only updates the fields that were provided (partial update support).
    Returns the updated expense or None if not found.
    """
    db_expense = get_expense_by_id(db, expense_id, user_id)
    if not db_expense:
        return None
    
    # Update only the fields that were sent in the request
    update_data = expense_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_expense, field, value)
    
    db.commit()
    db.refresh(db_expense)
    return db_expense


def delete_expense(db: Session, expense_id: int, user_id: int) -> bool:
    """
    Deletes an expense by ID.
    Returns True if deleted, False if the expense was not found.
    """
    db_expense = get_expense_by_id(db, expense_id, user_id)
    if not db_expense:
        return False
    
    db.delete(db_expense)
    db.commit()
    return True


# ==========================
# INCOME CRUD
# ==========================

def get_income(db: Session, user_id: int) -> list[models.Income]:
    """
    Retrieves all income entries for a specific user, sorted by date (newest first).
    """
    return db.query(models.Income).filter(
        models.Income.user_id == user_id
    ).order_by(models.Income.date.desc()).all()


def create_income(db: Session, income: schemas.IncomeCreate, user_id: int) -> models.Income:
    """
    Creates a new income entry for a user.
    """
    db_income = models.Income(
        title=income.title,
        amount=income.amount,
        date=income.date,
        user_id=user_id
    )
    
    db.add(db_income)
    db.commit()
    db.refresh(db_income)
    return db_income


# ==========================
# DASHBOARD CRUD
# ==========================

def get_dashboard_summary(db: Session, user_id: int) -> dict:
    """
    Calculates dashboard statistics for a user:
    - Total income (sum of all income amounts)
    - Total expense (sum of all expense amounts)
    - Current balance (income - expense)
    - Recent expenses (last 5 expenses)
    """
    # Calculate total income using SQL SUM aggregation
    total_income = db.query(func.sum(models.Income.amount)).filter(
        models.Income.user_id == user_id
    ).scalar() or 0  # Returns 0 if no income exists
    
    # Calculate total expense using SQL SUM aggregation
    total_expense = db.query(func.sum(models.Expense.amount)).filter(
        models.Expense.user_id == user_id
    ).scalar() or 0  # Returns 0 if no expenses exist
    
    # Calculate balance
    current_balance = total_income - total_expense
    
    # Get the 5 most recent expenses
    recent_expenses = db.query(models.Expense).filter(
        models.Expense.user_id == user_id
    ).order_by(models.Expense.date.desc()).limit(5).all()
    
    return {
        "total_income": total_income,
        "total_expense": total_expense,
        "current_balance": current_balance,
        "recent_expenses": recent_expenses
    }