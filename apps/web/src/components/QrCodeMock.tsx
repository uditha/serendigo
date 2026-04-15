'use client'

import { useEffect, useState } from 'react'

const GRID = 9
/** At least six clearly different faux-QR layouts (deterministic salts). */
const VARIANT_COUNT = 6
const VARIANT_SALTS = [
  1_103_515_245, 2_654_435_769, 982_451_653, 1_572_963_157, 3_141_592_653, 1_618_033_989,
] as const

const DRIFT_MS = 880
const VARIANT_MS = 4_200

const CELL_TRANSITION =
  'opacity 1.35s cubic-bezier(0.45, 0, 0.15, 1), transform 1.35s cubic-bezier(0.45, 0, 0.15, 1)'

function cellFilled(i: number, variant: number, drift: number): boolean {
  const row = Math.floor(i / GRID)
  const col = i % GRID
  const isCornerBlock =
    (row < 3 && col < 3) || (row < 3 && col > 5) || (row > 5 && col < 3)
  const isCornerInner =
    (row === 1 && col === 1) || (row === 1 && col === 7) || (row === 7 && col === 1)
  if (isCornerInner) return false
  if (isCornerBlock && !isCornerInner) return true

  const salt = VARIANT_SALTS[variant % VARIANT_COUNT]
  const phase =
    drift * 5 +
    variant * 1_337 +
    (i % 19) * 7 +
    row * 11 +
    col * 13
  const mixed =
    i * 7919 +
    row * 271 +
    col * 193 +
    salt +
    phase * 1_664_523 +
    (phase * phase * 17) % 999_983
  const bit = (mixed >>> 0) & 1
  return bit === 0
}

/** Faux QR: 6 distinct layouts on a slow cycle + gentle per-cell drift (SSR-safe). */
export default function QrCodeMock() {
  const [variant, setVariant] = useState(0)
  const [drift, setDrift] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const driftId = window.setInterval(() => {
      setDrift((d) => (d + 1) % 50_000)
    }, DRIFT_MS)
    const variantId = window.setInterval(() => {
      setVariant((v) => (v + 1) % VARIANT_COUNT)
    }, VARIANT_MS)
    return () => {
      window.clearInterval(driftId)
      window.clearInterval(variantId)
    }
  }, [])

  return (
    <div className="mb-5 flex w-full justify-center">
      <div
        aria-hidden
        className="w-[168px] shrink-0"
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${GRID}, minmax(0, 1fr))`,
          gap: 3,
        }}
      >
        {Array.from({ length: GRID * GRID }, (_, i) => {
          const filled = cellFilled(i, variant, drift)
          return (
            <div
              key={i}
              style={{
                width: '100%',
                aspectRatio: '1',
                borderRadius: 2,
                background: filled ? 'var(--sg-ink)' : 'transparent',
                opacity: filled ? 0.9 : 0,
                transform: filled ? 'scale(1)' : 'scale(0.92)',
                transition: CELL_TRANSITION,
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
