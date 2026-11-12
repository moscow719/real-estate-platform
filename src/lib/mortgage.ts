export function calculateMortgage({
  price,
  downPayment,
  annualRate,
  termYears,
}: {
  price: number;
  downPayment: number;
  annualRate: number;
  termYears: number;
}) {
  if (
    ![price, downPayment, annualRate, termYears].every(Number.isFinite) ||
    price <= 0 ||
    downPayment < 0 ||
    downPayment >= price ||
    annualRate < 0 ||
    annualRate > 100 ||
    !Number.isInteger(termYears) ||
    termYears < 1 ||
    termYears > 40
  ) {
    return null;
  }

  const loanAmount = price - downPayment;
  const months = termYears * 12;
  const monthlyRate = annualRate / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, months);
  const monthlyPayment =
    monthlyRate === 0
      ? loanAmount / months
      : (loanAmount * monthlyRate * factor) / (factor - 1);
  const totalPayment = monthlyPayment * months;

  return {
    loanAmount,
    monthlyPayment,
    totalPayment,
    totalInterest: Math.max(0, totalPayment - loanAmount),
  };
}
