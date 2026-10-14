"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { createProperty, updateProperty } from "@/actions/property";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ImageUploader,
  type UploadedImage,
} from "@/components/property/image-uploader";

const TYPES = ["APARTMENT", "VILLA", "CHALET", "OFFICE", "LAND"] as const;
const PURPOSES = ["SALE", "RENT"] as const;
const CURRENCIES = ["EGP", "USD"] as const;

export type PropertyFormValues = {
  title: string;
  description: string;
  price: string;
  currency: "EGP" | "USD";
  type: (typeof TYPES)[number];
  purpose: (typeof PURPOSES)[number];
  bedrooms: string;
  bathrooms: string;
  area: string;
  address: string;
  city: string;
  latitude: string;
  longitude: string;
  amenities: string;
  images: UploadedImage[];
};

export const emptyValues: PropertyFormValues = {
  title: "",
  description: "",
  price: "",
  currency: "EGP",
  type: "APARTMENT",
  purpose: "SALE",
  bedrooms: "",
  bathrooms: "",
  area: "",
  address: "",
  city: "",
  latitude: "",
  longitude: "",
  amenities: "",
  images: [],
};

const selectClass =
  "w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40";

export function PropertyForm({
  propertyId,
  initial = emptyValues,
}: {
  // لو فيه propertyId يبقى ده تعديل، غير كده إضافة
  propertyId?: string;
  initial?: PropertyFormValues;
}) {
  const t = useTranslations("PropertyForm");
  const tp = useTranslations("Property");
  const locale = useLocale();
  const router = useRouter();

  const [values, setValues] = useState<PropertyFormValues>(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function set<K extends keyof PropertyFormValues>(
    key: K,
    value: PropertyFormValues[K]
  ) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  // الأراضي والمكاتب ملهاش غرف نوم أو حمامات
  const hasRooms = values.type === "APARTMENT" || values.type === "VILLA" || values.type === "CHALET";

  function submit(intent: "draft" | "submit") {
    setError(null);

    const payload = {
      title: values.title,
      description: values.description,
      price: values.price,
      currency: values.currency,
      type: values.type,
      purpose: values.purpose,
      bedrooms: hasRooms ? values.bedrooms : "",
      bathrooms: hasRooms ? values.bathrooms : "",
      area: values.area,
      address: values.address,
      city: values.city,
      latitude: values.latitude,
      longitude: values.longitude,
      amenities: values.amenities
        .split(/[,،\n]/)
        .map((a) => a.trim())
        .filter(Boolean),
      images: values.images,
      intent,
    };

    startTransition(async () => {
      const result = propertyId
        ? await updateProperty(propertyId, payload)
        : await createProperty(payload);

      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(`/${locale}/dashboard/properties`);
      router.refresh();
    });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit("submit");
      }}
      className="space-y-8"
    >
      {/* الصور */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold">{t("imagesTitle")}</h2>
        <ImageUploader
          value={values.images}
          onChange={(images) => set("images", images)}
        />
      </section>

      {/* البيانات الأساسية */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold">{t("basicTitle")}</h2>

        <div className="space-y-2">
          <Label htmlFor="title">{t("title")}</Label>
          <Input
            id="title"
            value={values.title}
            onChange={(e) => set("title", e.target.value)}
            maxLength={120}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">{t("description")}</Label>
          <textarea
            id="description"
            rows={5}
            value={values.description}
            onChange={(e) => set("description", e.target.value)}
            maxLength={3000}
            required
            className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="type">{t("type")}</Label>
            <select
              id="type"
              value={values.type}
              onChange={(e) => set("type", e.target.value as PropertyFormValues["type"])}
              className={selectClass}
            >
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {tp(`types.${type}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">{t("purpose")}</Label>
            <select
              id="purpose"
              value={values.purpose}
              onChange={(e) => set("purpose", e.target.value as PropertyFormValues["purpose"])}
              className={selectClass}
            >
              {PURPOSES.map((purpose) => (
                <option key={purpose} value={purpose}>
                  {tp(`purposes.${purpose}`)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="price">
              {values.purpose === "RENT" ? t("priceRent") : t("price")}
            </Label>
            <Input
              id="price"
              type="number"
              min="0"
              inputMode="numeric"
              dir="ltr"
              className="text-start"
              value={values.price}
              onChange={(e) => set("price", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">{t("currency")}</Label>
            <select
              id="currency"
              value={values.currency}
              onChange={(e) => set("currency", e.target.value as "EGP" | "USD")}
              className={selectClass}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="area">{t("area")}</Label>
            <Input
              id="area"
              type="number"
              min="0"
              inputMode="decimal"
              dir="ltr"
              className="text-start"
              value={values.area}
              onChange={(e) => set("area", e.target.value)}
              required
            />
          </div>
          {hasRooms && (
            <>
              <div className="space-y-2">
                <Label htmlFor="bedrooms">{t("bedrooms")}</Label>
                <Input
                  id="bedrooms"
                  type="number"
                  min="0"
                  max="20"
                  inputMode="numeric"
                  dir="ltr"
                  className="text-start"
                  value={values.bedrooms}
                  onChange={(e) => set("bedrooms", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">{t("bathrooms")}</Label>
                <Input
                  id="bathrooms"
                  type="number"
                  min="0"
                  max="20"
                  inputMode="numeric"
                  dir="ltr"
                  className="text-start"
                  value={values.bathrooms}
                  onChange={(e) => set("bathrooms", e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </section>

      {/* الموقع */}
      <section className="space-y-4">
        <h2 className="text-lg font-bold">{t("locationTitle")}</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="city">{t("city")}</Label>
            <Input
              id="city"
              value={values.city}
              onChange={(e) => set("city", e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">{t("address")}</Label>
            <Input
              id="address"
              value={values.address}
              onChange={(e) => set("address", e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="latitude">{t("latitude")}</Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              inputMode="decimal"
              dir="ltr"
              className="text-start"
              value={values.latitude}
              onChange={(e) => set("latitude", e.target.value)}
              placeholder="30.0074"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="longitude">{t("longitude")}</Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              inputMode="decimal"
              dir="ltr"
              className="text-start"
              value={values.longitude}
              onChange={(e) => set("longitude", e.target.value)}
              placeholder="31.4913"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground">{t("coordsHint")}</p>
      </section>

      {/* المميزات */}
      <section className="space-y-3">
        <h2 className="text-lg font-bold">{t("amenitiesTitle")}</h2>
        <textarea
          rows={3}
          value={values.amenities}
          onChange={(e) => set("amenities", e.target.value)}
          placeholder={t("amenitiesPlaceholder")}
          className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/40"
        />
        <p className="text-xs text-muted-foreground">{t("amenitiesHint")}</p>
      </section>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {t(`errors.${error}`)}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? t("saving") : t("submit")}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={isPending}
          onClick={() => submit("draft")}
        >
          {t("saveDraft")}
        </Button>
      </div>
    </form>
  );
}