import { useRef, useState } from "react"
import { keepPreviousData } from "@tanstack/react-query"
import { Command } from "cmdk"
import { cn } from "cn"

import type { Movie } from "@/API/types"
import Close from "@/assets/icons/close.svg?react"
import MagnifyingGlass from "@/assets/icons/magnifying-glass.svg?react"
import Popcorn from "@/assets/icons/popcorn.svg?react"
import { Skeleton } from "@/components/skeleton"
import { ErrorMessage, StateMessage } from "@/components/state-message"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/use-debounce"
import { useGetSearch } from "@/reactQuery/query/catalogue"

export type SearchResult = {
  id: string
  title: string
  /** e.g. "Film · 12+ · 134 min" */
  meta: string
  poster: string
  /** e.g. "from ₾16". Omitted when the film is not on sale yet. */
  price?: string
  comingSoon?: boolean
}


type SearchProps = {
  onSelect?: (result: SearchResult) => void
  className?: string
}

/**
 * Navbar search: the field (Figma 332:10366) plus the results panel
 * (326:6262), assembled as in Overlay / Search – Prompt (361:6212).
 *
 * cmdk drives the keyboard behaviour — arrow keys move the selection, Enter
 * fires onSelect. Filtering is off because the server returns the matches.
 */
export const Search = ({ onSelect, className }: SearchProps) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const hasQuery = query.length > 0
  const expanded = open || hasQuery
  const showIcon = !(open && !hasQuery)

  // The /search docs ask for a debounce. Keeping the previous results on
  // screen while the next query loads stops the panel flashing "No results"
  // between keystrokes.
  const debouncedQuery = useDebounce(query, 300)
  const { data: results, isError, refetch } = useGetSearch(
    { queryOptions: { select: toSearchResults, placeholderData: keepPreviousData } },
    debouncedQuery
  )

  return (
    <Command
      shouldFilter={false}
      className={cn("relative", className)}
      onBlur={(event) => {
        // Only close when focus leaves the field and the panel entirely,
        // otherwise clicking a result would close before it registers.
        if (!event.currentTarget.contains(event.relatedTarget as Node)) {
          setOpen(false)
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault()
          setOpen(false)
          ;(event.target as HTMLElement).blur()
        }
      }}
    >
      <div
        className={cn(
          "flex h-10.25 items-center gap-2 rounded-full border border-transparent bg-tint-white py-1.5",
          "transition-[width,padding] duration-200",
          expanded
            ? "w-120 border-tint-white backdrop-blur-[7px]"
            : "w-95",
          showIcon ? "pl-3" : "pl-5.5",
          hasQuery ? "pr-2" : "pr-3"
        )}
      >
        {showIcon && (
          <MagnifyingGlass className="size-3.5 shrink-0 text-foreground" />
        )}

        <Command.Input
          ref={inputRef}
          value={query}
          onValueChange={setQuery}
          onFocus={() => setOpen(true)}
          placeholder="Search films and live events"
          aria-label="Search films and live events"
          className={cn(
            "min-w-0 flex-1 bg-transparent type-body-m text-foreground outline-none",
            open ? "placeholder:text-disabled" : "placeholder:text-foreground"
          )}
        />

        {hasQuery && (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              // The button unmounts as soon as the query is empty, so focus
              // has to go back to the input or it falls to <body> and the
              // panel closes. Clearing should leave you ready to retype.
              inputRef.current?.focus()
            }}
            aria-label="Clear search"
            className="grid size-6 shrink-0 place-items-center rounded-full bg-tint-white text-foreground"
          >
            <Close className="size-2.5" />
          </button>
        )}
      </div>

      {open && (
        <div
          className={cn(
            "absolute top-11.5 left-0 z-50 w-120 rounded-lg border border-raised bg-background p-2 shadow-dropdown",
            // The panel is 480px and the field starts at 380px, so it is held
            // back until the field has finished growing. With a query the
            // field is already wide, so there is nothing to wait for.
            !hasQuery && "animate-[reveal_150ms_ease-out_200ms_backwards]"
          )}
        >
          {!hasQuery && (
            <StateMessage
              icon={<Popcorn className="size-6" />}
              title="What do you want to watch?"
              body="Search by title, director or cast"
              action={browseAction}
              className={panelMessage}
            />
          )}

          {hasQuery && isError && (
            <ErrorMessage
              title="Search isn't working right now"
              onRetry={() => refetch()}
              className={panelMessage}
            />
          )}

          {/* No results yet covers both the debounce wait and the first
              request for a query. Later queries keep the previous results
              on screen instead (keepPreviousData). */}
          {hasQuery && !isError && !results && <SearchSkeleton />}

          {hasQuery && !isError && results?.length === 0 && (
            <StateMessage
              icon={<MagnifyingGlass className="size-5" />}
              title={`No results for “${query}”`}
              body="Check the spelling or try another film or live event."
              action={browseAction}
              className={panelMessage}
            />
          )}

          {hasQuery && !isError && results && results.length > 0 && (
            <>
              <div className="flex items-start justify-between px-2.5 pt-2 pb-1.5 text-muted-foreground">
                <span className="type-overline uppercase">Films &amp; Events</span>
                <span className="type-body-s">
                  {results.length} result{results.length === 1 ? "" : "s"}
                </span>
              </div>

              <Command.List className="scrollbar-thin flex max-h-85.5 flex-col gap-0.5 overflow-y-auto">
                {results.map((result) => (
                  <Command.Item
                    key={result.id}
                    value={result.id}
                    onSelect={() => onSelect?.(result)}
                    className="flex h-18 cursor-pointer items-center gap-3.5 rounded-sm py-2 pr-5 pl-2.5 text-muted-foreground data-[selected=true]:bg-tint-white"
                  >
                    <img
                      src={result.poster}
                      alt=""
                      className="h-14 w-10 shrink-0 rounded-2xs object-cover"
                    />
                    <span className="flex min-w-0 flex-1 flex-col gap-0.75">
                      <span className="truncate type-label-m">
                        {highlight(result.title, query)}
                      </span>
                      <span className="type-body-s">{result.meta}</span>
                    </span>
                    <span
                      className={cn(
                        "shrink-0 type-label-m",
                        result.comingSoon ? "text-warning" : "text-foreground"
                      )}
                    >
                      {result.comingSoon ? "Coming Soon" : result.price}
                    </span>
                  </Command.Item>
                ))}
              </Command.List>
            </>
          )}
        </div>
      )}
    </Command>
  )
}

// Module-level so the reference is stable; React Query reruns `select`
// whenever it receives a new function.
const toSearchResults = (movies: Movie[]): SearchResult[] =>
  movies.map((movie) => ({
    id: movie.id.toString(),
    title: movie.title,
    meta: `${movie.kind} · ${movie.ageRating.code} · ${movie.runtimeMinutes} min`,
    poster: movie.posterUrl || "",
    price: movie.fromPrice ? `from ₾${movie.fromPrice}` : undefined,
    comingSoon: movie.isComingSoon,
  }))

const panelMessage = "px-6 pt-8 pb-7"

const browseAction = (
  <Button variant="transparent" asChild>
    <a href="/sessions">Browse all sessions</a>
  </Button>
)

/** Three rows shaped like results: poster, title and meta lines, price. */
const SearchSkeleton = () => {
  return (
    <div aria-busy className="flex flex-col gap-0.5 pt-9">
      {Array.from({ length: 3 }, (_, index) => (
        <div key={index} className="flex h-18 items-center gap-3.5 py-2 pr-5 pl-2.5">
          <Skeleton className="h-14 w-10 shrink-0 rounded-2xs" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-3.5 w-14" />
        </div>
      ))}
    </div>
  )
}

/** Renders the part of the title matching the query in the primary colour. */
const highlight = (title: string, query: string) => {
  const at = title.toLowerCase().indexOf(query.toLowerCase())
  if (!query || at < 0) return title

  return (
    <>
      {title.slice(0, at)}
      <span className="text-foreground">{title.slice(at, at + query.length)}</span>
      {title.slice(at + query.length)}
    </>
  )
}
