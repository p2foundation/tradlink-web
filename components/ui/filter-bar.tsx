'use client'

import { Button } from './button'
import { Badge } from './badge'
import { Input } from './input'
import { X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

export type FilterOption = {
  label: string
  value: string
}

type FilterBarProps = {
  searchPlaceholder?: string
  searchValue: string
  onSearchChange: (value: string) => void
  filters?: {
    id: string
    label: string
    options: FilterOption[]
    active: string | null
    onChange: (value: string | null) => void
  }[]
  onClearAll?: () => void
  dense?: boolean
}

export function FilterBar({
  searchPlaceholder = 'Search…',
  searchValue,
  onSearchChange,
  filters = [],
  onClearAll,
  dense = false,
}: FilterBarProps) {
  const hasActiveFilters = filters.some((f) => !!f.active)

  return (
    <div
      className={cn(
        'w-full rounded-xl border border-white/10 bg-slate-900/80 backdrop-blur-lg shadow-sm text-slate-100',
        dense ? 'p-3' : 'p-6',
      )}
    >
      <div className="flex flex-col gap-5">
        {/* Large, Prominent Search Input */}
        <div className="relative">
          <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-400 pointer-events-none z-10" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-16 pl-16 pr-16 text-lg bg-slate-800 border-2 border-slate-700 text-slate-100 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/40 transition-all shadow-lg"
          />
          {searchValue && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => onSearchChange('')}
              className="absolute right-5 top-1/2 transform -translate-y-1/2 flex items-center justify-center w-10 h-10 rounded-full bg-slate-700 hover:bg-slate-600 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4">
          {filters.map((filter) => (
            <div key={filter.id} className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-300 uppercase tracking-wide whitespace-nowrap">
                {filter.label}:
              </span>
              <div className="flex flex-wrap gap-2">
                {filter.options.map((opt) => {
                  const active = filter.active === opt.value
                  return (
                    <Badge
                      key={opt.value}
                      variant={active ? 'success' : 'outline'}
                      className="cursor-pointer px-4 py-2 text-sm font-medium hover:bg-primary/20 transition-colors"
                      onClick={() => filter.onChange(active ? null : opt.value)}
                    >
                      {opt.label}
                    </Badge>
                  )
                })}
              </div>
            </div>
          ))}
          {onClearAll && (
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:text-white ml-auto"
              disabled={!hasActiveFilters && !searchValue}
              onClick={() => {
                onSearchChange('')
                filters.forEach((f) => f.onChange(null))
                onClearAll()
              }}
            >
              Clear all
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
