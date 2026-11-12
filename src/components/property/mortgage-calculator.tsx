"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatPrice } from "@/lib/format";
import { calculateMortgage } from "@/lib/mortgage";

export function MortgageCalculator({
  price,
  currency,
}: {
  price: number;
  currency: "EGP" | "USD";
}) {
  const t = useTranslations("MortgageCalculator");
  const locale = useLocale();
  const [downPayment, setDownPayment] = useState(
    String(Math.round(price * 0.2))
  );
  const [annualRate, setAnnualRate] = useState("");
  const [termYears, setTermYears] = useState("20");

  const hasAllValues =
    downPayment.trim() !== "" &&
    annualRate.trim() !== "" &&
    termYears.trim() !== "";
  const result = hasAllValues
    ? calculateMortgage({
        price,
        downPayment: Number(downPayment),
        annualRate: Number(annualRate),
        termYears: Number(termYears),
      })
    : null;

  return (
    <section className="space-y-5 rounded-xl border p-6">
      <div>
        <h2 className="text-lg font-bold">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="mortgage-down-payment">{t("downPayment")}</Label>
          <Input
            id="mortgage-down-payment"
            type="number"
            min="0"
            max={price}
            step="any"
            inputMode="decimal"
            dir="ltr"
            className="text-start"
            value={downPayment}
            onChange={(event) => setDownPayment(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mortgage-annual-rate">{t("annualRate")}</Label>
          <Input
            id="mortgage-annual-rate"
            type="number"
            min="0"
            max="100"
            step="0.01"
            inputMode="decimal"
            dir="ltr"
            className="text-start"
            value={annualRate}
            onChange={(event) => setAnnualRate(event.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="mortgage-term">{t("termYears")}</Label>
          <Input
            id="mortgage-term"
            type="number"
            min="1"
            max="40"
            step="1"
            inputMode="numeric"
            dir="ltr"
            className="text-start"
            value={termYears}
            onChange={(event) => setTermYears(event.target.value)}
          />
        </div>
      </div>

      {result ? (
        <dl
          aria-live="polite"
          className="space-y-3 rounded-lg bg-muted/50 p-4 text-sm"
        >
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">{t("loanAmount")}</dt>
            <dd className="text-end font-medium">
              {formatPrice(result.loanAmount, currency, locale)}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-t pt-3">
            <dt className="text-muted-foreground">{t("monthlyPayment")}</dt>
            <dd className="text-end text-base font-bold">
              {formatPrice(result.monthlyPayment, currency, locale)}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-t pt-3">
            <dt className="text-muted-foreground">{t("totalPayment")}</dt>
            <dd className="text-end font-medium">
              {formatPrice(result.totalPayment, currency, locale)}
            </dd>
          </div>
          <div className="flex justify-between gap-3 border-t pt-3">
            <dt className="text-muted-foreground">{t("totalInterest")}</dt>
            <dd className="text-end font-medium">
              {formatPrice(result.totalInterest, currency, locale)}
            </dd>
          </div>
        </dl>
      ) : (
        <p role="status" className="text-sm text-muted-foreground">
          {hasAllValues ? t("invalidValues") : t("enterValues")}
        </p>
      )}

      <p className="text-xs leading-5 text-muted-foreground">
        {t("disclaimer")}
      </p>
    </section>
  );
}
