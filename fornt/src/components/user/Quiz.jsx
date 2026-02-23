import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../../contexts/QuizContext.jsx';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Container,
  Paper,
  Fade,
  Grow,
  useTheme,
  IconButton
} from '@mui/material';
import {
  Quiz as QuizIcon,
  Person,
  Schedule,
  School,
  PlayArrow,
  TrendingUp,
  AccessTime,
  Refresh
} from '@mui/icons-material';

const Quiz = () => {
  const { quizzes, loading, error, fetchQuizzes, fetchQuestions } = useQuiz();
  const navigate = useNavigate();
  const theme = useTheme();
  const [startingQuiz, setStartingQuiz] = useState(null);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleStartQuiz = async (quizId) => {
    try {
      setStartingQuiz(quizId);
      await fetchQuestions(quizId);
      navigate('/user/take-quiz');
    } catch (error) {
      console.error('Error starting quiz:', error);
    } finally {
      setStartingQuiz(null);
    }
  };

  const handleViewDetails = (quiz) => {
    navigate('/user/quiz-detail', { state: { quiz } });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return '#2196f3';
    }
  };

  const getMUIColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
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

  if (loading && quizzes.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
          sx={{
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(18,18,18,0.9) 0%, rgba(30,30,30,0.9) 100%)'
              : 'linear-gradient(135deg, rgba(248,250,252,0.9) 0%, rgba(243,244,246,0.9) 100%)',
            borderRadius: 3,
            p: 4
          }}
        >
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h6" color="text.secondary">
            Loading quizzes...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Fade in timeout={600}>
          <Card sx={{
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.1)' 
              : 'rgba(0,0,0,0.1)'}`,
            borderRadius: 3,
            p: 4,
            textAlign: 'center'
          }}>
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
            <Button
              variant="contained"
              onClick={fetchQuizzes}
              disabled={loading}
              startIcon={<Refresh />}
              sx={{
                background: 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #d32f2f 30%, #c62828 90%)',
                }
              }}
            >
              {loading ? 'Retrying...' : 'Retry'}
            </Button>
          </Card>
        </Fade>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Enhanced Header */}
      <Fade in timeout={600}>
        <Paper 
          elevation={0}
          sx={{ 
            p: 4, 
            mb: 4,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.1)' 
              : 'rgba(0,0,0,0.1)'}`,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Background Pattern */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: theme.palette.mode === 'dark' ? 0.02 : 0.03,
            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            zIndex: 0
          }} />

          <Box display="flex" alignItems="center" mb={2} sx={{ position: 'relative', zIndex: 1 }}>
            <QuizIcon sx={{ 
              mr: 2, 
              fontSize: 40,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #bb86fc 30%, #03dac6 90%)'
                : 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }} />
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{
                fontWeight: 700,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(45deg, #bb86fc 30%, #03dac6 90%)'
                  : 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: { xs: '2rem', md: '3rem' }
              }}
            >
              Available Quizzes
            </Typography>
          </Box>
          <Typography 
            variant="h6" 
            sx={{ 
              color: theme.palette.mode === 'dark' 
                ? theme.palette.grey[300] 
                : theme.palette.grey[700],
              position: 'relative',
              zIndex: 1
            }}
          >
            Choose from {quizzes.length} available quizzes to test your knowledge
          </Typography>
        </Paper>
      </Fade>

      {quizzes.length === 0 ? (
        <Fade in timeout={800} style={{ transitionDelay: '200ms' }}>
          <Card sx={{
            p: 6, 
            textAlign: 'center',
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.1)' 
              : 'rgba(0,0,0,0.1)'}`,
            borderRadius: 3,
          }}>
            <QuizIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.5 }} />
            <Typography variant="h5" color="text.secondary" gutterBottom fontWeight="600">
              No quizzes available
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Check back later for new quizzes to take
            </Typography>
          </Card>
        </Fade>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(1, 1fr)',
              sm: 'repeat(2, 1fr)', 
              lg: 'repeat(3, 1fr)'
            },
            gap: 3
          }}
        >
          {quizzes.map((quiz, index) => (
            <Grow 
              key={quiz._id}
              in 
              timeout={800} 
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(30,30,30,0.9) 0%, rgba(45,45,45,0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(248,250,252,0.9) 100%)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.1)' 
                    : 'rgba(0,0,0,0.1)'}`,
                  borderRadius: 3,
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 20px 40px rgba(0,0,0,0.4)'
                      : '0 20px 40px rgba(0,0,0,0.15)',
                  }
                }}
              >
                {/* Card Background Pattern */}
                <Box sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  opacity: theme.palette.mode === 'dark' ? 0.02 : 0.03,
                  background: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.3'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                  zIndex: 0
                }} />

                <CardContent sx={{ flexGrow: 1, pb: 1, position: 'relative', zIndex: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{
                        fontWeight: 700,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        minHeight: '3rem',
                        color: 'text.primary',
                        cursor: 'pointer',
                        '&:hover': {
                          background: theme.palette.mode === 'dark'
                            ? 'linear-gradient(45deg, #bb86fc 30%, #03dac6 90%)'
                            : 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }
                      }}
                      onClick={() => handleViewDetails(quiz)}
                    >
                      {quiz.name}
                    </Typography>
                    <Chip
                      label={quiz.difficulty}
                      color={getMUIColor(quiz.difficulty)}
                      size="small"
                      sx={{ 
                        ml: 1, 
                        flexShrink: 0,
                        fontWeight: 600,
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>

                  <Box display="flex" alignItems="center" mb={1.5}>
                    <School sx={{ fontSize: 18, color: '#673ab7', mr: 1.5 }} />
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      {quiz.topic}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={1.5}>
                    <QuizIcon sx={{ fontSize: 18, color: '#2196f3', mr: 1.5 }} />
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      {quiz.questionCount} questions
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={1.5}>
                    <AccessTime sx={{ fontSize: 18, color: '#ff9800', mr: 1.5 }} />
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      {quiz.questionCount} minutes
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center" mb={1.5}>
                    <Person sx={{ fontSize: 18, color: '#4caf50', mr: 1.5 }} />
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      by {quiz.createdBy?.firstName} {quiz.createdBy?.lastName}
                    </Typography>
                  </Box>

                  <Box display="flex" alignItems="center">
                    <Schedule sx={{ fontSize: 18, color: 'text.secondary', mr: 1.5 }} />
                    <Typography variant="body2" color="text.secondary" fontWeight="500">
                      {formatDate(quiz.createdAt)}
                    </Typography>
                  </Box>
                </CardContent>

                <CardActions sx={{ p: 2, pt: 0, position: 'relative', zIndex: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                    <Button
                      variant="outlined"
                      onClick={() => handleViewDetails(quiz)}
                      sx={{
                        flex: 1,
                        py: 1,
                        fontWeight: 600,
                        textTransform: 'none',
                        borderColor: theme.palette.mode === 'dark' ? '#bb86fc' : '#6366f1',
                        color: theme.palette.mode === 'dark' ? '#bb86fc' : '#6366f1',
                        '&:hover': {
                          borderColor: theme.palette.mode === 'dark' ? '#bb86fc' : '#4f46e5',
                          backgroundColor: theme.palette.mode === 'dark' 
                            ? 'rgba(187, 134, 252, 0.08)' 
                            : 'rgba(99, 102, 241, 0.08)',
                        }
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={
                        startingQuiz === quiz._id ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <PlayArrow />
                        )
                      }
                      onClick={() => handleStartQuiz(quiz._id)}
                      disabled={startingQuiz === quiz._id}
                      sx={{
                        flex: 2,
                        py: 1,
                        fontWeight: 700,
                        textTransform: 'none',
                        background: 'linear-gradient(45deg, #ff4081 30%, #f50057 90%)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          background: startingQuiz === quiz._id
                            ? 'linear-gradient(45deg, #ff4081 30%, #f50057 90%)'
                            : 'linear-gradient(45deg, #f50057 30%, #c51162 90%)',
                          transform: startingQuiz === quiz._id ? 'none' : 'translateY(-1px)',
                        },
                        '&:disabled': {
                          background: 'linear-gradient(45deg, #ff4081 30%, #f50057 90%)',
                          color: 'white',
                          opacity: 0.8
                        }
                      }}
                    >
                      {startingQuiz === quiz._id ? 'Starting...' : 'Start Quiz'}
                    </Button>
                  </Box>
                </CardActions>
              </Card>
            </Grow>
          ))}
        </Box>
      )}

      {loading && quizzes.length > 0 && (
        <Fade in timeout={600}>
          <Box display="flex" justifyContent="center" mt={4}>
            <CircularProgress size={40} />
          </Box>
        </Fade>
      )}
    </Container>
  );
};

export default Quiz;
