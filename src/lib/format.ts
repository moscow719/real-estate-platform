// الأرقام بتظهر بالإنجليزي (1,000) في العربي كمان، عشان تبقى أوضح في الأسعار
function numberLocale(locale: string) {
  return locale === "ar" ? "ar-EG-u-nu-latn" : "en-US";
}

export function formatPrice(
  price: number,
  currency: "EGP" | "USD",
  locale: string
) {
  return new Intl.NumberFormat(numberLocale(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatNumber(value: number, locale: string) {
  return new Intl.NumberFormat(numberLocale(locale)).format(value);
}