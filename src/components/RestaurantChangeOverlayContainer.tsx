import React from 'react';
import RestaurantChangeOverlay from './RestaurantChangeOverlay';
import { useCart } from '~/context/CartContext';

const RestaurantChangeOverlayContainer: React.FC = () => {
  const {
    showRestaurantChangeWarning,
    pendingAddItem,
    restaurant,
    confirmRestaurantChange,
    cancelRestaurantChange,
  } = useCart();

  if (!showRestaurantChangeWarning || !pendingAddItem || !restaurant) {
    return null;
  }

  return (
    <RestaurantChangeOverlay
      visible={showRestaurantChangeWarning}
      currentRestaurantName={restaurant.name}
      newRestaurantName={pendingAddItem.restaurant.name}
      onDiscard={confirmRestaurantChange}
      onCancel={cancelRestaurantChange}
    />
  );
};

export default RestaurantChangeOverlayContainer;
