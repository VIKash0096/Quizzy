import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, Button, useMediaQuery, Chip } from '@mui/material';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, LabelList } from 'recharts';
import { useNavigate } from 'react-router-dom';
import QuizIcon from '@mui/icons-material/Quiz';
import AssessmentIcon from '@mui/icons-material/Assessment';

const ProgressChart = ({ data, title, color, icon: Icon, theme }) => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedPointIndex, setSelectedPointIndex] = useState(null);

  // Mobile: Tap to select point, Desktop: Normal hover
  const handleAreaClick = (data, index) => {
    if (isMobile) {
      const clickedIndex = data?.activeTooltipIndex;
      setSelectedPointIndex(selectedPointIndex === clickedIndex ? null : clickedIndex);
    }
  };

  // Enhanced Custom Label - Always visible
  const CustomLabel = (props) => {
    const { x, y, value, index } = props;
    const isSelected = isMobile && selectedPointIndex === index;

    return (
      <g>
        {/* Background circle for better visibility on mobile */}
        {isMobile && (
          <circle
            cx={x}
            cy={y - 15}
            r={isSelected ? 12 : 8}
            fill={isSelected ? color : theme.palette.background.paper}
            stroke={color}
            strokeWidth={isSelected ? 3 : 2}
            opacity={0.9}
          />
        )}
        <text
          x={x}
          y={y - (isMobile ? 11 : 12)}
          fill={isMobile && isSelected ? theme.palette.background.paper : color}
          textAnchor="middle"
          fontSize={isMobile ? (isSelected ? 11 : 9) : 12}
          fontWeight="bold"
          pointerEvents="none"
        >
          {value}%
        </text>
      </g>
    );
  };

  // Desktop-only tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!isMobile && active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <Box
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `2px solid ${color}`,
            borderRadius: 2,
            p: 2,
            boxShadow: theme.shadows[8],
            maxWidth: 250
          }}
        >
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            {data.quizName}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
            {data.dateTime}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            Topic: {data.topic}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption">
              Questions: {data.correctAnswers}/{data.totalQuestions}
            </Typography>
            <Chip
              label={`${data.score}%`}
              size="small"
              sx={{ backgroundColor: color, color: 'white', fontWeight: 'bold' }}
            />
          </Box>
        </Box>
      );
    }
    return null;
  };

  // Mobile selected point info
  const renderMobileSelectedInfo = () => {
    if (!isMobile || selectedPointIndex === null || !data[selectedPointIndex]) return null;

    const selectedData = data[selectedPointIndex];

    return (
      <Box
        sx={{
          mt: 2,
          p: 2,
          backgroundColor: `${color}10`,
          border: `1px solid ${color}30`,
          borderRadius: 2,
          animation: 'fadeIn 0.3s ease-in-out',
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(-10px)' },
            to: { opacity: 1, transform: 'translateY(0)' }
          }
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="subtitle2" fontWeight="bold" color={color}>
            {selectedData.quizName}
          </Typography>
          <Chip
            label={`${selectedData.score}%`}
            size="small"
            color={selectedData.score >= 70 ? "success" : selectedData.score >= 40 ? "warning" : "error"}
            sx={{ fontWeight: 'bold' }}
          />
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          {selectedData.dateTime} • Topic: {selectedData.topic}
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Correct: {selectedData.correctAnswers}/{selectedData.totalQuestions}
          </Typography>
          <Button
            size="small"
            onClick={() => setSelectedPointIndex(null)}
            sx={{ minWidth: 'auto', p: 0.5, color: 'text.secondary' }}
          >
            ✕
          </Button>
        </Box>
      </Box>
    );
  };

  return (
    <Card
      elevation={isMobile ? 2 : 8}
      sx={{
        width: { xs: 'calc(100vw - 30px)', md: '100%' }, // Full viewport width minus 30px (15px margin on each side)
        maxWidth: { xs: 'none', md: 550 },
        minWidth: { xs: 'calc(100vw - 30px)', md: 420 },
        height: 'auto',
        background: theme.palette.mode === 'dark'
          ? `linear-gradient(145deg, ${theme.palette.grey[900]} 0%, ${theme.palette.grey[800]} 100%)`
          : `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.grey[50]} 100%)`,
        borderRadius: isMobile ? 3 : 6,
        border: `1px solid ${theme.palette.divider}`,
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
        m: { xs: '15px', md: 0 }, // 15px margin on all sides for mobile
        position: 'relative',
        overflow: { xs: 'visible', md: 'hidden' }, // FIXED: Allow overflow on mobile to prevent clipping
        '&:hover': !isMobile ? {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[12],
        } : {},
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: `linear-gradient(90deg, ${color} 0%, ${color}80 100%)`,
        }
      }}
    >
      <CardContent sx={{
        p: { xs: 1.5, md: 3 }, // FIXED: Increased padding from 0.5 to 1.5 on mobile
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 1, md: 2 }
      }}>
        {/* Header */}
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, md: 2 }
        }}>
          {Icon && (
            <Box sx={{
              p: { xs: 0.8, md: 1.2 },
              borderRadius: 2,
              backgroundColor: `${color}15`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Icon sx={{ fontSize: { xs: 18, md: 24 }, color: color }} />
            </Box>
          )}
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: { xs: '1rem', md: '1.2rem' },
                color: 'text.primary'
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.7rem', md: '0.8rem' } }}
            >
              {isMobile ? 'Tap points for details' : 'Hover for details'}
            </Typography>
          </Box>
        </Box>

        {!data || data.length === 0 ? (
          <Box sx={{
            textAlign: 'center',
            py: { xs: 2, md: 4 },
            color: 'text.secondary'
          }}>
            <AssessmentIcon sx={{ fontSize: 48, color: `${color}40`, mb: 2 }} />
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              No data available
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
              Start taking quizzes to track your progress
            </Typography>
            <Button
              variant="contained"
              startIcon={<QuizIcon />}
              onClick={() => navigate('/user/quiz')}
              sx={{
                backgroundColor: color,
                '&:hover': { backgroundColor: `${color}dd` }
              }}
            >
              {isMobile ? 'Start Quiz' : 'Start Taking Quizzes'}
            </Button>
          </Box>
        ) : (
          <Box>
            {/* Stats */}
            <Box sx={{
              display: 'flex',
              justifyContent: 'space-around',
              mb: { xs: 1, md: 2 },
              p: { xs: 1, md: 1.5 },
              backgroundColor: `${color}08`,
              borderRadius: 2,
              border: `1px solid ${color}20`
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: color, fontSize: { xs: '1rem', md: '1.2rem' } }}>
                  {data.length}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', md: '0.7rem' } }}>
                  {isMobile ? 'Total' : 'Total Attempts'}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: color, fontSize: { xs: '1rem', md: '1.2rem' } }}>
                  {data.length > 0 ? Math.round(data.reduce((acc, item) => acc + item.score, 0) / data.length) : 0}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', md: '0.7rem' } }}>
                  {isMobile ? 'Avg' : 'Average'}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h6" sx={{ fontWeight: 700, color: color, fontSize: { xs: '1rem', md: '1.2rem' } }}>
                  {data.length > 0 ? Math.max(...data.map(item => item.score)) : 0}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', md: '0.7rem' } }}>
                  Best
                </Typography>
              </Box>
            </Box>

            {/* Chart */}
            <Box sx={{ 
              width: '100%', 
              height: { xs: 200, sm: 250, md: 300 },
              overflow: 'visible' // FIXED: Ensure chart container doesn't clip content
            }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={data}
                  margin={{
                    top: isMobile ? 30 : 30, // FIXED: Increased top margin for mobile labels
                    right: isMobile ? 10 : 30, // FIXED: Increased right margin for mobile
                    left: isMobile ? 5 : 0, // FIXED: Added left margin for mobile
                    bottom: isMobile ? 10 : 20 // FIXED: Increased bottom margin for mobile
                  }}
                  onClick={handleAreaClick}
                >
                  <defs>
                    <linearGradient id={`gradient-${title.replace(/\s+/g, '')}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={color} stopOpacity={0.6} />
                      <stop offset="100%" stopColor={color} stopOpacity={0.1} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} strokeOpacity={0.3} />

                  <XAxis
                    dataKey="uniqueKey"
                    axisLine={false}
                    tickLine={false}
                    tick={false}
                  />

                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: isMobile ? 9 : 11,
                      fill: theme.palette.text.secondary,
                      fontWeight: 500
                    }}
                    interval="preserveStartEnd"
                    xAxisId="display"
                  />

                  <YAxis
                    domain={[0, 100]}
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fontSize: isMobile ? 9 : 11,
                      fill: theme.palette.text.secondary,
                      fontWeight: 500
                    }}
                    width={isMobile ? 30 : 40} // FIXED: Increased width for mobile Y-axis
                    tickFormatter={(value) => `${value}%`}
                  />

                  {/* Tooltip only for desktop */}
                  {!isMobile && (
                    <RechartsTooltip
                      content={<CustomTooltip />}
                      cursor={{
                        strokeDasharray: '5 5',
                        stroke: color,
                        strokeWidth: 2,
                        strokeOpacity: 0.7
                      }}
                    />
                  )}

                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke={color}
                    strokeWidth={isMobile ? 2 : 3}
                    fill={`url(#gradient-${title.replace(/\s+/g, '')})`}
                    dot={{
                      fill: color,
                      strokeWidth: 2,
                      r: isMobile ? 3 : 4,
                      stroke: theme.palette.background.paper,
                      cursor: isMobile ? 'pointer' : 'default'
                    }}
                    activeDot={{
                      r: isMobile ? 5 : 6,
                      fill: color,
                      stroke: theme.palette.background.paper,
                      strokeWidth: 3,
                      cursor: 'pointer'
                    }}
                  >
                    <LabelList dataKey="score" content={<CustomLabel />} />
                  </Area>
                </AreaChart>
              </ResponsiveContainer>
            </Box>

            {/* Mobile: Selected point info */}
            {renderMobileSelectedInfo()}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default ProgressChart;
