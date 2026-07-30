# # backend/app/database.py

# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker, declarative_base

# # SQLite database URL — creates a file named "expense_tracker.db" in the backend folder
# SQLALCHEMY_DATABASE_URL = "sqlite:///./expense_tracker.db"

# # Create the database engine
# # check_same_thread=False is required for SQLite to work properly with FastAPI's async behavior
# engine = create_engine(
#     SQLALCHEMY_DATABASE_URL, 
#     connect_args={"check_same_thread": False}
# )

# # SessionLocal is a factory that creates new database sessions
# # autocommit=False means changes are NOT saved automatically — you must call db.commit()
# # autoflush=False means SQLAlchemy won't automatically send queries to the DB before you ask
# SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# # Base class for all your models (User, Expense, Income)
# # Every model class will inherit from this Base
# Base = declarative_base()


# def get_db():
#     """
#     Dependency function that provides a database session to API routes.
#     It creates a session, yields it to the route, and closes it afterward.
#     This ensures no database connections are left hanging.
#     """
#     db = SessionLocal()
#     try:
#         yield db  # Give the session to the route
#     finally:
#         db.close()  # Always close the session, even if an error occurs


# backend/app/database.py

import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Read database URL from environment variable
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL")

# Create the database engine for PostgreSQL
# Neon (and most cloud PostgreSQL) requires SSL - it's included in the URL via ?sslmode=require
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# SessionLocal is a factory that creates new database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for all your models
Base = declarative_base()


def get_db():
    """
    Dependency function that provides a database session to API routes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()