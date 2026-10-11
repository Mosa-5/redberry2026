import { CardSmall } from "@/components/cards/card-small"
import { useRecentlyViewed } from "@/lib/recently-viewed"

/**
 * "Recently viewed" on the home page (Figma 302:24332). Shown to guests and
 * signed-in users alike — the team confirmed it is not auth-gated, even
 * though the Figma only places it in the logged-in frame.
 *
 * Renders its own divider so the line disappears with the section.
 */
export const RecentlyViewed = () => {
  const movies = useRecentlyViewed()

  if (movies.length === 0) return null

  return (
    <>
      <section className="flex flex-col gap-5 px-17.5 pt-2.25">
        <h2 className="type-h1 text-foreground">Recently viewed</h2>
        <div className="flex gap-5">
          {movies.map((movie) => (
            <CardSmall key={movie.id} movie={movie} />
          ))}
        </div>
      </section>
      <div className="h-px w-full bg-raised" />
    </>
  )
}
