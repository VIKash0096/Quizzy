import { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  Typography,
  CircularProgress,
  Alert,
  Collapse,
  IconButton,
  Divider,
  Chip,
  Snackbar,
  Card,
  CardContent,
  Slider,
  Paper,
  Fade,
  Grow,
  useTheme,
  Avatar,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  ListItemText
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import CheckIcon from '@mui/icons-material/Check';
import ClearIcon from '@mui/icons-material/Clear';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PsychologyIcon from '@mui/icons-material/Psychology';
import SchoolIcon from '@mui/icons-material/School';
import SpeedIcon from '@mui/icons-material/Speed';
import QuizIcon from '@mui/icons-material/Quiz';
import UploadFileIcon from '@mui/icons-material/UploadFile';

// API URL configuration for environment support - UNCHANGED
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

const API_URL = getApiUrl();

const CreateQuiz = () => {
  const theme = useTheme();
  
  // STATE
  const [quizData, setQuizData] = useState({
    name: '',
    topic: '',
    difficulty: 'medium',
    questionCount: 5
  });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [wikipediaText, setWikipediaText] = useState('');
  const [showWikipedia, setShowWikipedia] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  // PDF-related state
  const [inputType, setInputType] = useState('topic'); // 'topic' | 'pdf'
  const [pdfFile, setPdfFile] = useState(null);        // File object
  const [pdfTopics, setPdfTopics] = useState([]);      // [{id,title,...}]
  const [selectedPdfTopic, setSelectedPdfTopic] = useState([]); // array for multi-select
  const [pdfTopicsLoading, setPdfTopicsLoading] = useState(false);
  const [pdfId, setPdfId] = useState(null); // backend PDF session id

  // QUESTION COUNT
  const handleQuestionCountChange = (newValue) => {
    const count = Math.min(50, Math.max(1, newValue));
    setQuizData({ ...quizData, questionCount: count });
  };

  const incrementQuestions = () => {
    if (quizData.questionCount < 50) {
      handleQuestionCountChange(quizData.questionCount + 1);
    }
  };

  const decrementQuestions = () => {
    if (quizData.questionCount > 1) {
      handleQuestionCountChange(quizData.questionCount - 1);
    }
  };

  const quickSelectCounts = [5, 10, 15, 20, 30, 50];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return '#2196f3';
    }
  };

  // INPUT TYPE TOGGLE
  const handleInputTypeChange = (event, newType) => {
    if (!newType) return;
    setInputType(newType);
    if (newType === 'topic') {
      setPdfFile(null);
      setPdfTopics([]);
      setSelectedPdfTopic([]);
      setPdfTopicsLoading(false);
      setPdfId(null);
    } else {
      // when switching to PDF, topic can still be used as optional label
      setQuizData((prev) => ({ ...prev, topic: '' }));
      setPdfId(null);
    }
  };

  // FETCH TOPICS FROM PDF
  const fetchPdfTopics = async (file) => {
    setPdfTopics([]);
    setSelectedPdfTopic([]);
    setPdfTopicsLoading(true);
    setError(null);
    setPdfId(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Backend route: POST /api/pdf-topics -> { pdfId, topics: [...] }
      const res = await fetch(`${API_URL}/api/pdf-topics`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();

      if (data.pdfId) {
        setPdfId(data.pdfId);
      }

      const topics = data.topics || [];
      setPdfTopics(topics);

      if (topics.length > 0) {
        // default select first topic
        const first = topics[0];
        const firstValue = first.id || first.title || first.name || 'topic-0';
        setSelectedPdfTopic([firstValue]);
      }
    } catch (err) {
      console.error('Error detecting topics from PDF:', err);
      setError('PDF uploaded, but topics could not be detected. Full PDF will be used.');
    } finally {
      setPdfTopicsLoading(false);
    }
  };

  // HANDLE PDF FILE
  const handlePdfChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file');
      return;
    }
    setPdfFile(file);
    setError(null);
    // detect topics + store pdfId
    fetchPdfTopics(file);
  };

  // WIKIPEDIA + PROMPT
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

  // GENERATE QUESTIONS
  const handleGenerateQuestions = async (e) => {
    if (e) e.preventDefault();

    try {
      setLoading(true);
      setError(null);
      setGeneratedQuestions([]);

      const count = Math.max(1, Math.min(50, quizData.questionCount));
      let questions = [];

      if (inputType === 'topic') {
        if (!quizData.topic.trim()) throw new Error('Please enter a topic');

        let wikiContext = '';
        try {
          wikiContext = await fetchWikipedia(quizData.topic);
          if (wikiContext && !wikiContext.startsWith('Error')) {
            setWikipediaText(wikiContext);
            setShowWikipedia(true);
          }
        } catch {
          // ignore wiki failure
        }

        const prompt = buildPrompt(
          quizData.topic,
          quizData.difficulty,
          count,
          wikiContext && !wikiContext.startsWith('Error') ? wikiContext : null
        );

        const response = await fetch(`${API_URL}/api/generate-mcqs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, count })
        });

        if (!response.ok) throw new Error(await response.text());

        const result = await response.json();
        questions = Array.isArray(result) ? result :
          Array.isArray(result?.mcqs) ? result.mcqs :
            [];
      } else {
        // PDF FLOW – use pdfId instead of sending file again
        if (!pdfFile) throw new Error('Please upload a PDF file');
        if (!pdfId) throw new Error('Please wait until the PDF is processed and topics are detected.');

        // Decide topic string for backend
        let topicForBackend = 'Entire Document';

        if (selectedPdfTopic && selectedPdfTopic.length) {
          const firstVal = selectedPdfTopic[0];

          // pdfTopics entries from backend: { id, title }
          const topicObj = pdfTopics.find(
            t =>
              t.id === firstVal ||
              t.title === firstVal ||
              t.name === firstVal
          );

          topicForBackend =
            topicObj?.id ||
            topicObj?.title ||
            topicObj?.name ||
            quizData.topic ||
            'Entire Document';
        } else if (quizData.topic) {
          topicForBackend = quizData.topic;
        }

        const response = await fetch(`${API_URL}/api/generate-mcqs-from-pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pdfId,
            topic: topicForBackend,
            count,
            difficulty: quizData.difficulty
          })
        });

        if (!response.ok) throw new Error(await response.text());

        const result = await response.json();
        questions = Array.isArray(result) ? result :
          Array.isArray(result?.mcqs) ? result.mcqs :
          Array.isArray(result?.questions) ? result.questions :
            [];
      }

      setGeneratedQuestions(
        questions.map((q) => {
          const questionText = q[0] || q.question || 'No question text';
          const optionsArray = Array.isArray(q[1]) ? q[1] : q.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'];

          let correctAnswerText = 'Option 1';
          if (typeof q[2] === 'number' && Array.isArray(q[1])) {
            correctAnswerText = q[1]?.[q[2]] || q[1]?.[0] || 'Option 1';
          } else if (q.correctAnswer) {
            correctAnswerText = q.correctAnswer;
          } else if (q.answer) {
            correctAnswerText = q.answer;
          } else if (Array.isArray(q.options) && q.options.length > 0) {
            correctAnswerText = q.options[0];
          }

          return {
            question: questionText,
            options: optionsArray,
            correctAnswer: correctAnswerText,
            status: 'pending'
          };
        })
      );
    } catch (err) {
      setError(err.message || 'Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionStatus = (index, status) => {
    const updatedQuestions = [...generatedQuestions];
    updatedQuestions[index].status = status;
    setGeneratedQuestions(updatedQuestions);
  };

  // FIXED: ensure topic is always non-empty when saving
  const handleAddQuiz = async () => {
    try {
      if (!quizData.name.trim()) throw new Error('Quiz name is required');

      const acceptedQuestions = generatedQuestions.filter(q => q.status === 'accepted');
      if (acceptedQuestions.length === 0) throw new Error('No accepted questions to save');

      // decide final topic to send
      let finalTopic = (quizData.topic || '').trim();

      if (!finalTopic) {
        if (inputType === 'pdf') {
          // 1) from selected PDF topic
          if (selectedPdfTopic && selectedPdfTopic.length && pdfTopics.length) {
            const firstVal = selectedPdfTopic[0];
            const topicObj = pdfTopics.find(
              t =>
                t.id === firstVal ||
                t.title === firstVal ||
                t.name === firstVal
            );
            finalTopic =
              topicObj?.title ||
              topicObj?.name ||
              topicObj?.id ||
              '';
          }
          // 2) from file name
          if (!finalTopic && pdfFile?.name) {
            finalTopic = pdfFile.name.replace(/\.pdf$/i, '');
          }
          // 3) fallback
          if (!finalTopic) {
            finalTopic = 'PDF-based Quiz';
          }
        } else {
          throw new Error('Quiz topic is required');
        }
      }

      const quizToSave = {
        ...quizData,
        topic: finalTopic,
        questionCount: acceptedQuestions.length,
        questions: acceptedQuestions
      };

      const user = JSON.parse(localStorage.getItem('quizUser') || '{}');
      const token = user.token;

      if (!token) {
        throw new Error('Authentication required. Please login again.');
      }

      const response = await fetch(`${API_URL}/api/quizzes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quizToSave)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to save quiz');
      }

      const data = await response.json();

      const savedName = data?.quiz?.name || finalTopic || quizData.name;
      setSnackbarMessage(`Quiz "${savedName}" created successfully!`);
      setSnackbarOpen(true);

      handleReset();

    } catch (err) {
      setError(err.message);
      setSnackbarMessage(err.message);
      setSnackbarOpen(true);
    }
  };

  const handleReset = () => {
    setQuizData({
      name: '',
      topic: '',
      difficulty: 'medium',
      questionCount: 5
    });
    setGeneratedQuestions([]);
    setWikipediaText('');
    setShowWikipedia(false);
    setError(null);
    setInputType('topic');
    setPdfFile(null);
    setPdfTopics([]);
    setSelectedPdfTopic([]);
    setPdfTopicsLoading(false);
    setPdfId(null);
  };

  const renderWikipediaPanel = () => (
    <Collapse in={showWikipedia}>
      <Paper
        elevation={0}
        sx={{
          mt: 2,
          p: 2,
          borderRadius: 2,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.08)' : 'rgba(25, 118, 210, 0.04)',
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.3)' : 'rgba(25, 118, 210, 0.2)'}`
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center' }}>
            <PsychologyIcon sx={{ mr: 1, fontSize: 20 }} />
            Wikipedia Content
          </Typography>
          <IconButton size="small" onClick={() => setShowWikipedia(false)}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Typography
          variant="body2"
          sx={{
            maxHeight: 200,
            overflowY: 'auto',
            whiteSpace: 'pre-wrap',
            fontSize: '0.875rem'
          }}
        >
          {wikipediaText.length > 500 ? `${wikipediaText.substring(0, 500)}...` : wikipediaText}
        </Typography>
      </Paper>
    </Collapse>
  );

  const renderQuestionsPanel = () => (
    <Grow in timeout={500}>
      <Card
        elevation={0}
        sx={{
          mt: 3,
          borderRadius: 4,
          border: theme.palette.mode === 'dark'
            ? '1px solid rgba(255,255,255,0.1)'
            : '1px solid rgba(15,23,42,0.08)',
          background: theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(15,23,42,0.98) 100%)'
            : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          boxShadow: theme.palette.mode === 'dark'
            ? '0 18px 45px rgba(0,0,0,0.6)'
            : '0 20px 50px rgba(15,23,42,0.12)'
        }}
      >
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Chip
              icon={<QuizIcon />}
              label="Generated Questions"
              color="primary"
              variant="outlined"
              sx={{
                borderRadius: 999,
                fontWeight: 600,
                letterSpacing: 0.2
              }}
            />
            <Typography variant="body2" sx={{ ml: 2, color: 'text.secondary' }}>
              Click <CheckIcon fontSize="inherit" /> to accept or <ClearIcon fontSize="inherit" /> to reject questions
            </Typography>
          </Box>

          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {generatedQuestions.map((q, i) => (
              <Paper
                key={i}
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: q.status === 'accepted'
                    ? '1px solid rgba(76, 175, 80, 0.4)'
                    : q.status === 'rejected'
                      ? '1px solid rgba(244, 67, 54, 0.4)'
                      : theme.palette.mode === 'dark'
                        ? '1px solid rgba(148, 163, 184, 0.3)'
                        : '1px solid rgba(148, 163, 184, 0.3)',
                  background: q.status === 'accepted'
                    ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.07) 0%, rgba(56, 142, 60, 0.1) 100%)'
                    : q.status === 'rejected'
                      ? 'linear-gradient(135deg, rgba(244, 67, 54, 0.05) 0%, rgba(229, 57, 53, 0.08) 100%)'
                      : theme.palette.mode === 'dark'
                        ? 'rgba(15,23,42,0.9)'
                        : 'rgba(248,250,252,0.9)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 12px 30px rgba(0,0,0,0.6)'
                      : '0 12px 30px rgba(15,23,42,0.12)'
                  }
                }}
              >
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                  <Typography fontWeight="bold">
                    {i + 1}. {q.question}
                  </Typography>
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

                <Box sx={{ pl: 2, mt: 1 }}>
                  {q.options.map((opt, idx) => (
                    <Typography
                      key={idx}
                      variant="body2"
                      sx={{
                        mb: 0.5,
                        color: opt === q.correctAnswer ? 'success.main' : 'text.secondary',
                        fontWeight: opt === q.correctAnswer ? 600 : 400
                      }}
                    >
                      {String.fromCharCode(65 + idx)}. {opt}
                    </Typography>
                  ))}
                </Box>
              </Paper>
            ))}
          </Box>
        </CardContent>
      </Card>
    </Grow>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        py: { xs: 3, md: 6 },
        px: { xs: 2, md: 4 },
        background: theme.palette.mode === 'dark'
          ? 'radial-gradient(circle at top, #1e293b 0, #020617 45%, #020617 100%)'
          : 'radial-gradient(circle at top, #e0f2fe 0, #f1f5f9 40%, #f8fafc 100%)'
      }}
    >
      <Box
        sx={{
          maxWidth: 1200,
          mx: 'auto',
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '3fr 2fr' },
          gap: { xs: 3, md: 4 }
        }}
      >
        {/* Left: Form & Questions */}
        <Box>
          <Paper
            elevation={0}
            sx={{
              mb: 3,
              p: { xs: 2, md: 3 },
              borderRadius: 4,
              border: theme.palette.mode === 'dark'
                ? '1px solid rgba(148, 163, 184, 0.3)'
                : '1px solid rgba(148, 163, 184, 0.2)',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(15,23,42,0.98) 0%, rgba(15,23,42,0.95) 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 18px 45px rgba(0,0,0,0.7)'
                : '0 20px 50px rgba(15,23,42,0.15)'
            }}
          >
            <Box sx={{ position: 'relative', mb: 3 }}>
              <Box sx={{ position: 'absolute', inset: 0, opacity: 0.08, pointerEvents: 'none' }}>
                <Box
                  sx={{
                    position: 'absolute',
                    width: 220,
                    height: 220,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #22d3ee 0, transparent 60%)',
                    top: -70,
                    right: -80
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, #a855f7 0, transparent 60%)',
                    bottom: -60,
                    left: -50
                  }}
                />
              </Box>

              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Avatar sx={{ 
                    mr: 3, 
                    width: 56, 
                    height: 56,
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  }}>
                    <PsychologyIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box>
                    <Typography 
                      variant="h3" 
                      sx={{
                        fontWeight: 700,
                        background: theme.palette.mode === 'dark'
                          ? 'linear-gradient(45deg, #bb86fc 30%, #03dac6 90%)'
                          : 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                        WebkitBackgroundClip: 'text',
                        color: 'transparent',
                        mb: 0.5
                      }}
                    >
                      Create Intelligent MCQ Quizzes
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ maxWidth: 540 }}
                    >
                      Use AI to generate high-quality, topic-focused multiple-choice questions in seconds.
                      Review, curate, and save the best ones for your students or practice tests.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* FORM */}
            <Box component="form" onSubmit={handleGenerateQuestions}>
              
              {/* Quiz Name */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <QuizIcon sx={{ mr: 1, color: '#ff4081' }} />
                  Quiz Name
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Enter a descriptive name for your quiz"
                  value={quizData.name}
                  onChange={(e) => setQuizData({ ...quizData, name: e.target.value })}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 3,
                      fontSize: '1.1rem'
                    }
                  }}
                />
              </Box>

              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr' }, gap: 3, mb: 4 }}>
                {/* Input Type & Source */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <SchoolIcon sx={{ mr: 1, color: '#673ab7' }} />
                    Question Source *
                  </Typography>

                  <ToggleButtonGroup
                    value={inputType}
                    exclusive
                    onChange={handleInputTypeChange}
                    sx={{ mb: 2 }}
                    size="small"
                  >
                    <ToggleButton value="topic">Topic</ToggleButton>
                    <ToggleButton value="pdf">PDF</ToggleButton>
                  </ToggleButtonGroup>

                  {inputType === 'topic' && (
                    <TextField
                      fullWidth
                      placeholder="e.g., Cancer Biology, Machine Learning, World History"
                      value={quizData.topic}
                      onChange={(e) => setQuizData({ ...quizData, topic: e.target.value })}
                      required
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 3,
                          fontSize: '1.1rem'
                        }
                      }}
                    />
                  )}

                  {inputType === 'pdf' && (
                    <>
                      <Box
                        sx={{
                          borderRadius: 3,
                          border: '1px dashed',
                          borderColor: theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.3)'
                            : 'rgba(0,0,0,0.23)',
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer'
                        }}
                        onClick={() => document.getElementById('pdf-input')?.click()}
                      >
                        <Box>
                          <Typography sx={{ fontWeight: 500 }}>
                            {pdfFile ? pdfFile.name : 'Click to upload a PDF file'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Max size ~10MB. Only .pdf files are allowed.
                          </Typography>
                          {pdfTopicsLoading && (
                            <Typography variant="caption" color="text.secondary">
                              Detecting topics from PDF...
                            </Typography>
                          )}
                          {!pdfTopicsLoading && pdfFile && !pdfId && (
                            <Typography variant="caption" color="text.secondary">
                              Processing PDF...
                            </Typography>
                          )}
                        </Box>
                        <Button
                          variant="outlined"
                          startIcon={<UploadFileIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById('pdf-input')?.click();
                          }}
                        >
                          Choose File
                        </Button>
                        <input
                          id="pdf-input"
                          type="file"
                          accept="application/pdf"
                          style={{ display: 'none' }}
                          onChange={handlePdfChange}
                        />
                      </Box>

                      {/* Optional quiz topic/title when using PDF */}
                      <Box sx={{ mt: 2 }}>
                        <TextField
                          fullWidth
                          label="Quiz Topic / Title (Optional)"
                          placeholder="e.g., Unit 3 – OS Scheduling"
                          value={quizData.topic}
                          onChange={(e) => setQuizData({ ...quizData, topic: e.target.value })}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              fontSize: '1rem'
                            }
                          }}
                        />
                      </Box>

                      {/* PDF topics MULTI-SELECT dropdown */}
                      {pdfTopics.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography
                            variant="subtitle2"
                            sx={{ mb: 1, fontWeight: 600 }}
                          >
                            Select Topics / Sections from PDF
                          </Typography>
                          <FormControl fullWidth>
                            <Select
                              multiple
                              value={selectedPdfTopic}
                              onChange={(e) => {
                                const value = e.target.value;
                                setSelectedPdfTopic(
                                  typeof value === 'string' ? value.split(',') : value
                                );
                              }}
                              renderValue={(selected) => (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                  {selected.map((value) => {
                                    const topic = pdfTopics.find(
                                      t =>
                                        t.id === value ||
                                        t.title === value ||
                                        t.name === value
                                    );
                                    const label =
                                      topic?.title ||
                                      topic?.name ||
                                      value;
                                    return <Chip key={value} label={label} />;
                                  })}
                                </Box>
                              )}
                              sx={{ borderRadius: 3 }}
                            >
                              {pdfTopics.map((t, idx) => {
                                const value = t.id || t.title || t.name || `topic-${idx}`;
                                const label = t.title || t.name || `Topic ${idx + 1}`;
                                return (
                                  <MenuItem key={value} value={value}>
                                    <Checkbox checked={selectedPdfTopic.indexOf(value) > -1} />
                                    <ListItemText primary={label} />
                                  </MenuItem>
                                );
                              })}
                            </Select>
                          </FormControl>
                          {selectedPdfTopic.length > 0 && (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mt: 1, display: 'block' }}
                            >
                              Only the selected sections/topics from the PDF will be used for question generation (starting with the first selected).
                            </Typography>
                          )}
                        </Box>
                      )}

                      {pdfFile && !pdfTopicsLoading && pdfTopics.length === 0 && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ mt: 1, display: 'block' }}
                        >
                          Topics could not be detected automatically. The entire PDF will be used.
                        </Typography>
                      )}
                    </>
                  )}
                </Box>

                {/* Difficulty */}
                <Box>
                  <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <SpeedIcon sx={{ mr: 1, color: getDifficultyColor(quizData.difficulty) }} />
                    Difficulty
                  </Typography>
                  <FormControl fullWidth>
                    <InputLabel>Difficulty Level</InputLabel>
                    <Select
                      value={quizData.difficulty}
                      label="Difficulty Level"
                      onChange={(e) => setQuizData({ ...quizData, difficulty: e.target.value })}
                      sx={{
                        borderRadius: 3,
                        '& .MuiSelect-select': {
                          display: 'flex',
                          alignItems: 'center'
                        }
                      }}
                    >
                      <MenuItem value="easy">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4caf50', mr: 2 }} />
                          <Typography sx={{ fontWeight: 500 }}>Easy</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="medium">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff9800', mr: 2 }} />
                          <Typography sx={{ fontWeight: 500 }}>Medium</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="hard">
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f44336', mr: 2 }} />
                          <Typography sx={{ fontWeight: 500 }}>Hard</Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {/* Question count slider and quick select */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                  Number of Questions
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <IconButton
                    onClick={decrementQuestions}
                    disabled={quizData.questionCount <= 1}
                    sx={{
                      borderRadius: 2,
                      border: '1px solid rgba(148, 163, 184, 0.5)'
                    }}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Slider
                    min={1}
                    max={50}
                    value={quizData.questionCount}
                    onChange={(_, value) => handleQuestionCountChange(value)}
                    sx={{ flex: 1 }}
                  />
                  <IconButton
                    onClick={incrementQuestions}
                    disabled={quizData.questionCount >= 50}
                    sx={{
                      borderRadius: 2,
                      border: '1px solid rgba(148, 163, 184, 0.5)'
                    }}
                  >
                    <AddIcon />
                  </IconButton>
                  <TextField
                    type="number"
                    value={quizData.questionCount}
                    onChange={(e) => handleQuestionCountChange(parseInt(e.target.value) || 1)}
                    inputProps={{ min: 1, max: 50 }}
                    sx={{ width: 80 }}
                  />
                </Box>
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {quickSelectCounts.map((count) => (
                    <Chip
                      key={count}
                      label={`${count} Qs`}
                      clickable
                      onClick={() => handleQuestionCountChange(count)}
                      variant={quizData.questionCount === count ? 'filled' : 'outlined'}
                      color={quizData.questionCount === count ? 'primary' : 'default'}
                      sx={{ borderRadius: 999 }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Buttons */}
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={
                    loading ||
                    (inputType === 'pdf' && (!pdfFile || pdfTopicsLoading || !pdfId))
                  }
                  startIcon={loading ? <CircularProgress size={20} /> : <PsychologyIcon />}
                  sx={{
                    borderRadius: 999,
                    px: 3,
                    py: 1.2,
                    textTransform: 'none',
                    fontWeight: 600,
                    letterSpacing: 0.3,
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    boxShadow: '0 18px 45px rgba(79, 70, 229, 0.35)'
                  }}
                >
                  {loading ? 'Generating...' : 'Generate Questions with AI'}
                </Button>
                <Button
                  type="button"
                  variant="outlined"
                  color="inherit"
                  onClick={handleReset}
                  startIcon={<ClearIcon />}
                  sx={{
                    borderRadius: 999,
                    px: 2.5,
                    py: 1.1,
                    textTransform: 'none',
                    fontWeight: 500
                  }}
                >
                  Clear All
                </Button>
                <Box sx={{ flexGrow: 1 }} />
                <Fade in={generatedQuestions.some(q => q.status === 'accepted')}>
                  <Button
                    type="button"
                    variant="contained"
                    color="success"
                    onClick={handleAddQuiz}
                    startIcon={<SaveIcon />}
                    sx={{
                      borderRadius: 999,
                      px: 3,
                      py: 1.2,
                      textTransform: 'none',
                      fontWeight: 600
                    }}
                  >
                    Save Quiz
                  </Button>
                </Fade>
              </Box>

              {/* Error */}
              {error && (
                <Alert
                  severity="error"
                  sx={{
                    mt: 2,
                    borderRadius: 2
                  }}
                  action={
                    <IconButton
                      aria-label="close"
                      color="inherit"
                      size="small"
                      onClick={() => setError(null)}
                    >
                      <CloseIcon fontSize="inherit" />
                    </IconButton>
                  }
                >
                  {error}
                </Alert>
              )}

              {/* Wikipedia */}
              {renderWikipediaPanel()}

              {/* Generated Questions */}
              {!!generatedQuestions.length && renderQuestionsPanel()}
            </Box>
          </Paper>
        </Box>

        {/* Right side (info / tips) */}
        <Box>
          <Card
            elevation={0}
            sx={{
              mb: 3,
              borderRadius: 4,
              border: theme.palette.mode === 'dark'
                ? '1px solid rgba(148, 163, 184, 0.4)'
                : '1px solid rgba(148, 163, 184, 0.25)',
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(145deg, rgba(15,23,42,0.98) 0%, rgba(15,23,42,0.96) 100%)'
                : 'linear-gradient(145deg, #ffffff 0%, #eff6ff 100%)',
              boxShadow: theme.palette.mode === 'dark'
                ? '0 18px 45px rgba(0,0,0,0.75)'
                : '0 20px 50px rgba(148, 163, 184, 0.4)'
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Smart Quiz Generation Tips
              </Typography>
              <Box component="ul" sx={{ pl: 3, mb: 0 }}>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Use specific topics like "Photosynthesis in plants" instead of just "Biology".
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Start with 10–20 questions while fine-tuning your quiz structure.
                </Typography>
                <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                  Review generated questions and accept only those that match your teaching style.
                </Typography>
                <Typography component="li" variant="body2">
                  Combine AI-generated questions with your own for maximum effectiveness.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Snackbar */}
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

export default CreateQuiz;
