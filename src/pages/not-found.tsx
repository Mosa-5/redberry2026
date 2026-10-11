import { Link } from "react-router"

import Popcorn from "@/assets/icons/popcorn.svg?react"
import { StateMessage } from "@/components/state-message"
import { Button } from "@/components/ui/button"

/**
 * Any path no route matches. Not in Figma; it reuses the film page's
 * "Film not found" layout so an unknown URL never renders a blank page.
 */
const NotFound = () => {
  return (
    <div className="grid min-h-141.75 place-items-center pt-27.75">
      <StateMessage
        icon={<Popcorn className="size-6" />}
        title="Page not found"
        body="The link may be wrong, or the page no longer exists."
        action={
          <Button variant="transparent" asChild>
            <Link to="/">Back to home</Link>
          </Button>
        }
      />
    </div>
  )
}

export default NotFound
