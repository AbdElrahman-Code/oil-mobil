import type { CollectionConfig } from 'payload'
import { isStaffUser, isSuperadmin, isSuperadminField, staffOrSelf } from '@/access'

/** Staff/admin accounts. Customers authenticate through the `customers` collection. */
export const Users: CollectionConfig = {
  slug: 'users',
  labels: { singular: { en: 'Staff Member', ar: 'موظف' }, plural: { en: 'Staff & Admins', ar: 'الموظفون' } },
  auth: {
    tokenExpiration: 60 * 60 * 8,
    maxLoginAttempts: 8,
    lockTime: 10 * 60 * 1000,
  },
  admin: {
    group: { en: 'Settings', ar: 'الإعدادات' },
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'role', 'isActive'],
    description: 'Who can log into this admin panel, and what each person is allowed to do.',
  },
  access: {
    read: staffOrSelf,
    create: isSuperadmin,
    update: staffOrSelf,
    delete: isSuperadmin,
    admin: ({ req: { user } }) => isStaffUser(user),
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'salesStaff',
      access: { update: isSuperadminField },
      admin: {
        description: 'Only a Super Admin can change roles.',
      },
      options: [
        { label: { en: 'Super Admin — full access', ar: 'مدير عام — صلاحية كاملة' }, value: 'superadmin' },
        { label: { en: 'Manager — everything except staff accounts', ar: 'مدير — كل شيء عدا حسابات الموظفين' }, value: 'manager' },
        { label: { en: 'Technician — workshop records only', ar: 'فني — سجلات الورشة فقط' }, value: 'technician' },
        { label: { en: 'Sales Staff — orders, bookings, customers', ar: 'مبيعات — الطلبات والحجوزات والعملاء' }, value: 'salesStaff' },
      ],
    },
    {
      name: 'phone',
      type: 'text',
      admin: { description: 'Used for internal contact and WhatsApp notifications.' },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      access: { update: isSuperadminField },
      admin: { position: 'sidebar', description: 'Uncheck to suspend this account without deleting it.' },
    },
  ],
}
