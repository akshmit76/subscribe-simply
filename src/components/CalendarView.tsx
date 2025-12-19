import { useMemo, useState } from 'react';
import { Subscription } from '@/types/subscription';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameDay, 
  isToday,
  addMonths,
  subMonths,
  parseISO,
  isSameMonth,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

interface CalendarViewProps {
  subscriptions: Subscription[];
}

export function CalendarView({ subscriptions }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);
    
    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const getSubscriptionsForDay = (day: Date) => {
    return subscriptions.filter((sub) =>
      isSameDay(parseISO(sub.next_billing_date), day)
    );
  };

  const todaysSubs = subscriptions.filter((sub) =>
    isSameDay(parseISO(sub.next_billing_date), new Date())
  );

  const thisWeekSubs = subscriptions.filter((sub) => {
    const subDate = parseISO(sub.next_billing_date);
    const today = new Date();
    const weekEnd = endOfWeek(today);
    return subDate >= today && subDate <= weekEnd;
  });

  const getTotalForDay = (day: Date) => {
    const subs = getSubscriptionsForDay(day);
    return subs.reduce((sum, sub) => sum + Number(sub.amount), 0);
  };

  return (
    <div className="space-y-6">
      {/* Alerts Section */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="p-5 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-warning" />
            <h3 className="font-semibold">Due Today</h3>
          </div>
          {todaysSubs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No payments due today</p>
          ) : (
            <div className="space-y-2">
              {todaysSubs.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between">
                  <span className="text-sm">{sub.service_name}</span>
                  <Badge variant="secondary">${Number(sub.amount).toFixed(2)}</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 rounded-xl bg-card border border-border">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">This Week</h3>
          </div>
          {thisWeekSubs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming payments this week</p>
          ) : (
            <div className="space-y-2">
              {thisWeekSubs.slice(0, 5).map((sub) => (
                <div key={sub.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{sub.service_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(parseISO(sub.next_billing_date), 'EEE')}
                    </span>
                  </div>
                  <Badge variant="secondary">${Number(sub.amount).toFixed(2)}</Badge>
                </div>
              ))}
              {thisWeekSubs.length > 5 && (
                <p className="text-xs text-muted-foreground">
                  +{thisWeekSubs.length - 5} more
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Calendar */}
      <div className="p-6 rounded-xl bg-card border border-border">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentMonth(new Date())}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div 
              key={day} 
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {day}
            </div>
          ))}

          {calendarDays.map((day) => {
            const daySubs = getSubscriptionsForDay(day);
            const dayTotal = getTotalForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isTodayDate = isToday(day);

            return (
              <div
                key={day.toISOString()}
                className={`
                  min-h-[80px] p-2 rounded-lg border transition-colors
                  ${isCurrentMonth ? 'bg-background' : 'bg-muted/30'}
                  ${isTodayDate ? 'border-primary ring-1 ring-primary/20' : 'border-transparent'}
                  ${daySubs.length > 0 ? 'hover:bg-accent/50' : ''}
                `}
              >
                <div className={`text-sm font-medium mb-1 ${
                  !isCurrentMonth ? 'text-muted-foreground/50' : 
                  isTodayDate ? 'text-primary' : ''
                }`}>
                  {format(day, 'd')}
                </div>
                
                {daySubs.length > 0 && (
                  <div className="space-y-1">
                    {daySubs.slice(0, 2).map((sub) => (
                      <div 
                        key={sub.id}
                        className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary truncate"
                      >
                        {sub.service_name}
                      </div>
                    ))}
                    {daySubs.length > 2 && (
                      <div className="text-xs text-muted-foreground px-1">
                        +{daySubs.length - 2} more
                      </div>
                    )}
                    {dayTotal > 0 && (
                      <div className="text-xs font-medium text-accent-foreground">
                        ${dayTotal.toFixed(2)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
