import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { QuizProvider } from './contexts/QuizContext.jsx';
import { CustomThemeProvider } from './contexts/ThemeContext.jsx';
import Layout from './components/common/Layout.jsx';
import Home from './pages/Home.jsx';
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';
import AdminDashboard from './components/admin/AdminDashboard.jsx';
import Quiz from './components/user/Quiz.jsx';
import Results from './components/user/Results.jsx';
import TestHistory from './components/user/TestHistory.jsx';
import EditQuiz from './components/admin/EditQuiz.jsx';
import NotFound from './pages/NotFound.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import PublicRoute from './components/common/PublicRoute.jsx';
import MockQuiz from './components/user/MockQuiz.jsx';
import TakeQuiz from './components/user/TakeQuiz.jsx';
import ViewResult from './components/user/ViewResult.jsx';
import Unauthorized from './pages/Unauthorized.jsx';
import Profile from './components/common/Profile.jsx';
import QuizDetail from './components/user/QuizDetail.jsx';
import './App.css';

function App() {
  return (
    <CustomThemeProvider>
      <Router>
        <AuthProvider>
          <QuizProvider>
            <div className="app">
              <Layout>
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } />
                  <Route path="/register" element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  } />

                  {/* Profile Route - Available to all authenticated users */}
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />

                  {/* Admin Routes - ONLY for admin role */}
                  <Route path="/admin" element={
                    <ProtectedRoute role="admin">
                      <AdminDashboard />
                    </ProtectedRoute>
                  } />
                  <Route path="/edit-quiz/:id" element={
                    <ProtectedRoute role="admin">
                      <EditQuiz />
                    </ProtectedRoute>
                  } />

                  {/* User Routes - ONLY for user role */}

                  <Route path="/user/quiz" element={
                    <ProtectedRoute role="user">
                      <Quiz />
                    </ProtectedRoute>
                  } />
                  <Route path="/user/take-quiz" element={
                    <ProtectedRoute role="user">
                      <TakeQuiz />
                    </ProtectedRoute>
                  } />
                  <Route path="/user/mock-quiz" element={
                    <ProtectedRoute role="user">
                      <MockQuiz />
                    </ProtectedRoute>
                  } />

                  <Route path="/user/quiz-detail" element={
                    <ProtectedRoute role="user">
                      <QuizDetail />
                    </ProtectedRoute>
                  } />

                  <Route path="/user/view-result" element={
                    <ProtectedRoute role="user">
                      <ViewResult />
                    </ProtectedRoute>
                  } />
                  <Route path="/user/results" element={
                    <ProtectedRoute role="user">
                      <Results />
                    </ProtectedRoute>
                  } />
                  <Route path="/user/history" element={
                    <ProtectedRoute role="user">
                      <TestHistory />
                    </ProtectedRoute>
                  } />

                  {/* Unauthorized Route */}
                  <Route path="/unauthorized" element={<Unauthorized />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Layout>
            </div>
          </QuizProvider>
        </AuthProvider>
      </Router>
    </CustomThemeProvider>
  );
}

export default App;

