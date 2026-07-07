import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

interface ImageLightboxProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  src: string
  alt?: string
}

export function ImageLightbox({
  open,
  onOpenChange,
  src,
  alt = 'Trade setup',
}: ImageLightboxProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out" />
        <Dialog.Content
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 outline-none data-[state=open]:animate-in data-[state=closed]:animate-out"
          onClick={() => onOpenChange(false)}
        >
          <Dialog.Close
            className="absolute right-4 top-4 z-[101] rounded-lg bg-black/50 p-2 text-white transition hover:bg-black/70"
            aria-label="Close preview"
            onClick={(e) => e.stopPropagation()}
          >
            <X className="h-5 w-5" />
          </Dialog.Close>

          <img
            src={src}
            alt={alt}
            decoding="async"
            className="max-h-[90vh] max-w-[90vw] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          <Dialog.Title className="sr-only">Image preview</Dialog.Title>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
