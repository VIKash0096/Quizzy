import React, { useState } from 'react';
import {
  Box, Paper, Typography, Divider, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TableFooter, Chip, IconButton,
  Tooltip, Pagination, useMediaQuery, Menu, MenuItem
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import QuizIcon from '@mui/icons-material/Quiz';
import AssessmentIcon from '@mui/icons-material/Assessment';
import MoreVertIcon from '@mui/icons-material/MoreVert';

const QuizHistoryTable = ({
  currentResults,
  startIndex,
  endIndex,
  totalResults,
  currentPage,
  totalPages,
  isMobile,
  theme,
  onViewResult,
  onDeleteResult,
  onPageChange
}) => {
  const isXsScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);

  const isMockQuiz = (quizName) => {
    return quizName && quizName.toLowerCase().includes('mock quiz');
  };

  // Mobile menu handlers
  const handleMenuOpen = (event, result) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedResult(result);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedResult(null);
  };

  const handleView = () => {
    if (selectedResult) {
      onViewResult(selectedResult);
      handleMenuClose();
    }
  };

  const handleDelete = () => {
    if (selectedResult) {
      onDeleteResult(selectedResult._id);
      handleMenuClose();
    }
  };

  return (
    <Paper sx={{
      borderRadius: 4,
      overflow: 'hidden',
      border: `2px solid ${theme.palette.divider}`,
      background: `linear-gradient(135deg, ${theme.palette.background.paper} 0%, ${theme.palette.action.hover} 100%)`,
      maxWidth: 1200,
      mx: { xs: 0, md: 'auto' },
      width: '100%'
    }}>
      <Box sx={{ p: { xs: 1.5, sm: 2, md: 4 }, pb: { xs: 1, sm: 2 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.1rem', sm: '1.3rem', md: '2rem' },
            display: 'flex',
            alignItems: 'center',
            color: 'text.primary',
            justifyContent: 'center'
          }}
        >
          <AssessmentIcon sx={{ mr: { xs: 1, md: 2 }, fontSize: { xs: 20, sm: 24, md: 32 } }} />
          Quiz History
        </Typography>
        <Typography 
          variant="body1" 
          color="text.secondary" 
          sx={{ 
            mt: { xs: 0.5, md: 1 }, 
            textAlign: 'center', 
            fontSize: { xs: '0.75rem', sm: '0.9rem', md: '1rem' },
            display: { xs: 'none', sm: 'block' }
          }}
        >
          Your complete quiz history with detailed performance records
        </Typography>
        
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: { xs: 1.5, md: 3 },
          mb: { xs: 1, md: 2 },
          flexWrap: 'wrap',
          gap: 1
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>
            {isXsScreen ? `${startIndex + 1}-${Math.min(endIndex, totalResults)} of ${totalResults}` : 
             `Showing ${startIndex + 1}-${Math.min(endIndex, totalResults)} of ${totalResults} results`}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', md: '0.875rem' } }}>
            Page {currentPage}/{totalPages}
          </Typography>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Updated table without vertical scroll for PC */}
      <Box sx={{ width: '100%' }}>
        <TableContainer sx={{ 
          // Remove maxHeight for PC to disable vertical scroll
          maxHeight: isSmallScreen ? 400 : 'none' 
        }}>
          <Table size={isXsScreen ? "small" : "medium"} sx={{ tableLayout: 'fixed', width: '100%' }}>
            <TableHead>
              <TableRow>
                <TableCell sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.95rem' },
                  py: { xs: 1, md: 2.5 },
                  px: { xs: 0.5, sm: 1, md: 2 },
                  backgroundColor: theme.palette.action.hover,
                  width: { xs: '8%', sm: '10%' }
                }}>
                  #
                </TableCell>
                <TableCell sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.95rem' },
                  backgroundColor: theme.palette.action.hover,
                  px: { xs: 0.5, sm: 1, md: 2 },
                  width: { xs: '35%', sm: '35%', md: '30%' }
                }}>
                  Quiz
                </TableCell>
                {!isSmallScreen && (
                  <TableCell sx={{
                    fontWeight: 700,
                    color: 'text.primary',
                    fontSize: '0.95rem',
                    backgroundColor: theme.palette.action.hover,
                    width: '15%'
                  }}>
                    Type
                  </TableCell>
                )}
                <TableCell sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.95rem' },
                  backgroundColor: theme.palette.action.hover,
                  px: { xs: 0.5, sm: 1, md: 2 },
                  width: { xs: '18%', sm: '15%' }
                }}>
                  Score
                </TableCell>
                <TableCell sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.95rem' },
                  backgroundColor: theme.palette.action.hover,
                  px: { xs: 0.5, sm: 1, md: 2 },
                  width: { xs: '18%', sm: '20%' }
                }}>
                  Date
                </TableCell>
                {/* Actions column always visible now */}
                <TableCell sx={{
                  fontWeight: 700,
                  color: 'text.primary',
                  fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.95rem' },
                  backgroundColor: theme.palette.action.hover,
                  px: { xs: 0.5, sm: 1, md: 2 },
                  width: { xs: '21%', sm: '20%', md: '15%' },
                  textAlign: 'center'
                }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentResults.map((result, index) => {
                const scorePercent = Math.round((result.score / result.total) * 100);
                const isAccepted = scorePercent >= 70;
                const globalIndex = startIndex + index + 1;
                const isMock = isMockQuiz(result.quizName);
                
                return (
                  <TableRow
                    key={result._id || `${result.quizName}_${result.date}_${index}`}
                    sx={{
                      '&:hover': { backgroundColor: 'action.hover' },
                      transition: 'background-color 0.3s ease-in-out'
                    }}
                  >
                    {/* Index */}
                    <TableCell sx={{ 
                      px: { xs: 0.5, sm: 1, md: 2 }, 
                      py: { xs: 1, md: 1.5 },
                      fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.9rem' }
                    }}>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: 'text.secondary',
                          fontSize: 'inherit'
                        }}
                      >
                        {globalIndex}
                      </Typography>
                    </TableCell>

                    {/* Quiz Name and Topic */}
                    <TableCell sx={{ 
                      px: { xs: 0.5, sm: 1, md: 2 }, 
                      py: { xs: 1, md: 1.5 },
                      fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.9rem' }
                    }}>
                      <Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 600,
                            mb: { xs: 0.2, md: 0.5 },
                            fontSize: 'inherit',
                            lineHeight: 1.2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: isXsScreen ? 'nowrap' : 'normal'
                          }}
                        >
                          {result.quizName}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', flexWrap: 'wrap' }}>
                          {isSmallScreen && (
                            <Chip
                              icon={isMock ? <SmartToyIcon sx={{ fontSize: '10px !important' }} /> : <QuizIcon sx={{ fontSize: '10px !important' }} />}
                              label={isMock ? "Mock" : "Quiz"}
                              size="small"
                              color={isMock ? "warning" : "primary"}
                              sx={{
                                fontSize: { xs: '0.5rem', sm: '0.6rem' },
                                height: { xs: 14, sm: 18 },
                                '& .MuiChip-label': { px: 0.5 }
                              }}
                            />
                          )}
                          <Chip
                            label={result.topic}
                            size="small"
                            variant="outlined"
                            sx={{
                              fontSize: { xs: '0.5rem', sm: '0.6rem', md: '0.75rem' },
                              height: { xs: 14, sm: 18, md: 24 },
                              '& .MuiChip-label': { px: { xs: 0.5, md: 1 } }
                            }}
                          />
                        </Box>
                      </Box>
                    </TableCell>

                    {/* Type - Hidden on small screens */}
                    {!isSmallScreen && (
                      <TableCell sx={{ py: 1.5 }}>
                        <Chip
                          icon={isMock ? <SmartToyIcon fontSize="small" /> : <QuizIcon fontSize="small" />}
                          label={isMock ? "Mock" : "Quiz"}
                          size="small"
                          color={isMock ? "warning" : "primary"}
                          sx={{ fontSize: '0.75rem' }}
                        />
                      </TableCell>
                    )}

                    {/* Score */}
                    <TableCell sx={{ 
                      px: { xs: 0.5, sm: 1, md: 2 }, 
                      py: { xs: 1, md: 1.5 } 
                    }}>
                      <Chip
                        label={`${scorePercent}%`}
                        size="small"
                        color={isAccepted ? "success" : scorePercent >= 40 ? "warning" : "error"}
                        sx={{
                          fontWeight: 700,
                          fontSize: { xs: '0.55rem', sm: '0.6rem', md: '0.75rem' },
                          height: { xs: 16, sm: 20, md: 24 },
                          '& .MuiChip-label': { px: { xs: 0.5, md: 1 } }
                        }}
                      />
                    </TableCell>

                    {/* Date */}
                    <TableCell sx={{ 
                      px: { xs: 0.5, sm: 1, md: 2 }, 
                      py: { xs: 1, md: 1.5 } 
                    }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ 
                          fontSize: { xs: '0.6rem', sm: '0.75rem', md: '0.9rem' },
                          lineHeight: 1.2
                        }}
                      >
                        {new Date(result.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: isXsScreen ? '2-digit' : 'numeric'
                        })}
                      </Typography>
                    </TableCell>

                    {/* Actions - Now visible on all screens */}
                    <TableCell sx={{ 
                      py: 1.5, 
                      px: { xs: 0.5, sm: 1, md: 2 },
                      textAlign: 'center'
                    }}>
                      {isXsScreen ? (
                        /* Mobile: Menu Button */
                        <>
                          <IconButton
                            size="small"
                            onClick={(e) => handleMenuOpen(e, result)}
                            sx={{
                              color: 'primary.main',
                              width: 24,
                              height: 24,
                              '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                            }}
                          >
                            <MoreVertIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        </>
                      ) : (
                        /* Desktop: Individual Buttons */
                        <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                          <Tooltip title="View details" arrow>
                            <IconButton
                              size="small"
                              onClick={() => onViewResult(result)}
                              sx={{
                                color: 'primary.main',
                                width: { sm: 28, md: 32 },
                                height: { sm: 28, md: 32 },
                                '&:hover': { backgroundColor: 'primary.main', color: 'white' }
                              }}
                            >
                              <VisibilityIcon sx={{ fontSize: { sm: 16, md: 18 } }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete result" arrow>
                            <IconButton
                              size="small"
                              onClick={() => onDeleteResult(result._id)}
                              sx={{
                                color: 'error.main',
                                width: { sm: 28, md: 32 },
                                height: { sm: 28, md: 32 },
                                '&:hover': { backgroundColor: 'error.main', color: 'white' }
                              }}
                            >
                              <DeleteIcon sx={{ fontSize: { sm: 16, md: 18 } }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={isSmallScreen ? 5 : 6} sx={{ border: 0, py: 0 }}>
                  <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    py: { xs: 2, md: 3 },
                    borderTop: `1px solid ${theme.palette.divider}`
                  }}>
                    <Pagination
                      count={totalPages}
                      page={currentPage}
                      onChange={onPageChange}
                      color="primary"
                      size={isXsScreen ? "small" : "medium"}
                      showFirstButton={!isXsScreen}
                      showLastButton={!isXsScreen}
                      siblingCount={isXsScreen ? 0 : 1}
                      boundaryCount={isXsScreen ? 1 : 1}
                      sx={{
                        '& .MuiPaginationItem-root': {
                          fontWeight: 600,
                          fontSize: { xs: '0.7rem', sm: '0.875rem' },
                          minWidth: { xs: 24, sm: 32 },
                          height: { xs: 24, sm: 32 }
                        }
                      }}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </TableContainer>
      </Box>

      {/* Mobile Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: 150,
            boxShadow: theme.shadows[8]
          }
        }}
      >
        <MenuItem onClick={handleView} sx={{ py: 1.5 }}>
          <VisibilityIcon sx={{ mr: 2, fontSize: 18, color: 'primary.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            View Details
          </Typography>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDelete} sx={{ py: 1.5 }}>
          <DeleteIcon sx={{ mr: 2, fontSize: 18, color: 'error.main' }} />
          <Typography variant="body2" sx={{ fontWeight: 500, color: 'error.main' }}>
            Delete Result
          </Typography>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

export default QuizHistoryTable;
