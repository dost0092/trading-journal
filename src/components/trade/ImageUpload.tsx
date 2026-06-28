import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImagePlus, Trash2 } from 'lucide-react'
import type { TradeImage } from '@/types/trade'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  image: TradeImage | null
  onChange: (image: TradeImage | null) => void
}

export function ImageUpload({ image, onChange }: ImageUploadProps) {
  const onDrop = useCallback(
    (accepted: File[]) => {
      const file = accepted[0]
      if (!file) return
      if (image) URL.revokeObjectURL(image.previewUrl)
      onChange({
        id: crypto.randomUUID(),
        name: file.name,
        previewUrl: URL.createObjectURL(file),
      })
    },
    [image, onChange],
  )

  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    multiple: false,
    noClick: !image,
  })

  const remove = () => {
    if (image) URL.revokeObjectURL(image.previewUrl)
    onChange(null)
  }

  if (image) {
    return (
      <div className="flex items-center gap-4 rounded-2xl border border-border bg-secondary/30 p-3">
        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl border border-border bg-card">
          <img src={image.previewUrl} alt="Setup" className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium">{image.name}</p>
          <p className="text-[11px] text-muted">Chart screenshot</p>
        </div>
        <button
          type="button"
          onClick={remove}
          className="rounded-lg p-2 text-muted transition hover:bg-card hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div
      {...getRootProps()}
      onClick={open}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-8 transition-all',
        isDragActive
          ? 'border-primary bg-blue-50/50'
          : 'border-border bg-secondary/20 hover:border-primary/40 hover:bg-blue-50/30',
      )}
    >
      <input {...getInputProps()} />
      <ImagePlus className="mb-2 h-6 w-6 text-muted-foreground" />
      <p className="text-sm font-medium">Upload setup screenshot</p>
      <p className="mt-1 text-xs text-muted">One image · drag or click</p>
    </div>
  )
}
