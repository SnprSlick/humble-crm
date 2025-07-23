from app.core.database import engine
from app.models.todo import Base

Base.metadata.drop_all(bind=engine)
Base.metadata.create_all(bind=engine)