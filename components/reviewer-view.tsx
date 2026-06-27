"use client"

import { useState } from "react"
import type { WriteOff, WriteOffStatus } from "@/lib/types"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WriteOffCard } from "@/components/write-off-card"
import { StatCards } from "@/components/stat-cards"
import { Inbox } from "lucide-react"

type Filter = "all" | WriteOffStatus

export function ReviewerView({ writeOffs }: { writeOffs: WriteOff[] }) {
  const [filter, setFilter] = useState<Filter>("pending")

  const filtered = filter === "all" ? writeOffs : writeOffs.filter((w) => w.status === filter)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-balance">Review queue</h1>
        <p className="text-sm text-muted-foreground">Approve or reject write-offs submitted by your team.</p>
      </div>

      <StatCards writeOffs={writeOffs} />

      <Tabs value={filter} onValueChange={(v) => setFilter(v as Filter)}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
      </Tabs>

      {filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((w) => (
            <WriteOffCard key={w.id} writeOff={w} canReview />
          ))}
        </div>
      )}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-16 text-center">
      <Inbox className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium">Nothing here</p>
      <p className="text-xs text-muted-foreground">No write-offs match this filter.</p>
    </div>
  )
}
