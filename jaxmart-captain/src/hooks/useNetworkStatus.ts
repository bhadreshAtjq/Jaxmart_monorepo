// src/hooks/useNetworkStatus.ts
import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { useOfflineSyncStore } from '../store/useOfflineSyncStore';

export const useNetworkStatus = () => {
  const isOnline = useOfflineSyncStore((s) => s.isOnline);
  const setIsOnline = useOfflineSyncStore((s) => s.setIsOnline);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsOnline(online);
      setConnectionType(state.type);
    });

    return () => unsubscribe();
  }, [setIsOnline]);

  return {
    isOnline,
    isConnected: isOnline,
    isInternetReachable: isOnline,
    connectionType,
  };
};
