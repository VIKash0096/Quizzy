import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { useThemeMode } from '../../contexts/ThemeContext.jsx';
import logo from '../../assests/images/logo2.png';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { 
  AccountCircle, 
  Brightness4, 
  Brightness7,
  Menu as MenuIcon,
  Person as PersonIcon,
  ExitToApp as ExitToAppIcon
} from '@mui/icons-material';
import { useState } from 'react';
const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const { mode, toggleColorMode } = useThemeMode();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  // Add debugging
  // console.log('Navbar rendered with user:', user);
  const handleLogout = () => {
    // console.log('Logout clicked');
    logout();
    navigate('/login');
    setAnchorEl(null);
  };
  const handleMenuClick = (event) => {
    // console.log('Account circle clicked, opening menu');
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    // console.log('Menu closed');
    setAnchorEl(null);
  };
  const handleProfileClick = () => {
    // console.log('Profile clicked - navigating to /profile');
    navigate('/profile');
    setAnchorEl(null);
  };
  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        backgroundColor: 'background.paper',
        borderBottom: '1px solid',
        borderBottomColor: 'divider',
        zIndex: 1
      }}
    >
      <Toolbar>
        {/* Mobile hamburger menu */}
        {user && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={() => {
              // console.log('Hamburger menu clicked');
              onMenuClick && onMenuClick();
            }}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              color: 'text.primary'
            }}
          >
            <MenuIcon />
          </IconButton>
        )}
        {!user && (
          <Typography variant="h6" component="div" sx={{ color: 'text.primary' }}>
            <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
               <Box
                component="img"
                src={logo}
                alt="Logo"
                sx={{ height: 65, width: 'auto', verticalAlign: 'middle' }}
              />
            </Link>
          </Typography>
        )}
        {/* Centered Logo */}
        <Typography 
          variant="h4" 
          component="div" 
          sx={{ 
            flexGrow: 1,
            textAlign: 'center',
            fontWeight: 'bold',
            color: '#ff4081',
            fontSize: { xs: '1.5rem', md: '2rem' }
          }}
        >
          <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            <Box
              component="img"
              src={logo}
              alt="Logo"
              sx={{ height: 65, width: 'auto', verticalAlign: 'middle' }}
            />
          </Link>
        </Typography>
        {/* Right side controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton 
            onClick={() => {
              // console.log('Theme toggle clicked');
              toggleColorMode();
            }}
            sx={{ color: 'text.primary' }}
          >
            {mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
          </IconButton>
          
          {user ? (
            <>
              <IconButton 
                sx={{ color: 'text.primary' }}
                onClick={handleMenuClick}
                aria-controls={open ? 'user-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="user-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'user-button',
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleProfileClick}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Profile</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <ExitToAppIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </>
          ) : (
            <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Button sx={{ color: 'text.primary' }} onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button sx={{ color: 'text.primary' }} onClick={() => navigate('/register')}>
                Register
              </Button>
            </Box>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};
export default Navbar
