export interface Subscription {
  id: string;
  user_id: string;
  service_name: string;
  amount: number;
  billing_cycle: 'weekly' | 'monthly' | 'yearly';
  next_billing_date: string;
  category: string | null;
  payment_method: string | null;
  notes: string | null;
  is_active: boolean;
  is_flagged: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  subscription_tier: 'free' | 'pro';
  dodo_customer_id: string | null;
  dodo_subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

export const BILLING_CYCLES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
] as const;

export const CATEGORIES = [
  'Entertainment',
  'Productivity',
  'Utilities',
  'Health & Fitness',
  'Education',
  'Finance',
  'Shopping',
  'News & Media',
  'Social',
  'Other',
] as const;

export const PAYMENT_METHODS = [
  'Credit Card',
  'Debit Card',
  'PayPal',
  'Bank Transfer',
  'Apple Pay',
  'Google Pay',
  'Other',
] as const;
