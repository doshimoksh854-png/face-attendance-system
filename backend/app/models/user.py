from app.extensions import db
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(64), index=True, unique=True, nullable=False)
    email = db.Column(db.String(120), index=True, unique=True, nullable=False)
    password_hash = db.Column(db.String(128))
    role = db.Column(db.String(20), nullable=False, default='student') # student, teacher, admin
    full_name = db.Column(db.String(100))
    face_encoding = db.Column(db.PickleType, nullable=True) # Store face encoding as pickled object
    face_update_allowed = db.Column(db.Boolean, default=False)  # Admin permission to update face
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_active = db.Column(db.Boolean, default=True)

    # Relationships
    classes_teaching = db.relationship('Class', backref='teacher', lazy='dynamic')
    attendances = db.relationship('Attendance', backref='student', lazy='dynamic')
    
    # Many-to-Many for students joining classes
    enrolled_classes = db.relationship('Class', secondary='student_classes', backref=db.backref('students', lazy='dynamic'))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'role': self.role,
            'full_name': self.full_name,
            'has_face_encoding': self.face_encoding is not None,
            'face_update_allowed': self.face_update_allowed,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat()
        }
