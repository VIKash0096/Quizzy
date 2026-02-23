import { 
  Box, 
  Typography, 
  Button,
  IconButton
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const QuestionReview = ({ 
  questions, 
  onSave, 
  editMode = false, 
  onEdit, 
  onDelete 
}) => {
  const renderQuestions = () => (
    questions.map((q, i) => (
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
        {editMode && (
          <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
            <IconButton onClick={() => onEdit(i)} color="primary">
              <EditIcon />
            </IconButton>
            <IconButton onClick={() => onDelete(i)} color="error">
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
        
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

  return (
    <Box>
      {questions.length > 0 ? (
        <>
          {renderQuestions()}
          {editMode && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={() => onSave(questions)}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </>
      ) : (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No questions found.
        </Typography>
      )}
    </Box>
  );
};

export default QuestionReview;