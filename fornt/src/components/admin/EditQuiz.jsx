import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Collapse,
  Divider,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';

// API URL configuration for environment support
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

const API_URL = getApiUrl();

const EditQuiz = () => {
  const { id } = useParams(); // Get quiz ID from URL params
  // console.log(id);
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState(null);
  const [editFormData, setEditFormData] = useState({
    question: '',
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  // AI Generation states
  const [aiGenerationOpen, setAiGenerationOpen] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [wikipediaText, setWikipediaText] = useState('');
  const [showWikipedia, setShowWikipedia] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // Get user from localStorage
  const getUserFromStorage = () => {
    try {
      const userData = localStorage.getItem('quizUser');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  };

  // Fetch quiz from the database
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const user = getUserFromStorage();
        
        if (!user || !user.token) {
          setError('Authentication token not found. Please log in again.');
          setLoading(false);
          return;
        }
        
        if (!id) {
          setError('Quiz ID not provided');
          setLoading(false);
          return;
        }
        
        // Updated API call to use environment variable
        const response = await fetch(`${API_URL}/api/quizzes/${id}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            setError('Authentication failed. Please log in again.');
          } else if (response.status === 404) {
            setError('Quiz not found.');
          } else {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
          }
          return;
        }
        
        const data = await response.json();
        setQuizData(data.quiz || data);
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError(`Failed to load quiz: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleUpdateQuiz = async (updatedQuestions) => {
    try {
      const user = getUserFromStorage();
      
      if (!user || !user.token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      
      // Updated API call to use environment variable
      const response = await fetch(`${API_URL}/api/quizzes/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...quizData,
          questions: updatedQuestions
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update quiz');
      }
      
      const data = await response.json();
      setQuizData(data.quiz || data);
      return true;
    } catch (err) {
      console.error('Error updating quiz:', err);
      setError('Failed to update quiz. Please try again.');
      return false;
    }
  };

  const handleEditQuestion = (index) => {
    const question = quizData.questions[index];
    setEditingQuestion(index);
    setEditFormData({
      question: question.question,
      options: [...question.options],
      correctAnswer: question.options.indexOf(question.correctAnswer)
    });
  };

  const handleSaveEdit = async () => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions[editingQuestion] = {
      question: editFormData.question,
      options: editFormData.options,
      correctAnswer: editFormData.options[editFormData.correctAnswer]
    };
    
    const success = await handleUpdateQuiz(updatedQuestions);
    if (success) {
      setEditingQuestion(null);
    }
  };

  const handleDeleteClick = (index) => {
    setQuestionToDelete(index);
    setDeleteConfirmOpen(true);
  };

  const confirmDeleteQuestion = async () => {
    const updatedQuestions = [...quizData.questions];
    updatedQuestions.splice(questionToDelete, 1);
    
    const success = await handleUpdateQuiz(updatedQuestions);
    if (success) {
      setDeleteConfirmOpen(false);
      setQuestionToDelete(null);
    }
  };

  const handleAddQuestion = () => {
    setEditingQuestion('new');
    setEditFormData({
      question: '',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
  };

  const handleSaveNewQuestion = async () => {
    const newQuestion = {
      question: editFormData.question,
      options: editFormData.options,
      correctAnswer: editFormData.options[editFormData.correctAnswer]
    };
    
    const updatedQuestions = [...quizData.questions, newQuestion];
    const success = await handleUpdateQuiz(updatedQuestions);
    if (success) {
      setEditingQuestion(null);
    }
  };

  // AI Generation Functions
  const fetchWikipedia = async (topic) => {
    const endpoint = "https://en.wikipedia.org/w/api.php";
    const params = new URLSearchParams({
      action: "query",
      format: "json",
      prop: "extracts",
      exintro: true,
      explaintext: true,
      titles: topic,
      origin: "*"
    });

    try {
      const response = await fetch(`${endpoint}?${params}`);
      if (!response.ok) throw new Error(`Wikipedia API returned ${response.status}`);
      
      const data = await response.json();
      const pages = data.query.pages;
      
      for (const pageId in pages) {
        if (pages[pageId].extract) {
          return pages[pageId].extract;
        }
      }
      return "No extract found for this topic.";
    } catch (error) {
      console.error("Wikipedia fetch error:", error);
      return `Error fetching data: ${error.message}`;
    }
  };

  const buildPrompt = (topic, difficulty, count, context = null) => {
    return `Generate exactly ${count} multiple-choice questions based on:
${context ? `Context:\n${context.substring(0, 2000)}\n\n` : ''}
Topic: ${topic}
Difficulty: ${difficulty}
Format each as: ["question", ["option1", "option2", "option3", "option4"], correctIndex]
Only return a valid JSON array, no other text or markdown.`;
  };

  const handleGenerateQuestions = async () => {
    try {
      setAiLoading(true);
      setAiError(null);
      setGeneratedQuestions([]);

      if (!quizData.topic.trim()) throw new Error('Quiz topic is required');

      const count = Math.max(1, Math.min(20, questionCount));

      let wikiContext = '';
      try {
        wikiContext = await fetchWikipedia(quizData.topic);
        if (wikiContext && !wikiContext.startsWith('Error')) {
          setWikipediaText(wikiContext);
          setShowWikipedia(true);
        }
      } catch (wikiError) {
        // console.log("Proceeding without Wikipedia context", wikiError);
      }

      const prompt = buildPrompt(
        quizData.topic,
        quizData.difficulty,
        count,
        wikiContext.startsWith('Error') ? null : wikiContext
      );

      // Updated API call to use environment variable
      const response = await fetch(`${API_URL}/api/generate-mcqs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, count })
      });

      if (!response.ok) throw new Error(await response.text());
      
      const result = await response.json();
      const questions = Array.isArray(result) ? result : 
                       Array.isArray(result?.mcqs) ? result.mcqs : 
                       [];

      setGeneratedQuestions(
        questions.map(q => ({
          question: q[0] || 'No question text',
          options: Array.isArray(q[1]) ? q[1] : ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correctAnswer: q[1]?.[q[2]] || q[1]?.[0] || 'Option 1',
          status: 'pending' // 'pending', 'accepted', or 'rejected'
        }))
      );
    } catch (err) {
      setAiError(err.message || 'Failed to generate questions');
    } finally {
      setAiLoading(false);
    }
  };

  const handleQuestionStatus = (index, status) => {
    const updatedQuestions = [...generatedQuestions];
    updatedQuestions[index].status = status;
    setGeneratedQuestions(updatedQuestions);
  };

  const handleAddGeneratedQuestions = async () => {
    try {
      // Filter only accepted questions
      const acceptedQuestions = generatedQuestions.filter(q => q.status === 'accepted');
      if (acceptedQuestions.length === 0) throw new Error('No accepted questions to add');

      const updatedQuestions = [...quizData.questions, ...acceptedQuestions];
      const success = await handleUpdateQuiz(updatedQuestions);
      if (success) {
        setSnackbarMessage(`Added ${acceptedQuestions.length} questions to quiz!`);
        setSnackbarOpen(true);
        setAiGenerationOpen(false);
        setGeneratedQuestions([]);
      }
    } catch (err) {
      setAiError(err.message);
    }
  };

  const renderWikipediaPanel = () => (
    <Collapse in={showWikipedia}>
      <Box sx={{ p: 2, mb: 3, border: '1px solid #ddd', borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6">
            <Chip label="Context" color="info" sx={{ mr: 1 }} />
            Wikipedia Content
          </Typography>
          <IconButton size="small" onClick={() => setShowWikipedia(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ my: 1 }} />
        <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
          {wikipediaText.length > 500 ? `${wikipediaText.substring(0, 500)}...` : wikipediaText}
        </Typography>
      </Box>
    </Collapse>
  );

  const renderGeneratedQuestions = () => (
    generatedQuestions.map((q, i) => (
      <Box 
        key={i} 
        sx={{ 
          mb: 3, 
          p: 2, 
          border: '1px solid #eee', 
          borderRadius: 1,
          backgroundColor: q.status === 'accepted' ? '#f0fff0' : 
                          q.status === 'rejected' ? '#fff0f0' : 'inherit'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography fontWeight="bold">{i + 1}. {q.question}</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              color="success"
              onClick={() => handleQuestionStatus(i, 'accepted')}
              sx={{ 
                backgroundColor: q.status === 'accepted' ? '#4caf50' : 'inherit',
                color: q.status === 'accepted' ? 'white' : 'inherit',
                '&:hover': {
                  backgroundColor: '#4caf50',
                  color: 'white'
                }
              }}
            >
              <CheckIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => handleQuestionStatus(i, 'rejected')}
              sx={{ 
                backgroundColor: q.status === 'rejected' ? '#f44336' : 'inherit',
                color: q.status === 'rejected' ? 'white' : 'inherit',
                '&:hover': {
                  backgroundColor: '#f44336',
                  color: 'white'
                }
              }}
            >
              <ClearIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
        <Box component="ul" sx={{ pl: 2, mt: 1, listStyleType: 'none' }}>
          {q.options.map((opt, j) => (
            <li 
              key={j}
              style={{ 
                color: opt === q.correctAnswer ? 'green' : 'inherit',
                fontWeight: opt === q.correctAnswer ? 'bold' : 'normal'
              }}
            >
              {String.fromCharCode(97 + j)}. {opt}
            </li>
          ))}
        </Box>
        {q.status !== 'pending' && (
          <Typography 
            variant="caption" 
            color={q.status === 'accepted' ? 'success.main' : 'error.main'}
            sx={{ display: 'flex', alignItems: 'center', mt: 1 }}
          >
            {q.status === 'accepted' ? <CheckIcon fontSize="small" sx={{ mr: 0.5 }} /> : 
             <ClearIcon fontSize="small" sx={{ mr: 0.5 }} />}
            {q.status.toUpperCase()}
          </Typography>
        )}
      </Box>
    ))
  );

  const acceptedCount = generatedQuestions.filter(q => q.status === 'accepted').length;

  const renderAiGenerationDialog = () => (
    <Dialog open={aiGenerationOpen} onClose={() => setAiGenerationOpen(false)} fullWidth maxWidth="md">
      <DialogTitle>
        Generate Questions with AI
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Generate questions based on your quiz topic: <strong>{quizData.topic}</strong>
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <FormControl sx={{ minWidth: 120, mr: 2 }}>
            
            <TextField
            type="number"
            inputProps={{ min: 1, max: 40 }}
            value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
              label="question"
            sx={{ width: 120 }}
          />
          
          </FormControl>
          <Button
            variant="contained"
            onClick={handleGenerateQuestions}
            disabled={aiLoading}
            startIcon={aiLoading ? <CircularProgress size={20} /> : null}
          >
            {aiLoading ? 'Generating...' : 'Generate Questions'}
          </Button>
        </Box>
        {aiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {aiError}
          </Alert>
        )}
        {renderWikipediaPanel()}
        {generatedQuestions.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2
            }}>
              <Typography variant="h6">
                Generated Questions ({acceptedCount}/{generatedQuestions.length} accepted)
              </Typography>
              <Button
                variant="contained"
                color="success"
                onClick={handleAddGeneratedQuestions}
                disabled={acceptedCount === 0}
              >
                Add to Quiz
              </Button>
            </Box>
            {renderGeneratedQuestions()}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setAiGenerationOpen(false)}>Close</Button>
      </DialogActions>
    </Dialog>
  );

  const renderEditDialog = () => (
    <Dialog open={editingQuestion !== null} onClose={() => setEditingQuestion(null)} fullWidth maxWidth="md">
      <DialogTitle>
        {editingQuestion === 'new' ? 'Add New Question' : 'Edit Question'}
      </DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Question"
          value={editFormData.question}
          onChange={(e) => setEditFormData({...editFormData, question: e.target.value})}
          sx={{ mb: 2, mt: 2 }}
        />
        
        {editFormData.options.map((option, i) => (
          <Box key={`option-${i}`} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <TextField
              fullWidth
              label={`Option ${i + 1}`}
              value={option}
              onChange={(e) => {
                const newOptions = [...editFormData.options];
                newOptions[i] = e.target.value;
                setEditFormData({...editFormData, options: newOptions});
              }}
            />
            <IconButton
              color={editFormData.correctAnswer === i ? 'primary' : 'default'}
              onClick={() => setEditFormData({...editFormData, correctAnswer: i})}
              sx={{ ml: 1 }}
            >
              <CheckIcon />
            </IconButton>
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setEditingQuestion(null)} startIcon={<CloseIcon />}>
          Cancel
        </Button>
        <Button 
          onClick={editingQuestion === 'new' ? handleSaveNewQuestion : handleSaveEdit} 
          startIcon={<SaveIcon />}
          variant="contained"
          disabled={!editFormData.question || editFormData.options.some(opt => !opt.trim())}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderDeleteConfirm = () => (
    <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
      <DialogTitle>Confirm Delete</DialogTitle>
      <DialogContent>
        <Typography>Are you sure you want to delete this question?</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
        <Button onClick={confirmDeleteQuestion} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  const renderQuestionList = () => (
    quizData.questions.map((q, i) => (
      <Box 
        key={`question-${i}`}
        sx={{ 
          mb: 3, 
          p: 2, 
          border: '1px solid #eee', 
          borderRadius: 1,
          position: 'relative'
        }}
      >
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <IconButton onClick={() => handleEditQuestion(i)} color="primary">
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => handleDeleteClick(i)} color="error">
            <DeleteIcon />
          </IconButton>
        </Box>
        
        <Typography fontWeight="bold">{i + 1}. {q.question}</Typography>
        <Box component="ul" sx={{ pl: 2, mt: 1, listStyleType: 'none' }}>
          {q.options.map((opt, j) => (
            <li 
              key={`question-${i}-option-${j}`}
              style={{ 
                color: opt === q.correctAnswer ? 'green' : 'inherit',
                fontWeight: opt === q.correctAnswer ? 'bold' : 'normal'
              }}
            >
              {String.fromCharCode(97 + j)}. {opt}
              {opt === q.correctAnswer && <CheckIcon sx={{ ml: 1, fontSize: '1rem' }} />}
            </li>
          ))}
        </Box>
      </Box>
    ))
  );

  if (loading) return (
    <Box sx={{ p: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
      <CircularProgress />
    </Box>
  );

  if (error) return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error">{error}</Alert>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/quizzes')}
        sx={{ mt: 2 }}
      >
        Back to Quizzes
      </Button>
    </Box>
  );

  if (!quizData) return (
    <Box sx={{ p: 3 }}>
      <Alert severity="error">Quiz not found</Alert>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/quizzes')}
        sx={{ mt: 2 }}
      >
        Back to Quizzes
      </Button>
    </Box>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Button 
        startIcon={<ArrowBackIcon />} 
        onClick={() => navigate('/admin')}
        sx={{ mb: 2 }}
      >
        Back to Quizzes
      </Button>

      <Typography variant="h4" gutterBottom>
        Editing: {quizData.name}
      </Typography>

      <Typography variant="subtitle1" gutterBottom sx={{ mb: 3 }}>
        <Chip label={`Topic: ${quizData.topic}`} sx={{ mr: 1 }} />
        <Chip label={`Difficulty: ${quizData.difficulty}`} />
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">
          Questions ({quizData.questions.length})
        </Typography>
        <Box>
          <Button 
            variant="outlined" 
            onClick={() => setAiGenerationOpen(true)}
            startIcon={<AddIcon />}
            sx={{ mr: 1 }}
          >
            AI Generate
          </Button>
          <Button 
            variant="contained" 
            onClick={handleAddQuestion}
            startIcon={<AddIcon />}
          >
            Add Manual
          </Button>
        </Box>
      </Box>
      
      {quizData.questions.length > 0 ? (
        renderQuestionList()
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No questions yet. Add your first question!
        </Typography>
      )}
      
      {renderEditDialog()}
      {renderDeleteConfirm()}
      {renderAiGenerationDialog()}
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        message={snackbarMessage}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      />
    </Box>
  );
};

export default EditQuiz;
