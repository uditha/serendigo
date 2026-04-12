import PartnerForm from '@/components/PartnerForm'
import { createPartner } from '@/actions/partners'
import Link from 'next/link'

export default function NewPartnerPage() {
  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/partners" className="text-gray-400 hover:text-gray-600 text-sm">← Partners</Link>
        <span className="text-gray-300">/</span>
        <h1 className="text-xl font-bold text-gray-900">New Partner</h1>
      </div>
      <PartnerForm action={createPartner} />
    </div>
  )
}
