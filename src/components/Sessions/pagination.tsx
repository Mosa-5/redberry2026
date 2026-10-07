import { cn } from "@/lib/utils"

import ChevronLeft from "@/assets/icons/chevron-left.svg?react"

/**
 * Page numbers to show: the first, the last, and the current one with its
 * neighbours, with "…" for the gaps — 1 2 3 … 10 as in the design.
 */
const pageItems = (current: number, last: number): (number | "gap")[] => {
  const pages = [...new Set([1, current - 1, current, current + 1, last])]
    .filter((page) => page >= 1 && page <= last)
    .sort((a, b) => a - b)

  return pages.flatMap((page, index) => (index > 0 && page - pages[index - 1] > 1 ? ["gap" as const, page] : [page]))
}

const arrowClass =
  "grid size-10 cursor-pointer place-items-center rounded-full bg-card hover:bg-raised disabled:pointer-events-none disabled:opacity-40"

/**
 * Pagination (Figma 429:7088). The numbers are Poppins in Figma, the only
 * Poppins in the file; they use the app's Archivo at the same size.
 */
export const Pagination = ({
  current,
  last,
  onChange,
}: {
  current: number
  last: number
  onChange: (page: number) => void
}) => {
  return (
    <nav aria-label="Pages" className="flex items-center gap-2">
      <button type="button" aria-label="Previous page" disabled={current <= 1} onClick={() => onChange(current - 1)} className={arrowClass}>
        <ChevronLeft className="size-4" />
      </button>

      {pageItems(current, last).map((item, index) =>
        item === "gap" ? (
          <span key={`gap-${index}`} className="grid size-10 place-items-center type-label-m text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            aria-label={`Page ${item} of ${last}`}
            aria-current={item === current ? "page" : undefined}
            onClick={() => onChange(item)}
            className={cn(
              "grid size-10 cursor-pointer place-items-center rounded-full type-label-m",
              item === current ? "bg-primary text-foreground" : "text-muted-foreground hover:bg-raised"
            )}
          >
            {item}
          </button>
        )
      )}

      <button type="button" aria-label="Next page" disabled={current >= last} onClick={() => onChange(current + 1)} className={arrowClass}>
        <ChevronLeft className="size-4 rotate-180" />
      </button>
    </nav>
  )
}
