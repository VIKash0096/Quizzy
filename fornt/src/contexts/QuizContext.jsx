import React, { createContext, useContext, useState, useEffect } from 'react';

// API URL configuration for environment support
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

const API_URL = getApiUrl();

const QuizContext = createContext();

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error('useQuiz must be used within a QuizProvider');
  }
  return context;
};

export const QuizProvider = ({ children }) => {
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [quizzesLoaded, setQuizzesLoaded] = useState(false);

  // Fetch all public quizzes from the database
  const fetchQuizzes = async () => {
    setLoading(true);
    setError('');
    try {
      const user = JSON.parse(localStorage.getItem('quizUser') || '{}');
      const token = user.token;
      if (!token) {
        throw new Error('Authentication required. Please login first.');
      }

      // Updated API call to use environment variable
      const response = await fetch(`${API_URL}/api/quizzes/public`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        }
        throw new Error('Failed to fetch quizzes');
      }

      const data = await response.json();
      setQuizzes(data.quizzes || []);
      setQuizzesLoaded(true);
    } catch (err) {
      setError(err.message || 'Failed to load quizzes');
    } finally {
      setLoading(false);
    }
  };

  // Fetch questions for a specific quiz
  const fetchQuestions = async (quizId) => {
    try {
      setLoading(true);
      setError(null);
      // Get auth token from localStorage
      const user = JSON.parse(localStorage.getItem('quizUser') || '{}');
      const token = user.token;
      if (!token) {
        throw new Error('Authentication required. Please login first.');
      }

      // Updated API call to use environment variable
      const response = await fetch(`${API_URL}/api/quizzes/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quiz questions');
      }

      const quizData = await response.json();
      
      if (quizData.quiz && quizData.quiz.questions) {
        setQuestions(quizData.quiz.questions);
        setCurrentQuiz(quizData.quiz);
      } else {
        throw new Error('Invalid quiz data format');
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching quiz questions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Clear questions and current quiz
  const clearQuiz = () => {
    setQuestions([]);
    setCurrentQuiz(null);
  };

  // Submit quiz results
  const submitQuizResults = async (results) => {
    try {
      setLoading(true);
      setError(null);
      // Get auth token from localStorage
      const user = JSON.parse(localStorage.getItem('quizUser') || '{}');
      const token = user.token;
      if (!token) {
        throw new Error('Authentication required. Please login first.');
      }

      // Updated API call to use environment variable
      const response = await fetch(`${API_URL}/api/test-history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(results)
      });

      if (!response.ok) {
        throw new Error('Failed to submit quiz results');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      setError(err.message);
      console.error('Error submitting quiz results:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    quizzes,
    questions,
    currentQuiz,
    loading,
    error,
    quizzesLoaded,
    fetchQuizzes,
    fetchQuestions,
    submitQuizResults,
    clearQuiz
  };

  return (
    <QuizContext.Provider value={value}>
      {children}
    </QuizContext.Provider>
  );
};
