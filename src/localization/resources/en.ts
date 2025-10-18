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
};

export default en;
