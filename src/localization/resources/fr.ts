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
  search: {
    header: {
      title: 'Veuillez choisir votre adresse.',
    },
    searchBar: {
      placeholder: 'Rechercher…',
    },
    filters: {
      promotions: 'Promotions',
      topChoice: 'Meilleur choix',
      freeDelivery: 'Livraison gratuite',
    },
    delivery: {
      withFee: 'Frais de livraison {{fee}}',
      free: 'Livraison gratuite',
    },
    card: {
      freeDeliveryPill: 'Livraison gratuite',
    },
    promoted: {
      heading: 'Articles mis en avant',
    },
    alerts: {
      menuUnavailableTitle: 'Article indisponible',
      menuUnavailableMessage:
        'Nous ne pouvons pas charger cet article promotionnel pour le moment. Veuillez réessayer plus tard.',
      genericErrorTitle: 'Un problème est survenu',
      genericErrorMessage: "Nous n'avons pas pu charger cet article promotionnel. Veuillez réessayer.",
    },
    results: {
      searching: 'Recherche…',
      count: '{{count}} résultats{{query}}',
      querySuffix: ' pour « {{query}} »',
      updating: 'Mise à jour des résultats…',
      loadingMore: 'Chargement d’autres restaurants…',
    },
    states: {
      addressPrompt: {
        title: 'Définissez votre adresse pour commencer votre recherche.',
        subtitle:
          'Ajoutez votre lieu de livraison afin que nous puissions afficher les restaurants disponibles autour de vous.',
        cta: 'Sélectionner une adresse',
      },
      loading: 'Chargement des restaurants…',
      error: 'Nous n’avons pas pu charger les restaurants. Veuillez réessayer.',
      empty: 'Aucun restaurant ne correspond encore à vos filtres.',
    },
  },
  menuDetail: {
    labels: {
      itemSingular: 'article',
      itemPlural: 'articles',
    },
    customizing: 'Personnalisation de l’article {{current}} sur {{total}}',
    draftLabel: 'n°{{index}}',
    optionGroups: {
      selectExact: 'Choisissez {{count}} {{item}}',
      selectRange: 'Choisissez entre {{min}} et {{max}} articles',
      selectAtLeast: 'Choisissez au moins {{count}} {{item}}',
      selectUpTo: 'Choisissez jusqu’à {{count}} {{item}}',
      selectAny: 'Choisissez n’importe quel article',
      required: 'Obligatoire',
      optional: 'Facultatif',
    },
    itemTotal: 'Total article {{index}}',
    validationMessage:
      'Finalisez les sélections obligatoires pour chaque article. Les éléments en rouge nécessitent une attention.',
    summary: '{{action}} {{count}} {{item}} pour {{price}}',
  },
  checkout: {
    title: 'Ma commande',
    defaults: {
      item: 'Article',
    },
    items: {
      extrasLabel: 'Suppléments {{extras}}',
      empty: {
        viewMode: 'Aucun article à afficher.',
        editMode: 'Votre panier est vide.',
      },
    },
    sections: {
      allergies: {
        title: 'J\'ai des allergies',
        placeholder: 'Ajoutez vos allergies',
      },
      comment: {
        title: 'Ajouter un commentaire',
        placeholder: 'Laissez une note pour le restaurant',
      },
    },
    address: {
      sectionTitle: 'Adresse de livraison',
      changeCta: 'Modifier',
      choosePrompt: 'Choisissez où livrer votre commande',
      savedAddressFallback: 'Adresse enregistrée',
      deliveryAddressFallback: 'Adresse de livraison',
      empty: {
        viewMode: 'Les détails de livraison ne sont pas disponibles pour cette commande.',
        editMode: 'Ajoutez une adresse de livraison pour l\'afficher ici.',
      },
      mapUnavailable: {
        viewMode: 'Aperçu de la carte indisponible pour cette adresse',
        editMode: 'Définissez une localisation précise pour l\'afficher ici',
      },
      markerTitle: 'Adresse de livraison',
    },
    payment: {
      sectionTitle: 'Mode de paiement',
      modalTitle: 'Mode de paiement',
      selectMethod: 'Sélectionnez un mode de paiement',
      methodFallback: 'Mode de paiement',
      options: {
        card: 'Ajouter une nouvelle carte bancaire',
        cash: 'Payer en espèces',
      },
      methodNames: {
        card: 'Carte bancaire',
        cash: 'Espèces',
      },
    },
    coupon: {
      add: 'Ajouter un code promo',
      applied: 'Code promo appliqué',
    },
    summary: {
      items: 'Articles',
      extras: 'Suppléments',
      delivery: 'Livraison',
      service: 'Service',
      fees: 'Frais et livraison',
      coupon: 'Code promo ({{code}})',
      promotion: 'Promotion',
      total: 'Total',
    },
    deliveryCode: {
      title: 'VOTRE CODE DE LIVRAISON',
      description:
        'Communiquez ce code au livreur lorsque vous récupérez votre commande afin de confirmer la réception de votre repas.',
    },
    instructions: {
      allergies: 'Allergies : {{value}}',
    },
    errors: {
      emptyCart: 'Votre panier est vide.',
      missingRestaurant: 'Informations sur le restaurant manquantes.',
      missingAddress: 'Veuillez choisir une adresse de livraison.',
      missingCoordinates: 'L\'adresse sélectionnée ne comporte pas de coordonnées. Veuillez la mettre à jour puis réessayer.',
      missingPayment: 'Sélectionnez un mode de paiement pour continuer.',
      generic: 'Nous n\'avons pas pu passer votre commande. Veuillez réessayer.',
    },
    alerts: {
      orderFailedTitle: 'Échec de la commande',
    },
    actions: {
      confirm: 'Confirmer et payer la commande',
    },
  },
};

export default fr;
