'use server'
import { db } from '@/db'
import { arcs, chapters } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createId } from '@paralleldrive/cuid2'

function slugify(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function createArc(formData: FormData) {
  const title = formData.get('title') as string
  const worldType = formData.get('worldType') as string
  const province = formData.get('province') as string
  const narratorName = (formData.get('narratorName') as string) || null
  const introText = (formData.get('introText') as string) || null
  const coverImage = (formData.get('coverImage') as string) || null

  const [arc] = await db.insert(arcs).values({
    id: createId(),
    title,
    slug: slugify(title),
    worldType,
    province,
    narratorName,
    introText,
    coverImage,
    isPublished: false,
    isSeasonal: false,
  }).returning()

  revalidatePath('/arcs')
  redirect(`/arcs/${arc.id}`)
}

export async function updateArc(id: string, formData: FormData) {
  const title = formData.get('title') as string
  const worldType = formData.get('worldType') as string
  const province = formData.get('province') as string
  const narratorName = (formData.get('narratorName') as string) || null
  const introText = (formData.get('introText') as string) || null
  const coverImage = (formData.get('coverImage') as string) || null

  await db.update(arcs).set({
    title,
    slug: slugify(title),
    worldType,
    province,
    narratorName,
    introText,
    coverImage,
    updatedAt: new Date(),
  }).where(eq(arcs.id, id))

  revalidatePath('/arcs')
  revalidatePath(`/arcs/${id}`)
}

export async function togglePublished(id: string, current: boolean) {
  await db.update(arcs).set({
    isPublished: !current,
    updatedAt: new Date(),
  }).where(eq(arcs.id, id))

  revalidatePath('/arcs')
  revalidatePath(`/arcs/${id}`)
}

export async function deleteArc(id: string) {
  await db.delete(chapters).where(eq(chapters.arcId, id))
  await db.delete(arcs).where(eq(arcs.id, id))
  revalidatePath('/arcs')
  redirect('/arcs')
}
