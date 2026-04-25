'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { ChapterDraft } from '@/db/schema'
import { saveArcDraft, deleteDraft } from '../actions'
import ImageUpload from '@/components/ImageUpload'

const WORLD_TYPES = [
  { id: 'TASTE',    label: 'Taste',    color: '#E67E22' },
  { id: 'WILD',     label: 'Wild',     color: '#27AE60' },
  { id: 'MOVE',     label: 'Move',     color: '#2980B9' },
  { id: 'ROOTS',    label: 'Roots',    color: '#8E44AD' },
  { id: 'RESTORE',  label: 'Restore',  color: '#F39C12' },
]

const PROVINCES = [
  'WESTERN', 'CENTRAL', 'SOUTHERN', 'NORTHERN', 'EASTERN',
  'NORTH_WESTERN', 'NORTH_CENTRAL', 'UVA', 'SABARAGAMUWA',
]

type Props = {
  initial?: {
    id: string
    title: string
    tagline: string | null
    worldType: string
    province: string
    narrativeHook: string | null
    coverImage: string | null
    chapters: ChapterDraft[]
    status: string
    adminFeedback: string | null
  }
  readOnly?: boolean
}

type PolishField = 'narrativeHook' | { type: 'chapterLore'; index: number }

export default function SubmitForm({ initial, readOnly }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [notice, setNotice] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null)
  const [polishing, setPolishing] = useState<string | null>(null)

  const [title, setTitle] = useState(initial?.title ?? '')
  const [tagline, setTagline] = useState(initial?.tagline ?? '')
  const [worldType, setWorldType] = useState(initial?.worldType ?? 'TASTE')
  const [province, setProvince] = useState(initial?.province ?? 'WESTERN')
  const [narrativeHook, setNarrativeHook] = useState(initial?.narrativeHook ?? '')
  const [coverImage, setCoverImage] = useState(initial?.coverImage ?? '')
  const [chapters, setChapters] = useState<ChapterDraft[]>(
    initial?.chapters?.length ? initial.chapters : [emptyChapter()],
  )

  function updateChapter(index: number, patch: Partial<ChapterDraft>) {
    setChapters((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)))
  }
  function addChapter() {
    setChapters((prev) => [...prev, emptyChapter()])
  }
  function removeChapter(index: number) {
    setChapters((prev) => prev.filter((_, i) => i !== index))
  }
  function moveChapter(index: number, dir: -1 | 1) {
    setChapters((prev) => {
      const next = [...prev]
      const swap = index + dir
      if (swap < 0 || swap >= next.length) return prev
      ;[next[index], next[swap]] = [next[swap], next[index]]
      return next
    })
  }

  async function onPolish(field: PolishField) {
    const key = typeof field === 'string' ? field : `chapter-${field.index}`
    setPolishing(key)
    try {
      let kind: 'narrativeHook' | 'chapterLore'
      let text: string
      let context: Record<string, unknown>
      if (field === 'narrativeHook') {
        kind = 'narrativeHook'
        text = narrativeHook
        context = { title, worldType, province }
      } else {
        kind = 'chapterLore'
        const ch = chapters[field.index]
        text = ch.lore ?? ''
        context = { arcTitle: title, chapterTitle: ch.title, task: ch.task, worldType }
      }
      if (!text.trim()) {
        setNotice({ kind: 'err', text: 'Write something first — the polish works on existing text.' })
        return
      }
      const res = await fetch('/api/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kind, text, context }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? 'Polish failed')
      if (field === 'narrativeHook') setNarrativeHook(json.text)
      else updateChapter(field.index, { lore: json.text })
      setNotice({ kind: 'ok', text: 'Polished.' })
    } catch (e) {
      setNotice({ kind: 'err', text: e instanceof Error ? e.message : 'Polish failed.' })
    } finally {
      setPolishing(null)
    }
  }

  function save(submit: boolean) {
    setNotice(null)
    startTransition(async () => {
      const res = await saveArcDraft({
        id: initial?.id,
        title,
        tagline,
        worldType,
        province,
        narrativeHook,
        coverImage,
        chapters,
        submit,
      })
      if (!res.ok) {
        setNotice({ kind: 'err', text: res.error })
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      if (submit) {
        router.push('/creators/dashboard')
        return
      }
      // draft save: stay on page, update URL if new
      setNotice({ kind: 'ok', text: res.message ?? 'Saved.' })
      if (!initial?.id && res.id) {
        router.replace(`/creators/submit/${res.id}`)
      }
      router.refresh()
    })
  }

  async function onDelete() {
    if (!initial?.id) return
    if (!confirm('Delete this submission? This cannot be undone.')) return
    const res = await deleteDraft(initial.id)
    if (res.ok) router.push('/creators/dashboard')
    else setNotice({ kind: 'err', text: res.error })
  }

  const isSubmittedReadOnly = readOnly && initial?.status === 'submitted'
  const isLocked = readOnly && (initial?.status === 'approved' || initial?.status === 'published')

  return (
    <div style={{ display: 'grid', gap: 24 }}>
      {initial?.status === 'rejected' && initial.adminFeedback && (
        <div
          style={{
            background: 'rgba(231,76,60,0.08)',
            border: '1px solid rgba(231,76,60,0.25)',
            borderRadius: 12,
            padding: 16,
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 14,
            color: '#A8332A',
          }}
        >
          <strong>Editor feedback:</strong> {initial.adminFeedback}
        </div>
      )}

      {isSubmittedReadOnly && (
        <div
          style={{
            background: 'rgba(29,125,200,0.08)',
            border: '1px solid rgba(29,125,200,0.25)',
            borderRadius: 12,
            padding: 16,
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 14,
            color: '#135a94',
          }}
        >
          This arc is in review. You can still make edits; they will be included when we look at it.
        </div>
      )}

      {isLocked && (
        <div
          style={{
            background: 'rgba(39,174,96,0.08)',
            border: '1px solid rgba(39,174,96,0.25)',
            borderRadius: 12,
            padding: 16,
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 14,
            color: '#1e7a42',
          }}
        >
          This arc has been {initial?.status}. Contact us if something needs to change.
        </div>
      )}

      <Section title="The arc" subtitle="The big picture — what makes this journey worth taking.">
        <Field label="Title" required>
          <input value={title} onChange={(e) => setTitle(e.target.value)} style={INPUT} disabled={isLocked} />
        </Field>
        <Field label="Tagline" hint="One line a traveller sees on the arc card. Keep it evocative.">
          <input value={tagline} onChange={(e) => setTagline(e.target.value)} style={INPUT} disabled={isLocked} />
        </Field>
        <Row>
          <Field label="World" required>
            <select value={worldType} onChange={(e) => setWorldType(e.target.value)} style={INPUT} disabled={isLocked}>
              {WORLD_TYPES.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Province" required>
            <select value={province} onChange={(e) => setProvince(e.target.value)} style={INPUT} disabled={isLocked}>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </Field>
        </Row>
        {isLocked ? (
          <Field label="Cover image">
            {coverImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={coverImage} alt="Cover" style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 12 }} />
            ) : (
              <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: 'var(--sg-muted)' }}>No cover image</span>
            )}
          </Field>
        ) : (
          <ImageUpload
            value={coverImage}
            onChange={setCoverImage}
            folder="creator-covers"
            label="Cover image"
            hint="Shown on the arc card. Landscape works best."
            aspectRatio="16/9"
          />
        )}
        <FieldWithPolish
          label="Narrative hook"
          hint="Two or three sentences that open the arc. Shown on the arc detail screen."
          onPolish={() => onPolish('narrativeHook')}
          polishing={polishing === 'narrativeHook'}
          disabled={isLocked}
        >
          <textarea
            value={narrativeHook}
            onChange={(e) => setNarrativeHook(e.target.value)}
            rows={4}
            style={{ ...INPUT, resize: 'vertical', minHeight: 120 }}
            disabled={isLocked}
          />
        </FieldWithPolish>
      </Section>

      <Section
        title={`Chapters (${chapters.length})`}
        subtitle="Each chapter is one location. Travellers unlock them in order, visiting the GPS point and completing the task."
      >
        <div style={{ display: 'grid', gap: 16 }}>
          {chapters.map((c, i) => (
            <div
              key={i}
              style={{
                background: '#fff',
                border: '1px solid var(--sg-border-subtle)',
                borderRadius: 16,
                padding: 20,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: '#1d7dc8' }}>
                  Chapter {i + 1}
                </span>
                {!isLocked && (
                  <div style={{ display: 'flex', gap: 6 }}>
                    <MiniBtn onClick={() => moveChapter(i, -1)} disabled={i === 0}>↑</MiniBtn>
                    <MiniBtn onClick={() => moveChapter(i, 1)} disabled={i === chapters.length - 1}>↓</MiniBtn>
                    <MiniBtn onClick={() => removeChapter(i)} disabled={chapters.length === 1}>Remove</MiniBtn>
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gap: 14 }}>
                <Field label="Chapter title" required>
                  <input value={c.title} onChange={(e) => updateChapter(i, { title: e.target.value })} style={INPUT} disabled={isLocked} />
                </Field>
                <Field label="Task" required hint="What should the traveller do at this location? One sentence.">
                  <input value={c.task} onChange={(e) => updateChapter(i, { task: e.target.value })} style={INPUT} disabled={isLocked} />
                </Field>
                <Row>
                  <Field label="Latitude" required>
                    <input
                      type="number"
                      step="any"
                      value={Number.isFinite(c.lat) ? c.lat : ''}
                      onChange={(e) => updateChapter(i, { lat: parseFloat(e.target.value) })}
                      style={INPUT}
                      disabled={isLocked}
                    />
                  </Field>
                  <Field label="Longitude" required>
                    <input
                      type="number"
                      step="any"
                      value={Number.isFinite(c.lng) ? c.lng : ''}
                      onChange={(e) => updateChapter(i, { lng: parseFloat(e.target.value) })}
                      style={INPUT}
                      disabled={isLocked}
                    />
                  </Field>
                </Row>
                <Row>
                  <Field label="Coin reward" hint="Default: 50">
                    <input
                      type="number"
                      min={0}
                      value={c.coinReward ?? ''}
                      onChange={(e) => updateChapter(i, { coinReward: e.target.value === '' ? undefined : parseInt(e.target.value) })}
                      style={INPUT}
                      disabled={isLocked}
                    />
                  </Field>
                  <Field label="XP category" hint="Leave blank to match the arc's world.">
                    <input
                      value={c.xpCategory ?? ''}
                      onChange={(e) => updateChapter(i, { xpCategory: e.target.value || undefined })}
                      style={INPUT}
                      disabled={isLocked}
                    />
                  </Field>
                </Row>
                {isLocked ? (
                  <Field label="Chapter cover image">
                    {c.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.coverImage} alt="Chapter cover" style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 10 }} />
                    ) : null}
                  </Field>
                ) : (
                  <ImageUpload
                    value={c.coverImage ?? ''}
                    onChange={(url) => updateChapter(i, { coverImage: url || undefined })}
                    folder="creator-chapters"
                    label="Chapter cover image"
                    aspectRatio="16/9"
                  />
                )}
                <FieldWithPolish
                  label="Lore"
                  hint="The story fragment revealed after the capture. Make it earn the visit."
                  onPolish={() => onPolish({ type: 'chapterLore', index: i })}
                  polishing={polishing === `chapter-${i}`}
                  disabled={isLocked}
                >
                  <textarea
                    value={c.lore ?? ''}
                    onChange={(e) => updateChapter(i, { lore: e.target.value })}
                    rows={4}
                    style={{ ...INPUT, resize: 'vertical', minHeight: 110 }}
                    disabled={isLocked}
                  />
                </FieldWithPolish>
              </div>
            </div>
          ))}
        </div>

        {!isLocked && (
          <button
            type="button"
            onClick={addChapter}
            style={{
              marginTop: 16,
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 14,
              fontWeight: 600,
              padding: '12px 20px',
              borderRadius: 100,
              background: '#fff',
              border: '1.5px dashed var(--sg-border-strong)',
              color: 'var(--sg-ink)',
              cursor: 'pointer',
            }}
          >
            + Add chapter
          </button>
        )}
      </Section>

      {!isLocked && (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            position: 'sticky',
            bottom: 16,
            background: '#fff',
            border: '1px solid var(--sg-border-subtle)',
            borderRadius: 20,
            padding: 16,
            boxShadow: 'var(--sg-shadow-card)',
          }}
        >
          {notice && (
            <div
              style={{
                background: notice.kind === 'ok' ? 'rgba(39,174,96,0.08)' : 'rgba(231,76,60,0.08)',
                border: `1px solid ${notice.kind === 'ok' ? 'rgba(39,174,96,0.3)' : 'rgba(231,76,60,0.3)'}`,
                color: notice.kind === 'ok' ? '#1e7a42' : '#A8332A',
                padding: '10px 14px',
                borderRadius: 10,
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 14,
              }}
            >
              {notice.text}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => save(false)}
              disabled={pending}
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 600,
                fontSize: 14,
                background: '#fff',
                border: '1px solid var(--sg-border-strong)',
                color: 'var(--sg-ink)',
                padding: '12px 24px',
                borderRadius: 100,
                cursor: pending ? 'default' : 'pointer',
                opacity: pending ? 0.7 : 1,
              }}
            >
              Save draft
            </button>
            <button
              type="button"
              onClick={() => save(true)}
              disabled={pending}
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontWeight: 700,
                fontSize: 14,
                background: 'var(--sg-primary)',
                border: 'none',
                color: '#fff',
                padding: '12px 28px',
                borderRadius: 100,
                cursor: pending ? 'default' : 'pointer',
                opacity: pending ? 0.7 : 1,
                boxShadow: 'var(--sg-glow-accent)',
              }}
            >
              {pending ? 'Working…' : 'Submit for review'}
            </button>
          </div>
          {initial?.id && (initial.status === 'draft' || initial.status === 'rejected') && (
            <button
              type="button"
              onClick={onDelete}
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 13,
                background: 'transparent',
                border: 'none',
                color: '#A8332A',
                cursor: 'pointer',
              }}
            >
              Delete draft
            </button>
          )}
          </div>
        </div>
      )}

      <div>
        <Link href="/creators/dashboard" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, color: 'var(--sg-muted)' }}>
          ← Back to dashboard
        </Link>
      </div>
    </div>
  )
}

function emptyChapter(): ChapterDraft {
  return { title: '', task: '', lore: '', lat: NaN, lng: NaN }
}

// ─── small bits ───────────────────────────────────────────────────────────
function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        background: '#fff',
        border: '1px solid var(--sg-border-subtle)',
        borderRadius: 24,
        padding: 28,
        boxShadow: 'var(--sg-shadow-card)',
      }}
    >
      <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 24, color: 'var(--sg-ink)' }}>{title}</h2>
      {subtitle && (
        <p style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, color: 'var(--sg-muted)', marginTop: 4, marginBottom: 20 }}>
          {subtitle}
        </p>
      )}
      <div style={{ display: 'grid', gap: 16, marginTop: subtitle ? 0 : 20 }}>{children}</div>
    </section>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>{children}</div>
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label style={{ display: 'block', fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--sg-muted)', marginBottom: 6 }}>
        {label}
        {required && <span style={{ color: '#1d7dc8', marginLeft: 4 }}>*</span>}
      </label>
      {children}
      {hint && (
        <div style={{ marginTop: 4, fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: 'var(--sg-muted)' }}>
          {hint}
        </div>
      )}
    </div>
  )
}

function FieldWithPolish({
  label,
  hint,
  children,
  onPolish,
  polishing,
  disabled,
}: {
  label: string
  hint?: string
  children: React.ReactNode
  onPolish: () => void
  polishing: boolean
  disabled?: boolean
}) {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <label style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', color: 'var(--sg-muted)' }}>
          {label}
        </label>
        {!disabled && (
          <button
            type="button"
            onClick={onPolish}
            disabled={polishing}
            style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 12,
              fontWeight: 600,
              background: 'rgba(29,125,200,0.1)',
              border: '1px solid rgba(29,125,200,0.3)',
              color: '#135a94',
              padding: '4px 12px',
              borderRadius: 100,
              cursor: polishing ? 'default' : 'pointer',
              opacity: polishing ? 0.6 : 1,
            }}
          >
            {polishing ? 'Polishing…' : '✨ AI polish'}
          </button>
        )}
      </div>
      {children}
      {hint && (
        <div style={{ marginTop: 4, fontFamily: 'Space Grotesk, sans-serif', fontSize: 12, color: 'var(--sg-muted)' }}>
          {hint}
        </div>
      )}
    </div>
  )
}

function MiniBtn({ onClick, disabled, children }: { onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: 'Space Grotesk, sans-serif',
        fontSize: 12,
        background: disabled ? '#f5f2ea' : '#fff',
        border: '1px solid var(--sg-border-strong)',
        color: disabled ? '#b5b2a8' : 'var(--sg-ink)',
        padding: '4px 10px',
        borderRadius: 100,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  )
}

const INPUT: React.CSSProperties = {
  width: '100%',
  fontFamily: 'Space Grotesk, sans-serif',
  fontSize: 15,
  color: '#1A1A2E',
  background: '#fff',
  border: '1.5px solid #E5DDD0',
  borderRadius: 12,
  padding: '12px 16px',
  outline: 'none',
  boxSizing: 'border-box',
}
