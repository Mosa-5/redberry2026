import type { MovieDetail } from "@/api/types"
import Timer from "@/assets/icons/timer.svg?react"
import { Badge } from "@/components/badge"
import { releaseLabel } from "@/lib/format"

/**
 * The film page header (Figma Banners, 148:3877): the backdrop under a
 * blurred scrim, the poster, and the title block. The navbar sits on top.
 */
export const MovieBanner = ({ movie }: { movie: MovieDetail }) => {
  return (
    <div className="relative h-141.75 w-full overflow-hidden">
      {/* The backdrop is taller than the banner and cropped, as in Figma. */}
      {movie.backdropUrl && (
        <img
          src={movie.backdropUrl}
          alt=""
          className="absolute -top-22.25 left-0 h-265.75 w-full object-cover"
        />
      )}
      <div className="absolute inset-0 bg-scrim/20 backdrop-blur-[5px]" />

      <div className="absolute top-38 left-15 flex items-end gap-8.5">
        <img
          src={movie.posterUrl ?? ""}
          alt=""
          className="h-93.5 w-72.25 shrink-0 rounded-[0.875rem] object-cover shadow-[0_4px_64px_0_var(--shadow-color)]"
        />

        <div className="flex w-145 flex-col items-start gap-3.75 py-2.25">
          <Badge className="bg-tint-red text-primary">
            {movie.isComingSoon ? releaseLabel(movie.releaseDate) : "NOW PLAYING"}
          </Badge>

          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3.75 text-foreground">
              <h1 className="type-display">{movie.title}</h1>
              <p className="w-140 type-body-m">{movie.synopsis}</p>
            </div>

            <div className="flex flex-wrap gap-1.75">
              <Badge className="bg-tint-red text-primary">{movie.ageRating.code}</Badge>
              <Badge className="bg-tint-white text-foreground">
                <Timer className="size-3.5" />
                {movie.runtimeMinutes} Min
              </Badge>
              {movie.formats.map((format) => (
                <Badge key={format.id} className="bg-tint-white text-foreground">
                  {format.name}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
