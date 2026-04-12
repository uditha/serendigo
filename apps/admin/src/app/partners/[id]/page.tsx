import { db } from '@/db'
import { partners, chapterFeaturedPartners, flashDeals, chapters, arcs, coinOffers } from '@/db/schema'
import { eq, asc } from 'drizzle-orm'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Zap, Plus, Trash2 } from 'lucide-react'
import PartnerForm from '@/components/PartnerForm'
import { updatePartner, deletePartner, removeFeaturedPartner, toggleDealActive, createFlashDeal } from '@/actions/partners'
import { createCoinOffer, deleteCoinOffer, toggleCoinOffer } from '@/actions/coinOffers'
import { DeleteButton } from '@/components/DeleteButton'
import QRCodeCard from '@/components/QRCodeCard'

export default async function EditPartnerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const [partner] = await db.select().from(partners).where(eq(partners.id, id)).limit(1)
  if (!partner) notFound()

  // Featured chapter assignments
  const featuredRows = await db
    .select({
      chapterId: chapterFeaturedPartners.chapterId,
      displayOrder: chapterFeaturedPartners.displayOrder,
      chapterTitle: chapters.title,
      arcTitle: arcs.title,
    })
    .from(chapterFeaturedPartners)
    .innerJoin(chapters, eq(chapters.id, chapterFeaturedPartners.chapterId))
    .innerJoin(arcs, eq(arcs.id, chapters.arcId))
    .where(eq(chapterFeaturedPartners.partnerId, id))
    .orderBy(asc(chapterFeaturedPartners.displayOrder))

  // Flash deals for this partner
  const deals = await db
    .select()
    .from(flashDeals)
    .where(eq(flashDeals.partnerId, id))
    .orderBy(asc(flashDeals.expiresAt))

  // Coin offers for this partner
  const offers = await db
    .select()
    .from(coinOffers)
    .where(eq(coinOffers.partnerId, id))
    .orderBy(asc(coinOffers.createdAt))

  const updateAction = updatePartner.bind(null, id)
  const deleteAction = deletePartner.bind(null, id)

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/partners" className="text-gray-400 hover:text-gray-600 text-sm">← Partners</Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-xl font-bold text-gray-900">{partner.name}</h1>
        </div>
        <DeleteButton action={deleteAction} label="Delete Partner" />
      </div>

      <PartnerForm action={updateAction} defaultValues={partner} />

      {/* Featured chapter assignments */}
      <div className="card space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">Featured on Chapters</h2>
          <p className="text-xs text-gray-400">Assign via chapter edit pages</p>
        </div>

        {featuredRows.length === 0 ? (
          <p className="text-sm text-gray-400">Not featured on any chapter yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {featuredRows.map((row) => {
              const removeAction = removeFeaturedPartner.bind(null, row.chapterId, id)
              return (
                <div key={row.chapterId} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{row.chapterTitle}</p>
                    <p className="text-xs text-gray-400">{row.arcTitle} · order {row.displayOrder}</p>
                  </div>
                  <form action={removeAction}>
                    <button type="submit" className="text-red-400 hover:text-red-600 p-1">
                      <Trash2 size={14} />
                    </button>
                  </form>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Coin Offers */}
      <div className="card space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">
            Coin Offers
          </h2>
          <span className="text-xs text-gray-400">Coin balance: {partner.coinBalance ?? 0} coins collected</span>
        </div>

        {/* Existing offers */}
        {offers.length > 0 && (
          <div className="space-y-2">
            {offers.map((offer) => (
              <div key={offer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="text-sm font-medium text-gray-800">{offer.label}</p>
                  <p className="text-xs text-gray-500">{offer.coinsRequired} coins → {offer.discountPercent}% off</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${offer.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {offer.isActive ? 'Active' : 'Inactive'}
                  </span>
                  <form action={toggleCoinOffer.bind(null, offer.id, offer.isActive, id)}>
                    <button type="submit" className="text-xs text-gray-500 hover:text-gray-700 underline">
                      {offer.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </form>
                  <form action={deleteCoinOffer.bind(null, offer.id, id)}>
                    <button type="submit" className="text-xs text-red-400 hover:text-red-600">Remove</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add new offer form */}
        <form action={createCoinOffer} className="grid grid-cols-3 gap-3 pt-2 border-t border-gray-100">
          <input type="hidden" name="partnerId" value={id} />
          <div className="col-span-3">
            <input name="label" className="input text-sm" placeholder='e.g. "10% off any purchase"' required />
          </div>
          <div>
            <label className="label text-xs">Coins required</label>
            <input name="coinsRequired" type="number" className="input text-sm" placeholder="100" min="1" required />
          </div>
          <div>
            <label className="label text-xs">Discount %</label>
            <input name="discountPercent" type="number" className="input text-sm" placeholder="10" min="1" max="100" required />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary text-sm w-full">Add offer</button>
          </div>
        </form>
      </div>

      <div className="max-w-2xl">
        <QRCodeCard partnerId={id} partnerName={partner.name} />
      </div>

      {/* Flash Deals — only for premium partners */}
      {partner.tier === 'premium' && (
        <div className="card space-y-4 max-w-2xl">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-amber-500" />
            <h2 className="font-semibold text-gray-700">Flash Deals</h2>
          </div>

          {deals.length > 0 && (
            <div className="divide-y divide-gray-100">
              {deals.map((deal) => {
                const expired = new Date(deal.expiresAt) < new Date()
                const toggleAction = toggleDealActive.bind(null, deal.id, deal.isActive)
                return (
                  <div key={deal.id} className="flex items-center justify-between py-2">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{deal.title}</p>
                      <p className="text-xs text-gray-400">
                        {deal.discountText} · code: <code className="bg-gray-100 px-1 rounded">{deal.claimCode}</code>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {expired ? 'Expired' : `Expires ${new Date(deal.expiresAt).toLocaleDateString()}`}
                      </p>
                    </div>
                    <form action={toggleAction}>
                      <button type="submit" className={`text-xs px-2 py-1 rounded ${deal.isActive && !expired ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                        {deal.isActive && !expired ? 'Active' : 'Off'}
                      </button>
                    </form>
                  </div>
                )
              })}
            </div>
          )}

          {/* Create new deal */}
          <details className="border border-dashed border-gray-200 rounded-lg p-4">
            <summary className="text-sm text-[#E8832A] cursor-pointer font-medium flex items-center gap-1">
              <Plus size={14} /> Add Flash Deal
            </summary>
            <form action={createFlashDeal} className="mt-4 space-y-3">
              <input type="hidden" name="partnerId" value={id} />
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="label">Title</label>
                  <input name="title" className="input" placeholder="20% off lunch today" required />
                </div>
                <div className="col-span-2">
                  <label className="label">Discount text</label>
                  <input name="discountText" className="input" placeholder="20% off any main course" required />
                </div>
                <div className="col-span-2">
                  <label className="label">Claim code <span className="text-gray-400 font-normal">(shown to user, given at counter)</span></label>
                  <input name="claimCode" className="input font-mono" placeholder="SRNGO20" required />
                </div>
                <div>
                  <label className="label">Starts at</label>
                  <input name="startsAt" type="datetime-local" className="input" required />
                </div>
                <div>
                  <label className="label">Expires at</label>
                  <input name="expiresAt" type="datetime-local" className="input" required />
                </div>
                <div>
                  <label className="label">Radius (metres)</label>
                  <input name="radiusMeters" type="number" className="input" defaultValue={1500} />
                </div>
                <div>
                  <label className="label">Min coins required</label>
                  <input name="minCoins" type="number" className="input" defaultValue={200} />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full">Create Deal</button>
            </form>
          </details>
        </div>
      )}
    </div>
  )
}
