// Photo upload to Cloudflare R2
// R2 is S3-compatible — add @aws-sdk/client-s3 when Cloudflare credentials are ready

export async function uploadPhoto(file: File, userId: string): Promise<string> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID
  const bucket = process.env.CLOUDFLARE_R2_BUCKET
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID
  const secretKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY

  if (!accountId || !bucket || !accessKeyId || !secretKey) {
    if (process.env.NODE_ENV === 'development') {
      // Return a placeholder URL in dev so the endpoint still works
      return `https://placeholder.serendigo.app/captures/${userId}/${Date.now()}.jpg`
    }
    throw new Error('Cloudflare R2 credentials not configured')
  }

  // TODO: sign request with AWS Signature v4 using @aws-sdk/client-s3
  // Example:
  //   import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
  //   const s3 = new S3Client({
  //     region: 'auto',
  //     endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  //     credentials: { accessKeyId, secretAccessKey: secretKey },
  //   })
  //   const key = `captures/${userId}/${Date.now()}-${file.name}`
  //   await s3.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: ... }))
  //   return `https://media.serendigo.app/${key}`

  throw new Error('R2 upload not yet implemented — add @aws-sdk/client-s3')
}
