import React from 'react';
import { Box, Typography, Button, Container } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Container maxWidth="sm">
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center'
      }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#f44336' }}>
          Access Denied
        </Typography>
        <Typography variant="h6" sx={{ mb: 2, color: '#666' }}>
          You don't have permission to access this page.
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: '#888' }}>
          Please contact your administrator if you believe this is an error.
        </Typography>
        <Button 
          variant="contained" 
          size="large"
          onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/user')}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            textTransform: 'none'
          }}
        >
          Go to {user?.role === 'admin' ? 'Admin' : 'User'} Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default Unauthorized;

