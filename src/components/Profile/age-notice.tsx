import type { AgeRating } from "@/API/types"

const listFormat = new Intl.ListFormat("en", { type: "disjunction" })

/**
 * Which age ratings the user can book, from the age the API derives from
 * their date of birth (the API docs: "render the eligibility notice without
 * doing date maths on the client"). The brief asks for it; Figma has no
 * design for it, so it's a plain line under the status banner.
 */
export const AgeNotice = ({ age, ratings }: { age: number; ratings: AgeRating[] }) => {
  const blocked = ratings.filter((rating) => rating.minAge > age).map((rating) => rating.code)

  return (
    <p className="type-body-s text-muted-foreground">
      {blocked.length === 0
        ? `You are ${age}, you can buy tickets for all age ratings.`
        : `You are ${age}, you cannot buy tickets for ${listFormat.format(blocked)} titles.`}
    </p>
  )
}
