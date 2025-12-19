import { useMemo } from 'react';
import { Subscription } from '@/types/subscription';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Calendar,
  Flag,
  AlertTriangle
} from 'lucide-react';

interface InsightsPanelProps {
  subscriptions: Subscription[];
}

export function InsightsPanel({ subscriptions }: InsightsPanelProps) {
  const insights = useMemo(() => {
    const active = subscriptions.filter((s) => s.is_active);
    
    // Calculate monthly equivalent for all subscriptions
    const monthlyTotal = active.reduce((sum, sub) => {
      const amount = Number(sub.amount);
      switch (sub.billing_cycle) {
        case 'weekly':
          return sum + (amount * 4.33);
        case 'yearly':
          return sum + (amount / 12);
        default:
          return sum + amount;
      }
    }, 0);

    const yearlyProjected = monthlyTotal * 12;

    // Group by category
    const byCategory = active.reduce((acc, sub) => {
      const cat = sub.category || 'Uncategorized';
      const amount = Number(sub.amount);
      const monthly = sub.billing_cycle === 'weekly' 
        ? amount * 4.33 
        : sub.billing_cycle === 'yearly' 
          ? amount / 12 
          : amount;
      
      acc[cat] = (acc[cat] || 0) + monthly;
      return acc;
    }, {} as Record<string, number>);

    const flaggedSubs = subscriptions.filter((s) => s.is_flagged);

    // Find potential duplicates (same category)
    const categoryCount = active.reduce((acc, sub) => {
      const cat = sub.category || 'Other';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const duplicateCategories = Object.entries(categoryCount)
      .filter(([_, count]) => count > 1)
      .map(([cat]) => cat);

    return {
      monthlyTotal,
      yearlyProjected,
      byCategory,
      flaggedSubs,
      duplicateCategories,
      totalActive: active.length,
    };
  }, [subscriptions]);

  const sortedCategories = Object.entries(insights.byCategory)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <InsightCard
          icon={<DollarSign className="w-5 h-5" />}
          title="Monthly Spend"
          value={`$${insights.monthlyTotal.toFixed(2)}`}
          subtitle={`${insights.totalActive} active subscription${insights.totalActive !== 1 ? 's' : ''}`}
          color="primary"
        />
        <InsightCard
          icon={<Calendar className="w-5 h-5" />}
          title="Yearly Projected"
          value={`$${insights.yearlyProjected.toFixed(2)}`}
          subtitle="Based on current subscriptions"
          color="accent"
        />
        <InsightCard
          icon={<Flag className="w-5 h-5" />}
          title="Flagged for Review"
          value={insights.flaggedSubs.length.toString()}
          subtitle={insights.flaggedSubs.length > 0 
            ? 'Consider canceling these' 
            : 'No flagged subscriptions'}
          color={insights.flaggedSubs.length > 0 ? 'warning' : 'success'}
        />
      </div>

      {/* Category Breakdown */}
      <div className="p-6 rounded-xl bg-card border border-border">
        <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
        {sortedCategories.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            Add subscriptions with categories to see breakdown
          </p>
        ) : (
          <div className="space-y-4">
            {sortedCategories.map(([category, amount]) => {
              const percentage = (amount / insights.monthlyTotal) * 100;
              return (
                <div key={category}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium">{category}</span>
                    <span className="text-sm text-muted-foreground">
                      ${amount.toFixed(2)}/mo
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Duplicate Categories */}
        {insights.duplicateCategories.length > 0 && (
          <div className="p-5 rounded-xl bg-card border border-warning/30">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-warning" />
              <h3 className="font-semibold">Possible Duplicates</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              You have multiple subscriptions in these categories:
            </p>
            <div className="flex flex-wrap gap-2">
              {insights.duplicateCategories.map((cat) => (
                <Badge key={cat} variant="secondary">{cat}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Flagged Subscriptions */}
        {insights.flaggedSubs.length > 0 && (
          <div className="p-5 rounded-xl bg-card border border-border">
            <div className="flex items-center gap-2 mb-3">
              <Flag className="w-5 h-5 text-warning" />
              <h3 className="font-semibold">Flagged Subscriptions</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-3">
              These subscriptions are flagged for review:
            </p>
            <div className="space-y-2">
              {insights.flaggedSubs.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between">
                  <span className="text-sm">{sub.service_name}</span>
                  <Badge variant="secondary">${Number(sub.amount).toFixed(2)}</Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      <div className="p-5 rounded-xl bg-accent/50 border border-accent">
        <h3 className="font-semibold mb-2 text-accent-foreground">💡 Tips</h3>
        <ul className="text-sm text-muted-foreground space-y-1.5">
          <li>• Flag subscriptions you rarely use to identify savings opportunities</li>
          <li>• Check for overlapping services in the same category</li>
          <li>• Review yearly subscriptions before they auto-renew</li>
        </ul>
      </div>
    </div>
  );
}

function InsightCard({ 
  icon, 
  title, 
  value, 
  subtitle, 
  color 
}: { 
  icon: React.ReactNode;
  title: string;
  value: string;
  subtitle: string;
  color: 'primary' | 'accent' | 'warning' | 'success';
}) {
  const colorClasses = {
    primary: 'bg-primary/10 text-primary',
    accent: 'bg-accent text-accent-foreground',
    warning: 'bg-warning/10 text-warning',
    success: 'bg-success/10 text-success',
  };

  return (
    <div className="p-5 rounded-xl bg-card border border-border">
      <div className={`w-10 h-10 rounded-lg ${colorClasses[color]} flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <h4 className="text-sm text-muted-foreground mb-1">{title}</h4>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-xs text-muted-foreground">{subtitle}</p>
    </div>
  );
}
