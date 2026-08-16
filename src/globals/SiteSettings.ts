import type { GlobalConfig } from 'payload'
import { anyone, isManagerial } from '@/access'

export const SiteSettings: GlobalConfig = {
  slug: 'siteSettings',
  label: { en: 'Site Settings', ar: 'إعدادات الموقع' },
  admin: {
    group: { en: 'Settings', ar: 'الإعدادات' },
    description: 'Logo, contact details, opening hours and social links used across the whole website.',
  },
  access: { read: anyone, update: isManagerial },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Brand', ar: 'العلامة' },
          fields: [
            { name: 'siteName', type: 'text', required: true, localized: true, defaultValue: 'Auto Service Center' },
            { name: 'tagline', type: 'text', localized: true },
            { name: 'logo', type: 'upload', relationTo: 'media', admin: { description: 'Used in the header. SVG or PNG with transparent background.' } },
            { name: 'logoDark', type: 'upload', relationTo: 'media', admin: { description: 'Optional light version for dark backgrounds.' } },
            { name: 'favicon', type: 'upload', relationTo: 'media' },
            {
              type: 'row',
              fields: [
                {
                  name: 'primaryColor',
                  type: 'text',
                  defaultValue: '#0047BA',
                  admin: {
                    width: '50%',
                    description:
                      'Main brand colour as a hex code. Used for the menu, links, headings and most buttons.',
                  },
                },
                {
                  name: 'accentColor',
                  type: 'text',
                  defaultValue: '#D42E12',
                  admin: {
                    width: '50%',
                    description:
                      'Action colour as a hex code. Used sparingly for Add to Cart, Book Now and urgent badges.',
                  },
                },
              ],
            },
          ],
        },
        {
          label: { en: 'Contact', ar: 'التواصل' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'phone', type: 'text', admin: { width: '33%' } },
                { name: 'whatsappNumber', type: 'text', admin: { width: '33%', description: 'International format, e.g. 201012345678.' } },
                { name: 'email', type: 'text', admin: { width: '34%' } },
              ],
            },
            {
              name: 'branches',
              type: 'array',
              labels: { singular: { en: 'Branch', ar: 'فرع' }, plural: { en: 'Branches', ar: 'الفروع' } },
              fields: [
                { name: 'name', type: 'text', required: true, localized: true },
                { name: 'address', type: 'textarea', required: true, localized: true },
                {
                  type: 'row',
                  fields: [
                    { name: 'phone', type: 'text', admin: { width: '50%' } },
                    { name: 'mapUrl', type: 'text', admin: { width: '50%', description: 'Google Maps link.' } },
                  ],
                },
                {
                  type: 'row',
                  fields: [
                    { name: 'latitude', type: 'number', admin: { width: '50%' } },
                    { name: 'longitude', type: 'number', admin: { width: '50%' } },
                  ],
                },
              ],
            },
            {
              name: 'openingHours',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'days', type: 'text', required: true, localized: true, admin: { width: '50%', placeholder: 'Saturday – Thursday' } },
                    { name: 'hours', type: 'text', required: true, admin: { width: '50%', placeholder: '9:00 – 21:00' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: { en: 'Social', ar: 'التواصل الاجتماعي' },
          fields: [
            {
              name: 'socialLinks',
              type: 'array',
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'platform',
                      type: 'select',
                      required: true,
                      admin: { width: '40%' },
                      options: [
                        { label: 'Facebook', value: 'facebook' },
                        { label: 'Instagram', value: 'instagram' },
                        { label: 'TikTok', value: 'tiktok' },
                        { label: 'YouTube', value: 'youtube' },
                        { label: 'X (Twitter)', value: 'x' },
                        { label: 'LinkedIn', value: 'linkedin' },
                      ],
                    },
                    { name: 'url', type: 'text', required: true, admin: { width: '60%' } },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: { en: 'Shop rules', ar: 'قواعد المتجر' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'deliveryFee',
                  type: 'number',
                  defaultValue: 50,
                  min: 0,
                  admin: { width: '50%', description: 'Standard delivery fee in EGP.' },
                },
                {
                  name: 'freeDeliveryThreshold',
                  type: 'number',
                  defaultValue: 1500,
                  min: 0,
                  admin: { width: '50%', description: 'Order total above which delivery is free. 0 disables it.' },
                },
              ],
            },
            {
              name: 'codEnabled',
              type: 'checkbox',
              defaultValue: true,
              label: { en: 'Accept cash on delivery', ar: 'قبول الدفع عند الاستلام' },
            },
            {
              name: 'onlinePaymentEnabled',
              type: 'checkbox',
              defaultValue: false,
              label: { en: 'Accept card payment online (Paymob)', ar: 'قبول الدفع بالبطاقة' },
              admin: { description: 'Turn on once your Paymob keys are set in the environment.' },
            },
          ],
        },
        {
          label: { en: 'Booking capacity', ar: 'سعة الحجوزات' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'bookingOpenTime', type: 'text', defaultValue: '09:00', admin: { width: '33%' } },
                { name: 'bookingCloseTime', type: 'text', defaultValue: '21:00', admin: { width: '33%' } },
                {
                  name: 'bookingSlotMinutes',
                  type: 'number',
                  defaultValue: 30,
                  min: 15,
                  max: 120,
                  admin: { width: '34%', description: 'Length of each bookable slot.' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'bookingsPerSlot',
                  type: 'number',
                  defaultValue: 2,
                  min: 1,
                  admin: { width: '50%', description: 'How many cars you can take in one slot (number of bays).' },
                },
                {
                  name: 'bookingLeadTimeHours',
                  type: 'number',
                  defaultValue: 2,
                  min: 0,
                  admin: { width: '50%', description: 'Minimum notice before a booking can start.' },
                },
              ],
            },
            {
              name: 'closedDays',
              type: 'select',
              hasMany: true,
              admin: { description: 'Days you do not take bookings at all.' },
              options: [
                { label: { en: 'Sunday', ar: 'الأحد' }, value: '0' },
                { label: { en: 'Monday', ar: 'الإثنين' }, value: '1' },
                { label: { en: 'Tuesday', ar: 'الثلاثاء' }, value: '2' },
                { label: { en: 'Wednesday', ar: 'الأربعاء' }, value: '3' },
                { label: { en: 'Thursday', ar: 'الخميس' }, value: '4' },
                { label: { en: 'Friday', ar: 'الجمعة' }, value: '5' },
                { label: { en: 'Saturday', ar: 'السبت' }, value: '6' },
              ],
            },
          ],
        },
        {
          label: { en: 'SEO defaults', ar: 'إعدادات SEO' },
          fields: [
            { name: 'defaultMetaTitle', type: 'text', localized: true },
            { name: 'defaultMetaDescription', type: 'textarea', localized: true, maxLength: 180 },
            { name: 'ogImage', type: 'upload', relationTo: 'media', admin: { description: 'Image shown when the site is shared on social media.' } },
          ],
        },
      ],
    },
  ],
}
