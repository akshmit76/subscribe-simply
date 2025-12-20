-- Rename Stripe fields to Dodo Payments fields
ALTER TABLE public.profiles 
  RENAME COLUMN stripe_customer_id TO dodo_customer_id;

ALTER TABLE public.profiles 
  RENAME COLUMN stripe_subscription_id TO dodo_subscription_id;