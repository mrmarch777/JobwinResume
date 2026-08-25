// Debug endpoint — checks saved resumes for current user
import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Supabase env vars missing' });
  }

  // Get auth token from request header
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'No auth header. Must pass Authorization: Bearer <access_token>' });
  }

  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(supabaseUrl, supabaseKey, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid token', detail: userError?.message });
    }

    const { data, error } = await supabase
      .from('resumes')
      .select('id, title, template, updated_at, user_id')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    res.status(200).json({ 
      user_id: user.id, 
      email: user.email,
      resume_count: data?.length || 0,
      resumes: data || [],
      error: error?.message 
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
