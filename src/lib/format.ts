const BENGALI_LOCALE = "bn-BD-u-nu-beng";

export function formatBanglaCurrency(value: number, fractionDigits = 2): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  const formatted = new Intl.NumberFormat(BENGALI_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(safeValue);

  return `${formatted} টাকা`;
}

export function formatBanglaNumber(value: number, fractionDigits = 0): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat(BENGALI_LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  }).format(safeValue);
}

export function formatBanglaDate(dateInput: string | number | Date): string {
  return new Intl.DateTimeFormat(BENGALI_LOCALE).format(new Date(dateInput));
}
