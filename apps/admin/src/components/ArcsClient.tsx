'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, Pencil } from 'lucide-react'
import type { Arc } from '@/db/schema'

const WORLD_COLORS: Record<string, string> = {
  TASTE:   'bg-orange-100 text-orange-700',
  WILD:    'bg-green-100 text-green-700',
  MOVE:    'bg-blue-100 text-blue-700',
  ROOTS:   'bg-purple-100 text-purple-700',
  RESTORE: 'bg-yellow-100 text-yellow-700',
}

const PROVINCES = [
  'WESTERN', 'CENTRAL', 'SOUTHERN', 'NORTHERN', 'EASTERN',
  'NORTH_WESTERN', 'NORTH_CENTRAL', 'UVA', 'SABARAGAMUWA',
]

interface Props {
  arcs: (Arc & { chapterCount: number })[]
}

export default function ArcsClient({ arcs }: Props) {
  const [search, setSearch] = useState('')
  const [worldType, setWorldType] = useState('')
  const [status, setStatus] = useState('')
  const [province, setProvince] = useState('')

  const filtered = arcs.filter((a) => {
    if (search && !a.title.toLowerCase().includes(search.toLowerCase())) return false
    if (worldType && a.worldType !== worldType) return false
    if (status === 'Published' && !a.isPublished) return false
    if (status === 'Draft' && a.isPublished) return false
    if (province && a.province !== province) return false
    return true
  })

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Arcs</h1>
          <p className="text-gray-500 text-sm mt-1">{arcs.length} total arcs</p>
        </div>
        <Link href="/arcs/new" className="btn-primary">
          <Plus size={16} />
          New Arc
        </Link>
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search arcs..."
          className="filter-input"
        />
        <select value={worldType} onChange={(e) => setWorldType(e.target.value)} className="filter-select">
          <option value="">All World Types</option>
          {['TASTE', 'WILD', 'MOVE', 'ROOTS', 'RESTORE'].map((w) => (
            <option key={w} value={w}>{w}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="filter-select">
          <option value="">All Statuses</option>
          <option value="Published">Published</option>
          <option value="Draft">Draft</option>
        </select>
        <select value={province} onChange={(e) => setProvince(e.target.value)} className="filter-select">
          <option value="">All Provinces</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <span className="text-sm text-gray-400 ml-auto whitespace-nowrap">
          Showing {filtered.length} of {arcs.length} arcs
        </span>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-gray-500">
              <th className="px-6 py-3 font-medium">Title</th>
              <th className="px-6 py-3 font-medium">World</th>
              <th className="px-6 py-3 font-medium">Province</th>
              <th className="px-6 py-3 font-medium">Chapters</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  {arcs.length === 0 ? (
                    <>No arcs yet.{' '}<Link href="/arcs/new" className="text-[#E8832A] hover:underline">Create your first arc →</Link></>
                  ) : (
                    'No arcs match the current filters.'
                  )}
                </td>
              </tr>
            ) : filtered.map((arc) => (
              <tr key={arc.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-900">{arc.title}</td>
                <td className="px-6 py-4">
                  <span className={`badge ${WORLD_COLORS[arc.worldType] ?? 'bg-gray-100 text-gray-600'}`}>
                    {arc.worldType}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{arc.province.replace(/_/g, ' ')}</td>
                <td className="px-6 py-4 text-gray-500">{arc.chapterCount}</td>
                <td className="px-6 py-4">
                  <span className={`badge ${arc.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                    {arc.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/arcs/${arc.id}`} className="inline-flex items-center gap-1 text-[#E8832A] hover:underline text-xs">
                    <Pencil size={12} /> Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
