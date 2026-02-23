import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Avatar,
  Divider,
  TextField,
  Button,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Paper,
  Container,
  useTheme,
  useMediaQuery,
  Fade,
  Grow
} from '@mui/material';
import {
  Person as PersonIcon,
  Edit as EditIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  Badge as BadgeIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Security as SecurityIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext.jsx';

// API URL configuration for environment support - UNCHANGED
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

const API_URL = getApiUrl();

const Profile = ({ onClose }) => {
  const { user } = useAuth();
  const theme = useTheme();
  
  // Enhanced responsive breakpoints
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const fullScreen = useMediaQuery(theme.breakpoints.down('md')); // Full screen dialog on tablet and below

  // ALL ORIGINAL STATE - UNCHANGED
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  useEffect(() => {
    console.log('Profile component mounted');
    console.log('User data:', user);
    return () => console.log('Profile component unmounted');
  }, [user]);

  // Check if user exists
  if (!user) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          User data not found. Please try logging in again.
        </Alert>
      </Container>
    );
  }

  // User info state with better fallbacks
  const [userInfo, setUserInfo] = useState({
    username: user?.username || '',
    email: user?.email || '',
    role: user?.role || 'user',
    createdAt: user?.createdAt || new Date().toISOString()
  });

  // Update userInfo when user changes
  useEffect(() => {
    if (user) {
      setUserInfo({
        username: user.username || '',
        email: user.email || '',
        role: user.role || 'user',
        createdAt: user.createdAt || new Date().toISOString()
      });
    }
  }, [user]);

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // ALL ORIGINAL HANDLERS - UNCHANGED
  const handleUserInfoChange = (field, value) => {
    setUserInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateUserInfo = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_URL}/api/auth/update-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          username: userInfo.username,
          email: userInfo.email
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Profile updated successfully!');
        setEditMode(false);
        
        const updatedUser = { ...user, ...data.user };
        localStorage.setItem('quizUser', JSON.stringify(updatedUser));
        
        setUserInfo(prev => ({
          ...prev,
          username: data.user.username,
          email: data.user.email
        }));
      } else {
        const errorData = await response.json();
        console.error('Update failed:', errorData);
        setError(errorData.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    try {
      setLoading(true);
      setError('');

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setError('New password must be at least 6 characters long');
        return;
      }

      const response = await fetch(`${API_URL}/api/auth/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (response.ok) {
        setSuccess('Password changed successfully!');
        setPasswordDialogOpen(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        const errorData = await response.json();
        console.error('Password change failed:', errorData);
        setError(errorData.message || 'Failed to change password');
      }
    } catch (err) {
      console.error('Password change error:', err);
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ALL ORIGINAL UTILITY FUNCTIONS - UNCHANGED
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? 'error' : 'primary';
  };

  const getAvatarLetter = (username) => {
    return username ? username.charAt(0).toUpperCase() : 'U';
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, sm: 3, md: 4 } }}>
      <Fade in timeout={600}>
        <Box>
          {/* Enhanced Header Card */}
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 3, sm: 4 }, 
              mb: 3,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.1)' 
                : 'rgba(0,0,0,0.1)'}`,
              borderRadius: 4,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
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

            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'center', sm: 'flex-start' },
                gap: { xs: 2, sm: 3 },
                textAlign: { xs: 'center', sm: 'left' }
              }}>
                <Avatar 
                  sx={{ 
                    width: { xs: 100, sm: 80 }, 
                    height: { xs: 100, sm: 80 },
                    fontSize: { xs: '2.5rem', sm: '2rem' },
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 8px 32px rgba(0,0,0,0.3)'
                      : '0 8px 32px rgba(0,0,0,0.15)'
                  }}
                >
                  {getAvatarLetter(userInfo.username)}
                </Avatar>
                
                <Box sx={{ flexGrow: 1 }}>
                  <Typography 
                    variant="h4" 
                    sx={{ 
                      fontWeight: 700,
                      mb: 1,
                      fontSize: { xs: '2rem', sm: '2.5rem' },
                      background: theme.palette.mode === 'dark'
                        ? 'linear-gradient(45deg, #bb86fc 30%, #03dac6 90%)'
                        : 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text'
                    }}
                  >
                    {userInfo.username || 'User'}
                  </Typography>
                  
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={userInfo.role.toUpperCase()} 
                      color={getRoleColor(userInfo.role)}
                      size={isMobile ? "medium" : "small"}
                      sx={{ 
                        fontWeight: 600,
                        fontSize: { xs: '0.875rem', sm: '0.75rem' }
                      }}
                    />
                  </Box>
                  
                  <Typography 
                    variant="body1" 
                    color="text.secondary"
                    sx={{ fontSize: { xs: '1rem', sm: '0.875rem' } }}
                  >
                    Member since {formatDate(userInfo.createdAt)}
                  </Typography>
                </Box>

                {/* Edit Button - Responsive positioning */}
                <Box sx={{ 
                  alignSelf: { xs: 'stretch', sm: 'flex-start' },
                  mt: { xs: 1, sm: 0 }
                }}>
                  <Button
                    startIcon={editMode ? <CancelIcon /> : <EditIcon />}
                    onClick={() => {
                      setEditMode(!editMode);
                      if (editMode) {
                        setUserInfo({
                          username: user?.username || '',
                          email: user?.email || '',
                          role: user?.role || 'user',
                          createdAt: user?.createdAt || new Date().toISOString()
                        });
                        setError('');
                        setSuccess('');
                      }
                    }}
                    variant={editMode ? "outlined" : "contained"}
                    size={isMobile ? "large" : "medium"}
                    fullWidth={isMobile}
                    sx={{
                      minWidth: { xs: '100%', sm: 120 },
                      py: { xs: 1.5, sm: 1 },
                      fontSize: { xs: '1rem', sm: '0.875rem' },
                      fontWeight: 600,
                      textTransform: 'none'
                    }}
                  >
                    {editMode ? 'Cancel' : 'Edit Profile'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Alerts */}
          {error && (
            <Fade in>
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 3,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }} 
                onClose={() => setError('')}
              >
                {error}
              </Alert>
            </Fade>
          )}
          {success && (
            <Fade in>
              <Alert 
                severity="success" 
                sx={{ 
                  mb: 3,
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }} 
                onClose={() => setSuccess('')}
              >
                {success}
              </Alert>
            </Fade>
          )}

          {/* Enhanced User Information Card */}
          <Grow in timeout={800} style={{ transitionDelay: '200ms' }}>
            <Card 
              elevation={0}
              sx={{
                mb: 3,
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                backdropFilter: 'blur(20px)',
                border: `1px solid ${theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'rgba(0,0,0,0.1)'}`,
                borderRadius: 3
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mb: 3,
                    fontWeight: 600,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}
                >
                  <AccountCircleIcon sx={{ color: 'primary.main' }} />
                  User Information
                </Typography>
                
                <Grid container spacing={{ xs: 2, sm: 3 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Username"
                      value={userInfo.username}
                      onChange={(e) => handleUserInfoChange('username', e.target.value)}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: <BadgeIcon sx={{ mr: 1, color: 'action.active' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          fontSize: { xs: '1rem', sm: '0.875rem' }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      type="email"
                      value={userInfo.email}
                      onChange={(e) => handleUserInfoChange('email', e.target.value)}
                      disabled={!editMode}
                      InputProps={{
                        startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.active' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          fontSize: { xs: '1rem', sm: '0.875rem' }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Role"
                      value={userInfo.role}
                      disabled
                      InputProps={{
                        startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          fontSize: { xs: '1rem', sm: '0.875rem' }
                        }
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Member Since"
                      value={formatDate(userInfo.createdAt)}
                      disabled
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                          fontSize: { xs: '1rem', sm: '0.875rem' }
                        }
                      }}
                    />
                  </Grid>
                </Grid>
                
                {editMode && (
                  <Box sx={{ 
                    mt: 4, 
                    display: 'flex', 
                    justifyContent: { xs: 'stretch', sm: 'flex-end' }, 
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2 
                  }}>
                    <Button
                      variant="contained"
                      startIcon={<SaveIcon />}
                      onClick={updateUserInfo}
                      disabled={loading}
                      size={isMobile ? "large" : "medium"}
                      sx={{
                        px: 4,
                        py: { xs: 1.5, sm: 1 },
                        fontSize: { xs: '1rem', sm: '0.875rem' },
                        fontWeight: 700,
                        textTransform: 'none',
                        background: 'linear-gradient(45deg, #4caf50 30%, #2e7d32 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #2e7d32 30%, #1b5e20 90%)',
                        }
                      }}
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grow>

          {/* Enhanced Security Card */}
          <Grow in timeout={1000} style={{ transitionDelay: '400ms' }}>
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
                borderRadius: 3
              }}
            >
              <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mb: 2,
                    fontWeight: 600,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}
                >
                  <SecurityIcon sx={{ color: 'error.main' }} />
                  Security Settings
                </Typography>
                
                <Typography 
                  variant="body1" 
                  color="text.secondary" 
                  sx={{ 
                    mb: 3,
                    fontSize: { xs: '1rem', sm: '0.875rem' },
                    lineHeight: 1.6
                  }}
                >
                  Keep your account secure by updating your password regularly and using strong, unique passwords.
                </Typography>
                
                <Button
                  variant="outlined"
                  startIcon={<LockIcon />}
                  onClick={() => setPasswordDialogOpen(true)}
                  fullWidth={isMobile}
                  size={isMobile ? "large" : "medium"}
                  sx={{
                    py: { xs: 1.5, sm: 1 },
                    fontSize: { xs: '1rem', sm: '0.875rem' },
                    fontWeight: 600,
                    textTransform: 'none',
                    borderWidth: 2,
                    '&:hover': {
                      borderWidth: 2,
                      transform: 'translateY(-1px)'
                    }
                  }}
                >
                  Change Password
                </Button>
              </CardContent>
            </Card>
          </Grow>

          {/* Enhanced Change Password Dialog */}
          <Dialog 
            open={passwordDialogOpen} 
            onClose={() => setPasswordDialogOpen(false)} 
            maxWidth="sm" 
            fullWidth
            fullScreen={fullScreen}
            PaperProps={{
              sx: {
                borderRadius: { xs: 0, md: 3 },
                background: theme.palette.mode === 'dark'
                  ? 'linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%)'
                  : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
                backdropFilter: 'blur(20px)'
              }
            }}
          >
            <DialogTitle sx={{ 
              fontSize: { xs: '1.5rem', sm: '1.25rem' },
              fontWeight: 600,
              pb: 1
            }}>
              Change Password
            </DialogTitle>
            <DialogContent sx={{ pb: 2 }}>
              <Box sx={{ mt: { xs: 1, sm: 2 } }}>
                <TextField
                  fullWidth
                  type="password"
                  label="Current Password"
                  value={passwordData.currentPassword}
                  onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                  margin="normal"
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: { xs: '1rem', sm: '0.875rem' }
                    }
                  }}
                />
                <TextField
                  fullWidth
                  type="password"
                  label="New Password"
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  margin="normal"
                  helperText="Password must be at least 6 characters long"
                  sx={{
                    mb: 2,
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: { xs: '1rem', sm: '0.875rem' }
                    }
                  }}
                />
                <TextField
                  fullWidth
                  type="password"
                  label="Confirm New Password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  margin="normal"
                  error={passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''}
                  helperText={
                    passwordData.newPassword !== passwordData.confirmPassword && passwordData.confirmPassword !== ''
                      ? 'Passwords do not match'
                      : ''
                  }
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      fontSize: { xs: '1rem', sm: '0.875rem' }
                    }
                  }}
                />
              </Box>
            </DialogContent>
            <DialogActions sx={{ 
              p: 3,
              gap: 1,
              flexDirection: { xs: 'column-reverse', sm: 'row' }
            }}>
              <Button 
                onClick={() => setPasswordDialogOpen(false)}
                size={isMobile ? "large" : "medium"}
                fullWidth={isMobile}
                sx={{
                  fontSize: { xs: '1rem', sm: '0.875rem' },
                  textTransform: 'none'
                }}
              >
                Cancel
              </Button>
              <Button 
                onClick={changePassword}
                variant="contained"
                disabled={
                  loading || 
                  !passwordData.currentPassword || 
                  !passwordData.newPassword || 
                  passwordData.newPassword !== passwordData.confirmPassword ||
                  passwordData.newPassword.length < 6
                }
                size={isMobile ? "large" : "medium"}
                fullWidth={isMobile}
                sx={{
                  fontSize: { xs: '1rem', sm: '0.875rem' },
                  fontWeight: 700,
                  textTransform: 'none',
                  background: 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #d32f2f 30%, #c62828 90%)',
                  }
                }}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Fade>
    </Container>
  );
};

export default Profile;
