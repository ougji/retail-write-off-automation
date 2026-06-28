"use server"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { expense } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { headers } from "next/headers"
import type { Expense } from "@/lib/types"

async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error("Unauthorized")
  return session.user as { id: string; name: string }
}

function serialize(row: typeof expense.$inferSelect): Expense {
  return {
    id: row.id,
    userId: row.userId,
    submitterName: row.submitterName,
    storeId: row.storeId,
    storeName: row.storeName,
    city: row.city,
    amount: Number(row.amount),
    note: row.note,
    createdAt:
      row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt),
  }
}

export async function listExpenses(): Promise<Expense[]> {
  await getSession()
  const rows = await db.select().from(expense).orderBy(desc(expense.createdAt))
  return rows.map(serialize)
}

export interface NewExpenseInput {
  storeId: string
  storeName: string
  city: string
  amount: number
  note: string
}

export async function createExpense(input: NewExpenseInput) {
  const user = await getSession()
  await db.insert(expense).values({
    id: crypto.randomUUID(),
    userId: user.id,
    submitterName: user.name,
    storeId: input.storeId,
    storeName: input.storeName,
    city: input.city,
    amount: String(input.amount),
    note: input.note,
  })
}
