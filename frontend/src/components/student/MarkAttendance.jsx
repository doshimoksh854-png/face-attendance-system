import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import api from '../../services/api';
import { Button, Typography, Box, Alert, Select, MenuItem, FormControl, InputLabel, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';

const MarkAttendance = ({ classes }) => {
  const webcamRef = useRef(null);
  const [selectedClass, setSelectedClass] = useState('');
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [imgSrc, setImgSrc] = useState(null);
  const [alreadyMarked, setAlreadyMarked] = useState(false);

  const checkActiveSession = async (classId) => {
    try {
      const res = await api.get(`/classes/${classId}/sessions/active`);
      setSession(res.data);
      setError('');

      // Check if attendance is already marked for this session
      if (res.data && res.data.id) {
        checkAttendanceStatus(res.data.id);
      }
    } catch (err) {
      setSession(null);
      setAlreadyMarked(false);
      setError('No active session for this class.');
    }
  };

  const checkAttendanceStatus = async (sessionId) => {
    try {
      // Check attendance history to see if already marked for this session
      const historyRes = await api.get('/attendance/history');
      const markedInSession = historyRes.data.some(record => record.session_id === sessionId);
      setAlreadyMarked(markedInSession);

      if (markedInSession) {
        setError('');
        setMessage('✅ Attendance already marked for this session!');
        toast.info('You have already marked attendance for this session.', {
          position: "top-center",
          autoClose: 4000,
        });
      }
    } catch (err) {
      console.error('Error checking attendance status:', err);
      setAlreadyMarked(false);
    }
  };

  const handleClassChange = (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    checkActiveSession(classId);
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  const submitAttendance = async () => {
    if (!imgSrc || !session) return;
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const base64Response = await fetch(imgSrc);
      const blob = await base64Response.blob();
      const formData = new FormData();
      formData.append('image', blob, 'attendance.jpg');
      formData.append('session_id', session.id);

      const res = await api.post('/attendance/mark', formData, {
        headers: {
          'Content-Type': undefined,
        },
      });
      const confVal = res.data.confidence;
      // Always show percentage if we got a number (including 0), only show 'Validated' if truly missing
      const confText = (typeof confVal === 'number' && !isNaN(confVal))
        ? `${(confVal * 100).toFixed(1)}%`
        : 'Validated';
      const successMsg = `Attendance marked successfully! Confidence: ${confText}`;
      setMessage(successMsg);
      toast.success(successMsg, {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
      });
      setImgSrc(null); // Reset image after successful submission
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Verification failed';
      setError(errorMsg);

      // Show specific toast notification for face recognition failures
      if (errorMsg.toLowerCase().includes('face mismatch') ||
        errorMsg.toLowerCase().includes('not recognized') ||
        errorMsg.toLowerCase().includes('verification failed')) {
        toast.error('❌ Face Not Recognized! Please ensure your face is clearly visible and try again.', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      } else if (errorMsg.toLowerCase().includes('no face detected')) {
        toast.warning('⚠️ No Face Detected! Please position your face in the camera frame.', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
        });
      } else if (errorMsg.toLowerCase().includes('already marked')) {
        toast.info('ℹ️ ' + errorMsg, {
          position: "top-center",
          autoClose: 4000,
        });
      } else {
        toast.error('❌ ' + errorMsg, {
          position: "top-center",
          autoClose: 5000,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
      <Typography variant="h5" gutterBottom>Mark Attendance</Typography>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Select Class</InputLabel>
        <Select value={selectedClass} label="Select Class" onChange={handleClassChange}>
          {classes.map((c) => (
            <MenuItem key={c.id} value={c.id}>{c.name} ({c.code})</MenuItem>
          ))}
        </Select>
      </FormControl>

      {error && <Alert severity={session ? "error" : "info"} sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}

      {session && (
        <Box>
          <Alert severity="success" sx={{ mb: 2 }}>Session Active! Started at {new Date(session.start_time).toLocaleTimeString()}</Alert>

          {alreadyMarked ? (
            <Box sx={{ mt: 3, p: 3, bgcolor: 'success.light', borderRadius: 2 }}>
              <Typography variant="h6" color="success.dark" gutterBottom>
                ✅ Attendance Completed
              </Typography>
              <Typography variant="body1" color="text.secondary">
                You have already marked your attendance for this session.
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                You cannot mark attendance twice for the same lecture.
              </Typography>
            </Box>
          ) : !imgSrc ? (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                videoConstraints={{ facingMode: "user" }}
              />
              <Button variant="contained" onClick={capture} sx={{ mt: 2 }}>
                Capture
              </Button>
            </>
          ) : (
            <>
              <img src={imgSrc} alt="capture" style={{ width: '100%', borderRadius: 4 }} />
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button variant="outlined" onClick={() => setImgSrc(null)}>Retake</Button>
                <Button variant="contained" color="success" onClick={submitAttendance} disabled={loading}>
                  {loading ? <CircularProgress size={24} /> : 'Submit Attendance'}
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}
    </Box>
  );
};

export default MarkAttendance;
