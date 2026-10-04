import { GoogleGenerativeAI } from '@google/generative-ai';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false,
  },
};

function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ maxFileSize: 50 * 1024 * 1024 });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

// Try models in order — fallback if one is overloaded (503)
const MODELS_TO_TRY = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];

async function generateWithFallback(genAI, prompt, inlineData) {
  let lastError;
  for (const modelName of MODELS_TO_TRY) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const parts = inlineData
        ? [{ text: prompt }, { inlineData }]
        : [{ text: prompt }];
      const result = await model.generateContent(parts);
      const response = await result.response;
      return response.text().trim();
    } catch (err) {
      lastError = err;
      const status = err?.status || err?.response?.status;
      // Only retry on 503 (overloaded) or 429 (rate limit)
      if (status !== 503 && status !== 429) throw err;
      console.warn(`Model ${modelName} unavailable (${status}), trying next...`);
    }
  }
  throw lastError;
}

const PARSE_PROMPT = `You are an expert resume parser. Analyze the uploaded resume document and extract ALL information into a structured JSON object.

IMPORTANT: Extract EVERYTHING from the document. Do not skip any sections. Be thorough.

Output ONLY valid JSON with this exact schema (no markdown, no explanation):
{
  "name": "Full Name",
  "email": "Email address",
  "phone": "Phone number",
  "title": "Current or target job title",
  "location": "City, State or Country",
  "linkedin": "LinkedIn URL if present",
  "summary": "Professional summary paragraph",
  "experience": [
    {
      "role": "Job Title",
      "company": "Company Name",
      "location": "Job Location",
      "from": "Start date as text e.g. Mar 2021",
      "to": "End date as text or Present",
      "current": false,
      "bullets": ["Responsibility/achievement 1", "Responsibility/achievement 2"]
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "institution": "University/School name",
      "field": "Field of Study",
      "from": "Start date",
      "to": "End date",
      "grade": "GPA or percentage"
    }
  ],
  "skills": ["Skill 1", "Skill 2"],
  "projects": [
    {
      "title": "Project Name",
      "subtitle": "Technologies used",
      "url": "URL if any",
      "description": "Project description"
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
      "title": "Achievement",
      "description": "Details",
      "date": "Date"
    }
  ]
}`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', error: 'Method not allowed' });
  }

  let filePath = null;
  try {
    const { fields, files } = await parseForm(req);

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    if (!file) {
      return res.status(400).json({ status: 'error', error: 'No file uploaded' });
    }

    filePath = file.filepath || file.path;
    const mimeType = file.mimetype || 'application/pdf';

    const fileBuffer = fs.readFileSync(filePath);
    const base64Data = fileBuffer.toString('base64');

    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        status: 'error',
        error: 'GEMINI_API_KEY is required. Add it in your Vercel Environment Variables.',
      });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const text = await generateWithFallback(genAI, PARSE_PROMPT, { mimeType, data: base64Data });

    // Extract JSON from possible markdown wrapping
    let jsonStr = text;
    if (text.includes('```json')) {
      jsonStr = text.split('```json')[1].split('```')[0].trim();
    } else if (text.includes('```')) {
      jsonStr = text.split('```')[1].split('```')[0].trim();
    }

    const parsedData = JSON.parse(jsonStr);
    res.status(200).json({ status: 'success', data: parsedData });

  } catch (error) {
    console.error('Upload parse error:', error);
    const isOverloaded = error?.status === 503 || (error?.message || '').includes('503');
    res.status(isOverloaded ? 503 : 500).json({
      status: 'error',
      error: isOverloaded
        ? 'AI service is temporarily overloaded. Please wait 30 seconds and try again.'
        : (error.message || 'Failed to parse resume'),
    });
  } finally {
    if (filePath) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
  }
}
