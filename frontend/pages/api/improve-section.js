import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { section_type, content, instruction, resumeContext } = req.body;

  // If no API key, return a mock response so the UI still works
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is missing. Returning simulated AI response.");
    await new Promise(r => setTimeout(r, 1500)); // Simulate delay
    
    let improved = content;
    if (section_type === 'summary' || !content) {
      improved = "Results-driven professional with a proven track record of driving success through strategic problem-solving. " + (content || "Eager to leverage my skills in a challenging new role.");
    } else if (section_type === 'experience_bullet' || instruction?.includes('bullet')) {
      improved = "Spearheaded key initiatives resulting in a 20% increase in efficiency, while optimizing workflows for " + (content || "the team.");
    } else {
      improved = "Optimized: " + content;
    }
    
    return res.status(200).json({ 
      status: 'success', 
      improved,
      warning: "Add GEMINI_API_KEY to .env.local for real AI generation."
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = `You are an expert resume writer. Improve the following ${section_type || 'text'} for a resume. Make it professional, action-oriented, and impactful.\n\n`;
    if (instruction) prompt += `Instructions: ${instruction}\n\n`;
    prompt += `Original text:\n"${content}"\n\n`;
    prompt += `Provide ONLY the improved text, without any conversational filler or quotes around it.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const improvedText = response.text().trim().replace(/^["']|["']$/g, '');

    res.status(200).json({ status: 'success', improved: improvedText });
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ status: 'error', error: error.message });
  }
}
