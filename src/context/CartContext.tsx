import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';

import type { RestaurantMenuItemExtra } from '~/interfaces/Restaurant';

export interface CartRestaurant {
  id: number;
  name: string;
}

export interface CartItemOptionSelection {
  groupId: number;
  groupName: string;
  extras: RestaurantMenuItemExtra[];
}

export interface CartItem {
  id: string;
  menuItemId: number;
  name: string;
  description?: string;
  imageUrl?: string | null;
  basePrice: number;
  quantity: number;
  extras: CartItemOptionSelection[];
  extrasTotal: number;
  pricePerItem: number;
  totalPrice: number;
}

interface InternalCartItem extends CartItem {
  configurationKey: string;
}

interface CartState {
  restaurant?: CartRestaurant;
  items: InternalCartItem[];
}

interface AddCartItemPayload {
  restaurant: CartRestaurant;
  menuItem: {
    id: number;
    name: string;
    description?: string;
    imageUrl?: string | null;
    price: number;
  };
  quantity: number;
  extras: CartItemOptionSelection[];
}

interface CartContextValue {
  restaurant?: CartRestaurant;
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (payload: AddCartItemPayload) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
  showRestaurantChangeWarning: boolean;
  pendingAddItem: AddCartItemPayload | null;
  confirmRestaurantChange: () => void;
  cancelRestaurantChange: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const initialState: CartState = {
  items: [],
};

const formatExtras = (extras: CartItemOptionSelection[]) =>
  extras
    .map((group) => `${group.groupId}:${[...group.extras].map((extra) => extra.id).sort().join('-')}`)
    .sort()
    .join('|');

const buildConfigurationKey = (menuItemId: number, extras: CartItemOptionSelection[]) =>
  `${menuItemId}|${formatExtras(extras)}`;

const calculateExtrasTotal = (extras: CartItemOptionSelection[]) =>
  extras.reduce(
    (sum, group) =>
      sum + group.extras.reduce((groupSum, extra) => groupSum + (extra.price ?? 0), 0),
    0
  );

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CartState>(initialState);
  const [showRestaurantChangeWarning, setShowRestaurantChangeWarning] = useState(false);
  const [pendingAddItem, setPendingAddItem] = useState<AddCartItemPayload | null>(null);

  const addItemInternal = useCallback((payload: AddCartItemPayload, forceReplace = false) => {
    const { restaurant, menuItem, quantity, extras } = payload;

    if (quantity <= 0) {
      return;
    }

    setState((prev) => {
      const configurationKey = buildConfigurationKey(menuItem.id, extras);
      const extrasTotal = calculateExtrasTotal(extras);
      const pricePerItem = menuItem.price + extrasTotal;

      const baseState: CartState =
        prev.restaurant && prev.restaurant.id !== restaurant.id && forceReplace
          ? { restaurant, items: [] }
          : { restaurant: restaurant, items: [...prev.items] };

      const existingIndex = baseState.items.findIndex((item) => item.configurationKey === configurationKey);

      if (existingIndex >= 0) {
        const existingItem = baseState.items[existingIndex];
        const newQuantity = existingItem.quantity + quantity;
        const updatedItem: InternalCartItem = {
          ...existingItem,
          quantity: newQuantity,
          pricePerItem,
          extrasTotal,
          totalPrice: pricePerItem * newQuantity,
        };

        baseState.items[existingIndex] = updatedItem;

        return {
          restaurant: restaurant,
          items: baseState.items,
        };
      }

      const newItem: InternalCartItem = {
        id: `${configurationKey}-${Date.now()}`,
        configurationKey,
        menuItemId: menuItem.id,
        name: menuItem.name,
        description: menuItem.description,
        imageUrl: menuItem.imageUrl,
        basePrice: menuItem.price,
        quantity,
        extras,
        extrasTotal,
        pricePerItem,
        totalPrice: pricePerItem * quantity,
      };

      return {
        restaurant,
        items: [...baseState.items, newItem],
      };
    });
  }, []);

  const addItem = useCallback((payload: AddCartItemPayload) => {
    const { restaurant, quantity } = payload;

    if (quantity <= 0) {
      return;
    }

    // Check current state to decide whether to show warning
    const currentRestaurant = state.restaurant;
    const hasItems = state.items.length > 0;
    
    if (currentRestaurant && currentRestaurant.id !== restaurant.id && hasItems) {
      // Different restaurant with items in cart - show warning
      setShowRestaurantChangeWarning(true);
      setPendingAddItem(payload);
    } else {
      // Same restaurant or empty cart - add directly
      addItemInternal(payload, false);
    }
  }, [addItemInternal, state.restaurant, state.items.length]);

  const confirmRestaurantChange = useCallback(() => {
    if (pendingAddItem) {
      addItemInternal(pendingAddItem, true);
      setPendingAddItem(null);
    }
    setShowRestaurantChangeWarning(false);
  }, [pendingAddItem, addItemInternal]);

  const cancelRestaurantChange = useCallback(() => {
    setPendingAddItem(null);
    setShowRestaurantChangeWarning(false);
  }, []);

  const updateItemQuantity = useCallback((itemId: string, quantity: number) => {
    setState((prev) => {
      const items = prev.items
        .map((item) => {
          if (item.id !== itemId) {
            return item;
          }

          if (quantity <= 0) {
            return null;
          }

          return {
            ...item,
            quantity,
            totalPrice: item.pricePerItem * quantity,
          };
        })
        .filter((item): item is InternalCartItem => Boolean(item));

      const restaurant = items.length > 0 ? prev.restaurant : undefined;

      return {
        restaurant,
        items,
      };
    });
  }, []);

  const removeItem = useCallback((itemId: string) => {
    setState((prev) => {
      const items = prev.items.filter((item) => item.id !== itemId);
      const restaurant = items.length > 0 ? prev.restaurant : undefined;

      return {
        restaurant,
        items,
      };
    });
  }, []);

  const clearCart = useCallback(() => {
    setState(initialState);
  }, []);

  const items = useMemo<CartItem[]>(
    () => state.items.map(({ configurationKey, ...publicItem }) => publicItem),
    [state.items]
  );

  const subtotal = useMemo(
    () => state.items.reduce((sum, item) => sum + item.totalPrice, 0),
    [state.items]
  );

  const itemCount = useMemo(
    () => state.items.reduce((sum, item) => sum + item.quantity, 0),
    [state.items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      restaurant: state.restaurant,
      items,
      itemCount,
      subtotal,
      addItem,
      updateItemQuantity,
      removeItem,
      clearCart,
      showRestaurantChangeWarning,
      pendingAddItem,
      confirmRestaurantChange,
      cancelRestaurantChange,
    }),
    [state.restaurant, items, itemCount, subtotal, addItem, updateItemQuantity, removeItem, clearCart, showRestaurantChangeWarning, pendingAddItem, confirmRestaurantChange, cancelRestaurantChange]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }

  return context;
};

