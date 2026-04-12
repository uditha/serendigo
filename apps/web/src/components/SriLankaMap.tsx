'use client'
import { useEffect, useState } from 'react'
import { DISTRICT_PATHS } from '@/data/sriLankaDistricts'

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
  uva:           '#E8832A',
  sabaragamuwa:  '#C0392B',
}

interface Props {
  activeProvinces?: string[]
  animated?: boolean        // sequences through provinces with glow
  allLit?: boolean          // all provinces fully lit
  width?: number
  height?: number
  className?: string
  style?: React.CSSProperties
}

export default function SriLankaMap({
  activeProvinces = [],
  animated = false,
  allLit = false,
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
          fill   = `${color}CC`          // 80% opacity — vivid
          stroke = color
          glow   = `drop-shadow(0 0 14px ${color}) drop-shadow(0 0 6px ${color})`
        } else if (animated) {
          fill   = `${color}30`          // dim while others glow
          stroke = `${color}55`
          glow   = 'none'
        } else {
          fill   = `${color}50`          // default
          stroke = `${color}99`
          glow   = 'none'
        }

        return (
          <g
            key={provinceId}
            style={{
              filter: glow,
              transition: 'filter 0.6s ease',
            }}
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
