import { db } from '../db'
import { partners, coinOffers, coinRedemptions } from '../db/schema'
import { user } from '../db/schema/auth'
import { eq, and, sql } from 'drizzle-orm'
import { createId } from '@paralleldrive/cuid2'

function generateCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function getPartnerOffers(partnerId: string) {
  const [partner] = await db
    .select({
      id: partners.id,
      name: partners.name,
      category: partners.category,
      photos: partners.photos,
      tagline: partners.tagline,
      coinBalance: partners.coinBalance,
    })
    .from(partners)
    .where(
      and(
        eq(partners.id, partnerId),
        eq(partners.isActive, true),
        eq(partners.isApproved, true),
      ),
    )
    .limit(1)

  if (!partner) return null

  const offers = await db
    .select()
    .from(coinOffers)
    .where(and(eq(coinOffers.partnerId, partnerId), eq(coinOffers.isActive, true)))
    .orderBy(coinOffers.coinsRequired)

  return { partner, offers }
}

export async function redeemCoins(userId: string, offerId: string) {
  // Get offer
  const [offer] = await db
    .select()
    .from(coinOffers)
    .where(eq(coinOffers.id, offerId))
    .limit(1)

  if (!offer || !offer.isActive) throw new Error('Offer not found or inactive')

  // Get user coins
  const [u] = await db
    .select({ coins: user.serendipityCoins, name: user.name })
    .from(user)
    .where(eq(user.id, userId))
    .limit(1)

  if (!u) throw new Error('User not found')

  const currentCoins = u.coins ?? 0
  if (currentCoins < offer.coinsRequired) {
    throw new Error(
      `Not enough coins. You have ${currentCoins}, need ${offer.coinsRequired}.`,
    )
  }

  const code = generateCode()

  // Deduct from user, add to partner balance, log redemption
  await Promise.all([
    db
      .update(user)
      .set({ serendipityCoins: currentCoins - offer.coinsRequired })
      .where(eq(user.id, userId)),
    db
      .update(partners)
      .set({ coinBalance: sql`${partners.coinBalance} + ${offer.coinsRequired}` })
      .where(eq(partners.id, offer.partnerId)),
    db.insert(coinRedemptions).values({
      id: createId(),
      partnerId: offer.partnerId,
      userId,
      offerId: offer.id,
      coinsSpent: offer.coinsRequired,
      discountPercent: offer.discountPercent,
      confirmationCode: code,
    }),
  ])

  return {
    confirmationCode: code,
    coinsSpent: offer.coinsRequired,
    discountPercent: offer.discountPercent,
    coinsRemaining: currentCoins - offer.coinsRequired,
  }
}
