# backend/app/auth.py

from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db
import models
import schemas

# ==========================
# CONFIGURATION
# ==========================

# Secret key used to sign JWT tokens
# In production, use a strong random string and store it in environment variables
SECRET_KEY = "your-secret-key-change-this-in-production"
ALGORITHM = "HS256"  # The signing algorithm
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # Token expires after 24 hours

# Password hashing context
# bcrypt is the industry standard for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2 scheme — tells FastAPI to expect a Bearer token in the Authorization header
# tokenUrl is the endpoint where clients send username/password to get a token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# ==========================
# PASSWORD FUNCTIONS
# ==========================

def hash_password(password: str) -> str:
    """
    Takes a plain text password and returns a hashed version.
    The hashed version is what we store in the database.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Compares a plain text password with a hashed password.
    Returns True if they match, False otherwise.
    """
    return pwd_context.verify(plain_password, hashed_password)


# ==========================
# JWT TOKEN FUNCTIONS
# ==========================

def create_access_token(data: dict, expires_delta: timedelta = None):
    """
    Creates a JWT access token.
    'data' usually contains {"sub": user_id}
    'sub' (subject) is a JWT standard claim that identifies the user.
    """
    to_encode = data.copy()
    
    # Set expiration time
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})  # Add expiration to the payload
    
    # Encode the data into a JWT string using the secret key
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# ==========================
# CURRENT USER DEPENDENCY
# ==========================

def get_current_user(
    token: str = Depends(oauth2_scheme),  # Extract token from Authorization header
    db: Session = Depends(get_db)         # Get database session
) -> models.User:
    """
    Decodes the JWT token, finds the user in the database, and returns the user object.
    This function is used as a dependency in protected routes.
    If the token is invalid or expired, it raises a 401 Unauthorized error.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Extract user_id from the 'sub' claim
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        
        token_data = schemas.TokenData(user_id=int(user_id))
    
    except JWTError:
        # Token is invalid or expired
        raise credentials_exception
    
    # Find the user in the database
    user = db.query(models.User).filter(models.User.id == token_data.user_id).first()
    if user is None:
        raise credentials_exception
    
    return user