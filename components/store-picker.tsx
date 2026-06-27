"use client"

import { useMemo, useState } from "react"
import { STORES } from "@/lib/types"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronsUpDown, MapPin } from "lucide-react"

interface StorePickerProps {
  value: string
  onChange: (value: string) => void
}

export function StorePicker({ value, onChange }: StorePickerProps) {
  const [open, setOpen] = useState(false)

  const selected = useMemo(() => STORES.find((s) => s.name === value), [value])

  // Group stores by city so the long list stays scannable.
  const grouped = useMemo(() => {
    const map = new Map<string, typeof STORES>()
    for (const store of STORES) {
      const list = map.get(store.city) ?? []
      list.push(store)
      map.set(store.city, list)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b, "ru"))
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        aria-expanded={open}
        className="flex h-auto min-h-10 w-full items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-left text-sm transition-colors outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-expanded:bg-muted"
      >
        {selected ? (
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-medium">{selected.name}</span>
            <span className="truncate text-xs text-muted-foreground">
              {selected.city} · {selected.address}
            </span>
          </span>
        ) : (
          <span className="text-muted-foreground">Search stores by name, city, or address...</span>
        )}
        <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
      </PopoverTrigger>
      <PopoverContent className="w-[var(--anchor-width)] p-0" align="start">
        <Command
          filter={(itemValue, search) => {
            // itemValue carries name + city + address (see CommandItem value below).
            return itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
          }}
        >
          <CommandInput placeholder="Type a store, city, or street..." />
          <CommandList>
            <CommandEmpty>No store matches your search.</CommandEmpty>
            {grouped.map(([city, stores]) => (
              <CommandGroup key={city} heading={`${city} (${stores.length})`}>
                {stores.map((store) => (
                  <CommandItem
                    key={store.id}
                    value={`${store.name} ${store.city} ${store.address}`}
                    data-checked={value === store.name}
                    onSelect={() => {
                      onChange(store.name)
                      setOpen(false)
                    }}
                    className="flex items-start gap-2"
                  >
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{store.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{store.address}</span>
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
