import IORedis from 'ioredis'

const REDIS_URL = process.env.REDIS_URL

// Return a real connection only if REDIS_URL is configured
export const redis = REDIS_URL && !REDIS_URL.includes('[')
  ? new IORedis(REDIS_URL, { maxRetriesPerRequest: null })
  : null as unknown as IORedis
