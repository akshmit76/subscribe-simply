import { addWeeks, addMonths, addYears } from 'date-fns';

export function calculateNextBillingDate(currentDate: Date, billingCycle: string): Date {
  switch (billingCycle) {
    case 'weekly':
      return addWeeks(currentDate, 1);
    case 'monthly':
      return addMonths(currentDate, 1);
    case 'yearly':
      return addYears(currentDate, 1);
    default:
      return addMonths(currentDate, 1);
  }
}
