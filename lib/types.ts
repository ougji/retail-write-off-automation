export type WriteOffStatus = "pending" | "approved" | "rejected"
export type WriteOffType = "no_deduction" | "with_deduction"
export type UserRole = "employee" | "reviewer"

export interface WriteOff {
  id: string
  employee_id: string
  employee_name: string
  store_location: string
  photo: string | null
  write_off_type: WriteOffType
  deduct_employee: string | null
  comment: string
  status: WriteOffStatus
  reviewer_id: string | null
  reviewed_at: string | null
  created_at: string
}

export const STORE_LOCATIONS = [
  "Downtown Flagship",
  "Westfield Mall",
  "Northside Plaza",
  "Eastgate Center",
  "Harbor Point",
  "Airport Terminal",
] as const
