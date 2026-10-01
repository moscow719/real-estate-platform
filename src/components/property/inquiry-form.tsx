"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { sendInquiry } from "@/actions/inquiry";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InquiryForm({
  propertyId,
  defaultName = "",
  defaultEmail = "",
}: {
  propertyId: string;
  defaultName?: string;
  defaultEmail?: string;
}) {
  const t = useTranslations("Inquiry");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);

    startTransition(async () => {
      const result = await sendInquiry({
        propertyId,
        name: data.get("name"),
        phone: data.get("phone"),
        email: data.get("email"),
        message: data.get("message"),
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSent(true);
      form.reset();
    });
  }

  if (sent) {
    return (
      <div className="space-y-3 rounded-xl border bg-card p-6">
        <p className="font-medium text-green-700" role="status">
          {t("success")}
        </p>
        <button
          type="button"
          onClick={() => setSent(false)}
          className="text-sm underline underline-offset-4"
        >
          {t("sendAnother")}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-xl border bg-card p-6"
    >
      <div>
        <h2 className="text-lg font-bold">{t("title")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="inq-name">{t("name")}</Label>
        <Input
          id="inq-name"
          name="name"
          autoComplete="name"
          defaultValue={defaultName}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="inq-phone">{t("phone")}</Label>
        <Input
          id="inq-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          dir="ltr"
          className="text-start"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="inq-email">{t("email")}</Label>
        <Input
          id="inq-email"
          name="email"
          type="email"
          autoComplete="email"
          dir="ltr"
          className="text-start"
          defaultValue={defaultEmail}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="inq-message">{t("message")}</Label>
        <textarea
          id="inq-message"
          name="message"
          rows={4}
          placeholder={t("messagePlaceholder")}
          required
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {t(`errors.${error}`)}
        </p>
      )}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t("sending") : t("send")}
      </Button>

      <p className="text-center text-xs text-muted-foreground">
        {t("demoNote")}
      </p>
    </form>
  );
}