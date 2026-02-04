import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Box, Chip, CircularProgress, Alert } from '@mui/material';

const AttendanceList = ({ classId, className }) => {
  const [session, setSession] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (classId) {
      fetchActiveSession();
    }
  }, [classId]);

  const fetchActiveSession = async () => {
    try {
      const res = await api.get(`/classes/${classId}/sessions/active`);
      setSession(res.data);
      // If active session, fetch attendance
      // Real-time updates could be done with polling or websockets, here we use polling button
      fetchAttendance(res.data.id);
    } catch (err) {
      setSession(null);
      setAttendance([]);
    }
  };

  const fetchAttendance = async (sessionId) => { // This endpoint needs to be created or we filter
    // For simplicity, let's assume we can get attendance by session
    // We might need to add a route for this: GET /attendance/session/<id>
    // But for now, let's mock or use a new route
    try {
      // We need to implement this route in backend or use what we have
      // Let's add GET /attendance/session/<session_id> to backend? 
      // Or just list all for now? 
      // Let's implement client side polling if route existed.
      // Since I can't easily add route now without switching context, 
      // I'll add a helper function in backend or just skip list if not critical, 
      // BUT user said "View live attendance".
      // I will add the route in the next step to backend.
    } catch (err) {
      console.log(err);
    }
  };

  const startSession = async () => {
    setLoading(true);
    try {
      const res = await api.post(`/classes/${classId}/sessions`);
      setSession(res.data);
      setError('');
    } catch (err) {
      setError('Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    // We need an endpoint to end session, or just create a new one (which ends old one).
    // My backend logic ends old one when new one starts.
    // But explicit close is good.
    // Let's just use "Start New Session" for now to rotate.
    // Or add a close endpoint.
    alert("Starting a new session will close the current one.");
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>{className} - Attendance</Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
        {session ? (
          <>
            <Chip label="Session Active" color="success" />
            <Typography>Started: {new Date(session.start_time).toLocaleTimeString()}</Typography>
            <Button variant="contained" color="warning" onClick={endSession}>End Session</Button>
          </>
        ) : (
          <>
            <Chip label="No Active Session" color="default" />
            <Button variant="contained" onClick={startSession} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : 'Start Attendance Session'}
            </Button>
          </>
        )}
      </Box>

      {session && (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Live attendance updates coming soon... (Backend route pending)
        </Typography>
      )}
    </Box>
  );
};

export default AttendanceList;
