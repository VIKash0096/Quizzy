import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip
} from '@mui/material';

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [topicFilter, setTopicFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');

  useEffect(() => {
    // In a real app, this would fetch questions from the backend
    const mockQuestions = [
      {
        id: 1,
        question: "What is the capital of France?",
        options: ["London", "Paris", "Berlin", "Madrid"],
        correctAnswer: 1,
        topic: "geography",
        difficulty: "easy"
      },
      // Add more mock questions or import from your JSON file
    ];
    setQuestions(mockQuestions);
    setFilteredQuestions(mockQuestions);
  }, []);

  useEffect(() => {
    let results = questions;
    
    if (searchTerm) {
      results = results.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (topicFilter !== 'all') {
      results = results.filter(q => q.topic === topicFilter);
    }
    
    if (difficultyFilter !== 'all') {
      results = results.filter(q => q.difficulty === difficultyFilter);
    }
    
    setFilteredQuestions(results);
  }, [searchTerm, topicFilter, difficultyFilter, questions]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'easy': return 'success';
      case 'medium': return 'warning';
      case 'hard': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Question Bank
      </Typography>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Search Questions"
          variant="outlined"
          fullWidth
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Topic</InputLabel>
          <Select
            value={topicFilter}
            onChange={(e) => setTopicFilter(e.target.value)}
            label="Topic"
          >
            <MenuItem value="all">All Topics</MenuItem>
            <MenuItem value="geography">Geography</MenuItem>
            <MenuItem value="history">History</MenuItem>
            <MenuItem value="science">Science</MenuItem>
            <MenuItem value="art">Art</MenuItem>
            <MenuItem value="literature">Literature</MenuItem>
            <MenuItem value="sports">Sports</MenuItem>
          </Select>
        </FormControl>
        
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>Difficulty</InputLabel>
          <Select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            label="Difficulty"
          >
            <MenuItem value="all">All Levels</MenuItem>
            <MenuItem value="easy">Easy</MenuItem>
            <MenuItem value="medium">Medium</MenuItem>
            <MenuItem value="hard">Hard</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Question</TableCell>
              <TableCell>Topic</TableCell>
              <TableCell>Difficulty</TableCell>
              <TableCell>Correct Answer</TableCell>
              <TableCell>Options</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredQuestions.map((q) => (
              <TableRow key={q.id}>
                <TableCell>{q.question}</TableCell>
                <TableCell>{q.topic}</TableCell>
                <TableCell>
                  <Chip 
                    label={q.difficulty} 
                    color={getDifficultyColor(q.difficulty)} 
                    size="small" 
                  />
                </TableCell>
                <TableCell>{q.options[q.correctAnswer]}</TableCell>
                <TableCell>
                  {q.options.join(', ')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {filteredQuestions.length === 0 && (
        <Typography sx={{ mt: 2 }}>No questions found matching your criteria.</Typography>
      )}
    </Box>
  );
};

export default QuestionList;