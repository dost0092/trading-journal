import { useEffect, useState } from 'react'
import { TradeForm } from '@/components/trade/TradeForm'
import { DialogRoot } from '@/components/ui/dialog'
import { useTrades } from '@/context/TradeContext'
import { tradeToFormValues } from '@/lib/tradeFormUtils'
import type { TradeFormSchema } from '@/lib/tradeSchema'
import type { TradeEntry, TradeImage } from '@/types/trade'

interface TradeEditDialogProps {
  trade: TradeEntry | null
  onClose: () => void
  onSaved?: () => void
}

export function TradeEditDialog({ trade, onClose, onSaved }: TradeEditDialogProps) {
  const { updateTrade } = useTrades()
  const [image, setImage] = useState<TradeImage | null>(trade?.image ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setImage(trade?.image ?? null)
    setError(null)
  }, [trade?.id, trade?.image])

  async function handleSubmit(data: TradeFormSchema, img: TradeImage | null) {
    if (!trade) return
    setSaving(true)
    setError(null)
    const err = await updateTrade(
      trade.id,
      {
        pair: data.pair,
        date: data.date,
        time: data.time,
        session: data.session,
        direction: data.direction,
        riskPercent: data.riskPercent,
        lotSize: data.lotSize,
        entry: data.entry,
        stopLoss: data.stopLoss,
        takeProfit: data.takeProfit,
        result: data.result,
        strategy: data.strategy,
        rulesMet: Object.entries(data.rulesMet)
          .filter(([, v]) => v)
          .map(([k]) => k),
        ruleLabels: data.ruleLabels,
        remark: data.remark,
      },
      img,
    )
    setSaving(false)
    if (err) {
      setError(err)
      return
    }
    onSaved?.()
    onClose()
  }

  return (
    <DialogRoot
      open={!!trade}
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
      title="Edit trade"
      description={trade?.date}
      className="max-w-3xl"
    >
      {trade && (
        <>
          {error && (
            <p className="mb-4 rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
          )}
          <TradeForm
            key={trade.id}
            initialValues={tradeToFormValues(trade)}
            image={image}
            onImageChange={setImage}
            onSubmit={handleSubmit}
            saving={saving}
            submitLabel="Update trade"
          />
        </>
      )}
    </DialogRoot>
  )
}
