import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Button,
  Chip,
  Divider,
  List,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  Alert,
  Container,
  Fade,
  Grow,
  useTheme,
  Avatar,
  useMediaQuery
} from '@mui/material';
import {
  Check as CheckIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Home as HomeIcon,
  History as HistoryIcon,
  Quiz as QuizIcon,
  Timer as TimerIcon,
  EmojiEvents as TrophyIcon,
  School as SchoolIcon
} from '@mui/icons-material';

const ViewResult = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [results, setResults] = useState(null);

  useEffect(() => {
    if (location.state?.results) {
      // Store results in localStorage to persist on reload
      localStorage.setItem('currentQuizResults', JSON.stringify(location.state.results));
      setResults(location.state.results);
    } else {
      // Try to get results from localStorage
      const storedResults = localStorage.getItem('currentQuizResults');
      if (storedResults) {
        setResults(JSON.parse(storedResults));
      } else {
        // No results found, redirect to quiz
        navigate('/user/quiz');
      }
    }
  }, [location.state, navigate]);

  // Clear stored results when component unmounts
  useEffect(() => {
    return () => {
      localStorage.removeItem('currentQuizResults');
    };
  }, []);

  if (!results) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Fade in timeout={600}>
          <Card sx={{
            p: { xs: 3, md: 6 },
            textAlign: 'center',
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
          }}>
            <QuizIcon sx={{ fontSize: { xs: 60, md: 80 }, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h5" gutterBottom fontWeight="600" fontSize={{ xs: '1.25rem', md: '1.5rem' }}>
              No quiz results found
            </Typography>
            <Button
              variant="contained"
              onClick={() => navigate('/user')}
              startIcon={<HomeIcon />}
              sx={{
                mt: 2,
                background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                px: { xs: 2, md: 4 },
                py: 1.5,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: { xs: '0.9rem', md: '1rem' }
              }}
            >
              Return to Dashboard
            </Button>
          </Card>
        </Fade>
      </Container>
    );
  }

  const scorePercentage = Math.round((results.score / results.total) * 100);
  const isPassing = scorePercentage >= 70;

  const getScoreColor = () => {
    if (scorePercentage >= 90) return '#4caf50';
    if (scorePercentage >= 80) return '#8bc34a';
    if (scorePercentage >= 70) return '#ffc107';
    return '#f44336';
  };

  const getScoreEmoji = () => {
    if (scorePercentage >= 90) return '🎉';
    if (scorePercentage >= 80) return '👏';
    if (scorePercentage >= 70) return '✅';
    return '📚';
  };

  const getScoreMessage = () => {
    if (scorePercentage >= 90) return 'Outstanding! You\'re a quiz master!';
    if (scorePercentage >= 80) return 'Great job! You know your stuff!';
    if (scorePercentage >= 70) return 'Good work! You passed the quiz!';
    return 'Keep practicing to improve your score!';
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 1, sm: 2, md: 4 }, px: { xs: 1, md: 3 } }}>
      <Fade in timeout={600}>
        <Box>
          {/* Results Header - Optimized for Mobile */}
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 2, sm: 3, md: 5 }, 
              mb: { xs: 2, md: 4 },
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: { xs: 2, md: 4 }
            }}
          >
            <Typography 
              variant="h3" 
              gutterBottom 
              align="center" 
              sx={{
                fontWeight: 700,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(45deg, #bb86fc 30%, #03dac6 90%)'
                  : 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '3rem' },
                mb: { xs: 1, md: 2 }
              }}
            >
              Quiz Results
            </Typography>

            {/* Time Warning Alert */}
            {results.timeUp && (
              <Alert 
                severity="warning" 
                sx={{ 
                  mb: { xs: 2, md: 4 },
                  fontSize: { xs: '0.8rem', md: '0.875rem' },
                  '& .MuiAlert-icon': {
                    fontSize: { xs: '1rem', md: '1.25rem' }
                  }
                }}
              >
                <Box display="flex" alignItems="center" gap={1}>
                  <TimerIcon sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />
                  <Typography fontWeight="600" fontSize="inherit">
                    Time ran out! Quiz was auto-submitted.
                  </Typography>
                </Box>
              </Alert>
            )}

            {/* Quiz Info Section */}
            <Box sx={{ textAlign: 'center', mb: { xs: 2, md: 4 } }}>
              <Typography 
                variant="h5" 
                gutterBottom
                sx={{ 
                  fontWeight: 600,
                  color: 'text.primary',
                  mb: { xs: 2, md: 3 },
                  fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' }
                }}
              >
                {results.quizName}
              </Typography>

              {/* Metadata Chips - Smaller for Mobile */}
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'center', 
                gap: { xs: 0.5, sm: 1, md: 1.5 }, 
                mb: { xs: 2, md: 4 }, 
                flexWrap: 'wrap' 
              }}>
                <Chip 
                  label={results.topic} 
                  icon={<SchoolIcon sx={{ fontSize: { xs: '0.9rem', md: '1.25rem' } }} />}
                  sx={{ 
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(103, 58, 183, 0.2)' 
                      : 'rgba(103, 58, 183, 0.1)',
                    color: '#673ab7',
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                    height: { xs: 24, md: 32 }
                  }}
                />
                <Chip 
                  label={results.difficulty} 
                  sx={{ 
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? 'rgba(255, 152, 0, 0.2)' 
                      : 'rgba(255, 152, 0, 0.1)',
                    color: '#ff9800',
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                    height: { xs: 24, md: 32 }
                  }}
                />
                <Chip 
                  label={`${results.score}/${results.total} Correct`}
                  icon={<TrophyIcon sx={{ fontSize: { xs: '0.9rem', md: '1.25rem' } }} />}
                  sx={{ 
                    backgroundColor: isPassing 
                      ? theme.palette.mode === 'dark' 
                        ? 'rgba(76, 175, 80, 0.2)' 
                        : 'rgba(76, 175, 80, 0.1)'
                      : theme.palette.mode === 'dark'
                        ? 'rgba(244, 67, 54, 0.2)'
                        : 'rgba(244, 67, 54, 0.1)',
                    color: getScoreColor(),
                    fontWeight: 600,
                    fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                    height: { xs: 24, md: 32 }
                  }}
                />
              </Box>
              
              {/* Score Display - Smaller for Mobile */}
              <Box sx={{ mb: { xs: 2, md: 3 } }}>
                <Avatar
                  sx={{
                    width: { xs: 80, sm: 100, md: 150 },
                    height: { xs: 80, sm: 100, md: 150 },
                    mx: 'auto',
                    mb: { xs: 1, md: 2 },
                    background: `linear-gradient(45deg, ${getScoreColor()} 30%, ${getScoreColor()}aa 90%)`,
                    fontSize: { xs: '1.1rem', sm: '1.3rem', md: '2rem' },
                    fontWeight: 700,
                    border: `3px solid ${theme.palette.background.paper}`,
                    boxShadow: `0 4px 20px ${getScoreColor()}33`
                  }}
                >
                  {scorePercentage}%
                </Avatar>
              </Box>
              
              <Typography 
                variant="h5" 
                sx={{ 
                  color: getScoreColor(),
                  fontWeight: 700,
                  mb: { xs: 1, md: 2 },
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.5rem' }
                }}
              >
                {getScoreEmoji()} {getScoreMessage()}
              </Typography>
              
              {/* Progress Bar - Smaller for Mobile */}
              <LinearProgress 
                variant="determinate" 
                value={scorePercentage} 
                sx={{ 
                  height: { xs: 6, md: 12 }, 
                  borderRadius: 3, 
                  mb: { xs: 2, md: 3 },
                  background: theme.palette.mode === 'dark' 
                    ? 'rgba(255,255,255,0.1)' 
                    : 'rgba(0,0,0,0.1)',
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(45deg, ${getScoreColor()} 30%, ${getScoreColor()}dd 90%)`,
                    borderRadius: 3
                  }
                }} 
              />
              
              <Typography 
                variant="body2" 
                color="text.secondary" 
                fontWeight="500"
                sx={{ fontSize: { xs: '0.75rem', md: '0.875rem' } }}
              >
                Completed on {new Date(results.date).toLocaleDateString()} at {new Date(results.date).toLocaleTimeString()}
              </Typography>
            </Box>
          </Paper>

          {/* Question Review Section - Optimized Accordion */}
          <Grow in timeout={1000} style={{ transitionDelay: '400ms' }}>
            <Paper
              elevation={0}
              sx={{
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: { xs: 2, md: 4 },
                p: { xs: 1.5, sm: 2, md: 4 }
              }}
            >
              <Typography 
                variant="h4" 
                gutterBottom
                sx={{
                  fontWeight: 700,
                  mb: { xs: 1.5, md: 3 },
                  fontSize: { xs: '1.2rem', sm: '1.4rem', md: '2rem' }
                }}
              >
                📝 Question Review
              </Typography>

              <List sx={{ p: 0 }}>
                {results.answers.map((answer, index) => (
                  <Fade key={index} in timeout={800} style={{ transitionDelay: `${600 + index * 100}ms` }}>
                    <Accordion 
                      sx={{ 
                        mb: { xs: 1, md: 2 },
                        background: theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.03)'
                          : 'rgba(0,0,0,0.02)',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: { xs: 1, md: 2 },
                        '&:hover': {
                          background: theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.05)'
                            : 'rgba(0,0,0,0.03)',
                        },
                        '&.Mui-expanded': {
                          margin: { xs: '4px 0', md: '8px 0' },
                        },
                        '& .MuiAccordionSummary-root': {
                          minHeight: { xs: 48, md: 56 },
                          py: { xs: 0.5, md: 1.5 },
                          px: { xs: 1, md: 2 }
                        }
                      }}
                    >
                      <AccordionSummary 
                        expandIcon={<ExpandMoreIcon sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: { xs: 1, md: 2 } }}>
                          <Avatar
                            sx={{
                              width: { xs: 24, md: 32 },
                              height: { xs: 24, md: 32 },
                              bgcolor: answer.isCorrect ? 'success.main' : 'error.main',
                              fontSize: { xs: '0.7rem', md: '1rem' }
                            }}
                          >
                            {answer.isCorrect ? <CheckIcon fontSize="small" /> : <CloseIcon fontSize="small" />}
                          </Avatar>
                          <Typography 
                            sx={{ 
                              fontWeight: 600,
                              fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1rem' },
                              flex: 1,
                              lineHeight: 1.3
                            }}
                          >
                            Q{index + 1}: {answer.question.length > (isMobile ? 40 : 60) 
                              ? `${answer.question.substring(0, isMobile ? 40 : 60)}...` 
                              : answer.question}
                          </Typography>
                          <Chip
                            label={answer.isCorrect ? 'Correct' : 'Incorrect'}
                            color={answer.isCorrect ? 'success' : 'error'}
                            size="small"
                            sx={{ 
                              fontWeight: 600,
                              fontSize: { xs: '0.65rem', md: '0.75rem' },
                              height: { xs: 20, md: 24 }
                            }}
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0, px: { xs: 1, md: 2 }, pb: { xs: 1, md: 2 } }}>
                        <Card 
                          variant="outlined" 
                          sx={{ 
                            background: theme.palette.mode === 'dark'
                              ? 'rgba(255,255,255,0.02)'
                              : 'rgba(0,0,0,0.01)',
                            border: `1px solid ${theme.palette.divider}`,
                            borderRadius: { xs: 1, md: 2 }
                          }}
                        >
                          <CardContent sx={{ p: { xs: 1.5, md: 3 } }}>
                            <Typography 
                              variant="h6" 
                              gutterBottom
                              sx={{ 
                                fontWeight: 600,
                                lineHeight: 1.4,
                                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.25rem' },
                                mb: { xs: 1, md: 2 }
                              }}
                            >
                              {answer.question}
                            </Typography>
                            
                            <Divider sx={{ my: { xs: 1, md: 2 }, opacity: 0.3 }} />
                            
                            <Box sx={{ mt: { xs: 1, md: 2 } }}>
                              <Typography 
                                variant="body1" 
                                gutterBottom
                                sx={{ 
                                  fontWeight: 600,
                                  fontSize: { xs: '0.8rem', md: '1rem' }
                                }}
                              >
                                Your answer:{' '}
                                <Box 
                                  component="span"
                                  sx={{ 
                                    color: answer.isCorrect ? 'success.main' : 'error.main',
                                    fontWeight: 700,
                                    p: { xs: 0.25, md: 0.5 },
                                    borderRadius: 1,
                                    background: answer.isCorrect 
                                      ? 'rgba(76, 175, 80, 0.1)' 
                                      : 'rgba(244, 67, 54, 0.1)',
                                    fontSize: { xs: '0.8rem', md: '1rem' }
                                  }}
                                >
                                  {answer.selected}
                                </Box>
                              </Typography>
                              
                              {!answer.isCorrect && (
                                <Typography 
                                  variant="body1" 
                                  gutterBottom
                                  sx={{ 
                                    fontWeight: 600,
                                    fontSize: { xs: '0.8rem', md: '1rem' }
                                  }}
                                >
                                  Correct answer:{' '}
                                  <Box 
                                    component="span"
                                    sx={{ 
                                      color: 'success.main',
                                      fontWeight: 700,
                                      p: { xs: 0.25, md: 0.5 },
                                      borderRadius: 1,
                                      background: 'rgba(76, 175, 80, 0.1)',
                                      fontSize: { xs: '0.8rem', md: '1rem' }
                                    }}
                                  >
                                    {answer.correct}
                                  </Box>
                                </Typography>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </AccordionDetails>
                    </Accordion>
                  </Fade>
                ))}
              </List>
            </Paper>
          </Grow>

          {/* Action Buttons - Optimized for Mobile */}
          <Fade in timeout={1200} style={{ transitionDelay: '800ms' }}>
            <Box 
              sx={{ 
                display: 'flex', 
                gap: { xs: 1, sm: 2 }, 
                justifyContent: 'center', 
                mt: { xs: 2, md: 4 },
                flexDirection: { xs: 'column', sm: 'row' },
                px: { xs: 1, md: 0 }
              }}
            >
              <Button
                variant="contained"
                onClick={() => navigate('/')}
                startIcon={<HomeIcon sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />}
                sx={{
                  background: 'linear-gradient(45deg, #ff4081 30%, #f50057 90%)',
                  px: { xs: 2, sm: 3, md: 4 },
                  py: { xs: 1, md: 1.5 },
                  fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                  fontWeight: 700,
                  textTransform: 'none',
                  minWidth: { xs: '100%', sm: 160, md: 180 },
                  '&:hover': {
                    background: 'linear-gradient(45deg, #f50057 30%, #c51162 90%)',
                  }
                }}
              >
                Back to Dashboard
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => navigate('/user/history')}
                startIcon={<HistoryIcon sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />}
                sx={{
                  px: { xs: 2, sm: 3, md: 4 },
                  py: { xs: 1, md: 1.5 },
                  fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  minWidth: { xs: '100%', sm: 140, md: 160 },
                  borderColor: theme.palette.mode === 'dark' ? '#bb86fc' : '#6366f1',
                  color: theme.palette.mode === 'dark' ? '#bb86fc' : '#6366f1',
                }}
              >
                View History
              </Button>
              
              <Button
                variant="outlined"
                onClick={() => navigate('/user/quiz')}
                startIcon={<QuizIcon sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }} />}
                sx={{
                  px: { xs: 2, sm: 3, md: 4 },
                  py: { xs: 1, md: 1.5 },
                  fontSize: { xs: '0.85rem', sm: '0.9rem', md: '1rem' },
                  fontWeight: 600,
                  textTransform: 'none',
                  minWidth: { xs: '100%', sm: 160, md: 180 },
                  borderColor: theme.palette.mode === 'dark' ? '#03dac6' : '#4caf50',
                  color: theme.palette.mode === 'dark' ? '#03dac6' : '#4caf50',
                }}
              >
                Take Another Quiz
              </Button>
            </Box>
          </Fade>
        </Box>
      </Fade>
    </Container>
  );
};

export default ViewResult;
