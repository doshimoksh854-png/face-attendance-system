from app.extensions import db
from datetime import datetime

class Attendance(db.Model):
    __tablename__ = 'attendance'

    id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey('attendance_sessions.id'), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    status = db.Column(db.String(20), default='present') # present, late, excused
    confidence_score = db.Column(db.Float) # Face matching confidence
    
    # Ensure a student can only mark attendance once per session
    __table_args__ = (db.UniqueConstraint('session_id', 'student_id', name='_session_student_uc'),)

    def to_dict(self):
        # Get class info through session relationship
        class_info = None
        if self.session and self.session.class_obj:
            class_info = {
                'name': self.session.class_obj.name,
                'code': self.session.class_obj.code
            }
        
        return {
            'id': self.id,
            'session_id': self.session_id,
            'student_id': self.student_id,
            'student_name': self.student.full_name if hasattr(self, 'student') else None,
            'timestamp': self.timestamp.isoformat(),
            'status': self.status,
            'confidence_score': self.confidence_score,
            'class': class_info
        }
