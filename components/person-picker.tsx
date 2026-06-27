"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { searchPeople, type Person } from "@/lib/people"
import { Search, User, X } from "lucide-react"

export function PersonPicker({
  value,
  onChange,
}: {
  value: Person | null
  onChange: (person: Person | null) => void
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const results = useMemo(() => searchPeople(query), [query])

  if (value) {
    return (
      <div className="flex items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive">
            <User className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-foreground">{value.name}</p>
            <p className="truncate text-xs text-muted-foreground">{value.position}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            onChange(null)
            setQuery("")
          }}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground"
          aria-label="Clear responsible person"
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
          placeholder="Search employee by name or position"
          className="pl-9"
          aria-label="Search employees"
        />
      </div>

      {open && (
        <div className="max-h-56 overflow-y-auto rounded-lg border border-border">
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-muted-foreground">
              No employees match &quot;{query}&quot;.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {results.map((person) => (
                <li key={person.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(person)
                      setOpen(false)
                    }}
                    className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-accent"
                  >
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
                      <User className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-foreground">
                        {person.name}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {person.position}
                      </span>
                    </span>
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
