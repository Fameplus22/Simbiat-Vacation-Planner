export const SUPPORTED_LOCALES = [
  { code: "en", label: "English" },
  { code: "es", label: "Spanish" },
  { code: "fr", label: "French" },
  { code: "pt", label: "Portuguese" },
  { code: "ar", label: "Arabic" },
  { code: "zh", label: "Chinese" },
] as const;

export const SUPPORTED_CURRENCIES = [
  { code: "USD", label: "US dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British pound" },
  { code: "NGN", label: "Nigerian naira" },
  { code: "CAD", label: "Canadian dollar" },
  { code: "AUD", label: "Australian dollar" },
  { code: "JPY", label: "Japanese yen" },
  { code: "AED", label: "UAE dirham" },
  { code: "ZAR", label: "South African rand" },
  { code: "BRL", label: "Brazilian real" },
  { code: "INR", label: "Indian rupee" },
  { code: "MXN", label: "Mexican peso" },
] as const;

export type SupportedLocale = (typeof SUPPORTED_LOCALES)[number]["code"];
export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number]["code"];

export const DEFAULT_LOCALE: SupportedLocale = "en";
export const DEFAULT_CURRENCY: SupportedCurrency = "USD";

export function isSupportedLocale(value: string): value is SupportedLocale {
  return SUPPORTED_LOCALES.some((locale) => locale.code === value);
}

export function isSupportedCurrency(value: string): value is SupportedCurrency {
  return SUPPORTED_CURRENCIES.some((currency) => currency.code === value);
}

export function formatCurrency(
  value: number | null | undefined,
  currencyCode: string,
  locale = "en",
) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return "Not set";
  }

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatTripDate(value: string | null | undefined, locale = "en") {
  if (!value) {
    return "Flexible";
  }

  const date = new Date(`${value}T00:00:00`);

  return new Intl.DateTimeFormat(locale, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
