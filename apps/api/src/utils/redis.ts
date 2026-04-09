import IORedis from 'ioredis'

// maxRetriesPerRequest: null is required by BullMQ
export const redis = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
})
