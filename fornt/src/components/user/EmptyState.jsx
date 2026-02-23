import React from 'react';
import { Paper, Typography, Stack, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import QuizIcon from '@mui/icons-material/Quiz';
import SmartToyIcon from '@mui/icons-material/SmartToy';

const EmptyState = ({ theme }) => {
  const navigate = useNavigate();

  return (
    <Paper sx={{
      p: { xs: 3, md: 8 },
      textAlign: 'center',
      maxWidth: 800,
      mx: 'auto',
      borderRadius: 4,
      background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
      border: `2px solid ${theme.palette.divider}`
    }}>
      <EmojiEventsIcon sx={{ fontSize: { xs: 60, md: 80 }, color: theme.palette.primary.main, mb: 3 }} />
      <Typography variant="h4" color="text.primary" gutterBottom sx={{ fontWeight: 700, fontSize: { xs: '1.5rem', md: '2rem' } }}>
        Ready to Start Your Journey?
      </Typography>
      <Typography variant="h6" color="text.secondary" sx={{ mb: 4, maxWidth: 500, mx: 'auto', lineHeight: 1.6, fontSize: { xs: '1rem', md: '1.25rem' } }}>
        Take your first quiz to unlock detailed analytics, progress tracking, and performance insights
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} sx={{ maxWidth: 400, mx: 'auto' }}>
        <Button
          variant="contained"
          onClick={() => navigate('/user/quiz')}
          startIcon={<QuizIcon />}
          size="large"
          fullWidth
          sx={{ py: 2, borderRadius: 3, fontWeight: 600 }}
        >
          Browse Quizzes
        </Button>
        <Button
          variant="outlined"
          onClick={() => navigate('/user/mock-quiz')}
          startIcon={<SmartToyIcon />}
          size="large"
          fullWidth
          sx={{ py: 2, borderRadius: 3, fontWeight: 600 }}
        >
          Create Mock Quiz
        </Button>
      </Stack>
    </Paper>
  );
};

export default EmptyState;
