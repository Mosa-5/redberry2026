import type { MovieDetail } from "@/API/types"
import { fromIsoDate } from "@/lib/dates"

/** "2026-09-04" → "4 September 2026". */
const releaseFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" })

const DetailRow = ({ label, value }: { label: string; value: string }) => {
  return (
    <div className="flex flex-col gap-1.75">
      <p className="type-label-s text-muted-foreground uppercase">{label}</p>
      <p className="type-label-m text-foreground">{value}</p>
    </div>
  )
}

/**
 * The Details column (Figma 148:3970). Genre isn't in the Figma panel but
 * the brief lists it among what the page must show, so it gets a row in
 * the same pattern. Director and cast can be null and are skipped then.
 */
export const MovieDetails = ({ movie }: { movie: MovieDetail }) => {
  return (
    <aside className="flex w-110.25 shrink-0 flex-col gap-4.25 px-6.5">
      <h2 className="type-h2 text-foreground">Details</h2>
      {movie.director && <DetailRow label="Director" value={movie.director} />}
      {movie.cast && <DetailRow label="Main cast" value={movie.cast} />}
      {movie.genres.length > 0 && (
        <DetailRow label="Genre" value={movie.genres.map((genre) => genre.name).join(", ")} />
      )}
      <DetailRow label="Duration" value={`${movie.runtimeMinutes} minutes`} />
      <DetailRow label="Release date" value={releaseFormat.format(fromIsoDate(movie.releaseDate))} />
      {movie.formats.length > 0 && (
        <DetailRow label="Formats" value={movie.formats.map((format) => format.name).join(", ")} />
      )}
      {movie.fromPrice > 0 && <DetailRow label="From" value={`₾${movie.fromPrice}`} />}

      {/* The age rating with its explanation, which the brief requires. */}
      <div className="flex flex-col gap-1.75 rounded-md bg-tint-warning px-3.25 py-2.25 text-warning">
        <p className="type-label-s">RATING NOTE</p>
        <div className="flex items-start gap-1.75">
          <p className="type-label-s">{movie.ageRating.code}</p>
          <p className="flex-1 type-body-s">{movie.ageRating.description}</p>
        </div>
      </div>
    </aside>
  )
}
