/** "Don't have an account? Sign up" — the footer link between the two dialogs. */
export const SwitchPrompt = ({
  text,
  action,
  onClick,
}: {
  text: string
  action: string
  onClick: () => void
}) => {
  return (
    <p className="flex items-center gap-1.25 type-body-m text-muted-foreground">
      {text}
      <button type="button" onClick={onClick} className="type-button text-primary">
        {action}
      </button>
    </p>
  )
}
