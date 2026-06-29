import { useState } from 'react'
import { Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { TradeForm } from '@/components/trade/TradeForm'
import { useTrades } from '@/context/TradeContext'
import type { TradeFormSchema } from '@/lib/tradeSchema'
import type { TradeImage } from '@/types/trade'

export function EntryTradePage() {
  const [showForm, setShowForm] = useState(true)
  const [image, setImage] = useState<TradeImage | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { addTrade } = useTrades()
  const navigate = useNavigate()

  const handleSubmit = async (data: TradeFormSchema, img: TradeImage | null) => {
    setSaving(true)
    setError(null)
    const err = await addTrade(
      {
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
      },
      img,
    )
    setSaving(false)
    if (err) {
      setError(err)
      return
    }
    setImage(null)
    navigate('/daily')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8 py-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">XAU/USD · Gold only</p>
        </div>
        {!showForm && (
          <Button size="lg" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            New Trade
          </Button>
        )}
      </div>

      {error && (
        <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <TradeForm
              image={image}
              onImageChange={setImage}
              onSubmit={handleSubmit}
              saving={saving}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
