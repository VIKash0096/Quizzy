import React, { useEffect, useState, useMemo, useCallback, Suspense, lazy } from 'react';
import {
  Box, Typography, Button, CircularProgress, Alert, Snackbar,
  useTheme, useMediaQuery, Container, Grid, Paper, Skeleton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import QuizIcon from '@mui/icons-material/Quiz';
import SmartToyIcon from '@mui/icons-material/SmartToy';

// Import components - keep StatsCard and EmptyState as regular imports since they're lightweight
import StatsCard from './statscard';
import EmptyState from './EmptyState';

// Lazy load heavy components
const HeatmapCalendar = lazy(() => import('./HeatmapCalendar'));
const ProgressChart = lazy(() => import('./ProgressChart'));
const QuizHistoryTable = lazy(() => import('./QuizHistoryTable'));

// API URL configuration
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};
const API_URL = getApiUrl();

// Skeleton components for loading states
const ChartSkeleton = () => (
  <Paper sx={{ 
    p: { xs: 2, md: 3 }, 
    height: { xs: 350, md: 450 }, 
    borderRadius: 4,
    border: '2px solid',
    borderColor: 'divider'
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
      <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
      <Skeleton variant="text" width="40%" height={32} />
    </Box>
    <Skeleton variant="rectangular" height={80} sx={{ mb: 2, borderRadius: 2 }} />
    <Skeleton variant="rectangular" height="70%" sx={{ borderRadius: 1 }} />
  </Paper>
);

const HeatmapSkeleton = () => (
  <Paper sx={{ 
    p: { xs: 2, md: 5 }, 
    borderRadius: 4,
    border: '2px solid',
    borderColor: 'divider'
  }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
      <Skeleton variant="circular" width={32} height={32} sx={{ mr: 2 }} />
      <Skeleton variant="text" width="30%" height={32} />
    </Box>
    <Skeleton variant="text" width="60%" height={20} sx={{ mx: 'auto', mb: 3 }} />
    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
  </Paper>
);

const TableSkeleton = () => (
  <Paper sx={{ borderRadius: 4, overflow: 'hidden' }}>
    <Box sx={{ p: 3 }}>
      <Skeleton variant="text" width="30%" height={40} sx={{ mx: 'auto', mb: 2 }} />
      <Skeleton variant="text" width="60%" height={20} sx={{ mx: 'auto', mb: 3 }} />
    </Box>
    {[...Array(5)].map((_, i) => (
      <Box key={i} sx={{ display: 'flex', p: 2, gap: 2 }}>
        <Skeleton variant="text" width="5%" height={24} />
        <Skeleton variant="text" width="30%" height={24} />
        <Skeleton variant="text" width="15%" height={24} />
        <Skeleton variant="text" width="15%" height={24} />
        <Skeleton variant="text" width="20%" height={24} />
        <Skeleton variant="text" width="15%" height={24} />
      </Box>
    ))}
  </Paper>
);

const TestHistory = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage] = useState(10);
  const [dataReady, setDataReady] = useState({
    basic: false,
    stats: false,
    charts: false,
    heatmap: false,
    table: false
  });
  
  const navigate = useNavigate();
  const theme = useTheme();
  
  // FIXED: Call useMediaQuery hooks at the top level
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Memoize the breakpoints object
  const breakpoints = useMemo(() => ({
    isMobile,
    isSmallScreen
  }), [isMobile, isSmallScreen]);

  // Memoize isMockQuiz function
  const isMockQuiz = useCallback((quizName) => {
    return quizName && quizName.toLowerCase().includes('mock quiz');
  }, []);

  // Load results from server with progressive loading
  const loadResults = useCallback(async () => {
    try {
      setLoading(true);
      setDataReady({
        basic: false,
        stats: false,
        charts: false,
        heatmap: false,
        table: false
      });

      const user = JSON.parse(localStorage.getItem('quizUser') || '{}');
      const token = user.token;

      if (!token) {
        setError('Authentication required. Please login again.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/api/test-history`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch test history');
      }

      const data = await response.json();

      // Sort results by date in descending order (newest first)
      const sortedResults = (data.results || []).sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });

      setTestResults(sortedResults);
      
      // Progressive loading - show components as they become ready
      setDataReady(prev => ({ ...prev, basic: true }));
      
      // Show stats immediately after basic data
      setTimeout(() => {
        setDataReady(prev => ({ ...prev, stats: true }));
      }, 50);
      
      // Show charts after a small delay
      setTimeout(() => {
        setDataReady(prev => ({ ...prev, charts: true }));
      }, 100);
      
      // Show heatmap
      setTimeout(() => {
        setDataReady(prev => ({ ...prev, heatmap: true }));
      }, 150);
      
      // Show table last
      setTimeout(() => {
        setDataReady(prev => ({ ...prev, table: true }));
      }, 200);

    } catch (err) {
      console.error('Error loading test results:', err);
      setError(err.message || 'Failed to load test results');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResults();
  }, [loadResults]);

  // Optimized data preparation with memoization
  const processedData = useMemo(() => {
    if (!testResults.length) {
      return {
        regularQuizzes: [],
        mockQuizzes: [],
        heatmapData: [],
        regularProgressData: [],
        mockProgressData: [],
        stats: { totalQuizzes: 0, avgScore: 0 }
      };
    }

    // Filter quizzes efficiently
    const regular = [];
    const mock = [];
    
    testResults.forEach(result => {
      if (isMockQuiz(result.quizName)) {
        mock.push(result);
      } else {
        regular.push(result);
      }
    });

    // Prepare heatmap data with optimized date handling
    const prepareHeatmapData = () => {
      const today = new Date();
      const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
      
      // Create date map for faster lookups
      const resultsByDate = {};
      testResults.forEach(result => {
        const dateStr = new Date(result.date).toISOString().split('T')[0];
        if (!resultsByDate[dateStr]) resultsByDate[dateStr] = [];
        resultsByDate[dateStr].push(result);
      });

      const heatmapData = [];
      const currentDate = new Date(oneYearAgo);

      while (currentDate <= today) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayResults = resultsByDate[dateStr] || [];
        
        heatmapData.push({
          date: dateStr,
          count: dayResults.length,
          scores: dayResults.map(r => Math.round((r.score / r.total) * 100)),
          avgScore: dayResults.length > 0 ? Math.round(
            dayResults.reduce((acc, r) => acc + (r.score / r.total * 100), 0) / dayResults.length
          ) : 0
        });
        
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      return heatmapData;
    };

    // Optimized progress data preparation
    const prepareProgressData = (quizzes) => {
      if (!quizzes.length) return [];
      
      return quizzes
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((result, index) => {
          const scorePercent = Math.round((result.score / result.total) * 100);
          const resultDate = new Date(result.date);

          return {
            uniqueKey: `${index}-${resultDate.getTime()}`,
            day: index + 1,
            date: resultDate.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            }),
            score: scorePercent,
            quizName: result.quizName || 'Unknown Quiz',
            topic: result.topic || 'General',
            totalQuestions: result.total,
            correctAnswers: result.score,
            dateTime: resultDate.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            }),
            originalData: result,
            rawDate: result.date
          };
        });
    };

    const heatmapData = prepareHeatmapData();
    const regularProgressData = prepareProgressData(regular);
    const mockProgressData = prepareProgressData(mock);
    
    const totalQuizzes = testResults.length;
    const avgScore = totalQuizzes > 0 ? Math.round(
      testResults.reduce((acc, result) => acc + (result.score / result.total * 100), 0) / totalQuizzes
    ) : 0;

    return {
      regularQuizzes: regular,
      mockQuizzes: mock,
      heatmapData,
      regularProgressData,
      mockProgressData,
      stats: { totalQuizzes, avgScore }
    };
  }, [testResults, isMockQuiz]);

  // Memoize pagination calculations
  const paginationData = useMemo(() => {
    const totalPages = Math.ceil(testResults.length / resultsPerPage);
    const startIndex = (currentPage - 1) * resultsPerPage;
    const endIndex = startIndex + resultsPerPage;
    const currentResults = testResults.slice(startIndex, endIndex);
    
    return { totalPages, startIndex, endIndex, currentResults };
  }, [testResults, currentPage, resultsPerPage]);

  // Memoize handlers to prevent unnecessary re-renders
  const handlePageChange = useCallback((event, page) => {
    setCurrentPage(page);
  }, []);

  const viewResultDetails = useCallback((result) => {
    navigate('/user/view-result', { state: { results: result } });
  }, [navigate]);

  const deleteResult = useCallback(async (resultId) => {
    try {
      const user = JSON.parse(localStorage.getItem('quizUser') || '{}');
      const token = user.token;
      const response = await fetch(`${API_URL}/api/test-history/${resultId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete test result');
      }

      loadResults();
      const newTotal = testResults.length - 1;
      const newTotalPages = Math.ceil(newTotal / resultsPerPage);
      if (currentPage > newTotalPages && newTotalPages > 0) {
        setCurrentPage(newTotalPages);
      }

      setSnackbarMessage('Result deleted successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error deleting test result:', err);
      setError(err.message);
      setSnackbarMessage('Error deleting result');
      setSnackbarOpen(true);
    }
  }, [testResults, currentPage, resultsPerPage, loadResults]);

  const handleSnackbarClose = useCallback(() => {
    setSnackbarOpen(false);
  }, []);

  if (loading && !dataReady.basic) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: { xs: 1, md: 4 } }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        <Button variant="contained" onClick={loadResults}>
          Retry
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 1, md: 3 }, px: { xs: 1, md: 3 } }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: { xs: 3, md: 5 } }}>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 900,
            mb: 2,
            fontSize: { xs: '2rem', md: '4rem' },
            background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.error.main})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '2px 2px 4px rgba(0,0,0,0.1)'
          }}
        >
          Progress Tracker
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          sx={{
            fontSize: { xs: '1rem', md: '1.4rem' },
            maxWidth: 700,
            mx: 'auto',
            fontWeight: 400,
            lineHeight: 1.4,
            px: { xs: 2, md: 0 }
          }}
        >
          Monitor your quiz performance, track improvement trends, and achieve your learning goals
        </Typography>
      </Box>

      {testResults.length === 0 ? (
        <EmptyState theme={theme} />
      ) : (
        <>
          {/* Stats Overview - Show immediately when basic data is ready */}
          {dataReady.stats ? (
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: { xs: 1.5, md: 3 },
                mb: { xs: 4, md: 6 },
                maxWidth: 900,
                mx: 'auto',
                px: { xs: 1, md: 0 }
              }}
            >
              <StatsCard
                title="Total Solved"
                value={processedData.stats.totalQuizzes}
                icon={QuizIcon}
                color={theme.palette.primary.main}
                bgColor={theme.palette.primary.main}
                theme={theme}
              />
              <StatsCard
                title="Average Score"
                value={`${processedData.stats.avgScore}%`}
                icon={TrendingUpIcon}
                color={theme.palette.success.main}
                bgColor={theme.palette.success.main}
                theme={theme}
              />
              <StatsCard
                title="Regular Quizzes"
                value={processedData.regularQuizzes.length}
                icon={QuizIcon}
                color={theme.palette.info.main}
                bgColor={theme.palette.info.main}
                theme={theme}
              />
              <StatsCard
                title="Mock Quizzes"
                value={processedData.mockQuizzes.length}
                icon={SmartToyIcon}
                color={theme.palette.warning.main}
                bgColor={theme.palette.warning.main}
                theme={theme}
              />
            </Box>
          ) : (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: 2, 
              mb: 4,
              flexWrap: 'wrap' 
            }}>
              {[...Array(4)].map((_, i) => (
                <Skeleton 
                  key={i}
                  variant="rectangular" 
                  width={160} 
                  height={140} 
                  sx={{ borderRadius: 2 }} 
                />
              ))}
            </Box>
          )}

          {/* Progress Charts - Show with suspense */}
          <Box sx={{
            maxWidth: 1200,
            mx: 'auto',
            mb: { xs: 4, md: 6 },
            px: { xs: 0, md: 2 }
          }}>
            <Typography
              variant="h4"
              sx={{
                textAlign: 'center',
                mb: { xs: 3, md: 4 },
                fontWeight: 700,
                color: 'text.primary',
                fontSize: { xs: '1.5rem', md: '2rem' }
              }}
            >
              Performance Analytics
            </Typography>

            {dataReady.charts ? (
              <Suspense fallback={
                <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
                  <Grid item xs={12} lg={6}>
                    <ChartSkeleton />
                  </Grid>
                  <Grid item xs={12} lg={6}>
                    <ChartSkeleton />
                  </Grid>
                </Grid>
              }>
                <Grid
                  container
                  spacing={{ xs: 2, md: 3 }}
                  justifyContent="center"
                  alignItems="stretch"
                >
                  <Grid item xs={12} lg={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ProgressChart
                      data={processedData.regularProgressData}
                      title="Regular Quiz Progress"
                      color={theme.palette.primary.main}
                      icon={QuizIcon}
                      theme={theme}
                    />
                  </Grid>
                  <Grid item xs={12} lg={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <ProgressChart
                      data={processedData.mockProgressData}
                      title="Mock Quiz Progress"
                      color={theme.palette.warning.main}
                      icon={SmartToyIcon}
                      theme={theme}
                    />
                  </Grid>
                </Grid>
              </Suspense>
            ) : (
              <Grid container spacing={{ xs: 2, md: 3 }} justifyContent="center">
                <Grid item xs={12} lg={6}>
                  <ChartSkeleton />
                </Grid>
                <Grid item xs={12} lg={6}>
                  <ChartSkeleton />
                </Grid>
              </Grid>
            )}
          </Box>

          {/* Activity Heatmap */}
          {dataReady.heatmap ? (
            <Suspense fallback={<HeatmapSkeleton />}>
              <Paper sx={{
                p: { xs: 2, md: 5 },
                mb: { xs: 4, md: 6 },
                mx: { xs: 1, md: 'auto' },
                borderRadius: 4,
                border: `2px solid ${theme.palette.divider}`,
                background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
                maxWidth: 1000
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: { xs: 3, md: 4 } }}>
                  <CalendarTodayIcon sx={{ mr: 2, color: theme.palette.primary.main, fontSize: { xs: 24, md: 32 } }} />
                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      fontSize: { xs: '1.3rem', md: '2rem' },
                      color: 'text.primary'
                    }}
                  >
                    Activity Overview
                  </Typography>
                </Box>
                <HeatmapCalendar 
                  data={processedData.heatmapData} 
                  theme={theme} 
                  isSmallScreen={breakpoints.isSmallScreen} 
                />
              </Paper>
            </Suspense>
          ) : (
            <HeatmapSkeleton />
          )}

          {/* Quiz History Table */}
          {dataReady.table ? (
            <Suspense fallback={<TableSkeleton />}>
              <QuizHistoryTable
                currentResults={paginationData.currentResults}
                startIndex={paginationData.startIndex}
                endIndex={paginationData.endIndex}
                totalResults={testResults.length}
                currentPage={currentPage}
                totalPages={paginationData.totalPages}
                isMobile={breakpoints.isMobile}
                theme={theme}
                onViewResult={viewResultDetails}
                onDeleteResult={deleteResult}
                onPageChange={handlePageChange}
              />
            </Suspense>
          ) : (
            <TableSkeleton />
          )}
        </>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={error ? 'error' : 'success'}
          sx={{ borderRadius: 3 }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TestHistory;
