import { GoogleGenerativeAI } from '@google/generative-ai';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { section_type, content, instruction, resumeContext } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ status: 'error', error: 'No content provided to improve' });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is missing. Returning contextual mock response.");
    await new Promise(r => setTimeout(r, 800));
    
    // Generate a contextual mock based on the actual content
    let improved = content;
    if (section_type === 'summary') {
      improved = `Dynamic and results-oriented professional with expertise in delivering impactful solutions. ${content.length > 10 ? content : 'Committed to driving business growth through innovative strategies and collaborative leadership.'}`;
    } else if (section_type === 'experience_bullet') {
      // Parse the original content and make it more action-oriented
      const verbs = ['Spearheaded', 'Orchestrated', 'Optimized', 'Engineered', 'Championed', 'Streamlined', 'Revolutionized', 'Accelerated'];
      const verb = verbs[Math.floor(Math.random() * verbs.length)];
      improved = `${verb} ${content.charAt(0).toLowerCase()}${content.slice(1).replace(/^(managed|worked on|did|helped|was responsible for|handled)\s/i, '')}${content.includes('%') || content.includes('$') ? '' : ', resulting in measurable improvements in team productivity and operational efficiency'}`;
    } else {
      improved = content;
    }
    
    return res.status(200).json({ 
      status: 'success', 
      improved,
      warning: "Add GEMINI_API_KEY to your Vercel environment variables for real AI generation."
    });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    let prompt = '';
    if (section_type === 'experience_bullet') {
      prompt = `You are an expert resume writer. Improve this resume bullet point to be more impactful and professional.

Rules:
- Start with a strong action verb
- Add quantifiable metrics if possible (%, $, numbers)
- Keep it concise (1-2 sentences max)
- Make it specific to the work described
- Do NOT make up fake numbers — only add metrics if they naturally fit

Original bullet point:
"${content}"

Provide ONLY the improved bullet point text. No quotes, no explanation.`;
    } else if (section_type === 'summary') {
      prompt = `You are an expert resume writer. Write an improved professional summary based on this:

"${content}"

Rules:
- 2-3 sentences maximum
- Highlight years of experience if mentioned
- Include key strengths and value proposition
- Professional and confident tone

Provide ONLY the improved summary text. No quotes, no explanation.`;
    } else {
      prompt = `Improve this resume text to be more professional and impactful:\n\n"${content}"\n\nProvide ONLY the improved text.`;
    }

    if (instruction) {
      prompt += `\n\nAdditional instruction: ${instruction}`;
    }

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const improvedText = response.text().trim().replace(/^["']|["']$/g, '');

    res.status(200).json({ status: 'success', improved: improvedText });
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ status: 'error', error: error.message });
  }
}
