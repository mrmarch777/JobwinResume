import { GoogleGenerativeAI } from '@google/generative-ai';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ status: 'error', error: 'Method not allowed' });
  }

  const { resume_text } = req.body;
  if (!resume_text) {
    return res.status(400).json({ status: 'error', error: 'Missing resume_text' });
  }

  // If no API key, return a mock structured response or fail gracefully so it uses client-side regex
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is missing. AI parser disabled, returning error to trigger client fallback.");
    return res.status(503).json({ status: 'error', error: 'AI parsing requires GEMINI_API_KEY in .env.local' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use the pro model for complex structured extraction
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

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
      "current": boolean,
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

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Extract JSON block in case model wrapped it in markdown
    let jsonStr = text;
    if (text.startsWith('```json')) {
      jsonStr = text.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (text.startsWith('```')) {
      jsonStr = text.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const parsedData = JSON.parse(jsonStr);

    res.status(200).json({ status: 'success', data: parsedData });
  } catch (error) {
    console.error("AI Parsing Error:", error);
    res.status(500).json({ status: 'error', error: error.message });
  }
}
