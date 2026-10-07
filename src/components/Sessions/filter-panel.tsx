import { cn } from "@/lib/utils"

import type { SessionFilters } from "@/API/requests/Sessions"
import type { FilterOptions, TimeBand } from "@/API/types"
import CheckboxChecked from "@/assets/icons/checkbox-checked.svg?react"
import { MovieRow } from "@/components/movie-row"
import { Skeleton } from "@/components/skeleton"
import { fromIsoDate, nextDays } from "@/lib/dates"

const weekdayFormat = new Intl.DateTimeFormat("en-GB", { weekday: "short" })

/** Adds or removes one value from a multi-select filter. */
const toggle = <T extends string>(values: T[], value: T) =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value]

/** "Morning (before 12:00)" → ["Morning", "before 12:00"], for the design's "Morning · before 12:00". */
const splitLabel = (label: string): [string, string | undefined] => {
  const match = label.match(/^(.*?)\s*\((.*)\)$/)
  return match ? [match[1], match[2].replace(" - ", "–")] : [label, undefined]
}

/** Checkbox row (Figma Check row): a real checkbox, drawn as the Figma box. */
const CheckRow = ({
  label,
  detail,
  checked,
  onChange,
}: {
  label: string
  detail?: string
  checked: boolean
  onChange: () => void
}) => {
  return (
    <label className="flex cursor-pointer items-center gap-2.5">
      <input type="checkbox" checked={checked} onChange={onChange} className="peer sr-only" />
      <span className="grid size-4.5 shrink-0 place-items-center rounded-[0.3125rem] peer-focus-visible:ring-2 peer-focus-visible:ring-disabled">
        {checked ? (
          <CheckboxChecked className="size-4.5" />
        ) : (
          <span className="size-4.5 rounded-[0.3125rem] border-[1.5px] border-disabled" />
        )}
      </span>
      <span className="flex items-center gap-1.25 whitespace-nowrap">
        <span className="type-label-m text-foreground">{label}</span>
        {detail && <span className="type-body-s text-muted-foreground">· {detail}</span>}
      </span>
    </label>
  )
}

const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => {
  return (
    <div role="group" aria-label={title} className="flex flex-col gap-3">
      <p className="type-overline text-muted-foreground uppercase">{title}</p>
      {children}
    </div>
  )
}

const Divider = () => <div className="h-px w-full shrink-0 bg-raised" />

/**
 * The panel's sections while /filter-options loads, at the real sizes: the
 * same titles (hidden text), 18px rows, date tiles and dividers, so the
 * panel doesn't change height when the lists arrive. Row counts are what
 * the API returns today (4 venues, 5 formats, 4 languages, 3 time bands).
 */
const FilterPanelSkeleton = () => {
  const rows = (count: number, widths: string[]) =>
    Array.from({ length: count }, (_, index) => (
      <Skeleton key={index} className={cn("h-4.5 rounded-sm", widths[index % widths.length])} />
    ))
  const title = (text: string) => (
    <Skeleton className="w-fit rounded-sm">
      <p className="type-overline uppercase">{text}</p>
    </Skeleton>
  )

  return (
    <>
      <div className="flex flex-col gap-3">
        {title("Venue")}
        {rows(4, ["w-40", "w-44", "w-32", "w-48"])}
      </div>
      <Divider />
      <div className="flex flex-col gap-3">
        {title("Date")}
        <div className="flex gap-1.5 overflow-hidden">
          {Array.from({ length: 7 }, (_, index) => (
            <Skeleton key={index} className="h-13.5 w-9.25 shrink-0 rounded-xs" />
          ))}
        </div>
      </div>
      <Divider />
      <div className="flex flex-col gap-3">
        {title("Format")}
        {rows(5, ["w-24", "w-16", "w-20", "w-28", "w-20"])}
      </div>
      <Divider />
      <div className="flex flex-col gap-3">
        {title("Language")}
        {rows(4, ["w-32", "w-40", "w-44", "w-28"])}
      </div>
      <Divider />
      <div className="flex flex-col gap-3">
        {title("Time of day")}
        {rows(3, ["w-40", "w-44", "w-36"])}
      </div>
      <Divider />
    </>
  )
}

type FilterPanelProps = {
  options: FilterOptions | undefined
  filters: SessionFilters
  activeCount: number
  update: (changes: Partial<SessionFilters>) => void
}

/** Sticky filter sidebar (Figma Filter sidebar, 276:9233). */
export const FilterPanel = ({ options, filters, activeCount, update }: FilterPanelProps) => {
  const days = nextDays(7)

  // The brief: with venues picked, show only the formats those venues have.
  const selectedVenues = options?.venues.filter((venue) => filters.venues.includes(venue.slug)) ?? []
  const availableFormats = selectedVenues.length
    ? options?.formats.filter((format) =>
        selectedVenues.some((venue) => venue.formats.some((offered) => offered.slug === format.slug))
      )
    : options?.formats

  const toggleVenue = (slug: string) => {
    const venues = toggle(filters.venues, slug)
    const picked = options?.venues.filter((venue) => venues.includes(venue.slug)) ?? []
    // Drop any chosen format the new venue set doesn't have (the API docs' rule).
    const formats = picked.length
      ? filters.formats.filter((format) =>
          picked.some((venue) => venue.formats.some((offered) => offered.slug === format))
        )
      : filters.formats
    update({ venues, formats })
  }

  return (
    // Sticky, and scrollable inside when taller than the window: once scaled
    // the panel is longer than a 1080px screen.
    <aside className="sticky top-6 flex max-h-[calc(100vh-3rem)] flex-col gap-6 overflow-y-auto rounded-lg bg-card p-6 scrollbar-brand">
      <h2 className="type-h3 text-foreground">Filters</h2>

      {!options ? (
        <FilterPanelSkeleton />
      ) : (
        <>
          <FilterSection title="Venue">
            {options.venues.map((venue) => (
              <CheckRow
                key={venue.id}
                label={venue.name}
                detail={venue.city}
                checked={filters.venues.includes(venue.slug)}
                onChange={() => toggleVenue(venue.slug)}
              />
            ))}
          </FilterSection>
          <Divider />

          <FilterSection title="Date">
            {/* Tiles exactly as Figma (Days_Small, 37×54). Seven are wider than
                the panel, so the row is a draggable carousel rather than
                clipping Sunday. No faded edge: the fade is page-coloured and
                the panel is bg/card. */}
            <MovieRow gap={6} fade={false}>
              {days.map((date) => {
                const day = fromIsoDate(date)
                const selected = date === filters.date
                return (
                  <button
                    key={date}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => update({ date })}
                    className={cn(
                      "flex h-13.5 w-9.25 shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xs px-1.5 py-2.5 type-label-s text-foreground shadow-card",
                      selected ? "bg-primary" : "bg-raised hover:bg-card"
                    )}
                  >
                    <span>{weekdayFormat.format(day)}</span>
                    <span>{day.getDate()}</span>
                  </button>
                )
              })}
            </MovieRow>
          </FilterSection>
          <Divider />

          <FilterSection title="Format">
            {availableFormats?.map((format) => (
              <CheckRow
                key={format.id}
                label={format.name}
                checked={filters.formats.includes(format.slug)}
                onChange={() => update({ formats: toggle(filters.formats, format.slug) })}
              />
            ))}
          </FilterSection>
          <Divider />

          <FilterSection title="Language">
            {options.languages.map((language) => (
              <CheckRow
                key={language.id}
                label={language.name}
                checked={filters.languages.includes(language.slug)}
                onChange={() => update({ languages: toggle(filters.languages, language.slug) })}
              />
            ))}
          </FilterSection>
          <Divider />

          <FilterSection title="Time of day">
            {options.timeBands.map((band) => {
              const [name, detail] = splitLabel(band.label)
              return (
                <CheckRow
                  key={band.id}
                  label={name}
                  detail={detail}
                  checked={filters.bands.includes(band.id)}
                  onChange={() => update({ bands: toggle<TimeBand>(filters.bands, band.id) })}
                />
              )
            })}
          </FilterSection>
          <Divider />
        </>
      )}

      <div className="flex flex-col items-center gap-3">
        {/* Only offered when there is something to clear, as in the filtered design. */}
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => update({ venues: [], formats: [], languages: [], bands: [] })}
            className="w-full cursor-pointer rounded-full border border-muted-foreground px-3 py-2.25 type-label-s text-foreground hover:bg-tint-white"
          >
            Clear filters
          </button>
        )}
        <p className="type-body-s text-muted-foreground">
          {activeCount} {activeCount === 1 ? "filter" : "filters"} active
        </p>
      </div>
    </aside>
  )
}
