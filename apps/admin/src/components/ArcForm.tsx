import type { Arc } from '@/db/schema'

const WORLD_TYPES = ['TASTE', 'WILD', 'MOVE', 'ROOTS', 'RESTORE']
const PROVINCES = [
  'WESTERN', 'CENTRAL', 'SOUTHERN', 'NORTHERN', 'EASTERN',
  'NORTH_WESTERN', 'NORTH_CENTRAL', 'UVA', 'SABARAGAMUWA',
]

export default function ArcForm({
  action,
  defaultValues,
}: {
  action: (formData: FormData) => Promise<void>
  defaultValues?: Partial<Arc>
}) {
  return (
    <form action={action} className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="label">Title *</label>
          <input
            name="title"
            className="input"
            defaultValue={defaultValues?.title}
            placeholder="e.g. Flavours of the Fort"
            required
          />
        </div>

        <div>
          <label className="label">World Type *</label>
          <select name="worldType" className="input" defaultValue={defaultValues?.worldType} required>
            <option value="">Select world type</option>
            {WORLD_TYPES.map((w) => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label">Province *</label>
          <select name="province" className="input" defaultValue={defaultValues?.province} required>
            <option value="">Select province</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>{p.replace('_', ' ')}</option>
            ))}
          </select>
        </div>

        <div className="col-span-2">
          <label className="label">Narrator Name</label>
          <input
            name="narratorName"
            className="input"
            defaultValue={defaultValues?.narratorName ?? ''}
            placeholder="e.g. Senaka, the spice merchant"
          />
        </div>

        <div className="col-span-2">
          <label className="label">Intro Text</label>
          <textarea
            name="introText"
            className="input min-h-[100px] resize-y"
            defaultValue={defaultValues?.introText ?? ''}
            placeholder="A short introduction to this arc shown on the arc detail screen..."
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button type="submit" className="btn-primary">
          {defaultValues?.id ? 'Save Changes' : 'Create Arc'}
        </button>
      </div>
    </form>
  )
}
