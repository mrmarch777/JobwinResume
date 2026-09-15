/**
 * /api/search-jobs — Next.js serverless API for job search
 * 
 * Calls SerpAPI (Google Jobs) DIRECTLY from Vercel, bypassing the
 * Render backend entirely. This eliminates cold-start delays.
 * 
 * AI summaries are fetched from the Render backend lazily (optional).
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { role, city, num_results = '20' } = req.query;

  if (!role || !city) {
    return res.status(400).json({ error: 'role and city are required' });
  }

  const SERP_API_KEY = process.env.SERP_API_KEY;
  if (!SERP_API_KEY) {
    // Fall back to Render backend if no SerpAPI key configured
    return fallbackToRender(req, res, role, city, num_results);
  }

  const limit = Math.min(parseInt(num_results) || 20, 50);
  const primaryCity = city.split(',')[0].trim();
  const query = `${role} jobs`;

  try {
    const allJobs = [];
    const seen = new Set();
    let nextPageToken = null;
    let page = 0;
    const maxPages = Math.ceil(limit / 10);

    while (allJobs.length < limit && page < maxPages) {
      const params = new URLSearchParams({
        engine: 'google_jobs',
        q: query,
        location: `${primaryCity}, India`,
        api_key: SERP_API_KEY,
        num: '10',
        hl: 'en',
        gl: 'in',
      });

      if (nextPageToken) {
        params.set('next_page_token', nextPageToken);
      }

      const serpRes = await fetch(`https://serpapi.com/search?${params.toString()}`);
      const data = await serpRes.json();

      if (data.error) {
        console.error('SerpAPI error:', data.error);
        break;
      }

      const rawJobs = data.jobs_results || [];
      if (rawJobs.length === 0) break;

      for (const job of rawJobs) {
        const key = `${job.title || ''}_${job.company_name || ''}`;
        if (seen.has(key)) continue;
        seen.add(key);

        const extensions = job.detected_extensions || {};
        const description = job.description || '';

        // Extract key skills from description using simple keyword matching
        const skillKeywords = [
          'Python', 'SQL', 'Excel', 'Power BI', 'Tableau', 'R', 'SAS', 'SPSS',
          'JavaScript', 'React', 'Node.js', 'AWS', 'Azure', 'GCP', 'Docker',
          'Kubernetes', 'Java', 'C++', 'C#', '.NET', 'Spring', 'Django', 'Flask',
          'Machine Learning', 'Deep Learning', 'NLP', 'Data Science', 'ETL',
          'Hadoop', 'Spark', 'Kafka', 'MongoDB', 'PostgreSQL', 'MySQL', 'Oracle',
          'Salesforce', 'SAP', 'Jira', 'Git', 'Agile', 'Scrum', 'DevOps',
          'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Matplotlib', 'Scikit-learn',
          'TypeScript', 'Angular', 'Vue', 'Next.js', 'GraphQL', 'REST API',
          'HTML', 'CSS', 'Figma', 'Sketch', 'Adobe', 'Photoshop', 'Illustrator',
          'Communication', 'Leadership', 'Management', 'Problem-solving',
          'Financial Analysis', 'Accounting', 'Tally', 'QuickBooks',
        ];

        const foundSkills = skillKeywords
          .filter(s => description.toLowerCase().includes(s.toLowerCase()))
          .slice(0, 8);

        // Generate a quick summary (first 2 sentences of description)
        const sentences = description.split(/[.!]\s+/).filter(s => s.length > 20);
        const quickSummary = sentences.slice(0, 2).join('. ').slice(0, 200);

        // Extract experience requirement
        const expMatch = description.match(/(\d+)\s*[-–+]\s*(\d+)\s*(?:years?|yrs?)/i)
          || description.match(/(\d+)\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)/i);
        const experienceNeeded = expMatch ? expMatch[0] : '';

        allJobs.push({
          title: job.title || 'Unknown Title',
          company: job.company_name || 'Unknown Company',
          location: job.location || primaryCity,
          description: description,
          date_posted: extensions.posted_at || 'Recently',
          salary: extensions.salary || 'Not specified',
          job_type: extensions.schedule_type || 'Full-time',
          apply_link: job.share_link || '',
          source: 'Google Jobs',
          // AI-lite enrichment (no Claude needed)
          ai_summary: quickSummary ? `${quickSummary}.` : '',
          key_skills: foundSkills.join(', ') || 'Not specified',
          experience_needed: experienceNeeded || 'Not specified',
        });

        if (allJobs.length >= limit) break;
      }

      nextPageToken = data.serpapi_pagination?.next_page_token;
      if (!nextPageToken) break;
      page++;
    }

    return res.status(200).json({
      count: allJobs.length,
      role,
      city,
      jobs: allJobs,
      source: 'direct_serpapi',
    });

  } catch (err) {
    console.error('Job search error:', err);
    // Fall back to Render backend
    return fallbackToRender(req, res, role, city, num_results);
  }
}

/**
 * Fallback: try the Render backend if SerpAPI direct call fails
 */
async function fallbackToRender(req, res, role, city, numResults) {
  const RENDER_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jobwinresume-api-cytz.onrender.com';

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000); // 45s timeout

    const response = await fetch(
      `${RENDER_URL}/jobs?role=${encodeURIComponent(role)}&city=${encodeURIComponent(city)}&num_results=${numResults}&plan=premium`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    const data = await response.json();
    return res.status(200).json({ ...data, source: 'render_backend' });
  } catch (err) {
    console.error('Render fallback failed:', err.message);
    return res.status(503).json({
      error: 'Job search service is temporarily unavailable. Please try again in a few seconds.',
      count: 0,
      jobs: [],
    });
  }
}

// Vercel serverless config — allow longer execution for job search
export const config = {
  maxDuration: 30, // seconds
};
