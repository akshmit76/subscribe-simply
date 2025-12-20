import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the authorization header to identify the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Get user from the token
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    
    if (userError || !user) {
      throw new Error('Invalid user token');
    }

    // Get user's profile to find their customer ID
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('dodo_customer_id')
      .eq('user_id', user.id)
      .single();

    if (profileError || !profile?.dodo_customer_id) {
      throw new Error('No subscription found for this user');
    }

    const DODO_API_KEY = Deno.env.get('DODO_PAYMENTS_API_KEY');
    
    if (!DODO_API_KEY) {
      throw new Error('Dodo Payments configuration missing');
    }

    const origin = req.headers.get('origin') || 'https://ubzyrkefjqmycjrkpueu.lovableproject.com';

    // Create customer portal session
    const response = await fetch(`https://api.dodopayments.com/customers/${profile.dodo_customer_id}/customer_portal`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DODO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        return_url: `${origin}/dashboard`,
        send_email: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dodo API error:', errorText);
      throw new Error(`Dodo API error: ${response.status}`);
    }

    const portalData = await response.json();
    console.log('Customer portal session created');

    return new Response(JSON.stringify({ 
      portal_url: portalData.link,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating customer portal:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});