'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { eq, and } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { db } from '@/db'
import { creators, arcSubmissions, type ChapterDraft } from '@/db/schema'
import { setSession, clearSession, getCurrentCreator, requireApprovedCreator } from '@/lib/auth'

// ─── helpers ──────────────────────────────────────────────────────────────
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60)
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base || 'creator'
  let n = 1
  while (true) {
    const hit = await db.select({ id: creators.id }).from(creators).where(eq(creators.slug, slug)).limit(1)
    if (hit.length === 0) return slug
    n += 1
    slug = `${base}-${n}`
  }
}

export type ActionResult =
  | { ok: true; message?: string }
  | { ok: false; error: string }

// ─── public: apply to become a creator ────────────────────────────────────
export async function applyAsCreator(formData: FormData): Promise<ActionResult> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const province = String(formData.get('province') ?? '').trim() || null
  const instagram = String(formData.get('instagram') ?? '').trim() || null
  const website = String(formData.get('website') ?? '').trim() || null
  const bio = String(formData.get('bio') ?? '').trim() || null
  const applicationNote = String(formData.get('applicationNote') ?? '').trim() || null
  const password = String(formData.get('password') ?? '')

  if (!name || !email || !password) return { ok: false, error: 'Name, email, and password are required.' }
  if (password.length < 8) return { ok: false, error: 'Password must be at least 8 characters.' }
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: 'Please enter a valid email address.' }

  const existing = await db.select({ id: creators.id }).from(creators).where(eq(creators.email, email)).limit(1)
  if (existing.length > 0) return { ok: false, error: 'An application with this email already exists.' }

  const slug = await uniqueSlug(slugify(name))
  const passwordHash = await bcrypt.hash(password, 10)

  await db.insert(creators).values({
    name,
    email,
    slug,
    passwordHash,
    bio,
    province,
    instagram,
    website,
    applicationNote,
    status: 'pending',
  })

  return { ok: true, message: 'Application received — we review within 3–5 days.' }
}

// ─── public: login ────────────────────────────────────────────────────────
export async function loginCreator(formData: FormData): Promise<ActionResult> {
  const email = String(formData.get('email') ?? '').trim().toLowerCase()
  const password = String(formData.get('password') ?? '')
  if (!email || !password) return { ok: false, error: 'Email and password are required.' }

  const rows = await db.select().from(creators).where(eq(creators.email, email)).limit(1)
  const c = rows[0]
  if (!c || !c.passwordHash) return { ok: false, error: 'Invalid email or password.' }

  const valid = await bcrypt.compare(password, c.passwordHash)
  if (!valid) return { ok: false, error: 'Invalid email or password.' }

  if (c.status === 'pending') return { ok: false, error: 'Your application is still under review.' }
  if (c.status === 'rejected') return { ok: false, error: 'Your application was not approved.' }
  if (c.status === 'suspended') return { ok: false, error: 'This account is suspended.' }

  await setSession(c.id)
  return { ok: true }
}

export async function logoutCreator() {
  await clearSession()
  redirect('/creators/login')
}

// ─── authed: save or submit a draft ───────────────────────────────────────
type SaveDraftInput = {
  id?: string
  title: string
  tagline?: string
  worldType: string
  province: string
  narrativeHook?: string
  coverImage?: string
  chapters: ChapterDraft[]
  submit?: boolean
}

export async function saveArcDraft(input: SaveDraftInput): Promise<ActionResult & { id?: string }> {
  let creator
  try {
    creator = await requireApprovedCreator()
  } catch {
    return { ok: false, error: 'Not authorized.' }
  }

  const { id, title, tagline, worldType, province, narrativeHook, coverImage, chapters, submit } = input
  if (!title?.trim()) return { ok: false, error: 'Title is required.' }
  if (!worldType) return { ok: false, error: 'World type is required.' }
  if (!province) return { ok: false, error: 'Province is required.' }
  if (!Array.isArray(chapters) || chapters.length < 1) return { ok: false, error: 'At least one chapter is required.' }

  if (submit) {
    if (chapters.length < 1) return { ok: false, error: 'Submissions require at least 1 chapter.' }
    for (const ch of chapters) {
      if (!ch.title?.trim() || !ch.task?.trim()) return { ok: false, error: 'Every chapter needs a title and task.' }
      if (!Number.isFinite(ch.lat) || !Number.isFinite(ch.lng)) {
        return { ok: false, error: 'Every chapter needs GPS coordinates.' }
      }
    }
  }

  const now = new Date()
  const status = submit ? 'submitted' : 'draft'

  if (id) {
    // ensure ownership
    const existing = await db
      .select()
      .from(arcSubmissions)
      .where(and(eq(arcSubmissions.id, id), eq(arcSubmissions.creatorId, creator.id)))
      .limit(1)
    if (existing.length === 0) return { ok: false, error: 'Submission not found.' }
    if (existing[0].status === 'approved' || existing[0].status === 'published') {
      return { ok: false, error: 'This submission can no longer be edited.' }
    }

    await db
      .update(arcSubmissions)
      .set({
        title: title.trim(),
        tagline: tagline?.trim() || null,
        worldType,
        province,
        narrativeHook: narrativeHook?.trim() || null,
        coverImage: coverImage?.trim() || null,
        chapters,
        status,
        submittedAt: submit ? now : existing[0].submittedAt,
        updatedAt: now,
      })
      .where(eq(arcSubmissions.id, id))

    revalidatePath('/creators/dashboard')
    return { ok: true, id, message: submit ? 'Submitted for review.' : 'Draft saved.' }
  }

  const [row] = await db
    .insert(arcSubmissions)
    .values({
      creatorId: creator.id,
      title: title.trim(),
      tagline: tagline?.trim() || null,
      worldType,
      province,
      narrativeHook: narrativeHook?.trim() || null,
      coverImage: coverImage?.trim() || null,
      chapters,
      status,
      submittedAt: submit ? now : null,
    })
    .returning({ id: arcSubmissions.id })

  revalidatePath('/creators/dashboard')
  return { ok: true, id: row.id, message: submit ? 'Submitted for review.' : 'Draft saved.' }
}

export async function deleteDraft(id: string): Promise<ActionResult> {
  let creator
  try {
    creator = await requireApprovedCreator()
  } catch {
    return { ok: false, error: 'Not authorized.' }
  }
  const rows = await db
    .select()
    .from(arcSubmissions)
    .where(and(eq(arcSubmissions.id, id), eq(arcSubmissions.creatorId, creator.id)))
    .limit(1)
  if (rows.length === 0) return { ok: false, error: 'Not found.' }
  if (rows[0].status !== 'draft' && rows[0].status !== 'rejected') {
    return { ok: false, error: 'Only drafts and rejected submissions can be deleted.' }
  }
  await db.delete(arcSubmissions).where(eq(arcSubmissions.id, id))
  revalidatePath('/creators/dashboard')
  return { ok: true }
}

export { getCurrentCreator }
