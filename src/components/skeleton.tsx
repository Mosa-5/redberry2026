import { cn } from "cn"

/**
 * Placeholder block shown while data loads. The brief asks for skeletons
 * rather than spinners; Figma has no skeleton design, so these are shaped
 * after the real content on the same surfaces.
 *
 * Children are hidden but still take up space: put the real text (or the
 * real component) inside, and the block is exactly as big as what replaces
 * it — no guessing heights.
 */
export const Skeleton = ({ className, children }: { className?: string; children?: React.ReactNode }) => {
  return (
    // flex when wrapping content: a block holding inline text would reserve
    // a full body-sized line box (~24px) instead of the text's own height.
    <div aria-hidden className={cn("animate-pulse rounded-lg bg-raised", children && "flex *:invisible", className)}>
      {children}
    </div>
  )
}
