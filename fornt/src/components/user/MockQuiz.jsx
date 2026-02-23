import { useState, useEffect } from 'react';
import { 
  Button, 
  Box, 
  Typography, 
  TextField,
  FormControl,
  Select,
  MenuItem,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  LinearProgress,
  Chip,
  Paper,
  Alert,
  CircularProgress,
  Container,
  Fade,
  Grow,
  useTheme,
  IconButton,
  Divider,
  Slider,
  ToggleButton,
  ToggleButtonGroup,
  Checkbox,
  ListItemText
} from '@mui/material';
import {
  Timer as TimerIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Send as SendIcon,
  Warning as WarningIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Quiz as QuizIcon,
  Psychology as PsychologyIcon,
  School as SchoolIcon,
  Speed as SpeedIcon,
  UploadFile as UploadFileIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// API URL configuration for environment support
const getApiUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000';
};

const API_URL = getApiUrl();

const MockQuiz = () => {
  const theme = useTheme();
  const [quizConfig, setQuizConfig] = useState({
    topic: '',
    difficulty: 'medium',
    questionCount: 5
  });
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedAnswer, setSelectedAnswer] = useState('');

  // Topic / PDF selection + PDF topics
  const [inputType, setInputType] = useState('topic'); // 'topic' | 'pdf'
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfTopics, setPdfTopics] = useState([]);      // [{ value, label, ...raw }]
  const [selectedPdfTopic, setSelectedPdfTopic] = useState([]); // array of values
  const [pdfTopicsLoading, setPdfTopicsLoading] = useState(false);
  const [pdfId, setPdfId] = useState(null); // 👈 NEW: backend PDF session id

  // Timer states
  const [timeLeft, setTimeLeft] = useState(null);
  const [isTimeWarning, setIsTimeWarning] = useState(false);
  const [timerStarted, setTimerStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizStarted, setQuizStarted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const navigate = useNavigate();

  // Helper: label for selected PDF topics
  const getSelectedPdfTopicsLabel = () => {
    if (!Array.isArray(selectedPdfTopic) || selectedPdfTopic.length === 0) {
      return 'From PDF';
    }
    return selectedPdfTopic
      .map((value) => {
        const topic = pdfTopics.find((t) => t.value === value);
        return topic?.label || value;
      })
      .join(', ');
  };

  // Initialize timer only when quiz data is available
  useEffect(() => {
    if (quizStarted && questions.length > 0 && !timerStarted) {
      const totalTimeInSeconds = questions.length * 60;
      setTimeLeft(totalTimeInSeconds);
      setTimerStarted(true);
    }
  }, [quizStarted, questions, timerStarted]);

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft === null || timeLeft === undefined || !timerStarted || !quizStarted) {
      return;
    }

    if (timeLeft <= 0) {
      handleTimeUp();
      return;
    }

    if (timeLeft <= 120) {
      setIsTimeWarning(true);
    } else {
      setIsTimeWarning(false);
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev > 1) {
          return prev - 1;
        } else {
          clearInterval(timer);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, timerStarted, quizStarted]);

  // Update selected answer when question changes
  useEffect(() => {
    setSelectedAnswer(answers[currentQuestionIndex] || '');
  }, [currentQuestionIndex, answers]);

  const handleTimeUp = () => {
    handleSubmit(true);
  };

  const formatTime = (seconds) => {
    if (seconds === null || seconds === undefined) return '00:00';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds
      .toString()
      .padStart(2, '0')}`;
  };

  // Number input handlers
  const handleQuestionCountChange = (newValue) => {
    const count = Math.min(20, Math.max(1, newValue));
    setQuizConfig({ ...quizConfig, questionCount: count });
  };

  const incrementQuestions = () => {
    if (quizConfig.questionCount < 20) {
      handleQuestionCountChange(quizConfig.questionCount + 1);
    }
  };

  const decrementQuestions = () => {
    if (quizConfig.questionCount > 1) {
      handleQuestionCountChange(quizConfig.questionCount - 1);
    }
  };

  const quickSelectCounts = [5, 10, 15, 20];

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

  // Input type toggle
  const handleInputTypeChange = (event, newType) => {
    if (!newType) return;
    setInputType(newType);
    setError('');
    if (newType === 'topic') {
      setPdfFile(null);
      setPdfTopics([]);
      setSelectedPdfTopic([]);
      setPdfTopicsLoading(false);
      setPdfId(null); // 👈 clear pdf session when leaving PDF mode
    }
  };

  // Fetch topics from PDF
  const fetchPdfTopics = async (file) => {
    setPdfTopics([]);
    setSelectedPdfTopic([]);
    setPdfTopicsLoading(true);
    setError('');
    setPdfId(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_URL}/api/pdf-topics`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();
      const rawTopics = data.topics || [];

      // 👇 store pdfId from backend so we can reuse the same uploaded PDF
      if (data.pdfId) {
        setPdfId(data.pdfId);
      }

      const topics = rawTopics.map((t, idx) => ({
        value: t.id || t.title || t.name || `topic-${idx}`,
        label: t.title || t.name || `Topic ${idx + 1}`,
        ...t
      }));

      setPdfTopics(topics);
      if (topics.length > 0) {
        setSelectedPdfTopic([topics[0].value]); // default: first topic selected
      }
    } catch (err) {
      console.error('Error detecting topics from PDF:', err);
      setError('PDF uploaded, but topics could not be detected. Full PDF will be used.');
      // backend still returns pdfId in fallback case, so keep it if present
    } finally {
      setPdfTopicsLoading(false);
    }
  };

  // PDF file selection
  const handlePdfChange = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setError('Please upload a valid PDF file');
      return;
    }
    setPdfFile(file);
    setError('');
    fetchPdfTopics(file);
  };

  const handleStartQuiz = async () => {
    if (inputType === 'topic' && !quizConfig.topic.trim()) {
      setError('Please enter a topic for the mock quiz');
      return;
    }
    if (inputType === 'pdf' && !pdfFile) {
      setError('Please upload a PDF for the mock quiz');
      return;
    }
    // NEW: require pdfId so that backend can reuse the uploaded PDF
    if (inputType === 'pdf' && !pdfId) {
      setError('Please wait until the PDF is processed and topics are detected.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      let generatedQuestions = [];

      if (inputType === 'topic') {
        // Topic-based flow
        let wikiContext = '';
        try {
          wikiContext = await fetchWikipedia(quizConfig.topic);
        } catch (wikiError) {
          // ignore
        }

        const prompt = buildPrompt(
          quizConfig.topic,
          quizConfig.difficulty,
          quizConfig.questionCount,
          wikiContext.startsWith('Error') ? null : wikiContext
        );

        const response = await fetch(`${API_URL}/api/generate-mcqs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt, count: quizConfig.questionCount })
        });

        if (!response.ok) throw new Error(await response.text());
        
        const result = await response.json();
        generatedQuestions = Array.isArray(result) ? result : 
                             Array.isArray(result?.mcqs) ? result.mcqs : 
                             [];
      } else {
        // PDF-based flow (NEW: use pdfId + JSON instead of sending file again)

        // decide which topic string to send to backend
        let topicForBackend = 'Entire Document';
        if (Array.isArray(selectedPdfTopic) && selectedPdfTopic.length > 0) {
          const firstVal = selectedPdfTopic[0];
          const topicObj = pdfTopics.find(t => t.value === firstVal);
          // use LLM-friendly id if available, else label
          topicForBackend = topicObj?.id || topicObj?.label || 'Entire Document';
        } else if (quizConfig.topic) {
          topicForBackend = quizConfig.topic;
        }

        const response = await fetch(`${API_URL}/api/generate-mcqs-from-pdf`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            pdfId,
            topic: topicForBackend,
            count: quizConfig.questionCount,
            difficulty: quizConfig.difficulty
          })
        });

        if (!response.ok) throw new Error(await response.text());

        const result = await response.json();
        generatedQuestions = Array.isArray(result) ? result :
                             Array.isArray(result?.mcqs) ? result.mcqs :
                             Array.isArray(result?.questions) ? result.questions :
                             [];
      }

      const formattedQuestions = generatedQuestions.map(q => ({
        question: q[0] || q.question || 'No question text',
        options: Array.isArray(q[1]) ? q[1] : q.options || ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
        correctAnswer:
          (typeof q[2] === 'number' && Array.isArray(q[1]) && q[1][q[2]]) ? q[1][q[2]] :
          q.correctAnswer || q.answer ||
          (Array.isArray(q.options) ? q.options[0] : 'Option 1')
      }));

      if (!formattedQuestions.length) {
        throw new Error('No questions generated. Please try again with a different topic or PDF.');
      }

      setQuestions(formattedQuestions);
      setAnswers({});
      setSelectedAnswer('');
      setCurrentQuestionIndex(0);
      setQuizStarted(true);
    } catch (err) {
      console.error('Error generating mock quiz:', err);
      setError(err.message || 'Failed to generate questions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (event) => {
    setSelectedAnswer(event.target.value);
  };

  const handleNext = () => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: selectedAnswer
    }));

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: selectedAnswer
    }));

    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmit = async (isTimeUp = false) => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      setError('');
      
      const finalAnswers = { ...answers, [currentQuestionIndex]: selectedAnswer };

      let correctCount = 0;
      const detailedAnswers = questions.map((question, index) => {
        const userAnswer = finalAnswers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        if (isCorrect) correctCount++;
        
        return {
          question: question.question,
          selected: userAnswer || 'Not answered',
          correct: question.correctAnswer,
          isCorrect
        };
      });

      const pdfTopicLabel = getSelectedPdfTopicsLabel();

      const results = {
        quizId: 'mock-' + Date.now(),
        quizName: `Mock Quiz: ${
          quizConfig.topic ||
          (inputType === 'pdf' ? pdfTopicLabel : 'Custom')
        }`,
        date: new Date(),
        score: correctCount,
        total: questions.length,
        topic: quizConfig.topic,
        difficulty: quizConfig.difficulty,
        answers: detailedAnswers,
        timeUp: isTimeUp
      };

      const user = JSON.parse(localStorage.getItem('quizUser') || '{}');
      const token = user.token;

      if (token) {
        try {
          const response = await fetch(`${API_URL}/api/test-history`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(results)
          });

          if (!response.ok) {
            console.error('Failed to save mock quiz to history');
          }
        } catch (saveError) {
          console.error('Error saving mock quiz to history:', saveError);
        }
      }

      navigate('/user/view-result', { state: { results } });
    } catch (error) {
      console.error('Error submitting mock quiz:', error);
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetQuiz = () => {
    setQuizStarted(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers({});
    setSelectedAnswer('');
    setTimeLeft(null);
    setTimerStarted(false);
    setIsTimeWarning(false);
    setError('');
    setSubmitting(false);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return '#4caf50';
      case 'medium': return '#ff9800';
      case 'hard': return '#f44336';
      default: return '#2196f3';
    }
  };

  // ---------- SETUP SCREEN ----------
  if (!quizStarted) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 2, sm: 4 } }}>
        <Fade in timeout={600}>
          <Paper 
            elevation={0}
            sx={{ 
              p: { xs: 3, sm: 5 }, 
              borderRadius: 4,
              background: theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%)'
                : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
              backdropFilter: 'blur(20px)',
              border: `1px solid ${theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.1)' 
                : 'rgba(0,0,0,0.1)'}`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Background Pattern */}
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
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PsychologyIcon sx={{ 
                  fontSize: 40, 
                  mr: 2,
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(45deg, #bb86fc 30%, #03dac6 90%)'
                    : 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }} />
                <Typography 
                  variant="h3" 
                  sx={{
                    fontWeight: 700,
                    background: theme.palette.mode === 'dark'
                      ? 'linear-gradient(45deg, #bb86fc 30%, #03dac6 90%)'
                      : 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                    fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                  }}
                >
                  Create Mock Quiz
                </Typography>
              </Box>
              
              <Typography 
                variant="h6" 
                color="text.secondary" 
                sx={{ mb: 4, fontSize: { xs: '1rem', sm: '1.25rem' } }}
              >
                Generate AI-powered quiz questions on any topic or directly from a PDF and save to your history
              </Typography>

              {error && (
                <Fade in>
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      background: theme.palette.mode === 'dark'
                        ? 'rgba(244, 67, 54, 0.1)'
                        : 'rgba(244, 67, 54, 0.05)',
                      border: `1px solid ${theme.palette.mode === 'dark'
                        ? 'rgba(244, 67, 54, 0.3)'
                        : 'rgba(244, 67, 54, 0.2)'}`,
                      borderRadius: 2
                    }}
                  >
                    {error}
                  </Alert>
                </Fade>
              )}

              <Box component="form" sx={{ mb: 4 }}>
                {/* Input type + topic/pdf */}
                <Grow in timeout={800} style={{ transitionDelay: '200ms' }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <SchoolIcon sx={{ mr: 1, color: '#673ab7' }} />
                      Question Source
                    </Typography>

                    <ToggleButtonGroup
                      value={inputType}
                      exclusive
                      onChange={handleInputTypeChange}
                      size="small"
                      sx={{ mb: 2 }}
                    >
                      <ToggleButton value="topic">Topic</ToggleButton>
                      <ToggleButton value="pdf">PDF</ToggleButton>
                    </ToggleButtonGroup>

                    {inputType === 'topic' && (
                      <TextField
                        fullWidth
                        placeholder="e.g., JavaScript, World History, Biology, Machine Learning"
                        value={quizConfig.topic}
                        onChange={(e) => setQuizConfig({...quizConfig, topic: e.target.value})}
                        required
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            fontSize: { xs: '1rem', sm: '1.1rem' },
                            padding: { xs: '12px', sm: '16px' }
                          }
                        }}
                      />
                    )}

                    {inputType === 'pdf' && (
                      <>
                        <Box
                          sx={{
                            borderRadius: 2,
                            border: '1px dashed',
                            borderColor: theme.palette.mode === 'dark'
                              ? 'rgba(255,255,255,0.3)'
                              : 'rgba(0,0,0,0.23)',
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            mt: 1
                          }}
                          onClick={() => document.getElementById('mock-pdf-input')?.click()}
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
                          </Box>
                          <Button
                            variant="outlined"
                            startIcon={<UploadFileIcon />}
                            onClick={(e) => {
                              e.stopPropagation();
                              document.getElementById('mock-pdf-input')?.click();
                            }}
                          >
                            Choose File
                          </Button>
                          <input
                            id="mock-pdf-input"
                            type="file"
                            accept="application/pdf"
                            style={{ display: 'none' }}
                            onChange={handlePdfChange}
                          />
                        </Box>

                        {/* Optional quiz title/topic for labeling */}
                        <Box sx={{ mt: 2 }}>
                          <TextField
                            fullWidth
                            label="Quiz Title / Topic (Optional)"
                            placeholder="e.g., Unit 2 – Sorting Algorithms"
                            value={quizConfig.topic}
                            onChange={(e) => setQuizConfig({...quizConfig, topic: e.target.value})}
                            sx={{
                              '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                fontSize: { xs: '1rem', sm: '1.05rem' }
                              }
                            }}
                          />
                        </Box>

                        {/* Multi-select topics from PDF */}
                        {pdfTopics.length > 0 && (
                          <Box sx={{ mt: 2 }}>
                            <Typography
                              variant="subtitle2"
                              sx={{ mb: 1, fontWeight: 600 }}
                            >
                              Select Topic(s) from PDF
                            </Typography>
                            <FormControl fullWidth>
                              <Select
                                multiple
                                value={selectedPdfTopic}
                                onChange={(e) => setSelectedPdfTopic(e.target.value)}
                                renderValue={(selected) => (
                                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {selected.map((value) => {
                                      const topic = pdfTopics.find((t) => t.value === value);
                                      const label = topic?.label || value;
                                      return <Chip key={value} label={label} />;
                                    })}
                                  </Box>
                                )}
                                sx={{ borderRadius: 2 }}
                              >
                                {pdfTopics.map((t) => (
                                  <MenuItem key={t.value} value={t.value}>
                                    <Checkbox checked={selectedPdfTopic.indexOf(t.value) > -1} />
                                    <ListItemText primary={t.label} />
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mt: 1, display: 'block' }}
                            >
                              You can select one or more sections; MCQs will be generated from the first selected topic for now.
                            </Typography>
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
                </Grow>

                {/* Difficulty Select */}
                <Grow in timeout={800} style={{ transitionDelay: '400ms' }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <SpeedIcon sx={{ mr: 1, color: getDifficultyColor(quizConfig.difficulty) }} />
                      Difficulty Level
                    </Typography>
                    <FormControl fullWidth>
                      <Select
                        value={quizConfig.difficulty}
                        onChange={(e) => setQuizConfig({...quizConfig, difficulty: e.target.value})}
                        sx={{
                          borderRadius: 2,
                          fontSize: { xs: '1rem', sm: '1.1rem' }
                        }}
                      >
                        <MenuItem value="easy">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#4caf50', mr: 1 }} />
                            Easy
                          </Box>
                        </MenuItem>
                        <MenuItem value="medium">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff9800', mr: 1 }} />
                            Medium
                          </Box>
                        </MenuItem>
                        <MenuItem value="hard">
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#f44336', mr: 1 }} />
                            Hard
                          </Box>
                        </MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Grow>

                {/* Number of questions */}
                <Grow in timeout={800} style={{ transitionDelay: '600ms' }}>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                      <QuizIcon sx={{ mr: 1, color: '#2196f3' }} />
                      Number of Questions
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Card 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          background: theme.palette.mode === 'dark'
                            ? 'rgba(255,255,255,0.02)'
                            : 'rgba(0,0,0,0.01)'
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <IconButton 
                            onClick={decrementQuestions}
                            disabled={quizConfig.questionCount <= 1}
                            sx={{ 
                              bgcolor: 'primary.main',
                              color: 'white',
                              width: { xs: 48, sm: 40 },
                              height: { xs: 48, sm: 40 },
                              '&:hover': { bgcolor: 'primary.dark' },
                              '&:disabled': { bgcolor: 'action.disabled' }
                            }}
                          >
                            <RemoveIcon />
                          </IconButton>
                          
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mx: 2 }}>
                            <Typography 
                              variant="h4" 
                              sx={{ 
                                fontWeight: 700,
                                fontSize: { xs: '2rem', sm: '2.5rem' },
                                color: 'primary.main'
                              }}
                            >
                              {quizConfig.questionCount}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Questions
                            </Typography>
                          </Box>
                          
                          <IconButton 
                            onClick={incrementQuestions}
                            disabled={quizConfig.questionCount >= 20}
                            sx={{ 
                              bgcolor: 'primary.main',
                              color: 'white',
                              width: { xs: 48, sm: 40 },
                              height: { xs: 48, sm: 40 },
                              '&:hover': { bgcolor: 'primary.dark' },
                              '&:disabled': { bgcolor: 'action.disabled' }
                            }}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                      </Card>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                        <Typography variant="body2" color="text.secondary" sx={{ width: '100%', textAlign: 'center', mb: 1 }}>
                          Quick Select:
                        </Typography>
                        {quickSelectCounts.map((count) => (
                          <Chip
                            key={count}
                            label={`${count} Questions`}
                            onClick={() => handleQuestionCountChange(count)}
                            color={quizConfig.questionCount === count ? "primary" : "default"}
                            variant={quizConfig.questionCount === count ? "filled" : "outlined"}
                            sx={{ 
                              fontWeight: 600,
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              height: { xs: 36, sm: 32 }
                            }}
                          />
                        ))}
                      </Box>

                      <Box sx={{ display: { xs: 'none', md: 'block' }, px: 2 }}>
                        <Slider
                          value={quizConfig.questionCount}
                          onChange={(e, newValue) => handleQuestionCountChange(newValue)}
                          min={1}
                          max={20}
                          marks
                          step={1}
                          valueLabelDisplay="auto"
                          sx={{ mt: 2 }}
                        />
                      </Box>
                    </Box>
                  </Box>
                </Grow>

                {/* Start Quiz Button */}
                <Grow in timeout={800} style={{ transitionDelay: '800ms' }}>
                  <Button
                    variant="contained"
                    onClick={handleStartQuiz}
                    disabled={
                      loading ||
                      (inputType === 'topic' && !quizConfig.topic.trim()) ||
                      (inputType === 'pdf' && (!pdfFile || pdfTopicsLoading || !pdfId))
                    }
                    size="large"
                    fullWidth
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <PsychologyIcon />}
                    sx={{
                      py: { xs: 2, sm: 1.5 },
                      fontSize: { xs: '1.1rem', sm: '1.2rem' },
                      fontWeight: 700,
                      textTransform: 'none',
                      borderRadius: 3,
                      background: 'linear-gradient(45deg, #ff4081 30%, #f50057 90%)',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #f50057 30%, #c51162 90%)',
                        transform: 'translateY(-2px)',
                        boxShadow: theme.palette.mode === 'dark'
                          ? '0 8px 25px rgba(255, 64, 129, 0.4)'
                          : '0 8px 25px rgba(255, 64, 129, 0.35)',
                      },
                      '&:disabled': {
                        background: 'rgba(0,0,0,0.12)',
                        transform: 'none'
                      }
                    }}
                  >
                    {loading ? 'Generating Questions...' : 'Start Mock Quiz'}
                  </Button>
                </Grow>
              </Box>
            </Box>
          </Paper>
        </Fade>
      </Container>
    );
  }

  // ---------- QUIZ SCREEN ----------
  if (!questions.length || timeLeft === null) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          minHeight="70vh"
          sx={{
            background: theme.palette.mode === 'dark' 
              ? 'linear-gradient(135deg, rgba(18,18,18,0.9) 0%, rgba(30,30,30,0.9) 100%)'
              : 'linear-gradient(135deg, rgba(248,250,252,0.9) 0%, rgba(243,244,246,0.9) 100%)',
            borderRadius: 3,
            p: 4,
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.1)' 
              : 'rgba(0,0,0,0.1)'}`
          }}
        >
          <CircularProgress size={60} sx={{ mb: 3 }} />
          <Typography variant="h5" sx={{ color: 'text.primary', fontWeight: 600 }}>
            Loading quiz...
          </Typography>
        </Box>
      </Container>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const pdfTopicLabel = getSelectedPdfTopicsLabel();

  return (
    <Container maxWidth="md" sx={{ py: { xs: 2, md: 4 }, px: { xs: 2, md: 3 } }}>
      <Fade in timeout={600}>
        <Paper 
          elevation={0}
          sx={{ 
            p: { xs: 2, md: 3 }, 
            mb: 3,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(30,30,30,0.95) 0%, rgba(45,45,45,0.95) 100%)'
              : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
            backdropFilter: 'blur(20px)',
            border: `1px solid ${theme.palette.mode === 'dark' 
              ? 'rgba(255,255,255,0.1)' 
              : 'rgba(0,0,0,0.1)'}`,
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box 
              display="flex" 
              justifyContent="space-between" 
              alignItems="center" 
              mb={2}
              flexDirection={{ xs: 'column', sm: 'row' }}
              gap={{ xs: 2, sm: 0 }}
            >
              <Typography 
                variant="h4" 
                sx={{
                  fontWeight: 700,
                  background: theme.palette.mode === 'dark'
                    ? 'linear-gradient(45deg, #bb86fc 30%, #03dac6 90%)'
                    : 'linear-gradient(45deg, #6366f1 30%, #8b5cf6 90%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  fontSize: { xs: '1.5rem', sm: '2rem', md: '2.5rem' },
                  textAlign: { xs: 'center', sm: 'left' }
                }}
              >
                Mock Quiz: {quizConfig.topic || (inputType === 'pdf' ? pdfTopicLabel : '')}
              </Typography>
              
              <Box 
                display="flex" 
                alignItems="center" 
                gap={1}
                flexDirection={{ xs: 'row', sm: 'row' }}
                flexWrap="wrap"
                justifyContent={{ xs: 'center', sm: 'flex-end' }}
              >
                <Chip
                  icon={<TimerIcon />}
                  label={formatTime(timeLeft)}
                  color={isTimeWarning ? "error" : "primary"}
                  sx={{ 
                    fontSize: { xs: '0.9rem', sm: '1.1rem' }, 
                    px: { xs: 0.5, sm: 1 },
                    height: { xs: 28, sm: 32 }
                  }}
                />
                {isTimeWarning && (
                  <Chip
                    icon={<WarningIcon />}
                    label="Warning!"
                    color="error"
                    variant="outlined"
                    sx={{ 
                      fontSize: { xs: '0.8rem', sm: '0.9rem' },
                      height: { xs: 28, sm: 32 }
                    }}
                  />
                )}
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', justifyContent: { xs: 'center', sm: 'flex-start' } }}>
              <Chip
                label={quizConfig.topic || (inputType === 'pdf' ? 'PDF-based quiz' : 'Mock quiz')}
                size="small"
                color="primary"
              />
              <Chip label={quizConfig.difficulty} size="small" sx={{ color: getDifficultyColor(quizConfig.difficulty) }} />
              <Chip label="Mock Quiz" size="small" color="info" />
            </Box>

            <Typography 
              variant="body1" 
              color="text.secondary" 
              gutterBottom
              sx={{ 
                fontSize: { xs: '0.9rem', sm: '1rem' },
                textAlign: { xs: 'center', sm: 'left' }
              }}
            >
              Question {currentQuestionIndex + 1} of {questions.length}
            </Typography>
            
            <LinearProgress 
              variant="determinate" 
              value={progress} 
              sx={{ 
                height: { xs: 6, sm: 8 }, 
                borderRadius: 4,
                background: theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.1)' 
                  : 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(45deg, #ff4081 30%, #f50057 90%)',
                  borderRadius: 4
                }
              }} 
            />
          </Box>
        </Paper>
      </Fade>

      {isTimeWarning && (
        <Fade in timeout={300}>
          <Alert 
            severity="warning" 
            sx={{ 
              mb: 3,
              background: theme.palette.mode === 'dark'
                ? 'rgba(255, 193, 7, 0.1)'
                : 'rgba(255, 193, 7, 0.05)',
              border: `1px solid ${theme.palette.mode === 'dark'
                ? 'rgba(255, 193, 7, 0.3)'
                : 'rgba(255, 193, 7, 0.2)'}`,
              borderRadius: 2,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Less than 2 minutes remaining! The quiz will auto-submit when time runs out.
          </Alert>
        </Fade>
      )}

      <Grow in timeout={800} style={{ transitionDelay: '200ms' }}>
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
            borderRadius: 3,
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 }, position: 'relative', zIndex: 1 }}>
            <Typography 
              variant="h5" 
              gutterBottom 
              sx={{ 
                mb: 4, 
                minHeight: { xs: 'auto', sm: '3rem' },
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontWeight: 600,
                lineHeight: 1.4,
                color: 'text.primary'
              }}
            >
              {currentQuestion.question}
            </Typography>

            <Divider sx={{ mb: 3, opacity: 0.3 }} />

            <RadioGroup
              value={selectedAnswer}
              onChange={handleAnswerChange}
              sx={{ gap: 1 }}
            >
              {currentQuestion.options.map((option, index) => (
                <Card 
                  key={index}
                  variant="outlined"
                  sx={{ 
                    mb: 1,
                    borderRadius: 2,
                    borderColor: selectedAnswer === option ? 'primary.main' : theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.1)' 
                      : 'rgba(0,0,0,0.1)',
                    bgcolor: selectedAnswer === option 
                      ? theme.palette.mode === 'dark' 
                        ? 'rgba(187, 134, 252, 0.08)' 
                        : 'rgba(99, 102, 241, 0.08)'
                      : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      borderColor: theme.palette.mode === 'dark' ? '#bb86fc' : '#6366f1',
                      backgroundColor: theme.palette.mode === 'dark'
                        ? 'rgba(187, 134, 252, 0.05)'
                        : 'rgba(99, 102, 241, 0.05)',
                      transform: 'translateX(4px)'
                    }
                  }}
                >
                  <FormControlLabel
                    value={option}
                    control={
                      <Radio 
                        sx={{
                          color: theme.palette.mode === 'dark' ? '#bb86fc' : '#6366f1',
                          '&.Mui-checked': {
                            color: theme.palette.mode === 'dark' ? '#bb86fc' : '#6366f1',
                          }
                        }}
                      />
                    }
                    label={
                      <Typography 
                        sx={{ 
                          fontSize: { xs: '0.9rem', sm: '1rem' },
                          fontWeight: 500,
                          color: 'text.primary'
                        }}
                      >
                        {option}
                      </Typography>
                    }
                    sx={{ 
                      width: '100%',
                      m: 0,
                      p: { xs: 1.5, sm: 2 }
                    }}
                  />
                </Card>
              ))}
            </RadioGroup>

            {error && (
              <Fade in>
                <Alert 
                  severity="error" 
                  sx={{ 
                    mt: 2,
                    background: theme.palette.mode === 'dark'
                      ? 'rgba(244, 67, 54, 0.1)'
                      : 'rgba(244, 67, 54, 0.05)',
                    border: `1px solid ${theme.palette.mode === 'dark'
                      ? 'rgba(244, 67, 54, 0.3)'
                      : 'rgba(244, 67, 54, 0.2)'}`,
                    borderRadius: 2
                  }}
                >
                  {error}
                </Alert>
              </Fade>
            )}

            <Divider sx={{ mt: 4, mb: 3, opacity: 0.3 }} />

            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 },
                alignItems: { xs: 'stretch', sm: 'center' }
              }}
            >
              <Box 
                display="flex" 
                gap={1}
                flexDirection={{ xs: 'row', sm: 'row' }}
                justifyContent={{ xs: 'space-between', sm: 'flex-start' }}
              >
                <Button
                  variant="outlined"
                  onClick={resetQuiz}
                  startIcon={<ArrowBackIcon />}
                  disabled={submitting}
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    px: { xs: 2, sm: 3 },
                    borderColor: '#f44336',
                    color: '#f44336',
                    '&:hover': {
                      borderColor: '#d32f2f',
                      backgroundColor: 'rgba(244, 67, 54, 0.08)',
                    }
                  }}
                >
                  Setup
                </Button>
                <Button
                  variant="outlined"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0 || submitting}
                  startIcon={<ArrowBackIcon />}
                  sx={{
                    fontSize: { xs: '0.8rem', sm: '0.9rem' },
                    px: { xs: 2, sm: 3 }
                  }}
                >
                  Previous
                </Button>
              </Box>
              
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={!selectedAnswer || submitting}
                endIcon={
                  submitting ? <CircularProgress size={16} color="inherit" /> :
                  currentQuestionIndex === questions.length - 1 ? <SendIcon /> : <ArrowForwardIcon />
                }
                sx={{
                  background: currentQuestionIndex === questions.length - 1 
                    ? 'linear-gradient(45deg, #4caf50 30%, #2e7d32 90%)'
                    : 'linear-gradient(45deg, #ff4081 30%, #f50057 90%)',
                  minWidth: { xs: '100%', sm: 160 },
                  py: { xs: 1.5, sm: 1 },
                  fontSize: { xs: '1rem', sm: '0.9rem' },
                  fontWeight: 700,
                  textTransform: 'none',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    background: currentQuestionIndex === questions.length - 1 
                      ? 'linear-gradient(45deg, #2e7d32 30%, #1b5e20 90%)'
                      : 'linear-gradient(45deg, #f50057 30%, #c51162 90%)',
                    transform: 'translateY(-2px)',
                    boxShadow: theme.palette.mode === 'dark'
                      ? '0 8px 25px rgba(255, 64, 129, 0.4)'
                      : '0 8px 25px rgba(255, 64, 129, 0.35)',
                  },
                  '&:disabled': {
                    background: 'rgba(0,0,0,0.12)',
                    color: 'rgba(0,0,0,0.26)',
                    transform: 'none'
                  }
                }}
              >
                {submitting ? 'Submitting...' :
                 currentQuestionIndex === questions.length - 1 ? 'Submit Quiz' : 'Next Question'}
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Grow>
    </Container>
  );
};

export default MockQuiz;
