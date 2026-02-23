import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../../contexts/QuizContext.jsx';
import {
  Box,
  Typography,
  Card,
  CardContent,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  LinearProgress,
  Alert,
  Container,
  Paper,
  Chip,
  Fade,
  Grow,
  useTheme,
  IconButton,
  Divider
} from '@mui/material';
import {
  Timer as TimerIcon,
  Warning as WarningIcon,
  ExitToApp,
  NavigateBefore,
  NavigateNext,
  CheckCircle,
  Quiz as QuizIcon
} from '@mui/icons-material';

const TakeQuiz = () => {
  const { currentQuiz, questions, submitQuizResults } = useQuiz();
  const navigate = useNavigate();
  const theme = useTheme();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState('');
  
  // Timer states
  const [timeLeft, setTimeLeft] = useState(null);
  const [isTimeWarning, setIsTimeWarning] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);

  // Initialize timer only when quiz data is available
  useEffect(() => {
    if (currentQuiz && questions.length > 0 && !timerStarted) {
      const totalTimeInSeconds = questions.length * 60; // 1 minute per question
      setTimeLeft(totalTimeInSeconds);
      setTimerStarted(true);
    }
  }, [currentQuiz, questions, timerStarted]);

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft === null || timeLeft === undefined || !timerStarted) {
      return;
    }

    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }

    // Show warning when 2 minutes or less remaining
    if (timeLeft <= 120) {
      setIsTimeWarning(true);
    } else {
      setIsTimeWarning(false);
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev > 1) {
          return prev - 1;
        } else {
          clearInterval(timer);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, timerStarted]);

  // Redirect if no quiz data
  useEffect(() => {
    if (!currentQuiz || !questions.length) {
      navigate('/user/quiz');
    }
  }, [currentQuiz, questions, navigate]);

  // Update selected answer when question changes
  useEffect(() => {
    setSelectedAnswer(answers[currentQuestionIndex] || '');
  }, [currentQuestionIndex, answers]);

  const handleTimeUp = () => {
    handleSubmit(true);
  };

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (event) => {
    setSelectedAnswer(event.target.value);
  };

  const handleNext = () => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: selectedAnswer
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: selectedAnswer
    }));

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async (isTimeUp = false) => {
    try {
      const finalAnswers = { ...answers, [currentQuestionIndex]: selectedAnswer };
      
      let correctCount = 0;
      const detailedAnswers = questions.map((question, index) => {
        const userAnswer = finalAnswers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        if (isCorrect) correctCount++;
        
        return {
          question: question.question,
          selected: userAnswer || 'Not answered',
          correct: question.correctAnswer,
          isCorrect
        };
      });

      const results = {
        quizId: currentQuiz._id,
        quizName: currentQuiz.name,
        date: new Date(),
        score: correctCount,
        total: questions.length,
        topic: currentQuiz.topic,
        difficulty: currentQuiz.difficulty,
        answers: detailedAnswers,
        timeUp: isTimeUp
      };

      await submitQuizResults(results);
      navigate('/user/view-result', { state: { results } });
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  // Loading state with enhanced UI
  if (!currentQuiz || !questions.length || timeLeft === null) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight="70vh"
          sx={{
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(18,18,18,0.9) 0%, rgba(30,30,30,0.9) 100%)'
              : 'linear-gradient(135deg, rgba(248,250,252,0.9) 0%, rgba(243,244,246,0.9) 100%)',
            borderRadius: 3,
            p: 4,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.1)' 
              : 'rgba(0,0,0,0.1)'}`
          }}
        >
          <QuizIcon sx={{ fontSize: 60, mb: 2, color: 'primary.main' }} />
          <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 600 }}>
            Loading quiz...
          </Typography>
        </Box>
      </Container>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      {/* Enhanced Timer and Progress Header */}
      <Fade in timeout={600}>
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, md: 3 }, 
            mb: 3,
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

          <Box 
            display="flex" 
            justifyContent="space-between" 
            alignItems="center" 
            mb={2}
            flexDirection={{ xs: 'column', sm: 'row' }}
            gap={{ xs: 2, sm: 0 }}
            sx={{ position: 'relative', zIndex: 1 }}
          >
            <Typography 
              variant="h4" 
              sx={{
                fontWeight: 700,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(45deg, #bb86fc 30%, #03dac6 90%)'
                  : 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              {currentQuiz.name}
            </Typography>
            
            <Box 
              display="flex" 
              alignItems="center" 
              gap={1}
              flexDirection={{ xs: 'row', sm: 'row' }}
              flexWrap="wrap"
              justifyContent={{ xs: 'center', sm: 'flex-end' }}
            >
              <Chip
                icon={<TimerIcon />}
                label={formatTime(timeLeft)}
                color={isTimeWarning ? "error" : "primary"}
                sx={{ 
                  fontSize: { xs: '0.9rem', sm: '1.1rem' }, 
                  px: { xs: 0.5, sm: 1 },
                  height: { xs: 28, sm: 32 }
                }}
              />
              {isTimeWarning && (
                <Chip
                  icon={<WarningIcon />}
                  label="Warning!"
                  color="error"
                  variant="outlined"
                  sx={{ 
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    height: { xs: 28, sm: 32 }
                  }}
                />
              )}
            </Box>
          </Box>

          <Typography 
            variant="body1" 
            color="text.secondary" 
            gutterBottom
            sx={{ 
              fontSize: { xs: '0.9rem', sm: '1rem' },
              textAlign: { xs: 'center', sm: 'left' },
              position: 'relative',
              zIndex: 1
            }}
          >
            Question {currentQuestionIndex + 1} of {questions.length}
          </Typography>
          
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: { xs: 6, sm: 8 }, 
              borderRadius: 4,
              position: 'relative',
              zIndex: 1,
              background: theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.1)' 
                : 'rgba(0,0,0,0.1)',
              '& .MuiLinearProgress-bar': {
                background: 'linear-gradient(45deg, #ff4081 30%, #f50057 90%)',
                borderRadius: 4
              }
            }} 
          />
        </Paper>
      </Fade>

      {/* Enhanced Time Warning Alert */}
      {isTimeWarning && (
        <Fade in timeout={300}>
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3,
              background: theme.palette.mode === 'dark'
                ? 'rgba(255, 193, 7, 0.1)'
                : 'rgba(255, 193, 7, 0.05)',
              border: `1px solid ${theme.palette.mode === 'dark'
                ? 'rgba(255, 193, 7, 0.3)'
                : 'rgba(255, 193, 7, 0.2)'}`,
              borderRadius: 2,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Less than 2 minutes remaining! The quiz will auto-submit when time runs out.
          </Alert>
        </Fade>
      )}

      {/* Enhanced Question Card */}
      <Grow in timeout={800} style={{ transitionDelay: '200ms' }}>
        <Card 
          elevation={0}
          sx={{
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

          <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 }, position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                mb: 4, 
                minHeight: { xs: 'auto', sm: '3rem' },
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontWeight: 600,
                lineHeight: 1.4,
                color: 'text.primary'
              }}
            >
              {currentQuestion.question}
            </Typography>

            <Divider sx={{ mb: 3, opacity: 0.3 }} />

            <RadioGroup
              value={selectedAnswer}
              onChange={handleAnswerChange}
              sx={{ gap: 1 }}
            >
              {currentQuestion.options.map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={option}
                  control={
                    <Radio 
                      sx={{
                        color: theme.palette.mode === 'dark' ? '#bb86fc' : '#6366f1',
                        '&.Mui-checked': {
                          color: theme.palette.mode === 'dark' ? '#bb86fc' : '#6366f1',
                        }
                      }}
                    />
                  }
                  label={
                    <Typography 
                      sx={{ 
                        fontSize: { xs: '0.9rem', sm: '1rem' },
                        fontWeight: 500,
                        color: 'text.primary'
                      }}
                    >
                      {option}
                    </Typography>
                  }
                  sx={{ 
                    mb: 1,
                    p: { xs: 1, sm: 1.5 },
                    borderRadius: 2,
                    border: `1px solid ${theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'rgba(0,0,0,0.1)'}`,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(187, 134, 252, 0.08)'
                        : 'rgba(99, 102, 241, 0.08)',
                      borderColor: theme.palette.mode === 'dark' ? '#bb86fc' : '#6366f1',
                      transform: 'translateX(4px)'
                    }
                  }}
                />
              ))}
            </RadioGroup>

            <Divider sx={{ mt: 4, mb: 3, opacity: 0.3 }} />

            {/* Enhanced Button Section */}
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 },
                alignItems: { xs: 'stretch', sm: 'center' }
              }}
            >
              <Box 
                display="flex" 
                gap={1}
                flexDirection={{ xs: 'row', sm: 'row' }}
                justifyContent={{ xs: 'space-between', sm: 'flex-start' }}
              >
                <Button
                  variant="outlined"
                  onClick={() => navigate('/user/quiz')}
                  startIcon={<ExitToApp />}
                  sx={{
                    borderColor: theme.palette.mode === 'dark' ? '#f44336' : '#f44336',
                    color: theme.palette.mode === 'dark' ? '#f44336' : '#f44336',
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    px: { xs: 2, sm: 3 },
                    '&:hover': {
                      borderColor: '#d32f2f',
                      backgroundColor: 'rgba(244, 67, 54, 0.08)',
                    }
                  }}
                >
                  Exit
                </Button>
                <Button
                  variant="outlined"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  startIcon={<NavigateBefore />}
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    px: { xs: 2, sm: 3 }
                  }}
                >
                  Previous
                </Button>
              </Box>
              
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!selectedAnswer}
                endIcon={currentQuestionIndex === questions.length - 1 ? <CheckCircle /> : <NavigateNext />}
                sx={{
                  background: currentQuestionIndex === questions.length - 1 
                    ? 'linear-gradient(45deg, #4caf50 30%, #2e7d32 90%)'
                    : 'linear-gradient(45deg, #ff4081 30%, #f50057 90%)',
                  minWidth: { xs: '100%', sm: 160 },
                  py: { xs: 1.5, sm: 1 },
                  fontSize: { xs: '1rem', sm: '0.9rem' },
                  fontWeight: 700,
                  textTransform: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: currentQuestionIndex === questions.length - 1 
                      ? 'linear-gradient(45deg, #2e7d32 30%, #1b5e20 90%)'
                      : 'linear-gradient(45deg, #f50057 30%, #c51162 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 8px 25px rgba(255, 64, 129, 0.4)'
                      : '0 8px 25px rgba(255, 64, 129, 0.35)',
                  },
                  '&:disabled': {
                    background: 'rgba(0,0,0,0.12)',
                    color: 'rgba(0,0,0,0.26)'
                  }
                }}
              >
                {currentQuestionIndex === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grow>
    </Container>
  );
};

export default TakeQuiz;
