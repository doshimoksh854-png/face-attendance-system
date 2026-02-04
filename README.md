# 🎓 Smart Face Attendance System

A modern, automated attendance management system using facial recognition technology. This system eliminates manual attendance tracking by leveraging real-time face recognition to mark student attendance efficiently and securely.

![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
![Flask](https://img.shields.io/badge/Flask-2.0+-green.svg)
![React](https://img.shields.io/badge/React-18.2-61DAFB.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## 🌟 Features

### For Students
- **Face Registration**: One-time secure face enrollment with admin-controlled update requests
- **Quick Attendance**: Mark attendance using facial recognition in seconds
- **Attendance History**: View personal attendance records and statistics
- **Face Update Requests**: Request permission from admin to update registered face

### For Teachers
- **Class Management**: Create and manage multiple classes
- **Session Control**: Start/stop attendance sessions with ease
- **Real-time Monitoring**: View attendance records as students mark their presence
- **Student Analytics**: Track attendance patterns and identify low-attendance students

### For Admins
- **Face Update Control**: Review and approve/deny student face update requests
- **User Management**: Manage student and teacher accounts
- **System Administration**: Full control over the system

### Technical Features
- **Real-time Face Recognition**: Powered by DeepFace library with high accuracy
- **Cosine Similarity Matching**: Advanced algorithm for face verification (threshold < 0.4)
- **Role-based Access Control**: Separate dashboards for students, teachers, and admins
- **Secure Authentication**: JWT-based authentication system
- **Session Management**: Attendance restricted to active class sessions
- **RESTful API**: Clean API architecture for scalability

## 🛠️ Technology Stack

### Frontend
- **React 18.2** - Modern UI library
- **Vite** - Fast build tool and development server
- **Material-UI (MUI)** - Professional component library
- **Axios** - HTTP client for API communication
- **React Router** - Client-side routing
- **React Webcam** - Camera integration for face capture
- **React Toastify** - User notifications

### Backend
- **Flask** - Lightweight Python web framework
- **SQLAlchemy** - ORM for database management
- **Flask-JWT-Extended** - JWT authentication
- **DeepFace** - Face recognition and analysis
- **Flask-CORS** - Cross-origin resource sharing
- **Flask-Migrate** - Database migrations
- **TensorFlow/Keras** - Deep learning backend for DeepFace

### Database
- **SQLite** - Relational database for development
- Easily adaptable to PostgreSQL/MySQL for production

## 📋 Prerequisites

Before running this project, ensure you have:

- **Python 3.8+** installed
- **Node.js 16+** and npm installed
- **Git** for version control
- **Webcam** for face capture functionality

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/face-attendance-system.git
cd face-attendance-system
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize database
flask db upgrade

# Seed database (creates sample class and teacher)
python seed.py
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install
```

### 4. Running the Application

#### Option A: Run Both Services Separately

**Terminal 1 - Backend:**
```bash
cd backend
python run.py
```
The backend will run on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

#### Option B: Use the Automated Runner (Recommended)

```bash
# From project root directory
python run_system.py
```
Choose option 1 to seed database (first time only), then run option 2 to start both services.

## 📁 Project Structure

```
face-attendance-system/
├── backend/
│   ├── app/
│   │   ├── models/           # Database models
│   │   │   ├── user.py
│   │   │   ├── class_model.py
│   │   │   ├── attendance.py
│   │   │   └── face_update_request.py
│   │   ├── routes/           # API endpoints
│   │   │   ├── auth_routes.py
│   │   │   ├── attendance_routes.py
│   │   │   ├── class_routes.py
│   │   │   └── admin_routes.py
│   │   ├── services/         # Business logic
│   │   │   └── face_recognition_service.py
│   │   ├── config.py         # Configuration
│   │   └── __init__.py
│   ├── migrations/           # Database migrations
│   ├── instance/             # SQLite database
│   ├── requirements.txt      # Python dependencies
│   ├── run.py               # Application entry point
│   └── seed.py              # Database seeding script
│
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── auth/         # Login, Register, FaceRegistration
│   │   │   ├── student/      # Student Dashboard, MarkAttendance
│   │   │   ├── teacher/      # Teacher Dashboard, CreateClass
│   │   │   └── admin/        # Admin Dashboard
│   │   ├── context/          # React Context (AuthContext)
│   │   ├── services/         # API service layer
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
│
├── run_system.py            # Automated startup script
├── kill_ports.py            # Port management utility
├── README.md                # This file
└── .gitignore
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
SECRET_KEY=your-secret-key-here
JWT_SECRET_KEY=your-jwt-secret-key-here
DATABASE_URI=sqlite:///instance/attendance.db
FLASK_ENV=development
```

### DeepFace Models

On first run, DeepFace will download required models (VGG-Face, etc.). This is a one-time process and may take a few minutes.

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest
```

### Test DeepFace Integration
```bash
cd backend
python test_deepface.py
```

## 📊 Database Schema

### Users Table
- id, email, password_hash, name, role (student/teacher/admin)
- face_encoding (stores facial embeddings)
- has_registered_face, can_update_face

### Classes Table
- id, name, code, teacher_id
- is_active (session status)

### Attendance Table
- id, student_id, class_id, timestamp
- marked_at (datetime of attendance marking)

### FaceUpdateRequest Table
- id, student_id, status (pending/approved/denied)
- requested_at, reviewed_at

## 🔐 Security Features

- **Password Hashing**: Werkzeug's secure password hashing
- **JWT Tokens**: Secure stateless authentication
- **Face Encoding Storage**: Only stores embeddings, not raw images
- **Role-based Authorization**: Route protection based on user roles
- **Admin Approval System**: Face updates require admin approval
- **CORS Configuration**: Controlled cross-origin access

## 🎯 How Face Recognition Works

1. **Registration Phase**:
   - Student captures face using webcam
   - DeepFace extracts 128-dimensional facial embedding
   - Embedding stored securely in database

2. **Verification Phase**:
   - Student captures live photo during attendance
   - System generates new embedding from captured image
   - Calculates cosine distance between stored and live embeddings
   - If distance < 0.4 (threshold), identity verified ✅
   - Attendance marked with timestamp

3. **Face Update Control**:
   - Students can only register face once initially
   - To update face, must request admin permission
   - Admin reviews and approves/denies request
   - Once approved, student can update face one time
   - Permission resets after update

## 🐛 Troubleshooting

### Common Issues

**Issue**: "Subject must be a string" error
- **Solution**: JWT library requires user ID as string. Already handled in code.

**Issue**: "No image provided" error
- **Solution**: Ensure proper multipart/form-data handling. Let browser set Content-Type headers automatically.

**Issue**: DeepFace model download fails
- **Solution**: Check internet connection. Models need to download on first run.

**Issue**: Port already in use
- **Solution**: Run `python kill_ports.py` to free up ports 5000 and 5173.

**Issue**: Face recognition accuracy low
- **Solution**: Ensure good lighting, face the camera directly, and avoid obstructions.

## 🚀 Future Enhancements

- [ ] **Liveness Detection**: Prevent spoofing using photos/videos
- [ ] **Mobile Application**: Native iOS/Android apps
- [ ] **Geofencing**: GPS-based attendance restrictions
- [ ] **Analytics Dashboard**: Visual charts and attendance trends
- [ ] **Multi-face Detection**: Mark attendance for multiple students in one photo
- [ ] **Email Notifications**: Attendance summaries and alerts
- [ ] **QR Code Sessions**: Dynamic QR codes for additional verification
- [ ] **Export Reports**: Download attendance as CSV/PDF
- [ ] **Dark Mode**: UI theme customization
- [ ] **Docker Deployment**: Containerization for easy deployment

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `POST /api/auth/register-face` - Register face encoding
- `POST /api/auth/request-face-update` - Request face update permission

### Attendance Endpoints
- `POST /api/attendance/mark` - Mark attendance with face verification
- `GET /api/attendance/history` - Get student's attendance history
- `GET /api/attendance/class/:id` - Get class attendance records

### Class Endpoints
- `POST /api/classes/create` - Create new class (teacher only)
- `GET /api/classes/my-classes` - Get teacher's classes
- `POST /api/classes/:id/toggle-session` - Start/stop attendance session

### Admin Endpoints
- `GET /api/admin/face-update-requests` - Get pending face update requests
- `POST /api/admin/face-update-requests/:id/approve` - Approve request
- `POST /api/admin/face-update-requests/:id/deny` - Deny request

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

   Moksh Doshi
- GitHub: [@doshimoksh854-png](https://github.com/doshimoksh854-png)
- Email: doshimoksh854@gmail.com
## 🙏 Acknowledgments

- **DeepFace** library for powerful face recognition capabilities
- **Material-UI** for beautiful React components
- **Flask** community for excellent documentation
- All contributors and testers

## 📞 Support

If you encounter any issues or have questions:
- Open an issue on GitHub
- Email: doshimoksh854@gmail.com

---

**⭐ Star this repository if you found it helpful!**
