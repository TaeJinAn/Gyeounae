import Link from "next/link";

export type FilterOption = {
  value: string;
  label: string;
};

export type FilterChipsProps = {
  title: string;
  options: FilterOption[];
  selected?: string;
  hrefFor: (value?: string) => string;
  allLabel: string;
};

export function FilterChips({
  title,
  options,
  selected,
  hrefFor,
  allLabel
}: FilterChipsProps) {
  if (options.length === 0) {
    return null;
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-navy-600">
        {title}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Link
          href={hrefFor()}
          className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs ${
            selected ? "border-ice-200 text-navy-500" : "border-navy-600 bg-navy-600 text-white"
          }`}
        >
          {allLabel}
        </Link>
        {options.map((option) => {
          const active = option.value === selected;
          return (
            <Link
              key={option.value}
              href={hrefFor(option.value)}
              className={`whitespace-nowrap rounded-full border px-3 py-1 text-xs ${
                active
                  ? "border-navy-600 bg-navy-600 text-white"
                  : "border-ice-200 text-navy-600"
              }`}
            >
              {option.label}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
