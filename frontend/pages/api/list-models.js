// Temporary debug endpoint — lists all available Gemini models
export default async function handler(req, res) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'No GEMINI_API_KEY set' });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`
    );
    const data = await response.json();
    const names = (data.models || [])
      .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
      .map(m => m.name);
    res.status(200).json({ available_models: names });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
