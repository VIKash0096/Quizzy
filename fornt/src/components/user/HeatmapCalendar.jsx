import React, { useState } from 'react';
import { Box, Typography, Tooltip, Paper, Divider, Modal, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const HeatmapCalendar = ({ data, theme, isSmallScreen }) => {
  const [selectedDay, setSelectedDay] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const getIntensity = (count) => {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count === 2) return 2;
    if (count === 3) return 3;
    if (count >= 4) return 4;
    return 0;
  };

  const getColor = (intensity) => {
    const darkMode = theme.palette.mode === 'dark';
    const colors = darkMode
      ? ['rgba(255,255,255,0.08)', '#0d3421', '#196127', '#239a3b', '#2ea043']
      : ['#ebedf0', '#9be9a8', '#40c463', '#30a14e', '#216e39'];
    return colors[intensity] || colors[0];
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getMonthLabels = () => {
    const months = [];
    const today = new Date();
    const startDate = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    for (let i = 0; i < 12; i++) {
      const monthDate = new Date(startDate.getFullYear(), startDate.getMonth() + i + 1, 1);
      months.push({
        name: monthDate.toLocaleDateString('en-US', { month: 'short' }),
        index: i
      });
    }
    return months;
  };

  const getActivityStats = () => {
    const activeDays = data.filter(day => day.count > 0).length;
    const maxDailyQuizzes = data.length > 0 ? Math.max(...data.map(day => day.count)) : 0;
    return { activeDays, maxDailyQuizzes };
  };

  const handleDayClick = (day) => {
    if (isSmallScreen) {
      setSelectedDay(day);
      setModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedDay(null);
  };

  const CustomTooltip = ({ day }) => (
    <Paper 
      elevation={8}
      sx={{
        p: 2,
        maxWidth: 280,
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(0, 0, 0, 0.95)' 
          : 'rgba(255, 255, 255, 0.95)',
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 2
      }}
    >
      <Typography 
        variant="subtitle2" 
        sx={{ 
          fontWeight: 700,
          color: 'primary.main',
          mb: 1
        }}
      >
        {formatDate(day.date)}
      </Typography>
      
      <Divider sx={{ my: 1 }} />
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Quizzes Taken:
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              fontWeight: 600,
              color: day.count > 0 ? 'success.main' : 'text.secondary'
            }}
          >
            {day.count}
          </Typography>
        </Box>
        
        {day.count > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              Average Score:
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                fontWeight: 600,
                color: day.avgScore >= 70 ? 'success.main' : 
                       day.avgScore >= 40 ? 'warning.main' : 'error.main'
              }}
            >
              {day.avgScore}%
            </Typography>
          </Box>
        )}
        
        {day.count > 1 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
            Great job staying consistent! 🎉
          </Typography>
        )}
        
        {day.count === 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, fontStyle: 'italic' }}>
            No activity on this day
          </Typography>
        )}
      </Box>
    </Paper>
  );

  // Mobile Modal Component
  const MobileModal = () => (
    <Modal
      open={modalOpen}
      onClose={handleModalClose}
      aria-labelledby="day-info-modal"
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2
      }}
    >
      <Paper
        sx={{
          position: 'relative',
          p: 3,
          maxWidth: 350,
          width: '100%',
          backgroundColor: theme.palette.background.paper,
          borderRadius: 3,
          boxShadow: theme.shadows[10],
          border: `2px solid ${theme.palette.primary.main}20`
        }}
      >
        <IconButton
          onClick={handleModalClose}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            color: 'text.secondary'
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>

        {selectedDay && (
          <>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700,
                color: 'primary.main',
                mb: 2,
                pr: 4 // Make room for close button
              }}
            >
              {formatDate(selectedDay.date)}
            </Typography>
            
            <Divider sx={{ my: 2 }} />
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                p: 1.5,
                backgroundColor: theme.palette.mode === 'dark' 
                  ? 'rgba(255, 255, 255, 0.05)' 
                  : 'rgba(0, 0, 0, 0.05)',
                borderRadius: 2
              }}>
                <Typography variant="body1" color="text.secondary">
                  📚 Quizzes Taken:
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    fontWeight: 700,
                    color: selectedDay.count > 0 ? 'success.main' : 'text.secondary'
                  }}
                >
                  {selectedDay.count}
                </Typography>
              </Box>
              
              {selectedDay.count > 0 && (
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  p: 1.5,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(0, 0, 0, 0.05)',
                  borderRadius: 2
                }}>
                  <Typography variant="body1" color="text.secondary">
                    🎯 Average Score:
                  </Typography>
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontWeight: 700,
                      color: selectedDay.avgScore >= 70 ? 'success.main' : 
                             selectedDay.avgScore >= 40 ? 'warning.main' : 'error.main'
                    }}
                  >
                    {selectedDay.avgScore}%
                  </Typography>
                </Box>
              )}
              
              {selectedDay.count > 1 && (
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2,
                  backgroundColor: 'success.main',
                  color: 'success.contrastText',
                  borderRadius: 2,
                  mt: 1
                }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    🎉 Great job staying consistent!
                  </Typography>
                </Box>
              )}
              
              {selectedDay.count === 0 && (
                <Box sx={{ 
                  textAlign: 'center', 
                  p: 2,
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.1)' 
                    : 'rgba(0, 0, 0, 0.1)',
                  borderRadius: 2,
                  mt: 1
                }}>
                  <Typography variant="body2" color="text.secondary">
                    😴 No activity on this day
                  </Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </Paper>
    </Modal>
  );

  const { activeDays, maxDailyQuizzes } = getActivityStats();

  return (
    <Box sx={{ overflowX: 'auto', py: 2 }}>
      {/* Header with improved typography */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Typography 
          variant="body1" 
          color="text.primary" 
          sx={{ 
            fontWeight: 600,
            mb: 1,
            fontSize: { xs: '0.9rem', md: '1rem' }
          }}
        >
          Quiz Activity Heatmap
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ fontSize: { xs: '0.75rem', md: '0.85rem' } }}
        >
          {isSmallScreen ? 'Tap squares for details' : 'Hover over squares for details'}
        </Typography>
      </Box>

      {/* Month labels */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        mb: 2,
        px: 2,
        gap: { xs: 2, md: 4 }
      }}>
        {getMonthLabels().slice(0, isSmallScreen ? 6 : 12).map((month) => (
          <Typography 
            key={month.name}
            variant="caption" 
            color="text.secondary"
            sx={{ 
              fontSize: { xs: '0.6rem', md: '0.75rem' },
              fontWeight: 500,
              minWidth: { xs: 20, md: 30 },
              textAlign: 'center'
            }}
          >
            {month.name}
          </Typography>
        ))}
      </Box>

      {/* Heatmap grid with enhanced styling */}
      <Box sx={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: isSmallScreen ? '2px' : '3px',
        minWidth: isSmallScreen ? '300px' : '650px',
        justifyContent: 'center',
        px: 2,
        py: 2,
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.02)' 
          : 'rgba(0, 0, 0, 0.02)',
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`
      }}>
        {data.map((day, index) => {
          const DaySquare = (
            <Box
              key={day.date}
              onClick={() => handleDayClick(day)}
              sx={{
                width: isSmallScreen ? 12 : 13,
                height: isSmallScreen ? 12 : 13,
                backgroundColor: getColor(getIntensity(day.count)),
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1.5,
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative',
                '&:hover': !isSmallScreen ? {
                  border: `2px solid ${theme.palette.primary.main}`,
                  transform: 'scale(1.3)',
                  zIndex: 10,
                  boxShadow: theme.shadows[4],
                  borderRadius: 2
                } : {},
                '&:active': {
                  transform: 'scale(0.95)'
                },
                // Mobile tap effects
                ...(isSmallScreen && {
                  '&:active': {
                    transform: 'scale(1.1)',
                    backgroundColor: theme.palette.primary.main + '20'
                  }
                })
              }}
            />
          );

          // For desktop, wrap with Tooltip. For mobile, return plain box
          return isSmallScreen ? DaySquare : (
            <Tooltip
              key={day.date}
              title={<CustomTooltip day={day} />}
              placement="top"
              arrow
              enterDelay={200}
              leaveDelay={100}
            >
              {DaySquare}
            </Tooltip>
          );
        })}
      </Box>

      {/* Enhanced legend */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        gap: 2, 
        mt: 4,
        p: 2,
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.03)' 
          : 'rgba(0, 0, 0, 0.03)',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`
      }}>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ fontWeight: 500, fontSize: { xs: '0.7rem', md: '0.75rem' } }}
        >
          Less
        </Typography>
        
        <Box sx={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {[0, 1, 2, 3, 4].map(intensity => (
            <Box
              key={intensity}
              sx={{
                width: { xs: 12, md: 14 },
                height: { xs: 12, md: 14 },
                backgroundColor: getColor(intensity),
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 1.5,
                transition: 'transform 0.2s ease',
                '&:hover': !isSmallScreen ? {
                  transform: 'scale(1.1)'
                } : {}
              }}
            />
          ))}
        </Box>
        
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ fontWeight: 500, fontSize: { xs: '0.7rem', md: '0.75rem' } }}
        >
          More
        </Typography>
      </Box>

      {/* Activity summary */}
      <Box sx={{ 
        textAlign: 'center', 
        mt: 3,
        p: 2,
        backgroundColor: theme.palette.mode === 'dark' 
          ? 'rgba(255, 255, 255, 0.02)' 
          : 'rgba(0, 0, 0, 0.02)',
        borderRadius: 2,
        border: `1px solid ${theme.palette.divider}`
      }}>
        <Typography 
          variant="caption" 
          color="text.secondary"
          sx={{ fontSize: { xs: '0.7rem', md: '0.75rem' } }}
        >
          Total active days: {activeDays} | 
          Best streak: {maxDailyQuizzes} quizzes in a day
        </Typography>
      </Box>

      {/* Mobile Modal */}
      <MobileModal />
    </Box>
  );
};

export default HeatmapCalendar;
