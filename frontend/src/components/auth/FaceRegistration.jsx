import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Button, Container, Typography, Box, Alert, Paper, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, Chip
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const FaceRegistration = () => {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  // Face update request states
  const [requiresPermission, setRequiresPermission] = useState(false);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestReason, setRequestReason] = useState('');
  const [requestStatus, setRequestStatus] = useState(null);
  const [canUpdate, setCanUpdate] = useState(false);

  useEffect(() => {
    // Check if user already has face and their request status
    checkFaceStatus();
    checkRequestStatus();
  }, []);

  const checkFaceStatus = async () => {
    try {
      const res = await api.get('/auth/me');
      const hasface = res.data.has_face_encoding;
      const allowed = res.data.face_update_allowed;

      setRequiresPermission(hasface && !allowed);
      setCanUpdate(allowed);
    } catch (err) {
      console.error('Error checking face status:', err);
    }
  };

  const checkRequestStatus = async () => {
    try {
      const res = await api.get('/auth/face-update-status');
      if (res.data.has_request) {
        setRequestStatus(res.data.request);
      }
    } catch (err) {
      console.error('Error checking request status:', err);
    }
  };

  const handleRedirect = () => {
    if (user?.role === 'admin') navigate('/admin');
    else if (user?.role === 'teacher') navigate('/teacher');
    else navigate('/student');
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
    setError('');
    setMessage('');
  };

  const uploadFace = async () => {
    if (!imgSrc) return;
    setLoading(true);
    setError('');

    try {
      const base64Response = await fetch(imgSrc);
      const blob = await base64Response.blob();

      const formData = new FormData();
      formData.append('image', blob, 'face.jpg');

      await api.post('/auth/register-face', formData, {
        headers: {
          'Content-Type': undefined,
        },
      });
      setMessage('Face registered successfully! Redirecting...');
      setTimeout(handleRedirect, 2000);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || 'Failed to register face';

      // Check if permission is required
      if (err.response?.data?.require_permission) {
        setRequiresPermission(true);
        setError(msg);
      } else {
        setError(msg);
      }
      setMessage('');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestUpdate = () => {
    setRequestDialogOpen(true);
  };

  const submitRequest = async () => {
    if (!requestReason || requestReason.trim().length < 10) {
      setError('Please provide a reason (at least 10 characters)');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/request-face-update', { reason: requestReason });
      setMessage('Request submitted successfully! Waiting for admin approval.');
      setRequestDialogOpen(false);
      setRequestReason('');
      // Refresh request status
      checkRequestStatus();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  // Show blocked state if permission required
  if (requiresPermission && !canUpdate) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Face Already Registered
          </Typography>
          <Paper elevation={3} sx={{ p: 3, width: '100%' }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              You have already registered your face. To update it, you need admin approval.
            </Alert>

            {requestStatus && requestStatus.status === 'pending' && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2" gutterBottom>
                  <strong>Request Status:</strong> Pending
                </Typography>
                <Typography variant="caption">
                  Request submitted: {new Date(requestStatus.created_at).toLocaleString()}
                </Typography>
                <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                  Reason: {requestStatus.reason}
                </Typography>
              </Alert>
            )}

            {requestStatus && requestStatus.status === 'denied' && (
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  Your last request was denied.
                </Typography>
              </Alert>
            )}

            {(!requestStatus || requestStatus.status !== 'pending') && (
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={handleRequestUpdate}
                sx={{ mb: 2 }}
              >
                Request Face Update Permission
              </Button>
            )}

            <Button
              variant="outlined"
              fullWidth
              onClick={handleRedirect}
            >
              Back to Dashboard
            </Button>
          </Paper>
        </Box>

        {/* Request Dialog */}
        <Dialog open={requestDialogOpen} onClose={() => setRequestDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Request Face Update Permission</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Please explain why you need to update your registered face. Admin will review your request.
            </Typography>
            <TextField
              autoFocus
              fullWidth
              multiline
              rows={4}
              label="Reason for update"
              placeholder="e.g., Changed appearance, poor image quality, etc."
              value={requestReason}
              onChange={(e) => setRequestReason(e.target.value)}
              error={requestReason.length > 0 && requestReason.length < 10}
              helperText={requestReason.length > 0 && requestReason.length < 10 ? 'Minimum 10 characters required' : ''}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRequestDialogOpen(false)} disabled={loading}>
              Cancel
            </Button>
            <Button
              onClick={submitRequest}
              variant="contained"
              disabled={loading || requestReason.trim().length < 10}
            >
              {loading ? <CircularProgress size={20} /> : 'Submit Request'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    );
  }

  // Show approval message if permission granted
  if (canUpdate && requiresPermission) {
    return (
      <Container maxWidth="sm">
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography variant="h4" gutterBottom>
            Face Update Approved
          </Typography>
          <Paper elevation={3} sx={{ p: 3, width: '100%', textAlign: 'center' }}>
            <Alert severity="success" sx={{ mb: 2 }}>
              ✅ Your face update request has been approved! You can now update your face.
            </Alert>
            {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {!imgSrc ? (
              <>
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  width="100%"
                  videoConstraints={{ facingMode: "user" }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={capture}
                  sx={{ mt: 2 }}
                >
                  Capture Face
                </Button>
              </>
            ) : (
              <>
                <img src={imgSrc} alt="captured" style={{ width: '100%', borderRadius: '4px' }} />
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                  <Button variant="outlined" onClick={retake} disabled={loading}>
                    Retake
                  </Button>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={uploadFace}
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Update Face'}
                  </Button>
                </Box>
              </>
            )}
          </Paper>
        </Box>
      </Container>
    );
  }

  // Normal registration flow (first time)
  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="h4" gutterBottom>
          Face Registration
        </Typography>
        <Paper elevation={3} sx={{ p: 3, width: '100%', textAlign: 'center' }}>
          {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {!imgSrc ? (
            <>
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width="100%"
                videoConstraints={{ facingMode: "user" }}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={capture}
                sx={{ mt: 2 }}
              >
                Capture Face
              </Button>
            </>
          ) : (
            <>
              <img src={imgSrc} alt="captured" style={{ width: '100%', borderRadius: '4px' }} />
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button variant="outlined" onClick={retake} disabled={loading}>
                  Retake
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  onClick={uploadFace}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Face'}
                </Button>
              </Box>
            </>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default FaceRegistration;
