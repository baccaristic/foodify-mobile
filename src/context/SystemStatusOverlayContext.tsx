import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
  type ReactNode,
  useCallback,
} from 'react';
import type { DeliveryNetworkStatus } from '~/interfaces/DeliveryStatus';

interface SystemStatusOverlayContextValue {
  lastStatus: DeliveryNetworkStatus;
  shouldDisplay: boolean;
  dismissedForStatus: DeliveryNetworkStatus | null;
  updateStatus: (status: DeliveryNetworkStatus) => void;
  dismiss: () => void;
}

type State = {
  lastStatus: DeliveryNetworkStatus;
  shouldDisplay: boolean;
  dismissedForStatus: DeliveryNetworkStatus | null;
};

type Action =
  | { type: 'UPDATE_STATUS'; payload: DeliveryNetworkStatus }
  | { type: 'DISMISS' };

const initialState: State = {
  lastStatus: 'AVAILABLE',
  shouldDisplay: false,
  dismissedForStatus: null,
};

const SystemStatusOverlayContext =
  createContext<SystemStatusOverlayContextValue | undefined>(undefined);

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'UPDATE_STATUS': {
      const status = action.payload;

      if (status === 'AVAILABLE') {
        return {
          lastStatus: 'AVAILABLE',
          shouldDisplay: false,
          dismissedForStatus: null,
        };
      }

      if (state.lastStatus !== status) {
        return {
          lastStatus: status,
          shouldDisplay: true,
          dismissedForStatus: null,
        };
      }

      const isDismissed = state.dismissedForStatus === status;

      return {
        lastStatus: status,
        dismissedForStatus: state.dismissedForStatus,
        shouldDisplay: isDismissed ? false : state.shouldDisplay,
      };
    }
    case 'DISMISS': {
      if (state.lastStatus === 'AVAILABLE') {
        return state;
      }

      return {
        ...state,
        shouldDisplay: false,
        dismissedForStatus: state.lastStatus,
      };
    }
    default:
      return state;
  }
};

export const SystemStatusOverlayProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const updateStatus = useCallback((status: DeliveryNetworkStatus) => {
    dispatch({ type: 'UPDATE_STATUS', payload: status });
  }, []);

  const dismiss = useCallback(() => {
    dispatch({ type: 'DISMISS' });
  }, []);

  const value = useMemo<SystemStatusOverlayContextValue>(
    () => ({
      lastStatus: state.lastStatus,
      shouldDisplay: state.shouldDisplay,
      dismissedForStatus: state.dismissedForStatus,
      updateStatus,
      dismiss,
    }),
    [state.dismissedForStatus, state.lastStatus, state.shouldDisplay, updateStatus, dismiss],
  );

  return (
    <SystemStatusOverlayContext.Provider value={value}>
      {children}
    </SystemStatusOverlayContext.Provider>
  );
};

export const useSystemStatusOverlayContext = () => {
  const context = useContext(SystemStatusOverlayContext);

  if (!context) {
    throw new Error('useSystemStatusOverlayContext must be used within a SystemStatusOverlayProvider');
  }

  return context;
};
