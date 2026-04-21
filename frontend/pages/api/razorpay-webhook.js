import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Ensure Next.js doesn't parse the body so we can verify the exact Razorpay signature
export const config = {
  api: { bodyParser: false },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Read the raw body as a string
    const buf = [];
    for await (const chunk of req) buf.push(chunk);
    const bodyText = Buffer.concat(buf).toString('utf8');

    // 2. Verify Razorpay Signature
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!secret) return res.status(500).json({ error: 'Webhook secret not configured' });

    const signature = req.headers['x-razorpay-signature'];
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(bodyText)
      .digest('hex');

    if (expectedSignature !== signature) {
      console.error("Invalid Razorpay webhook signature");
      return res.status(400).json({ error: 'Invalid Signature' });
    }

    // 3. Process the Event
    const data = JSON.parse(bodyText);

    if (data.event === 'payment.captured') {
      const payment = data.payload.payment.entity;
      
      // We assume `notes` contains the email and plan id (passed from pricing.js)
      const { email, plan } = payment.notes || {};
      
      // Fallback to the buyer's email if not in notes
      const userEmail = email || payment.email;

      if (userEmail && plan) {
        // Use the Supabase Service Role Key to completely bypass RLS
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
          console.error("Missing Supabase admin variables in environment");
          return res.status(500).json({ error: 'Missing admin configuration' });
        }

        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        const updateData = {
          plan: plan,
          payment_id: payment.id,
          amount: payment.amount / 100, // Amount is in paise
          activated_at: new Date().toISOString(),
        };

        const check = await supabaseAdmin.from('user_plans').select('email').eq('email', userEmail).maybeSingle();
        if (check.data) {
          await supabaseAdmin.from('user_plans').update(updateData).eq('email', userEmail);
        } else {
          await supabaseAdmin.from('user_plans').insert({ email: userEmail, ...updateData });
        }
        console.log(`Successfully upgraded ${userEmail} to plan ${plan} via webhook!`);
      } else {
         console.warn("Payment captured but missing email or plan in metadata notes.");
      }
    }

    res.status(200).json({ status: 'ok' });

  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}
