import { addDays, endOfMonth, isSameDay, isSameMonth, startOfMonth, startOfWeek } from 'date-fns';

export interface MonthCell {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
}

/** Monday-first 6x7 month grid. */
export function buildMonthCells(cursor: Date): MonthCell[] {
  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const today = new Date();
  const cells: MonthCell[] = [];
  for (let i = 0; i < 42; i++) {
    const date = addDays(gridStart, i);
    cells.push({ date, inMonth: date >= monthStart && date <= monthEnd, isToday: isSameDay(date, today) });
    if (i === 41) break;
  }
  return cells;
}

/** Monday-first week (7 dates) containing `cursor`. */
export function buildWeekDates(cursor: Date): Date[] {
  const start = startOfWeek(cursor, { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export const IT_WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

export function ageFromBirthdate(birthdate: string | null): number | null {
  if (!birthdate) return null;
  const dob = new Date(birthdate);
  if (Number.isNaN(dob.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}
