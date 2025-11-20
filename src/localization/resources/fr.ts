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
    checkout: 'Commander',
    modify: 'Modifier',
    add: 'Ajouter',
    remove: 'Retirer',
    delete: 'Supprimer',
    save: 'Enregistrer',
    loading: 'Chargement…',
    error: 'Une erreur est survenue',
    currency: '{{amount}} DT',
  },
  header: {
    chooseAddress: 'Choisir une adresse de livraison',
  },
  navigation: {
    home: 'Accueil',
    cart: 'Panier',
    search: 'Recherche',
    profile: 'Profil',
    favorites: 'Favoris',
    notifications: 'Notifications',
    faq: 'FAQ',
    privacy: 'Gérer la confidentialité',
    deleteAccount: 'Supprimer le compte et les données',
  },
  layout: {
    ongoingOrder: {
      bannerTitle: 'Votre commande est en route',
      statusHeading: 'Statut',
      trackingFallback: 'Suivi…',
      seeDetails: 'Voir les détails',
      progressSteps: {
        created: 'Commande créée',
        preparing: 'En préparation',
        inDelivery: 'En livraison',
      },
      deliveredCelebration: {
        title: 'Bon appétit',
        subtitle: 'Votre livraison est arrivée. Bon appétit !',
        rateDelivery: 'Noter la livraison',
        close: 'Fermer',
      },
    },
  },
  systemStatus: {
    titles: {
      available: 'Les livraisons se déroulent bien',
      busy: 'Les livreurs sont occupés en ce moment',
      noDriversAvailable: 'Aucun livreur disponible',
    },
    messages: {
      busy: "Vous pouvez toujours passer votre commande, mais les délais de livraison peuvent être plus longs que d'habitude. Nous apprécions votre patience.",
      noDriversAvailable:
        'Nous ne pouvons temporairement pas accepter de nouvelles commandes de livraison. Veuillez revenir dans quelques instants.',
    },
    appreciatePatience: 'Nous apprécions votre patience.',
  },
  addressMismatch: {
    title: "Différence d'adresse détectée",
    description:
      'Votre adresse de livraison sélectionnée ne correspond pas à votre position GPS actuelle. Veuillez confirmer votre lieu de livraison.',
    selectedAddress: 'Adresse sélectionnée',
    currentGpsLocation: 'Position GPS actuelle',
    continueWithSelected: "Continuer avec l'adresse sélectionnée",
    useCurrentLocation: 'Utiliser la position actuelle',
    cancelOrder: 'Annuler la commande',
  },
  filters: {
    title: 'Filtres',
    clear: 'Tout effacer',
    sections: {
      sort: 'Trier',
      topEat: 'Top Eat',
    },
    sortOptions: {
      picked: 'Choisis pour vous',
      popular: 'Les plus populaires',
      fee: 'Frais de livraison',
      rating: 'Notes',
    },
    actions: {
      apply: 'Appliquer les filtres',
    },
  },
  fixedOrderBar: {
    order: 'Commander',
    orderWithCount: 'Commander ({{count}})',
    orderSummary: '{{order}} : {{total}}',
    seeCart: 'Voir mon panier',
  },
  deliveryRating: {
    title: 'Notez votre livraison',
    subtitle: 'Parlez-nous de votre expérience de livraison',
    fields: {
      timing: 'Le timing de la livraison',
      foodCondition: 'L’état de la nourriture',
      professionalism: 'Professionnalisme du livreur',
      overall: 'Expérience globale',
    },
    commentPrompt: 'Un mot sur la livraison ?',
    commentPlaceholder: 'Ajoutez un commentaire sur votre livraison…',
    actions: {
      submit: 'Envoyer',
      update: 'Mettre à jour la note',
    },
    errors: {
      load: 'Impossible de récupérer votre note précédente.',
      submit: 'Impossible d’enregistrer votre note. Veuillez réessayer.',
    },
  },
  restaurantRating: {
    headline: 'Notez votre livraison',
    question: 'Comment était la nourriture ?',
    options: {
      thumbsUp: 'Bien',
      thumbsDown: 'Pas top',
      or: 'ou',
    },
    commentPrompt: 'Quelque chose à ajouter ?',
    commentPlaceholder: 'Écrivez votre commentaire…',
    actions: {
      submit: 'Envoyer',
      update: 'Mettre à jour le retour',
    },
    errors: {
      load: 'Impossible de récupérer votre avis sur le restaurant.',
      submit: 'Impossible d’enregistrer votre avis. Veuillez réessayer.',
      selection: 'Veuillez choisir un pouce levé ou baissé.',
    },
  },
  home: {
    sections: {
      top: 'Nos meilleures suggestions pour vous',
      favorites: 'Vos favoris à proximité',
      orders: 'Commander à nouveau',
      restaurants: 'Restaurants à proximité',
      sponsored: 'Sponsorisé',
    },
    rating: {
      new: 'Nouveau',
    },
    delivery: {
      free: 'Livraison gratuite',
      closesAt: 'Ferme à {{time}}',
    },
    addressPrompt: {
      title: 'Choisissez une adresse pour explorer les restaurants à proximité.',
      subtitle:
        'Définissez votre lieu de livraison pour voir les options disponibles dans votre zone.',
      cta: 'Sélectionner une adresse',
    },
    error: {
      title: 'Impossible de récupérer les restaurants pour le moment.',
      action: 'Réessayer',
    },
    empty: {
      title: 'Aucun restaurant disponible dans votre zone.',
      subtitle:
        'Élargissez votre rayon de recherche ou mettez à jour votre localisation pour découvrir de bons repas à proximité.',
    },
    header: {
      chooseAddress: 'Veuillez choisir votre adresse.',
    },
    search: {
      prompt: 'Prêt à manger ?',
      collapsedPlaceholder: 'Rechercher dans Food',
    },
    categories: {
      discount: 'Réduction',
      topRestaurants: 'Meilleurs restaurants',
      dishes: 'Plats',
      pizza: 'Pizza',
      burger: 'Burger',
      asian: 'Asiatique',
      bakery: 'Boulangerie',
      breakfast: 'Petit-déjeuner',
      burgers: 'Burgers',
      chicken: 'Poulet',
      fastFood: 'Fast food',
      grill: 'Grillades',
      iceCream: 'Glaces',
      indian: 'Indien',
      international: 'International',
      italian: 'Italien',
      mexican: 'Mexicain',
      oriental: 'Oriental',
      pasta: 'Pâtes',
      salads: 'Salades',
      sandwiches: 'Sandwichs',
      seafood: 'Fruits de mer',
      snacks: 'Snacks',
      sushi: 'Sushi',
      sweets: 'Douceurs',
      tacos: 'Tacos',
      teaCoffee: 'Thé & Café',
      traditional: 'Traditionnel',
      tunisian: 'Tunisien',
      turkish: 'Turc',
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
    priceEach: "{{price}} l'unité",
    empty: {
      title: 'Ajoutez des articles pour commencer votre panier',
      subtitle:
        "Une fois que vous aurez ajouté des articles d'un restaurant ou d'une boutique, votre panier apparaîtra ici.",
      cta: 'Ajouter des articles',
    },
    addMore: "Ajouter d'autres articles",
  },
  coupon: {
    title: 'Code promo',
    subtitle: 'Ajoutez votre code promo',
    placeholder: 'ABCDE123',
    checkCta: 'Vérifier le code promo',
    listTitle: 'Vos coupons disponibles',
    emptyList: 'Aucun coupon disponible pour le moment. Gagnez des points ou revenez bientôt.',
    list: {
      percent: '{{value}} % de réduction',
      freeDelivery: 'Livraison gratuite',
    },
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
      disabled:
        'L’autorisation de localisation est désactivée. Veuillez l’activer dans les réglages.',
      servicesDisabled: 'Veuillez activer les services de localisation de votre appareil.',
      generic: 'Nous avons besoin de votre autorisation pour afficher les restaurants à proximité.',
    },
  },
  locationSearch: {
    placeholder: 'Entrez une rue, un bâtiment, etc.',
    customLabelPlaceholder: 'Donnez un nom convivial à cet endroit',
    customLabelTitle: 'Étiquette personnalisée',
    empty: {
      initial: 'Commencez à taper pour rechercher une rue, un bâtiment ou un quartier.',
      noResults: 'Aucun lieu correspondant. Essayez de préciser vos mots-clés.',
    },
    loadingAddress: 'Chargement de votre emplacement...',
    pinningLocation: 'Localisation exacte en cours…',
    deliveryLocation: 'LIEU DE LIVRAISON',
    useThisAddress: 'UTILISER CETTE ADRESSE',
    keepEditingDetails: "CONTINUER L'ÉDITION",
    savedAddresses: 'Adresses enregistrées',
    savedAddressesSubtitle: 'Choisissez un lieu fréquent ou ajoutez un nouvel emplacement.',
    noSavedAddresses:
      "Vous n'avez pas encore d'adresses enregistrées. Épinglez un emplacement pour en ajouter une.",
    selectedLabel: 'Sélectionné',
    addNewAddress: 'Ajouter une nouvelle adresse',
    searchPromptTitle: 'Rechercher un autre lieu',
    searchPromptSubtitle:
      "Faites glisser l'épingle sur la carte ci-dessus ou recherchez une rue, un bâtiment ou un point de repère exact.",
    searchPlaceholder: 'Rechercher votre lieu de livraison',
    labelThisAddress: 'Étiqueter cette adresse comme',
    addressDetailsHeading: "Détails de l'adresse",
    markEntranceHeading: "Marquer l'entrée",
    markEntranceHelper: 'Aidez notre livreur à vous trouver plus rapidement et en toute sécurité.',
    saveAndContinue: 'Enregistrer et continuer',
    adjustPinLocation: "Ajuster l'emplacement de l'épingle",
    addressTypes: {
      home: {
        label: 'Maison',
        description: 'Maison, villa ou propriété autonome',
      },
      apartment: {
        label: 'Appartement',
        description: 'Immeuble ou résidence à logements multiples',
      },
      work: {
        label: 'Travail',
        description: 'Bureau, espace de coworking ou vitrine',
      },
      other: {
        label: 'Autre',
        description: "Tout autre type d'emplacement",
      },
    },
    fields: {
      houseNumber: {
        label: 'Numéro de maison',
        placeholder: 'par ex. 24 ou Villa Nour',
      },
      directions: {
        label: 'Indications pour le livreur',
        placeholder: 'Points de repère, couleur du portail…',
      },
      building: {
        label: 'Bâtiment',
        placeholder: 'Tour, bloc ou nom de résidence',
      },
      floor: {
        label: 'Étage',
        placeholder: 'par ex. 5ème',
      },
      unit: {
        label: 'Appartement',
        placeholder: 'par ex. 5B ou 17',
      },
      complement: {
        label: 'Info complémentaire',
        placeholder: "Comment accéder à l'interphone, etc.",
      },
      company: {
        label: 'Entreprise ou organisation',
        placeholder: 'Foodify, Inc.',
      },
      department: {
        label: 'Département',
        placeholder: 'par ex. Produit, RH',
      },
      contact: {
        label: 'Contact réception',
        placeholder: 'Nom ou téléphone pour la remise',
      },
      customName: {
        label: 'Donnez-lui un nom',
        placeholder: 'Ami, salle de sport, studio…',
      },
      notes: {
        label: 'Notes pour le livreur',
        placeholder: "Décrivez l'entrée ou le point de dépôt",
      },
    },
    entranceOptions: {
      leaveAtDoor: {
        label: 'Laisser à la porte',
        helper: "Idéal quand quelqu'un est à la maison",
      },
      callOnArrival: {
        label: 'Appeler en arrivant',
        helper: 'Nous vous appellerons à notre arrivée',
      },
      meetOutside: {
        label: 'Me rencontrer dehors',
        helper: 'Je rencontrerai le livreur au portail',
      },
      buzz: {
        label: "Sonner à l'interphone",
        helper: "Fournissez le code ou le nom de l'appartement si nécessaire",
      },
      security: {
        label: "S'enregistrer avec la sécurité",
        helper: "Le livreur laissera une pièce d'identité si nécessaire",
      },
      reception: {
        label: 'Déposer à la réception',
        helper: "L'accueil signe la livraison",
      },
      securityDesk: {
        label: 'Laisser avec la sécurité',
        helper: "Parfait quand l'accès est limité",
      },
      callUponArrival: {
        label: 'Appeler en arrivant',
        helper: 'Nous vous appelons avant de monter',
      },
      call: {
        label: "Appelez-moi à l'arrivée",
        helper: 'Idéal pour les rencontres ponctuelles',
      },
      text: {
        label: 'Envoyer un SMS de mise à jour',
        helper: "Recevez un SMS rapide à l'approche",
      },
    },
    errors: {
      preciseAddressUnavailable: 'Adresse précise indisponible',
      couldNotReachMaps: 'Impossible de contacter Google Maps',
      couldNotDetermineLocation: 'Impossible de déterminer votre emplacement actuel. Réessayez.',
      locationPermissionDisabled:
        "L'autorisation de localisation est désactivée. Veuillez l'activer dans les Paramètres.",
      locationServicesOff: 'Activez les services de localisation de votre appareil pour continuer.',
      needPermission:
        'Nous avons besoin de votre permission pour afficher les restaurants à proximité.',
      couldNotLoadAddresses: 'Impossible de charger vos adresses enregistrées.',
      couldNotSaveAddress: "Impossible d'enregistrer cette adresse. Veuillez réessayer.",
      noMatchingPlaces: 'Aucun lieu correspondant. Essayez de préciser vos mots-clés.',
      couldNotRetrieveSuggestions: 'Impossible de récupérer les suggestions.',
      couldNotLoadPlace: 'Impossible de charger le lieu sélectionné.',
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
      genericErrorMessage:
        "Nous n'avons pas pu charger cet article promotionnel. Veuillez réessayer.",
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
    actions: {
      add: 'Ajouter',
      update: 'Mettre à jour',
    },
  },
  restaurantDetails: {
    tabs: {
      topSales: 'Meilleures ventes',
    },
    sections: {
      topSalesWithCount: 'Meilleures ventes ({{count}})',
      infoTitle: 'Infos restaurant',
    },
    states: {
      noSelection: {
        title: 'Aucun restaurant sélectionné.',
      },
      error: {
        title: 'Impossible de charger ce restaurant.',
      },
    },
    delivery: {
      withFee: '{{fee}} DT',
      free: 'Livraison gratuite',
      estimatedTime: '{{time}} min',
    },
    rating: {
      new: 'Nouveau',
    },
    fallbackName: 'Restaurant',
  },
  restaurantCard: {
    currentlyClosed: 'Actuellement fermé',
    opensAt: 'Ouvre à {{time}}',
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
        title: "J'ai des allergies",
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
        editMode: "Ajoutez une adresse de livraison pour l'afficher ici.",
      },
      mapUnavailable: {
        viewMode: 'Aperçu de la carte indisponible pour cette adresse',
        editMode: "Définissez une localisation précise pour l'afficher ici",
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
      beforeTip: 'Total avant pourboire',
      tip: 'Pourboire',
      cashToCollect: 'Espèces à encaisser',
      checkingDelivery: 'Vérification de la disponibilité de la livraison…',
      fees: 'Frais et livraison',
      coupon: 'Code promo ({{code}})',
      promotion: 'Promotion',
      total: 'Total',
    },
    tip: {
      overlay: {
        title: 'Un pourboire supplémentaire pour votre livreur ?',
        orderAmountLabel: 'Montant actuel de la commande :',
        tipAmountLabel: 'Votre pourboire ajoute :',
        description:
          'Remerciez-le pour son travail ! 100 % de votre pourboire revient directement au livreur.',
        percentageHelper: 'Sur le montant de votre commande',
        cancel: 'Annuler',
        confirm: 'Confirmer et continuer',
        cashLabel: 'Vous payez en espèces ? Indiquez le montant que vous remettrez au livreur.',
        cashPlaceholder: 'Montant en espèces',
        errors: {
          requiredCash: 'Indiquez le montant en espèces que vous donnerez.',
          invalidCash: 'Veuillez saisir un montant en espèces valide (jusqu’à deux décimales).',
        },
      },
      summary: {
        tip: 'Pourboire',
        beforeTip: 'Total avant pourboire',
        cashToCollect: 'Espèces à encaisser',
      },
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
      missingCoordinates:
        "L'adresse sélectionnée ne comporte pas de coordonnées. Veuillez la mettre à jour puis réessayer.",
      missingPayment: 'Sélectionnez un mode de paiement pour continuer.',
      deliveryUnavailable:
        'La livraison n’est pas disponible pour cette adresse avec ce restaurant.',
      deliveryQuoteFailed:
        'Nous n’avons pas pu vérifier la disponibilité de la livraison. Veuillez réessayer.',
      deliveryFeePending:
        'Veuillez patienter pendant la vérification de la disponibilité de la livraison.',
      generic: "Nous n'avons pas pu passer votre commande. Veuillez réessayer.",
    },
    alerts: {
      orderFailedTitle: 'Échec de la commande',
    },
    actions: {
      confirm: 'Confirmer et payer la commande',
    },
  },
  orderTracking: {
    status: {
      pending: 'Commande reçue',
      accepted: 'Commande acceptée',
      preparing: 'Préparation en cours',
      readyForPickup: 'Commande prête',
      inDelivery: 'En livraison',
      delivered: 'Livrée',
      cancelled: 'Annulée',
    },
    hero: {
      pending: 'Le restaurant a reçu votre commande.',
      accepted: 'Le restaurant a accepté votre commande et cherche un livreur…',
      preparing: 'Le restaurant prépare votre commande.',
      estimatedReadyAt: 'Préparation estimée vers {{time}}.',
      readyForPickup: 'Votre commande est prête, le livreur la récupère.',
      waitingTitle: 'En attente du restaurant',
      driverEnRoute: 'Le livreur se prépare — localisation disponible bientôt.',
      driverUnassigned: 'Nous afficherons le livreur dès qu’il sera attribué à votre commande.',
    },
    history: {
      title: 'Suivi de la commande',
      empty: 'Les mises à jour apparaîtront dès que nous recevrons des changements du restaurant.',
      statusUpdated: 'Statut mis à jour',
      defaultDescription: 'Votre commande est passée à l’étape suivante.',
      updateFallback: 'Mise à jour {{index}}',
    },
    summary: {
      orderId: 'Commande n°{{id}}',
      titleFallback: 'Détails de la commande',
      empty: 'Les articles apparaîtront une fois la commande confirmée.',
      detailsCta: 'Voir les détails',
    },
    payment: {
      title: 'Paiement en ligne',
      pendingDescription: 'Finalisez le paiement Konnect pour confirmer votre commande.',
      statusDescription: 'Nous mettrons cette page à jour dès que le statut du paiement changera.',
      environmentLabel: 'Environnement : {{environment}}',
      referenceLabel: 'Référence de paiement : {{reference}}',
      resumeCta: 'Reprendre le paiement',
      openErrorTitle: 'Impossible d’ouvrir le lien de paiement',
      openErrorMessage:
        'Nous n’avons pas pu ouvrir la page de paiement Konnect. Réessayez ou copiez le lien dans votre navigateur.',
      statusNames: {
        pending: 'En attente',
        paid: 'Payé',
        failed: 'Échoué',
        expired: 'Expiré',
      },
    },
    courier: {
      pending: 'Livreur attribué bientôt',
      label: 'Livré par',
    },
    help: {
      title: 'Besoin d’aide pour votre commande ?',
      description: 'Notre équipe d’assistance est disponible 24h/24 et 7j/7.',
      callSupport: 'Appeler le service client',
      liveChatCta: 'Demander un chat en direct immédiat',
      liveChatTopic: 'Assistance commande',
      callErrorTitle: 'Impossible de passer l’appel',
      callErrorMessage: 'Veuillez composer le {{phone}} manuellement.',
    },
  },
  liveChat: {
    agent: {
      name: 'Elena',
      role: 'Spécialiste Foodify Care',
      brand: 'Foodify Care',
    },
    header: {
      title: 'Chat en direct',
      subtitle: '{{agentName}} · {{agentRole}}',
    },
    ticket: {
      statusActive: 'Actif',
      orderLabel: 'Commande {{order}}',
      fallbackSubtitle: 'Nous vous tiendrons au courant dans cette conversation.',
    },
    topicFallback: 'Assistance commande',
    typingIndicator: '{{agentName}} est en train d’écrire…',
    input: {
      placeholder: 'Écrivez votre message',
    },
    cannedResponses: {
      first: 'Je viens de contacter votre coursier pour obtenir les dernières nouvelles.',
      second: 'Merci de votre patience ! Je vois qu’il approche de votre adresse.',
      third: 'Souhaitez-vous que je vérifie autre chose pendant l’attente ?',
    },
    initialMessages: {
      system:
        'Vous êtes en ligne avec {{agentName}} de {{brand}}. Nous répondons généralement en moins de 2 minutes.',
      agentGreeting:
        'Bonjour ! Merci de nous avoir contactés. Je suis là pour vous aider pour votre commande.',
      customerQuestion:
        'Bonjour {{agentName}}, pouvez-vous vérifier pourquoi mon livreur semble bloqué sur la carte ?',
      agentFollowUp:
        'Bien sûr ! Laissez-moi vérifier son trajet et je vous tiens au courant dans un instant.',
    },
    timestamp: {
      am: 'AM',
      pm: 'PM',
    },
  },
  orderDetails: {
    fallbacks: {
      status: 'Livrée',
      paymentMethod: 'Espèces',
      addressTitle: 'Adresse de livraison',
      addressUnavailable: 'Adresse non disponible',
      itemName: 'Article',
      restaurantName: 'Restaurant',
    },
  },
  profile: {
    home: {
      greeting: 'Bonjour, {{name}}',
      collapsedGreeting: '{{name}}',
      collapsedHint: 'Touchez une option ci-dessous',
      statusLabel: 'Superstar',
      pointsLabel: '{{points}} PTS',
      pointsLoading: 'Chargement des points…',
      actions: {
        logout: 'Se déconnecter',
      },
      rowIndicator: '›',
      sections: {
        favorites: {
          title: 'Favoris',
          items: {
            overview: 'Voir mes favoris',
          },
        },
        payment: {
          title: 'Paiement',
          items: {
            methods: 'Modes de paiement',
            history: 'Historique des commandes',
            loyalty: 'Fidélité & récompenses',
            coupons: 'Codes promo',
          },
        },
        profile: {
          title: 'Profil',
          items: {
            settings: 'Paramètres du profil',
          },
        },
        other: {
          title: 'Autre',
          items: {
            notifications: 'Notifications',
            faq: 'FAQ',
            privacy: 'Gérer la confidentialité',
            deleteAccount: 'Supprimer le compte et les données',
          },
        },
      },
    },
    Cash: {
      title: "points d'argent",
      payWith: 'Payer avec des points foody',
      total: 'Total des points',
      equal: 'Égal à :',
      qrScan: 'Scannez le code QR',
      permissionQr: "L'autorisation de l'appareil photo est requise pour scanner les codes QR.",
      allowCamera:'Autoriser la caméra',

    },

    settings: {
      title: 'Paramètres du profil',
      sections: {
        personalInfo: 'Informations personnelles',
        other: 'Autre',
      },
      actions: {
        modify: 'Modifier',
        changePassword: 'Modifier le mot de passe',
        pointsAndLevel: 'Points et niveau',
        language: 'Langue',
      },
    },
    language: {
      title: 'Langue',
      heading: 'Choisissez votre langue',
      description: 'Sélectionnez la langue dans laquelle vous souhaitez utiliser Foodify.',
      options: {
        en: 'Anglais',
        fr: 'Français',
        ar: 'Arabe',
      },
      hints: {
        en: 'Recommandée pour les utilisateurs internationaux',
        fr: 'Idéale pour les francophones',
        ar: 'Mise en page de droite à gauche pour les lecteurs arabes',
      },
      note: "Votre sélection s'applique immédiatement dans l'application. Le changement vers/depuis l'arabe mettra à jour l'orientation de la mise en page.",
    },
    coupon: {
      title: 'Code promo',
      subtitle: 'Gérez et utilisez vos coupons Foodify.',
      listTitle: 'Vos codes promo',
      emptyHint:
        'De nouvelles offres arrivent chaque semaine ! Suivez-nous, commandez souvent ou revenez bientôt — votre portefeuille vous remerciera.',
      redeemCta: 'Échanger des points contre un coupon',
      redeemHint: 'Transformez vos points fidélité en réductions ou en livraisons gratuites.',
      assignedAt: 'Ajouté le {{date}}',
      createdFromPoints: 'Obtenu avec des points',
      status: {
        active: 'Prêt à être utilisé',
        redeemed: 'Déjà utilisé',
        inactive: 'Inactif',
      },
      discount: {
        percent: '{{value}} % de réduction',
        freeDelivery: 'Livraison gratuite',
      },
    },
    loyalty: {
      title: 'Récompenses fidélité',
      subtitle: 'Gagnez 10 % de points sur chaque commande livrée.',
      balanceLabel: 'Solde actuel',
      lifetimeEarned: 'Total gagné',
      lifetimeRedeemed: 'Total dépensé',
      redeemCta: 'Échanger des points contre des coupons',
      redeemHint: 'Convertissez votre solde en réductions ou livraisons gratuites.',
      transactionsTitle: 'Historique des points',
      transactionsEmpty:
        'Aucune activité pour le moment — passez une commande pour commencer à gagner des points.',
      transactionTypes: {
        earned: 'Points gagnés',
        redeemed: 'Points dépensés',
        adjustment: 'Ajustement',
      },
      transactionDescriptions: {
        earnedForOrder: 'Points gagnés pour la commande {{orderId}}',
        redeemedForCoupon: 'Points utilisés pour le coupon {{couponCode}}',
      },
      pointsUnit: 'pts',
    },
    loyaltyDetails: {
      headerTitle: 'Points Foodify',
      tagline: '10 % des frais de vos commandes se transforment en points.',
      totalPoints: 'Points totaux',
      convertCta: 'Convertir des points',
      totalEarned: 'Total gagné',
      totalSpent: 'Total dépensé',
      availableIn: 'Disponible dans',
      availabilityBadge: '{{count}} jours',
      stayTuned: 'Restez à l’écoute',
      howItWorks: 'Comment ça marche ?',
    },
    convert: {
      headerTitle: 'Convertir des points',
      availableTitle: 'Points Foodify disponibles',
      availableSubtitle: 'Créez des récompenses personnalisées avec vos points Foodify.',
      infoText:
        'Choisissez la récompense que vous souhaitez créer avec vos points Foodify. Personnalisez et échangez instantanément.',
      selectTitle: 'Sélectionner un type de coupon',
      freeDelivery: {
        title: 'Coupon livraison gratuite',
        description: 'Annulez les frais de livraison sur votre prochaine commande.',
        costLabel: 'Coût en points :',
      },
      percentage: {
        title: 'Coupon de réduction',
        description: 'Économisez entre {{min}} % et {{max}} % sur une commande.',
      },
      discountLabel: 'Réduction',
      sliderEdge: '{{value}} %',
      costBox: {
        pointCost: 'Coût en points',
        total: 'Total',
        multiplication: '{{left}} × {{right}} {{unit}}',
      },
      summary: {
        yourPoints: 'Vos points',
        couponCost: 'Coût du coupon',
        remaining: 'Restant',
      },
      needMore: 'Il vous faut encore {{value}}',
      createCta: 'Créer un coupon',
      keepEarning: 'Continuez à commander pour gagner davantage de points.',
    },
    redeem: {
      title: 'Échanger des points',
      subtitle: 'Choisissez la récompense que vous souhaitez créer avec vos points fidélité.',
      options: {
        freeDelivery: {
          title: 'Coupon livraison gratuite',
          description:
            'Coûte 250 points et annule les frais de livraison de votre prochaine commande.',
        },
        percentage: {
          title: 'Coupon de réduction',
          description:
            'Coûte 15 points par pourcentage. Économisez entre 5 % et 50 % sur une commande.',
        },
      },
      percentageLabel: 'Pourcentage de réduction',
      percentageHint: 'Entrez une valeur entre {{min}} % et {{max}} %.',
      errors: {
        invalidNumber: 'Saisissez un pourcentage valide.',
        outOfRange: 'Le pourcentage doit être compris entre {{min}} % et {{max}} %.',
      },
      submitCta: 'Créer le coupon',
      submitting: 'Échange en cours…',
      successTitle: 'Coupon créé',
      successMessage: 'Votre nouveau coupon vous attend dans votre portefeuille.',
      errorTitle: 'Impossible d’échanger',
      errorMessage:
        'Nous n’avons pas pu échanger vos points pour le moment. Veuillez réessayer plus tard.',
    },
    notifications: {
      title: 'Notifications',
      hero: {
        title: 'Restez informé en temps réel !',
        description:
          'Activez les notifications pour ne rien manquer : suivi des commandes, alertes de livraison et offres exclusives. À vous de choisir ce qui compte.',
        enableAll: 'Tout activer et personnaliser plus tard',
      },
      orderStatus: {
        title: 'Suivi des commandes',
        recommended: 'Recommandé',
        description:
          "Recevez les mises à jour de votre livreur et de l'assistance en temps réel. Nous vous le conseillons !",
      },
      marketing: {
        title: 'Offres spéciales pour vous',
        description: 'Profitez de réductions, promos et coupons adaptés à vos envies.',
      },
      labels: {
        push: 'Notifications push',
        email: 'E-mails personnalisés',
      },
      alerts: {
        updateFailureTitle: 'Impossible de mettre à jour les notifications',
        updateFailureMessage: 'Veuillez réessayer dans un instant.',
        enableAllFailureTitle: "Impossible d'activer toutes les notifications",
        enableAllFailureMessage: 'Veuillez réessayer dans un instant.',
      },
    },
    faq: {
      title: 'FAQ',
      states: {
        loadingTitle: 'Récupération des dernières questions...',
        errorTitle: 'Impossible de charger la FAQ.',
        errorSubtitle: 'Vérifiez votre connexion puis réessayez.',
        emptyTitle: 'Aucune question disponible pour le moment',
        emptySubtitle: 'Revenez bientôt pour découvrir nos réponses.',
      },
      sections: {
        orderingPayments: {
          title: 'Commandes et paiements',
          questions: {
            applyPromo: {
              question: 'Comment appliquer un code promo ?',
              answer:
                'Ajoutez votre code promo au moment du paiement dans le champ « Code promo » avant de valider la commande.',
            },
            splitPayment: {
              question: 'Puis-je partager le paiement sur deux cartes ?',
              answer:
                "Le paiement fractionné n'est pas encore disponible. Une seule méthode de paiement est acceptée par commande.",
            },
            paymentMethods: {
              question: 'Quels moyens de paiement acceptez-vous ?',
              answer:
                'Nous acceptons les principales cartes bancaires, les portefeuilles mobiles et les cartes cadeaux.',
            },
            cancelCharge: {
              question: "Serai-je facturé si j'annule ma commande ?",
              answer:
                'Aucun frais si la commande est annulée avant préparation. Les remboursements peuvent prendre 3 à 5 jours ouvrés.',
            },
            declinedPayment: {
              question: 'Pourquoi mon paiement a-t-il été refusé ?',
              answer:
                "Cela peut venir d'un solde insuffisant ou d'un refus de votre banque pour des raisons de sécurité.",
            },
          },
        },
        deliveryTiming: {
          title: 'Livraison et délais',
          questions: {
            trackRider: {
              question: 'Puis-je suivre mon livreur en temps réel ?',
              answer:
                'Oui, une fois la commande confirmée, suivez la livraison en temps réel depuis la section « Commandes ».',
            },
            scheduleDelivery: {
              question: 'Puis-je programmer une livraison plus tard ?',
              answer: "Bien sûr ! Choisissez l'horaire de livraison souhaité lors du paiement.",
            },
            deliveryTime: {
              question: 'Quel est le délai de livraison habituel ?',
              answer:
                'Compte entre 30 et 60 minutes selon votre localisation et la taille de la commande.',
            },
          },
        },
        issuesRefund: {
          title: 'Problèmes et remboursements',
          questions: {
            missingItems: {
              question: 'Que faire si des articles manquent ?',
              answer:
                'Contactez notre support via la rubrique « Aide » et nous réglerons le problème rapidement.',
            },
            coldFood: {
              question: 'Mon repas est arrivé froid, que faire ?',
              answer:
                'Nous en sommes désolés ! Signalez-le au support pour demander une compensation ou un remboursement.',
            },
            lateOrder: {
              question: 'Puis-je être remboursé si ma commande est en retard ?',
              answer:
                'Selon le retard, un remboursement peut être envisagé. Contactez le service client pour en savoir plus.',
            },
          },
        },
        accountSafety: {
          title: 'Compte et sécurité',
          questions: {
            paymentSecurity: {
              question: 'Mes données de paiement sont-elles protégées ?',
              answer:
                'Oui, nous utilisons des systèmes de paiement chiffrés pour garantir la sécurité de vos informations.',
            },
            deleteAccount: {
              question: 'Puis-je supprimer définitivement mon compte ?',
              answer:
                'Oui. Rendez-vous dans « Paramètres du compte » → « Supprimer le compte et les données » pour procéder.',
            },
          },
        },
      },
    },
    privacy: {
      title: 'Gérer la confidentialité',
      sections: {
        personalization: 'Personnalisation et publicités',
        location: 'Accès à la localisation',
        data: 'Données et confidentialité',
      },
      cards: {
        personalizedRecommendations: {
          title: 'Autoriser les recommandations personnalisées',
          description:
            'Nous utilisons votre historique de commandes pour vous suggérer des plats susceptibles de vous plaire.',
        },
        location: {
          title: 'Utiliser la localisation précise pour des livraisons plus rapides',
          description: 'Votre position nous aide à estimer les délais de livraison.',
        },
      },
      links: {
        policy: 'Consulter la politique de confidentialité',
        download: 'Télécharger mes données',
      },
    },
    favorites: {
      title: 'Favoris',
      labels: {
        new: 'Nouveau',
        rating: '{{rating}} / 5',
        defaultCuisine: 'Cuisine variée',
        openMenuHint: 'Touchez pour ouvrir le menu complet',
        addToCartHint: 'Personnalisez et ajoutez-le à votre panier.',
        popular: 'Populaire',
        deliveryMinutes: 'min',
      },
      sections: {
        restaurants: {
          title: 'Restaurants préférés',
          subtitle: 'Vos adresses coup de cœur',
        },
        menu: {
          title: 'Plats enregistrés',
          subtitle: 'Des envies à retrouver facilement',
        },
      },
      states: {
        loadingTitle: 'Nous préparons vos favoris…',
        errorTitle: 'Impossible de récupérer vos adresses favorites.',
        errorSubtitle: 'Vérifiez votre connexion puis réessayez.',
        emptyTitle: 'Votre liste est encore vide.',
        emptySubtitle:
          'Explorez les restaurants et touchez le cœur pour commencer votre collection.',
      },
      actions: {
        retry: 'Réessayer',
        discover: 'Découvrir des restaurants',
        startOrdering: 'Commencer à commander',
      },
    },
    orderHistory: {
      title: 'Historique des commandes',
      summaryFallback: 'Bientôt prêt à être récupéré',
      fallbackItem: 'Article',
      states: {
        loadingTitle: 'Chargement de vos délicieuses commandes…',
        errorTitle: "Nous n'avons pas pu charger vos commandes.",
        errorSubtitle: 'Vérifiez votre connexion puis réessayez dans un instant.',
        emptyTitle: 'Votre historique est vide',
        emptySubtitle:
          'Chaque festin commence par une première commande. Parcourez les restaurants et écrivez votre histoire gourmande.',
      },
      actions: {
        retry: 'Réessayer',
        startOrdering: 'Commencer à commander',
        continueOrdering: 'Continuer à commander',
        reorder: 'Recommander',
        rateDelivery: 'Noter la livraison',
        updateRating: 'Mettre à jour la note',
      },
    },
    deleteAccount: {
      title: 'Supprimer le compte et les données',
      warningTitle: 'Action irréversible',
      warningDescription:
        'La suppression de votre compte effacera définitivement toutes vos données : gains, historique de livraison et informations personnelles.',
      confirmPrompt: 'Veuillez confirmer pour continuer',
      confirmationLabel:
        'Je comprends que la suppression de mon compte est définitive et que toutes mes données seront perdues.',
      deleteCta: 'Supprimer mon compte',
      cancel: 'Annuler',
      deletingTitle: 'Suppression du compte en cours',
      deletingDescription: "Cela peut prendre quelques instants. Ne fermez pas l'application.",
      deletingNote:
        'Nous vous informerons lorsque le processus sera terminé ou en cas de problème.',
      successTitle: 'Compte supprimé',
      successDescription:
        'Votre compte et toutes les données associées ont été supprimés avec succès. Vous allez être déconnecté automatiquement.',
      okay: 'OK',
    },
    modals: {
      common: {
        continue: 'Continuer',
        errors: {
          generic: "Nous n'avons pas pu mettre à jour votre profil. Veuillez réessayer.",
        },
      },
      name: {
        title: 'Modifier le nom',
        currentLabel: 'Nom actuel',
        prompt: 'Saisissez votre nouveau nom',
        firstPlaceholder: 'Prénom',
        lastPlaceholder: 'Nom',
        errors: {
          required: 'Veuillez saisir votre prénom et votre nom.',
        },
      },
      email: {
        title: "Modifier l'adresse e-mail",
        currentLabel: 'E-mail actuel',
        prompt: 'Saisissez votre nouvel e-mail',
        inputPlaceholder: 'Entrez votre e-mail',
        emptyValue: 'Ajouter une adresse e-mail',
        errors: {
          invalid: 'Veuillez saisir une adresse e-mail valide.',
          generic: "Nous n'avons pas pu mettre à jour votre e-mail. Veuillez réessayer.",
        },
        resendMethod: 'E-mail',
        resendButton: 'Renvoyer le code par e-mail',
      },
      phone: {
        title: 'Modifier le numéro de téléphone',
        currentLabel: 'Numéro actuel',
        prompt: 'Saisissez votre nouveau numéro',
        inputPlaceholder: 'ex. 98765432',
        emptyValue: 'Ajouter un numéro de téléphone',
        errors: {
          invalid: 'Veuillez saisir un numéro de téléphone valide.',
        },
        resendMethod: 'SMS',
        resendButton: 'Renvoyer le code par SMS',
      },
      password: {
        title: 'Modifier le mot de passe',
        currentPrompt: 'Saisissez votre mot de passe actuel',
        currentPlaceholder: 'Mot de passe actuel',
        newPrompt: 'Saisissez votre nouveau mot de passe',
        newPlaceholder: 'Mot de passe',
        confirmPrompt: 'Confirmez le nouveau mot de passe',
        confirmPlaceholder: 'Mot de passe',
        errors: {
          invalidCurrent: 'Mot de passe incorrect. Veuillez réessayer.',
          mismatch: 'Les mots de passe ne correspondent pas.',
          generic: "Nous n'avons pas pu mettre à jour votre mot de passe. Veuillez réessayer.",
        },
      },
      dob: {
        title: 'Mettre à jour la date de naissance',
        currentLabel: 'Date de naissance actuelle',
        prompt: 'Saisissez votre date de naissance (facultatif)',
        placeholder: 'AAAA-MM-JJ',
        emptyValue: 'Ajouter une date de naissance',
        errors: {
          invalid: 'Veuillez saisir une date valide au format AAAA-MM-JJ.',
        },
      },
    },
  },
  auth: {
    landing: {
      title: 'Saisissez votre numéro de téléphone',
      placeholder: 'Votre numéro ex. 98765432',
      or: 'ou',
      googleCta: 'Continuer avec Google',
      emailCta: 'Continuer avec e-mail',
      errors: {
        startSignup: 'Impossible de lancer la vérification. Vérifiez votre numéro et réessayez.',
      },
    },
    common: {
      defaults: {
        email: 'votre e-mail',
      },
      errors: {
        mustAcceptTerms: 'Vous devez accepter les conditions pour continuer.',
      },
      helper: {
        existingAccount:
          'Nous avons trouvé un compte Foodify existant. Saisissez le code pour vous connecter.',
        attempts: 'Tentatives restantes : {{count}}',
        resends: 'Renvois restants : {{count}}',
        expires: 'Le code expire dans {{seconds}} s',
      },
      resend: {
        methods: {
          email: 'E-mail',
          sms: 'SMS',
        },
        default: 'Renvoyer le code par {{method}}',
        withRemaining: 'Renvoyer le code par {{method}} ({{count}} restant)',
        countdown: 'Nouveau renvoi disponible dans {{seconds}} s',
      },
      verification: {
        prompt: 'Saisissez le code à {{count}} chiffres envoyé à {{contact}}',
        errors: {
          invalidCode: 'Le code de vérification est invalide ou expiré.',
          resendFailed:
            'Impossible de renvoyer le code pour le moment. Veuillez réessayer plus tard.',
        },
      },
      terms: {
        title: 'Acceptez les conditions Foodify et consultez l’avis de confidentialité',
        description:
          'En sélectionnant « J’accepte » ci-dessous, j’ai lu et j’accepte les <terms> et reconnais l’<privacy>. J’ai au moins 18 ans.',
        termsLabel: 'conditions d’utilisation',
        privacyLabel: 'avis de confidentialité',
        checkbox: 'J’accepte les conditions et l’avis de confidentialité',
        agreeCta: 'J’accepte',
      },
      dateHint: 'Veuillez saisir une date valide au format AAAA-MM-JJ.',
    },
    phone: {
      emailEntry: {
        title: 'Quelle est votre adresse e-mail ?',
        placeholder: 'Saisissez votre e-mail',
        errors: {
          generic: 'Nous n’avons pas pu enregistrer votre e-mail. Veuillez réessayer.',
        },
      },
      nameEntry: {
        title: 'Comment vous appelez-vous ?',
        firstNamePlaceholder: 'Prénom',
        lastNamePlaceholder: 'Nom',
        dobPlaceholder: 'Date de naissance (AAAA-MM-JJ)',
        errors: {
          generic: 'Nous n’avons pas pu enregistrer vos informations. Veuillez réessayer.',
        },
      },
      acceptTerms: {
        errors: {
          generic: 'Nous n’avons pas pu finaliser votre inscription. Veuillez réessayer.',
        },
      },
    },
    email: {
      login: {
        emailLabel: 'Saisissez votre adresse e-mail',
        emailPlaceholder: 'Votre e-mail ex. votremail@email.com',
        passwordLabel: 'Saisissez votre mot de passe',
        passwordPlaceholder: 'Mot de passe',
        errors: {
          generic: 'Connexion impossible. Vérifiez vos identifiants et réessayez.',
        },
        prompt: {
          message: 'Vous n’avez pas de compte ?',
          cta: 'Inscrivez-vous',
        },
      },
      signup: {
        emailPassword: {
          emailLabel: 'Saisissez votre adresse e-mail',
          emailPlaceholder: 'Saisissez votre e-mail',
          passwordLabel: 'Saisissez votre mot de passe',
          passwordPlaceholder: 'Mot de passe',
          confirmLabel: 'Confirmez le mot de passe',
          confirmPlaceholder: 'Mot de passe',
          errors: {
            generic: 'Impossible de démarrer votre inscription. Veuillez réessayer.',
            mismatch: 'Les mots de passe doivent correspondre.',
          },
          prompt: {
            message: 'Vous avez déjà un compte ?',
            cta: 'Connectez-vous',
          },
        },
        emailVerification: {
          contactPlaceholder: 'votre e-mail',
        },
        phone: {
          title: 'Quel est votre numéro de téléphone ?',
          placeholder: 'Saisissez votre numéro de téléphone',
          errors: {
            generic: 'Impossible d’enregistrer votre numéro de téléphone. Veuillez réessayer.',
          },
        },
        name: {
          title: 'Comment vous appelez-vous ?',
          firstNamePlaceholder: 'Prénom',
          lastNamePlaceholder: 'Nom',
          dobPlaceholder: 'AAAA-MM-JJ',
          errors: {
            generic: 'Impossible d’enregistrer vos informations. Veuillez réessayer.',
          },
        },
        acceptTerms: {
          errors: {
            generic:
              'Une erreur est survenue lors de la finalisation de votre inscription. Veuillez réessayer.',
          },
        },
        notifications: {
          title: 'Restez informé(e) de l’état de vos commandes',
          description:
            'Les notifications push vous permettent de suivre vos commandes. Vous pouvez modifier ce paramètre à tout moment dans les réglages.',
          enableCta: 'Activer les notifications push',
          skipCta: 'Plus tard',
          errors: {
            physicalDevice:
              'Les notifications push sont disponibles uniquement sur appareil physique.',
            settings:
              'Activez les notifications dans les réglages de votre appareil pour recevoir les mises à jour.',
            permission:
              'Nous avons besoin de votre autorisation pour vous envoyer les notifications de suivi de commande.',
          },
        },
      },
    },
  },
};

export default fr;
