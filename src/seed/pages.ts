/**
 * Content for the About, Contact and FAQ pages. Written as real copy for this
 * business so the client edits sentences rather than replacing lorem ipsum.
 */

export type PageSeed = {
  slug: string
  order: number
  showInHeader: boolean
  en: { title: string; metaTitle: string; metaDescription: string }
  ar: { title: string; metaTitle: string; metaDescription: string }
}

export const pageMeta: Record<'about' | 'contact' | 'faq', PageSeed> = {
  about: {
    slug: 'about',
    order: 10,
    showInHeader: true,
    en: {
      title: 'About us',
      metaTitle: 'About us — who services your car',
      metaDescription:
        'Two branches in Cairo and Giza, technicians who keep a digital record of every car, and only genuine oils and parts.',
    },
    ar: {
      title: 'من نحن',
      metaTitle: 'من نحن — الناس اللي بتصلح عربيتك',
      metaDescription:
        'فرعان في القاهرة والجيزة، فنيون يسجلون تاريخ كل سيارة رقمياً، وزيوت وقطع غيار أصلية فقط.',
    },
  },
  contact: {
    slug: 'contact',
    order: 20,
    showInHeader: true,
    en: {
      title: 'Contact',
      metaTitle: 'Contact us — branches, phone and opening hours',
      metaDescription: 'Call us, message us on WhatsApp, or drop into either branch in Cairo or Giza.',
    },
    ar: {
      title: 'تواصل معنا',
      metaTitle: 'تواصل معنا — الفروع والهاتف ومواعيد العمل',
      metaDescription: 'اتصل بنا أو راسلنا على واتساب أو زُر أحد فرعينا في القاهرة والجيزة.',
    },
  },
  faq: {
    slug: 'faq',
    order: 30,
    showInHeader: false,
    en: {
      title: 'Frequently asked questions',
      metaTitle: 'FAQ — oil changes, delivery, warranty',
      metaDescription:
        'How often to change your oil, what delivery costs, how the warranty works, and what to bring to an appointment.',
    },
    ar: {
      title: 'الأسئلة الشائعة',
      metaTitle: 'الأسئلة الشائعة — تغيير الزيت والتوصيل والضمان',
      metaDescription: 'كل كام تغيّر الزيت، تكلفة التوصيل، كيف يعمل الضمان، وماذا تحضر معك للموعد.',
    },
  },
}

/* ─────────────────────────────── About ─────────────────────────────── */

export const aboutContent = {
  hero: {
    en: {
      eyebrow: 'Since 2009',
      heading: 'We fix cars the way we would want ours fixed',
      subheading:
        'Two branches, sixteen technicians, and one rule: no car leaves without a record of exactly what we did to it and why.',
    },
    ar: {
      eyebrow: 'منذ 2009',
      heading: 'بنصلح العربيات زي ما كنا نحب عربياتنا تتصلح',
      subheading:
        'فرعان، ستة عشر فنياً، وقاعدة واحدة: مفيش عربية تخرج من غير سجل بكل اللي عملناه فيها وليه.',
    },
  },
  story: {
    en: {
      eyebrow: 'How we started',
      heading: 'One bay in Nasr City, and a notebook',
      body: [
        'We opened in 2009 with a single service bay and a paper notebook for customer records. The notebook is why we are still here: when someone came back a year later, we knew exactly which oil their engine took, what we had noticed last time, and what was due.',
        'That notebook is now this website. Every oil change, filter and repair is recorded against the car, and customers can see their own history, invoices and next service date from their phone.',
        'What has not changed is the answer to "which oil does my car need?" — it comes from the manufacturer specification for that exact engine and year, not from whatever we have most of in the store room.',
      ],
      bullets: [
        'Genuine oils and parts, with the invoice to prove it',
        'A digital service record for every car we touch',
        'The same price whether you know engines or not',
      ],
    },
    ar: {
      eyebrow: 'البداية',
      heading: 'مكان واحد في مدينة نصر، ودفتر',
      body: [
        'بدأنا سنة 2009 بمكان خدمة واحد ودفتر ورقي لتسجيل بيانات العملاء. الدفتر ده هو سبب استمرارنا: لما حد كان يرجع بعد سنة، كنا عارفين بالظبط عربيته بتاخد زيت إيه، ولاحظنا إيه المرة اللي فاتت، وإيه اللي مستحق.',
        'الدفتر ده بقى الموقع اللي انت فيه دلوقتي. كل تغيير زيت وفلتر وإصلاح بيتسجل على العربية، والعميل يقدر يشوف تاريخه وفواتيره وموعد الصيانة الجاي من موبايله.',
        'الحاجة اللي ما اتغيرتش هي إجابة سؤال "عربيتي بتاخد زيت إيه؟" — الإجابة بتيجي من مواصفات المصنّع للمحرك والسنة بالظبط، مش من اللي متوفر عندنا في المخزن.',
      ],
      bullets: [
        'زيوت وقطع غيار أصلية، والفاتورة تثبت ذلك',
        'سجل صيانة رقمي لكل عربية بنخدمها',
        'نفس السعر سواء كنت فاهم في المحركات أو لا',
      ],
    },
  },
  values: {
    en: {
      heading: 'What you can hold us to',
      subheading: 'Four promises that shape how the workshop runs.',
      items: [
        { icon: 'shield', title: 'Genuine parts only', description: 'Every oil and filter we fit is traceable to its supplier, and it is on your invoice.' },
        { icon: 'droplet', title: 'The right specification', description: 'We fit what the manufacturer specifies for your engine and year — not the nearest thing on the shelf.' },
        { icon: 'clock', title: 'Honest timing', description: 'We tell you how long it will actually take. If we are running late, we call before you arrive.' },
        { icon: 'wrench', title: 'We show you the old part', description: 'Anything we replace is kept for you to see. No exceptions, no questions needed.' },
        { icon: 'car', title: 'Your history stays yours', description: 'Full service records in your account, downloadable, whether or not you keep coming to us.' },
        { icon: 'truck', title: 'Delivery across Greater Cairo', description: 'Order oil and filters online and have them delivered, or book a slot and we fit them.' },
      ],
    },
    ar: {
      heading: 'اللي تقدر تحاسبنا عليه',
      subheading: 'أربعة وعود بتحكم طريقة شغل الورشة.',
      items: [
        { icon: 'shield', title: 'قطع أصلية فقط', description: 'كل زيت وفلتر بنركبه معروف مصدره، ومكتوب في فاتورتك.' },
        { icon: 'droplet', title: 'المواصفة الصحيحة', description: 'بنركب اللي المصنّع حدده لمحركك وسنة الصنع — مش أقرب حاجة موجودة على الرف.' },
        { icon: 'clock', title: 'مواعيد صادقة', description: 'بنقول لك المدة الحقيقية. ولو اتأخرنا، بنتصل قبل ما تيجي.' },
        { icon: 'wrench', title: 'بنوريك القطعة القديمة', description: 'أي قطعة بنغيرها بنحتفظ بيها عشان تشوفها. من غير استثناءات ولا أسئلة.' },
        { icon: 'car', title: 'تاريخ عربيتك ملكك', description: 'سجل صيانة كامل في حسابك، تقدر تحمّله، سواء كملت معانا أو لأ.' },
        { icon: 'truck', title: 'توصيل للقاهرة الكبرى', description: 'اطلب الزيت والفلاتر أونلاين ونوصلهالك، أو احجز موعد ونركبهم لك.' },
      ],
    },
  },
  steps: {
    en: {
      heading: 'How a visit works',
      subheading: 'Four steps, about forty minutes for a standard oil change.',
      items: [
        { title: 'Tell us the car', description: 'Plate number is enough if you have been before — your history comes up instantly.' },
        { title: 'We confirm the spec', description: 'The technician checks the manufacturer specification for your engine and year before touching anything.' },
        { title: 'We do the work', description: 'You wait in the lounge or leave the car. Either way you get a message when it is done.' },
        { title: 'It goes on your record', description: 'Oil, filters, mileage and next due date are saved to your account with the invoice.' },
      ],
    },
    ar: {
      heading: 'إزاي بتتم الزيارة',
      subheading: 'أربع خطوات، حوالي أربعين دقيقة لتغيير زيت عادي.',
      items: [
        { title: 'قل لنا العربية', description: 'رقم اللوحة كفاية لو كنت جيت قبل كده — تاريخك بيظهر فوراً.' },
        { title: 'بنأكد المواصفة', description: 'الفني بيراجع مواصفات المصنّع لمحركك وسنة الصنع قبل ما يبدأ.' },
        { title: 'بننفذ الشغل', description: 'استنى في الاستراحة أو سيب العربية. في الحالتين هتوصلك رسالة أول ما نخلص.' },
        { title: 'بيتسجل في ملفك', description: 'الزيت والفلاتر والعداد وموعد التغيير الجاي بيتحفظوا في حسابك مع الفاتورة.' },
      ],
    },
  },
  cta: {
    en: {
      heading: 'Not sure what your car needs?',
      body: 'Answer four questions and we will show you the exact oil, the right filter and how often to change it.',
      buttons: [
        { label: 'Open the Oil Finder', href: '/oil-finder', style: 'accent' },
        { label: 'Book a car wash', href: '/car-wash', style: 'outline' },
      ],
    },
    ar: {
      heading: 'مش متأكد عربيتك محتاجة إيه؟',
      body: 'جاوب على أربعة أسئلة وهنوريك الزيت المناسب بالظبط والفلتر الصح وكل قد إيه تغيّره.',
      buttons: [
        { label: 'افتح دليل الزيوت', href: '/oil-finder', style: 'accent' },
        { label: 'احجز غسيل', href: '/car-wash', style: 'outline' },
      ],
    },
  },
}

/* ────────────────────────────── Contact ────────────────────────────── */

export const contactContent = {
  hero: {
    en: {
      eyebrow: 'We answer the phone',
      heading: 'Talk to someone who works on cars',
      subheading: 'Call, WhatsApp, or come to either branch. No call centre, no ticket number.',
    },
    ar: {
      eyebrow: 'بنرد على التليفون',
      heading: 'اتكلم مع حد بيشتغل على العربيات',
      subheading: 'اتصل أو راسلنا على واتساب أو تعال لأي فرع. مفيش كول سنتر ولا أرقام تذاكر.',
    },
  },
  contact: {
    en: { heading: 'Branches and hours', subheading: 'Both branches do oil changes, filters, batteries and washing.' },
    ar: { heading: 'الفروع والمواعيد', subheading: 'الفرعان بيعملوا تغيير زيت وفلاتر وبطاريات وغسيل.' },
  },
  faq: {
    en: {
      heading: 'Before you call',
      subheading: 'The three things people ask most.',
      items: [
        { question: 'Do I need an appointment for an oil change?', answer: 'No. Walk in any day except Friday and we will fit you in — usually within twenty minutes. Appointments are only needed for washing and detailing.' },
        { question: 'Can you tell me the price over the phone?', answer: 'Yes. Tell us the car, the year and the engine and we will give you the exact total for oil, filter and fitting before you come.' },
        { question: 'Do you come to me?', answer: 'We deliver oils, filters and batteries across Greater Cairo, but fitting is done at the branch so the work can be recorded and guaranteed.' },
      ],
    },
    ar: {
      heading: 'قبل ما تتصل',
      subheading: 'أكتر ثلاث حاجات الناس بتسأل عنها.',
      items: [
        { question: 'محتاج ميعاد عشان أغير الزيت؟', answer: 'لا. تعال أي يوم ما عدا الجمعة وهنخدمك — عادةً في أقل من عشرين دقيقة. الميعاد مطلوب للغسيل والتلميع بس.' },
        { question: 'ينفع تقولي السعر على التليفون؟', answer: 'أيوه. قل لنا العربية وسنة الصنع والمحرك وهنقول لك الإجمالي بالظبط للزيت والفلتر والتركيب قبل ما تيجي.' },
        { question: 'بتيجوا لعندي؟', answer: 'بنوصل الزيوت والفلاتر والبطاريات في القاهرة الكبرى، لكن التركيب بيتم في الفرع عشان الشغل يتسجل ويكون عليه ضمان.' },
      ],
    },
  },
}

/* ──────────────────────────────── FAQ ──────────────────────────────── */

export const faqContent = {
  hero: {
    en: { eyebrow: 'Straight answers', heading: 'Frequently asked questions', subheading: 'Oil, filters, delivery, warranty and appointments — answered without the sales pitch.' },
    ar: { eyebrow: 'إجابات مباشرة', heading: 'الأسئلة الشائعة', subheading: 'الزيت والفلاتر والتوصيل والضمان والمواعيد — إجابات من غير كلام بيع.' },
  },
  groups: [
    {
      en: {
        heading: 'Oil and servicing',
        items: [
          { question: 'How often should I change my engine oil?', answer: 'It depends on the oil and the engine, not on a general rule. Most modern cars on full synthetic run 10,000 km or six months, whichever comes first. Older engines, engines that burn oil, and cars driven mostly in Cairo traffic should go sooner. Our Oil Finder gives you the exact figure for your car.' },
          { question: 'Does city driving really change the interval?', answer: 'Yes. Stop-start traffic means the engine runs hot at low speed and the oil ages faster than the odometer suggests. If most of your driving is inside Cairo, we suggest shortening the interval by around twenty percent.' },
          { question: 'What happens if I use the wrong viscosity?', answer: 'Too thin and the oil film breaks down under load; too thick and it does not reach everything quickly on a cold start. Neither destroys an engine overnight, but both shorten its life. It costs nothing to fit the correct grade, so there is no reason to guess.' },
          { question: 'Do I have to change the filter every time?', answer: 'Yes for the oil filter — it holds roughly half a litre of dirty oil and undoes much of the benefit of fresh oil. Air and cabin filters are typically every second or third oil change, sooner if you park under trees or drive on dusty roads.' },
        ],
      },
      ar: {
        heading: 'الزيت والصيانة',
        items: [
          { question: 'كل قد إيه أغير زيت المحرك؟', answer: 'بيعتمد على نوع الزيت والمحرك، مش على قاعدة عامة. معظم العربيات الحديثة بزيت صناعي بالكامل بتمشي 10,000 كم أو ستة شهور، أيهما أقرب. المحركات الأقدم واللي بتستهلك زيت واللي بتمشي أغلب الوقت في زحمة القاهرة لازم تغير أبكر. دليل الزيوت بيقول لك الرقم بالظبط لعربيتك.' },
          { question: 'هل القيادة داخل المدينة بتغيّر الموعد فعلاً؟', answer: 'أيوه. الوقوف والتحرك المستمر معناه إن المحرك بيسخن وهو بسرعة قليلة، والزيت بيتعب أسرع مما يوحي عداد الكيلومترات. لو أغلب قيادتك جوه القاهرة، ننصح بتقليل الفترة حوالي عشرين بالمئة.' },
          { question: 'لو استخدمت لزوجة غلط هيحصل إيه؟', answer: 'لو الزيت أخف من اللازم، طبقة الحماية بتضعف تحت الحمل؛ ولو أتقل، مش بيوصل لكل الأجزاء بسرعة عند التشغيل البارد. ولا واحد فيهم بيدمر المحرك في يوم، لكن الاتنين بيقصّروا عمره. تركيب الدرجة الصحيحة مش بيكلف زيادة، فمفيش سبب للتخمين.' },
          { question: 'لازم أغير الفلتر كل مرة؟', answer: 'أيوه بالنسبة لفلتر الزيت — بيحتفظ بحوالي نص لتر زيت متسخ وبيضيّع جزء كبير من فايدة الزيت الجديد. فلاتر الهواء والمكيف عادةً كل تغيير زيت تاني أو تالت، وأبكر لو بتركن تحت الشجر أو بتمشي في طرق مترّبة.' },
        ],
      },
    },
    {
      en: {
        heading: 'Orders, delivery and warranty',
        items: [
          { question: 'How much is delivery?', answer: 'Fifty pounds across Greater Cairo, and free on orders over 1,500 EGP. You can also choose to collect from either branch at no charge.' },
          { question: 'Can I pay cash?', answer: 'Yes. Cash on delivery and payment at the branch are both available. Card payment online is available where shown at checkout.' },
          { question: 'What warranty do I get?', answer: 'Batteries carry the manufacturer warranty printed on the product page — bring the battery and the invoice to any branch and we handle the claim. Fitting work is guaranteed for thirty days. Oils and filters are covered against defects, not against normal wear.' },
          { question: 'What if you fit the wrong oil?', answer: 'If the Oil Finder or our technician specified the wrong oil for your car, we replace the oil and redo the change at no charge. That is the whole point of recording the specification.' },
        ],
      },
      ar: {
        heading: 'الطلبات والتوصيل والضمان',
        items: [
          { question: 'التوصيل بكام؟', answer: 'خمسين جنيه في القاهرة الكبرى، ومجاني للطلبات فوق 1500 جنيه. وتقدر كمان تستلم من أي فرع من غير رسوم.' },
          { question: 'ينفع أدفع كاش؟', answer: 'أيوه. الدفع عند الاستلام والدفع في الفرع متاحين. والدفع بالبطاقة أونلاين متاح لما يظهر في صفحة إتمام الطلب.' },
          { question: 'الضمان إيه؟', answer: 'البطاريات عليها ضمان المصنّع المكتوب في صفحة المنتج — هات البطارية والفاتورة لأي فرع وإحنا نتولى الإجراءات. شغل التركيب مضمون لمدة ثلاثين يوم. الزيوت والفلاتر مضمونة ضد عيوب التصنيع مش ضد الاستهلاك الطبيعي.' },
          { question: 'لو ركبتوا زيت غلط؟', answer: 'لو دليل الزيوت أو الفني حدد زيت غير مناسب لعربيتك، بنغير الزيت ونعيد التركيب من غير أي تكلفة. ده سبب تسجيل المواصفة من الأساس.' },
        ],
      },
    },
    {
      en: {
        heading: 'Appointments and washing',
        items: [
          { question: 'Do I need to book a car wash?', answer: 'Yes, washing and detailing are by appointment so a bay is free when you arrive. You can book online and pick your time slot.' },
          { question: 'How long does detailing take?', answer: 'An express wash is about thirty minutes, a full inside-and-out wash an hour, polish and wax around two and a half hours, and full detailing most of a day.' },
          { question: 'What should I bring?', answer: 'Nothing but the car. If you have been to us before, the plate number brings up your whole history. If it is your first visit, we will set up a record while you wait.' },
        ],
      },
      ar: {
        heading: 'المواعيد والغسيل',
        items: [
          { question: 'لازم أحجز للغسيل؟', answer: 'أيوه، الغسيل والتلميع بميعاد عشان يكون في مكان فاضي لما توصل. تقدر تحجز أونلاين وتختار الوقت المناسب.' },
          { question: 'التلميع بياخد قد إيه؟', answer: 'الغسيل السريع حوالي تلاتين دقيقة، والغسيل الكامل داخلي وخارجي ساعة، والتلميع والشمع حوالي ساعتين ونص، والتفصيل الشامل معظم اليوم.' },
          { question: 'أحضر معايا إيه؟', answer: 'العربية بس. لو جيت قبل كده، رقم اللوحة بيطلع كل تاريخك. ولو أول زيارة، هنعمل لك سجل وانت مستني.' },
        ],
      },
    },
  ],
  cta: {
    en: {
      heading: 'Still have a question?',
      body: 'Call the branch or send us a message on WhatsApp — a technician will answer, not a script.',
      buttons: [{ label: 'Contact us', href: '/contact', style: 'primary' }],
    },
    ar: {
      heading: 'لسه عندك سؤال؟',
      body: 'اتصل بالفرع أو ابعت لنا على واتساب — هيرد عليك فني، مش رد جاهز.',
      buttons: [{ label: 'تواصل معنا', href: '/contact', style: 'primary' }],
    },
  },
}
