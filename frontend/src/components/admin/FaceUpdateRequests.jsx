import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Chip,
    Alert,
    CircularProgress,
    Tabs,
    Tab,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';

const FaceUpdateRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [currentTab, setCurrentTab] = useState('pending');
    const [confirmDialog, setConfirmDialog] = useState({ open: false, request: null, action: null });

    useEffect(() => {
        fetchRequests(currentTab);
    }, [currentTab]);

    const fetchRequests = async (status = 'pending') => {
        setLoading(true);
        setError('');
        try {
            const res = await api.get(`/admin/face-update-requests?status=${status}`);
            setRequests(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load requests');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        try {
            await api.post(`/admin/face-update-requests/${requestId}/approve`);
            setMessage('Request approved successfully!');
            fetchRequests(currentTab);
            setConfirmDialog({ open: false, request: null, action: null });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to approve request');
        }
    };

    const handleDeny = async (requestId) => {
        try {
            await api.post(`/admin/face-update-requests/${requestId}/deny`);
            setMessage('Request denied successfully!');
            fetchRequests(currentTab);
            setConfirmDialog({ open: false, request: null, action: null });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to deny request');
        }
    };

    const openConfirmDialog = (request, action) => {
        setConfirmDialog({ open: true, request, action });
    };

    const closeConfirmDialog = () => {
        setConfirmDialog({ open: false, request: null, action: null });
    };

    const handleConfirm = () => {
        if (confirmDialog.action === 'approve') {
            handleApprove(confirmDialog.request.id);
        } else if (confirmDialog.action === 'deny') {
            handleDeny(confirmDialog.request.id);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'warning';
            case 'approved':
                return 'success';
            case 'denied':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom>
                Face Update Requests
            </Typography>

            {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage('')}>{message}</Alert>}
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

            <Paper sx={{ mb: 2 }}>
                <Tabs value={currentTab} onChange={(e, val) => setCurrentTab(val)}>
                    <Tab label="Pending" value="pending" />
                    <Tab label="Approved" value="approved" />
                    <Tab label="Denied" value="denied" />
                </Tabs>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>User</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Reason</TableCell>
                            <TableCell>Requested Date</TableCell>
                            <TableCell>Status</TableCell>
                            {currentTab === 'pending' && <TableCell>Actions</TableCell>}
                            {currentTab !== 'pending' && <TableCell>Reviewed By</TableCell>}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <CircularProgress size={30} />
                                </TableCell>
                            </TableRow>
                        ) : requests.length > 0 ? (
                            requests.map((req) => (
                                <TableRow key={req.id}>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight="medium">
                                            {req.user_name}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {req.user_email}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" sx={{ maxWidth: 300 }}>
                                            {req.reason}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2">
                                            {new Date(req.created_at).toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={req.status.toUpperCase()}
                                            color={getStatusColor(req.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    {currentTab === 'pending' ? (
                                        <TableCell>
                                            <Box sx={{ display: 'flex', gap: 1 }}>
                                                <Button
                                                    variant="contained"
                                                    color="success"
                                                    size="small"
                                                    startIcon={<CheckIcon />}
                                                    onClick={() => openConfirmDialog(req, 'approve')}
                                                >
                                                    Approve
                                                </Button>
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    size="small"
                                                    startIcon={<CloseIcon />}
                                                    onClick={() => openConfirmDialog(req, 'deny')}
                                                >
                                                    Deny
                                                </Button>
                                            </Box>
                                        </TableCell>
                                    ) : (
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {req.reviewer_name || 'N/A'}
                                            </Typography>
                                            {req.reviewed_at && (
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(req.reviewed_at).toLocaleString()}
                                                </Typography>
                                            )}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <Typography variant="body2" color="text.secondary">
                                        No {currentTab} requests found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Confirmation Dialog */}
            <Dialog open={confirmDialog.open} onClose={closeConfirmDialog}>
                <DialogTitle>
                    {confirmDialog.action === 'approve' ? 'Approve Request' : 'Deny Request'}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {confirmDialog.action === 'approve' ? (
                            <>
                                Are you sure you want to approve this face update request for{' '}
                                <strong>{confirmDialog.request?.user_name}</strong>?
                                <br />
                                <br />
                                This will allow the user to update their registered face one time.
                            </>
                        ) : (
                            <>
                                Are you sure you want to deny this face update request for{' '}
                                <strong>{confirmDialog.request?.user_name}</strong>?
                            </>
                        )}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeConfirmDialog}>Cancel</Button>
                    <Button
                        onClick={handleConfirm}
                        color={confirmDialog.action === 'approve' ? 'success' : 'error'}
                        variant="contained"
                        autoFocus
                    >
                        {confirmDialog.action === 'approve' ? 'Approve' : 'Deny'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FaceUpdateRequests;
