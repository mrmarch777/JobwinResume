import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  api: {
    bodyParser: { sizeLimit: '10mb' },
  },
};

// Try models in order — fallback if one is overloaded (503) or rate-limited (429)
const MODELS_TO_TRY = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

async function callWithFallback(genAI, prompt) {
  let lastError;
  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (err) {
      lastError = err;
      const status = err?.status || err?.response?.status;
      if (status !== 503 && status !== 429) throw err;
      console.warn(`Model ${modelName} unavailable (${status}), trying next...`);
    }
  }
  throw lastError;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', error: 'Method not allowed' });
  }

  const { resume_text } = req.body;
  if (!resume_text) {
    return res.status(400).json({ status: 'error', error: 'Missing resume_text' });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY is missing. AI parser disabled.');
    return res.status(503).json({ status: 'error', error: 'AI parsing requires GEMINI_API_KEY in environment variables.' });
  }

  const prompt = `
You are an expert resume parser. Extract the following resume text into a highly structured JSON object.
Do NOT output any markdown, HTML, or conversational text. Output ONLY valid JSON.

Schema requirements:
{
  "name": "Full Name",
  "email": "Email address",
  "phone": "Phone number",
  "title": "Current or target job title",
  "location": "City, State, or Country",
  "linkedin": "LinkedIn URL",
  "summary": "Professional summary paragraph",
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "location": "Job Location",
      "from": "Start date (e.g., Aug 2021 or 2021-08)",
      "to": "End date (or Present)",
      "current": false,
      "bullets": ["Responsibility 1", "Responsibility 2"]
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "institution": "University/School",
      "field": "Field of Study",
      "from": "Start Date",
      "to": "End Date",
      "grade": "GPA or Grade"
    }
  ],
  "skills": ["Skill 1", "Skill 2"],
  "projects": [
    {
      "title": "Project Name",
      "subtitle": "Tech Stack",
      "url": "Project URL",
      "description": "Project Description"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "Date Earned"
    }
  ],
  "languages": [
    {
      "name": "Language",
      "proficiency": "Proficiency Level"
    }
  ],
  "achievements": [
    {
      "title": "Achievement Title",
      "description": "Description",
      "date": "Date"
    }
  ]
}

Resume Text:
"""
${resume_text.substring(0, 20000)}
"""
`;

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const text = await callWithFallback(genAI, prompt);

    // Extract JSON block in case model wrapped it in markdown
    let jsonStr = text;
    if (text.includes('```json')) {
      jsonStr = text.split('```json')[1].split('```')[0].trim();
    } else if (text.includes('```')) {
      jsonStr = text.split('```')[1].split('```')[0].trim();
    }

    const parsedData = JSON.parse(jsonStr);
    res.status(200).json({ status: 'success', data: parsedData });

  } catch (error) {
    console.error('AI Parsing Error:', error);
    const isOverloaded = error?.status === 503 || (error?.message || '').includes('503');
    res.status(isOverloaded ? 503 : 500).json({
      status: 'error',
      error: isOverloaded
        ? 'AI service is temporarily overloaded. Please wait 30 seconds and try again.'
        : (error.message || 'Failed to parse resume'),
    });
  }
}
