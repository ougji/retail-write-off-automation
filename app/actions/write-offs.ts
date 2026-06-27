"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { writeOff } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import type { Ingredient, WriteOff, WriteOffStatus } from "@/lib/types"

async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user as { id: string; name: string; role?: string }
}

function estimateCost(items: Ingredient[]) {
  return items.reduce((sum, i) => sum + i.quantity * 3.25, 0)
}

function serialize(row: typeof writeOff.$inferSelect): WriteOff {
  return {
    id: row.id,
    userId: row.userId,
    submitterName: row.submitterName,
    storeId: row.storeId,
    storeName: row.storeName,
    storeAddress: row.storeAddress,
    reason: row.reason,
    comment: row.comment,
    withDeduction: row.withDeduction,
    responsiblePersonId: row.responsiblePersonId,
    responsiblePersonName: row.responsiblePersonName,
    items: (row.items as Ingredient[]) ?? [],
    photoDataUrl: row.photoDataUrl,
    totalValue: Number(row.totalValue),
    status: row.status as WriteOffStatus,
    verifiedBy: row.verifiedBy,
    decisionBy: row.decisionBy,
    createdAt:
      row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
  }
}

// All authenticated roles share one live queue.
export async function listWriteOffs(): Promise<WriteOff[]> {
  await getSession()
  const rows = await db.select().from(writeOff).orderBy(desc(writeOff.createdAt))
  return rows.map(serialize)
}

export interface NewWriteOffInput {
  storeId: string
  storeName: string
  storeAddress: string | null
  reason: string
  comment: string
  withDeduction: boolean
  responsiblePersonId: string | null
  responsiblePersonName: string | null
  items: Ingredient[]
  photoDataUrl: string | null
}

export async function createWriteOff(input: NewWriteOffInput) {
  const user = await getSession()
  await db.insert(writeOff).values({
    id: crypto.randomUUID(),
    userId: user.id,
    submitterName: user.name,
    storeId: input.storeId,
    storeName: input.storeName,
    storeAddress: input.storeAddress,
    reason: input.reason,
    comment: input.comment,
    withDeduction: input.withDeduction,
    responsiblePersonId: input.responsiblePersonId,
    responsiblePersonName: input.responsiblePersonName,
    items: input.items,
    photoDataUrl: input.photoDataUrl,
    totalValue: String(estimateCost(input.items)),
    status: "pending",
  })
}

export async function verifyWriteOff(
  id: string,
  responsible: { id: string; name: string } | null,
) {
  const user = await getSession()
  await db
    .update(writeOff)
    .set({
      status: "verified",
      verifiedBy: user.name,
      responsiblePersonId: responsible?.id ?? null,
      responsiblePersonName: responsible?.name ?? null,
      updatedAt: new Date(),
    })
    .where(eq(writeOff.id, id))
}

export async function decideWriteOff(id: string, decision: "approved" | "rejected") {
  const user = await getSession()
  await db
    .update(writeOff)
    .set({ status: decision, decisionBy: user.name, updatedAt: new Date() })
    .where(eq(writeOff.id, id))
}
