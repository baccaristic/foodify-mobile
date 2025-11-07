import type { TranslationDictionary } from '../types';

const ar: TranslationDictionary = {
  common: {
    ok: 'نعم',
    cancel: 'إلغاء',
    close: 'غلق',
    back: 'الرجوع',
    confirm: 'تأكيد',
    continue: 'المتابعة',
    retry: 'إعادة المحاولة',
    search: 'بحث',
    checkout: 'الدفع',
    modify: 'تعديل',
    add: 'إضافة',
    remove: 'إزالة',
    delete: 'حذف',
    save: 'حفظ',
    loading: 'جاري التحميل…',
    error: 'خطأ',
    currency: '{{amount}} د.ت',
  },
  header: {
    chooseAddress: 'اختر عنوان التوصيل',
  },
  navigation: {
    home: 'الرئيسية',
    cart: 'السلة',
    search: 'بحث',
    profile: 'الملف الشخصي',
    favorites: 'المفضلة',
    notifications: 'الإشعارات',
    faq: 'الأسئلة الشائعة',
    privacy: 'إدارة الخصوصية',
    deleteAccount: 'حذف الحساب والبيانات',
  },
  layout: {
    ongoingOrder: {
      bannerTitle: 'طلبك في الطريق',
      statusHeading: 'الحالة',
      trackingFallback: 'جاري التتبع…',
      seeDetails: 'التفاصيل',
      progressSteps: {
        created: 'تم إنشاء الطلب',
        preparing: 'جاري التحضير',
        inDelivery: 'في الطريق',
      },
      deliveredCelebration: {
        title: 'استمتع بوجبتك',
        subtitle: 'وصل طلبك. بالهناء والشفاء!',
        rateDelivery: 'تقييم التوصيل',
        close: 'غلق',
      },
    },
  },
  filters: {
    title: 'المرشحات',
    clear: 'مسح الكل',
    sections: {
      sort: 'الترتيب',
      topEat: 'أفضل المطاعم',
    },
    sortOptions: {
      picked: 'مختار لك',
      popular: 'الأكثر شيوعًا',
      fee: 'رسوم التوصيل',
      rating: 'التقييم',
    },
    actions: {
      apply: 'تطبيق',
    },
  },
  fixedOrderBar: {
    order: 'طلب',
    orderWithCount: 'طلب ({{count}})',
    orderSummary: '{{order}} : {{total}}',
    seeCart: 'عرض سلتي',
  },
  deliveryRating: {
    title: 'تقييم التوصيل',
    subtitle: 'أخبرنا المزيد عن خدمة التوصيل',
    fields: {
      timing: 'توقيت التوصيل',
      foodCondition: 'حالة الطعام',
      professionalism: 'احترافية المندوب',
      overall: 'التجربة العامة',
    },
    commentPrompt: 'أي شيء آخر تود مشاركته؟',
    commentPlaceholder: 'أضف تعليقًا عن التوصيل…',
    actions: {
      submit: 'إرسال',
      update: 'تحديث التقييم',
    },
    errors: {
      load: 'تعذر تحميل تقييمك السابق.',
      submit: 'تعذر حفظ تقييمك. يرجى المحاولة مرة أخرى.',
    },
  },
  restaurantRating: {
    headline: 'تقييم التوصيل',
    question: 'كيف كان الطعام؟',
    options: {
      thumbsUp: 'جيد',
      thumbsDown: 'ليس جيدًا',
      or: 'أو',
    },
    commentPrompt: 'أي شيء آخر تود قوله؟',
    commentPlaceholder: 'اكتب تعليقك…',
    actions: {
      submit: 'إرسال',
      update: 'تحديث التقييم',
    },
    errors: {
      load: 'تعذر تحميل تقييمك للمطعم.',
      submit: 'تعذر حفظ تقييمك. يرجى المحاولة مرة أخرى.',
      selection: 'يرجى اختيار إعجاب أو عدم إعجاب.',
    },
  },
  home: {
    sections: {
      top: 'أفضل المطاعم',
      favorites: 'مفضلاتك',
      orders: 'طلب مرة أخرى',
      restaurants: 'المطاعم القريبة',
    },
    rating: {
      new: 'جديد',
    },
    delivery: {
      free: 'توصيل مجاني',
      closesAt: 'يغلق في {{time}}',
    },
    addressPrompt: {
      title: 'اختر عنوانًا لاستكشاف المطاعم القريبة.',
      subtitle: 'حدد موقع التوصيل لعرض الخيارات المتاحة في منطقتك.',
      cta: 'اختيار العنوان',
    },
    error: {
      title: 'تعذر تحميل المطاعم حاليًا.',
      action: 'إعادة المحاولة',
    },
    empty: {
      title: 'لا توجد مطاعم في النطاق.',
      subtitle: 'وسّع نطاق البحث أو حدّث موقعك لاكتشاف وجبات رائعة قريبة.',
    },
    header: {
      chooseAddress: 'يرجى اختيار عنوانك.',
    },
    search: {
      prompt: 'مستعد للأكل؟',
      collapsedPlaceholder: 'البحث في الطعام',
    },
    categories: {
      discount: ' تخفيضات',
      topRestaurants: 'أفضل المطاعم',
      dishes: 'أطباق',
      pizza: 'بيتزا',
      burger: 'برجر',
      asian: ' آسيوي',
      bakery: 'مخابز',
      breakfast: ' فطور صباح',
      burgers: 'برجر',
      chicken: 'دجاج',
      fastFood: 'وجبات سريعة',
      grill: 'مشاوي',
      iceCream: 'مثلجات',
      indian: ' هندي',
      international: 'عالمي',
      italian: 'إيطالي',
      mexican: 'مكسيكي',
      oriental: 'شرقي',
      pasta: 'باستا',
      salads: 'سلطات',
      sandwiches: 'ساندويتشات',
      seafood: 'أطعمة بحرية',
      snacks: 'وجبات خفيفة',
      sushi: 'سوشي',
      sweets: 'حلويات',
      tacos: 'تاكوس',
      teaCoffee: 'شاي وقهوة',
      traditional: 'تقليدي',
      tunisian: 'تونسي',
      turkish: 'تركي',
    },
  },
  categoryOverlay: {
    addressPrompt: 'اختر عنوانًا لاستكشاف المطاعم.',
    error: {
      title: 'تعذر تحميل مطاعم {{category}}.',
    },
    empty: {
      title: 'لم يتم العثور على مطاعم {{category}}.',
    },
    delivery: {
      withFee: 'رسوم توصيل {{fee}} د.ت',
    },
    defaultType: 'مطعم',
  },
  cart: {
    title: 'سلتي',
    defaultRestaurantName: 'مطعم',
    productLabel: {
      singular: 'منتج',
      plural: 'منتجات',
    },
    itemSummaryPrefix: '{{count}} {{productLabel}} من ',
    priceEach: '{{price}} لكل وحدة',
    empty: {
      title: 'أضف منتجات لبدء السلة',
      subtitle: 'عند إضافة منتجات من مطعم أو متجر، ستظهر سلتك هنا.',
      cta: 'إضافة منتجات',
    },
    addMore: 'إضافة المزيد من المنتجات',
  },
  coupon: {
    title: 'رمز القسيمة',
    subtitle: 'أضف قسيمتك',
    placeholder: 'ABCDE123',
    checkCta: 'التحقق من رمز القسيمة',
    listTitle: 'القسائم المتاحة',
    emptyList: 'لا توجد قسائم متاحة حاليًا. اجمع النقاط أو تحقق لاحقًا.',
    list: {
      percent: 'خصم {{value}}%',
      freeDelivery: 'توصيل مجاني',
    },
    status: {
      success: 'رمز القسيمة صالح ومطبق',
      error: 'رمز القسيمة غير صالح. يرجى المحاولة مرة أخرى.',
    },
  },
  locationPermission: {
    prompt: {
      title: 'الإذن لاستخدام موقعك ',
      description: 'يتيح لنا هذا عرض المطاعم والمتاجر التي يمكنك الطلب منها.',
      agree: 'أوافق',
    },
    errors: {
      disabled: 'صلاحية الموقع معطلة. يرجى تفعيلها في الإعدادات.',
      servicesDisabled: 'يرجى تفعيل خدمات الموقع في جهازك.',
      generic: 'نحتاج إلى إذنك لعرض المطاعم القريبة.',
    },
  },
  locationSearch: {
    placeholder: 'أدخل الشارع، رقم المبنى، إلخ',
    empty: {
      initial: 'ابدأ الكتابة للبحث عن شارع أو مبنى أو منطقة.',
      noResults: 'لا توجد أماكن مطابقة. حاول تحسين الكلمات المفتاحية.',
    },
  },
  search: {
    header: {
      title: 'يرجى اختيار عنوانك.',
    },
    searchBar: {
      placeholder: 'بحث…',
    },
    filters: {
      promotions: 'العروض الترويجية',
      topChoice: 'أفضل الخيارات',
      freeDelivery: 'توصيل مجاني',
    },
    delivery: {
      withFee: 'رسوم توصيل {{fee}}',
      free: 'توصيل مجاني',
    },
    card: {
      freeDeliveryPill: 'توصيل مجاني',
    },
    promoted: {
      heading: 'المنتجات المميزة',
    },
    alerts: {
      menuUnavailableTitle: 'المنتج غير متاح',
      menuUnavailableMessage: 'تعذر تحميل هذا المنتج المميز حاليًا. يرجى المحاولة لاحقًا.',
      genericErrorTitle: 'حدث خطأ ما',
      genericErrorMessage: 'تعذر تحميل هذا المنتج المميز. يرجى المحاولة مرة أخرى.',
    },
    results: {
      searching: 'جاري البحث…',
      count: '{{count}} نتيجة{{query}}',
      querySuffix: ' لـ "{{query}}"',
      updating: 'جاري تحديث النتائج…',
      loadingMore: 'جاري تحميل المزيد من المطاعم…',
    },
    states: {
      addressPrompt: {
        title: 'حدد عنوانك لبدء البحث.',
        subtitle: 'أضف موقع التوصيل لعرض المطاعم المتاحة في منطقتك.',
        cta: 'اختيار العنوان',
      },
      loading: 'جاري تحميل المطاعم…',
      error: 'تعذر تحميل المطاعم. يرجى المحاولة مرة أخرى.',
      empty: 'لا توجد مطاعم تطابق مرشحاتك حتى الآن.',
    },
  },
  menuDetail: {
    labels: {
      itemSingular: 'منتج',
      itemPlural: 'منتجات',
    },
    customizing: 'تخصيص المنتج {{current}} من {{total}}',
    draftLabel: '#{{index}}',
    optionGroups: {
      selectExact: 'اختر {{count}} {{item}}',
      selectRange: 'اختر {{min}}-{{max}} منتجات',
      selectAtLeast: 'اختر {{count}} {{item}} على الأقل',
      selectUpTo: 'اختر حتى {{count}} {{item}}',
      selectAny: 'اختر أي منتج',
      required: 'إجباري',
      optional: 'اختياري',
    },
    itemTotal: 'إجمالي المنتج {{index}}',
    validationMessage: 'أكمل الاختيارات الإجبارية لكل منتج. المنتجات الحمراء تحتاج انتباهًا.',
    summary: '{{action}} {{count}} {{item}} بسعر {{price}}',
    actions: {
      add: 'إضافة',
      update: 'تحديث',
    },
  },
  restaurantDetails: {
    tabs: {
      topSales: 'الأكثر مبيعًا',
    },
    sections: {
      topSalesWithCount: 'الأكثر مبيعًا ({{count}})',
      infoTitle: 'معلومات المطعم',
    },
    states: {
      noSelection: {
        title: 'لم يتم اختيار مطعم.',
      },
      error: {
        title: 'تعذر تحميل هذا المطعم.',
      },
    },
    delivery: {
      withFee: 'رسوم توصيل {{fee}}',
      free: 'توصيل مجاني',
    },
    rating: {
      new: 'جديد',
    },
    fallbackName: 'مطعم',
  },
  checkout: {
    title: 'طلبي',
    defaults: {
      item: 'منتج',
    },
    items: {
      extrasLabel: 'إضافات {{extras}}',
      empty: {
        viewMode: 'لا توجد منتجات لعرضها.',
        editMode: 'سلتك فارغة.',
      },
    },
    sections: {
      allergies: {
        title: 'لدي حساسية',
        placeholder: 'أضف حساسياتك',
      },
      comment: {
        title: 'إضافة تعليق',
        placeholder: 'اترك ملاحظة للمطعم',
      },
    },
    address: {
      sectionTitle: 'عنوان التوصيل',
      changeCta: 'تغيير',
      choosePrompt: 'اختر مكان توصيل طلبك',
      savedAddressFallback: 'العنوان المحفوظ',
      deliveryAddressFallback: 'عنوان التوصيل',
      empty: {
        viewMode: 'بيانات التوصيل غير متاحة لهذا الطلب.',
        editMode: 'أضف عنوان توصيل لمعاينته هنا.',
      },
      mapUnavailable: {
        viewMode: 'معاينة الخريطة غير متاحة لهذا العنوان',
        editMode: 'حدد موقعًا دقيقًا لمعاينته هنا',
      },
      markerTitle: 'عنوان التوصيل',
    },
    payment: {
      sectionTitle: 'طريقة الدفع',
      modalTitle: 'طريقة الدفع',
      selectMethod: 'اختر طريقة الدفع',
      methodFallback: 'طريقة الدفع',
      options: {
        card: 'إضافة بطاقة ائتمان جديدة',
        cash: 'الدفع نقدًا',
      },
      methodNames: {
        card: 'بطاقة ائتمان',
        cash: 'نقدًا',
      },
    },
    coupon: {
      add: 'إضافة رمز قسيمة',
      applied: 'القسيمة مطبقة',
    },
    summary: {
      items: 'المنتجات',
      extras: 'الإضافات',
      delivery: 'التوصيل',
      service: 'الخدمة',
      beforeTip: 'الإجمالي قبل الإكرامية',
      tip: 'إكرامية',
      cashToCollect: 'النقد المطلوب تحصيله',
      checkingDelivery: 'التحقق من توفر التوصيل…',
      fees: 'الرسوم والتوصيل',
      coupon: 'قسيمة ({{code}})',
      promotion: 'عرض ترويجي',
      total: 'الإجمالي',
    },
    tip: {
      overlay: {
        title: 'إكرامية إضافية للمندوب؟',
        orderAmountLabel: 'مبلغ الطلب الحالي:',
        tipAmountLabel: 'إكراميتك تضيف:',
        description: 'أظهر تقديرك لجهدهم! 100% من إكراميتك تذهب مباشرة للمندوب.',
        percentageHelper: 'من مبلغ طلبك',
        cancel: 'إلغاء',
        confirm: 'تأكيد والمتابعة',
        cashLabel: 'تدفع نقدًا؟ أدخل المبلغ الذي ستعطيه للمندوب.',
        cashPlaceholder: 'المبلغ النقدي',
        errors: {
          requiredCash: 'أدخل المبلغ النقدي الذي ستقدمه.',
          invalidCash: 'يرجى إدخال مبلغ نقدي صالح (حتى رقمين عشريين).',
        },
      },
      summary: {
        tip: 'إكرامية',
        beforeTip: 'الإجمالي قبل الإكرامية',
        cashToCollect: 'النقد المطلوب تحصيله',
      },
    },
    deliveryCode: {
      title: 'رمز التوصيل الخاص بك',
      description: 'أعط هذا الرمز للمندوب عند استلام طلبك لتأكيد استلام وجبتك.',
    },
    instructions: {
      allergies: 'الحساسيات: {{value}}',
    },
    errors: {
      emptyCart: 'سلتك فارغة.',
      missingRestaurant: 'بيانات المطعم مفقودة.',
      missingAddress: 'يرجى اختيار عنوان توصيل.',
      missingCoordinates: 'العنوان المختار يفتقر إلى الإحداثيات. يرجى تحديثه والمحاولة مرة أخرى.',
      missingPayment: 'اختر طريقة دفع للمتابعة.',
      deliveryUnavailable: 'التوصيل غير متاح لهذا العنوان من هذا المطعم.',
      deliveryQuoteFailed: 'تعذر التحقق من توفر التوصيل. يرجى المحاولة مرة أخرى.',
      deliveryFeePending: 'يرجى الانتظار بينما نتحقق من توفر التوصيل.',
      generic: 'تعذر تقديم طلبك. يرجى المحاولة مرة أخرى.',
    },
    alerts: {
      orderFailedTitle: 'فشل الطلب',
    },
    actions: {
      confirm: 'تأكيد والدفع لإتمام الطلب',
    },
  },
  orderTracking: {
    status: {
      pending: 'تم استلام الطلب',
      accepted: 'تم قبول الطلب',
      preparing: 'جاري تحضير الطلب',
      readyForPickup: 'جاهز للاستلام',
      inDelivery: 'في الطريق',
      delivered: 'تم التوصيل',
      cancelled: 'ملغى',
    },
    hero: {
      pending: 'استلم المطعم طلبك.',
      accepted: 'قبل المطعم طلبك ويبحث عن مندوب…',
      preparing: 'المطعم يحضر طلبك.',
      estimatedReadyAt: 'الاستعداد المتوقع بحلول {{time}}.',
      readyForPickup: 'طلبك جاهز، والمندوب يستلمه الآن.',
      waitingTitle: 'في انتظار المطعم',
      driverEnRoute: 'المندوب يستعد — الموقع سيظهر قريبًا.',
      driverUnassigned: 'سنعرض المندوب بمجرد تعيينه لطلبك.',
    },
    history: {
      title: 'تقدم الطلب',
      empty: 'ستظهر التحديثات بمجرد استلام تغييرات الحالة من المطعم.',
      statusUpdated: 'تم تحديث الحالة',
      defaultDescription: 'تقدم طلبك إلى المرحلة التالية.',
      updateFallback: 'تحديث {{index}}',
    },
    summary: {
      orderId: 'الطلب #{{id}}',
      titleFallback: 'تفاصيل الطلب',
      empty: 'ستظهر المنتجات بمجرد تأكيد طلبك.',
      detailsCta: 'عرض التفاصيل',
    },
    payment: {
      title: 'الدفع الإلكتروني',
      pendingDescription: 'أكمل عملية الدفع عبر Konnect لتأكيد طلبك.',
      statusDescription: 'سنحدث هذه الصفحة فور تغيير حالة الدفع.',
      environmentLabel: 'البيئة: {{environment}}',
      referenceLabel: 'مرجع الدفع: {{reference}}',
      resumeCta: 'استئناف الدفع',
      openErrorTitle: 'تعذر فتح رابط الدفع',
      openErrorMessage: 'تعذر فتح صفحة الدفع. حاول مرة أخرى أو انسخ الرابط في متصفحك.',
      statusNames: {
        pending: 'قيد الانتظار',
        paid: 'مدفوع',
        failed: 'فشل',
        expired: 'منتهي الصلاحية',
      },
    },
    courier: {
      pending: 'سيتم تعيين مندوب قريبًا',
      label: 'تم التوصيل بواسطة',
    },
    help: {
      title: 'هل تحتاج مساعدة في طلبك؟',
      description: 'فريق الدعم متاح 24/7 لمساعدتك.',
      callSupport: 'اتصل بدعم العملاء',
      liveChatCta: 'طلب محادثة مباشرة فورية',
      liveChatTopic: 'دعم الطلبات',
      callErrorTitle: 'تعذر إجراء المكالمة',
      callErrorMessage: 'يرجى الاتصال يدويًا برقم {{phone}}.',
    },
  },
  liveChat: {
    agent: {
      name: 'إيلينا',
      role: 'أخصائية رعاية العملاء',
      brand: 'رعاية Foodify',
    },
    header: {
      title: 'الدردشة المباشرة',
      subtitle: '{{agentName}} · {{agentRole}}',
    },
    ticket: {
      statusActive: 'نشط',
      orderLabel: 'طلب {{order}}',
      fallbackSubtitle: 'سنستمر في تحديثك في هذه المحادثة.',
    },
    topicFallback: 'دعم الطلبات',
    typingIndicator: '{{agentName}} يكتب…',
    input: {
      placeholder: 'اكتب رسالتك',
    },
    cannedResponses: {
      first: 'تواصلت للتو مع مندوبك للتأكيد على آخر تحديث.',
      second: 'شكرًا لصبرك! أرى أنه يقترب من موقعك الآن.',
      third: 'هل هناك أي شيء آخر تريد مني التحقق منه بينما تنتظر؟',
    },
    initialMessages: {
      system: 'أنت متصل بـ {{agentName}} من {{brand}}. نرد عادة في أقل من دقيقتين.',
      agentGreeting: 'مرحبًا! شكرًا للتواصل. أنا هنا للمساعدة في أي شيء يتعلق بطلبك.',
      customerQuestion: 'مرحبًا {{agentName}}، هل يمكنك التحقق من سبب توقف المندوب على الخريطة؟',
      agentFollowUp: 'بالتأكيد! دعني أراجع مساره وسأشارك ما أجد في لحظة.',
    },
    timestamp: {
      am: 'صباحًا',
      pm: 'مساءً',
    },
  },
  profile: {
    home: {
      greeting: 'مرحبًا، {{name}}',
      collapsedGreeting: '{{name}}',
      collapsedHint: 'اضغط على الخيارات أدناه',
      statusLabel: 'نجم متميز',
      pointsLabel: '{{points}} نقطة',
      pointsLoading: 'جاري تحميل النقاط…',
      actions: {
        logout: 'تسجيل الخروج',
      },
      rowIndicator: '›',
      sections: {
        favorites: {
          title: 'المفضلة',
          items: {
            overview: 'عرض مفضلاتي',
          },
        },
        payment: {
          title: 'الدفع',
          items: {
            methods: 'طرق الدفع',
            history: 'سجل الطلبات',
            loyalty: 'الولاء والمكافآت',
            coupons: 'رموز القسائم',
          },
        },
        profile: {
          title: 'الملف الشخصي',
          items: {
            settings: 'إعدادات الملف الشخصي',
          },
        },
        other: {
          title: 'أخرى',
          items: {
            notifications: 'الإشعارات',
            faq: 'الأسئلة الشائعة',
            privacy: 'إدارة الخصوصية',
            deleteAccount: 'حذف الحساب والبيانات',
          },
        },
      },
    },
    settings: {
      title: 'إعدادات الملف الشخصي',
      sections: {
        personalInfo: 'المعلومات الشخصية',
        other: 'أخرى',
      },
      actions: {
        modify: 'تعديل',
        changePassword: 'تغيير كلمة المرور',
        pointsAndLevel: 'النقاط والمستوى',
        language: 'اللغة',
      },
    },
    language: {
      title: 'اللغة',
      heading: 'اختر لغتك',
      description: 'اختر اللغة التي تفضل تصفح Foodify بها.',
      options: {
        en: 'الإنجليزية',
        fr: 'الفرنسية',
      },
      hints: {
        en: 'مُوصى بها للمستخدمين الدوليين',
        fr: 'مثالية للناطقين بالفرنسية',
      },
      note: 'يتم تحديث اختيارك فورًا في جميع أنحاء التطبيق.',
    },
    coupon: {
      title: 'رمز القسيمة',
      subtitle: 'تتبع واستخدم قسائم Foodify.',
      listTitle: 'رموز القسائم الخاصة بك',
      emptyHint: 'تظهر عروض جديدة أسبوعيًا! تابعنا، اطلب كثيرًا، أو تحقق قريبًا — محفظتك ستشكرك.',
      redeemCta: 'استبدال النقاط بقسيمة جديدة',
      redeemHint: 'استخدم نقاط الولاء لإطلاق مكافآت جديدة.',
      assignedAt: 'أضيفت في {{date}}',
      createdFromPoints: 'مستبدلة بالنقاط',
      status: {
        active: 'جاهزة للاستخدام',
        redeemed: 'مستخدمة بالفعل',
        inactive: 'غير نشطة',
      },
      discount: {
        percent: 'خصم {{value}}%',
        freeDelivery: 'توصيل مجاني',
      },
    },
    loyalty: {
      title: 'مكافآت الولاء',
      subtitle: 'اربح 10% نقاط على كل طلب يتم توصيله.',
      balanceLabel: 'الرصيد الحالي',
      lifetimeEarned: 'الإجمالي المكتسب',
      lifetimeRedeemed: 'الإجمالي المستخدم',
      redeemCta: 'استبدال النقاط بقسائم',
      redeemHint: 'حوّل رصيدك إلى توصيل مجاني أو خصومات مئوية.',
      transactionsTitle: 'سجل النقاط',
      transactionsEmpty: 'لا يوجد نشاط بعد — قم بطلب لبدء كسب النقاط.',
      transactionTypes: {
        earned: 'النقاط المكتسبة',
        redeemed: 'النقاط المستخدمة',
        adjustment: 'تعديل',
      },
      transactionDescriptions: {
        earnedForOrder: 'نقاط مكتسبة من الطلب {{orderId}}',
        redeemedForCoupon: 'نقاط مستخدمة للقسيمة {{couponCode}}',
      },
      pointsUnit: 'نقطة',
    },
    loyaltyDetails: {
      headerTitle: 'نقاط Foodify',
      tagline: '10% من رسوم طلبك تتحول إلى نقاط.',
      totalPoints: 'إجمالي النقاط',
      convertCta: 'تحويل النقاط',
      totalEarned: 'الإجمالي المكتسب',
      totalSpent: 'الإجمالي المستخدم',
      availableIn: 'متاح في',
      availabilityBadge: '{{count}} أيام',
      stayTuned: 'ترقب',
      howItWorks: 'كيف يعمل؟',
    },
    convert: {
      headerTitle: 'تحويل النقاط',
      availableTitle: 'نقاط Foodify المتاحة',
      availableSubtitle: 'أنشئ مكافآت مخصصة بنقاط Foodify الخاصة بك.',
      infoText: 'اختر المكافأة التي تريد إنشاءها بنقاطك. خصّص واستبدل فورًا.',
      selectTitle: 'اختر نوع القسيمة',
      freeDelivery: {
        title: 'قسيمة توصيل مجاني',
        description: 'ألغِ رسوم التوصيل في طلبك التالي.',
        costLabel: 'تكلفة النقاط:',
      },
      percentage: {
        title: 'قسيمة خصم',
        description: 'وفّر بين {{min}}% و{{max}}% على طلب.',
      },
      discountLabel: 'خصم',
      sliderEdge: '{{value}}%',
      costBox: {
        pointCost: 'تكلفة النقاط',
        total: 'الإجمالي',
        multiplication: '{{left}} × {{right}} {{unit}}',
      },
      summary: {
        yourPoints: 'نقاطك',
        couponCost: 'تكلفة القسيمة',
        remaining: 'المتبقي',
      },
      needMore: 'تحتاج {{value}} نقطة أخرى',
      createCta: 'إنشاء قسيمة',
      keepEarning: 'استمر في الطلب لكسب المزيد من النقاط.',
    },
    redeem: {
      title: 'استبدال النقاط',
      subtitle: 'اختر المكافأة التي تريد إنشاءها باستخدام نقاط الولاء.',
      options: {
        freeDelivery: {
          title: 'قسيمة توصيل مجاني',
          description: 'تتطلب 250 نقطة وتلغي رسوم التوصيل في طلبك التالي.',
        },
        percentage: {
          title: 'قسيمة خصم مئوي',
          description: 'تتطلب 15 نقطة لكل نسبة مئوية. وفّر بين 5% و50% على طلب مستقبلي.',
        },
      },
      percentageLabel: 'نسبة الخصم',
      percentageHint: 'أدخل قيمة بين {{min}}% و{{max}}%.',
      errors: {
        invalidNumber: 'أدخل نسبة مئوية صالحة.',
        outOfRange: 'يجب أن تكون النسبة بين {{min}}% و{{max}}%.',
      },
      submitCta: 'استبدال القسيمة',
      submitting: 'جاري الاستبدال…',
      successTitle: 'تم إنشاء القسيمة',
      successMessage: 'قسيمتك الجديدة في انتظارك في محفظتك.',
      errorTitle: 'تعذر الاستبدال',
      errorMessage: 'تعذر استبدال نقاطك حاليًا. يرجى المحاولة لاحقًا.',
    },
    notifications: {
      title: 'الإشعارات',
      hero: {
        title: 'كن على اطلاع دائم — احصل على تحديثات فورية!',
        description: 'فعّل الإشعارات لتلافي تفويت تحديثات الطلبات، تنبيهات التوصيل، أو العروض الحصرية. أنت المتحكم — اختر ما يهمك أكثر.',
        enableAll: 'تفعيل الكل وتخصيص لاحقًا',
      },
      orderStatus: {
        title: 'حالة الطلب',
        recommended: 'مُوصى بها',
        description: 'احصل على تحديثات فورية من مندوبك وفريق الدعم. نوصي بهذا!',
      },
      marketing: {
        title: 'عروض خاصة لك',
        description: 'اكتشف خصومات، عروضًا، وقسائم مصممة وفقًا لذوقك.',
      },
      labels: {
        push: 'الإشعارات الفورية',
        email: 'رسائل بريد إلكتروني مخصصة',
      },
      alerts: {
        updateFailureTitle: 'تعذر تحديث الإشعارات',
        updateFailureMessage: 'يرجى المحاولة مرة أخرى بعد لحظات.',
        enableAllFailureTitle: 'تعذر تفعيل جميع الإشعارات',
        enableAllFailureMessage: 'يرجى المحاولة مرة أخرى بعد لحظات.',
      },
    },
    faq: {
      title: 'الأسئلة الشائعة',
      sections: {
        orderingPayments: {
          title: 'الطلبات والدفع',
          questions: {
            applyPromo: {
              question: 'كيف أطبق رمز العرض الترويجي؟',
              answer: 'يمكنك تطبيق رمز العرض في صفحة الدفع في حقل "رمز العرض" قبل تقديم طلبك.',
            },
            splitPayment: {
              question: 'هل يمكنني تقسيم الدفع بين بطاقتَيْن؟',
              answer: 'حاليًا، تقسيم الدفع غير مدعوم. يمكنك استخدام طريقة دفع واحدة لكل طلب.',
            },
            paymentMethods: {
              question: 'ما طرق الدفع التي تقبلونها؟',
              answer: 'نقبل البطاقات الائتمانية/الخصم الرئيسية، محافظ الهاتف المحمول، وبطاقات الهدايا.',
            },
            cancelCharge: {
              question: 'هل سيتم تحصيل رسوم إذا ألغيت طلبي؟',
              answer: 'لن تتم محاسبتك إذا ألغي الطلب قبل المعالجة. قد تستغرق المبالغ المستردة 3-5 أيام عمل.',
            },
            declinedPayment: {
              question: 'لماذا رُفض دفعي؟',
              answer: 'قد يحدث هذا بسبب عدم كفاية الأموال في بطاقتك أو رفض البنك للمعاملة لأسباب أمنية.',
            },
          },
        },
        deliveryTiming: {
          title: 'التوصيل والتوقيت',
          questions: {
            trackRider: {
              question: 'هل يمكنني تتبع مندوب التوصيل في الوقت الفعلي؟',
              answer: 'نعم. بمجرد تأكيد طلبك، يمكنك تتبع التوصيل في الوقت الفعلي من قسم "الطلبات".',
            },
            scheduleDelivery: {
              question: 'هل يمكنني جدولة التوصيل لوقت لاحق؟',
              answer: 'بالتأكيد! يمكنك اختيار وقت التوصيل المفضل أثناء إتمام الدفع.',
            },
            deliveryTime: {
              question: 'كم يستغرق توصيل البقالة عادةً؟',
              answer: 'يتراوح وقت التوصيل النموذجي بين 30 إلى 60 دقيقة حسب موقعك وحجم الطلب.',
            },
          },
        },
        issuesRefund: {
          title: 'المشكلات والاسترداد',
          questions: {
            missingItems: {
              question: 'ماذا لو كان طلبي يفتقد منتجات؟',
              answer: 'يرجى التواصل مع فريق الدعم عبر قسم "المساعدة" وسنزيل المشكلة بسرعة.',
            },
            coldFood: {
              question: 'وصل طعامي باردًا—ماذا أفعل؟',
              answer: 'نأسف لذلك! تواصل مع الدعم للإبلاغ عن المشكلة وطلب تعويض أو استرداد.',
            },
            lateOrder: {
              question: 'هل يمكنني الحصول على استرداد إذا تأخر طلبي؟',
              answer: 'قد تنطبق الاستردادات حسب التأخير. اتصل بخدمة العملاء للمزيد من التفاصيل.',
            },
          },
        },
        accountSafety: {
          title: 'الحساب والأمان',
          questions: {
            paymentSecurity: {
              question: 'هل بيانات دفعي آمنة؟',
              answer: 'نعم، نستخدم أنظمة دفع مشفرة لضمان سلامة معلوماتك وحمايتها.',
            },
            deleteAccount: {
              question: 'هل يمكنني حذف حسابي نهائيًا؟',
              answer: 'نعم. اذهب إلى "إعدادات الحساب" → "حذف الحساب والبيانات" لإزالة حسابك نهائيًا.',
            },
          },
        },
      },
    },
    privacy: {
      title: 'إدارة الخصوصية',
      sections: {
        personalization: 'التخصيص والإعلانات',
        location: 'وصول الموقع',
         data: 'البيانات والخصوصية',
      },
      cards: {
        personalizedRecommendations: {
          title: 'السماح بتوصيات مخصصة',
          description: 'نستخدم سجل طلباتك لاقتراح منتجات قد تعجبك.',
        },
        location: {
          title: 'استخدام الموقع الدقيق لتوصيل أسرع',
          description: 'نستخدم موقعك لتقدير أوقات التوصيل.',
        },
      },
      links: {
        policy: 'عرض سياسة الخصوصية',
        download: 'تنزيل بياناتي',
      },
    },
    favorites: {
      title: 'المفضلة',
      labels: {
        new: 'جديد',
        rating: '{{rating}} / 5',
        defaultCuisine: 'مزيج مطابخ',
        openMenuHint: 'اضغط لفتح القائمة الكاملة',
        addToCartHint: 'اضغط للتخصيص وإضافة إلى السلة.',
        popular: 'شائع',
      },
      sections: {
        restaurants: {
          title: 'المطاعم المفضلة',
          subtitle: 'أماكن مريحة ومطابخ تكررها',
        },
        menu: {
          title: 'الأطباق المحفوظة',
          subtitle: 'رغبات تستحق العودة لها',
        },
      },
      states: {
        loadingTitle: 'جاري إعداد المائدة لمفضلاتك…',
        errorTitle: 'تعذر تحميل أماكنك المحفوظة.',
        errorSubtitle: 'تحقق من اتصالك وأعد المحاولة.',
        emptyTitle: 'قلبك مفتوح.',
        emptySubtitle: 'استكشف المطاعم واضغط على القلب لبدء مجموعتك.',
      },
      actions: {
        retry: 'إعادة المحاولة',
        discover: 'اكتشاف المطاعم',
        startOrdering: 'بدء الطلب',
      },
    },
    orderHistory: {
      title: 'سجل الطلبات',
      summaryFallback: 'جاهز للاستلام قريبًا',
      fallbackItem: 'منتج',
      states: {
        loadingTitle: 'جاري استرجاع ذكرياتك اللذيذة…',
        errorTitle: 'تعذر تحميل طلباتك.',
        errorSubtitle: 'تحقق من اتصالك وأعد المحاولة بعد لحظات.',
        emptyTitle: 'سجل طلباتك فارغ',
        emptySubtitle: 'كل وجبة رائعة تبدأ بنقرة أولى. استكشف المطاعم ذات التقييم العالي وابنِ إرثك النكهي اليوم.',
      },
      actions: {
        retry: 'إعادة المحاولة',
        startOrdering: 'بدء الطلب',
        continueOrdering: 'الاستمرار في الطلب',
        reorder: 'إعادة الطلب',
        rateDelivery: 'تقييم التوصيل',
        updateRating: 'تحديث التقييم',
      },
    },
    deleteAccount: {
      title: 'حذف الحساب والبيانات',
      warningTitle: 'هذا إجراء لا رجعة فيه',
      warningDescription: 'سيؤدي حذف حسابك إلى إزالة جميع بياناتك نهائيًا، بما في ذلك الأرباح، سجل التوصيل، والمعلومات الشخصية.',
      confirmPrompt: 'يرجى التأكيد للمتابعة',
      confirmationLabel: 'أفهم أن حذف حسابي دائم. ستفقد جميع بياناتي إلى الأبد.',
      deleteCta: 'حذف حسابي',
      cancel: 'إلغاء',
      deletingTitle: 'جاري حذف حسابك',
      deletingDescription: 'قد يستغرق هذا بضع لحظات. يرجى عدم غلق التطبيق.',
      deletingNote: 'سيتم إعلامك عند اكتمال العملية أو في حالة وجود أي مشكلات.',
      successTitle: 'تم حذف الحساب',
      successDescription: 'تم حذف حسابك وجميع البيانات المرتبطة به بنجاح. سيتم تسجيل خروجك تلقائيًا.',
      okay: 'موافق',
    },
    modals: {
      common: {
        continue: 'المتابعة',
        errors: {
          generic: 'تعذر تحديث ملفك الشخصي. يرجى المحاولة مرة أخرى.',
        },
      },
      name: {
        title: 'تعديل الاسم',
        currentLabel: 'الاسم الحالي',
        prompt: 'أدخل اسمك الجديد',
        firstPlaceholder: 'الاسم الأول',
        lastPlaceholder: 'اسم العائلة',
        errors: {
          required: 'يرجى إدخال اسمك الأول واسم العائلة.',
        },
      },
      email: {
        title: 'تعديل عنوان البريد الإلكتروني',
        currentLabel: 'البريد الإلكتروني الحالي',
        prompt: 'أدخل بريدك الإلكتروني الجديد',
        inputPlaceholder: 'أدخل بريدك الإلكتروني',
        emptyValue: 'إضافة عنوان بريد إلكتروني',
        errors: {
          invalid: 'يرجى إدخال بريد إلكتروني صالح.',
          generic: 'تعذر تحديث بريدك الإلكتروني. يرجى المحاولة مرة أخرى.',
        },
        resendMethod: 'بريد إلكتروني',
        resendButton: 'إعادة إرسال الرمز عبر البريد الإلكتروني',
      },
      phone: {
        title: 'تعديل رقم الهاتف',
        currentLabel: 'رقم الهاتف الحالي',
        prompt: 'أدخل رقمك الجديد',
        inputPlaceholder: 'مثال: 98765432',
        emptyValue: 'إضافة رقم هاتف',
        errors: {
          invalid: 'يرجى إدخال رقم هاتف صالح.',
        },
        resendMethod: 'رسالة نصية',
        resendButton: 'إعادة إرسال الرمز عبر رسالة نصية',
      },
      password: {
        title: 'تعديل كلمة المرور',
        currentPrompt: 'أدخل كلمة المرور الحالية',
        currentPlaceholder: 'كلمة المرور الحالية',
        newPrompt: 'أدخل كلمة المرور الجديدة',
        newPlaceholder: 'كلمة المرور',
        confirmPrompt: 'تأكيد كلمة المرور الجديدة',
        confirmPlaceholder: 'كلمة المرور',
        errors: {
          invalidCurrent: 'كلمة المرور خاطئة. يرجى المحاولة مرة أخرى.',
          mismatch: 'كلمتا المرور غير متطابقتين.',
          generic: 'تعذر تحديث كلمة المرور. يرجى المحاولة مرة أخرى.',
        },
      },
      dob: {
        title: 'تحديث تاريخ الميلاد',
        currentLabel: 'تاريخ الميلاد الحالي',
        prompt: 'أدخل تاريخ الميلاد (اختياري)',
        placeholder: 'YYYY-MM-DD',
        emptyValue: 'إضافة تاريخ ميلاد',
        errors: {
          invalid: 'يرجى إدخال تاريخ صالح بتنسيق YYYY-MM-DD.',
        },
      },
    },
  },
  auth: {
    landing: {
      title: 'أدخل رقم هاتفك المحمول',
      placeholder: 'رقمك مثال: 98765432',
      or: 'أو',
      googleCta: 'المتابعة عبر Google',
      emailCta: 'المتابعة عبر البريد الإلكتروني',
      errors: {
        startSignup: 'تعذر بدء التحقق. يرجى التحقق من رقم هاتفك وإعادة المحاولة.',
      },
    },
    common: {
      defaults: {
        email: 'بريدك الإلكتروني',
      },
      errors: {
        mustAcceptTerms: 'يجب قبول الشروط للمتابعة.',
      },
      helper: {
        existingAccount: 'وجدنا حساب Foodify موجود. أدخل الرمز لتسجيل الدخول.',
        attempts: 'عدد المحاولات المتبقية: {{count}}',
        resends: 'إعادة الإرسال المتبقية: {{count}}',
        expires: 'ينتهي الرمز خلال {{seconds}} ثانية',
      },
      resend: {
        methods: {
          email: 'بريد إلكتروني',
          sms: 'رسالة نصية',
        },
        default: 'إعادة إرسال الرمز عبر {{method}}',
        withRemaining: 'إعادة إرسال الرمز عبر {{method}} ({{count}} متبقية)',
        countdown: 'إعادة الإرسال متاحة بعد {{seconds}} ثانية',
      },
      verification: {
        prompt: 'أدخل الرمز المكون من {{count}} أرقام المرسل إلى {{contact}}',
        errors: {
          invalidCode: 'رمز التحقق غير صالح أو منتهي الصلاحية.',
          resendFailed: 'تعذر إعادة إرسال الرمز حاليًا. يرجى المحاولة لاحقًا.',
        },
      },
      terms: {
        title: 'قبول شروط Foodify ومراجعة إشعار الخصوصية',
        description: 'بتحديد "أوافق" أدناه، أؤكد أنني قرأت ووافقت على <terms> وأقر <privacy>. عمري 18 سنة على الأقل.',
        termsLabel: 'شروط الاستخدام',
        privacyLabel: 'إشعار الخصوصية',
        checkbox: 'أوافق على الشروط وإشعار الخصوصية',
        agreeCta: 'أوافق',
      },
      dateHint: 'يرجى إدخال تاريخ صالح بتنسيق YYYY-MM-DD.',
    },
    phone: {
      emailEntry: {
        title: 'ما هو عنوان بريدك الإلكتروني؟',
        placeholder: 'أدخل بريدك الإلكتروني',
        errors: {
          generic: 'تعذر حفظ بريدك الإلكتروني. يرجى المحاولة مرة أخرى.',
        },
      },
      nameEntry: {
        title: 'ما هو اسمك؟',
        firstNamePlaceholder: 'الاسم الأول',
        lastNamePlaceholder: 'اسم العائلة',
        dobPlaceholder: 'تاريخ الميلاد (YYYY-MM-DD)',
        errors: {
          generic: 'تعذر حفظ تفاصيل اسمك. يرجى المحاولة مرة أخرى.',
        },
      },
      acceptTerms: {
        errors: {
          generic: 'تعذر إكمال تسجيلك. يرجى المحاولة مرة أخرى.',
        },
      },
    },
    email: {
      login: {
        emailLabel: 'أدخل عنوان بريدك الإلكتروني',
        emailPlaceholder: 'بريدك الإلكتروني مثال: yourmail@email.com',
        passwordLabel: 'أدخل كلمة المرور',
        passwordPlaceholder: 'كلمة المرور',
        errors: {
          generic: 'تعذر تسجيل الدخول. يرجى التحقق من بيانات الاعتماد وإعادة المحاولة.',
        },
        prompt: {
          message: 'ليس لديك حساب؟',
          cta: 'التسجيل',
        },
      },
      signup: {
        emailPassword: {
          emailLabel: 'أدخل عنوان بريدك الإلكتروني',
          emailPlaceholder: 'أدخل بريدك الإلكتروني',
          passwordLabel: 'أدخل كلمة المرور',
          passwordPlaceholder: 'كلمة المرور',
          confirmLabel: 'تأكيد كلمة المرور',
          confirmPlaceholder: 'كلمة المرور',
          errors: {
            generic: 'تعذر بدء تسجيلك. يرجى المحاولة مرة أخرى.',
            mismatch: 'يجب أن تتطابق كلمتا المرور.',
          },
          prompt: {
            message: 'هل لديك حساب بالفعل؟',
            cta: 'تسجيل الدخول',
          },
        },
        emailVerification: {
          contactPlaceholder: 'بريدك الإلكتروني',
        },
        phone: {
          title: 'ما هو رقم هاتفك؟',
          placeholder: 'أدخل رقم هاتفك',
          errors: {
            generic: 'تعذر حفظ رقم هاتفك. يرجى المحاولة مرة أخرى.',
          },
        },
        name: {
          title: 'ما هو اسمك؟',
          firstNamePlaceholder: 'الاسم الأول',
          lastNamePlaceholder: 'اسم العائلة',
          dobPlaceholder: 'YYYY-MM-DD',
          errors: {
            generic: 'تعذر حفظ تفاصيلك. يرجى المحاولة مرة أخرى.',
          },
        },
        acceptTerms: {
          errors: {
            generic: 'حدث خطأ أثناء إكمال تسجيلك. يرجى المحاولة مرة أخرى.',
          },
        },
        notifications: {
          title: 'اعرف دائمًا حالة طلبك',
          description: 'تُستخدم الإشعارات الفورية لتقديم تحديثات عن طلبك. يمكنك تغيير هذا في الإعدادات في أي وقت.',
          enableCta: 'تفعيل الإشعارات الفورية',
          skipCta: 'تخطي الآن',
          errors: {
            physicalDevice: 'الإشعارات الفورية مدعومة فقط على الأجهزة الفعلية.',
            settings: 'فعّل الإشعارات من إعدادات جهازك لتلقي تحديثات الطلبات.',
            permission: 'نحتاج إلى إذنك لإرسال إشعارات حالة الطلب.',
          },
        },
      },
    },
  },
};

export default ar;