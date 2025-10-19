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
    },
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
  home: {
    sections: {
      topPicks: 'Nos meilleures suggestions pour vous',
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
      title: 'Choisissez une adresse pour explorer les restaurants à proximité.',
      subtitle: 'Définissez votre lieu de livraison pour voir les options disponibles dans votre zone.',
      cta: 'Sélectionner une adresse',
    },
    error: {
      title: "Impossible de récupérer les restaurants pour le moment.",
      action: 'Réessayer',
    },
    empty: {
      title: 'Aucun restaurant disponible dans votre zone.',
      subtitle: 'Élargissez votre rayon de recherche ou mettez à jour votre localisation pour découvrir de bons repas à proximité.',
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
      withFee: 'Frais de livraison {{fee}}',
      free: 'Livraison gratuite',
    },
    rating: {
      new: 'Nouveau',
    },
    fallbackName: 'Restaurant',
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
  profile: {
    home: {
      greeting: 'Bonjour, {{name}}',
      collapsedGreeting: '{{name}}',
      collapsedHint: 'Touchez une option ci-dessous',
      statusLabel: 'Superstar',
      pointsLabel: '{{points}} PTS',
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
      },
      hints: {
        en: 'Recommandée pour les utilisateurs internationaux',
        fr: 'Idéale pour les francophones',
      },
      note: 'Votre sélection s\'applique immédiatement dans l\'application.',
    },
    coupon: {
      title: 'Code promo',
      addLabel: 'Ajouter un code promo',
      placeholder: 'Saisir le code',
      listTitle: 'Vos codes promo',
      emptyHint: 'De nouvelles offres arrivent chaque semaine ! Suivez-nous, commandez souvent ou revenez bientôt — votre portefeuille vous remerciera.',
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
        description: 'Recevez les mises à jour de votre livreur et de l\'assistance en temps réel. Nous vous le conseillons !',
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
        enableAllFailureTitle: 'Impossible d\'activer toutes les notifications',
        enableAllFailureMessage: 'Veuillez réessayer dans un instant.',
      },
    },
    faq: {
      title: 'FAQ',
      sections: {
        orderingPayments: {
          title: 'Commandes et paiements',
          questions: {
            applyPromo: {
              question: 'Comment appliquer un code promo ?',
              answer: 'Ajoutez votre code promo au moment du paiement dans le champ « Code promo » avant de valider la commande.',
            },
            splitPayment: {
              question: 'Puis-je partager le paiement sur deux cartes ?',
              answer: 'Le paiement fractionné n\'est pas encore disponible. Une seule méthode de paiement est acceptée par commande.',
            },
            paymentMethods: {
              question: 'Quels moyens de paiement acceptez-vous ?',
              answer: 'Nous acceptons les principales cartes bancaires, les portefeuilles mobiles et les cartes cadeaux.',
            },
            cancelCharge: {
              question: 'Serai-je facturé si j\'annule ma commande ?',
              answer: 'Aucun frais si la commande est annulée avant préparation. Les remboursements peuvent prendre 3 à 5 jours ouvrés.',
            },
            declinedPayment: {
              question: 'Pourquoi mon paiement a-t-il été refusé ?',
              answer: 'Cela peut venir d\'un solde insuffisant ou d\'un refus de votre banque pour des raisons de sécurité.',
            },
          },
        },
        deliveryTiming: {
          title: 'Livraison et délais',
          questions: {
            trackRider: {
              question: 'Puis-je suivre mon livreur en temps réel ?',
              answer: 'Oui, une fois la commande confirmée, suivez la livraison en temps réel depuis la section « Commandes ».',
            },
            scheduleDelivery: {
              question: 'Puis-je programmer une livraison plus tard ?',
              answer: 'Bien sûr ! Choisissez l\'horaire de livraison souhaité lors du paiement.',
            },
            deliveryTime: {
              question: 'Quel est le délai de livraison habituel ?',
              answer: 'Compte entre 30 et 60 minutes selon votre localisation et la taille de la commande.',
            },
          },
        },
        issuesRefund: {
          title: 'Problèmes et remboursements',
          questions: {
            missingItems: {
              question: 'Que faire si des articles manquent ?',
              answer: 'Contactez notre support via la rubrique « Aide » et nous réglerons le problème rapidement.',
            },
            coldFood: {
              question: 'Mon repas est arrivé froid, que faire ?',
              answer: 'Nous en sommes désolés ! Signalez-le au support pour demander une compensation ou un remboursement.',
            },
            lateOrder: {
              question: 'Puis-je être remboursé si ma commande est en retard ?',
              answer: 'Selon le retard, un remboursement peut être envisagé. Contactez le service client pour en savoir plus.',
            },
          },
        },
        accountSafety: {
          title: 'Compte et sécurité',
          questions: {
            paymentSecurity: {
              question: 'Mes données de paiement sont-elles protégées ?',
              answer: 'Oui, nous utilisons des systèmes de paiement chiffrés pour garantir la sécurité de vos informations.',
            },
            deleteAccount: {
              question: 'Puis-je supprimer définitivement mon compte ?',
              answer: 'Oui. Rendez-vous dans « Paramètres du compte » → « Supprimer le compte et les données » pour procéder.',
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
          description: 'Nous utilisons votre historique de commandes pour vous suggérer des plats susceptibles de vous plaire.',
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
        emptySubtitle: 'Explorez les restaurants et touchez le cœur pour commencer votre collection.',
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
        errorTitle: 'Nous n\'avons pas pu charger vos commandes.',
        errorSubtitle: 'Vérifiez votre connexion puis réessayez dans un instant.',
        emptyTitle: 'Votre historique est vide',
        emptySubtitle: 'Chaque festin commence par une première commande. Parcourez les restaurants et écrivez votre histoire gourmande.',
      },
      actions: {
        retry: 'Réessayer',
        startOrdering: 'Commencer à commander',
        continueOrdering: 'Continuer à commander',
        reorder: 'Recommander',
      },
    },
    deleteAccount: {
      title: 'Supprimer le compte et les données',
      warningTitle: 'Action irréversible',
      warningDescription:
        'La suppression de votre compte effacera définitivement toutes vos données : gains, historique de livraison et informations personnelles.',
      confirmPrompt: 'Veuillez confirmer pour continuer',
      confirmationLabel: 'Je comprends que la suppression de mon compte est définitive et que toutes mes données seront perdues.',
      deleteCta: 'Supprimer mon compte',
      cancel: 'Annuler',
      deletingTitle: 'Suppression du compte en cours',
      deletingDescription: 'Cela peut prendre quelques instants. Ne fermez pas l\'application.',
      deletingNote: 'Nous vous informerons lorsque le processus sera terminé ou en cas de problème.',
      successTitle: 'Compte supprimé',
      successDescription:
        'Votre compte et toutes les données associées ont été supprimés avec succès. Vous allez être déconnecté automatiquement.',
      okay: 'OK',
    },
    modals: {
      common: {
        continue: 'Continuer',
      },
      name: {
        title: 'Modifier le nom',
        currentLabel: 'Nom actuel',
        prompt: 'Saisissez votre nouveau nom',
        firstPlaceholder: 'Prénom',
        lastPlaceholder: 'Nom',
      },
      email: {
        title: 'Modifier l\'adresse e-mail',
        currentLabel: 'E-mail actuel',
        prompt: 'Saisissez votre nouvel e-mail',
        inputPlaceholder: 'Entrez votre e-mail',
        emptyValue: 'Ajouter une adresse e-mail',
        errors: {
          invalid: 'Veuillez saisir une adresse e-mail valide.',
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
        },
      },
    },
  },
};

export default fr;
