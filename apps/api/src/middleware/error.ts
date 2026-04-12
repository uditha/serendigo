import type { Context } from 'hono'

export function errorHandler(err: Error, c: Context) {
  console.error('[API Error]', err.message, err.stack)
  const isProd = process.env.NODE_ENV === 'production'
  return c.json(
    {
      success: false,
      error: isProd ? 'Internal server error' : err.message,
    },
    500,
  )
}
