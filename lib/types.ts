export type Role = "line_staff" | "supervisor" | "control"

export type WriteOffStatus = "pending" | "verified" | "approved" | "rejected"
export type WriteOffType = "no_deduction" | "with_deduction"

export interface Ingredient {
  id: string
  name: string
  quantity: number
}

export interface WriteOff {
  id: string
  store_location: string
  photo: string | null
  write_off_type: WriteOffType
  comment: string
  ingredients: Ingredient[]
  submitted_by: string
  responsible_employee: string | null
  estimated_cost: number
  status: WriteOffStatus
  created_at: string
}

export const ROLES: { value: Role; label: string; subtitle: string }[] = [
  { value: "line_staff", label: "Line Staff", subtitle: "Cashier / Chef" },
  { value: "supervisor", label: "Supervisor", subtitle: "Store Manager" },
  { value: "control", label: "Control Department", subtitle: "Global Admin" },
]

export const ROLE_LABELS: Record<Role, string> = {
  line_staff: "Line Staff",
  supervisor: "Supervisor",
  control: "Control Department",
}

export const STORE_LOCATIONS = [
  "Downtown Flagship",
  "Westfield Mall",
  "Northside Plaza",
  "Eastgate Center",
  "Harbor Point",
  "Airport Terminal",
] as const

export const EMPLOYEES = [
  "Alex Rivera",
  "Jordan Chen",
  "Sam Patel",
  "Taylor Brooks",
  "Morgan Lee",
  "Casey Nguyen",
] as const

export const STATUS_META: Record<
  WriteOffStatus,
  { label: string; className: string }
> = {
  pending: {
    label: "Pending",
    className: "bg-chart-2/15 text-chart-2 border-chart-2/30",
  },
  verified: {
    label: "Verified",
    className: "bg-chart-4/15 text-chart-4 border-chart-4/30",
  },
  approved: {
    label: "Approved",
    className: "bg-primary/15 text-primary border-primary/30",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
}
