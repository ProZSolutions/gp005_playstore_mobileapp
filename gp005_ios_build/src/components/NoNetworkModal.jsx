import React, { useEffect, useState, useCallback } from 'react';
import NetInfo from '@react-native-community/netinfo';
import CustomAlert from './CustomAlert';

export default function NoNetworkModal() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
       setIsConnected(Boolean(state.isConnected && state.isInternetReachable !== false));
    });
    return () => unsubscribe();
  }, []);

  const retry = useCallback(async () => {
    const state = await NetInfo.fetch();
    setIsConnected(Boolean(state.isConnected && state.isInternetReachable !== false));
  }, []);

  return (
    <CustomAlert
      visible={!isConnected}
      type="network"
      title="No Internet Connection"
      message="Please check your network settings and try again."
      buttons={[{ text: 'Retry', onPress: retry }]}
      onClose={() => {}} // no-op: don't let it be dismissed by anything but a successful retry
    />
  );
}