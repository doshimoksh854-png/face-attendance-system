from flask import Blueprint, request, jsonify
from app.models.user import User
from app.models.class_model import AttendanceSession
from app.models.attendance import Attendance
from app.extensions import db
from flask_jwt_extended import jwt_required, get_jwt_identity
import os
import uuid
from app.config import Config
from app.services.face_recognition_service import FaceRecognitionService
from datetime import datetime
import math

bp = Blueprint('attendance', __name__, url_prefix='/api/attendance')

@bp.route('/mark', methods=['POST'])
@jwt_required()
def mark_attendance():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user.face_encoding:
        return jsonify({'message': 'Face not registered. Please register face first.'}), 400

    data = request.form
    session_id = data.get('session_id')
    
    session = AttendanceSession.query.get_or_404(session_id)
    if not session.is_active:
        return jsonify({'message': 'Session is not active'}), 400
        
    # Check if already marked
    existing = Attendance.query.filter_by(session_id=session_id, student_id=user.id).first()
    if existing:
        return jsonify({'message': 'Attendance already marked'}), 200

    if 'image' not in request.files:
        return jsonify({'message': 'No image provided'}), 400
        
    file = request.files['image']
    filename = f"{uuid.uuid4()}.jpg"
    filepath = os.path.join(Config.UPLOAD_FOLDER, filename)
    file.save(filepath)
    
    try:
        # Verify face
        is_match, distance = FaceRecognitionService.verify_face(filepath, user.face_encoding)
        os.remove(filepath)
        
        print(f"DEBUG: verify_face result: match={is_match}, distance={distance}, type={type(distance)}")

        if is_match:
            if distance is None or (isinstance(distance, float) and math.isnan(distance)):
                confidence = 0.0
            else:
                confidence = float(1 - distance)
            
            # Ensure proper range
            confidence = max(0.0, min(1.0, confidence))

            attendance = Attendance(
                session_id=session_id,
                student_id=user.id,
                status='present',
                confidence_score=confidence
            )
            db.session.add(attendance)
            db.session.commit()
            return jsonify({'message': 'Attendance marked successfully', 'confidence': confidence}), 200
        else:
            # Return a clear, user-friendly error message that triggers the popup
            dist_value = float(distance) if distance and not math.isnan(distance) else 0.0
            return jsonify({
                'message': 'Face not recognized. Please ensure your face is clearly visible and matches your registered profile.',
                'distance': dist_value
            }), 401
            
    except ValueError as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({'message': str(e)}), 400
    except Exception as e:
        if os.path.exists(filepath):
            os.remove(filepath)
        return jsonify({'message': f'Error processing face: {str(e)}'}), 500

@bp.route('/history', methods=['GET'])
@jwt_required()
def get_history():
    current_user_id = get_jwt_identity()
    attendances = Attendance.query.filter_by(student_id=int(current_user_id)).order_by(Attendance.timestamp.desc()).all()
    return jsonify([a.to_dict() for a in attendances]), 200

@bp.route('/stats', methods=['GET'])
@jwt_required()
def get_attendance_stats():
    current_user_id = get_jwt_identity()
    user = User.query.get(int(current_user_id))
    
    if not user:
        return jsonify({'message': 'User not found'}), 404
        
    # Calculate total sessions for classes the student is enrolled in
    total_sessions = 0
    now = datetime.utcnow()
    
    for enrolled_class in user.enrolled_classes:
        # Count sessions that have already started
        class_sessions_count = enrolled_class.sessions.filter(AttendanceSession.start_time <= now).count()
        total_sessions += class_sessions_count
    
    if total_sessions == 0:
        return jsonify({
            'total_classes': 0,
            'attended': 0,
            'percentage': 0.0,
            'status': 'No classes yet'
        }), 200
    
    # Count present records (status = 'present')
    present_records = Attendance.query.filter_by(
        student_id=int(current_user_id),
        status='present'
    ).count()
    
    # Calculate percentage
    percentage = round((present_records / total_sessions) * 100, 2)
    
    # Determine status based on percentage
    if percentage >= 85:
        status = 'excellent'
    elif percentage >= 75:
        status = 'good'
    elif percentage >= 60:
        status = 'average'
    else:
        status = 'poor'
    
    return jsonify({
        'total_classes': total_sessions,
        'attended': present_records,
        'percentage': percentage,
        'status': status
    }), 200

