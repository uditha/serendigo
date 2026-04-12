import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

let _s3: S3Client | null = null

function getS3(): S3Client | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
  const secretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY

  if (!accountId || !accessKeyId || !secretKey) return null

  if (!_s3) {
    _s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey: secretKey },
    })
  }
  return _s3
}

export async function uploadFile(file: File, folder: string = 'uploads'): Promise<string> {
  const s3 = getS3()
  const bucket = process.env.CLOUDFLARE_R2_BUCKET ?? 'serendigo-media'
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL

  if (s3 && publicUrl) {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'image/jpeg',
    }))

    return `${publicUrl}/${key}`
  }

  // ── Dev fallback: save locally, serve via /uploads route ─────────────────
  const uploadsDir = join(process.cwd(), 'uploads')
  await mkdir(uploadsDir, { recursive: true })
  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const filename = `${folder}-${Date.now()}.${ext}`
  await writeFile(join(uploadsDir, filename), Buffer.from(await file.arrayBuffer()))
  const apiUrl = process.env.API_BASE_URL ?? `http://localhost:${process.env.PORT ?? 3000}`
  return `${apiUrl}/uploads/${filename}`
}

// Keep backward-compat alias used by capture service
export async function uploadPhoto(file: File, userId: string): Promise<string> {
  return uploadFile(file, `captures/${userId}`)
}
