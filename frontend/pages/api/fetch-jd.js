import { GoogleGenerativeAI } from '@google/generative-ai';
import * as cheerio from 'cheerio';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing url' });

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Remove scripts, styles, and navigation
    $('script, style, nav, footer, header').remove();
    const textContent = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 30000); // limit to 30k chars

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = `
Extract the job title, company, location, and the full job description from the following webpage text.
Return ONLY a valid JSON object with this structure (no markdown):
{
  "title": "Job Title",
  "company": "Company Name",
  "location": "Location",
  "description": "Full job description text..."
}

If you cannot find the information, do your best or return empty strings.

=== WEBPAGE TEXT ===
${textContent}
`;

    const result = await model.generateContent(prompt);
    const cleanedText = result.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanedText);
    
    // Ensure we have an ID for the frontend
    data.id = 'job-' + Date.now();
    data.posted = 'Recently';
    data.snippet = data.description.substring(0, 150) + '...';
    
    res.status(200).json(data);
  } catch (err) {
    console.error('Fetch JD Error:', err);
    res.status(500).json({ error: 'Failed to extract job description. Try pasting the text directly instead.' });
  }
}
