import React, { useState } from 'react';
import { Container, Paper, Typography, TextField, Button, Alert, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import api from '../../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [resetLink, setResetLink] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setMessage('');

        try {
            const res = await api.post('/auth/forgot-password', { email });
            setMessage(res.data.message);
            // In development, show reset link
            if (res.data.reset_link) {
                setResetLink(res.data.reset_link);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send reset email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
                    <Typography variant="h4" align="center" gutterBottom>
                        🔒 Forgot Password
                    </Typography>
                    <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
                        Enter your email address and we'll send you a password reset link.
                    </Typography>

                    {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
                    {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                    {resetLink && (
                        <Alert severity="warning" sx={{ mb: 2, p: 3, bgcolor: '#fff3cd', border: '2px solid #ff9800' }}>
                            <Typography variant="h6" sx={{ mb: 2, color: '#f57c00' }}>
                                🔗 <strong>DEVELOPMENT MODE - Click Below!</strong>
                            </Typography>
                            <Typography variant="body2" sx={{ mb: 2 }}>
                                Email sending is not configured. Use this link to reset your password:
                            </Typography>
                            <Button
                                fullWidth
                                variant="contained"
                                color="warning"
                                size="large"
                                component={Link}
                                to={resetLink.replace('http://localhost:5173', '')}
                                sx={{ mb: 1, py: 2, fontSize: '1.1rem' }}
                            >
                                🔐 CLICK HERE TO RESET PASSWORD
                            </Button>
                            <Typography variant="caption" sx={{ display: 'block', wordBreak: 'break-all', mt: 1, color: 'text.secondary' }}>
                                Link: {resetLink}
                            </Typography>
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <TextField
                            fullWidth
                            label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            sx={{ mb: 3 }}
                            disabled={loading}
                        />

                        <Button
                            fullWidth
                            type="submit"
                            variant="contained"
                            size="large"
                            disabled={loading}
                            sx={{ mb: 2 }}
                        >
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </Button>

                        <Box sx={{ textAlign: 'center' }}>
                            <Link to="/login" style={{ textDecoration: 'none' }}>
                                <Typography variant="body2" color="primary">
                                    ← Back to Login
                                </Typography>
                            </Link>
                        </Box>
                    </form>
                </Paper>
            </Box>
        </Container>
    );
};

export default ForgotPassword;
