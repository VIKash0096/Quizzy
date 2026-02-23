import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    loading: true,
    error: null
  });

  const navigate = useNavigate();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('quizUser');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user?.username && user?.role) {
            setAuthState({
              user: {
                ...user,
                isAuthenticated: true,
                isAdmin: user.role === 'admin'
              },
              loading: false,
              error: null
            });
            return;
          }
        }
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('quizUser');
      }
      setAuthState(prev => ({ ...prev, loading: false }));
    };

    initializeAuth();
  }, []);

  const login = async (username, password) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const userData = await loginUser(username, password);
      const user = {
        ...userData,
        isAuthenticated: true,
        isAdmin: userData.role === 'admin'
      };

      localStorage.setItem('quizUser', JSON.stringify(user));
      setAuthState({
        user,
        loading: false,
        error: null
      });
      
      // Redirect based on role - users go to home, admin goes to admin dashboard
      navigate(user.isAdmin ? '/admin' : '/', { replace: true });
      
      return true;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      return false;
    }
  };

  const register = async (userData) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const newUser = await registerUser(userData);
      const user = {
        ...newUser,
        isAuthenticated: true,
        isAdmin: false
      };

      localStorage.setItem('quizUser', JSON.stringify(user));
      setAuthState({
        user,
        loading: false,
        error: null
      });
      
      navigate('/user', { replace: true });
      return true;
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('quizUser');
    setAuthState({
      user: null,
      loading: false,
      error: null
    });
    navigate('/login', { replace: true });
  };

  const value = {
    ...authState,
    login,
    register,
    logout,
    isAuthenticated: !!authState.user,
    isAdmin: authState.user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
