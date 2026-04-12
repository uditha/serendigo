import { fetchFromApi } from './api'

export interface CoinOffer {
  id: string
  label: string
  coinsRequired: number
  discountPercent: number
  isActive: boolean
}

export interface PartnerOffers {
  partner: {
    id: string
    name: string
    category: string
    photos: string[]
    tagline: string
    coinBalance: number
  }
  offers: CoinOffer[]
}

export interface RedemptionResult {
  confirmationCode: string
  coinsSpent: number
  discountPercent: number
  coinsRemaining: number
}

export function getPartnerOffers(partnerId: string) {
  return fetchFromApi<{ success: boolean; data: PartnerOffers }>(
    `/api/redeem/${partnerId}`,
  ).then((r) => r.data)
}

export function redeemOffer(offerId: string) {
  return fetchFromApi<{ success: boolean; data: RedemptionResult }>('/api/redeem', {
    method: 'POST',
    body: JSON.stringify({ offerId }),
  }).then((r) => r.data)
}
