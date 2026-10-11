import type { FilterOptions, SessionSort } from "@/api/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

/**
 * "Sort: Showtime: earliest first ⌄" (Figma Sort, 276:11448). The labels come
 * from /filter-options and match the design's wording. The open list reuses
 * the select surface; Figma doesn't draw it.
 */
export const SortSelect = ({
  sorts,
  value,
  onChange,
}: {
  sorts: FilterOptions["sorts"]
  value: SessionSort
  onChange: (sort: SessionSort) => void
}) => {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as SessionSort)}>
      {/* The trigger is built for a field frame; here it stands alone. */}
      <SelectTrigger
        aria-label="Sort sessions"
        className="ml-0 h-auto flex-none gap-2 rounded-sm pr-3.5 pl-4 type-button"
      >
        <span className="type-body-m text-muted-foreground">Sort:</span>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end" className="w-auto min-w-(--radix-select-trigger-width)">
        {sorts.map((sort) => (
          <SelectItem key={sort.id} value={sort.id}>
            {sort.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
