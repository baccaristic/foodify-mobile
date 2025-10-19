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
  fixedOrderBar: {
    order: 'Order',
    orderWithCount: 'Order ({{count}})',
    orderSummary: '{{order}} : {{total}}',
    seeCart: 'See my cart',
  },
  home: {
    sections: {
      topPicks: 'Top picks for you',
      orderAgain: 'Order again',
      promotions: 'Promotions',
      others: 'Other restaurants',
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
    empty: {
      initial: 'Start typing to search for a street, building or area.',
      noResults: 'No matching places. Try refining the keywords.',
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
    validationMessage: 'Finish required selections for every item. Items shown in red need attention.',
    summary: '{{action}} {{count}} {{item}} for {{price}}',
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
      fees: 'Fees & delivery',
      coupon: 'Coupon ({{code}})',
      promotion: 'Promotion',
      total: 'Total',
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
      missingCoordinates: 'The selected address is missing coordinates. Please update it and try again.',
      missingPayment: 'Select a payment method to continue.',
      generic: 'We could not place your order. Please try again.',
    },
    alerts: {
      orderFailedTitle: 'Order failed',
    },
    actions: {
      confirm: 'Confirm and pay to order',
    },
  },
  profile: {
    home: {
      greeting: 'Hello, {{name}}',
      collapsedGreeting: '{{name}}',
      collapsedHint: 'Tap options below',
      statusLabel: 'Superstar',
      pointsLabel: '{{points}} PTS',
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
      },
      hints: {
        en: 'Recommended for international users',
        fr: 'Idéal pour les francophones',
      },
      note: 'Your selection updates instantly across the app.',
    },
    coupon: {
      title: 'Coupon code',
      addLabel: 'Add promo code',
      placeholder: 'Enter code',
      listTitle: 'Your coupon codes',
      emptyHint: 'New deals drop weekly! Follow us, order often, or check back soon — your wallet will thank you.',
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
              answer: 'You can apply your promo code at checkout in the “Promo code” field before placing your order.',
            },
            splitPayment: {
              question: 'Can I split payment between two cards?',
              answer: 'Currently, split payments are not supported. You can only use one payment method per order.',
            },
            paymentMethods: {
              question: 'What payment methods do you accept?',
              answer: 'We accept major debit/credit cards, mobile wallets, and gift cards.',
            },
            cancelCharge: {
              question: 'Will I be charged if I cancel my order?',
              answer: 'You will not be charged if the order is canceled before processing. Refunds may take up to 3–5 business days.',
            },
            declinedPayment: {
              question: 'Why was my payment declined?',
              answer: 'This can occur if your card has insufficient funds or if your bank declined the transaction for security reasons.',
            },
          },
        },
        deliveryTiming: {
          title: 'Delivery & timing',
          questions: {
            trackRider: {
              question: 'Can I track my rider in real time?',
              answer: 'Yes. Once your order is confirmed, you can track your delivery in real time from the “Orders” section.',
            },
            scheduleDelivery: {
              question: 'Can I schedule a delivery for later?',
              answer: 'Absolutely! You can select a preferred delivery time during checkout.',
            },
            deliveryTime: {
              question: 'How long does grocery delivery usually take?',
              answer: 'Typical delivery time ranges from 30 to 60 minutes depending on your location and order size.',
            },
          },
        },
        issuesRefund: {
          title: 'Issues & refunds',
          questions: {
            missingItems: {
              question: 'What if my order is missing items?',
              answer: 'Please contact our support team through the “Help” section and we’ll resolve it quickly.',
            },
            coldFood: {
              question: 'My food arrived cold—what can I do?',
              answer: 'We’re sorry! Reach out to support to report the issue and request compensation or a refund.',
            },
            lateOrder: {
              question: 'Can I get a refund if my order is late?',
              answer: 'Refunds may apply depending on the delay. Contact customer service for more details.',
            },
          },
        },
        accountSafety: {
          title: 'Account & safety',
          questions: {
            paymentSecurity: {
              question: 'Is my payment data secure?',
              answer: 'Yes, we use encrypted payment systems to ensure your information is safe and protected.',
            },
            deleteAccount: {
              question: 'Can I delete my account permanently?',
              answer: 'Yes. Go to “Account settings” → “Delete account & data” to permanently remove your account.',
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
        emptySubtitle: 'Every great meal begins with a first click. Browse top-rated restaurants and build your flavor legacy today.',
      },
      actions: {
        retry: 'Try again',
        startOrdering: 'Start ordering',
        continueOrdering: 'Continue ordering',
        reorder: 'Reorder',
      },
    },
    deleteAccount: {
      title: 'Delete account & data',
      warningTitle: 'This is irreversible',
      warningDescription:
        'Deleting your account will permanently remove all your data, including earnings, delivery history, and personal information.',
      confirmPrompt: 'Please confirm to continue',
      confirmationLabel: 'I understand that deleting my account is permanent. All my data will be lost forever.',
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
      },
      name: {
        title: 'Modify name',
        currentLabel: 'Current name',
        prompt: 'Enter your new name',
        firstPlaceholder: 'First name',
        lastPlaceholder: 'Last name',
      },
      email: {
        title: 'Modify email address',
        currentLabel: 'Current email',
        prompt: 'Enter your new email',
        inputPlaceholder: 'Enter your email',
        emptyValue: 'Add email address',
        errors: {
          invalid: 'Please enter a valid email address.',
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
        },
      },
    },
  },
};

export default en;
