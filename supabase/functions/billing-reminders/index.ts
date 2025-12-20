import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting billing reminders check...");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get date 3 days from now
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);
    const targetDate = threeDaysFromNow.toISOString().split("T")[0];

    console.log(`Looking for subscriptions due on: ${targetDate}`);

    // Get all active subscriptions due in 3 days
    const { data: subscriptions, error: subError } = await supabase
      .from("subscriptions")
      .select("*, profiles!inner(email, user_id)")
      .eq("is_active", true)
      .eq("next_billing_date", targetDate);

    if (subError) {
      console.error("Error fetching subscriptions:", subError);
      throw subError;
    }

    console.log(`Found ${subscriptions?.length || 0} subscriptions due in 3 days`);

    if (!subscriptions || subscriptions.length === 0) {
      return new Response(
        JSON.stringify({ message: "No reminders to send", count: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Group subscriptions by user email
    const userSubscriptions = new Map<string, { email: string; subs: typeof subscriptions }>();

    for (const sub of subscriptions) {
      const email = (sub as any).profiles?.email;
      if (!email) {
        console.log(`No email found for subscription ${sub.id}, skipping`);
        continue;
      }

      if (!userSubscriptions.has(email)) {
        userSubscriptions.set(email, { email, subs: [] });
      }
      userSubscriptions.get(email)!.subs.push(sub);
    }

    let sentCount = 0;
    const errors: string[] = [];

    // Send email to each user
    for (const [email, { subs }] of userSubscriptions) {
      const totalAmount = subs.reduce((sum, sub) => sum + Number(sub.amount), 0);
      
      const subscriptionList = subs
        .map((sub) => `• ${sub.service_name}: $${Number(sub.amount).toFixed(2)}`)
        .join("\n");

      const htmlSubscriptionList = subs
        .map((sub) => `<li><strong>${sub.service_name}</strong>: $${Number(sub.amount).toFixed(2)}</li>`)
        .join("");

      try {
        const { error: emailError } = await resend.emails.send({
          from: "SubSage <reminders@resend.dev>",
          to: [email],
          subject: `💰 Billing Reminder: $${totalAmount.toFixed(2)} due in 3 days`,
          html: `
            <!DOCTYPE html>
            <html>
            <head>
              <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
                .content { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
                .amount { font-size: 36px; font-weight: bold; margin: 10px 0; }
                ul { background: white; padding: 20px 20px 20px 40px; border-radius: 8px; margin: 20px 0; }
                li { margin: 10px 0; }
                .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 14px; }
                .button { display: inline-block; background: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1 style="margin: 0;">⏰ Billing Reminder</h1>
                  <div class="amount">$${totalAmount.toFixed(2)}</div>
                  <p style="margin: 0; opacity: 0.9;">due in 3 days</p>
                </div>
                <div class="content">
                  <p>Hi there,</p>
                  <p>This is a friendly reminder that you have ${subs.length} subscription${subs.length > 1 ? 's' : ''} billing soon:</p>
                  <ul>
                    ${htmlSubscriptionList}
                  </ul>
                  <p>Make sure you have sufficient funds available to avoid any service interruptions.</p>
                  <div class="footer">
                    <p>Sent with ❤️ by SubSage</p>
                    <p style="font-size: 12px; color: #9ca3af;">You're receiving this because you have active subscriptions tracked in SubSage.</p>
                  </div>
                </div>
              </div>
            </body>
            </html>
          `,
        });

        if (emailError) {
          console.error(`Error sending email to ${email}:`, emailError);
          errors.push(`${email}: ${emailError.message}`);
        } else {
          console.log(`Successfully sent reminder to ${email} for ${subs.length} subscription(s)`);
          sentCount++;
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        console.error(`Exception sending email to ${email}:`, errorMessage);
        errors.push(`${email}: ${errorMessage}`);
      }
    }

    console.log(`Billing reminders complete. Sent: ${sentCount}, Errors: ${errors.length}`);

    return new Response(
      JSON.stringify({
        message: "Billing reminders processed",
        sent: sentCount,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error in billing-reminders function:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
