from app import create_app, db
from app.models.user import User
from app.models.class_model import Class
from app.models.attendance import Attendance

app = create_app()

@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Class': Class, 'Attendance': Attendance}

if __name__ == '__main__':
    app.run(debug=True, port=5000)
