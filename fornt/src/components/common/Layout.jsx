import React, { useState, useEffect } from 'react';
import logo from '../../assests/images/logo2.png';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Typography,
  useTheme,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Avatar,
  Chip,
  Divider
} from '@mui/material';
import {
  Menu as MenuIcon,
  Brightness4,
  Brightness7,
  AccountCircle,
  Quiz as QuizIcon,
  History as HistoryIcon,
  People as PeopleIcon,
  ExitToApp as LogoutIcon,
  FiberNew as NewIcon,
  Dashboard as DashboardIcon,
  Create as CreateIcon,
  ManageAccounts as ManageIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useThemeMode } from '../../contexts/ThemeContext';
import Navbar from './Navbar';

// API URL configuration for environment support
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};
const API_URL = getApiUrl();
const drawerWidth = 260;

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const { mode, toggleColorMode } = useThemeMode();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [recentQuizzes, setRecentQuizzes] = useState([]);
  const [sidebarScrolled, setSidebarScrolled] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Handle sidebar scroll detection
  const handleSidebarScroll = (e) => {
    const scrollTop = e.target.scrollTop;
    setSidebarScrolled(scrollTop > 20);
  };

  // Fetch recent quizzes from database (only for users)
  useEffect(() => {
    const fetchRecentQuizzes = async () => {
      try {
        const userToken = JSON.parse(localStorage.getItem('quizUser') || '{}');
        const token = userToken.token;
        if (!token) return;

        const response = await fetch(`${API_URL}/api/quizzes/public`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          const last4Quizzes = (data.quizzes || []).slice(-4);
          setRecentQuizzes(last4Quizzes);
        }
      } catch (error) {
        console.error('Error fetching recent quizzes:', error);
        setRecentQuizzes([
          { name: 'Python Basics', topic: 'Programming' },
          { name: 'React Fundamentals', topic: 'Programming' },
          { name: 'JavaScript ES6', topic: 'Programming' },
          { name: 'Node.js Intro', topic: 'Programming' }
        ]);
      }
    };

    if (user?.role === 'user') {
      fetchRecentQuizzes();
    }
  }, [user]);

  // Admin Sidebar Content (keeping original design)
  const AdminSidebar = (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      overflow: 'auto',
      bgcolor: 'background.paper'
    }}>
      {/* Quiz Management Section */}
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
          Quiz Management
        </Typography>
        <List dense>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                navigate('/admin?view=create');
                if (isMobile) setMobileOpen(false);
              }}
              sx={{ borderRadius: 1 }}
            >
              <ListItemIcon>
                <CreateIcon />
              </ListItemIcon>
              <ListItemText primary="Create New Quiz" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              onClick={() => {
                navigate('/admin?view=manage');
                if (isMobile) setMobileOpen(false);
              }}
              sx={{ borderRadius: 1 }}
            >
              <ListItemIcon>
                <ManageIcon />
              </ListItemIcon>
              <ListItemText primary="Manage Quizzes" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* Admin Info Section */}
      <Box sx={{ p: 2, flexGrow: 1 }}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
          Hello "{user?.username || 'admin'}"
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          Administrator
        </Typography>
      </Box>

      {/* Logout Section */}
      <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Typography
          onClick={handleLogout}
          sx={{
            color: 'error.main',
            cursor: 'pointer',
            fontSize: '0.9rem',
            '&:hover': { textDecoration: 'underline' }
          }}
        >
          🚪 Log out
        </Typography>
      </Box>
    </Box>
  );

  // Enhanced User Sidebar Content - With Scroll Effects
  const UserSidebar = (
    <Box 
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'auto',
        bgcolor: 'background.paper',
        background: theme.palette.mode === 'dark'
          ? 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)'
          : 'linear-gradient(135deg, #f8f9ff 0%, #e8f0fe 100%)',
        position: 'relative',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '&::-webkit-scrollbar-thumb': {
          background: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.2)'
            : 'rgba(0, 0, 0, 0.2)',
          borderRadius: '10px',
          transition: 'all 0.3s ease',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.4)'
            : 'rgba(0, 0, 0, 0.4)',
        },
        '&::before': sidebarScrolled ? {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '20px',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(to bottom, rgba(26, 26, 26, 1) 0%, rgba(26, 26, 26, 0) 100%)'
            : 'linear-gradient(to bottom, rgba(248, 249, 255, 1) 0%, rgba(248, 249, 255, 0) 100%)',
          zIndex: 10,
          pointerEvents: 'none'
        } : {},
      }}
      onScroll={handleSidebarScroll}
    >
      {/* User Profile Section - Enhanced with scroll effects */}
      <Box sx={{
        p: 3,
        borderBottom: '1px solid',
        borderColor: 'divider',
        background: sidebarScrolled 
          ? (theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(30, 60, 114, 0.95) 0%, rgba(42, 82, 152, 0.95) 100%)'
              : 'linear-gradient(135deg, rgba(102, 126, 234, 0.95) 0%, rgba(118, 75, 162, 0.95) 100%)')
          : (theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'),
        color: 'white',
        backdropFilter: sidebarScrolled ? 'blur(10px)' : 'none',
        boxShadow: sidebarScrolled 
          ? (theme.palette.mode === 'dark'
              ? '0 4px 20px rgba(0, 0, 0, 0.3)'
              : '0 4px 20px rgba(102, 126, 234, 0.2)')
          : 'none',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'sticky',
        top: 0,
        zIndex: 5
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar
            sx={{
              width: sidebarScrolled ? 45 : 50,
              height: sidebarScrolled ? 45 : 50,
              mr: 2,
              bgcolor: 'rgba(255,255,255,0.2)',
              fontSize: '1.5rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease',
              boxShadow: sidebarScrolled 
                ? '0 4px 15px rgba(255, 255, 255, 0.2)'
                : '0 2px 8px rgba(255, 255, 255, 0.1)'
            }}
          >
            {user?.username?.charAt(0)?.toUpperCase() || 'U'}
          </Avatar>
          <Box>
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 0.5,
                fontSize: sidebarScrolled ? '1.1rem' : '1.25rem',
                transition: 'all 0.3s ease'
              }}
            >
              {user?.username || 'Username'}
            </Typography>
            <Chip
              label="Student"
              size="small"
              sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: '0.75rem',
                height: sidebarScrolled ? '18px' : '20px',
                transition: 'all 0.3s ease'
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* Consolidated Navigation Section - Enhanced */}
      <Box sx={{ 
        p: 2, 
        flexGrow: 1,
        background: sidebarScrolled 
          ? (theme.palette.mode === 'dark'
              ? 'rgba(26, 26, 26, 0.95)'
              : 'rgba(248, 249, 255, 0.95)')
          : 'transparent',
        backdropFilter: sidebarScrolled ? 'blur(10px)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <Typography variant="subtitle2" sx={{
          fontWeight: 600,
          mb: 3,
          color: 'text.secondary',
          textTransform: 'uppercase',
          letterSpacing: 1,
          opacity: sidebarScrolled ? 0.8 : 1,
          transition: 'all 0.3s ease'
        }}>
          Navigation
        </Typography>
        
        <List sx={{ p: 0 }}>
          {/* Your Quizzes */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => {
                navigate('/user/quiz');
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 2,
                backdropFilter: sidebarScrolled ? 'blur(5px)' : 'none',
                background: sidebarScrolled 
                  ? (theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.02)'
                      : 'rgba(0, 0, 0, 0.02)')
                  : 'transparent',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(103, 58, 183, 0.1)'
                    : 'rgba(103, 58, 183, 0.08)',
                  transform: 'translateY(-2px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(103, 58, 183, 0.3)'
                    : '0 4px 20px rgba(103, 58, 183, 0.15)',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 45 }}>
                <QuizIcon sx={{ color: '#673ab7', fontSize: '1.4rem' }} />
              </ListItemIcon>
              <ListItemText
                primary="Your Quizzes"
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              />
            </ListItemButton>
          </ListItem>

          {/* Quiz History */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              onClick={() => {
                navigate('/user/history');
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 2,
                backdropFilter: sidebarScrolled ? 'blur(5px)' : 'none',
                background: sidebarScrolled 
                  ? (theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.02)'
                      : 'rgba(0, 0, 0, 0.02)')
                  : 'transparent',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(255, 152, 0, 0.1)'
                    : 'rgba(255, 152, 0, 0.08)',
                  transform: 'translateY(-2px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(255, 152, 0, 0.3)'
                    : '0 4px 20px rgba(255, 152, 0, 0.15)',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 45 }}>
                <HistoryIcon sx={{ color: '#ff9800', fontSize: '1.4rem' }} />
              </ListItemIcon>
              <ListItemText
                primary="Quiz History"
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              />
            </ListItemButton>
          </ListItem>

          {/* Your Friends */}
          <ListItem disablePadding sx={{ mb: 1 }}>
            <ListItemButton
              sx={{
                borderRadius: 2,
                py: 1.5,
                px: 2,
                backdropFilter: sidebarScrolled ? 'blur(5px)' : 'none',
                background: sidebarScrolled 
                  ? (theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.02)'
                      : 'rgba(0, 0, 0, 0.02)')
                  : 'transparent',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark'
                    ? 'rgba(76, 175, 80, 0.1)'
                    : 'rgba(76, 175, 80, 0.08)',
                  transform: 'translateY(-2px)',
                  boxShadow: theme.palette.mode === 'dark'
                    ? '0 4px 20px rgba(76, 175, 80, 0.3)'
                    : '0 4px 20px rgba(76, 175, 80, 0.15)',
                  transition: 'all 0.3s ease',
                  backdropFilter: 'blur(10px)'
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 45 }}>
                <PeopleIcon sx={{ color: '#4caf50', fontSize: '1.4rem' }} />
              </ListItemIcon>
              <ListItemText
                primary="Your Friends"
                primaryTypographyProps={{
                  fontWeight: 600,
                  fontSize: '0.95rem'
                }}
              />
            </ListItemButton>
          </ListItem>

          <Divider sx={{ 
            my: 2,
            background: sidebarScrolled 
              ? (theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.1)'
                  : 'rgba(0, 0, 0, 0.1)')
              : undefined,
            transition: 'all 0.3s ease'
          }} />

          {/* Recent Quizzes Section - Enhanced */}
          <Typography variant="body2" sx={{
            fontWeight: 600,
            mb: 2,
            color: 'text.secondary',
            display: 'flex',
            alignItems: 'center',
            opacity: sidebarScrolled ? 0.9 : 1,
            transition: 'all 0.3s ease'
          }}>
            <NewIcon sx={{ color: '#ff4081', mr: 1, fontSize: '1.2rem' }} />
            Recent Quizzes
          </Typography>
          
          {recentQuizzes.map((quiz, index) => (
            <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate('/user/quiz-detail', { state: { quiz } });
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: 1.5,
                  py: 1,
                  px: 2,
                  ml: 2,
                  background: sidebarScrolled 
                    ? (theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'rgba(0, 0, 0, 0.02)')
                    : 'transparent',
                  '&:hover': {
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                    transform: 'translateX(4px)',
                    transition: 'all 0.2s ease',
                    backdropFilter: 'blur(5px)'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 35 }}>
                  <Box sx={{
                    width: 6,
                    height: 6,
                    borderRadius: '50%',
                    bgcolor: '#4caf50',
                    boxShadow: sidebarScrolled ? '0 0 8px rgba(76, 175, 80, 0.4)' : 'none',
                    transition: 'all 0.3s ease'
                  }} />
                </ListItemIcon>
                <ListItemText
                  primary={quiz.name || quiz.topic}
                  primaryTypographyProps={{
                    fontSize: '0.8rem',
                    color: 'text.secondary',
                    fontWeight: 500
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Sign Out - Enhanced with scroll effects */}
      <Box sx={{
        p: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        background: sidebarScrolled 
          ? (theme.palette.mode === 'dark'
              ? 'rgba(244, 67, 54, 0.08)'
              : 'rgba(244, 67, 54, 0.05)')
          : (theme.palette.mode === 'dark'
              ? 'rgba(244, 67, 54, 0.05)'
              : 'rgba(244, 67, 54, 0.02)'),
        backdropFilter: sidebarScrolled ? 'blur(10px)' : 'none',
        transition: 'all 0.3s ease',
        position: 'sticky',
        bottom: 0,
        zIndex: 5
      }}>
        <ListItemButton
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            py: 1.5,
            px: 2,
            '&:hover': {
              bgcolor: 'rgba(244, 67, 54, 0.1)',
              transform: 'translateY(-1px)',
              transition: 'all 0.2s ease',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 15px rgba(244, 67, 54, 0.2)'
            }
          }}
        >
          <ListItemIcon sx={{ minWidth: 45 }}>
            <LogoutIcon sx={{ color: 'error.main', fontSize: '1.3rem' }} />
          </ListItemIcon>
          <ListItemText
            primary="Sign Out"
            primaryTypographyProps={{
              color: 'error.main',
              fontWeight: 600,
              fontSize: '0.95rem'
            }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  const drawer = user?.role === 'admin' ? AdminSidebar : UserSidebar;

  // Return children only if no user (for login/register pages)
  if (!user) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        width: '100vw', 
        height: '100vh',
        overflow: 'hidden' // Prevent window scroll
      }}>
        <AppBar
          position="static"
          elevation={0}
          sx={{
            backgroundColor: 'background.paper',
            borderBottom: '1px solid',
            borderBottomColor: 'divider',
            flexShrink: 0
          }}
        >
          <Toolbar>
            <Typography
              variant="h4"
              component="div"
              sx={{
                flexGrow: 1,
                textAlign: 'center',
                fontWeight: 'bold',
                color: '#ff4081'
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{ height: 60, width: 'auto', verticalAlign: 'middle' }}
              />
            </Typography>
            <IconButton onClick={toggleColorMode} sx={{ color: 'text.primary' }}>
              {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Box
          sx={{
            flexGrow: 1,
            p: 0, // REMOVED MOBILE MARGIN/PADDING
            width: '100%',
            height: 'calc(100vh - 64px)', // Subtract AppBar height
            overflowY: 'auto', // Allow content to scroll internally
            overflowX: 'hidden'
          }}
        >
          {children}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      height: '100vh', // Fixed height
      width: '100vw', // Fixed width
      overflow: 'hidden', // Prevent window scroll
      position: 'relative'
    }}>
      {/* Mobile Sidebar */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            position: 'fixed',
            height: '100vh',
            top: 0,
            left: 0,
            zIndex: 1300
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop Sidebar - FIXED POSITION */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: drawerWidth,
            position: 'fixed',
            height: '100vh',
            top: 0,
            left: 0,
            zIndex: 1200,
            borderRight: '1px solid',
            borderColor: 'divider'
          },
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Main content area - ADJUSTED FOR FIXED SIDEBAR */}
      <Box sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        height: '100vh', // Fixed height
        marginLeft: { xs: 0, sm: `${drawerWidth}px` },
        width: { xs: '100vw', sm: `calc(100vw - ${drawerWidth}px)` },
        bgcolor: 'background.default',
        overflow: 'hidden' // Prevent content area from causing window scroll
      }}>
        <Navbar onMenuClick={handleDrawerToggle} />
        <Box sx={{
          flexGrow: 1,
          px: { xs: 0, sm: 3 }, // REMOVED MOBILE HORIZONTAL PADDING
          pt: { xs: 0, sm: 3 }, // REMOVED MOBILE TOP PADDING  
          pb: { xs: 0, sm: 3 }, // REMOVED MOBILE BOTTOM PADDING
          overflowY: 'auto', // Allow internal scrolling for content
          overflowX: 'hidden',
          height: 'calc(100vh - 64px)', // Subtract navbar height
          width: '100%'
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
