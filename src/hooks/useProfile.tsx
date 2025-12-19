import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { Profile } from '@/types/subscription';

export function useProfile() {
  const { user } = useAuth();

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data as Profile | null;
    },
    enabled: !!user,
  });

  const isPro = profileQuery.data?.subscription_tier === 'pro';
  const canAddSubscription = (currentCount: number) => isPro || currentCount < 5;

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    isPro,
    canAddSubscription,
  };
}
