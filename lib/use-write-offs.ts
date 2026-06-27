"use client"

import useSWR from "swr"
import { listWriteOffs } from "@/app/actions/write-offs"
import type { WriteOff } from "@/lib/types"

export function useWriteOffs() {
  const { data, error, isLoading, mutate } = useSWR<WriteOff[]>(
    "write-offs",
    () => listWriteOffs(),
    {
      // Keep all three role views live without manual refresh.
      refreshInterval: 4000,
      revalidateOnFocus: true,
    },
  )

  return {
    writeOffs: data ?? [],
    isLoading,
    error,
    mutate,
  }
}
