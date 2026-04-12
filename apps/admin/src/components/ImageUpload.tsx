'use client'
import { useRef, useState } from 'react'
import { Upload, X, ImageIcon } from 'lucide-react'

interface Props {
  name: string
  defaultValue?: string | null
  folder?: string
  label?: string
}

export default function ImageUpload({ name, defaultValue, folder = 'covers', label = 'Cover Image' }: Props) {
  const [url, setUrl] = useState<string>(defaultValue ?? '')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB')
      return
    }

    setUploading(true)
    setError('')

    const fd = new FormData()
    fd.append('file', file)
    fd.append('folder', folder)

    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const json = await res.json()

    setUploading(false)

    if (!res.ok || json.error) {
      setError(json.error ?? 'Upload failed')
      return
    }

    setUrl(json.url)
  }

  return (
    <div className="space-y-2">
      <label className="label">{label}</label>

      {/* Hidden input carries the URL into the server action FormData */}
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Cover" className="w-full h-48 object-cover" />
          <button
            type="button"
            onClick={() => setUrl('')}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white rounded-full p-1 shadow text-gray-600 hover:text-red-500 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-36 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#E8832A] hover:text-[#E8832A] transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <div className="w-5 h-5 border-2 border-[#E8832A] border-t-transparent rounded-full animate-spin" />
              <span className="text-sm">Uploading…</span>
            </>
          ) : (
            <>
              <Upload size={20} />
              <span className="text-sm font-medium">Upload image</span>
              <span className="text-xs">JPG, PNG, WebP · max 10MB</span>
            </>
          )}
        </button>
      )}

      {/* Paste URL fallback */}
      {!url && (
        <div className="flex gap-2 items-center">
          <ImageIcon size={14} className="text-gray-400 shrink-0" />
          <input
            type="url"
            placeholder="Or paste an image URL"
            className="input text-sm flex-1"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
