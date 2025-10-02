import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { SavedAddressResponse } from '~/interfaces/Address';

type SelectedAddressContextValue = {
  selectedAddress: SavedAddressResponse | null;
  setSelectedAddress: (address: SavedAddressResponse | null) => void;
  clearSelectedAddress: () => void;
};

const SelectedAddressContext = createContext<SelectedAddressContextValue | undefined>(undefined);

export const SelectedAddressProvider = ({ children }: { children: ReactNode }) => {
  const [selectedAddress, updateSelectedAddress] = useState<SavedAddressResponse | null>(null);

  const setSelectedAddress = useCallback((address: SavedAddressResponse | null) => {
    updateSelectedAddress(address);
  }, []);

  const clearSelectedAddress = useCallback(() => {
    updateSelectedAddress(null);
  }, []);

  const value = useMemo<SelectedAddressContextValue>(
    () => ({
      selectedAddress,
      setSelectedAddress,
      clearSelectedAddress,
    }),
    [selectedAddress, setSelectedAddress, clearSelectedAddress],
  );

  return <SelectedAddressContext.Provider value={value}>{children}</SelectedAddressContext.Provider>;
};

export const useSelectedAddressContext = () => {
  const context = useContext(SelectedAddressContext);
  if (!context) {
    throw new Error('useSelectedAddressContext must be used within a SelectedAddressProvider');
  }
  return context;
};
