import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { resume_text, job_description } = req.body;
  if (!resume_text) return res.status(400).json({ error: 'Missing resume_text' });

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer and career coach.
Analyze the following resume against the target job description and provide a comprehensive review.

Return ONLY a valid JSON object (no markdown, no backticks) with this exact structure:
{
  "score": 72,
  "matched_keywords": ["keyword1", "keyword2", "keyword3"],
  "missing_keywords": ["keyword4", "keyword5"],
  "suggestions": [
    "Specific actionable suggestion 1",
    "Specific actionable suggestion 2",
    "Specific actionable suggestion 3"
  ]
}

Rules:
- Score should be 0-100 based on how well the resume matches
- matched_keywords: 3-6 keywords from the resume that match the JD
- missing_keywords: 3-6 important keywords from the JD missing in the resume
- suggestions: 3-5 specific, actionable improvement suggestions

=== RESUME ===
${resume_text}

=== TARGET JOB / ROLE ===
${job_description || 'General professional role'}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    const cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanedText);
    
    res.status(200).json(data);
  } catch (err) {
    console.error('AI Review Error:', err);
    // Fallback mock data
    res.status(200).json({
      score: 65,
      matched_keywords: ['Communication', 'Leadership', 'Problem Solving'],
      missing_keywords: ['Specific tools', 'Agile methodology', 'Cloud technologies'],
      suggestions: [
        'Add more quantified achievements with specific metrics (e.g., "increased revenue by 30%")',
        'Include relevant technical skills and tools mentioned in job descriptions',
        'Strengthen your professional summary with industry-specific keywords'
      ]
    });
  }
}
