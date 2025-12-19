import { Button } from '@/components/ui/button';
import { Plus, CreditCard } from 'lucide-react';

interface EmptyStateProps {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="w-20 h-20 rounded-2xl bg-accent flex items-center justify-center mb-6">
        <CreditCard className="w-10 h-10 text-accent-foreground" />
      </div>
      <h2 className="text-2xl font-bold mb-2">No subscriptions yet</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Start tracking your subscriptions to get insights into your spending and never miss a payment.
      </p>
      <Button onClick={onAdd} variant="hero" size="lg" className="gap-2">
        <Plus className="w-5 h-5" />
        Add Your First Subscription
      </Button>
    </div>
  );
}
