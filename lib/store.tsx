"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import type { Ingredient, WriteOff } from "@/lib/types"

function uid() {
  return Math.random().toString(36).slice(2, 10)
}

const SEED: WriteOff[] = [
  {
    id: uid(),
    store_location: "Downtown Flagship",
    photo: null,
    write_off_type: "with_deduction",
    comment: "Dropped a full tray of patties during the lunch rush, unsalvageable.",
    ingredients: [
      { id: uid(), name: "Beef patty", quantity: 6 },
      { id: uid(), name: "Brioche bun", quantity: 6 },
    ],
    submitted_by: "Jordan Chen",
    responsible_employee: null,
    estimated_cost: 24.5,
    status: "pending",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: uid(),
    store_location: "Westfield Mall",
    photo: null,
    write_off_type: "no_deduction",
    comment: "Walk-in cooler failed overnight, dairy stock spoiled before open.",
    ingredients: [
      { id: uid(), name: "Whole milk (gal)", quantity: 4 },
      { id: uid(), name: "Shredded cheese (lb)", quantity: 3 },
    ],
    submitted_by: "Sam Patel",
    responsible_employee: null,
    estimated_cost: 41.0,
    status: "verified",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 26).toISOString(),
  },
  {
    id: uid(),
    store_location: "Harbor Point",
    photo: null,
    write_off_type: "with_deduction",
    comment: "Register miscount led to over-prep of fries that went cold and tossed.",
    ingredients: [{ id: uid(), name: "Fries (portion)", quantity: 12 }],
    submitted_by: "Taylor Brooks",
    responsible_employee: "Morgan Lee",
    estimated_cost: 18.75,
    status: "approved",
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(),
  },
]

export interface NewWriteOff {
  store_location: string
  photo: string | null
  write_off_type: WriteOff["write_off_type"]
  comment: string
  ingredients: Ingredient[]
  submitted_by: string
}

interface StoreValue {
  writeOffs: WriteOff[]
  addWriteOff: (data: NewWriteOff) => void
  verify: (id: string, responsibleEmployee: string | null) => void
  approve: (id: string) => void
  reject: (id: string) => void
}

const StoreContext = createContext<StoreValue | null>(null)

function estimateCost(ingredients: Ingredient[]) {
  // Simple deterministic estimate so analytics have meaningful numbers.
  return ingredients.reduce((sum, i) => sum + i.quantity * 3.25, 0)
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [writeOffs, setWriteOffs] = useState<WriteOff[]>(SEED)

  const value = useMemo<StoreValue>(
    () => ({
      writeOffs,
      addWriteOff: (data) =>
        setWriteOffs((prev) => [
          {
            id: uid(),
            store_location: data.store_location,
            photo: data.photo,
            write_off_type: data.write_off_type,
            comment: data.comment,
            ingredients: data.ingredients,
            submitted_by: data.submitted_by,
            responsible_employee: null,
            estimated_cost: estimateCost(data.ingredients),
            status: "pending",
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]),
      verify: (id, responsibleEmployee) =>
        setWriteOffs((prev) =>
          prev.map((w) =>
            w.id === id
              ? { ...w, status: "verified", responsible_employee: responsibleEmployee }
              : w,
          ),
        ),
      approve: (id) =>
        setWriteOffs((prev) =>
          prev.map((w) => (w.id === id ? { ...w, status: "approved" } : w)),
        ),
      reject: (id) =>
        setWriteOffs((prev) =>
          prev.map((w) => (w.id === id ? { ...w, status: "rejected" } : w)),
        ),
    }),
    [writeOffs],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}
