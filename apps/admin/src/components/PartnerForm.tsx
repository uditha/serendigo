'use client'
import { useTransition, useState } from 'react'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import type { Partner } from '@/db/schema'
import MultiImageUpload from './MultiImageUpload'

const CATEGORIES = ['FOOD', 'STAY', 'EXPERIENCE', 'SHOP', 'TRANSPORT']
const TIERS = ['listed', 'partner', 'premium']
const PROVINCES = [
  'WESTERN', 'CENTRAL', 'SOUTHERN', 'NORTHERN', 'EASTERN',
  'NORTH_WESTERN', 'NORTH_CENTRAL', 'UVA', 'SABARAGAMUWA',
]

const DAYS: [string, string][] = [
  ['mon', 'Monday'],
  ['tue', 'Tuesday'],
  ['wed', 'Wednesday'],
  ['thu', 'Thursday'],
  ['fri', 'Friday'],
  ['sat', 'Saturday'],
  ['sun', 'Sunday'],
]

export default function PartnerForm({
  action,
  defaultValues,
}: {
  action: (formData: FormData) => Promise<{ error?: string } | void>
  defaultValues?: Partial<Partner>
}) {
  const [pending, startTransition] = useTransition()
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setStatus('idle')
    startTransition(async () => {
      try {
        const result = await action(formData)
        if (result && 'error' in result && result.error) {
          setStatus('error')
          setErrorMsg(result.error)
        } else {
          setStatus('success')
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }
      } catch (err: unknown) {
        // Re-throw Next.js redirect errors (createPartner uses redirect())
        if ((err as { digest?: string })?.digest?.startsWith('NEXT_REDIRECT')) throw err
        setStatus('error')
        setErrorMsg('Something went wrong. Please try again.')
      }
    })
  }

  const openingHours = defaultValues?.openingHours as Record<string, string> | null | undefined

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-3 gap-6 items-start">

      {/* LEFT COLUMN — 2/3 width */}
      <div className="col-span-2 space-y-6">

        {/* Status banners */}
        {status === 'success' && (
          <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
            <CheckCircle size={16} className="shrink-0 text-green-600" />
            Partner saved successfully.
          </div>
        )}
        {status === 'error' && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            {errorMsg}
          </div>
        )}

        {/* Basic Info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Basic Info</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Name *</label>
              <input name="name" className="input" defaultValue={defaultValues?.name} placeholder="e.g. Wijaya Beach Kitchen" required />
            </div>

            <div>
              <label className="label">Category *</label>
              <select name="category" className="input" defaultValue={defaultValues?.category} required>
                <option value="">Select category</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="label">Tier *</label>
              <select name="tier" className="input" defaultValue={defaultValues?.tier ?? 'listed'} required>
                {TIERS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="label">Tagline * <span className="text-gray-400 font-normal">(shown on card, max 60 chars)</span></label>
              <input name="tagline" className="input" defaultValue={defaultValues?.tagline} maxLength={60} placeholder="e.g. The best pol roti inside the Galle Fort" required />
            </div>

            <div className="col-span-2">
              <label className="label">Description * <span className="text-gray-400 font-normal">(shown on detail, max 200 chars)</span></label>
              <textarea name="description" className="input resize-none" rows={3} defaultValue={defaultValues?.description} maxLength={200} placeholder="A short description of what makes this place special..." required />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Location</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Latitude *</label>
              <input name="lat" type="number" step="any" className="input" defaultValue={defaultValues?.lat} placeholder="6.9271" required />
            </div>
            <div>
              <label className="label">Longitude *</label>
              <input name="lng" type="number" step="any" className="input" defaultValue={defaultValues?.lng} placeholder="79.8612" required />
            </div>
            <div className="col-span-2">
              <label className="label">Address</label>
              <input name="address" className="input" defaultValue={defaultValues?.address ?? ''} placeholder="e.g. 28 Church St, Galle Fort" />
            </div>
            <div>
              <label className="label">District</label>
              <input name="district" className="input" defaultValue={defaultValues?.district ?? ''} placeholder="e.g. Galle" />
            </div>
            <div>
              <label className="label">Province *</label>
              <select name="province" className="input" defaultValue={defaultValues?.province} required>
                <option value="">Select province</option>
                {PROVINCES.map((p) => <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Contact</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Phone</label>
              <input name="phone" className="input" defaultValue={defaultValues?.phone ?? ''} placeholder="+94 77 123 4567" />
            </div>
            <div>
              <label className="label">WhatsApp</label>
              <input name="whatsapp" className="input" defaultValue={defaultValues?.whatsapp ?? ''} placeholder="+94 77 123 4567" />
            </div>
            <div className="col-span-2">
              <label className="label">Website</label>
              <input name="website" className="input" defaultValue={defaultValues?.website ?? ''} placeholder="https://..." />
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Opening Hours</h2>
          <div className="grid grid-cols-2 gap-3">
            {DAYS.map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <label className="text-xs text-gray-500 w-16 shrink-0">{label}</label>
                <input
                  name={`hours_${key}`}
                  className="input text-xs py-1.5"
                  defaultValue={openingHours?.[key] ?? ''}
                  placeholder="9am–5pm"
                />
              </div>
            ))}
            <div className="col-span-2">
              <input
                name="hours_note"
                className="input text-xs"
                defaultValue={openingHours?.note ?? ''}
                placeholder="Note (e.g. Closed on Poya days)"
              />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN — 1/3 width */}
      <div className="space-y-6">

        {/* Photos */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Photos</h2>
          <MultiImageUpload name="photos" folder="partners" defaultValues={defaultValues?.photos ?? []} />
        </div>

        {/* Pricing */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Pricing (USD)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Min</label>
              <input name="priceMin" type="number" className="input" defaultValue={defaultValues?.priceMin ?? ''} placeholder="5" />
            </div>
            <div>
              <label className="label">Max</label>
              <input name="priceMax" type="number" className="input" defaultValue={defaultValues?.priceMax ?? ''} placeholder="25" />
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Tags</h2>
          <div>
            <label className="label">Tags <span className="text-gray-400 font-normal">(comma-separated)</span></label>
            <input
              name="tags"
              className="input"
              defaultValue={(defaultValues?.tags ?? []).join(', ')}
              placeholder="vegetarian-friendly, family-run, beachfront"
            />
          </div>
        </div>

        {/* Flags */}
        <div className="card space-y-3">
          <h2 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Flags</h2>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isLocal"
              id="isLocal"
              className="w-4 h-4 accent-[#2D6E4E]"
              defaultChecked={defaultValues?.isLocal ?? false}
            />
            <label htmlFor="isLocal" className="text-sm text-gray-700 cursor-pointer">
              <span className="font-medium">Family run</span> — Small or independent operator
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="isApproved"
              id="isApproved"
              className="w-4 h-4 accent-[#E8832A]"
              defaultChecked={defaultValues?.isApproved ?? false}
            />
            <label htmlFor="isApproved" className="text-sm text-gray-700 cursor-pointer">
              Approved — visible to travelers
            </label>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" disabled={pending} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
          {pending && <Loader2 size={14} className="animate-spin" />}
          {pending ? 'Saving…' : defaultValues?.id ? 'Save Changes' : 'Create Partner'}
        </button>
      </div>
    </form>
  )
}
