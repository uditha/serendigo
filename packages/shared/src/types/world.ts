export const WorldType = {
  TASTE: 'TASTE',
  WILD: 'WILD',
  MOVE: 'MOVE',
  ROOTS: 'ROOTS',
  RESTORE: 'RESTORE',
} as const

export type WorldType = (typeof WorldType)[keyof typeof WorldType]

export const WORLD_LABELS: Record<WorldType, string> = {
  TASTE: 'Taste',
  WILD: 'Wild',
  MOVE: 'Move',
  ROOTS: 'Roots',
  RESTORE: 'Restore',
}

export const WORLD_COLORS: Record<WorldType, string> = {
  TASTE: '#E67E22',
  WILD: '#27AE60',
  MOVE: '#2980B9',
  ROOTS: '#8E44AD',
  RESTORE: '#F39C12',
}

export const Province = {
  WESTERN: 'WESTERN',
  CENTRAL: 'CENTRAL',
  SOUTHERN: 'SOUTHERN',
  NORTHERN: 'NORTHERN',
  EASTERN: 'EASTERN',
  NORTH_WESTERN: 'NORTH_WESTERN',
  NORTH_CENTRAL: 'NORTH_CENTRAL',
  UVA: 'UVA',
  SABARAGAMUWA: 'SABARAGAMUWA',
} as const

export type Province = (typeof Province)[keyof typeof Province]

export const PROVINCE_LABELS: Record<Province, string> = {
  WESTERN: 'Western',
  CENTRAL: 'Central',
  SOUTHERN: 'Southern',
  NORTHERN: 'Northern',
  EASTERN: 'Eastern',
  NORTH_WESTERN: 'North Western',
  NORTH_CENTRAL: 'North Central',
  UVA: 'Uva',
  SABARAGAMUWA: 'Sabaragamuwa',
}
