/**
 * Converts 12-hour time format (e.g., "3 PM", "10 AM") to 24-hour format (e.g., "15:00:00", "10:00:00")
 */
export function convertTo24HourFormat(time12h: string): string {
  if (!time12h) return '';
  
  const timeUpper = time12h.trim().toUpperCase();
  const match = timeUpper.match(/^(\d+)\s*(AM|PM)$/);
  
  if (!match) {
    // If already in HH:MM or HH:MM:SS format, return as is
    if (time12h.match(/^\d{1,2}:\d{2}(:\d{2})?$/)) {
      return time12h;
    }
    return time12h;
  }
  
  let hour = parseInt(match[1], 10);
  const period = match[2];
  
  // Convert to 24-hour format
  if (period === 'AM') {
    if (hour === 12) {
      hour = 0; // 12 AM is 00:00
    }
  } else { // PM
    if (hour !== 12) {
      hour += 12; // Add 12 for PM hours except 12 PM
    }
  }
  
  // Format as HH:MM:SS
  const hourStr = hour.toString().padStart(2, '0');
  return `${hourStr}:00:00`;
}
