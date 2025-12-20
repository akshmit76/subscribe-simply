import { useState } from 'react';
import { Subscription } from '@/types/subscription';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubscriptionDialog } from './SubscriptionDialog';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Flag,
  Calendar,
  CreditCard,
  CheckCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, differenceInDays, parseISO } from 'date-fns';
import { calculateNextBillingDate } from '@/lib/subscriptionUtils';

interface SubscriptionCardProps {
  subscription: Subscription;
}

export function SubscriptionCard({ subscription }: SubscriptionCardProps) {
  const { updateSubscription, deleteSubscription } = useSubscriptions();
  const [editOpen, setEditOpen] = useState(false);

  const daysUntilBilling = differenceInDays(
    parseISO(subscription.next_billing_date),
    new Date()
  );

  const getUrgencyColor = () => {
    if (daysUntilBilling < 0) return 'text-destructive';
    if (daysUntilBilling <= 3) return 'text-warning';
    return 'text-muted-foreground';
  };

  const formatAmount = (amount: number, cycle: string) => {
    return `$${amount.toFixed(2)}/${cycle === 'monthly' ? 'mo' : cycle === 'yearly' ? 'yr' : 'wk'}`;
  };

  const toggleFlag = () => {
    updateSubscription({ id: subscription.id, is_flagged: !subscription.is_flagged });
  };

  const handleMarkAsPaid = () => {
    const nextDate = calculateNextBillingDate(new Date(), subscription.billing_cycle);
    updateSubscription({ 
      id: subscription.id, 
      next_billing_date: format(nextDate, 'yyyy-MM-dd') 
    });
  };

  return (
    <>
      <div className={`p-5 rounded-xl bg-card border ${
        subscription.is_flagged ? 'border-warning/50' : 'border-border'
      } shadow-soft hover:shadow-elevated transition-all`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-accent-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">{subscription.service_name}</h3>
              {subscription.category && (
                <Badge variant="secondary" className="text-xs mt-1">
                  {subscription.category}
                </Badge>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleMarkAsPaid}>
                <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                Mark as Paid
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setEditOpen(true)}>
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={toggleFlag}>
                <Flag className={`w-4 h-4 mr-2 ${subscription.is_flagged ? 'text-warning' : ''}`} />
                {subscription.is_flagged ? 'Unflag' : 'Flag as unused'}
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => deleteSubscription(subscription.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold">
              {formatAmount(Number(subscription.amount), subscription.billing_cycle)}
            </p>
            <div className={`flex items-center gap-1.5 mt-1 text-sm ${getUrgencyColor()}`}>
              <Calendar className="w-3.5 h-3.5" />
              {daysUntilBilling < 0 
                ? 'Overdue'
                : daysUntilBilling === 0 
                  ? 'Due today'
                  : `${daysUntilBilling} day${daysUntilBilling !== 1 ? 's' : ''} left`
              }
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            {format(parseISO(subscription.next_billing_date), 'MMM d, yyyy')}
          </p>
        </div>

        {subscription.is_flagged && (
          <div className="mt-3 px-3 py-2 rounded-lg bg-warning/10 border border-warning/20">
            <p className="text-xs text-warning flex items-center gap-1.5">
              <Flag className="w-3 h-3" />
              Flagged for review
            </p>
          </div>
        )}
      </div>

      <SubscriptionDialog 
        open={editOpen} 
        onOpenChange={setEditOpen}
        subscription={subscription}
      />
    </>
  );
}
