import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { jobTitle, company, jd, yourName, tone } = req.body;
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  
  const prompt = `Write a ${tone || 'professional'} cover letter for ${yourName} applying for ${jobTitle} at ${company}. Job description: ${jd}. Format: 3-4 paragraphs, no placeholders, ready to send.`;
  
  try {
    const result = await model.generateContent(prompt);
    res.json({ coverLetter: result.response.text() });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate" });
  }
}
