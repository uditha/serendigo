'use client'
import { useEffect, useState } from 'react'
import { DISTRICT_PATHS } from '@/data/sriLankaDistricts'

const ALL_DISTRICTS = Object.keys(DISTRICT_PATHS)

/* ── Province → district mapping ───────────────────────────────────── */
const PROVINCE_DISTRICTS: Record<string, string[]> = {
  western:       ['Colombo', 'Gampaha', 'Kaḷutara'],
  central:       ['Kandy', 'Matale', 'Nuwara Eliya'],
  southern:      ['Galle', 'Matara', 'Hambantota'],
  northern:      ['Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu'],
  eastern:       ['Batticaloa', 'Ampara', 'Trincomalee'],
  north_western: ['Kurunegala', 'Puttalam'],
  north_central: ['Anuradhapura', 'Polonnaruwa'],
  uva:           ['Badulla', 'Moneragala'],
  sabaragamuwa:  ['Ratnapura', 'Kegalle'],
}

const PROVINCE_IDS = Object.keys(PROVINCE_DISTRICTS)

/* ── Province colors ────────────────────────────────────────────────── */
const PROVINCE_COLORS: Record<string, string> = {
  western:       '#B85C1A',
  central:       '#2D6E4E',
  southern:      '#1A5F8A',
  northern:      '#614A9E',
  eastern:       '#1A6B7A',
  north_western: '#5E8C6E',
  north_central: '#8E44AD',
  uva:           '#1d7dc8',
  sabaragamuwa:  '#C0392B',
}

interface Props {
  activeProvinces?: string[]
  animated?: boolean        // sequences through provinces with glow
  allLit?: boolean          // all provinces fully lit
  goldenBorder?: boolean    // golden running-line trace around all borders
  width?: number
  height?: number
  className?: string
  style?: React.CSSProperties
}

export default function SriLankaMap({
  activeProvinces = [],
  animated = false,
  allLit = false,
  goldenBorder = false,
  width = 160,
  height = 282,
  className,
  style,
}: Props) {
  const [seqIndex, setSeqIndex] = useState(0)

  /* Sequential province highlight — cycles every 1.8s */
  useEffect(() => {
    if (!animated) return
    const id = setInterval(() => {
      setSeqIndex((i) => (i + 1) % PROVINCE_IDS.length)
    }, 1800)
    return () => clearInterval(id)
  }, [animated])

  /* ── Golden border mode ─────────────────────────────────────────── */
  if (goldenBorder) {
    return (
      <svg
        width={width}
        height={height}
        viewBox="0 0 449.68774 792.54926"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ strokeLinejoin: 'round', strokeLinecap: 'round', ...style }}
        className={className}
      >
        {/* Base island fill */}
        <g>
          {ALL_DISTRICTS.map((name) => {
            const d = DISTRICT_PATHS[name]
            if (!d) return null
            return (
              <path
                key={`base-${name}`}
                d={d}
                fill="rgba(26,107,122,0.12)"
                stroke="rgba(29,125,200,0.4)"
                strokeWidth={0.6}
              />
            )
          })}
        </g>

        {/* Running golden line layer */}
        <g style={{ filter: 'drop-shadow(0 0 4px #1d7dc8) drop-shadow(0 0 10px rgba(29,125,200,0.45))' }}>
          {ALL_DISTRICTS.map((name, i) => {
            const d = DISTRICT_PATHS[name]
            if (!d) return null
            return (
              <path
                key={`gold-${name}`}
                d={d}
                fill="none"
                stroke="#1d7dc8"
                strokeWidth={1.4}
                strokeLinecap="round"
                strokeDasharray="560 40"
                style={{
                  animation: 'goldenTrace 6s linear infinite',
                  animationDelay: `${-(i * 0.22)}s`,
                }}
              />
            )
          })}
        </g>
      </svg>
    )
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 449.68774 792.54926"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ strokeLinejoin: 'round', strokeLinecap: 'round', ...style }}
      className={className}
    >
      {PROVINCE_IDS.map((provinceId, idx) => {
        const districts = PROVINCE_DISTRICTS[provinceId]
        const color     = PROVINCE_COLORS[provinceId] ?? '#888'
        const isActive  = activeProvinces.includes(provinceId) || allLit
        const isSeq     = animated && seqIndex === idx

        /* three visual states */
        let fill: string
        let stroke: string
        let glow: string

        if (isActive || isSeq) {
          fill   = `${color}CC`
          stroke = color
          glow   = `drop-shadow(0 0 14px ${color}) drop-shadow(0 0 6px ${color})`
        } else if (animated) {
          fill   = `${color}30`
          stroke = `${color}55`
          glow   = 'none'
        } else {
          fill   = `${color}50`
          stroke = `${color}99`
          glow   = 'none'
        }

        return (
          <g
            key={provinceId}
            style={{ filter: glow, transition: 'filter 0.6s ease' }}
          >
            {districts.map((name) => {
              const d = DISTRICT_PATHS[name]
              if (!d) return null
              return (
                <path
                  key={name}
                  d={d}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth={isActive || isSeq ? 1.2 : 0.8}
                  style={{ transition: 'fill 0.6s ease, stroke 0.6s ease, stroke-width 0.6s ease' }}
                />
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}
