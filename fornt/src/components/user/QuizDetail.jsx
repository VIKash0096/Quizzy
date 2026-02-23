import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQuiz } from '../../contexts/QuizContext.jsx';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Card, 
  CardContent, 
  Chip, 
  Fade, 
  Grow,
  IconButton,
  Divider,
  useTheme,
  CircularProgress,
  Alert
} from '@mui/material';
import { 
  ArrowBack,
  Quiz,
  AccessTime,
  School,
  Psychology,
  TrendingUp,
  PlayArrow,
  Person,
  Schedule
} from '@mui/icons-material';

const QuizDetail = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const location = useLocation();
  const { fetchQuestions } = useQuiz(); // Only need fetchQuestions like in Quiz.jsx
  const [startingQuiz, setStartingQuiz] = useState(false);
  const [error, setError] = useState('');

  // Get quiz info from location state
  const quiz = location.state?.quiz || {};

  // Follow the EXACT same pattern as Quiz.jsx handleStartQuiz
  const handleStartQuiz = async () => {
    if (!quiz._id) {
      setError('Quiz ID not found. Please try selecting the quiz again.');
      return;
    }

    try {
      setStartingQuiz(true);
      setError('');
      
      // This is exactly how Quiz.jsx does it:
      await fetchQuestions(quiz._id);
      
      // Navigate to quiz taking page (same route as Quiz.jsx)
      navigate('/user/take-quiz');
    } catch (error) {
      console.error('Error starting quiz:', error);
      setError('Failed to start quiz. Please try again.');
    } finally {
      setStartingQuiz(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return '#2196f3';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Fade in timeout={600}>
        <Box>
          {/* Header with Back Button */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <IconButton 
              onClick={handleBack}
              sx={{ 
                mr: 2,
                color: theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.08)' 
                    : 'rgba(0,0,0,0.04)'
                }
              }}
            >
              <ArrowBack />
            </IconButton>
            <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
              Quiz Details
            </Typography>
          </Box>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* Main Quiz Card */}
          <Grow in timeout={800} style={{ transitionDelay: '200ms' }}>
            <Card sx={{ 
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.1)' 
                : 'rgba(0,0,0,0.1)'}`,
              borderRadius: 4,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 12px 40px rgba(0,0,0,0.4)'
                : '0 12px 40px rgba(0,0,0,0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <CardContent sx={{ p: { xs: 3, sm: 5 }, position: 'relative', zIndex: 1 }}>
                {/* Quiz Title */}
                <Typography 
                  variant="h3" 
                  gutterBottom
                  sx={{ 
                    fontWeight: 700,
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(45deg, #bb86fc 30%, #03dac6 90%)'
                      : 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    textAlign: 'center',
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                    lineHeight: 1.2,
                    mb: 3
                  }}
                >
                  {quiz.name || 'Quiz Title'}
                </Typography>

                {/* Quiz Metadata */}
                <Box sx={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: 2, 
                  justifyContent: 'center',
                  mb: 4 
                }}>
                  <Chip 
                    label={quiz.topic || 'General'} 
                    icon={<School />}
                    sx={{ 
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(103, 58, 183, 0.2)' 
                        : 'rgba(103, 58, 183, 0.1)',
                      color: '#673ab7',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  />
                  <Chip 
                    label={quiz.difficulty || 'Medium'} 
                    icon={<TrendingUp />}
                    sx={{ 
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 152, 0, 0.2)' 
                        : 'rgba(255, 152, 0, 0.1)',
                      color: getDifficultyColor(quiz.difficulty),
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  />
                  {(quiz.questionCount) && (
                    <Chip 
                      label={`${quiz.questionCount} Questions`} 
                      icon={<Psychology />}
                      sx={{ 
                        backgroundColor: theme.palette.mode === 'dark' 
                          ? 'rgba(33, 150, 243, 0.2)' 
                          : 'rgba(33, 150, 243, 0.1)',
                        color: '#2196f3',
                        fontWeight: 600,
                        fontSize: '0.9rem'
                      }}
                    />
                  )}
                  <Chip 
                    label="1 min per question" 
                    icon={<AccessTime />}
                    sx={{ 
                      backgroundColor: theme.palette.mode === 'dark' 
                        ? 'rgba(255, 152, 0, 0.2)' 
                        : 'rgba(255, 152, 0, 0.1)',
                      color: '#ff9800',
                      fontWeight: 600,
                      fontSize: '0.9rem'
                    }}
                  />
                </Box>

                {/* Additional Quiz Info */}
                {(quiz.createdBy || quiz.createdAt) && (
                  <Box sx={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: 3, 
                    justifyContent: 'center',
                    mb: 4 
                  }}>
                    {quiz.createdBy && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Person sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          by {quiz.createdBy.firstName} {quiz.createdBy.lastName}
                        </Typography>
                      </Box>
                    )}
                    {quiz.createdAt && (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Schedule sx={{ fontSize: 16, color: 'text.secondary', mr: 1 }} />
                        <Typography variant="body2" color="text.secondary">
                          Created {formatDate(quiz.createdAt)}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}

                <Divider sx={{ mb: 4, opacity: 0.5 }} />

                {/* Quiz Description */}
                <Typography 
                  variant="body1" 
                  sx={{ 
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.grey[300] 
                      : theme.palette.grey[700],
                    fontSize: '1.1rem',
                    lineHeight: 1.8,
                    textAlign: 'center',
                    mb: 5,
                    maxWidth: '600px',
                    mx: 'auto'
                  }}
                >
                  Challenge yourself with this carefully crafted quiz designed to test your knowledge and help you learn new concepts. Get ready for an engaging experience!
                </Typography>

                {/* Quiz Instructions */}
                <Box sx={{ 
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 193, 7, 0.1)' 
                    : 'rgba(255, 193, 7, 0.05)',
                  border: `1px solid ${theme.palette.mode === 'dark' 
                    ? 'rgba(255, 193, 7, 0.3)' 
                    : 'rgba(255, 193, 7, 0.2)'}`,
                  borderRadius: 2,
                  p: 3,
                  mb: 5
                }}>
                  <Typography variant="h6" sx={{ mb: 2, color: '#f57c00', fontWeight: 600 }}>
                    📋 Quiz Instructions
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                    • You have 1 minute per question
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                    • Navigate between questions using Previous/Next buttons
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                    • Quiz will auto-submit when time runs out
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    • Results will be saved to your history
                  </Typography>
                </Box>

                {/* Start Quiz Button - Same as Quiz.jsx */}
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleStartQuiz}
                    disabled={startingQuiz}
                    startIcon={
                      startingQuiz ? (
                        <CircularProgress size={20} color="inherit" />
                      ) : (
                        <PlayArrow />
                      )
                    }
                    sx={{
                      background: 'linear-gradient(45deg, #ff4081 30%, #f50057 90%)',
                      color: 'white',
                      px: { xs: 4, sm: 6 },
                      py: 2,
                      fontSize: { xs: '1.1rem', sm: '1.3rem' },
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 3,
                      boxShadow: theme.palette.mode === 'dark' 
                        ? '0 8px 32px rgba(255, 64, 129, 0.35)'
                        : '0 8px 32px rgba(255, 64, 129, 0.25)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: startingQuiz 
                          ? 'linear-gradient(45deg, #ff4081 30%, #f50057 90%)'
                          : 'linear-gradient(45deg, #f50057 30%, #c51162 90%)',
                        transform: startingQuiz ? 'none' : 'translateY(-3px)',
                      },
                      '&:disabled': {
                        background: 'linear-gradient(45deg, #ff4081 30%, #f50057 90%)',
                        color: 'white',
                        opacity: 0.8
                      }
                    }}
                  >
                    {startingQuiz ? 'Starting Quiz...' : 'Start Quiz'}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grow>
        </Box>
      </Fade>
    </Container>
  );
};

export default QuizDetail;
