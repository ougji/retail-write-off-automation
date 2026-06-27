"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { searchStores, type Store } from "@/lib/stores"
import { Check, MapPin, Search, X } from "lucide-react"

export function StorePicker({
  value,
  onChange,
}: {
  value: Store | null
  onChange: (store: Store | null) => void
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const results = useMemo(() => searchStores(query).slice(0, 30), [query])

  if (value) {
    return (
      <div className="flex items-start justify-between gap-3 rounded-lg border border-primary/40 bg-accent p-3">
        <div className="flex min-w-0 items-start gap-2.5">
          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{value.name}</p>
            <p className="truncate text-xs text-muted-foreground">{value.address}</p>
            <p className="text-xs text-muted-foreground">{value.city}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onChange(null)
            setQuery("")
          }}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground"
          aria-label="Clear selected store"
        >
          <X className="size-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder="Search store by name, address, or city"
          className="pl-9"
          aria-label="Search stores"
        />
      </div>

      {open && (
        <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No stores match &quot;{query}&quot;.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {results.map((store) => (
                <li key={store.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(store)
                      setOpen(false)
                    }}
                    className="flex w-full items-start gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-accent"
                  >
                    <MapPin className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {store.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {store.address} · {store.city}
                      </span>
                    </span>
                    <Check className="mt-0.5 size-4 shrink-0 text-transparent" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
