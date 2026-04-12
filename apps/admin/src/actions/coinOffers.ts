'use server'
import { db } from '@/db'
import { coinOffers } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { createId } from '@paralleldrive/cuid2'

export async function createCoinOffer(formData: FormData) {
  await db.insert(coinOffers).values({
    id: createId(),
    partnerId: formData.get('partnerId') as string,
    label: formData.get('label') as string,
    coinsRequired: parseInt(formData.get('coinsRequired') as string),
    discountPercent: parseInt(formData.get('discountPercent') as string),
    isActive: true,
  })
  revalidatePath('/partners')
}

export async function deleteCoinOffer(id: string, partnerId: string) {
  await db.delete(coinOffers).where(eq(coinOffers.id, id))
  revalidatePath(`/partners/${partnerId}`)
}

export async function toggleCoinOffer(id: string, current: boolean, partnerId: string) {
  await db.update(coinOffers).set({ isActive: !current }).where(eq(coinOffers.id, id))
  revalidatePath(`/partners/${partnerId}`)
}
