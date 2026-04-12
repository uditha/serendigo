'use client'
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
  sabaragamuwa:  '#2D6E4E',
}

/* ── Build a reverse lookup: district name → province id ────────────── */
const DISTRICT_TO_PROVINCE: Record<string, string> = {}
for (const [province, districts] of Object.entries(PROVINCE_DISTRICTS)) {
  for (const district of districts) {
    DISTRICT_TO_PROVINCE[district] = province
  }
}

interface Props {
  activeProvinces?: string[]
  width?: number
  height?: number
  className?: string
}

export default function SriLankaMap({
  activeProvinces = [],
  width = 160,
  height = 282,
  className,
}: Props) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 449.68774 792.54926"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ strokeLinejoin: 'round', strokeLinecap: 'round' }}
      className={className}
    >
      {Object.entries(PROVINCE_DISTRICTS).map(([provinceId, districts]) => {
        const color = PROVINCE_COLORS[provinceId] ?? '#888888'
        const isActive = activeProvinces.includes(provinceId)

        return (
          <g
            key={provinceId}
            style={{
              filter: isActive ? `drop-shadow(0 0 8px ${color})` : 'none',
              transition: 'filter 0.4s ease',
            }}
          >
            {districts.map((districtName) => {
              const pathData = DISTRICT_PATHS[districtName]
              if (!pathData) return null
              return (
                <path
                  key={districtName}
                  d={pathData}
                  fill={isActive ? `${color}B3` : `${color}40`}
                  stroke={isActive ? color : `${color}99`}
                  strokeWidth={0.8}
                  style={{
                    transition: 'fill 0.4s ease, filter 0.4s ease',
                  }}
                />
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}
