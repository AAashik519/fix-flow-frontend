import { useEffect, useMemo, useRef, useState } from 'react'
import { Label } from '../ui/label'
import { assetUrl } from '../../lib/utils'

const TILES = {
  sm: 'h-12 w-24 min-h-12 min-w-24 shrink-0 text-xs',
  md: 'h-20 w-24 min-h-20 min-w-24 shrink-0',
}

/**
 * Multi photo picker with local previews, lightbox, and optional existing remote URLs.
 * @param {{ files: File[], onFilesChange: (files: File[]) => void, existingUrls?: string[], onRemoveExisting?: (url: string) => void, max?: number, label?: string, size?: 'sm' | 'md' }} props
 */
export function MultiPhotoPicker({
  files = [],
  onFilesChange,
  existingUrls = [],
  onRemoveExisting,
  max = 10,
  label = 'Photos',
  size = 'sm',
}) {
  const tile = TILES[size] || TILES.md
  const inputRef = useRef(null)
  const [previewSrc, setPreviewSrc] = useState(null)
  const remaining = Math.max(0, max - existingUrls.length - files.length)

  const previews = useMemo(
    () => files.map((file) => ({ file, url: URL.createObjectURL(file) })),
    [files],
  )

  useEffect(() => {
    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.url))
    }
  }, [previews])

  useEffect(() => {
    if (!previewSrc) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setPreviewSrc(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [previewSrc])

  const onSelect = (e) => {
    const selected = Array.from(e.target.files || [])
    if (!selected.length) return
    const next = [...files, ...selected].slice(0, Math.max(0, max - existingUrls.length))
    onFilesChange(next)
    e.target.value = ''
  }

  const removeLocal = (index) => {
    onFilesChange(files.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-2 md:col-span-3">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <span className="text-xs text-ink-500">
          {existingUrls.length + files.length}/{max}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {existingUrls.map((url) => (
          <div key={url} className={`relative overflow-hidden rounded-lg border border-line ${tile}`}>
            <button
              type="button"
              className="h-full w-full"
              onClick={() => setPreviewSrc(assetUrl(url))}
              aria-label="View photo"
            >
              <img src={assetUrl(url)} alt="" className="h-full w-full object-cover" />
            </button>
            {onRemoveExisting ? (
              <button
                type="button"
                className="absolute right-1 top-1 z-10 rounded bg-black/60 px-1.5 text-xs leading-none text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  onRemoveExisting(url)
                }}
              >
                ×
              </button>
            ) : null}
          </div>
        ))}
        {previews.map((p, index) => (
          <div key={p.url} className={`relative overflow-hidden rounded-lg border border-line ${tile}`}>
            <button
              type="button"
              className="h-full w-full"
              onClick={() => setPreviewSrc(p.url)}
              aria-label="View photo"
            >
              <img src={p.url} alt="" className="h-full w-full object-cover" />
            </button>
            <button
              type="button"
              className="absolute right-1 top-1 z-10 rounded bg-black/60 px-1.5 text-xs leading-none text-white"
              onClick={(e) => {
                e.stopPropagation()
                removeLocal(index)
              }}
            >
              ×
            </button>
          </div>
        ))}
        {remaining > 0 ? (
          <button
            type="button"
            className={`${tile} inline-flex items-center justify-center rounded-lg border border-line bg-panel font-medium text-ink-700 hover:bg-brand-50`}
            onClick={() => inputRef.current?.click()}
          >
            + Add
          </button>
        ) : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        className="hidden"
        onChange={onSelect}
      />
      <p className="text-xs text-ink-500">JPEG, PNG, WebP or GIF · up to {max} photos · 5MB each</p>

      {previewSrc ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Photo preview"
          onClick={() => setPreviewSrc(null)}
        >
          <button
            type="button"
            className="absolute right-4 top-4 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-medium text-ink-800 hover:bg-white"
            onClick={() => setPreviewSrc(null)}
          >
            Close
          </button>
          <img
            src={previewSrc}
            alt="Preview"
            className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      ) : null}
    </div>
  )
}
