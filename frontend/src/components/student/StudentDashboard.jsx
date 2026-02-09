import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Container, Grid, Paper, Typography, Box, Button, TextField, List, ListItem, ListItemText, Divider, Chip, Card, CardContent, LinearProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import MarkAttendance from './MarkAttendance';
import AttendanceHistory from './AttendanceHistory';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ThemeToggle from '../common/ThemeToggle';

const StudentDashboard = () => {
  const { user, logout } = useAuth();
  const [classes, setClasses] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [classCode, setClassCode] = useState('');
  const [activeTab, setActiveTab] = useState('classes');
  const [attendanceStats, setAttendanceStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
    fetchAvailableClasses();
    fetchAttendanceStats();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes/');
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAvailableClasses = async () => {
    try {
      const res = await api.get('/classes/all');
      setAvailableClasses(res.data);
    } catch (err) {
      console.error("Failed to fetch available classes", err);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const res = await api.get('/attendance/stats');
      setAttendanceStats(res.data);
    } catch (err) {
      console.error("Failed to fetch attendance stats", err);
    }
  };

  const joinClass = async () => {
    try {
      await api.post('/classes/join', { code: classCode });
      alert("Successfully joined class!");
      setClassCode('');
      fetchClasses();
      fetchAvailableClasses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to join');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'info';
      case 'average': return 'warning';
      case 'poor': return 'error';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'excellent': return '🎯 Excellent';
      case 'good': return '✅ Good';
      case 'average': return '⚠️ Average';
      case 'poor': return '❌ Poor';
      default: return 'N/A';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">👋 Welcome, {user?.username}</Typography>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <ThemeToggle />
          <Button variant="outlined" color="error" onClick={() => { logout(); navigate('/login'); }}>Logout</Button>
        </Box>
      </Box>

      {/* Attendance Stats Card */}
      {attendanceStats && (
        <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6" gutterBottom sx={{ opacity: 0.9 }}>
                  📊 Attendance Overview
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, mt: 2 }}>
                  <Box>
                    <Typography variant="h3" fontWeight="bold">
                      {attendanceStats.percentage}%
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Overall Attendance
                    </Typography>
                  </Box>
                  <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />
                  <Box>
                    <Typography variant="h4">
                      {attendanceStats.attended}/{attendanceStats.total_classes}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                      Classes Attended
                    </Typography>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Chip
                  label={getStatusLabel(attendanceStats.status)}
                  color={getStatusColor(attendanceStats.status)}
                  size="large"
                  sx={{ fontSize: '1.1rem', py: 3, px: 2 }}
                />
              </Box>
            </Box>
            <Box sx={{ mt: 2 }}>
              <LinearProgress
                variant="determinate"
                value={attendanceStats.percentage}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  bgcolor: 'rgba(255,255,255,0.3)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor: attendanceStats.percentage >= 75 ? '#4caf50' : '#f44336'
                  }
                }}
              />
              <Typography variant="caption" sx={{ mt: 0.5, display: 'block', opacity: 0.8 }}>
                {attendanceStats.percentage >= 75 ? '✅ You are meeting attendance requirements (≥75%)' : '⚠️ Warning: Below required attendance (75%)'}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        {/* Sidebar / Menu */}
        <Grid item xs={12} md={3}>
          <Paper sx={{ p: 2 }}>
            <List component="nav">
              <ListItem button selected={activeTab === 'classes'} onClick={() => setActiveTab('classes')}>
                <ListItemText primary="My Classes" />
              </ListItem>
              <ListItem button selected={activeTab === 'mark'} onClick={() => setActiveTab('mark')}>
                <ListItemText primary="Mark Attendance" />
              </ListItem>
              <ListItem button selected={activeTab === 'history'} onClick={() => setActiveTab('history')}>
                <ListItemText primary="Attendance History" />
              </ListItem>
              <ListItem button onClick={() => navigate('/face-register')}>
                <ListItemText
                  primary={user.has_face_encoding ? "🔄 Update Face" : "⚠️ Register Face"}
                  sx={{ color: user.has_face_encoding ? 'primary.main' : 'warning.main' }}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Content Area */}
        <Grid item xs={12} md={9}>
          {activeTab === 'classes' && (
            <Paper sx={{ p: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>Join a Class</Typography>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <TextField
                    label="Enter Class Code"
                    size="small"
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value)}
                  />
                  <Button variant="contained" onClick={joinClass}>Join by Code</Button>
                </Box>

                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>Available Classes to Join</Typography>
                <List>
                  {availableClasses.map((c) => (
                    <ListItem key={c.id}>
                      <ListItemText primary={c.name} secondary={`${c.description || ''} (Code: ${c.code})`} />
                      {classes.some(enrolled => enrolled.id === c.id) ? (
                        <Chip label="Enrolled" color="success" size="small" />
                      ) : (
                        <Button size="small" variant="outlined" onClick={() => { setClassCode(c.code); }}>
                          Select
                        </Button>
                      )}
                    </ListItem>
                  ))}
                  {availableClasses.length === 0 && <Typography variant="body2" color="textSecondary">No classes found.</Typography>}
                </List>
              </Box>

              <Typography variant="h6" gutterBottom>My Enrolled Classes</Typography>
              <List>
                {classes.map((c) => (
                  <div key={c.id}>
                    <ListItem>
                      <ListItemText primary={c.name} secondary={c.description} />
                      <Chip label={c.code} color="primary" variant="outlined" />
                    </ListItem>
                    <Divider />
                  </div>
                ))}
                {classes.length === 0 && <Typography color="textSecondary">No classes joined yet.</Typography>}
              </List>
            </Paper>
          )}

          {activeTab === 'mark' && <MarkAttendance classes={classes} />}

          {activeTab === 'history' && <AttendanceHistory />}
        </Grid>
      </Grid>
    </Container>
  );
};

export default StudentDashboard;
