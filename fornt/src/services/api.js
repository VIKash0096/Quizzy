const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.REACT_APP_API_URL;

export async function generateMCQs(prompt, count = 10) {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-mcqs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, count }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.details || 'Failed to generate MCQs');
    }

    const data = await response.json();
    
    if (!Array.isArray(data.mcqs)) {
      throw new Error('Invalid response format: expected array of questions');
    }
    
    return data.mcqs;
  } catch (error) {
    console.error('API Error:', error);
    throw new Error(`MCQ Generation Error: ${error.message}`);
  }
}
