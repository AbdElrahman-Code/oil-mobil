/**
 * Starter legal text. Deliberately plain and specific to this business so the
 * client edits real sentences rather than replacing lorem ipsum — but it is a
 * starting draft, not legal advice, and should be reviewed before launch.
 */
export type LegalSeed = {
  slug: string
  order: number
  en: { title: string; blocks: string[] }
  ar: { title: string; blocks: string[] }
}

export const legalPages: LegalSeed[] = [
  {
    slug: 'terms',
    order: 10,
    en: {
      title: 'Terms of Service',
      blocks: [
        'These terms cover your use of this website, the products you order from it, and the services you book through it. By placing an order or making a booking you accept them.',
        'Orders. Placing an order is an offer to buy. The order is accepted once we confirm it by phone or WhatsApp. We may decline an order if an item is out of stock or the delivery address is outside the areas we serve, and we will tell you if that happens.',
        'Prices and payment. All prices are in Egyptian pounds and include applicable taxes unless stated otherwise. Cash on delivery and payment at the branch are available; card payment is available where shown at checkout. The price charged is the price shown when the order is placed.',
        'Fitting and workshop services. Work is carried out by our technicians at our branches. Recommendations produced by the Oil Finder are guidance based on the vehicle details you provide; the technician confirms the final specification before any work is done.',
        'Bookings. Wash and detailing appointments are held for fifteen minutes past the booked time. If you are running late, call the branch and we will re-slot you where we can.',
        'Liability. We are responsible for work we carry out and products we supply. We are not responsible for pre-existing faults, for damage caused by parts fitted elsewhere, or for consequential losses such as lost income while a vehicle is off the road.',
        'Changes. We may update these terms; the version published here at the time of your order is the one that applies.',
      ],
    },
    ar: {
      title: 'شروط الخدمة',
      blocks: [
        'تغطي هذه الشروط استخدامك للموقع، والمنتجات التي تطلبها منه، والخدمات التي تحجزها من خلاله. بإتمام أي طلب أو حجز فإنك توافق عليها.',
        'الطلبات: إرسال الطلب يُعد عرضاً للشراء، ويصبح الطلب مؤكداً بعد تواصلنا معك هاتفياً أو عبر واتساب. يحق لنا رفض الطلب إذا نفدت الكمية أو كان عنوان التوصيل خارج نطاق خدمتنا، وسنخبرك في هذه الحالة.',
        'الأسعار والدفع: جميع الأسعار بالجنيه المصري وشاملة الضرائب المطبقة ما لم يُذكر غير ذلك. يتاح الدفع عند الاستلام والدفع في الفرع، والدفع بالبطاقة عند إتاحته في صفحة إتمام الطلب. السعر المحتسب هو السعر المعروض وقت إتمام الطلب.',
        'التركيب وخدمات الورشة: تتم الأعمال بواسطة فنيينا في فروعنا. توصيات دليل الزيوت إرشادية وتعتمد على بيانات السيارة التي تدخلها، ويؤكد الفني المواصفة النهائية قبل تنفيذ أي عمل.',
        'الحجوزات: نحتفظ بموعد الغسيل أو التلميع لمدة خمس عشرة دقيقة بعد الموعد المحجوز. إذا تأخرت، اتصل بالفرع وسنحاول إعادة جدولة موعدك.',
        'المسؤولية: نتحمل مسؤولية الأعمال التي ننفذها والمنتجات التي نوردها. ولا نتحمل مسؤولية الأعطال السابقة، أو الأضرار الناتجة عن قطع رُكبت في مكان آخر، أو الخسائر التبعية مثل توقف الدخل أثناء توقف السيارة.',
        'التعديلات: قد نقوم بتحديث هذه الشروط، والنسخة المنشورة هنا وقت طلبك هي النسخة السارية.',
      ],
    },
  },
  {
    slug: 'privacy',
    order: 20,
    en: {
      title: 'Privacy Policy',
      blocks: [
        'This policy explains what we collect, why we collect it, and what you can ask us to do with it.',
        'What we collect. Your name and phone number, and your address when you choose delivery. If you create an account we also keep your vehicles, service history, orders, invoices and bookings so you can see them later. We keep an email address only if you give us one.',
        'Why we collect it. To confirm and deliver orders, to carry out and record workshop services, to send you service reminders and booking confirmations, and to answer enquiries you send us through the Oil Finder.',
        'Messages. We contact you by phone, SMS or WhatsApp about your orders, bookings and service reminders. You can ask us to stop marketing messages at any time; we will still send messages needed to complete an order or booking you have placed.',
        'Analytics. We use privacy-respecting analytics to understand which pages and features are used. This does not identify you personally.',
        'Sharing. We do not sell your data. We share it only with the delivery courier for your order, with our payment provider when you pay by card, and where the law requires it.',
        'Your rights. You can ask us for a copy of your data, ask us to correct it, or ask us to delete your account. Records tied to a tax invoice are kept for the period Egyptian tax law requires.',
        'Contact. To make any of these requests, call the branch or use the contact details in the footer of this site.',
      ],
    },
    ar: {
      title: 'سياسة الخصوصية',
      blocks: [
        'توضح هذه السياسة ما نجمعه من بيانات، ولماذا نجمعه، وما يمكنك أن تطلبه منا بشأنه.',
        'ما نجمعه: اسمك ورقم هاتفك، وعنوانك عند اختيار التوصيل. وإذا أنشأت حساباً نحتفظ أيضاً ببيانات سياراتك وسجل الصيانة والطلبات والفواتير والحجوزات حتى تتمكن من الرجوع إليها. ولا نحتفظ ببريد إلكتروني إلا إذا زودتنا به.',
        'لماذا نجمعه: لتأكيد الطلبات وتوصيلها، ولتنفيذ أعمال الورشة وتسجيلها، ولإرسال تنبيهات الصيانة وتأكيدات الحجز، وللرد على استفساراتك عبر دليل الزيوت.',
        'الرسائل: نتواصل معك هاتفياً أو عبر الرسائل القصيرة أو واتساب بخصوص طلباتك وحجوزاتك وتنبيهات الصيانة. يمكنك طلب إيقاف الرسائل التسويقية في أي وقت، وسنستمر فقط في إرسال الرسائل اللازمة لإتمام طلب أو حجز قائم.',
        'التحليلات: نستخدم أدوات تحليل تحترم الخصوصية لمعرفة الصفحات والخصائص الأكثر استخداماً، وهي لا تحدد هويتك الشخصية.',
        'المشاركة: لا نبيع بياناتك. ولا نشاركها إلا مع شركة التوصيل الخاصة بطلبك، ومع مزود خدمة الدفع عند السداد بالبطاقة، وفي الحالات التي يفرضها القانون.',
        'حقوقك: يمكنك طلب نسخة من بياناتك، أو تصحيحها، أو حذف حسابك. أما السجلات المرتبطة بفاتورة ضريبية فنحتفظ بها للمدة التي يفرضها قانون الضرائب المصري.',
        'التواصل: لتقديم أي من هذه الطلبات، اتصل بالفرع أو استخدم بيانات التواصل الموجودة أسفل الموقع.',
      ],
    },
  },
  {
    slug: 'returns',
    order: 30,
    en: {
      title: 'Return & Refund Policy',
      blocks: [
        'If something is not right, tell us within 14 days of receiving it and we will put it right.',
        'What can be returned. Unopened products in their original packaging, with the invoice or order number. Return delivery is free if the item is faulty or we sent the wrong thing.',
        'What cannot be returned. Oils, fluids and chemicals once the seal is broken, and any product already fitted to a vehicle — for safety and contamination reasons. This does not affect your rights if the product itself is defective.',
        'Batteries and warranty parts. Batteries carry the manufacturer warranty stated on the product page. Bring the battery and the invoice to any branch and we will test it and process the warranty claim for you.',
        'Refunds. Once the return is checked, cash payments are refunded at the branch and card payments are returned to the same card, normally within 7 to 14 working days depending on the bank.',
        'Wrong oil supplied. If the Oil Finder or our technician specified the wrong oil for your vehicle, we replace the oil and carry out the change at no charge.',
        'How to start a return. Call the branch or send the order number on WhatsApp and we will arrange collection or tell you which branch to bring it to.',
      ],
    },
    ar: {
      title: 'سياسة الاسترجاع والاسترداد',
      blocks: [
        'إذا كان هناك أي خطأ، أخبرنا خلال 14 يوماً من الاستلام وسنقوم بتصحيحه.',
        'ما يمكن إرجاعه: المنتجات غير المفتوحة بعبوتها الأصلية مع الفاتورة أو رقم الطلب. ويكون الإرجاع مجانياً إذا كان المنتج معيباً أو إذا أرسلنا صنفاً خاطئاً.',
        'ما لا يمكن إرجاعه: الزيوت والسوائل والمواد الكيماوية بعد فتح الختم، وأي منتج تم تركيبه بالفعل في السيارة، وذلك لأسباب تتعلق بالسلامة والتلوث. ولا يؤثر ذلك على حقوقك إذا كان المنتج نفسه معيباً.',
        'البطاريات وقطع الضمان: تخضع البطاريات لضمان المصنّع الموضح في صفحة المنتج. أحضر البطارية والفاتورة إلى أي فرع وسنقوم باختبارها وإنهاء إجراءات الضمان نيابة عنك.',
        'الاسترداد: بعد فحص المرتجع، تُرد المبالغ النقدية في الفرع، وتُرد مدفوعات البطاقات إلى نفس البطاقة خلال 7 إلى 14 يوم عمل عادةً حسب البنك.',
        'زيت غير مناسب: إذا حدد دليل الزيوت أو الفني زيتاً غير مناسب لسيارتك، نقوم باستبدال الزيت وتنفيذ التغيير دون أي تكلفة.',
        'كيف تبدأ الإرجاع: اتصل بالفرع أو أرسل رقم الطلب على واتساب وسنرتب استلام المنتج أو نوضح لك الفرع الأقرب لتسليمه.',
      ],
    },
  },
]
