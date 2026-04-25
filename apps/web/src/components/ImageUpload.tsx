'use client'

import { useRef, useState } from 'react'

interface Props {
  value: string
  onChange: (url: string) => void
  folder?: string
  label?: string
  hint?: string
  aspectRatio?: '16/9' | '1/1'
}

export default function ImageUpload({
  value,
  onChange,
  folder = 'creator-covers',
  label,
  hint,
  aspectRatio = '16/9',
}: Props) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const height = aspectRatio === '1/1' ? 140 : 160

  async function handleFile(file: File) {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.')
      return
    }
    setUploading(true)
    setError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', folder)
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error ?? 'Upload failed')
      onChange(json.url)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gap: 6 }}>
      {label && (
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' as const, color: 'var(--sg-muted)' }}>
          {label}
        </div>
      )}

      {value ? (
        <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', border: '1.5px solid #E5DDD0', height }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="Cover" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button
            type="button"
            onClick={() => onChange('')}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.92)',
              border: '1px solid #E5DDD0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: 14,
              color: '#A8332A',
              boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
            }}
          >
            ✕
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{
            height,
            border: '2px dashed #E5DDD0',
            borderRadius: 12,
            background: uploading ? '#FAF7F2' : '#fff',
            display: 'flex',
            flexDirection: 'column' as const,
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            cursor: uploading ? 'default' : 'pointer',
            color: 'var(--sg-muted)',
            transition: 'border-color 0.15s',
          }}
        >
          {uploading ? (
            <>
              <span style={{ fontSize: 22 }}>⏳</span>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13 }}>Uploading…</span>
            </>
          ) : (
            <>
              <span style={{ fontSize: 24 }}>📷</span>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, fontWeight: 600 }}>Upload image</span>
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12 }}>JPG, PNG, WebP · max 10MB</span>
            </>
          )}
        </button>
      )}

      {/* URL paste fallback */}
      {!value && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--sg-muted)', flexShrink: 0 }}>or paste URL</span>
          <input
            type="url"
            placeholder="https://…"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{
              flex: 1,
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 13,
              color: '#1A1A2E',
              background: '#fff',
              border: '1.5px solid #E5DDD0',
              borderRadius: 8,
              padding: '8px 12px',
              outline: 'none',
            }}
          />
        </div>
      )}

      {hint && !error && (
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: 'var(--sg-muted)' }}>{hint}</div>
      )}
      {error && (
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: '#A8332A' }}>{error}</div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleFile(file)
          e.target.value = ''
        }}
      />
    </div>
  )
}
