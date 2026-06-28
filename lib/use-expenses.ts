"use client"

import useSWR from "swr"
import { listExpenses } from "@/app/actions/expenses"
import type { Expense } from "@/lib/types"

export function useExpenses() {
  const { data, error, isLoading, mutate } = useSWR<Expense[]>(
    "expenses",
    () => listExpenses(),
    {
      refreshInterval: 4000,
      revalidateOnFocus: true,
    },
  )

  return {
    expenses: data ?? [],
    isLoading,
    error,
    mutate,
  }
}
