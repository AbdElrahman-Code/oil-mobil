import type { CollectionConfig } from 'payload'
import { anyone, isStaff, isTechnicalOrAbove } from '@/access'

/**
 * Admin-editable adjustment logic for the Oil Finder. Technicians refine how the
 * recommendation reacts to mileage and engine condition here — no code changes.
 * Rules are evaluated in `priority` order and the effects stack.
 */
export const OilAdjustmentRules: CollectionConfig = {
  slug: 'oilAdjustmentRules',
  labels: {
    singular: { en: 'Oil Recommendation Rule', ar: 'قاعدة توصية زيت' },
    plural: { en: 'Oil Recommendation Rules', ar: 'قواعد توصية الزيت' },
  },
  admin: {
    // Retired from the storefront. Hidden rather than deleted so existing
    // records survive; remove the collection outright once confirmed.
    hidden: true,
    group: { en: 'Vehicle Reference Data', ar: 'بيانات السيارات المرجعية' },
    useAsTitle: 'name',
    defaultColumns: ['name', 'priority', 'isActive'],
    description:
      'Fine-tune the Oil Finder without a developer. Each rule says: "when the car matches these conditions, adjust the recommendation like this." Rules run from lowest priority number to highest and their effects add up.',
  },
  access: { read: anyone, create: isTechnicalOrAbove, update: isTechnicalOrAbove, delete: isStaff },
  defaultSort: 'priority',
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { description: 'A short name for you, e.g. "High mileage over 150,000 km".' },
    },
    {
      type: 'collapsible',
      label: { en: 'When does this rule apply?', ar: 'متى تُطبَّق هذه القاعدة؟' },
      admin: {
        description: 'Leave a condition blank to ignore it. All filled-in conditions must match.',
      },
      fields: [
        {
          name: 'engineConditions',
          type: 'select',
          hasMany: true,
          label: { en: 'Engine condition is one of', ar: 'حالة المحرك' },
          options: [
            { label: { en: 'Excellent', ar: 'ممتازة' }, value: 'excellent' },
            { label: { en: 'Good', ar: 'جيدة' }, value: 'good' },
            { label: { en: 'Consumes oil', ar: 'يستهلك زيت' }, value: 'consumesOil' },
            { label: { en: 'Recently rebuilt', ar: 'تم عمل عمرة حديثاً' }, value: 'rebuilt' },
          ],
        },
        {
          type: 'row',
          fields: [
            {
              name: 'minMileageKm',
              type: 'number',
              min: 0,
              admin: { width: '50%', description: 'Applies when the car has at least this many km.' },
            },
            {
              name: 'maxMileageKm',
              type: 'number',
              min: 0,
              admin: { width: '50%', description: 'Applies when the car has at most this many km.' },
            },
          ],
        },
        {
          name: 'fuelTypes',
          type: 'select',
          hasMany: true,
          label: { en: 'Fuel type is one of', ar: 'نوع الوقود' },
          options: [
            { label: { en: 'Petrol', ar: 'بنزين' }, value: 'petrol' },
            { label: { en: 'Diesel', ar: 'ديزل' }, value: 'diesel' },
            { label: { en: 'Hybrid', ar: 'هجين' }, value: 'hybrid' },
            { label: { en: 'Natural gas (CNG)', ar: 'غاز طبيعي' }, value: 'cng' },
          ],
        },
        {
          name: 'turboOnly',
          type: 'checkbox',
          label: { en: 'Only for turbocharged engines', ar: 'للمحركات التيربو فقط' },
        },
      ],
    },
    {
      type: 'collapsible',
      label: { en: 'What should it change?', ar: 'ماذا تُغيِّر؟' },
      fields: [
        {
          name: 'viscosityShift',
          type: 'select',
          defaultValue: 'none',
          label: { en: 'Viscosity adjustment', ar: 'تعديل اللزوجة' },
          options: [
            { label: { en: 'No change', ar: 'بدون تغيير' }, value: 'none' },
            { label: { en: 'One grade thicker (e.g. 5W-30 → 5W-40)', ar: 'درجة أثقل' }, value: 'thicker' },
            { label: { en: 'One grade thinner (e.g. 5W-40 → 5W-30)', ar: 'درجة أخف' }, value: 'thinner' },
          ],
          admin: { description: 'Shifts the second number of the SAE grade by 10.' },
        },
        {
          type: 'row',
          fields: [
            {
              name: 'intervalKmMultiplier',
              type: 'number',
              defaultValue: 1,
              min: 0.1,
              max: 2,
              admin: {
                width: '50%',
                step: 0.05,
                description: 'Multiply the km interval. 0.8 = change 20% sooner. 1 = no change.',
              },
            },
            {
              name: 'intervalMonthsMultiplier',
              type: 'number',
              defaultValue: 1,
              min: 0.1,
              max: 2,
              admin: { width: '50%', step: 0.05, description: 'Same, for the months interval.' },
            },
          ],
        },
        {
          name: 'forceOilType',
          type: 'select',
          label: { en: 'Force a specific oil type', ar: 'إلزام نوع زيت معيّن' },
          options: [
            { label: { en: 'Full synthetic', ar: 'صناعي بالكامل' }, value: 'fullSynthetic' },
            { label: { en: 'Semi synthetic', ar: 'نصف صناعي' }, value: 'semiSynthetic' },
            { label: { en: 'Mineral', ar: 'معدني' }, value: 'mineral' },
          ],
          admin: { description: 'Leave empty to keep whatever the spec entry says.' },
        },
        {
          name: 'customerNote',
          type: 'textarea',
          localized: true,
          admin: {
            description:
              'Extra line shown to the customer with the result, e.g. "Your engine burns oil — check the level every 1,000 km."',
          },
        },
        {
          name: 'flagForStaffReview',
          type: 'checkbox',
          admin: {
            description:
              'Tick for rare cases (e.g. a rebuilt engine) where you want the result marked "our technician will confirm".',
          },
        },
      ],
    },
    {
      name: 'priority',
      type: 'number',
      required: true,
      defaultValue: 100,
      admin: { position: 'sidebar', description: 'Lower numbers run first.' },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Uncheck to switch this rule off temporarily.' },
    },
  ],
}
