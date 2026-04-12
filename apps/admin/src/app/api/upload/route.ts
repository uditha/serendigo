import { NextRequest, NextResponse } from 'next/server'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { cookies } from 'next/headers'

function getS3(): S3Client | null {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
  const secretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
  if (!accountId || !accessKeyId || !secretKey) return null
  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey: secretKey },
  })
}

export async function POST(req: NextRequest) {
  // Verify admin session
  const jar = await cookies()
  if (jar.get('admin_auth')?.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  const folder = (formData.get('folder') as string) || 'covers'

  if (!file || file.size === 0) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg'
  const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const buffer = Buffer.from(await file.arrayBuffer())

  const s3 = getS3()
  const publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL
  const bucket = process.env.CLOUDFLARE_R2_BUCKET ?? 'serendigo-media'

  if (s3 && publicUrl) {
    await s3.send(new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: buffer,
      ContentType: file.type || 'image/jpeg',
    }))
    return NextResponse.json({ url: `${publicUrl}/${key}` })
  }

  // R2 not configured — return placeholder so admin still works
  return NextResponse.json({
    error: 'R2 not configured. Set CLOUDFLARE_R2_PUBLIC_URL in admin .env to enable uploads.',
  }, { status: 503 })
}
