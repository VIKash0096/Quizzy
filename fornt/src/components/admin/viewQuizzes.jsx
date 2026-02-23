import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Tooltip
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

// API URL configuration for environment support
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

const API_URL = getApiUrl();

const ViewQuizzes = () => {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState(null);

  // Get user from localStorage
  const getUserFromStorage = () => {
    try {
      const userData = localStorage.getItem('quizUser');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  };

  // Fetch quizzes from the database
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        const user = getUserFromStorage();
        
        if (!user || !user.token) {
          setError('Authentication token not found. Please log in again.');
          setLoading(false);
          return;
        }
        
        // console.log('Fetching quizzes with token:', user.token.substring(0, 20) + '...');
        
        // Updated API call to use environment variable
        const response = await fetch(`${API_URL}/api/quizzes`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // console.log('Response status:', response.status);
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Authentication failed. Please log in again.');
          } else {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
          }
          return;
        }
        
        const data = await response.json();
        // console.log('Quizzes data:', data);
        setQuizzes(data.quizzes || []);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError(`Failed to load quizzes: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const handleDeleteQuiz = async (quizId) => {
    try {
      const user = getUserFromStorage();
      
      if (!user || !user.token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      
      // Updated API call to use environment variable
      const response = await fetch(`${API_URL}/api/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete quiz');
      }
      
      // Remove the deleted quiz from the state
      setQuizzes(quizzes.filter(quiz => quiz._id !== quizId));
      setDeleteDialogOpen(false);
      setQuizToDelete(null);
    } catch (err) {
      console.error('Error deleting quiz:', err);
      setError('Failed to delete quiz. Please try again.');
    }
  };

  const openDeleteDialog = (quiz) => {
    setQuizToDelete(quiz);
    setDeleteDialogOpen(true);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {quizzes.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center', bgcolor: 'background.paper' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No quizzes found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first quiz to get started with the quiz management system.
          </Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/admin?view=create')}
            size="large"
          >
            Create New Quiz
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper} elevation={2}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'grey.50' }}>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Quiz Name</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Topic</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Difficulty</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Questions</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem' }}>Created</TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: '0.95rem', textAlign: 'center' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {quizzes.map((quiz) => (
                <TableRow key={`quiz-${quiz._id}`} hover>
                  <TableCell>
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {quiz.name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={quiz.topic} 
                      size="small" 
                      variant="outlined"
                      color="primary"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={quiz.difficulty} 
                      size="small"
                      color={getDifficultyColor(quiz.difficulty)}
                      sx={{ minWidth: '70px' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {quiz.questions?.length || 0}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {quiz.createdAt ? formatDate(quiz.createdAt) : 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Tooltip title="Edit Quiz">
                        <IconButton 
                          component={Link} 
                          to={`/edit-quiz/${quiz._id}`}
                          color="primary"
                          size="small"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Quiz">
                        <IconButton 
                          color="error"
                          onClick={() => openDeleteDialog(quiz)}
                          size="small"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the quiz <strong>"{quizToDelete?.name}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone and will permanently remove all quiz data.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => handleDeleteQuiz(quizToDelete?._id)} 
            color="error" 
            variant="contained"
          >
            Delete Quiz
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ViewQuizzes;
