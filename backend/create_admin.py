from app import create_app, db
from app.models.user import User

app = create_app()

with app.app_context():
    username = input("Enter admin username (default: admin): ") or 'admin'
    email = input("Enter admin email (default: admin@example.com): ") or 'admin@example.com'
    password = input("Enter admin password (default: admin123): ") or 'admin123'
    
    # Check if exists
    if User.query.filter_by(username=username).first():
        print(f"❌ User '{username}' already exists!")
    else:
        admin = User(
            username=username, 
            email=email, 
            role='admin', 
            full_name='System Admin'
        )
        admin.set_password(password)
        db.session.add(admin)
        db.session.commit()
        print(f"✅ Admin user '{username}' created successfully!")
        print(f"👉 Login with: {username} / {password}")
