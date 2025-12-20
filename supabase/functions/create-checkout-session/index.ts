import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
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

    const DODO_API_KEY = Deno.env.get('DODO_PAYMENTS_API_KEY');
    const DODO_PRODUCT_ID = Deno.env.get('DODO_PAYMENTS_PRODUCT_ID');
    
    if (!DODO_API_KEY || !DODO_PRODUCT_ID) {
      throw new Error('Dodo Payments configuration missing');
    }

    const origin = req.headers.get('origin') || 'https://ubzyrkefjqmycjrkpueu.lovableproject.com';

    // Create checkout session using Dodo Payments API
    const response = await fetch('https://api.dodopayments.com/checkout_sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${DODO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        billing: {
          city: '',
          country: 'IN',
          state: '',
          street: '',
          zipcode: '',
        },
        customer: {
          email: user.email,
          name: user.email?.split('@')[0] || 'Customer',
        },
        product_cart: [{
          product_id: DODO_PRODUCT_ID,
          quantity: 1,
        }],
        payment_link: true,
        return_url: `${origin}/dashboard?checkout=success`,
        metadata: {
          user_id: user.id,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dodo API error:', errorText);
      throw new Error(`Dodo API error: ${response.status}`);
    }

    const checkoutData = await response.json();
    console.log('Checkout session created:', checkoutData.session_id);

    return new Response(JSON.stringify({ 
      checkout_url: checkoutData.url,
      session_id: checkoutData.session_id,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});