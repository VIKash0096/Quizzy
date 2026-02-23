import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const StatsCard = ({ title, value, subtitle, icon: Icon, color, bgColor, theme }) => (
  <Card
    elevation={4}
    sx={{
      textAlign: 'center',
      width: { xs: 160, sm: 180, md: 200 },
      height: { xs: 140, sm: 160, md: 180 },
      background: bgColor ? `linear-gradient(135deg, ${bgColor}15 0%, ${bgColor}05 100%)` : 'background.paper',
      border: `2px solid ${color}20`,
      transition: 'all 0.3s ease-in-out',
      '&:hover': {
        transform: 'translateY(-8px)',
        boxShadow: theme.shadows[12],
        border: `2px solid ${color}40`
      }
    }}
  >
    <CardContent sx={{
      py: { xs: 2, md: 3 },
      px: 1,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      {Icon && (
        <Icon sx={{
          fontSize: { xs: 28, md: 36 },
          color: color,
          mb: 1.5
        }} />
      )}
      <Typography
        variant="h3"
        sx={{
          fontWeight: 800,
          color: color,
          fontSize: { xs: '1.8rem', md: '2.2rem' },
          mb: 1,
          lineHeight: 1
        }}
      >
        {value}
      </Typography>
      <Typography
        variant="body2"
        color="text.primary"
        sx={{
          fontWeight: 600,
          fontSize: { xs: '0.8rem', md: '0.9rem' },
          textAlign: 'center'
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default StatsCard;
