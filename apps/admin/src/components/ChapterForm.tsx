import type { Chapter } from '@/db/schema'
import ImageUpload from './ImageUpload'

const WORLD_TYPES = ['TASTE', 'WILD', 'MOVE', 'ROOTS', 'RESTORE']

export default function ChapterForm({
  action,
  defaultValues,
  defaultOrder,
  xpCategory,
}: {
  action: (formData: FormData) => Promise<void>
  defaultValues?: Partial<Chapter>
  defaultOrder: number
  xpCategory: string
}) {
  const byg = defaultValues?.beforeYouGo as Record<string, string> | null

  return (
    <form action={action} className="space-y-6">
      {/* Cover image */}
      <ImageUpload
        name="coverImage"
        defaultValue={defaultValues?.coverImage}
        folder="chapter-covers"
        label="Cover Image"
      />

      {/* Basic info */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Order *</label>
          <input
            name="order"
            type="number"
            className="input"
            defaultValue={defaultValues?.order ?? defaultOrder}
            min={1}
            required
          />
        </div>

        <div>
          <label className="label">XP Category *</label>
          <select name="xpCategory" className="input" defaultValue={defaultValues?.xpCategory ?? xpCategory} required>
            {WORLD_TYPES.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="label">Title *</label>
          <input
            name="title"
            className="input"
            defaultValue={defaultValues?.title}
            placeholder="e.g. The Old Dutch Hospital"
            required
          />
        </div>
      </div>

      {/* Location */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Location</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="label">Latitude *</label>
            <input
              name="lat"
              type="number"
              step="any"
              className="input"
              defaultValue={defaultValues?.lat}
              placeholder="6.9271"
              required
            />
          </div>
          <div>
            <label className="label">Longitude *</label>
            <input
              name="lng"
              type="number"
              step="any"
              className="input"
              defaultValue={defaultValues?.lng}
              placeholder="79.8612"
              required
            />
          </div>
          <div>
            <label className="label">Radius (meters) *</label>
            <input
              name="radiusMeters"
              type="number"
              className="input"
              defaultValue={defaultValues?.radiusMeters ?? 200}
              required
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-1.5">
          Tip: right-click any location on{' '}
          <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="text-[#E8832A] hover:underline">
            Google Maps
          </a>{' '}
          to copy coordinates.
        </p>
      </div>

      {/* Rewards */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Rewards</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Coin Reward *</label>
            <input
              name="coinReward"
              type="number"
              className="input"
              defaultValue={defaultValues?.coinReward ?? 50}
              min={1}
              required
            />
          </div>
        </div>
      </div>

      {/* Lore */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Lore Text</h3>
        <textarea
          name="loreText"
          className="input min-h-[120px] resize-y"
          defaultValue={defaultValues?.loreText ?? ''}
          placeholder="The story revealed after the user captures this moment. Make it atmospheric and tied to the location..."
        />
        <p className="text-xs text-gray-400 mt-1">Revealed to the user only after a successful capture.</p>
      </div>

      {/* Before you go */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Before You Go</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">Best Time</label>
            <input
              name="bestTime"
              className="input"
              defaultValue={byg?.bestTime ?? ''}
              placeholder="e.g. Early morning, 6–9am"
            />
          </div>
          <div>
            <label className="label">Entry Fee</label>
            <input
              name="entryFee"
              className="input"
              defaultValue={byg?.entryFee ?? ''}
              placeholder="e.g. Free / LKR 500"
            />
          </div>
          <div>
            <label className="label">Dress Code</label>
            <input
              name="dresscode"
              className="input"
              defaultValue={byg?.dresscode ?? ''}
              placeholder="e.g. Cover shoulders and knees"
            />
          </div>
          <div>
            <label className="label">Etiquette</label>
            <input
              name="etiquette"
              className="input"
              defaultValue={byg?.etiquette ?? ''}
              placeholder="e.g. Remove shoes before entering"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2 border-t border-gray-100">
        <button type="submit" className="btn-primary">
          {defaultValues?.id ? 'Save Chapter' : 'Create Chapter'}
        </button>
      </div>
    </form>
  )
}
