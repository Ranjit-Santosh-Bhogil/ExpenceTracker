# backend/app/dependencies.py

from .database import get_db
from .auth import get_current_user

# Re-export these dependencies so routes can import them from a single location
# Example usage in a route:
#   from dependencies import get_db, get_current_user
#   def my_route(db: Session = Depends(get_db), user = Depends(get_current_user)):