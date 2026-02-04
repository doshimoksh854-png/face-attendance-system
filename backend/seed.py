from app import create_app, db
from app.models.user import User
from app.models.class_model import Class
import secrets

app = create_app()

with app.app_context():
    print("🌱 Seeding database...")
    
    # Create Teacher
    teacher = User.query.filter_by(username='teacher1').first()
    if not teacher:
        teacher = User(username='teacher1', email='teacher1@example.com', role='teacher', full_name='Prof. Smith')
        teacher.set_password('password123')
        db.session.add(teacher)
        print("✅ Created Teacher: teacher1 / password123")
    else:
        print("ℹ️ Teacher already exists")

    db.session.commit() # Commit to get ID

    # Create Class
    if teacher:
        my_class = Class.query.filter_by(name='Computer Science 101').first()
        if not my_class:
            my_class = Class(
                name='Computer Science 101', 
                code='CS101', 
                description='Intro to Algorithms', 
                teacher_id=teacher.id
            )
            db.session.add(my_class)
            print(f"✅ Created Class: CS101 (Code: CS101)")
        else:
            print(f"ℹ️ Class CS101 already exists (Code: {my_class.code})")

    db.session.commit()
    print("🌱 Seeding complete!")
