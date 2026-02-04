from flask import Blueprint, request, jsonify
from app.models.user import User
from app.models.class_model import Class, AttendanceSession, student_classes
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
import secrets
from datetime import datetime

bp = Blueprint('classes', __name__, url_prefix='/api/classes')

@bp.route('/all', methods=['GET'])
@jwt_required()
def get_all_classes_public():
    """Get all classes so students can find them to join."""
    classes = Class.query.all()
    return jsonify([c.to_dict() for c in classes]), 200

@bp.route('/', methods=['POST'])
@jwt_required()
def create_class():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role != 'teacher' and user.role != 'admin':
        return jsonify({'message': 'Unauthorized'}), 403
        
    data = request.get_json()
    new_class = Class(
        name=data.get('name'),
        code=secrets.token_hex(4).upper(),
        description=data.get('description'),
        teacher_id=user.id
    )
    db.session.add(new_class)
    db.session.commit()
    return jsonify(new_class.to_dict()), 201

@bp.route('/', methods=['GET'])
@jwt_required()
def get_classes():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if user.role == 'teacher':
        classes = Class.query.filter_by(teacher_id=user.id).all()
    else:
        # Students see classes they are enrolled in
        classes = user.enrolled_classes
        
    return jsonify([c.to_dict() for c in classes]), 200

@bp.route('/join', methods=['POST'])
@jwt_required()
def join_class():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    data = request.get_json()
    code = data.get('code')
    
    class_obj = Class.query.filter_by(code=code).first()
    if not class_obj:
        print(f"❌ Join Class Failed: Code '{code}' not found in DB.")
        return jsonify({'message': f"Class code '{code}' not found"}), 404
        
    if class_obj in user.enrolled_classes:
        return jsonify({'message': 'Already enrolled'}), 400
        
    user.enrolled_classes.append(class_obj)
    db.session.commit()
    return jsonify({'message': 'Joined class successfully', 'class': class_obj.to_dict()}), 200

@bp.route('/<int:class_id>/sessions', methods=['POST'])
@jwt_required()
def create_session(class_id):
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    class_obj = Class.query.get_or_404(class_id)
    
    if class_obj.teacher_id != user.id:
        return jsonify({'message': 'Unauthorized'}), 403
        
    # Deactivate other active sessions for this class
    active_sessions = AttendanceSession.query.filter_by(class_id=class_id, is_active=True).all()
    for s in active_sessions:
        s.is_active = False
        s.end_time = datetime.utcnow()
        
    session = AttendanceSession(class_id=class_id)
    db.session.add(session)
    db.session.commit()
    return jsonify(session.to_dict()), 201

@bp.route('/<int:class_id>/sessions/active', methods=['GET'])
@jwt_required()
def get_active_session(class_id):
    session = AttendanceSession.query.filter_by(class_id=class_id, is_active=True).first()
    if not session:
        return jsonify({'message': 'No active session'}), 404
    return jsonify(session.to_dict()), 200
