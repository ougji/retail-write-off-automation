export type Role = "line_staff" | "supervisor" | "control"

export type WriteOffStatus = "pending" | "verified" | "approved" | "rejected"

export interface Ingredient {
  id: string
  name: string
  quantity: number
}

export interface WriteOff {
  id: string
  userId: string
  submitterName: string
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
  totalValue: number
  status: WriteOffStatus
  verifiedBy: string | null
  decisionBy: string | null
  createdAt: string
}

export interface Expense {
  id: string
  userId: string
  submitterName: string
  storeId: string
  storeName: string
  city: string
  amount: number
  note: string
  createdAt: string
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

export const STATUS_META: Record<WriteOffStatus, { label: string; className: string }> = {
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
