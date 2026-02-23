import { GoogleGenerativeAI } from '@google/generative-ai';
import axios from 'axios';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { topic, difficulty } = req.body;

  try {
    // 1. Get Wikipedia content
    const wikiContent = await getWikipediaContent(topic);
    
    // 2. Generate prompt for Gemini
    const prompt = generatePrompt(wikiContent, topic, difficulty);
    
    // 3. Call Gemini API
    const questions = await generateQuestionsWithGemini(prompt);
    
    // 4. Format response
    const formattedQuestions = formatQuestions(questions, topic, difficulty);
    
    res.status(200).json({ questions: formattedQuestions });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error generating questions', error: error.message });
  }
}

async function getWikipediaContent(topic) {
  const endpoint = "https://en.wikipedia.org/w/api.php";
  const params = {
    action: "query",
    format: "json",
    prop: "extracts",
    exintro: true,
    explaintext: true,
    titles: topic
  };

  try {
    const response = await axios.get(endpoint, { params });
    const pages = response.data.query.pages;
    for (const pageId in pages) {
      return pages[pageId].extract || "No extract found for this topic.";
    }
    return "No extract found for this topic.";
  } catch (error) {
    console.error('Wikipedia error:', error);
    return "No extract found for this topic.";
  }
}

function generatePrompt(content, topic, difficulty) {
  if (content.includes('No extract found')) {
    return `Generate 20 ${difficulty} difficulty multiple-choice questions about ${topic}. 
    Format each question as a tuple: (question, [option1, option2, option3, option4], correctIndex).
    Return only a JavaScript-style array of these tuples.`;
  } else {
    return `Based on this text: ${content}\n\nGenerate 20 ${difficulty} difficulty multiple-choice questions. 
    Format each question as a tuple: (question, [option1, option2, option3, option4], correctIndex).
    Return only a JavaScript-style array of these tuples.`;
  }
}

async function generateQuestionsWithGemini(prompt) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  
  // Safely parse the response
  try {
    const cleanText = text.replace(/[^\x00-\x7F]+/g, '');
    const wrappedText = `[${cleanText}]`;
    return JSON.parse(wrappedText);
  } catch (e) {
    console.error('Parsing error:', e);
    throw new Error('Failed to parse questions');
  }
}

function formatQuestions(rawQuestions, topic, difficulty) {
  return rawQuestions.map(([question, options, correctIndex], idx) => ({
    id: idx + 1,
    question,
    options,
    correctAnswer: correctIndex,
    topic: topic.toLowerCase(),
    difficulty
  }));
}