import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { auth } from './lib/auth'
import { errorHandler } from './middleware/error'
import { startWorkers } from './jobs'
import arcRoutes from './routes/arcs'
import captureRoutes from './routes/capture'
import passportRoutes from './routes/passport'

const app = new Hono<{ Variables: { userId: string } }>()

// Global middleware
app.use('*', logger())
app.use(
  '*',
  cors({
    origin: process.env.CORS_ORIGIN ?? '*',
    credentials: true,
  }),
)

// Health check
app.get('/health', (c) =>
  c.json({ status: 'ok', timestamp: new Date().toISOString() }),
)

// Today endpoint
app.get('/api/today', (c) => {
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  return c.json({
    success: true,
    data: { greeting, location: 'Colombo' },
  })
})

// Better Auth handles all /api/auth/* routes
app.on(['GET', 'POST'], '/api/auth/**', (c) => auth.handler(c.req.raw))

// API routes
app.route('/api/arcs', arcRoutes)
app.route('/api/capture', captureRoutes)
app.route('/api/passport', passportRoutes)

// Error + 404 handlers
app.onError(errorHandler)
app.notFound((c) => c.json({ success: false, error: 'Not found' }, 404))

// Start background workers (skip if Redis not configured)
const redisUrl = process.env.REDIS_URL
if (redisUrl && !redisUrl.includes('[')) {
  startWorkers().catch(console.error)
} else {
  console.warn('[Jobs] REDIS_URL not configured — workers disabled')
}

export default {
  port: parseInt(process.env.PORT ?? '3000'),
  fetch: app.fetch,
}
