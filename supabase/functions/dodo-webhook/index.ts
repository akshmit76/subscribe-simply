import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { Webhook } from "npm:standardwebhooks";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, webhook-id, webhook-signature, webhook-timestamp',
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

    const WEBHOOK_KEY = Deno.env.get('DODO_PAYMENTS_WEBHOOK_KEY');
    
    // Get raw body for signature verification
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    
    console.log('Webhook received:', body.type);

    // Verify webhook signature if key is configured
    if (WEBHOOK_KEY) {
      try {
        const webhookId = req.headers.get('webhook-id');
        const webhookSignature = req.headers.get('webhook-signature');
        const webhookTimestamp = req.headers.get('webhook-timestamp');
        
        if (webhookId && webhookSignature && webhookTimestamp) {
          const wh = new Webhook(WEBHOOK_KEY);
          wh.verify(rawBody, {
            'webhook-id': webhookId,
            'webhook-signature': webhookSignature,
            'webhook-timestamp': webhookTimestamp,
          });
          console.log('Webhook signature verified');
        }
      } catch (verifyError) {
        console.error('Webhook signature verification failed:', verifyError);
        return new Response(JSON.stringify({ error: 'Invalid webhook signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    const eventType = body.type;
    const data = body.data;

    switch (eventType) {
      case 'subscription.active':
      case 'subscription.created': {
        // Extract user_id from metadata
        const userId = data.metadata?.user_id;
        if (!userId) {
          console.error('No user_id in subscription metadata');
          break;
        }

        // Update user profile to pro
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({
            subscription_tier: 'pro',
            dodo_customer_id: data.customer?.customer_id || null,
            dodo_subscription_id: data.subscription_id || null,
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error updating profile:', updateError);
          throw updateError;
        }

        console.log('Profile updated to pro for user:', userId);
        break;
      }

      case 'subscription.cancelled':
      case 'subscription.expired':
      case 'subscription.on_hold': {
        const userId = data.metadata?.user_id;
        if (!userId) {
          console.error('No user_id in subscription metadata');
          break;
        }

        // Downgrade user to free
        const { error: updateError } = await supabaseClient
          .from('profiles')
          .update({
            subscription_tier: 'free',
          })
          .eq('user_id', userId);

        if (updateError) {
          console.error('Error downgrading profile:', updateError);
          throw updateError;
        }

        console.log('Profile downgraded to free for user:', userId);
        break;
      }

      case 'payment.succeeded': {
        console.log('Payment succeeded:', data.payment_id);
        break;
      }

      case 'payment.failed': {
        console.log('Payment failed:', data.payment_id);
        break;
      }

      default:
        console.log('Unhandled event type:', eventType);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Webhook error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
