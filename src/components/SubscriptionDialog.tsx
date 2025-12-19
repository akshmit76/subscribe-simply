import { useState } from 'react';
import { Subscription, BILLING_CYCLES, CATEGORIES, PAYMENT_METHODS } from '@/types/subscription';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

interface SubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscription?: Subscription;
}

export function SubscriptionDialog({ open, onOpenChange, subscription }: SubscriptionDialogProps) {
  const { createSubscription, updateSubscription, isCreating, isUpdating } = useSubscriptions();
  const isEditing = !!subscription;

  const [formData, setFormData] = useState<{
    service_name: string;
    amount: string;
    billing_cycle: 'weekly' | 'monthly' | 'yearly';
    next_billing_date: string;
    category: string;
    payment_method: string;
    notes: string;
    is_active: boolean;
    is_flagged: boolean;
  }>({
    service_name: subscription?.service_name ?? '',
    amount: subscription?.amount?.toString() ?? '',
    billing_cycle: subscription?.billing_cycle ?? 'monthly',
    next_billing_date: subscription?.next_billing_date ?? new Date().toISOString().split('T')[0],
    category: subscription?.category ?? '',
    payment_method: subscription?.payment_method ?? '',
    notes: subscription?.notes ?? '',
    is_active: subscription?.is_active ?? true,
    is_flagged: subscription?.is_flagged ?? false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const billingCycle = formData.billing_cycle as 'weekly' | 'monthly' | 'yearly';
    
    const data = {
      service_name: formData.service_name,
      amount: parseFloat(formData.amount),
      billing_cycle: billingCycle,
      next_billing_date: formData.next_billing_date,
      category: formData.category || null,
      payment_method: formData.payment_method || null,
      notes: formData.notes || null,
      is_active: formData.is_active,
      is_flagged: formData.is_flagged,
    };

    if (isEditing) {
      updateSubscription({ id: subscription.id, ...data });
    } else {
      createSubscription(data);
    }
    
    onOpenChange(false);
    setFormData({
      service_name: '',
      amount: '',
      billing_cycle: 'monthly',
      next_billing_date: new Date().toISOString().split('T')[0],
      category: '',
      payment_method: '',
      notes: '',
      is_active: true,
      is_flagged: false,
    });
  };

  const isLoading = isCreating || isUpdating;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Subscription' : 'Add Subscription'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="service_name">Service Name *</Label>
            <Input
              id="service_name"
              placeholder="Netflix, Spotify, etc."
              value={formData.service_name}
              onChange={(e) => setFormData({ ...formData, service_name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="9.99"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billing_cycle">Billing Cycle *</Label>
              <Select
                value={formData.billing_cycle}
                onValueChange={(value) => setFormData({ ...formData, billing_cycle: value as 'weekly' | 'monthly' | 'yearly' })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_CYCLES.map((cycle) => (
                    <SelectItem key={cycle.value} value={cycle.value}>
                      {cycle.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="next_billing_date">Next Billing Date *</Label>
            <Input
              id="next_billing_date"
              type="date"
              value={formData.next_billing_date}
              onChange={(e) => setFormData({ ...formData, next_billing_date: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => setFormData({ ...formData, payment_method: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method} value={method}>
                      {method}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isEditing ? 'Saving...' : 'Adding...'}
                </>
              ) : (
                isEditing ? 'Save Changes' : 'Add Subscription'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
