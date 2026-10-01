import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  KeyboardAvoidingView, Platform, StatusBar, SafeAreaView, Alert, TouchableOpacity, BackHandler
} from 'react-native';
import { useOrientation } from '../hooks/useOrientation';
import NotificationService from '../api/services/NotificationService';

import { useFocusEffect } from '@react-navigation/native';
import TabletLoginStyles from './styles/TabletLoginStyles';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { AppColors } from '../theme/theme';
import { useTheme } from 'react-native-paper';
import Feather from 'react-native-vector-icons/Feather';

import { loginUser } from '../api/services/authService';
import { clearZoneLineSelection, setShowWelcomeFlag } from '../api/storage/authStorage';
import apiClient from '../api/apiClient';
import { getDetectedShift, shiftIcon } from '../utils/shiftDetection';
import Icon from '../components/Icon';
import GlobalStyles from './styles';
import { showAlert } from '../utils/AlertService';
import { ms } from 'src/utils/scale';
import { usePermissions } from '../context/PermissionsContext';

const formattedDate = () =>
  new Date().toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  });

const ADMIN_ROLE_CODE = 100;

export default function LoginScreen({ route, navigation }) {
  const { toggleTheme, isDark } = route.params ?? {};
  const theme = useTheme();
  const { refreshPermissions } = usePermissions();
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [idError, setIdError] = useState('');
  const [pwError, setPwError] = useState('');
  const [shiftBanner, setShiftBanner] = useState('Will detect after login');
  const [shiftIconName, setShiftIconName] = useState('clock');

  const { width, height ,isLandscape } = useOrientation();

  // Use the SHORTER dimension for tablet detection so a landscape phone
  // (wide but short) doesn't get mistaken for a tablet.
  const shortSide = Math.min(width, height);
  const isLargeScreen = shortSide >= 768;

  // Orientation is a separate concern from device size.
 
  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        showAlert(
          'confirm',
          'Exit App',
          'Are you sure you want to exit?',
          {
            buttons: [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Exit', onPress: () => BackHandler.exitApp() },
            ],
          }
        );
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, [])
  );

  const validate = () => {
    let valid = true;
    if (!employeeId.trim()) { setIdError('Employee ID is required'); valid = false; }
    else setIdError('');
    if (!password) { setPwError('Password is required'); valid = false; }
    else if (password.length < 6) { setPwError('Password must be at least 6 characters'); valid = false; }
    else setPwError('');
    return valid;
  };

  const handleLogin = async () => {
    clearZoneLineSelection();
    if (!validate()) return;
    setLoading(true);

    const result = await loginUser(employeeId.trim(), password, "mobile");

    if (!result.success) {
      setLoading(false);
      const msg = result.message ?? 'Login failed. Please try again.';
      if (msg.toLowerCase().includes('password')) { setPwError(msg); }
      else if (msg.toLowerCase().includes('user') ||
               msg.toLowerCase().includes('employee') ||
               msg.toLowerCase().includes('username')) { setIdError(msg); }
      else { showAlert('error', 'Login Failed', msg); }
      return;
    }
    setLoading(false);
    await refreshPermissions();
    await setShowWelcomeFlag();
    const isAdmin = result.data.role_code === ADMIN_ROLE_CODE;
    const hasBranch = !!result.data.branch_id;
    if (isAdmin && !hasBranch) {
      navigation.replace('BranchSelectionScreen', { user: result.data });
    } else {
      navigation.replace('CheckIn', { user: result.data });
    }
  };

  // Shared form block — same JSX used in both portrait and landscape layouts
  const renderForm = () => (
    <>
      <Text style={[GlobalStyles.text.title, isLargeScreen && TabletLoginStyles.title]}>
        Welcome back
      </Text>
      <Text style={[GlobalStyles.text.subtitle, isLargeScreen && TabletLoginStyles.subtitle]}>
        Login to continue your inspection session
      </Text>

      <AppInput
        label="Employee ID"
        value={employeeId}
        onChangeText={(v) => { setEmployeeId(v); if (idError) setIdError(''); }}
        placeholder="Enter your Employee ID"
        keyboardType="default"
        returnKeyType="next"
        autoCapitalize="none"
        autoCorrect={false}
        error={idError}
        left={<Icon name="user" size={20} />}
      />

      <AppInput
        label="Password"
        value={password}
        onChangeText={(v) => { setPassword(v); if (pwError) setPwError(''); }}
        placeholder="••••••••"
        secureTextEntry
        returnKeyType="done"
        onSubmitEditing={handleLogin}
        error={pwError}
        left={<Icon name="password" size={20} />}
      />

      <View style={[GlobalStyles.text.forgotRow, isLargeScreen && TabletLoginStyles.forgotRow]}>
        <Text style={[GlobalStyles.text.forgot_title, isLargeScreen && TabletLoginStyles.forgot_title]}>
          Forgot password?
        </Text>
      </View>

      <AppButton
        label="Login"
        size="lg"
        fullWidth
        loading={loading}
        onPress={handleLogin}
      />

      <View style={[GlobalStyles.container.helpContainer, isLargeScreen && TabletLoginStyles.helpContainer]}>
        <Text style={[GlobalStyles.text.helpText, isLargeScreen && TabletLoginStyles.helpText]}>
          Having trouble?
        </Text>
        <TouchableOpacity>
          <Text style={[GlobalStyles.text.contactText, isLargeScreen && TabletLoginStyles.contactText]}>
            Contact your supervisor
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );

  return (
    <SafeAreaView style={[GlobalStyles.container.safe, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={AppColors.background} />

      <KeyboardAvoidingView
        style={GlobalStyles.container.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {isLandscape ? (
          // ── Landscape: hero as a side column, form scrolls in the rest ──
          <View style={styles.landscapeRow}>
            <View style={styles.landscapeHero}>
              <Image
                source={require('../assets/images/login_illustration.png')}
                style={styles.landscapeHeroImage}
                resizeMode="cover"
              />
            </View>
            <ScrollView
              style={styles.landscapeFormCol}
              contentContainerStyle={styles.landscapeFormContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              bounces={false}
            >
              {renderForm()}
            </ScrollView>
          </View>
        ) : (
          // ── Portrait: original stacked layout ──
          <ScrollView
            contentContainerStyle={GlobalStyles.container.scroll}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            bounces={false}
          >
            <View style={[GlobalStyles.container.heroWrapper, isLargeScreen && TabletLoginStyles.heroWrapper]}>
              <Image
                source={require('../assets/images/login_illustration.png')}
                style={GlobalStyles.icon.heroImage}
                resizeMode="cover"
              />
            </View>

            <View style={[GlobalStyles.container.card, isLargeScreen && TabletLoginStyles.card]}>
              {renderForm()}
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  landscapeRow: {
    flex: 1,
    flexDirection: 'row',
  },
  landscapeHero: {
    width: '38%',
    maxWidth: 420,
    height: '100%',
    backgroundColor: AppColors.heroBg,
    overflow: 'hidden',
  },
  landscapeHeroImage: {
    width: '100%',
    height: '100%',
  },
  landscapeFormCol: {
    flex: 1,
    backgroundColor: AppColors.surface,
  },
  landscapeFormContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 24,
  },
});