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
};

export default fr;
