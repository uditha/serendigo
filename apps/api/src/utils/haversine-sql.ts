import { sql, type SQL } from 'drizzle-orm'
import type { AnyPgColumn } from 'drizzle-orm/pg-core'

/** Great-circle distance in metres on WGS84 sphere (no PostGIS). */
export function haversineMeters(
  lat1: AnyPgColumn,
  lng1: AnyPgColumn,
  lat2: number,
  lng2: number,
): SQL {
  return sql`(
    6371000 * acos(
      least(1::float8, greatest(-1::float8,
        cos(radians(${lat1})) * cos(radians(${lat2})) *
        cos(radians(${lng1}) - radians(${lng2})) +
        sin(radians(${lat1})) * sin(radians(${lat2}))
      ))
    )
  )`
}

/** Same as haversineMeters but all four coordinates are bound literals (e.g. capture vs chapter). */
export function haversineMetersLiterals(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): SQL {
  return sql`(
    6371000 * acos(
      least(1::float8, greatest(-1::float8,
        cos(radians(${lat1})) * cos(radians(${lat2})) *
        cos(radians(${lng1}) - radians(${lng2})) +
        sin(radians(${lat1})) * sin(radians(${lat2}))
      ))
    )
  )`
}
