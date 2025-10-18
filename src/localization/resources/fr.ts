import type { TranslationDictionary } from '../types';

const fr: TranslationDictionary = {
  common: {
    ok: 'OK',
    cancel: 'Annuler',
    close: 'Fermer',
    back: 'Retour',
    confirm: 'Confirmer',
    continue: 'Continuer',
    retry: 'Réessayer',
    search: 'Rechercher',
    checkout: 'Passer la commande',
    modify: 'Modifier',
    add: 'Ajouter',
    remove: 'Retirer',
    delete: 'Supprimer',
    save: 'Enregistrer',
    loading: 'Chargement…',
    error: 'Une erreur est survenue',
  },
  header: {
    chooseAddress: 'Choisissez l’adresse de livraison',
  },
  navigation: {
    home: 'Accueil',
    cart: 'Panier',
    search: 'Rechercher',
    profile: 'Profil',
    favorites: 'Favoris',
    notifications: 'Notifications',
    faq: 'FAQ',
    privacy: 'Gestion de la confidentialité',
    deleteAccount: 'Supprimer le compte et les données',
  },
  fixedOrderBar: {
    order: 'Commande',
    orderWithCount: 'Commande ({{count}})',
    orderSummary: '{{order}} : {{total}}',
    seeCart: 'Voir mon panier',
  },
  home: {
    sections: {
      topPicks: 'Meilleures recommandations pour vous',
      orderAgain: 'Commander à nouveau',
      promotions: 'Promotions',
      others: 'Autres restaurants',
    },
    rating: {
      new: 'Nouveau',
    },
    delivery: {
      free: 'Livraison gratuite',
      closesAt: 'Ferme à {{time}}',
    },
    addressPrompt: {
      title: 'Choisissez une adresse pour découvrir les restaurants proches.',
      subtitle: 'Définissez votre lieu de livraison pour voir les options disponibles dans votre zone.',
      cta: 'Sélectionner une adresse',
    },
    error: {
      title: "Impossible de récupérer les restaurants pour le moment.",
      action: 'Réessayer',
    },
    empty: {
      title: 'Aucun restaurant dans les environs.',
      subtitle: 'Élargissez votre zone de recherche ou mettez à jour votre position pour découvrir de bons repas à proximité.',
    },
    header: {
      chooseAddress: 'Veuillez choisir votre adresse.',
    },
    search: {
      prompt: 'Prêt à déguster ?',
      collapsedPlaceholder: 'Rechercher sur Food',
    },
    categories: {
      discount: 'Promotion',
      topRestaurants: 'Meilleurs restaurants',
      dishes: 'Plats',
      pizza: 'Pizza',
      burger: 'Burger',
    },
  },
  categoryOverlay: {
    addressPrompt: 'Sélectionnez une adresse pour explorer les restaurants.',
    error: {
      title: 'Impossible de charger les restaurants {{category}}.',
    },
    empty: {
      title: 'Aucun restaurant {{category}} trouvé.',
    },
    delivery: {
      withFee: 'Frais de livraison {{fee}} DT',
    },
    defaultType: 'Restaurant',
  },
  cart: {
    title: 'Mon panier',
    defaultRestaurantName: 'Restaurant',
    productLabel: {
      singular: 'produit',
      plural: 'produits',
    },
    itemSummaryPrefix: '{{count}} {{productLabel}} de ',
    priceEach: '{{price}} l\'unité',
    empty: {
      title: 'Ajoutez des articles pour commencer votre panier',
      subtitle:
        'Une fois que vous aurez ajouté des articles d\'un restaurant ou d\'une boutique, votre panier apparaîtra ici.',
      cta: 'Ajouter des articles',
    },
    addMore: 'Ajouter d\'autres articles',
  },
  coupon: {
    title: 'Code promo',
    subtitle: 'Ajoutez votre code promo',
    placeholder: 'ABCDE123',
    checkCta: 'Vérifier le code promo',
    status: {
      success: 'Code promo appliqué avec succès',
      error: 'Ce code promo est invalide. Veuillez réessayer.',
    },
  },
  locationPermission: {
    prompt: {
      title: 'Autoriser l’accès à la localisation',
      description:
        'Cela nous permet de vous montrer les restaurants et commerces auprès desquels vous pouvez commander.',
      agree: 'J’accepte',
    },
    errors: {
      disabled: 'L’autorisation de localisation est désactivée. Veuillez l’activer dans les réglages.',
      servicesDisabled: 'Veuillez activer les services de localisation de votre appareil.',
      generic: 'Nous avons besoin de votre autorisation pour afficher les restaurants à proximité.',
    },
  },
  locationSearch: {
    placeholder: 'Entrez une rue, un bâtiment, etc.',
    empty: {
      initial: 'Commencez à taper pour rechercher une rue, un bâtiment ou un quartier.',
      noResults: 'Aucun lieu correspondant. Essayez de préciser vos mots-clés.',
    },
  },
};

export default fr;
