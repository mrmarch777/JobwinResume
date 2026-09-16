/**
 * /api/search-jobs — Next.js serverless API for job search
 * 
 * Strategy:
 * 1. Call SerpAPI directly from Vercel (fast, no cold start)
 * 2. If that fails, fall back to Render backend
 */

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { role, city, num_results = '20' } = req.query;

  if (!role || !city) {
    return res.status(400).json({ error: 'Please enter a job role and location.' });
  }

  // Try to get API key from environment
  const SERP_API_KEY = process.env.SERP_API_KEY;

  if (!SERP_API_KEY) {
    console.warn('SERP_API_KEY not set — falling back to Render backend');
    return fallbackToRender(res, role, city, num_results);
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
        // If SerpAPI fails, try Render backend
        if (allJobs.length === 0) {
          return fallbackToRender(res, role, city, num_results);
        }
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

        // Extract key skills from description
        const skillKeywords = [
          'Python', 'SQL', 'Excel', 'Power BI', 'Tableau', 'R', 'SAS', 'SPSS',
          'JavaScript', 'React', 'Node.js', 'AWS', 'Azure', 'GCP', 'Docker',
          'Kubernetes', 'Java', 'C++', 'C#', '.NET', 'Spring', 'Django', 'Flask',
          'Machine Learning', 'Deep Learning', 'NLP', 'Data Science', 'ETL',
          'Hadoop', 'Spark', 'Kafka', 'MongoDB', 'PostgreSQL', 'MySQL', 'Oracle',
          'Salesforce', 'SAP', 'Jira', 'Git', 'Agile', 'Scrum', 'DevOps',
          'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'Scikit-learn',
          'TypeScript', 'Angular', 'Vue', 'Next.js', 'GraphQL', 'REST API',
          'HTML', 'CSS', 'Figma', 'Adobe', 'Photoshop',
          'Financial Analysis', 'Accounting', 'Tally',
        ];

        const foundSkills = skillKeywords
          .filter(s => description.toLowerCase().includes(s.toLowerCase()))
          .slice(0, 8);

        // Quick summary from first 2 meaningful sentences
        const sentences = description.split(/[.!]\s+/).filter(s => s.length > 20);
        const quickSummary = sentences.slice(0, 2).join('. ').slice(0, 200);

        // Experience requirement extraction
        const expMatch = description.match(/(\d+)\s*[-–+]\s*(\d+)\s*(?:years?|yrs?)/i)
          || description.match(/(\d+)\s*(?:years?|yrs?)\s*(?:of)?\s*(?:experience|exp)/i);

        allJobs.push({
          title: job.title || 'Unknown Title',
          company: job.company_name || 'Unknown Company',
          location: job.location || primaryCity,
          description,
          date_posted: extensions.posted_at || 'Recently',
          salary: extensions.salary || 'Not specified',
          job_type: extensions.schedule_type || 'Full-time',
          apply_link: job.share_link || '',
          source: 'Google Jobs',
          ai_summary: quickSummary ? `${quickSummary}.` : '',
          key_skills: foundSkills.join(', ') || 'Not specified',
          experience_needed: expMatch ? expMatch[0] : 'Not specified',
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
    console.error('SerpAPI direct call failed:', err.message);
    return fallbackToRender(res, role, city, num_results);
  }
}

/**
 * Fallback: try the Render backend
 */
async function fallbackToRender(res, role, city, numResults) {
  const RENDER_URL = 'https://jobwinresume-api-cytz.onrender.com';

  try {
    const controller = new AbortController();
    // 25s timeout (must be less than Vercel's 30s maxDuration)
    const timeout = setTimeout(() => controller.abort(), 25000);

    const response = await fetch(
      `${RENDER_URL}/jobs?role=${encodeURIComponent(role)}&city=${encodeURIComponent(city)}&num_results=${numResults}&plan=premium`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`Render returned ${response.status}`);
    }

    const data = await response.json();
    return res.status(200).json({ ...data, source: 'render_backend' });
  } catch (err) {
    const msg = err.name === 'AbortError'
      ? 'The search server is starting up (this takes ~30 seconds on first use). Please click "Try Again".'
      : 'Job search service could not be reached. Please try again in a moment.';
    console.error('Render fallback failed:', err.message);
    return res.status(503).json({ error: msg, count: 0, jobs: [] });
  }
}

export const config = {
  maxDuration: 30,
};
