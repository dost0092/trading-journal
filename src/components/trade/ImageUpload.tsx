import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImagePlus, RefreshCw, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import type { TradeImage } from '@/types/trade'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  images: TradeImage[]
  onChange: (images: TradeImage[]) => void
}

export function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [dragActive, setDragActive] = useState(false)

  const onDrop = useCallback(
    (accepted: File[]) => {
      const newImages: TradeImage[] = accepted.map((file) => ({
        id: crypto.randomUUID(),
        name: file.name,
        previewUrl: URL.createObjectURL(file),
        type: 'chart',
      }))
      onChange([...images, ...newImages])
    },
    [images, onChange],
  )

  const { getRootProps, getInputProps, open } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    noClick: true,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
  })

  const remove = (id: string) => {
    const img = images.find((i) => i.id === id)
    if (img) URL.revokeObjectURL(img.previewUrl)
    onChange(images.filter((i) => i.id !== id))
  }

  const replace = (id: string) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const old = images.find((i) => i.id === id)
      if (old) URL.revokeObjectURL(old.previewUrl)
      onChange(
        images.map((i) =>
          i.id === id
            ? { ...i, name: file.name, previewUrl: URL.createObjectURL(file) }
            : i,
        ),
      )
    }
    input.click()
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200',
          dragActive
            ? 'border-primary bg-blue-50/50'
            : 'border-border bg-secondary/30 hover:border-primary/40 hover:bg-blue-50/20',
        )}
        onClick={open}
      >
        <input {...getInputProps()} />
        <ImagePlus className="mb-2 h-7 w-7 text-muted-foreground" />
        <p className="text-sm font-medium">Upload Chart Screenshot</p>
        <p className="mt-1 text-xs text-muted">
          Drag & drop or click · Before / After entry
        </p>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          <AnimatePresence>
            {images.map((img) => (
              <motion.div
                key={img.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="group relative"
              >
                <div className="aspect-square overflow-hidden rounded-xl border border-border bg-card shadow-sm transition group-hover:shadow-md">
                  <img
                    src={img.previewUrl}
                    alt={img.name}
                    className="h-full w-full object-cover transition group-hover:scale-105"
                  />
                </div>
                <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 rounded-b-xl bg-black/50 p-1 opacity-0 transition group-hover:opacity-100">
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-white hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation()
                      replace(img.id)
                    }}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-white hover:bg-white/20"
                    onClick={(e) => {
                      e.stopPropagation()
                      remove(img.id)
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
