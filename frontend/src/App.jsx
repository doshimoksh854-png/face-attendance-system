import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
// import Dashboard from './components/Dashboard'; 
// We will create specific dashboards
import StudentDashboard from './components/student/StudentDashboard';
import TeacherDashboard from './components/teacher/TeacherDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import FaceRegistration from './components/auth/FaceRegistration';
import { CircularProgress, Box } from '@mui/material';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/face-register" element={
          <PrivateRoute roles={['student', 'teacher', 'admin']}>
            <FaceRegistration />
          </PrivateRoute>
        } />

        <Route path="/student/*" element={
          <PrivateRoute roles={['student']}>
            <StudentDashboard />
          </PrivateRoute>
        } />

        <Route path="/teacher/*" element={
          <PrivateRoute roles={['teacher']}>
            <TeacherDashboard />
          </PrivateRoute>
        } />

        <Route path="/admin/*" element={
          <PrivateRoute roles={['admin']}>
            <AdminDashboard />
          </PrivateRoute>
        } />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
