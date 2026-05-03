'use client'

import { useRef, useState, useTransition } from 'react'
import { updateCreatorProfile } from '../actions'
import type { Creator } from '@/db/schema'

export default function ProfileForm({ creator }: { creator: Creator }) {
  const [photo, setPhoto] = useState(creator.photo ?? '')
  const [bio, setBio] = useState(creator.bio ?? '')
  const [instagram, setInstagram] = useState(creator.instagram ?? '')
  const [website, setWebsite] = useState(creator.website ?? '')
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [banner, setBanner] = useState<{ ok: boolean; message: string } | null>(null)
  const [pending, startTransition] = useTransition()
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleAvatarFile(file: File) {
    if (!file.type.startsWith('image/')) { setUploadError('Please select an image file.'); return }
    if (file.size > 10 * 1024 * 1024) { setUploadError('Image must be under 10MB.'); return }
    setUploading(true)
    setUploadError('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('folder', 'creator-photos')
      const res = await fetch('/api/upload', { method: 'POST', body: fd })
      const json = await res.json()
      if (!res.ok || json.error) throw new Error(json.error ?? 'Upload failed')
      setPhoto(json.url)
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  function handleSave() {
    const fd = new FormData()
    fd.append('photo', photo)
    fd.append('bio', bio)
    fd.append('instagram', instagram)
    fd.append('website', website)
    startTransition(async () => {
      const result = await updateCreatorProfile(fd)
      setBanner({ ok: result.ok, message: result.ok ? (result.message ?? 'Saved.') : ('error' in result ? result.error : 'Error') })
      setTimeout(() => setBanner(null), 3500)
    })
  }

  const initials = creator.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', display: 'grid', gap: 32 }}>

      {/* Avatar */}
      <section style={{ background: '#fff', border: '1px solid var(--sg-border-subtle)', borderRadius: 20, padding: 28, boxShadow: 'var(--sg-shadow-card)' }}>
        <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: 'var(--sg-ink)', marginBottom: 20 }}>Profile photo</h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          {/* Circle avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: '50%',
                overflow: 'hidden',
                background: photo ? 'transparent' : 'var(--sg-primary)',
                border: '3px solid var(--sg-border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={photo} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, color: '#fff' }}>{initials}</span>
              )}
            </div>
            {photo && (
              <button
                type="button"
                onClick={() => setPhoto('')}
                title="Remove photo"
                style={{
                  position: 'absolute',
                  top: -4,
                  right: -4,
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: '#fff',
                  border: '1.5px solid #E5DDD0',
                  fontSize: 11,
                  color: '#A8332A',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                }}
              >
                ✕
              </button>
            )}
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                padding: '9px 18px',
                borderRadius: 100,
                background: uploading ? 'var(--sg-border-subtle)' : 'var(--sg-primary)',
                color: uploading ? 'var(--sg-muted)' : '#fff',
                border: 'none',
                cursor: uploading ? 'default' : 'pointer',
              }}
            >
              {uploading ? 'Uploading…' : photo ? 'Change photo' : 'Upload photo'}
            </button>
            <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: 'var(--sg-muted)' }}>
              JPG, PNG, WebP · max 10MB
            </span>
            {uploadError && (
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: '#A8332A' }}>{uploadError}</span>
            )}
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleAvatarFile(file)
            e.target.value = ''
          }}
        />
      </section>

      {/* Bio + social */}
      <section style={{ background: '#fff', border: '1px solid var(--sg-border-subtle)', borderRadius: 20, padding: 28, boxShadow: 'var(--sg-shadow-card)' }}>
        <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 22, color: 'var(--sg-ink)', marginBottom: 20 }}>About you</h2>

        <div style={{ display: 'grid', gap: 18 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span style={labelStyle}>Bio</span>
            <textarea
              value={bio}
              onChange={e => setBio(e.target.value)}
              rows={4}
              placeholder="Tell travellers a little about yourself…"
              style={{ ...inputStyle, resize: 'vertical' as const }}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={labelStyle}>Instagram</span>
            <input
              type="text"
              value={instagram}
              onChange={e => setInstagram(e.target.value)}
              placeholder="@yourhandle"
              style={inputStyle}
            />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span style={labelStyle}>Website</span>
            <input
              type="url"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              placeholder="https://…"
              style={inputStyle}
            />
          </label>
        </div>
      </section>

      {/* Save */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'flex-end' }}>
        {banner && (
          <span
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 13,
              color: banner.ok ? '#1e7a42' : '#A8332A',
              background: banner.ok ? 'rgba(39,174,96,0.10)' : 'rgba(231,76,60,0.10)',
              border: `1px solid ${banner.ok ? 'rgba(39,174,96,0.25)' : 'rgba(231,76,60,0.25)'}`,
              padding: '8px 14px',
              borderRadius: 100,
            }}
          >
            {banner.message}
          </span>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={pending || uploading}
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 15,
            fontWeight: 700,
            padding: '13px 28px',
            borderRadius: 100,
            background: pending ? 'var(--sg-border-subtle)' : 'var(--sg-primary)',
            color: pending ? 'var(--sg-muted)' : '#fff',
            border: 'none',
            cursor: pending ? 'default' : 'pointer',
            boxShadow: pending ? 'none' : 'var(--sg-glow-accent)',
          }}
        >
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'Space Grotesk, sans-serif',
  fontSize: 12,
  fontWeight: 700,
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  color: 'var(--sg-muted)',
}

const inputStyle: React.CSSProperties = {
  fontFamily: 'Space Grotesk, sans-serif',
  fontSize: 14,
  color: '#1A1A2E',
  background: '#fff',
  border: '1.5px solid #E5DDD0',
  borderRadius: 10,
  padding: '10px 14px',
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}
