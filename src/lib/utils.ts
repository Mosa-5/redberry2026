import { createCn } from "cn/config"

/**
 * clsx + tailwind-merge, taught about our type-* utilities (index.css).
 * Without this, merge doesn't know two type-* classes conflict and keeps
 * both — and the one declared later in the CSS wins regardless of the order
 * in cn(), so `cn("type-label-s", "type-button")` rendered at 12px.
 */
export const cn = createCn({
  extend: {
    classGroups: {
      "type-scale": [
        {
          type: ["display", "h1", "h2", "h3", "button", "label-m", "label-s", "overline", "body-l", "body-m", "body-s"],
        },
      ],
    },
  },
})
