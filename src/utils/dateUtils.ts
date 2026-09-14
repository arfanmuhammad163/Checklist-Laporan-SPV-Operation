export const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export const INDONESIAN_DAYS_SHORT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function isSunday(year: number, month: number, day: number): boolean {
  const d = new Date(year, month, day);
  return d.getDay() === 0; // 0 = Sunday
}

export function isSaturday(year: number, month: number, day: number): boolean {
  const d = new Date(year, month, day);
  return d.getDay() === 6; // 6 = Saturday
}

export function getDayName(year: number, month: number, day: number): string {
  const d = new Date(year, month, day);
  return INDONESIAN_DAYS_SHORT[d.getDay()];
}

export function formatIndonesianDate(year: number, month: number, day: number): string {
  const dayName = getDayName(year, month, day);
  const monthName = INDONESIAN_MONTHS[month];
  return `${dayName}, ${day} ${monthName} ${year}`;
}
