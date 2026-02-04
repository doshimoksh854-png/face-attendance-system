import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { Container, Grid, Paper, Typography, Box, Button, List, ListItem, ListItemText, Divider, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AttendanceList from './AttendanceList';

const TeacherDashboard = () => {
  const { user, logout } = useAuth();
  const [classes, setClasses] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', description: '' });
  const [selectedClass, setSelectedClass] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/classes/');
      setClasses(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createClass = async () => {
    try {
      await api.post('/classes/', newClass);
      setOpenCreate(false);
      fetchClasses();
    } catch (err) {
      alert('Failed to create class');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">👨‍🏫 Teacher Dashboard</Typography>
        <Button variant="outlined" color="error" onClick={() => { logout(); navigate('/login'); }}>Logout</Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">My Classes</Typography>
              <Button variant="contained" size="small" onClick={() => setOpenCreate(true)}>+</Button>
            </Box>
            <List>
              {classes.map((c) => (
                <div key={c.id}>
                  <ListItem button selected={selectedClass?.id === c.id} onClick={() => setSelectedClass(c)}>
                    <ListItemText primary={c.name} secondary={`Code: ${c.code}`} />
                  </ListItem>
                  <Divider />
                </div>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          {selectedClass ? (
            <AttendanceList classId={selectedClass.id} className={selectedClass.name} />
          ) : (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="textSecondary">Select a class to manage sessions and attendance.</Typography>
            </Paper>
          )}
        </Grid>
      </Grid>

      <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        <DialogTitle>Create New Class</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Class Name"
            fullWidth
            value={newClass.name}
            onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            value={newClass.description}
            onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
          <Button onClick={createClass} variant="contained">Create</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TeacherDashboard;
