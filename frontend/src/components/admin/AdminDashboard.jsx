import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Container, Grid, Paper, Typography, Box, Button,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField,
  Select, MenuItem, FormControl, InputLabel, IconButton, Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import FaceUpdateRequests from './FaceUpdateRequests';
import ThemeToggle from '../common/ThemeToggle';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total_users: 0, total_classes: 0, active_students: 0 });
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null); // null for create, object for edit
  const [formData, setFormData] = useState({ username: '', email: '', role: 'student', full_name: '', password: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const handleOpen = (user = null) => {
    if (user) {
      setCurrentUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        role: user.role,
        full_name: user.full_name,
        password: '' // Don't show password
      });
    } else {
      setCurrentUser(null);
      setFormData({ username: '', email: '', role: 'student', full_name: '', password: '' });
    }
    setOpen(true);
    setError('');
    setMessage('');
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (currentUser) {
        // Edit
        await api.put(`/admin/users/${currentUser.id}`, formData);
        setMessage('User updated successfully');
      } else {
        // Create
        await api.post('/admin/users', formData);
        setMessage('User created successfully');
      }
      fetchUsers();
      fetchStats();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      fetchUsers();
      fetchStats();
      setMessage('User deleted successfully');
    } catch (err) {
      console.error(err);
      setError('Failed to delete user');
    }
  };

  const handleExportAttendance = async () => {
    try {
      const response = await api.get('/admin/export-attendance', {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'attendance_records.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      setMessage('Attendance exported successfully!');
    } catch (err) {
      setError('Failed to export attendance');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">🛡️ Admin Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <ThemeToggle />
          <Button variant="contained" color="success" startIcon={<DownloadIcon />} onClick={handleExportAttendance}>
            Export Attendance
          </Button>
          <Button variant="outlined" color="error" onClick={() => { logout(); navigate('/login'); }}>Logout</Button>
        </Box>
      </Box>

      {/* Stats Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e3f2fd' }}>
            <Typography variant="h6">Total Users</Typography>
            <Typography variant="h3">{stats.total_users}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#e8f5e9' }}>
            <Typography variant="h6">Total Classes</Typography>
            <Typography variant="h3">{stats.total_classes}</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2, textAlign: 'center', bgcolor: '#fff3e0' }}>
            <Typography variant="h6">Active Students</Typography>
            <Typography variant="h3">{stats.active_students}</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* User Management Section */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h5">User Management</Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen(null)}>
            Add User
          </Button>
        </Box>

        {message && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setMessage('')}>{message}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Full Name</TableCell>
                <TableCell>Username</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{user.full_name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{user.role}</TableCell>
                  <TableCell>
                    <IconButton color="primary" onClick={() => handleOpen(user)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(user.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Create/Edit Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>{currentUser ? 'Edit User' : 'Create User'}</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            label="Full Name"
            name="full_name"
            fullWidth
            value={formData.full_name}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Username"
            name="username"
            fullWidth
            value={formData.username}
            onChange={handleChange}
            disabled={!!currentUser} // Disable username edit
          />
          <TextField
            margin="dense"
            label="Email"
            name="email"
            type="email"
            fullWidth
            value={formData.email}
            onChange={handleChange}
          />
          <TextField
            margin="dense"
            label="Password"
            name="password"
            type="password"
            fullWidth
            value={formData.password}
            onChange={handleChange}
            helperText={currentUser ? "Leave blank to keep unchanged" : "Required for new users"}
          />
          <FormControl fullWidth margin="dense">
            <InputLabel>Role</InputLabel>
            <Select
              value={formData.role}
              label="Role"
              name="role"
              onChange={handleChange}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="teacher">Teacher</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Face Update Requests Section */}
      <Paper sx={{ p: 3, mt: 4 }}>
        <FaceUpdateRequests />
      </Paper>

    </Container>
  );
};

export default AdminDashboard;
