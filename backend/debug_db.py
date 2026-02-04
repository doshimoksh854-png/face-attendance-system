from app import create_app, db
from app.models.user import User
from app.models.class_model import Class

app = create_app()

with app.app_context():
    print("--- User Dump ---")
    users = User.query.all()
    for u in users:
        print(f"ID: {u.id} | User: {u.username} | Role: {u.role}")

    print("\n--- Class Dump ---")
    classes = Class.query.all()
    for c in classes:
        print(f"ID: {c.id} | Name: {c.name} | Code: {c.code} | Teacher: {c.teacher_id}")
