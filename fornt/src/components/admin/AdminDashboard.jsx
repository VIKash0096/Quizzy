import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CreateQuiz from './CreateQuiz.jsx'; // Your existing CreateQuiz component
import ViewQuizzes from './viewQuizzes.jsx'; // Your existing ViewQuizzes component
import { Box, Typography, Tabs, Tab } from '@mui/material';

const AdminDashboard = () => {
  const location = useLocation();
  const [currentView, setCurrentView] = useState('manage'); // Default view

  // Parse URL parameters to determine which view to show
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const view = urlParams.get('view');
    
    if (view === 'create') {
      setCurrentView('create');
    } else if (view === 'manage') {
      setCurrentView('manage');
    } else {
      setCurrentView('manage'); // Default to manage view
    }
  }, [location.search]);

  const handleTabChange = (event, newValue) => {
    setCurrentView(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs 
          value={currentView} 
          onChange={handleTabChange} 
          aria-label="admin dashboard tabs"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1rem'
            }
          }}
        >
          <Tab label="Create Quiz" value="create" />
          <Tab label="View Quizzes" value="manage" />
        </Tabs>
      </Box>

      {/* Content based on current view */}
      {currentView === 'create' && (
        <Box>
          <CreateQuiz />
        </Box>
      )}

      {currentView === 'manage' && (
        <Box>
          <ViewQuizzes />
        </Box>
      )}
    </Box>
  );
};

export default AdminDashboard;

