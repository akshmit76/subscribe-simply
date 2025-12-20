import { useEffect, useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { useProfile } from '@/hooks/useProfile';
import { useCheckout } from '@/hooks/useCheckout';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Plus, 
  Calendar, 
  TrendingUp, 
  CreditCard,
  LogOut,
  LayoutGrid,
  List,
  Settings,
  Loader2,
  Crown
} from 'lucide-react';
import { SubscriptionCard } from '@/components/SubscriptionCard';
import { SubscriptionTable } from '@/components/SubscriptionTable';
import { SubscriptionDialog } from '@/components/SubscriptionDialog';
import { CalendarView } from '@/components/CalendarView';
import { InsightsPanel } from '@/components/InsightsPanel';
import { EmptyState } from '@/components/EmptyState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { subscriptions, isLoading: subsLoading } = useSubscriptions();
  const { isPro, canAddSubscription, refetch: refetchProfile } = useProfile();
  const { createCheckoutSession, openCustomerPortal, isLoading: checkoutLoading } = useCheckout();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [view, setView] = useState<'cards' | 'table'>('cards');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Handle checkout success
  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    if (checkoutStatus === 'success') {
      toast.success('Welcome to SubSage Pro! Your subscription is now active.');
      searchParams.delete('checkout');
      setSearchParams(searchParams);
      // Refetch profile to get updated tier
      refetchProfile();
    }
  }, [searchParams, setSearchParams, refetchProfile]);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAddClick = () => {
    if (!canAddSubscription(subscriptions.length)) {
      toast.error('Free plan limited to 5 subscriptions. Upgrade to Pro for unlimited!');
      return;
    }
    setDialogOpen(true);
  };

  const handleUpgrade = async () => {
    await createCheckoutSession();
  };

  const handleManageSubscription = async () => {
    await openCustomerPortal();
  };

  if (authLoading || subsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-semibold">SubSage</span>
            {isPro && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium flex items-center gap-1">
                <Crown className="w-3 h-3" />
                Pro
              </span>
            )}
          </Link>
          
          <div className="flex items-center gap-3">
            {!isPro ? (
              <Button 
                variant="hero-outline" 
                size="sm" 
                onClick={handleUpgrade}
                disabled={checkoutLoading}
              >
                {checkoutLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Crown className="w-4 h-4 mr-2" />
                )}
                Upgrade to Pro
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleManageSubscription} disabled={checkoutLoading}>
                    {checkoutLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CreditCard className="w-4 h-4 mr-2" />
                    )}
                    Manage Subscription
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {!isPro && (
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className="text-2xl font-bold mb-1">Your Subscriptions</h1>
              <p className="text-muted-foreground">
                {subscriptions.length === 0 
                  ? 'Get started by adding your first subscription'
                  : `Managing ${subscriptions.length} subscription${subscriptions.length !== 1 ? 's' : ''}`
                }
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <TabsList>
                <TabsTrigger value="dashboard" className="gap-2">
                  <CreditCard className="w-4 h-4" />
                  Dashboard
                </TabsTrigger>
                <TabsTrigger value="calendar" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Calendar
                </TabsTrigger>
                <TabsTrigger value="insights" className="gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Insights
                </TabsTrigger>
              </TabsList>
            </div>
          </div>

          <TabsContent value="dashboard" className="space-y-6">
            {subscriptions.length === 0 ? (
              <EmptyState onAdd={() => setDialogOpen(true)} />
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={view === 'cards' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setView('cards')}
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={view === 'table' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setView('table')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                  <Button onClick={handleAddClick} variant="hero" className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Subscription
                  </Button>
                </div>

                {view === 'cards' ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {subscriptions.map((sub) => (
                      <SubscriptionCard key={sub.id} subscription={sub} />
                    ))}
                  </div>
                ) : (
                  <SubscriptionTable subscriptions={subscriptions} />
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView subscriptions={subscriptions} />
          </TabsContent>

          <TabsContent value="insights">
            <InsightsPanel subscriptions={subscriptions} />
          </TabsContent>
        </Tabs>
      </main>

      <SubscriptionDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}