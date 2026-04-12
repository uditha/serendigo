'use client'
import { useRef, useState } from 'react'
import { Upload, X, Link, Plus, GripVertical } from 'lucide-react'

interface Props {
  name: string
  defaultValues?: string[]
  folder?: string
}

export default function MultiImageUpload({ name, defaultValues = [], folder = 'partners' }: Props) {
  const [urls, setUrls] = useState<string[]>(defaultValues)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [pasteUrl, setPasteUrl] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return }
    if (file.size > 10 * 1024 * 1024) { setError('Image must be under 10MB'); return }

    setUploading(true)
    setError('')

    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)

    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const json = await res.json()
    setUploading(false)

    if (!res.ok || json.error) { setError(json.error ?? 'Upload failed'); return }
    setUrls((prev) => [...prev, json.url])
  }

  const addPastedUrl = () => {
    const trimmed = pasteUrl.trim()
    if (!trimmed) return
    setUrls((prev) => [...prev, trimmed])
    setPasteUrl('')
  }

  const remove = (idx: number) => setUrls((prev) => prev.filter((_, i) => i !== idx))

  return (
    <div className="space-y-3">
      {/* Hidden field carries all URLs into the server action */}
      <textarea
        name={name}
        readOnly
        hidden
        value={urls.join('\n')}
      />

      {/* Thumbnail grid */}
      {urls.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {urls.map((url, i) => (
            <div key={url + i} className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-video">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
              {i === 0 && (
                <span className="absolute top-1 left-1 bg-[#E8832A] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                  Cover
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(i)}
                className="absolute top-1 right-1 bg-white/90 hover:bg-red-50 hover:text-red-500 text-gray-500 rounded-full p-0.5 shadow opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={12} />
              </button>
            </div>
          ))}

          {/* Add more tile */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="aspect-video border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-[#E8832A] hover:text-[#E8832A] transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <div className="w-4 h-4 border-2 border-[#E8832A] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Plus size={16} />
                <span className="text-xs">Add</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Empty state upload button */}
      {urls.length === 0 && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-32 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#E8832A] hover:text-[#E8832A] transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-[#E8832A] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Uploading…</span>
            </>
          ) : (
            <>
              <Upload size={20} />
              <span className="text-sm font-medium">Upload photos</span>
              <span className="text-xs">JPG, PNG, WebP · max 10MB each</span>
            </>
          )}
        </button>
      )}

      {/* Paste URL */}
      <div className="flex gap-2">
        <div className="flex items-center gap-2 flex-1 input py-0 px-2">
          <Link size={13} className="text-gray-400 shrink-0" />
          <input
            type="url"
            placeholder="Or paste an image URL"
            className="flex-1 py-2 text-sm bg-transparent outline-none"
            value={pasteUrl}
            onChange={(e) => setPasteUrl(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPastedUrl() } }}
          />
        </div>
        <button
          type="button"
          onClick={addPastedUrl}
          disabled={!pasteUrl.trim()}
          className="btn-secondary text-sm disabled:opacity-40"
        >
          Add
        </button>
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      {urls.length > 0 && (
        <p className="text-xs text-gray-400">{urls.length} photo{urls.length !== 1 ? 's' : ''} · first photo shown as cover</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) uploadFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
