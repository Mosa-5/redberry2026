import { cn } from "cn"

/**
 * Placeholder block shown while data loads. The brief asks for skeletons
 * rather than spinners; Figma has no skeleton design, so these are shaped
 * after the real cards on the same surfaces.
 */
export const Skeleton = ({ className }: { className?: string }) => {
  return <div aria-hidden className={cn("animate-pulse rounded-lg bg-raised", className)} />
}
