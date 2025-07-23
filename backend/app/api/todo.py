from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.todo import ToDo
from pydantic import BaseModel
from datetime import datetime

router = APIRouter()

class ToDoCreate(BaseModel):
    text: str

@router.get("/todos")
def get_todos(db: Session = Depends(get_db)):
    return db.query(ToDo).order_by(ToDo.id.desc()).all()

@router.post("/todos")
def create_todo(payload: ToDoCreate, db: Session = Depends(get_db)):
    todo = ToDo(text=payload.text)
    db.add(todo)
    db.commit()
    db.refresh(todo)
    return todo

@router.put("/todos/{todo_id}")
def update_todo(todo_id: int, done: bool, db: Session = Depends(get_db)):
    todo = db.query(ToDo).get(todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="ToDo not found")

    todo.done = done
    todo.completed_at = datetime.utcnow() if done else None

    db.commit()
    return todo

@router.delete("/todos/{todo_id}")
def delete_todo(todo_id: int, db: Session = Depends(get_db)):
    todo = db.query(ToDo).get(todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="ToDo not found")
    db.delete(todo)
    db.commit()
    return {"ok": True}
