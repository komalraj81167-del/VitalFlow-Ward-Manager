from backend.database.connection import engine
from backend.database.db_models import Base

print("Creating database tables...")

Base.metadata.create_all(bind=engine)

print("Database tables created successfully!")