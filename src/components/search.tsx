import { useState } from "react"
import { Command } from "cmdk"
import { cn } from "cn"

import { Close, MagnifyingGlass, Popcorn } from "@/components/icons"
import { Button } from "@/components/ui/button"

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
  query: string
  onQueryChange: (query: string) => void
  results?: SearchResult[]
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
export function Search({
  query,
  onQueryChange,
  results = [],
  onSelect,
  className,
}: SearchProps) {
  const [open, setOpen] = useState(false)
  const hasQuery = query.length > 0
  const expanded = open || hasQuery
  const showIcon = !(open && !hasQuery)

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
          value={query}
          onValueChange={onQueryChange}
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
            onClick={() => onQueryChange("")}
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
            <EmptyState
              icon={<Popcorn className="size-6" />}
              title="What do you want to watch?"
              body="Search by title, director or cast"
            />
          )}

          {hasQuery && results.length === 0 && (
            <EmptyState
              icon={<MagnifyingGlass className="size-5" />}
              title={`No results for “${query}”`}
              body="Check the spelling or try another film or live event."
            />
          )}

          {hasQuery && results.length > 0 && (
            <>
              <div className="flex items-start justify-between px-2.5 pt-2 pb-1.5 text-muted-foreground">
                <span className="type-overline uppercase">Films &amp; Events</span>
                <span className="type-body-s">
                  {results.length} result{results.length === 1 ? "" : "s"}
                </span>
              </div>

              <Command.List className="flex max-h-85.5 flex-col gap-0.5 overflow-y-auto">
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

function EmptyState({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="flex flex-col items-center gap-1.5 px-6 pt-8 pb-7">
      <span className="grid size-12 place-items-center rounded-full bg-tint-white text-foreground">
        {icon}
      </span>
      <span className="h-2" />
      <p className="type-label-m text-foreground">{title}</p>
      <p className="w-95 text-center type-body-m text-muted-foreground">
        {body}
      </p>
      <span className="h-2.5" />
      <Button variant="transparent" asChild>
        <a href="/sessions">Browse all sessions</a>
      </Button>
    </div>
  )
}

/** Renders the part of the title matching the query in the primary colour. */
function highlight(title: string, query: string) {
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
