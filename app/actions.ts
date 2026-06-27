"use server"

import { createClient } from "@/lib/supabase/server"
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
  const deductEmployee = String(formData.get("deduct_employee") || "").trim()
  const photo = String(formData.get("photo") || "")

  if (!storeLocation) return { error: "Please select a store location." }
  if (writeOffType !== "no_deduction" && writeOffType !== "with_deduction")
    return { error: "Please choose a write-off type." }
  if (!comment) return { error: "Please add a comment describing the write-off." }
  if (writeOffType === "with_deduction" && !deductEmployee)
    return { error: "Please name the employee to deduct from." }

  const employeeName = (user.user_metadata?.full_name as string) || user.email || "Unknown"

  const { error } = await supabase.from("write_offs").insert({
    employee_id: user.id,
    employee_name: employeeName,
    store_location: storeLocation,
    photo: photo || null,
    write_off_type: writeOffType,
    deduct_employee: writeOffType === "with_deduction" ? deductEmployee : null,
    comment,
  })

  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  return { success: true }
}

export async function reviewWriteOff(id: string, decision: "approved" | "rejected") {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: "You must be logged in." }
  if (user.user_metadata?.role !== "reviewer") return { error: "Only reviewers can do this." }

  const { error } = await supabase
    .from("write_offs")
    .update({ status: decision, reviewer_id: user.id, reviewed_at: new Date().toISOString() })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/dashboard")
  return { success: true }
}
