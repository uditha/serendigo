import { createArc } from '@/actions/arcs'
import ArcForm from '@/components/ArcForm'
import Link from 'next/link'

export default function NewArcPage() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Link href="/arcs" className="text-sm text-gray-400 hover:text-gray-600">← Arcs</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">New Arc</h1>
      </div>
      <div className="card">
        <ArcForm action={createArc} />
      </div>
    </div>
  )
}
