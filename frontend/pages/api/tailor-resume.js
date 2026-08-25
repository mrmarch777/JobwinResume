import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  // Run async handler
  handleTailor(req, res).catch(err => {
    console.error('Tailor API Error:', err);
    res.status(500).json({ 
      error: 'Failed to tailor resume',
      suggestions: ['Could not connect to AI service. Please try again.'],
      missing_keywords: []
    });
  });
}

async function handleTailor(req, res) {
  const { resume_data, job_description } = req.body;

  if (!resume_data || !job_description) {
    return res.status(400).json({ error: 'Missing resume data or job description' });
  }

  const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

  const prompt = `
You are an expert resume reviewer and ATS optimization specialist.
I will provide you with a candidate's current resume and a job description they want to apply for.

Your task is to analyze the gap and provide specific, actionable suggestions to tailor the resume to the job description.

Return ONLY a valid JSON object with the following structure. Do not include markdown formatting or backticks.
{
  "missing_keywords": ["keyword1", "keyword2", "keyword3"],
  "suggestions": [
    "Specific suggestion to improve a bullet point in the experience section.",
    "Specific suggestion to tweak the summary.",
    "Specific suggestion to highlight a relevant skill."
  ]
}

Ensure you provide exactly 5-8 missing keywords and 3-5 high-impact suggestions.

=== JOB DESCRIPTION ===
${job_description}

=== CURRENT RESUME ===
${resume_data}
`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
  // Clean up potential markdown formatting from Gemini response
  const cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
  
  const data = JSON.parse(cleanedText);
  
  return res.status(200).json(data);
}
