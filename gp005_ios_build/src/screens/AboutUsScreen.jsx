import React, { useState, useCallback } from 'react';
import { View, ActivityIndicator, Text, Pressable, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { AppColors } from '../theme/theme';

const ABOUT_URL = 'https://tlsfdts.proz.in/about%20us';

export default function AboutUsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const webViewRef = React.useRef(null);

  const handleReload = useCallback(() => {
    setError(false);
    setLoading(true);
    webViewRef.current?.reload();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView edges={['top']} style={{ flexDirection: 'row', alignItems: 'center', padding: 12 }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color={AppColors.primary} />
        </Pressable>
        <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: '600' }}>About Us</Text>
      </SafeAreaView>

      {error ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 }}>
          <Text style={{ marginBottom: 12 }}>Couldn't load the page.</Text>
          <Pressable onPress={handleReload} style={{ padding: 10, backgroundColor: AppColors.primary, borderRadius: 8 }}>
            <Text style={{ color: '#fff' }}>Retry</Text>
          </Pressable>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: ABOUT_URL }}
          style={{ flex: 1 }}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
          startInLoadingState
          renderLoading={() => (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
              <ActivityIndicator color={AppColors.primary} />
            </View>
          )}
        />
      )}
    </View>
  );
}