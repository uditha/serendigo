// Convert GPS coordinates to SVG viewBox coordinates
// Source SVG geoViewBox: "79.649879 9.836125 81.878908 5.918161"
// Format: minLng maxLat maxLng minLat (west north east south)

const GEO_MIN_LNG = 79.649879
const GEO_MAX_LNG = 81.878908
const GEO_MIN_LAT = 5.918161
const GEO_MAX_LAT = 9.836125

const SVG_WIDTH = 449.68774
const SVG_HEIGHT = 792.54926

export function geoToSvg(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - GEO_MIN_LNG) / (GEO_MAX_LNG - GEO_MIN_LNG)) * SVG_WIDTH
  // Lat is inverted — higher lat = lower y in SVG
  const y = ((GEO_MAX_LAT - lat) / (GEO_MAX_LAT - GEO_MIN_LAT)) * SVG_HEIGHT
  return { x, y }
}
