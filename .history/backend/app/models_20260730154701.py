# backend/app/models.py

from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class User(Base):
    """
    Represents a user in the database.
    One user can have many expenses and many income entries.
    """
    __tablename__ = "users"  # The actual table name in SQLite

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Relationship: A user has many expenses
    # "Expense" is a string because the class is defined below
    # cascade="all, delete-orphan" means if a user is deleted, all their expenses are deleted too
    expenses = relationship("Expense", back_populates="owner", cascade="all, delete-orphan")

    # Relationship: A user has many income entries
    income = relationship("Income", back_populates="owner", cascade="all, delete-orphan")


class Expense(Base):
    """
    Represents an expense entry in the database.
    Each expense belongs to exactly one user.
    """
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    description = Column(String, nullable=True)
    
    # Foreign key: links this expense to a user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationship: links back to the User who owns this expense
    owner = relationship("User", back_populates="expenses")


class Income(Base):
    """
    Represents an income entry in the database.
    Each income belongs to exactly one user.
    """
    __tablename__ = "income"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Foreign key: links this income to a user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Relationship: links back to the User who owns this income
    owner = relationship("User", back_populates="income")