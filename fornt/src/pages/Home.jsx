import { useAuth } from '../contexts/AuthContext.jsx';
import { Button, Typography, Box, Container, useTheme, Card, CardContent, Fade, Grow } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Quiz, School, TrendingUp } from '@mui/icons-material';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  if (user) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          minHeight: '85vh',
          textAlign: 'center',
          py: 4,
          background: theme.palette.mode === 'dark' 
            ? 'linear-gradient(135deg, rgba(18,18,18,0.9) 0%, rgba(30,30,30,0.9) 100%)'
            : 'linear-gradient(135deg, rgba(248,250,252,0.9) 0%, rgba(243,244,246,0.9) 100%)',
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Background Pattern */}
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: theme.palette.mode === 'dark' ? 0.03 : 0.05,
            background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            zIndex: 0
          }} />
          
          <Fade in timeout={800}>
            <Typography 
              variant="h2" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(45deg, #bb86fc 30%, #03dac6 90%)'
                  : 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                mb: 3,
                fontSize: { xs: '2.5rem', md: '4rem' },
                letterSpacing: '-0.02em',
                zIndex: 1,
                position: 'relative'
              }}
            >
              Take Fun Quizzes
            </Typography>
          </Fade>
          
          <Fade in timeout={1000} style={{ transitionDelay: '200ms' }}>
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{ 
                color: theme.palette.mode === 'dark' 
                  ? theme.palette.grey[300] 
                  : theme.palette.grey[700],
                mb: 2,
                fontWeight: 400,
                maxWidth: '700px',
                lineHeight: 1.6,
                zIndex: 1,
                position: 'relative'
              }}
            >
              Powered by AI + Wikipedia
            </Typography>
          </Fade>

          <Fade in timeout={1200} style={{ transitionDelay: '400ms' }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: theme.palette.mode === 'dark' 
                  ? theme.palette.grey[400] 
                  : theme.palette.grey[600],
                mb: 5,
                maxWidth: '600px',
                fontSize: '1.1rem',
                lineHeight: 1.7,
                zIndex: 1,
                position: 'relative'
              }}
            >
              Generate, play and learn instantly with LLM-backed questions.
            </Typography>
          </Fade>
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 3, flexDirection: { xs: 'column', sm: 'row' }, mb: 5, zIndex: 1 }}>
            <Grow in timeout={1000} style={{ transitionDelay: '600ms' }}>
              <Button 
                variant="contained"
                size="large"
                onClick={() => navigate('/user/mock-quiz')}
                startIcon={<Quiz />}
                sx={{ 
                  background: 'linear-gradient(45deg, #ff4081 30%, #f50057 90%)',
                  color: 'white',
                  px: 5,
                  py: 2,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 3,
                  boxShadow: theme.palette.mode === 'dark' 
                    ? '0 8px 32px rgba(255, 64, 129, 0.3)'
                    : '0 8px 32px rgba(255, 64, 129, 0.25)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #f50057 30%, #c51162 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 12px 40px rgba(255, 64, 129, 0.4)'
                      : '0 12px 40px rgba(255, 64, 129, 0.35)',
                  }
                }}
              >
                Start a Quiz
              </Button>
            </Grow>
            
            <Grow in timeout={1000} style={{ transitionDelay: '700ms' }}>
              <Button 
                variant="contained"
                size="large"
                onClick={() => navigate('/user/quiz')}
                startIcon={<School />}
                sx={{ 
                  background: 'linear-gradient(45deg, #4285f4 30%, #3367d6 90%)',
                  color: 'white',
                  px: 5,
                  py: 2,
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  borderRadius: 3,
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 8px 32px rgba(66, 133, 244, 0.3)'
                    : '0 8px 32px rgba(66, 133, 244, 0.25)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #3367d6 30%, #1976d2 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 12px 40px rgba(66, 133, 244, 0.4)'
                      : '0 12px 40px rgba(66, 133, 244, 0.35)',
                  }
                }}
              >
                Provided Quizzes
              </Button>
            </Grow>
          </Box>

          {/* Features Card */}
          <Fade in timeout={1400} style={{ transitionDelay: '800ms' }}>
            <Card sx={{ 
              maxWidth: 800,
              background: theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.mode === 'dark' 
                ? 'rgba(255, 255, 255, 0.1)' 
                : 'rgba(255, 255, 255, 0.2)'}`,
              borderRadius: 3,
              boxShadow: theme.palette.mode === 'dark'
                ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                : '0 8px 32px rgba(0, 0, 0, 0.1)',
              zIndex: 1
            }}>
              <CardContent sx={{ p: 4 }}>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.grey[200] 
                      : theme.palette.grey[800],
                    mb: 3,
                    fontWeight: 600
                  }}
                >
                  ✨ Features
                </Typography>
                
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2, textAlign: 'left' }}>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme.palette.mode === 'dark' 
                        ? theme.palette.grey[300] 
                        : theme.palette.grey[700],
                      lineHeight: 1.6
                    }}
                  >
                    🚀 Instant question generation
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme.palette.mode === 'dark' 
                        ? theme.palette.grey[300] 
                        : theme.palette.grey[700],
                      lineHeight: 1.6
                    }}
                  >
                    🎯 Adaptive difficulty levels
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme.palette.mode === 'dark' 
                        ? theme.palette.grey[300] 
                        : theme.palette.grey[700],
                      lineHeight: 1.6
                    }}
                  >
                    👥 Friend challenges
                  </Typography>
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme.palette.mode === 'dark' 
                        ? theme.palette.grey[300] 
                        : theme.palette.grey[700],
                      lineHeight: 1.6
                    }}
                  >
                    🏆 Detailed explanations
                  </Typography>
                </Box>
                
                <Typography 
                  variant="caption" 
                  sx={{ 
                    color: theme.palette.mode === 'dark' 
                      ? theme.palette.grey[500] 
                      : theme.palette.grey[500],
                    mt: 3,
                    display: 'block',
                    textAlign: 'center'
                  }}
                >
                  Powered by trustworthy sources and AI
                </Typography>
              </CardContent>
            </Card>
          </Fade>
        </Box>
      </Container>
    );
  }

  // Non-authenticated user view
  return (
    <Container maxWidth="md">
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '85vh',
        textAlign: 'center',
        px: 2,
        background: theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(18,18,18,0.9) 0%, rgba(30,30,30,0.9) 100%)'
          : 'linear-gradient(135deg, rgba(248,250,252,0.9) 0%, rgba(243,244,246,0.9) 100%)',
        borderRadius: 3,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background Pattern */}
        <Box sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: theme.palette.mode === 'dark' ? 0.03 : 0.05,
          background: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.3'%3E%3Cpath d='m0 0h40v40h-40z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          zIndex: 0
        }} />

        <Fade in timeout={600}>
          <Typography 
            variant="h2" 
            gutterBottom 
            sx={{ 
              color: theme.palette.mode === 'dark' 
                ? theme.palette.grey[100] 
                : theme.palette.grey[900],
              fontWeight: 700,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              zIndex: 1,
              position: 'relative',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(45deg, #bb86fc 30%, #03dac6 90%)'
                : 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Welcome to Quiz App
          </Typography>
        </Fade>

        <Fade in timeout={800} style={{ transitionDelay: '200ms' }}>
          <Typography 
            variant="h5" 
            gutterBottom 
            sx={{ 
              color: theme.palette.mode === 'dark' 
                ? theme.palette.grey[300] 
                : theme.palette.grey[700],
              mb: 4,
              fontWeight: 400,
              zIndex: 1,
              position: 'relative'
            }}
          >
            Please login to continue your learning journey
          </Typography>
        </Fade>

        <Fade in timeout={1000} style={{ transitionDelay: '400ms' }}>
          <Box sx={{ mt: 4, display: 'flex', gap: 2, flexDirection: { xs: 'column', sm: 'row' }, zIndex: 1 }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => navigate('/login')}
              sx={{ 
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                background: 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                boxShadow: theme.palette.mode === 'dark'
                  ? '0 6px 20px rgba(99, 102, 241, 0.3)'
                  : '0 6px 20px rgba(99, 102, 241, 0.25)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #4f46e5 30%, #7c3aed 90%)',
                  transform: 'translateY(-1px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 8px 25px rgba(99, 102, 241, 0.4)'
                    : '0 8px 25px rgba(99, 102, 241, 0.35)',
                }
              }}
            >
              Login
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => navigate('/register')}
              sx={{ 
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                textTransform: 'none',
                borderRadius: 2,
                borderColor: theme.palette.mode === 'dark' ? '#bb86fc' : '#6366f1',
                color: theme.palette.mode === 'dark' ? '#bb86fc' : '#6366f1',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: theme.palette.mode === 'dark' ? '#bb86fc' : '#4f46e5',
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(187, 134, 252, 0.08)' 
                    : 'rgba(99, 102, 241, 0.08)',
                  transform: 'translateY(-1px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(187, 134, 252, 0.2)'
                    : '0 4px 20px rgba(99, 102, 241, 0.15)',
                }
              }}
            >
              Register
            </Button>
          </Box>
        </Fade>
      </Box>
    </Container>
  );
};

export default Home;
