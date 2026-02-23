// import questionsData from '../data/Questions.json';

// // Mock quiz service
// export const getQuestions = async (topic, difficulty) => {
//   // Simulate API call delay
//   await new Promise(resolve => setTimeout(resolve, 500));
  
//   // Filter questions based on parameters
//   let filteredQuestions = [...questionsData.questions];
  
//   if (topic && topic !== 'all') {
//     filteredQuestions = filteredQuestions.filter(q => q.topic === topic);
//   }
  
//   if (difficulty && difficulty !== 'all') {
//     filteredQuestions = filteredQuestions.filter(q => q.difficulty === difficulty);
//   }
  
//   // Return a random set of up to 10 questions
//   return filteredQuestions
//     .sort(() => 0.5 - Math.random())
//     .slice(0, 10);
// };