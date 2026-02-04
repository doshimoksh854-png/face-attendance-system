import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography, Chip, Alert, CircularProgress } from '@mui/material';

const AttendanceHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await api.get('/attendance/history');
        if (Array.isArray(res.data)) {
          setHistory(res.data);
        } else {
          console.error("Invalid history format:", res.data);
          setHistory([]);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <React.Fragment>
      <Typography variant="h6" gutterBottom>My Attendance History</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Class/Subject</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Confidence</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center"><CircularProgress size={20} /></TableCell>
              </TableRow>
            ) : history.length > 0 ? (
              history.map((record) => {
                try {
                  const date = new Date(record.timestamp);
                  const className = record.class ? `${record.class.name} (${record.class.code})` : 'N/A';
                  const confidence = record.confidence_score !== undefined && record.confidence_score !== null
                    ? `${(record.confidence_score * 100).toFixed(1)}%`
                    : '-';

                  return (
                    <TableRow key={record.id}>
                      <TableCell>{date.toLocaleDateString()}</TableCell>
                      <TableCell>{date.toLocaleTimeString()}</TableCell>
                      <TableCell><strong>{className}</strong></TableCell>
                      <TableCell>
                        <Chip
                          label={record.status}
                          color={record.status === 'present' ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{confidence}</TableCell>
                    </TableRow>
                  );
                } catch (e) {
                  return null; // Skip invalid records
                }
              })
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">No records found</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  );
};

export default AttendanceHistory;
