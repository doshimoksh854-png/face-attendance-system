import os
from flask import Flask
from flask_cors import CORS
from .config import Config
from .extensions import db, migrate, jwt

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    # Initialize mail
    from .services.email_service import mail
    mail.init_app(app)
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        print(f"DEBUG: Invalid Token: {error}")
        return {"message": f"Invalid Token: {error}"}, 422

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        print(f"DEBUG: Missing Token: {error}")
        return {"message": "Request does not contain an access token"}, 401

    CORS(app)

    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Register blueprints
    from .routes import auth_routes, class_routes, attendance_routes, admin_routes
    app.register_blueprint(auth_routes.bp)
    app.register_blueprint(class_routes.bp)
    app.register_blueprint(attendance_routes.bp)
    app.register_blueprint(admin_routes.bp)

    @app.route('/health')
    def health_check():
        return {'status': 'healthy', 'service': 'face-attendance-backend'}

    return app
