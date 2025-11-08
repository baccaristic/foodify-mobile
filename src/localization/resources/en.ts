import type { TranslationDictionary } from '../types';

const en: TranslationDictionary = {
  common: {
    ok: 'OK',
    cancel: 'Cancel',
    close: 'Close',
    back: 'Back',
    confirm: 'Confirm',
    continue: 'Continue',
    retry: 'Retry',
    search: 'Search',
    checkout: 'Checkout',
    modify: 'Modify',
    add: 'Add',
    remove: 'Remove',
    delete: 'Delete',
    save: 'Save',
    loading: 'Loading…',
    error: 'Something went wrong',
    currency: '{{amount}} DT',
  },
  header: {
    chooseAddress: 'Choose delivery address',
  },
  navigation: {
    home: 'Home',
    cart: 'Cart',
    search: 'Search',
    profile: 'Profile',
    favorites: 'Favorites',
    notifications: 'Notifications',
    faq: 'FAQ',
    privacy: 'Manage Privacy',
    deleteAccount: 'Delete account & Data',
  },
  layout: {
    ongoingOrder: {
      bannerTitle: 'Your order is on the way',
      statusHeading: 'Status',
      trackingFallback: 'Tracking…',
      seeDetails: 'See details',
      progressSteps: {
        created: 'Order created',
        preparing: 'Preparing',
        inDelivery: 'In delivery',
      },
      deliveredCelebration: {
        title: 'Enjoy your food',
        subtitle: 'Your delivery has arrived. Bon appétit!',
        rateDelivery: 'Rate your delivery',
        close: 'Close',
      },
    },
  },
  filters: {
    title: 'Filters',
    clear: 'Clear all',
    sections: {
      sort: 'Sort',
      topEat: 'Top Eat',
    },
    sortOptions: {
      picked: 'Picked for you',
      popular: 'Most popular',
      fee: 'Delivery fee',
      rating: 'Rating',
    },
    actions: {
      apply: 'Apply filters',
    },
  },
  fixedOrderBar: {
    order: 'Order',
    orderWithCount: 'Order ({{count}})',
    orderSummary: '{{order}} : {{total}}',
    seeCart: 'See my cart',
  },
  deliveryRating: {
    title: 'Rate your Delivery',
    subtitle: 'Tell us more about the delivery',
    fields: {
      timing: 'The timing of the delivery',
      foodCondition: 'The food condition',
      professionalism: 'Rider professionalism',
      overall: 'Overall experience',
    },
    commentPrompt: 'Anything more to share?',
    commentPlaceholder: 'Add a comment about your delivery…',
    actions: {
      submit: 'Send',
      update: 'Update rating',
    },
    errors: {
      load: 'We could not fetch your previous rating.',
      submit: 'We could not save your rating. Please try again.',
    },
  },
  restaurantRating: {
    headline: 'Rate your Delivery',
    question: 'How was the food?',
    options: {
      thumbsUp: 'Good',
      thumbsDown: 'Not so good',
      or: 'or',
    },
    commentPrompt: 'Anything more to say?',
    commentPlaceholder: 'Type your comment…',
    actions: {
      submit: 'Send',
      update: 'Update feedback',
    },
    errors: {
      load: 'We could not fetch your restaurant rating.',
      submit: 'We could not save your feedback. Please try again.',
      selection: 'Please choose a thumbs up or thumbs down.',
    },
  },
  home: {
    sections: {
      top: 'Top restaurants',
      favorites: 'Your favourites',
      orders: 'Order again',
      restaurants: 'Nearby restaurants',
    },
    rating: {
      new: 'New',
    },
    delivery: {
      free: 'Free delivery',
      closesAt: 'Closes {{time}}',
    },
    addressPrompt: {
      title: 'Choose an address to explore restaurants nearby.',
      subtitle: 'Set your delivery location so we can show options available in your area.',
      cta: 'Select address',
    },
    error: {
      title: "We can't fetch restaurants right now.",
      action: 'Try again',
    },
    empty: {
      title: 'No restaurants in range.',
      subtitle: 'Expand your search radius or update your location to discover great meals nearby.',
    },
    header: {
      chooseAddress: 'Please choose your address.',
    },
    search: {
      prompt: 'Ready to eat?',
      collapsedPlaceholder: 'Search in Food',
    },
    categories: {
      discount: 'Discount',
      topRestaurants: 'Top Restaurants',
      dishes: 'Dishes',
      pizza: 'Pizza',
      burger: 'Burger',
      asian: 'Asian',
      bakery: 'Bakery',
      breakfast: 'Breakfast',
      burgers: 'Burgers',
      chicken: 'Chicken',
      fastFood: 'Fast Food',
      grill: 'Grill',
      iceCream: 'Ice Cream',
      indian: 'Indian',
      international: 'International',
      italian: 'Italian',
      mexican: 'Mexican',
      oriental: 'Oriental',
      pasta: 'Pasta',
      salads: 'Salads',
      sandwiches: 'Sandwiches',
      seafood: 'Seafood',
      snacks: 'Snacks',
      sushi: 'Sushi',
      sweets: 'Sweets',
      tacos: 'Tacos',
      teaCoffee: 'Tea & Coffee',
      traditional: 'Traditional',
      tunisian: 'Tunisian',
      turkish: 'Turkish',
    },
  },
  categoryOverlay: {
    addressPrompt: 'Select an address to explore restaurants.',
    error: {
      title: 'Could not load {{category}} restaurants.',
    },
    empty: {
      title: 'No {{category}} restaurants found.',
    },
    delivery: {
      withFee: '{{fee}} DT delivery fee',
    },
    defaultType: 'Restaurant',
  },
  cart: {
    title: 'My cart',
    defaultRestaurantName: 'Restaurant',
    productLabel: {
      singular: 'Product',
      plural: 'Products',
    },
    itemSummaryPrefix: '{{count}} {{productLabel}} from ',
    priceEach: '{{price}} each',
    empty: {
      title: 'Add items to start a basket',
      subtitle: 'Once you add items from a restaurant or store, your basket will appear here.',
      cta: 'Add items',
    },
    addMore: 'Add more items',
  },
  coupon: {
    title: 'Coupon code',
    subtitle: 'Add your coupon',
    placeholder: 'ABCDE123',
    checkCta: 'Check coupon code',
    listTitle: 'Available coupons',
    emptyList: 'No coupons available right now. Earn points or check back later.',
    list: {
      percent: '{{value}}% off',
      freeDelivery: 'Free delivery',
    },
    status: {
      success: 'Coupon code valid and applied',
      error: 'Coupon code not valid. Please try again.',
    },
  },
  locationPermission: {
    prompt: {
      title: 'Allow location access',
      description: 'This lets us show you which restaurants and stores you can order from.',
      agree: 'I Agree',
    },
    errors: {
      disabled: 'Location permission is disabled. Please enable it in Settings.',
      servicesDisabled: 'Please enable your device location services.',
      generic: 'We need your permission to show nearby restaurants.',
    },
  },
  locationSearch: {
    placeholder: 'Enter street, building number, etc',
    customLabelPlaceholder: 'Give this place a friendly name',
    customLabelTitle: 'Custom label',
    empty: {
      initial: 'Start typing to search for a street, building or area.',
      noResults: 'No matching places. Try refining the keywords.',
    },
    loadingAddress: 'Loading your location...',
    pinningLocation: 'Pinning exact spot…',
    deliveryLocation: 'DELIVERY LOCATION',
    useThisAddress: 'USE THIS ADDRESS',
    keepEditingDetails: 'KEEP EDITING DETAILS',
    savedAddresses: 'Saved addresses',
    savedAddressesSubtitle: 'Choose a frequent spot or add a brand new location.',
    noSavedAddresses: 'You have no saved addresses yet. Pin a spot to add one.',
    selectedLabel: 'Selected',
    addNewAddress: 'Add new address',
    searchPromptTitle: 'Search for a different spot',
    searchPromptSubtitle: 'Drag the pin on the map above or look up an exact street, building or landmark.',
    searchPlaceholder: 'Search your delivery location',
    labelThisAddress: 'Label this address as',
    addressDetailsHeading: 'Address details',
    markEntranceHeading: 'Mark the entrance',
    markEntranceHelper: 'Help our rider find you faster and more safely.',
    saveAndContinue: 'Save and continue',
    adjustPinLocation: 'Adjust pin location',
    addressTypes: {
      home: {
        label: 'Home',
        description: 'House, villa or standalone property',
      },
      apartment: {
        label: 'Apartment',
        description: 'Multi-unit building or residence',
      },
      work: {
        label: 'Work',
        description: 'Office, co-working or store front',
      },
      other: {
        label: 'Other',
        description: 'Any other type of location',
      },
    },
    fields: {
      houseNumber: {
        label: 'House number',
        placeholder: 'e.g. 24 or Villa Nour',
      },
      directions: {
        label: 'Directions for the rider',
        placeholder: 'Landmarks, gate color…',
      },
      building: {
        label: 'Building',
        placeholder: 'Tower, block or residence name',
      },
      floor: {
        label: 'Floor',
        placeholder: 'e.g. 5th',
      },
      unit: {
        label: 'Apartment',
        placeholder: 'e.g. 5B or 17',
      },
      complement: {
        label: 'Complementary info',
        placeholder: 'How to reach the buzzer, etc.',
      },
      company: {
        label: 'Company or organization',
        placeholder: 'Foodify, Inc.',
      },
      department: {
        label: 'Department',
        placeholder: 'e.g. Product, HR',
      },
      contact: {
        label: 'Reception contact',
        placeholder: 'Name or phone for handoff',
      },
      customName: {
        label: 'Give it a name',
        placeholder: 'Friend, gym, studio…',
      },
      notes: {
        label: 'Notes for the rider',
        placeholder: 'Describe the entrance or drop point',
      },
    },
    entranceOptions: {
      leaveAtDoor: {
        label: 'Leave at the door',
        helper: 'Ideal when someone is home',
      },
      callOnArrival: {
        label: 'Call when outside',
        helper: 'We will ring you as we arrive',
      },
      meetOutside: {
        label: 'Meet me outside',
        helper: 'I will meet the rider at the gate',
      },
      buzz: {
        label: 'Ring the buzzer',
        helper: 'Provide code or apartment name if needed',
      },
      security: {
        label: 'Check in with security',
        helper: 'Rider will leave ID if required',
      },
      reception: {
        label: 'Drop at reception',
        helper: 'Front desk signs off the delivery',
      },
      securityDesk: {
        label: 'Leave with security',
        helper: 'Perfect when access is limited',
      },
      callUponArrival: {
        label: 'Call when outside',
        helper: 'We ring you before heading up',
      },
      call: {
        label: 'Call me on arrival',
        helper: 'Best for one-off meetups',
      },
      text: {
        label: 'Send a text update',
        helper: 'Get a quick SMS when close',
      },
    },
    errors: {
      preciseAddressUnavailable: 'Precise address unavailable',
      couldNotReachMaps: 'Could not reach Google Maps',
      couldNotDetermineLocation: 'We could not determine your current location. Try again.',
      locationPermissionDisabled: 'Location permission is disabled. Please enable it in Settings.',
      locationServicesOff: 'Turn on your device location services to continue.',
      needPermission: 'We need your permission to show nearby restaurants.',
      couldNotLoadAddresses: 'Could not load your saved addresses.',
      couldNotSaveAddress: 'Could not save this address. Please try again.',
      noMatchingPlaces: 'No matching places. Try refining the keywords.',
      couldNotRetrieveSuggestions: 'Could not retrieve suggestions.',
      couldNotLoadPlace: 'Could not load the selected place.',
    },
  },
  search: {
    header: {
      title: 'Please choose your address.',
    },
    searchBar: {
      placeholder: 'Search…',
    },
    filters: {
      promotions: 'Promotions',
      topChoice: 'Top Choice',
      freeDelivery: 'Free Delivery',
    },
    delivery: {
      withFee: '{{fee}} delivery fee',
      free: 'Free delivery',
    },
    card: {
      freeDeliveryPill: 'Free Delivery',
    },
    promoted: {
      heading: 'Promoted items',
    },
    alerts: {
      menuUnavailableTitle: 'Menu item unavailable',
      menuUnavailableMessage:
        "We couldn't load this promoted item right now. Please try again later.",
      genericErrorTitle: 'Something went wrong',
      genericErrorMessage: "We couldn't load this promoted item. Please try again.",
    },
    results: {
      searching: 'Searching…',
      count: '{{count}} results{{query}}',
      querySuffix: ' for “{{query}}”',
      updating: 'Updating results…',
      loadingMore: 'Loading more restaurants…',
    },
    states: {
      addressPrompt: {
        title: 'Set your address to start searching.',
        subtitle: 'Add your delivery location so we can show restaurants available in your area.',
        cta: 'Select address',
      },
      loading: 'Loading restaurants…',
      error: 'We couldn’t load restaurants. Please try again.',
      empty: 'No restaurants match your filters yet.',
    },
  },
  menuDetail: {
    labels: {
      itemSingular: 'item',
      itemPlural: 'items',
    },
    customizing: 'Customizing item {{current}} of {{total}}',
    draftLabel: '#{{index}}',
    optionGroups: {
      selectExact: 'Choose {{count}} {{item}}',
      selectRange: 'Choose {{min}}-{{max}} items',
      selectAtLeast: 'Choose at least {{count}} {{item}}',
      selectUpTo: 'Choose up to {{count}} {{item}}',
      selectAny: 'Choose any item',
      required: 'Required',
      optional: 'Optional',
    },
    itemTotal: 'Item {{index}} total',
    validationMessage:
      'Finish required selections for every item. Items shown in red need attention.',
    summary: '{{action}} {{count}} {{item}} for {{price}}',
    actions: {
      add: 'Add',
      update: 'Update',
    },
  },
  restaurantDetails: {
    tabs: {
      topSales: 'Top sales',
    },
    sections: {
      topSalesWithCount: 'Top sales ({{count}})',
      infoTitle: 'Restaurant info',
    },
    states: {
      noSelection: {
        title: 'No restaurant selected.',
      },
      error: {
        title: 'We could not load this restaurant.',
      },
    },
    delivery: {
      withFee: '{{fee}} DT',
      free: 'Free delivery',
      estimatedTime: '{{time}} min',
    },
    rating: {
      new: 'New',
    },
    fallbackName: 'Restaurant',
  },
  restaurantCard: {
    currentlyClosed: 'Currently closed',
    opensAt: 'Opens at {{time}}',
  },
  checkout: {
    title: 'My order',
    defaults: {
      item: 'Item',
    },
    items: {
      extrasLabel: 'Extras {{extras}}',
      empty: {
        viewMode: 'No items to display.',
        editMode: 'Your cart is empty.',
      },
    },
    sections: {
      allergies: {
        title: 'I have allergies',
        placeholder: 'Add your allergies',
      },
      comment: {
        title: 'Add a comment',
        placeholder: 'Leave a note for the restaurant',
      },
    },
    address: {
      sectionTitle: 'Delivery address',
      changeCta: 'Change',
      choosePrompt: 'Choose where to deliver your order',
      savedAddressFallback: 'Saved address',
      deliveryAddressFallback: 'Delivery address',
      empty: {
        viewMode: 'Delivery details unavailable for this order.',
        editMode: 'Add a delivery address to preview it here.',
      },
      mapUnavailable: {
        viewMode: 'Map preview unavailable for this address',
        editMode: 'Set a precise location to preview it here',
      },
      markerTitle: 'Delivery address',
    },
    payment: {
      sectionTitle: 'Payment method',
      modalTitle: 'Payment method',
      selectMethod: 'Select payment method',
      methodFallback: 'Payment method',
      options: {
        card: 'Add new credit card',
        cash: 'Pay with cash',
      },
      methodNames: {
        card: 'Credit card',
        cash: 'Cash',
      },
    },
    coupon: {
      add: 'Add coupon code',
      applied: 'Coupon applied',
    },
    summary: {
      items: 'Items',
      extras: 'Extras',
      delivery: 'Delivery',
      service: 'Service',
      beforeTip: 'Total before tip',
      tip: 'Tip',
      cashToCollect: 'Cash to collect',
      checkingDelivery: 'Checking delivery availability…',
      fees: 'Fees & delivery',
      coupon: 'Coupon ({{code}})',
      promotion: 'Promotion',
      total: 'Total',
    },
    tip: {
      overlay: {
        title: 'Extra tip for your rider?',
        orderAmountLabel: 'Current order amount:',
        tipAmountLabel: 'Your tip adds:',
        description:
          'Show your appreciation for their hard work! 100% of your tip goes directly to the rider.',
        percentageHelper: 'Of your order’s amount',
        cancel: 'Cancel',
        confirm: 'Confirm & proceed',
        cashLabel: 'Paying with cash? Enter the amount you will hand to the courier.',
        cashPlaceholder: 'Cash amount',
        errors: {
          requiredCash: 'Enter the cash amount you will provide.',
          invalidCash: 'Please enter a valid cash amount (up to two decimals).',
        },
      },
      summary: {
        tip: 'Tip',
        beforeTip: 'Total before tip',
        cashToCollect: 'Cash to collect',
      },
    },
    deliveryCode: {
      title: 'YOUR DELIVERY CODE',
      description:
        'Give this code to the deliverer when you pick up your order to confirm that you’ve received your meal.',
    },
    instructions: {
      allergies: 'Allergies: {{value}}',
    },
    errors: {
      emptyCart: 'Your cart is empty.',
      missingRestaurant: 'Missing restaurant information.',
      missingAddress: 'Please choose a delivery address.',
      missingCoordinates:
        'The selected address is missing coordinates. Please update it and try again.',
      missingPayment: 'Select a payment method to continue.',
      deliveryUnavailable: 'Delivery is not available to this address for this restaurant.',
      deliveryQuoteFailed: 'We could not verify delivery availability. Please try again.',
      deliveryFeePending: 'Please wait while we verify delivery availability.',
      generic: 'We could not place your order. Please try again.',
    },
    alerts: {
      orderFailedTitle: 'Order failed',
    },
    actions: {
      confirm: 'Confirm and pay to order',
    },
  },
  orderTracking: {
    status: {
      pending: 'Order received',
      accepted: 'Order accepted',
      preparing: 'Preparing order',
      readyForPickup: 'Ready for pickup',
      inDelivery: 'On the way',
      delivered: 'Delivered',
      cancelled: 'Cancelled',
    },
    hero: {
      pending: 'Restaurant has received your order.',
      accepted: 'Restaurant accepted your order and is finding a driver…',
      preparing: 'Restaurant is preparing your order.',
      estimatedReadyAt: 'Estimated ready by {{time}}.',
      readyForPickup: 'Your order is ready, the driver is picking it up.',
      waitingTitle: 'Waiting for restaurant',
      driverEnRoute: 'Driver is getting ready — location coming soon.',
      driverUnassigned: 'We will show the driver once they are assigned to your order.',
    },
    history: {
      title: 'Order progress',
      empty: 'Tracking updates will appear once we receive status changes from the restaurant.',
      statusUpdated: 'Status updated',
      defaultDescription: 'Your order moved to the next step.',
      updateFallback: 'Update {{index}}',
    },
    summary: {
      orderId: 'Order #{{id}}',
      titleFallback: 'Order details',
      empty: 'Items will appear once your order is confirmed.',
      detailsCta: 'See details',
    },
    payment: {
      title: 'Online payment',
      pendingDescription: 'Complete the Konnect checkout to confirm your order.',
      statusDescription: 'We will update this page as soon as the payment status changes.',
      environmentLabel: 'Environment: {{environment}}',
      referenceLabel: 'Payment reference: {{reference}}',
      resumeCta: 'Resume payment',
      openErrorTitle: 'Unable to open payment link',
      openErrorMessage:
        'We could not open the Konnect payment page. Please try again or copy the link in your browser.',
      statusNames: {
        pending: 'Pending',
        paid: 'Paid',
        failed: 'Failed',
        expired: 'Expired',
      },
    },
    courier: {
      pending: 'Courier assigned soon',
      label: 'Delivered by',
    },
    help: {
      title: 'Need help with your order?',
      description: 'Our support team is available 24/7 to assist you.',
      callSupport: 'Call customer support',
      liveChatCta: 'Request instant live chat',
      liveChatTopic: 'Order support',
      callErrorTitle: 'Unable to place call',
      callErrorMessage: 'Please dial {{phone}} manually.',
    },
  },
  liveChat: {
    agent: {
      name: 'Elena',
      role: 'Foodify Care Specialist',
      brand: 'Foodify Care',
    },
    header: {
      title: 'Live chat',
      subtitle: '{{agentName}} · {{agentRole}}',
    },
    ticket: {
      statusActive: 'Active',
      orderLabel: 'Order {{order}}',
      fallbackSubtitle: 'We’ll keep you updated in this conversation.',
    },
    topicFallback: 'Order support',
    typingIndicator: '{{agentName}} is typing…',
    input: {
      placeholder: 'Type your message',
    },
    cannedResponses: {
      first: 'I just pinged your courier to confirm the latest update for you.',
      second: 'Thanks for your patience! I can see they are approaching your location now.',
      third: 'Is there anything else you would like me to double-check while you wait?',
    },
    initialMessages: {
      system:
        'You are connected with {{agentName}} from {{brand}}. We typically reply in under 2 minutes.',
      agentGreeting:
        'Hi there! Thanks for reaching out. I’m here to help with anything related to your order.',
      customerQuestion:
        'Hi {{agentName}}, could you check why my driver seems to be stuck on the map?',
      agentFollowUp:
        'Absolutely! Let me review their route and I’ll share what I find in just a moment.',
    },
    timestamp: {
      am: 'AM',
      pm: 'PM',
    },
  },
  orderDetails: {
    fallbacks: {
      status: 'Delivered',
      paymentMethod: 'Cash',
      addressTitle: 'Delivery Address',
      addressUnavailable: 'Address unavailable',
      itemName: 'Item',
      restaurantName: 'Restaurant',
    },
  },
  profile: {
    home: {
      greeting: 'Hello, {{name}}',
      collapsedGreeting: '{{name}}',
      collapsedHint: 'Tap options below',
      statusLabel: 'Superstar',
      pointsLabel: '{{points}} PTS',
      pointsLoading: 'Loading points…',
      actions: {
        logout: 'Log out',
      },
      rowIndicator: '›',
      sections: {
        favorites: {
          title: 'Favorites',
          items: {
            overview: 'See my favorites',
          },
        },
        payment: {
          title: 'Payment',
          items: {
            methods: 'Payment methods',
            history: 'Order history',
            loyalty: 'Loyalty & rewards',
            coupons: 'Coupon codes',
          },
        },
        profile: {
          title: 'Profile',
          items: {
            settings: 'Profile settings',
          },
        },
        other: {
          title: 'Other',
          items: {
            notifications: 'Notifications',
            faq: 'FAQ',
            privacy: 'Manage privacy',
            deleteAccount: 'Delete account & data',
          },
        },
      },
    },
    settings: {
      title: 'Profile settings',
      sections: {
        personalInfo: 'Personal information',
        other: 'Other',
      },
      actions: {
        modify: 'Modify',
        changePassword: 'Change password',
        pointsAndLevel: 'Points & level',
        language: 'Language',
      },
    },
    language: {
      title: 'Language',
      heading: 'Choose your language',
      description: 'Pick the language you prefer to browse Foodify.',
      options: {
        en: 'English',
        fr: 'Français',
        ar: 'العربية',
      },
      hints: {
        en: 'Recommended for international users',
        fr: 'Idéal pour les francophones',
        ar: 'Right-to-left layout for Arabic readers',
      },
      note: 'Your selection updates instantly across the app. Changing to/from Arabic will update the layout direction.',
    },
    coupon: {
      title: 'Coupon code',
      subtitle: 'Track and redeem your Foodify coupons.',
      listTitle: 'Your coupon codes',
      emptyHint:
        'New deals drop weekly! Follow us, order often, or check back soon — your wallet will thank you.',
      redeemCta: 'Redeem points for a new coupon',
      redeemHint: 'Use your loyalty points to unlock fresh rewards.',
      assignedAt: 'Added {{date}}',
      createdFromPoints: 'Redeemed with points',
      status: {
        active: 'Ready to use',
        redeemed: 'Already used',
        inactive: 'Inactive',
      },
      discount: {
        percent: '{{value}}% off',
        freeDelivery: 'Free delivery',
      },
    },
    loyalty: {
      title: 'Loyalty rewards',
      subtitle: 'Earn 10% back in points on every delivered order.',
      balanceLabel: 'Current balance',
      lifetimeEarned: 'Lifetime earned',
      lifetimeRedeemed: 'Lifetime redeemed',
      redeemCta: 'Redeem points for coupons',
      redeemHint: 'Turn your balance into free delivery or percentage discounts.',
      transactionsTitle: 'Points history',
      transactionsEmpty: 'No activity yet — place an order to start earning points.',
      transactionTypes: {
        earned: 'Points earned',
        redeemed: 'Points spent',
        adjustment: 'Adjustment',
      },
      transactionDescriptions: {
        earnedForOrder: 'Points earned for order {{orderId}}',
        redeemedForCoupon: 'Redeemed points for coupon {{couponCode}}',
      },
      pointsUnit: 'pts',
    },
    loyaltyDetails: {
      headerTitle: 'Foodify Points',
      tagline: '10% of your order fees turn into points.',
      totalPoints: 'Total points',
      convertCta: 'Convert points',
      totalEarned: 'Total earned',
      totalSpent: 'Total spent',
      availableIn: 'Available in',
      availabilityBadge: '{{count}} days',
      stayTuned: 'Stay tuned',
      howItWorks: 'How it works?',
    },
    convert: {
      headerTitle: 'Convert points',
      availableTitle: 'Available Foody Points',
      availableSubtitle: 'Create custom rewards with your Foody points.',
      infoText:
        'Choose the reward you want to create with your Foody points. Customize and redeem instantly.',
      selectTitle: 'Select coupon type',
      freeDelivery: {
        title: 'Free delivery coupon',
        description: 'Cancel delivery fees on your next order.',
        costLabel: 'Point cost:',
      },
      percentage: {
        title: 'Discount coupon',
        description: 'Save between {{min}}% and {{max}}% on an order.',
      },
      discountLabel: 'Discount',
      sliderEdge: '{{value}}%',
      costBox: {
        pointCost: 'Point cost',
        total: 'Total',
        multiplication: '{{left}} × {{right}} {{unit}}',
      },
      summary: {
        yourPoints: 'Your points',
        couponCost: 'Coupon cost',
        remaining: 'Remaining',
      },
      needMore: 'Need {{value}} more points',
      createCta: 'Create coupon',
      keepEarning: 'Keep ordering to earn more points.',
    },
    redeem: {
      title: 'Redeem points',
      subtitle: 'Choose the reward you want to create with your loyalty points.',
      options: {
        freeDelivery: {
          title: 'Free delivery coupon',
          description: 'Costs 250 points and waives your delivery fee on the next order.',
        },
        percentage: {
          title: 'Percentage coupon',
          description: 'Costs 15 points per percent. Save between 5% and 50% on a future order.',
        },
      },
      percentageLabel: 'Discount percentage',
      percentageHint: 'Enter a value between {{min}}% and {{max}}%.',
      errors: {
        invalidNumber: 'Enter a valid percentage.',
        outOfRange: 'Percentage must be between {{min}}% and {{max}}%.',
      },
      submitCta: 'Redeem coupon',
      submitting: 'Redeeming…',
      successTitle: 'Coupon created',
      successMessage: 'Your new coupon is waiting in your wallet.',
      errorTitle: 'Unable to redeem',
      errorMessage: 'We could not redeem your points right now. Please try again later.',
    },
    notifications: {
      title: 'Notifications',
      hero: {
        title: 'Stay in the loop — get real-time updates!',
        description:
          'Turn on notifications to never miss order updates, delivery alerts, or exclusive deals. You’re in control — pick what matters most.',
        enableAll: 'Enable all & customize later',
      },
      orderStatus: {
        title: 'Order status',
        recommended: 'Recommended',
        description: 'Get real-time updates from your courier and support team. We recommend this!',
      },
      marketing: {
        title: 'Special offers just for you',
        description: 'Unlock discounts, promos, and coupons tailored to your tastes.',
      },
      labels: {
        push: 'Push notifications',
        email: 'Personalized emails',
      },
      alerts: {
        updateFailureTitle: 'Unable to update notifications',
        updateFailureMessage: 'Please try again in a moment.',
        enableAllFailureTitle: 'Unable to enable all notifications',
        enableAllFailureMessage: 'Please try again in a moment.',
      },
    },
    faq: {
      title: 'FAQ',
      sections: {
        orderingPayments: {
          title: 'Ordering & payments',
          questions: {
            applyPromo: {
              question: 'How do I apply a promo code?',
              answer:
                'You can apply your promo code at checkout in the “Promo code” field before placing your order.',
            },
            splitPayment: {
              question: 'Can I split payment between two cards?',
              answer:
                'Currently, split payments are not supported. You can only use one payment method per order.',
            },
            paymentMethods: {
              question: 'What payment methods do you accept?',
              answer: 'We accept major debit/credit cards, mobile wallets, and gift cards.',
            },
            cancelCharge: {
              question: 'Will I be charged if I cancel my order?',
              answer:
                'You will not be charged if the order is canceled before processing. Refunds may take up to 3–5 business days.',
            },
            declinedPayment: {
              question: 'Why was my payment declined?',
              answer:
                'This can occur if your card has insufficient funds or if your bank declined the transaction for security reasons.',
            },
          },
        },
        deliveryTiming: {
          title: 'Delivery & timing',
          questions: {
            trackRider: {
              question: 'Can I track my rider in real time?',
              answer:
                'Yes. Once your order is confirmed, you can track your delivery in real time from the “Orders” section.',
            },
            scheduleDelivery: {
              question: 'Can I schedule a delivery for later?',
              answer: 'Absolutely! You can select a preferred delivery time during checkout.',
            },
            deliveryTime: {
              question: 'How long does grocery delivery usually take?',
              answer:
                'Typical delivery time ranges from 30 to 60 minutes depending on your location and order size.',
            },
          },
        },
        issuesRefund: {
          title: 'Issues & refunds',
          questions: {
            missingItems: {
              question: 'What if my order is missing items?',
              answer:
                'Please contact our support team through the “Help” section and we’ll resolve it quickly.',
            },
            coldFood: {
              question: 'My food arrived cold—what can I do?',
              answer:
                'We’re sorry! Reach out to support to report the issue and request compensation or a refund.',
            },
            lateOrder: {
              question: 'Can I get a refund if my order is late?',
              answer:
                'Refunds may apply depending on the delay. Contact customer service for more details.',
            },
          },
        },
        accountSafety: {
          title: 'Account & safety',
          questions: {
            paymentSecurity: {
              question: 'Is my payment data secure?',
              answer:
                'Yes, we use encrypted payment systems to ensure your information is safe and protected.',
            },
            deleteAccount: {
              question: 'Can I delete my account permanently?',
              answer:
                'Yes. Go to “Account settings” → “Delete account & data” to permanently remove your account.',
            },
          },
        },
      },
    },
    privacy: {
      title: 'Manage privacy',
      sections: {
        personalization: 'Personalization & ads',
        location: 'Location access',
        data: 'Data & privacy',
      },
      cards: {
        personalizedRecommendations: {
          title: 'Allow personalized recommendations',
          description: 'We use your order history to suggest items you might like.',
        },
        location: {
          title: 'Use precise location for faster deliveries',
          description: 'We use your location to estimate delivery times.',
        },
      },
      links: {
        policy: 'View privacy policy',
        download: 'Download my data',
      },
    },
    favorites: {
      title: 'Favorites',
      labels: {
        new: 'New',
        rating: '{{rating}} / 5',
        defaultCuisine: 'Cuisine mix',
        openMenuHint: 'Tap to open the full menu',
        addToCartHint: 'Tap to customize and add it to your cart.',
        popular: 'Popular',
        deliveryMinutes: 'min',
      },
      sections: {
        restaurants: {
          title: 'Beloved restaurants',
          subtitle: 'Cozy corners and go-to kitchens',
        },
        menu: {
          title: 'Saved dishes',
          subtitle: 'Cravings worth coming back to',
        },
      },
      states: {
        loadingTitle: 'Setting the table for your favorites…',
        errorTitle: 'We could not fetch your saved spots.',
        errorSubtitle: 'Check your connection and try again.',
        emptyTitle: 'Your heart is wide open.',
        emptySubtitle: 'Explore restaurants and tap the heart to start your collection.',
      },
      actions: {
        retry: 'Try again',
        discover: 'Discover restaurants',
        startOrdering: 'Start ordering',
      },
    },
    orderHistory: {
      title: 'Order history',
      summaryFallback: 'Ready for pickup soon',
      fallbackItem: 'Item',
      states: {
        loadingTitle: 'Fetching your delicious memories…',
        errorTitle: 'We couldn’t load your orders.',
        errorSubtitle: 'Check your connection and try again in a moment.',
        emptyTitle: 'Your order history is empty',
        emptySubtitle:
          'Every great meal begins with a first click. Browse top-rated restaurants and build your flavor legacy today.',
      },
      actions: {
        retry: 'Try again',
        startOrdering: 'Start ordering',
        continueOrdering: 'Continue ordering',
        reorder: 'Reorder',
        rateDelivery: 'Rate delivery',
        updateRating: 'Update rating',
      },
    },
    deleteAccount: {
      title: 'Delete account & data',
      warningTitle: 'This is irreversible',
      warningDescription:
        'Deleting your account will permanently remove all your data, including earnings, delivery history, and personal information.',
      confirmPrompt: 'Please confirm to continue',
      confirmationLabel:
        'I understand that deleting my account is permanent. All my data will be lost forever.',
      deleteCta: 'Delete my account',
      cancel: 'Cancel',
      deletingTitle: 'Deleting your account',
      deletingDescription: 'This may take a few moments. Please don’t close the app.',
      deletingNote: 'You will be notified when the process is complete or if any issues arise.',
      successTitle: 'Account deleted',
      successDescription:
        'Your account and all associated data have been successfully deleted. You will be logged out automatically.',
      okay: 'Okay',
    },
    modals: {
      common: {
        continue: 'Continue',
        errors: {
          generic: 'We couldn’t update your profile. Please try again.',
        },
      },
      name: {
        title: 'Modify name',
        currentLabel: 'Current name',
        prompt: 'Enter your new name',
        firstPlaceholder: 'First name',
        lastPlaceholder: 'Last name',
        errors: {
          required: 'Please enter both your first and last name.',
        },
      },
      email: {
        title: 'Modify email address',
        currentLabel: 'Current email',
        prompt: 'Enter your new email',
        inputPlaceholder: 'Enter your email',
        emptyValue: 'Add email address',
        errors: {
          invalid: 'Please enter a valid email address.',
          generic: 'We couldn’t update your email. Please try again.',
        },
        resendMethod: 'Email',
        resendButton: 'Resend the code via email',
      },
      phone: {
        title: 'Modify phone number',
        currentLabel: 'Current phone number',
        prompt: 'Enter your new number',
        inputPlaceholder: 'e.g. 98765432',
        emptyValue: 'Add phone number',
        errors: {
          invalid: 'Please enter a valid phone number.',
        },
        resendMethod: 'SMS',
        resendButton: 'Resend the code via SMS',
      },
      password: {
        title: 'Modify password',
        currentPrompt: 'Enter your current password',
        currentPlaceholder: 'Current password',
        newPrompt: 'Enter your new password',
        newPlaceholder: 'Password',
        confirmPrompt: 'Confirm new password',
        confirmPlaceholder: 'Password',
        errors: {
          invalidCurrent: 'Wrong password. Please try again.',
          mismatch: 'Passwords do not match.',
          generic: 'We couldn’t update your password. Please try again.',
        },
      },
      dob: {
        title: 'Update date of birth',
        currentLabel: 'Current date of birth',
        prompt: 'Enter your date of birth (optional)',
        placeholder: 'YYYY-MM-DD',
        emptyValue: 'Add date of birth',
        errors: {
          invalid: 'Please enter a valid date in YYYY-MM-DD format.',
        },
      },
    },
  },
  auth: {
    landing: {
      title: 'Enter your mobile number',
      placeholder: 'Your number e.g. 98765432',
      or: 'or',
      googleCta: 'Continue with Google',
      emailCta: 'Continue with e-mail',
      errors: {
        startSignup:
          'We were unable to start verification. Please check your phone number and try again.',
      },
    },
    common: {
      defaults: {
        email: 'your email',
      },
      errors: {
        mustAcceptTerms: 'You must accept the terms to continue.',
      },
      helper: {
        existingAccount: 'We found an existing Foodify account. Enter the code to sign in.',
        attempts: 'Attempts remaining: {{count}}',
        resends: 'Resends left: {{count}}',
        expires: 'Code expires in {{seconds}}s',
      },
      resend: {
        methods: {
          email: 'Email',
          sms: 'SMS',
        },
        default: 'Resend the code via {{method}}',
        withRemaining: 'Resend the code via {{method}} ({{count}} left)',
        countdown: 'Resend available in {{seconds}}s',
      },
      verification: {
        prompt: 'Enter the {{count}} digit code sent to {{contact}}',
        errors: {
          invalidCode: 'The verification code is invalid or has expired.',
          resendFailed: 'Unable to resend the code right now. Please try again later.',
        },
      },
      terms: {
        title: 'Accept Foodify’s Terms & Review privacy notice',
        description:
          'By selecting “I agree” below, I have reviewed and agree to the <terms> and acknowledge the <privacy>. I am at least 18 years of age.',
        termsLabel: 'terms of use',
        privacyLabel: 'privacy notice',
        checkbox: 'I agree to the terms and privacy notice',
        agreeCta: 'I Agree',
      },
      dateHint: 'Please enter a valid date in YYYY-MM-DD format.',
    },
    phone: {
      emailEntry: {
        title: "What's your e-mail address",
        placeholder: 'Enter your email',
        errors: {
          generic: 'We could not save your email. Please try again.',
        },
      },
      nameEntry: {
        title: 'What’s your name',
        firstNamePlaceholder: 'First Name',
        lastNamePlaceholder: 'Last Name',
        dobPlaceholder: 'Date of Birth (YYYY-MM-DD)',
        errors: {
          generic: 'We could not save your name details. Please try again.',
        },
      },
      acceptTerms: {
        errors: {
          generic: 'We could not complete your registration. Please try again.',
        },
      },
    },
    email: {
      login: {
        emailLabel: 'Enter your e-mail address',
        emailPlaceholder: 'Your email e.g. yourmail@email.com',
        passwordLabel: 'Enter your password',
        passwordPlaceholder: 'Password',
        errors: {
          generic: 'Unable to sign in. Please check your credentials and try again.',
        },
        prompt: {
          message: "You don't have an account?",
          cta: 'Sign up',
        },
      },
      signup: {
        emailPassword: {
          emailLabel: 'Enter your e-mail address',
          emailPlaceholder: 'Enter your e-mail',
          passwordLabel: 'Enter your password',
          passwordPlaceholder: 'Password',
          confirmLabel: 'Confirm password',
          confirmPlaceholder: 'Password',
          errors: {
            generic: 'We couldn’t start your signup. Please try again.',
            mismatch: 'Passwords must match.',
          },
          prompt: {
            message: 'You already have an account?',
            cta: 'Log in',
          },
        },
        emailVerification: {
          contactPlaceholder: 'your email',
        },
        phone: {
          title: "What's your phone number?",
          placeholder: 'Enter your phone number',
          errors: {
            generic: 'We couldn’t save your phone number. Please try again.',
          },
        },
        name: {
          title: 'What’s your name',
          firstNamePlaceholder: 'First Name',
          lastNamePlaceholder: 'Last Name',
          dobPlaceholder: 'YYYY-MM-DD',
          errors: {
            generic: 'We couldn’t save your details. Please try again.',
          },
        },
        acceptTerms: {
          errors: {
            generic: 'Something went wrong while completing your signup. Please try again.',
          },
        },
        notifications: {
          title: 'Always know the status of your order',
          description:
            'Push notifications are used to provide updates on your order. You can change this in settings at any time.',
          enableCta: 'Enable push notifications',
          skipCta: 'Skip for now',
          errors: {
            physicalDevice: 'Push notifications are only supported on physical devices.',
            settings: 'Enable notifications from your device settings to receive order updates.',
            permission: 'We need permission to send you order status notifications.',
          },
        },
      },
    },
  },
};

export default en;
