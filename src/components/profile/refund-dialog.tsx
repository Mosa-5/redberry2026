import { isAxiosError } from "axios"
import { useState } from "react"

import type { ApiError, Order } from "@/api/types"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatPrice } from "@/lib/format"
import { useRefundOrder } from "@/reactQuery/mutations/tickets"

/**
 * Confirms a refund before sending it (the brief and the API docs: it can't
 * be undone). Figma has no design for it; it uses the auth modals' surface.
 */
const RefundConfirm = ({ order, onDone }: { order: Order; onDone: () => void }) => {
  const { mutateAsync: refund, isPending } = useRefundOrder()
  const [error, setError] = useState<string | null>(null)
  const seats = order.tickets.map((ticket) => ticket.seatCode).join(", ")

  const confirm = async () => {
    setError(null)
    try {
      await refund(order.reference)
      onDone()
    } catch (failure) {
      // A 422 says why (already refunded, or inside the cutoff); show it.
      const message = isAxiosError<ApiError>(failure) ? failure.response?.data?.message : undefined
      setError(message ?? "Couldn't refund this order. Please try again.")
    }
  }

  return (
    <>
      <DialogHeader className="pr-10">
        <DialogTitle>Refund this order?</DialogTitle>
        <DialogDescription>
          ₾{formatPrice(order.totalPrice)} goes back to your card and seats {seats} go back on sale. This can't be
          undone.
        </DialogDescription>
      </DialogHeader>
      {error && (
        <p role="alert" className="type-label-s text-primary">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-3">
        <Button variant="transparent" onClick={onDone} disabled={isPending}>
          Keep tickets
        </Button>
        <Button onClick={confirm} disabled={isPending}>
          {isPending ? "Refunding…" : "Refund"}
        </Button>
      </div>
    </>
  )
}

/** Open while `order` is set. */
export const RefundDialog = ({ order, onClose }: { order: Order | null; onClose: () => void }) => {
  const onOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  return (
    <Dialog open={order !== null} onOpenChange={onOpenChange}>
      <DialogContent className="w-110">
        {/* Keyed by order so an earlier error doesn't carry over. */}
        {order && <RefundConfirm key={order.id} order={order} onDone={onClose} />}
      </DialogContent>
    </Dialog>
  )
}
