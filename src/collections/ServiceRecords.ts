import type { CollectionConfig } from 'payload'
import { isManagerial, isTechnicalOrAbove, staffOrOwnCustomerRecord } from '@/access'
import { addMonths } from 'date-fns'

export const ServiceRecords: CollectionConfig = {
  slug: 'serviceRecords',
  labels: {
    singular: { en: 'Service Record', ar: 'سجل صيانة' },
    plural: { en: 'Service History', ar: 'سجل الصيانة' },
  },
  admin: {
    group: { en: 'Workshop', ar: 'الورشة' },
    useAsTitle: 'summary',
    defaultColumns: ['summary', 'vehicle', 'serviceDate', 'mileageAtService', 'cost'],
    description:
      'What was done to a car and when. Saving an oil change here automatically sets the car’s next oil-change date and mileage.',
  },
  access: {
    read: staffOrOwnCustomerRecord('customerSnapshot'),
    create: isTechnicalOrAbove,
    update: isTechnicalOrAbove,
    delete: isManagerial,
  },
  defaultSort: '-serviceDate',
  fields: [
    {
      name: 'summary',
      type: 'text',
      admin: { readOnly: true, position: 'sidebar', description: 'Generated automatically.' },
      hooks: {
        beforeChange: [
          ({ data }) => {
            const kinds = (data?.serviceTypes ?? []) as string[]
            const date = data?.serviceDate ? new Date(data.serviceDate).toISOString().slice(0, 10) : ''
            return `${date} · ${kinds.length ? kinds.join(', ') : 'service'}`
          },
        ],
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'vehicle',
          type: 'relationship',
          relationTo: 'vehicles',
          required: true,
          index: true,
          admin: { width: '50%' },
        },
        {
          name: 'customerSnapshot',
          type: 'relationship',
          relationTo: 'customers',
          index: true,
          admin: {
            width: '50%',
            readOnly: true,
            description: 'Filled in from the car’s owner so customers can see their own history.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'serviceDate',
          type: 'date',
          required: true,
          index: true,
          defaultValue: () => new Date().toISOString(),
          admin: { width: '50%', date: { pickerAppearance: 'dayOnly', displayFormat: 'dd MMM yyyy' } },
        },
        {
          name: 'mileageAtService',
          type: 'number',
          required: true,
          min: 0,
          admin: { width: '50%', description: 'Odometer reading on the day, in km.' },
        },
      ],
    },
    {
      name: 'serviceTypes',
      type: 'select',
      hasMany: true,
      required: true,
      options: [
        { label: { en: 'Oil change', ar: 'تغيير زيت' }, value: 'oilChange' },
        { label: { en: 'Filter change', ar: 'تغيير فلاتر' }, value: 'filterChange' },
        { label: { en: 'Car wash', ar: 'غسيل' }, value: 'wash' },
        { label: { en: 'Battery', ar: 'بطارية' }, value: 'battery' },
        { label: { en: 'Inspection', ar: 'فحص' }, value: 'inspection' },
        { label: { en: 'Other repair', ar: 'إصلاح آخر' }, value: 'repair' },
      ],
    },
    { name: 'workPerformed', type: 'richText', localized: false },
    {
      type: 'collapsible',
      label: { en: 'Parts & materials used', ar: 'القطع والمواد المستخدمة' },
      fields: [
        {
          name: 'oilUsed',
          type: 'relationship',
          relationTo: 'products',
          filterOptions: () => ({ productType: { equals: 'oil' } }),
        },
        {
          type: 'row',
          fields: [
            {
              name: 'oilQuantityLiters',
              type: 'number',
              min: 0,
              admin: { width: '50%', step: 0.1 },
            },
            {
              name: 'oilViscosityUsed',
              type: 'text',
              admin: { width: '50%', placeholder: '5W-30' },
            },
          ],
        },
        {
          name: 'filtersUsed',
          type: 'relationship',
          relationTo: 'products',
          hasMany: true,
          filterOptions: () => ({ productType: { equals: 'filter' } }),
        },
        {
          name: 'partsUsed',
          type: 'array',
          labels: { singular: { en: 'Part', ar: 'قطعة' }, plural: { en: 'Parts', ar: 'القطع' } },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'product', type: 'relationship', relationTo: 'products', admin: { width: '40%' } },
                { name: 'description', type: 'text', admin: { width: '30%', description: 'For parts not in the shop.' } },
                { name: 'quantity', type: 'number', defaultValue: 1, min: 1, admin: { width: '15%' } },
                { name: 'unitPrice', type: 'number', min: 0, admin: { width: '15%' } },
              ],
            },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'labourCost',
          type: 'number',
          defaultValue: 0,
          min: 0,
          admin: { width: '50%', description: 'EGP.' },
        },
        {
          name: 'cost',
          type: 'number',
          required: true,
          min: 0,
          admin: { width: '50%', description: 'Total charged to the customer, EGP.' },
        },
      ],
    },
    {
      name: 'nextServiceOverride',
      type: 'group',
      label: { en: 'Next oil change (optional override)', ar: 'موعد التغيير القادم (اختياري)' },
      admin: {
        description:
          'Leave blank and we work it out from the recommended interval for this car. Fill in to override.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'nextMileage', type: 'number', min: 0, admin: { width: '50%' } },
            {
              name: 'nextDate',
              type: 'date',
              admin: { width: '50%', date: { pickerAppearance: 'dayOnly' } },
            },
          ],
        },
      ],
    },
    {
      name: 'performedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: { position: 'sidebar', description: 'Technician who did the work.' },
    },
    {
      name: 'invoice',
      type: 'relationship',
      relationTo: 'invoices',
      admin: { position: 'sidebar', description: 'Generated invoice, if one was issued.' },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        // Copy the owner across so the customer portal can filter on it.
        if (data?.vehicle && !data.customerSnapshot) {
          const vehicleId = typeof data.vehicle === 'object' ? data.vehicle.id : data.vehicle
          try {
            const vehicle = await req.payload.findByID({
              collection: 'vehicles',
              id: vehicleId,
              depth: 0,
              req,
            })
            data.customerSnapshot =
              typeof vehicle.owner === 'object' ? vehicle.owner?.id : vehicle.owner
          } catch {
            /* vehicle may not exist yet during seeding */
          }
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        const vehicleId = typeof doc.vehicle === 'object' ? doc.vehicle?.id : doc.vehicle
        if (!vehicleId) return doc

        const didOilChange = (doc.serviceTypes ?? []).includes('oilChange')
        const update: Record<string, unknown> = {
          currentMileage: doc.mileageAtService,
          lastServiceDate: doc.serviceDate,
          lastServiceMileage: doc.mileageAtService,
        }

        if (didOilChange) {
          // Default interval; refined below if the car has a matching oil spec.
          let intervalKm = 10000
          let intervalMonths = 6
          try {
            const vehicle = await req.payload.findByID({
              collection: 'vehicles',
              id: vehicleId,
              depth: 0,
              req,
            })
            const modelId = typeof vehicle.model === 'object' ? vehicle.model?.id : vehicle.model
            if (modelId) {
              const specs = await req.payload.find({
                collection: 'oilSpecifications',
                where: { vehicleModel: { equals: modelId } },
                limit: 1,
                depth: 0,
                req,
              })
              const spec = specs.docs[0]
              if (spec) {
                intervalKm = spec.recommendedChangeIntervalKm ?? intervalKm
                intervalMonths = spec.recommendedChangeIntervalMonths ?? intervalMonths
              }
            }
          } catch {
            /* fall back to defaults */
          }

          update.nextOilChangeMileage =
            doc.nextServiceOverride?.nextMileage ?? Number(doc.mileageAtService ?? 0) + intervalKm
          update.nextOilChangeDate =
            doc.nextServiceOverride?.nextDate ??
            addMonths(new Date(doc.serviceDate ?? Date.now()), intervalMonths).toISOString()
          update.reminderSent = false
          if (doc.oilViscosityUsed) update.oilViscosity = doc.oilViscosityUsed
        }

        try {
          await req.payload.update({ collection: 'vehicles', id: vehicleId, data: update, req })
        } catch (error) {
          req.payload.logger.error({ err: error }, `Could not update vehicle ${vehicleId} after service`)
        }
        return doc
      },
    ],
  },
  timestamps: true,
}
