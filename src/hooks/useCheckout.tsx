import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useCheckout() {
  const [isLoading, setIsLoading] = useState(false);

  const createCheckoutSession = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please sign in to upgrade to Pro');
        return null;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Checkout error:', error);
        toast.error('Failed to create checkout session');
        return null;
      }

      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
        return data.checkout_url;
      }

      return null;
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Please sign in first');
        return null;
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Customer portal error:', error);
        toast.error('Failed to open customer portal');
        return null;
      }

      if (data?.portal_url) {
        window.open(data.portal_url, '_blank');
        return data.portal_url;
      }

      return null;
    } catch (error) {
      console.error('Customer portal error:', error);
      toast.error('An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCheckoutSession,
    openCustomerPortal,
    isLoading,
  };
}