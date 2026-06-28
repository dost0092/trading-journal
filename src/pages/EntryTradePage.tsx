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
  const [showForm, setShowForm] = useState(false)
  const [images, setImages] = useState<TradeImage[]>([])
  const { addTrade } = useTrades()
  const navigate = useNavigate()

  const handleSubmit = (data: TradeFormSchema, imgs: TradeImage[]) => {
    addTrade({
      date: data.date,
      time: data.time,
      pair: data.pair,
      session: data.session,
      direction: data.direction,
      riskPercent: data.riskPercent,
      lotSize: data.lotSize,
      entry: data.entry,
      stopLoss: data.stopLoss,
      takeProfit: data.takeProfit,
      result: data.result,
      pnl: data.pnl,
      notes: data.notes,
      strategy: data.strategy,
      criteriaMet: Object.entries(data.criteriaMet)
        .filter(([, v]) => v)
        .map(([k]) => k),
      images: imgs,
    })
    setShowForm(false)
    setImages([])
    navigate('/daily')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted">
            Log a new trade with strategy criteria and chart screenshots.
          </p>
        </div>
        {!showForm && (
          <Button size="lg" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            New Trade
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.25 }}
          >
            <TradeForm
              images={images}
              onImagesChange={setImages}
              onSubmit={handleSubmit}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!showForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card"
        >
          <p className="text-sm text-muted">No form open</p>
          <Button className="mt-4" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4" />
            New Trade
          </Button>
        </motion.div>
      )}
    </div>
  )
}
