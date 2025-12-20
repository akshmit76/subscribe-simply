import { useState } from 'react';
import { Subscription } from '@/types/subscription';
import { useSubscriptions } from '@/hooks/useSubscriptions';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SubscriptionDialog } from './SubscriptionDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Flag,
  ArrowUpDown,
  CheckCircle
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { format, parseISO, differenceInDays } from 'date-fns';
import { calculateNextBillingDate } from '@/lib/subscriptionUtils';

interface SubscriptionTableProps {
  subscriptions: Subscription[];
}

export function SubscriptionTable({ subscriptions }: SubscriptionTableProps) {
  const { updateSubscription, deleteSubscription } = useSubscriptions();
  const [editingSub, setEditingSub] = useState<Subscription | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'name'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const sortedSubscriptions = [...subscriptions].sort((a, b) => {
    const dir = sortDir === 'asc' ? 1 : -1;
    switch (sortBy) {
      case 'date':
        return dir * (new Date(a.next_billing_date).getTime() - new Date(b.next_billing_date).getTime());
      case 'amount':
        return dir * (Number(a.amount) - Number(b.amount));
      case 'name':
        return dir * a.service_name.localeCompare(b.service_name);
      default:
        return 0;
    }
  });

  const handleSort = (column: 'date' | 'amount' | 'name') => {
    if (sortBy === column) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDir('asc');
    }
  };

  const getUrgencyBadge = (nextBillingDate: string) => {
    const days = differenceInDays(parseISO(nextBillingDate), new Date());
    if (days < 0) return <Badge variant="destructive">Overdue</Badge>;
    if (days <= 3) return <Badge className="bg-warning text-warning-foreground">Soon</Badge>;
    return null;
  };

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="-ml-3 h-8"
                  onClick={() => handleSort('name')}
                >
                  Service
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </Button>
              </TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="-ml-3 h-8"
                  onClick={() => handleSort('amount')}
                >
                  Amount
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </Button>
              </TableHead>
              <TableHead>Cycle</TableHead>
              <TableHead>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="-ml-3 h-8"
                  onClick={() => handleSort('date')}
                >
                  Next Billing
                  <ArrowUpDown className="w-3 h-3 ml-1" />
                </Button>
              </TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSubscriptions.map((sub) => (
              <TableRow key={sub.id} className={sub.is_flagged ? 'bg-warning/5' : ''}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{sub.service_name}</span>
                    {sub.is_flagged && <Flag className="w-3 h-3 text-warning" />}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">
                  ${Number(sub.amount).toFixed(2)}
                </TableCell>
                <TableCell className="capitalize">{sub.billing_cycle}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {format(parseISO(sub.next_billing_date), 'MMM d, yyyy')}
                    {getUrgencyBadge(sub.next_billing_date)}
                  </div>
                </TableCell>
                <TableCell>
                  {sub.category && (
                    <Badge variant="secondary">{sub.category}</Badge>
                  )}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem 
                        onClick={() => {
                          const nextDate = calculateNextBillingDate(new Date(), sub.billing_cycle);
                          updateSubscription({ 
                            id: sub.id, 
                            next_billing_date: format(nextDate, 'yyyy-MM-dd') 
                          });
                        }}
                      >
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        Mark as Paid
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setEditingSub(sub)}>
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => updateSubscription({ 
                          id: sub.id, 
                          is_flagged: !sub.is_flagged 
                        })}
                      >
                        <Flag className={`w-4 h-4 mr-2 ${sub.is_flagged ? 'text-warning' : ''}`} />
                        {sub.is_flagged ? 'Unflag' : 'Flag'}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => deleteSubscription(sub.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {editingSub && (
        <SubscriptionDialog 
          open={!!editingSub} 
          onOpenChange={(open) => !open && setEditingSub(null)}
          subscription={editingSub}
        />
      )}
    </>
  );
}
