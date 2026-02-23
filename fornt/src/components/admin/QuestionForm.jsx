import { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Select, 
  MenuItem, 
  InputLabel, 
  FormControl,
  Chip,
  IconButton
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';

const QuestionForm = () => {
  const [question, setQuestion] = useState({
    text: '',
    topic: 'geography',
    difficulty: 'easy',
    options: ['', '', '', ''],
    correctAnswer: 0
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuestion(prev => ({ ...prev, [name]: value }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...question.options];
    newOptions[index] = value;
    setQuestion(prev => ({ ...prev, options: newOptions }));
  };

  const addOption = () => {
    if (question.options.length < 6) {
      setQuestion(prev => ({ ...prev, options: [...prev.options, ''] }));
    }
  };

  const removeOption = (index) => {
    if (question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== index);
      setQuestion(prev => ({
        ...prev,
        options: newOptions,
        correctAnswer: prev.correctAnswer >= index && prev.correctAnswer !== 0 
          ? prev.correctAnswer - 1 
          : prev.correctAnswer
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would send the question to the backend
    // console.log('Question submitted:', question);
    alert('Question added successfully (mock)');
    setQuestion({
      text: '',
      topic: 'geography',
      difficulty: 'easy',
      options: ['', '', '', ''],
      correctAnswer: 0
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Add New Question
      </Typography>
      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Question Text"
          name="text"
          value={question.text}
          onChange={handleChange}
          required
          margin="normal"
        />
        
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <FormControl fullWidth margin="normal">
            <InputLabel>Topic</InputLabel>
            <Select
              name="topic"
              value={question.topic}
              onChange={handleChange}
              label="Topic"
              required
            >
              <MenuItem value="geography">Geography</MenuItem>
              <MenuItem value="history">History</MenuItem>
              <MenuItem value="science">Science</MenuItem>
              <MenuItem value="art">Art</MenuItem>
              <MenuItem value="literature">Literature</MenuItem>
              <MenuItem value="sports">Sports</MenuItem>
            </Select>
          </FormControl>
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Difficulty</InputLabel>
            <Select
              name="difficulty"
              value={question.difficulty}
              onChange={handleChange}
              label="Difficulty"
              required
            >
              <MenuItem value="easy">Easy</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="hard">Hard</MenuItem>
            </Select>
          </FormControl>
        </Box>
        
        <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
          Options
        </Typography>
        
        {question.options.map((option, index) => (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              label={`Option ${index + 1}`}
              value={option}
              onChange={(e) => handleOptionChange(index, e.target.value)}
              required
            />
            <IconButton 
              onClick={() => removeOption(index)} 
              disabled={question.options.length <= 2}
            >
              <RemoveIcon />
            </IconButton>
            <Chip
              label="Correct"
              color={question.correctAnswer === index ? 'primary' : 'default'}
              onClick={() => setQuestion(prev => ({ ...prev, correctAnswer: index }))}
              variant={question.correctAnswer === index ? 'filled' : 'outlined'}
            />
          </Box>
        ))}
        
        <Button
          startIcon={<AddIcon />}
          onClick={addOption}
          disabled={question.options.length >= 6}
          sx={{ mt: 1 }}
        >
          Add Option
        </Button>
        
        <Button
          type="submit"
          variant="contained"
          fullWidth
          sx={{ mt: 3 }}
        >
          Save Question
        </Button>
      </form>
    </Box>
  );
};

export default QuestionForm;