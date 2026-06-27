"use server"

import { createClient } from "@/lib/supabase/server"
import { normalizeRole, MIN_COMMENT_LENGTH } from "@/lib/types"
import { revalidatePath } from "next/cache"

export async function submitWriteOff(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "You must be logged in." }

  const writeOffType = String(formData.get("write_off_type") || "")
  const storeLocation = String(formData.get("store_location") || "")
  const comment = String(formData.get("comment") || "").trim()
  const photo = String(formData.get("photo") || "")

  if (!storeLocation) return { error: "Please select a store location." }
  if (writeOffType !== "no_deduction" && writeOffType !== "with_deduction")
    return { error: "Please choose a write-off type." }
  if (comment.length < MIN_COMMENT_LENGTH)
    return { error: `Comment must be at least ${MIN_COMMENT_LENGTH} characters.` }

  const employeeName = (user.user_metadata?.full_name as string) || user.email || "Unknown"

  const { error } = await supabase.from("write_offs").insert({
    employee_id: user.id,
    employee_name: employeeName,
    store_location: storeLocation,
    photo: photo || null,
    write_off_type: writeOffType,
    deduct_employee: null,
    comment,
  })

  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  return { success: true }
}

// Supervisor verifies a pending request for their own store.
// For "with_deduction" requests, an employee code must be assigned.
export async function verifyWriteOff(id: string, deductEmployee?: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "You must be logged in." }
  if (normalizeRole(user.user_metadata?.role as string) !== "supervisor")
    return { error: "Only supervisors can verify requests." }

  // Read the row to enforce store scope + deduction rules
  const { data: row, error: readError } = await supabase
    .from("write_offs")
    .select("write_off_type, store_location, status")
    .eq("id", id)
    .single()

  if (readError || !row) return { error: "Request not found." }

  const myStore = user.user_metadata?.store_location as string | undefined
  if (row.store_location !== myStore) return { error: "This request belongs to another store." }
  if (row.status !== "pending") return { error: "This request has already been processed." }
  if (row.write_off_type === "with_deduction" && !deductEmployee)
    return { error: "Assign an employee code before verifying." }

  const { error } = await supabase
    .from("write_offs")
    .update({
      status: "verified",
      verified_by: user.id,
      verified_at: new Date().toISOString(),
      deduct_employee: row.write_off_type === "with_deduction" ? deductEmployee : null,
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  return { success: true }
}

// Control Department gives final approval and "syncs to iiko".
export async function approveWriteOff(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "You must be logged in." }
  if (normalizeRole(user.user_metadata?.role as string) !== "control")
    return { error: "Only the Control Department can give final approval." }

  const { error } = await supabase
    .from("write_offs")
    .update({ status: "approved", reviewer_id: user.id, reviewed_at: new Date().toISOString() })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  return { success: true }
}

// Reject is available to both supervisors (own store) and control (global).
export async function rejectWriteOff(id: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "You must be logged in." }
  const role = normalizeRole(user.user_metadata?.role as string)
  if (role !== "supervisor" && role !== "control")
    return { error: "You are not allowed to reject requests." }

  const { error } = await supabase
    .from("write_offs")
    .update({
      status: "rejected",
      reviewer_id: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  return { success: true }
}
