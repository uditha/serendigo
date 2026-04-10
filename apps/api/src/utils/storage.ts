import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export async function uploadPhoto(file: File, userId: string): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const bucket = process.env.CLOUDFLARE_R2_BUCKET
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
  const secretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY

  // ── Production: upload to Cloudflare R2 ──────────────────────────────────
  if (accountId && bucket && accessKeyId && secretKey) {
    // TODO: sign request with AWS Signature v4 using @aws-sdk/client-s3
    throw new Error('R2 upload not yet implemented — add @aws-sdk/client-s3')
  }

  // ── Development: save to local disk, serve via /uploads route ────────────
  const uploadsDir = join(process.cwd(), 'uploads')
  await mkdir(uploadsDir, { recursive: true })

  const ext = file.name.split('.').pop() ?? 'jpg'
  const filename = `${userId}-${Date.now()}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())
  await writeFile(join(uploadsDir, filename), buffer)

  const apiUrl = process.env.API_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`
  return `${apiUrl}/uploads/${filename}`
}
