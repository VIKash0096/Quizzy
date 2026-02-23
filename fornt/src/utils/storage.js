import localforage from 'localforage';

// Configure localforage
localforage.config({
  name: 'quiz-app',
  storeName: 'quiz_results'
});

export const getTestResults = async () => {
  return await localforage.getItem('testResults') || [];
};

export const saveTestResult = async (result) => {
  const results = await getTestResults();
  results.push(result);
  await localforage.setItem('testResults', results);
  return results;
};

export const clearTestResults = async () => {
  await localforage.removeItem('testResults');
};