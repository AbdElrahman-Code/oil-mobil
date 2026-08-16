import type { Access, FieldAccess } from 'payload'
import type { User } from '@/payload-types'

export type StaffRole = 'superadmin' | 'manager' | 'technician' | 'salesStaff'

const roleOf = (user: unknown): StaffRole | undefined => {
  const u = user as Partial<User> | null | undefined
  return u?.role as StaffRole | undefined
}

/** True when the authenticated principal is a staff member (collection `users`). */
export const isStaffUser = (user: unknown): user is User =>
  Boolean(user && (user as { collection?: string }).collection === 'users')

/** Public read. Used for catalog/content collections. */
export const anyone: Access = () => true

export const isSuperadmin: Access = ({ req: { user } }) =>
  isStaffUser(user) && roleOf(user) === 'superadmin'

export const isStaff: Access = ({ req: { user } }) => isStaffUser(user)

/** Superadmin or manager — the two roles allowed to change money-related data. */
export const isManagerial: Access = ({ req: { user } }) =>
  isStaffUser(user) && ['superadmin', 'manager'].includes(roleOf(user) ?? '')

/** Staff who deal with customers day to day (everyone except technicians). */
export const isSalesOrAbove: Access = ({ req: { user } }) =>
  isStaffUser(user) && ['superadmin', 'manager', 'salesStaff'].includes(roleOf(user) ?? '')

/** Technicians can touch workshop data; managers and above can too. */
export const isTechnicalOrAbove: Access = ({ req: { user } }) =>
  isStaffUser(user) && ['superadmin', 'manager', 'technician'].includes(roleOf(user) ?? '')

export const isTechnicalOrAboveField: FieldAccess = ({ req: { user } }) =>
  isStaffUser(user) && ['superadmin', 'manager', 'technician'].includes(roleOf(user) ?? '')

export const isStaffField: FieldAccess = ({ req: { user } }) => isStaffUser(user)

export const isSuperadminField: FieldAccess = ({ req: { user } }) =>
  isStaffUser(user) && roleOf(user) === 'superadmin'

export const isManagerialField: FieldAccess = ({ req: { user } }) =>
  isStaffUser(user) && ['superadmin', 'manager'].includes(roleOf(user) ?? '')

/**
 * Staff see everything; a logged-in customer sees only rows they own.
 * `ownerField` is the field on the collection holding the customer relation.
 */
export const staffOrOwnCustomerRecord =
  (ownerField = 'customer'): Access =>
  ({ req: { user } }) => {
    if (!user) return false
    if (isStaffUser(user)) return true
    if ((user as { collection?: string }).collection === 'customers') {
      return { [ownerField]: { equals: user.id } }
    }
    return false
  }

/** Customers may read/update their own auth record; staff may manage all. */
export const staffOrSelf: Access = ({ req: { user } }) => {
  if (!user) return false
  if (isStaffUser(user)) return true
  return { id: { equals: user.id } }
}
