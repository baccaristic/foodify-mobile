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
};

export default en;
