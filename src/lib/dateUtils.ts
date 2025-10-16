import { format } from 'date-fns';

/**
 * Adds ordinal suffix to a number (1st, 2nd, 3rd, 4th, etc.)
 */
function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) {
    return 'th';
  }
  
  const lastDigit = day % 10;
  switch (lastDigit) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

/**
 * Formats a date with ordinal suffix (e.g., "1st Jan 2024")
 */
export function formatDateWithOrdinal(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const day = dateObj.getDate();
  const ordinalSuffix = getOrdinalSuffix(day);
  const monthYear = format(dateObj, 'MMM yyyy');
  
  return `${day}${ordinalSuffix} ${monthYear}`;
}