import { useLocation } from 'react-router-dom';
import { Box, Typography, List, ListItem, ListItemText, Divider, Chip, Paper } from '@mui/material';
import { Check, Close } from '@mui/icons-material';

const Results = () => {
  const location = useLocation();
  const { result } = location.state || {};
  const scorePercentage = result ? Math.round((result.score / result.total) * 100) : 0;

  if (!result) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">No results to display</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Quiz Results
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper elevation={3} sx={{ p: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6">Topic: {result.topic}</Typography>
            <Typography variant="body1">Difficulty: {result.difficulty}</Typography>
            <Typography variant="body1">
              Date: {new Date(result.date).toLocaleString()}
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h5">Your Score</Typography>
            <Typography variant="h3" color={scorePercentage >= 70 ? 'success.main' : 'error.main'}>
              {result.score} / {result.total}
            </Typography>
            <Typography variant="body1">
              ({scorePercentage}%)
            </Typography>
          </Box>
        </Paper>
      </Box>

      <Typography variant="h5" gutterBottom>
        Question Breakdown
      </Typography>

      <List sx={{ width: '100%' }}>
        {result.answers.map((answer, index) => (
          <Box key={index}>
            <ListItem alignItems="flex-start">
              <ListItemText
                primary={`Question ${index + 1}: ${answer.question}`}
                secondary={
                  <>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      display="block"
                    >
                      Your answer: {answer.selected}
                    </Typography>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.primary"
                      display="block"
                    >
                      Correct answer: {answer.correct}
                    </Typography>
                  </>
                }
              />
              <Box sx={{ ml: 2 }}>
                {answer.isCorrect ? (
                  <Chip icon={<Check />} label="Correct" color="success" />
                ) : (
                  <Chip icon={<Close />} label="Incorrect" color="error" />
                )}
              </Box>
            </ListItem>
            <Divider component="li" />
          </Box>
        ))}
      </List>
    </Box>
  );
};

export default Results;