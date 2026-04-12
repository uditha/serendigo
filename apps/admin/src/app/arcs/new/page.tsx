import { createArc } from '@/actions/arcs'
import ArcForm from '@/components/ArcForm'
import Link from 'next/link'

export default function NewArcPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <Link href="/arcs" className="text-sm text-gray-400 hover:text-gray-600">← Arcs</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">New Arc</h1>
      </div>
      <div className="card max-w-2xl">
        <ArcForm action={createArc} />
      </div>
    </div>
  )
}
