import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { personal, experience, education, skills } = req.body;
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  // Build prompt to create professional resume JSON
  const prompt = `You are a professional resume writer. Given this information, create a polished resume.
  Personal: ${JSON.stringify(personal)}
  Experience: ${JSON.stringify(experience)}
  Education: ${JSON.stringify(education)}  
  Skills: ${skills}
  
  Return ONLY valid JSON matching this exact structure:
  {
    "personal": { "name": "", "email": "", "phone": "", "location": "", "linkedin": "", "title": "" },
    "summary": "Professional summary in 2-3 sentences",
    "experience": [{ "title": "", "company": "", "startDate": "", "endDate": "", "current": false, "bullets": ["bullet1", "bullet2", "bullet3"] }],
    "education": [{ "institution": "", "degree": "", "field": "", "year": "", "grade": "" }],
    "skills": { "items": [{ "id": "s1", "name": "skill", "level": "Expert" }] }
  }
  Make bullets action-oriented and impactful. Write a strong professional summary.`;
  
  try {
    const result = await model.generateContent(prompt);
    let text = result.response.text().trim();
    // Strip markdown code fences if present
    text = text.replace(/^```json\n?/, '').replace(/```$/, '').trim();
    const resumeData = JSON.parse(text);
    res.json({ resume: resumeData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate resume' });
  }
}
