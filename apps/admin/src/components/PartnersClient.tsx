'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Pencil, Zap, ChevronLeft, ChevronRight } from 'lucide-react'
import type { Partner } from '@/db/schema'

const CATEGORIES = ['FOOD', 'STAY', 'EXPERIENCE', 'SHOP', 'TRANSPORT'] as const

const CATEGORY_COLORS: Record<string, string> = {
  FOOD:       'bg-orange-100 text-orange-700',
  STAY:       'bg-blue-100 text-blue-700',
  EXPERIENCE: 'bg-purple-100 text-purple-700',
  SHOP:       'bg-yellow-100 text-yellow-700',
  TRANSPORT:  'bg-green-100 text-green-700',
}

const CATEGORY_EMOJI: Record<string, string> = {
  FOOD:       '🍛',
  STAY:       '🏨',
  EXPERIENCE: '🎭',
  SHOP:       '🛍️',
  TRANSPORT:  '🚗',
}

const TIER_COLORS: Record<string, string> = {
  listed:  'bg-gray-100 text-gray-500',
  partner: 'bg-amber-100 text-amber-700',
  premium: 'bg-yellow-100 text-yellow-800',
}

const PROVINCES = [
  'WESTERN', 'CENTRAL', 'SOUTHERN', 'NORTHERN', 'EASTERN',
  'NORTH_WESTERN', 'NORTH_CENTRAL', 'UVA', 'SABARAGAMUWA',
]

const PAGE_SIZE = 20

interface Props {
  partners: (Partner & { activeDeals?: number })[]
}

export default function PartnersClient({ partners }: Props) {
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState('ALL')
  const [tier, setTier]         = useState('')
  const [status, setStatus]     = useState('')
  const [province, setProvince] = useState('')
  const [page, setPage]         = useState(1)

  // Category counts (always from full list, ignoring other filters)
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = { ALL: partners.length }
    for (const cat of CATEGORIES) {
      map[cat] = partners.filter((p) => p.category === cat).length
    }
    return map
  }, [partners])

  // Full filter
  const filtered = useMemo(() => {
    return partners.filter((p) => {
      if (category !== 'ALL' && p.category !== category) return false
      if (search) {
        const q = search.toLowerCase()
        if (!p.name.toLowerCase().includes(q) && !(p.tagline ?? '').toLowerCase().includes(q)) return false
      }
      if (tier && p.tier !== tier) return false
      if (status === 'Approved' && !p.isApproved) return false
      if (status === 'Pending' && p.isApproved) return false
      if (province && p.province !== province) return false
      return true
    })
  }, [partners, category, search, tier, status, province])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const pageItems  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const changeCategory = (cat: string) => { setCategory(cat); setPage(1) }
  const changeSearch   = (val: string) => { setSearch(val);   setPage(1) }
  const changeTier     = (val: string) => { setTier(val);     setPage(1) }
  const changeStatus   = (val: string) => { setStatus(val);   setPage(1) }
  const changeProvince = (val: string) => { setProvince(val); setPage(1) }
  const clearAll       = () => { setSearch(''); setTier(''); setStatus(''); setProvince(''); setCategory('ALL'); setPage(1) }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
          <p className="text-gray-500 text-sm mt-1">
            {partners.length} total · {partners.filter((p) => p.isApproved).length} approved
          </p>
        </div>
        <Link href="/partners/new" className="btn-primary flex items-center gap-2">
          <Plus size={16} />
          New Partner
        </Link>
      </div>

      {/* Category tabs */}
      <div className="flex gap-1 border-b border-gray-200 overflow-x-auto pb-px">
        {(['ALL', ...CATEGORIES] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => changeCategory(cat)}
            className={[
              'flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors',
              category === cat
                ? 'border-[#E8832A] text-[#E8832A]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
            ].join(' ')}
          >
            {cat !== 'ALL' && <span>{CATEGORY_EMOJI[cat]}</span>}
            {cat === 'ALL' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
            <span className={[
              'ml-0.5 text-xs px-1.5 py-0.5 rounded-full',
              category === cat ? 'bg-[#E8832A]/10 text-[#E8832A]' : 'bg-gray-100 text-gray-400',
            ].join(' ')}>
              {categoryCounts[cat] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      <div className="filter-bar">
        <input
          type="text"
          value={search}
          onChange={(e) => changeSearch(e.target.value)}
          placeholder="Search name or tagline…"
          className="filter-input"
        />
        <select value={tier} onChange={(e) => changeTier(e.target.value)} className="filter-select">
          <option value="">All Tiers</option>
          {['listed', 'partner', 'premium'].map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => changeStatus(e.target.value)} className="filter-select">
          <option value="">All Statuses</option>
          <option value="Approved">Approved</option>
          <option value="Pending">Pending</option>
        </select>
        <select value={province} onChange={(e) => changeProvince(e.target.value)} className="filter-select">
          <option value="">All Provinces</option>
          {PROVINCES.map((p) => (
            <option key={p} value={p}>{p.replace(/_/g, ' ')}</option>
          ))}
        </select>
        {(search || tier || status || province || category !== 'ALL') && (
          <button
            onClick={clearAll}
            className="text-xs text-gray-400 hover:text-gray-600 underline whitespace-nowrap"
          >
            Clear all
          </button>
        )}
        <span className="text-sm text-gray-400 ml-auto whitespace-nowrap">
          {filtered.length} of {partners.length}
        </span>
      </div>

      {/* Table */}
      <div className="table-container">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-left text-gray-500 text-xs uppercase tracking-wide">
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Province</th>
              <th className="px-6 py-3 font-medium">Tier</th>
              <th className="px-6 py-3 font-medium">Deals</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-16 text-center text-gray-400">
                  {partners.length === 0 ? (
                    <>No partners yet.{' '}
                      <Link href="/partners/new" className="text-[#E8832A] hover:underline">
                        Add your first partner →
                      </Link>
                    </>
                  ) : (
                    'No partners match the current filters.'
                  )}
                </td>
              </tr>
            ) : pageItems.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{p.name}</span>
                    {p.isLocal && (
                      <span title="Family run" className="text-xs text-amber-600">🏠</span>
                    )}
                  </div>
                  <div className="text-gray-400 text-xs truncate max-w-[220px] mt-0.5">{p.tagline}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`badge ${CATEGORY_COLORS[p.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {CATEGORY_EMOJI[p.category]} {p.category}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-xs">{p.province.replace(/_/g, ' ')}</td>
                <td className="px-6 py-4">
                  <span className={`badge ${TIER_COLORS[p.tier] ?? 'bg-gray-100 text-gray-500'}`}>
                    {p.tier}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {(p.activeDeals ?? 0) > 0 ? (
                    <span className="flex items-center gap-1 text-amber-600 text-xs font-medium">
                      <Zap size={12} /> {p.activeDeals} active
                    </span>
                  ) : (
                    <span className="text-gray-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className={`badge ${p.isApproved ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>
                    {p.isApproved ? 'Approved' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/partners/${p.id}`}
                    className="inline-flex items-center gap-1 text-[#E8832A] hover:underline text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Pencil size={12} /> Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-400">
            Page {safePage} of {totalPages} &mdash; showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>

            {/* Page number buttons — show at most 7 */}
            {(() => {
              const delta = 2
              const range: (number | '…')[] = []
              const left  = Math.max(2, safePage - delta)
              const right = Math.min(totalPages - 1, safePage + delta)

              range.push(1)
              if (left > 2) range.push('…')
              for (let i = left; i <= right; i++) range.push(i)
              if (right < totalPages - 1) range.push('…')
              if (totalPages > 1) range.push(totalPages)

              return range.map((item, idx) =>
                item === '…' ? (
                  <span key={`ellipsis-${idx}`} className="px-1 text-gray-400">…</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item as number)}
                    className={[
                      'min-w-[32px] h-8 px-2 rounded text-sm transition-colors',
                      safePage === item
                        ? 'bg-[#E8832A] text-white font-medium'
                        : 'hover:bg-gray-100 text-gray-600',
                    ].join(' ')}
                  >
                    {item}
                  </button>
                )
              )
            })()}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
