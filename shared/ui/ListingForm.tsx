"use client";

import { useEffect, useMemo, useState } from "react";
import { ImageAttachmentField } from "@shared/ui/ImageAttachmentField";

type Option = { value: string; label: string };

type BrandOption = {
  id: string;
  nameKo: string;
  nameEn?: string | null;
  scopeSport: "ski" | "snowboard" | "both";
  scopeItemType?: string | null;
  source: "OFFICIAL" | "USER";
};

type ListingFormLabels = {
  title: string;
  sport: string;
  itemType: string;
  gender: string;
  brand: string;
  brandCustomLabel: string;
  brandCustomPlaceholder: string;
  sizeType: string;
  sizeValue: string;
  price: string;
  region: string;
  tradeMethod: string;
  condition: string;
  description: string;
  images: string;
  hide: string;
  imageUrlLabel: string;
  imageUploadLabel: string;
  imageAddLabel: string;
  imageRemoveLabel: string;
  imageUploadingLabel: string;
};

type ListingFormInitialValues = {
  title?: string;
  description?: string;
  sport?: string;
  itemType?: string;
  gender?: string;
  brandId?: string | null;
  brandName?: string | null;
  sizeType?: string;
  sizeValue?: string;
  price?: number;
  region?: string | null;
  tradeMethod?: string | null;
  condition?: string;
  isHidden?: boolean;
};

type ListingFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  labels: ListingFormLabels;
  options: {
    sports: Option[];
    categoriesBySport: Record<string, Option[]>;
    genders: Option[];
    conditions: Option[];
    sizeTypes: string[];
  };
  brands: BrandOption[];
  initialValues?: ListingFormInitialValues;
  imageInitialUrls?: string[];
  submitLabel: string;
  locale: "ko" | "en";
  hiddenFields?: Record<string, string>;
};

const CUSTOM_BRAND_VALUE = "custom";

export function ListingForm({
  action,
  labels,
  options,
  brands,
  initialValues,
  imageInitialUrls,
  submitLabel,
  locale,
  hiddenFields
}: ListingFormProps) {
  const defaultSport = initialValues?.sport ?? options.sports[0]?.value ?? "ski";
  const [sport, setSport] = useState(defaultSport);
  const sportCategories = options.categoriesBySport[sport] ?? [];
  const defaultItemType =
    initialValues?.itemType ?? sportCategories[0]?.value ?? "";
  const [itemType, setItemType] = useState(defaultItemType);
  const [brandId, setBrandId] = useState(
    initialValues?.brandId ?? (initialValues?.brandName ? CUSTOM_BRAND_VALUE : "")
  );
  const [customBrand, setCustomBrand] = useState(initialValues?.brandName ?? "");

  useEffect(() => {
    if (!sportCategories.find((option) => option.value === itemType)) {
      setItemType(sportCategories[0]?.value ?? "");
    }
  }, [sport, sportCategories, itemType]);

  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      const matchesSport = brand.scopeSport === "both" || brand.scopeSport === sport;
      const matchesItemType =
        !brand.scopeItemType || brand.scopeItemType === itemType;
      return matchesSport && matchesItemType;
    });
  }, [brands, sport, itemType]);

  useEffect(() => {
    if (!brandId) {
      setBrandId(filteredBrands[0]?.id ?? CUSTOM_BRAND_VALUE);
      return;
    }
    if (brandId === CUSTOM_BRAND_VALUE) {
      return;
    }
    if (!filteredBrands.some((brand) => brand.id === brandId)) {
      setBrandId(filteredBrands[0]?.id ?? CUSTOM_BRAND_VALUE);
    }
  }, [filteredBrands, brandId]);

  const brandOptionLabel = (brand: BrandOption) =>
    locale === "en" && brand.nameEn ? brand.nameEn : brand.nameKo;

  return (
    <form action={action} className="mt-4 grid gap-4 text-sm text-navy-700">
      {hiddenFields
        ? Object.entries(hiddenFields).map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))
        : null}
      <label className="flex flex-col gap-2">
        {labels.title}
        <input
          name="title"
          required
          defaultValue={initialValues?.title ?? ""}
          className="rounded-xl border border-ice-200 px-3 py-2"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-2">
          {labels.sport}
          <select
            name="sport"
            value={sport}
            onChange={(event) => setSport(event.target.value)}
            className="rounded-xl border border-ice-200 px-3 py-2"
          >
            {options.sports.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          {labels.itemType}
          <select
            name="itemType"
            value={itemType}
            onChange={(event) => setItemType(event.target.value)}
            className="rounded-xl border border-ice-200 px-3 py-2"
          >
            {sportCategories.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          {labels.gender}
          <select
            name="gender"
            defaultValue={initialValues?.gender}
            className="rounded-xl border border-ice-200 px-3 py-2"
          >
            {options.genders.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex flex-col gap-2">
          <label className="flex flex-col gap-2">
            {labels.brand}
            <select
              name="brandId"
              value={brandId}
              onChange={(event) => setBrandId(event.target.value)}
              className="rounded-xl border border-ice-200 px-3 py-2"
              required
            >
              {filteredBrands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brandOptionLabel(brand)}
                </option>
              ))}
              <option value={CUSTOM_BRAND_VALUE}>{labels.brandCustomLabel}</option>
            </select>
          </label>
          {brandId === CUSTOM_BRAND_VALUE ? (
            <input
              name="brandCustomName"
              value={customBrand}
              onChange={(event) => setCustomBrand(event.target.value)}
              placeholder={labels.brandCustomPlaceholder}
              required
              className="rounded-xl border border-ice-200 px-3 py-2"
            />
          ) : (
            <input type="hidden" name="brandCustomName" value="" />
          )}
        </div>
        <label className="flex flex-col gap-2">
          {labels.sizeType}
          <select
            name="sizeType"
            defaultValue={initialValues?.sizeType}
            className="rounded-xl border border-ice-200 px-3 py-2"
          >
            {options.sizeTypes.map((value) => (
              <option key={value} value={value}>
                {value.toUpperCase()}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-2">
          {labels.sizeValue}
          <input
            name="sizeValue"
            required
            defaultValue={initialValues?.sizeValue ?? ""}
            className="rounded-xl border border-ice-200 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-2">
          {labels.price}
          <input
            name="price"
            type="number"
            required
            defaultValue={initialValues?.price ?? undefined}
            className="rounded-xl border border-ice-200 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-2">
          {labels.region}
          <input
            name="region"
            required
            defaultValue={initialValues?.region ?? ""}
            className="rounded-xl border border-ice-200 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-2">
          {labels.tradeMethod}
          <input
            name="tradeMethod"
            required
            defaultValue={initialValues?.tradeMethod ?? ""}
            className="rounded-xl border border-ice-200 px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-2">
          {labels.condition}
          <select
            name="condition"
            defaultValue={initialValues?.condition}
            className="rounded-xl border border-ice-200 px-3 py-2"
          >
            {options.conditions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex flex-col gap-2">
        {labels.description}
        <textarea
          name="description"
          rows={5}
          required
          defaultValue={initialValues?.description ?? ""}
          className="rounded-xl border border-ice-200 px-3 py-2"
        />
      </label>
      <ImageAttachmentField
        title={labels.images}
        inputName="imageUrls"
        urlLabel={labels.imageUrlLabel}
        uploadLabel={labels.imageUploadLabel}
        addLabel={labels.imageAddLabel}
        removeLabel={labels.imageRemoveLabel}
        uploadingLabel={labels.imageUploadingLabel}
        initialUrls={imageInitialUrls}
      />
      <label className="flex items-center gap-2 text-xs text-navy-600">
        <input type="checkbox" name="isHidden" defaultChecked={initialValues?.isHidden} />
        {labels.hide}
      </label>
      <button className="rounded-xl bg-navy-700 px-4 py-3 text-sm font-semibold text-white">
        {submitLabel}
      </button>
    </form>
  );
}
