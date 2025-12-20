import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import DodoPayments from "npm:dodopayments";

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
    const DODO_ENVIRONMENT = Deno.env.get('DODO_PAYMENTS_ENVIRONMENT') || 'test_mode';
    
    if (!DODO_API_KEY || !DODO_PRODUCT_ID) {
      throw new Error('Dodo Payments configuration missing');
    }

    const origin = req.headers.get('origin') || 'https://ubzyrkefjqmycjrkpueu.lovableproject.com';

    console.log('Creating Dodo Payments client with environment:', DODO_ENVIRONMENT);

    // Initialize Dodo Payments SDK
    const client = new DodoPayments({
      bearerToken: DODO_API_KEY,
      environment: DODO_ENVIRONMENT as 'test_mode' | 'live_mode',
    });

    // Create checkout session using SDK
    const checkoutSession = await client.checkoutSessions.create({
      product_cart: [{
        product_id: DODO_PRODUCT_ID,
        quantity: 1,
      }],
      customer: {
        email: user.email || '',
        name: user.email?.split('@')[0] || 'Customer',
      },
      return_url: `${origin}/dashboard?checkout=success`,
      metadata: {
        user_id: user.id,
      },
    });

    console.log('Checkout session created:', checkoutSession.session_id);

    return new Response(JSON.stringify({ 
      checkout_url: checkoutSession.checkout_url,
      session_id: checkoutSession.session_id,
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
