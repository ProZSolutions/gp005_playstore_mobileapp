import React, { useCallback, useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar, ScrollView, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { clearSlotDetails, clearAllSession, getToken } from '../api/storage/authStorage';
import { AppColors } from '../theme/theme';
import { useResponsive } from '../utils/responsive';
import { formatZoneLineLabel } from '../utils/zoneLineData';
import Icon from '../components/Icon';
import { getInitials } from '../utils/commonFunctions';
import { showAlert } from '../utils/AlertService';
import { logoutUser, submitCheckIn } from '../api/services/authService';
import {getSettingList} from '../api/services/checkingService';
import { consumeShowWelcomeFlag } from '../api/storage/authStorage';
import WelcomeToast from '../components/WelcomeToast';
import { clearEscalationDateFilter } from './Escalation/EscalationList';
import {
  getShiftData,
  getUser,
  getZoneIds,
  getZoneNames,
  getLineIds,
  getLineNames,
} from '../api/storage/authStorage';
import GlobalStyles from './styles';
import { usePermissions, GROUP } from '../context/PermissionsContext';
import { clearSelectedLineId } from '../api/storage/authStorage'; 
import TabletDashboardStyles from './styles/TabletDashboardStyles';
import NotificationService from '../api/services/NotificationService';
const TEAL = AppColors.primary;
const PURPLE_LIGHT = '#EFE9FE';
 
const EMPTY_ARRAY = Object.freeze([]); 
const SETTINGS_TYPE = {
  CHECKING_ONLY: 1,
  AQL_ONLY: 2,
  BOTH: 3,
};
 
const SETTINGS_GATED_KEYS = {
  CheckingList: [SETTINGS_TYPE.CHECKING_ONLY, SETTINGS_TYPE.BOTH],
  AQLAuditList: [SETTINGS_TYPE.AQL_ONLY, SETTINGS_TYPE.BOTH],
};

const MAIN_OPERATIONS = [
  {
    key: 'TLSAuditScreen',
    title: 'TLS Audit',
    subtitle: 'Operator Quality Check',
    icon: 'dashboard_1',
    iconColor: AppColors.primary,
    iconBg: AppColors.primaryLight,
    group: GROUP.TLSAUDIT,
  },
  {
    key: 'TLSIssueTracker',
    title: 'TLS Issue',
    subtitle: 'Issue Resolution',
    icon: 'dashboard_2',
    iconColor: AppColors.warning,
    iconBg: AppColors.warningLight,
    group: GROUP.TLSISSUE,
  },
  {
    key: 'ReworkListScreen',
    title: 'Rework',
    subtitle: 'Rework Log',
    icon: 'dashboard_3',
    iconColor: AppColors.linePurple,
    iconBg: PURPLE_LIGHT,
    group: GROUP.REWORK,
  },
  {
    key: 'ReworkTrackerList',
    title: 'Rework Tracker',
    subtitle: 'Rework Verification',
    icon: 'clock_alert',
    iconColor: AppColors.linePurple,
    iconBg: PURPLE_LIGHT,
    group: GROUP.REWORKTRACKER,
  },
  {
    key: 'RejectionListScreen',
    title: 'Rejection',
    subtitle: 'Rejection Log',
    icon: 'dashboard_4',
    iconColor: AppColors.error,
    iconBg: AppColors.errorContainer,
    group: GROUP.REJECTION,
  },
  {
    key: 'RejectionTrackerList',
    title: 'Rejection Tracker',
    subtitle: 'Rejection Verification',
    icon: 'trending_down',
    iconColor: AppColors.lineRej,
    iconBg: AppColors.orgLight,
    group: GROUP.REJECTIONTRACKER,
  },
  {
    key: 'AQLAuditList',
    title: 'AQL Audit',
    subtitle: 'Acceptance quality',
    icon: 'line',
    iconColor: AppColors.primary,
    iconBg: AppColors.primaryLight,
    group: GROUP.AQLAUDIT,
  },
  {
    key: 'QCVerification',
    title: 'QC Verification',
    subtitle: 'CAP Verification',
    icon: 'shield_check',
    iconColor: AppColors.qcclr,
    iconBg: AppColors.qcclrLight,
    group: GROUP.QCVERIFICATION,
  },
  {
    key: 'CheckingList',
    title: 'Checking',
    subtitle: 'Quality Check',
    icon: 'hash',
    iconColor: AppColors.qcclr,
    iconBg: AppColors.qcclrLight,
    group: GROUP.CHECKING,
  },
   {
    key: 'EscalationList',
    title: 'Escalation',
    subtitle: 'Issue Escalation',
    icon: 'dashboard_9',
    iconColor: AppColors.qcclr,
    iconBg: AppColors.errorContainer,
    group: GROUP.ESCALATION,
  },
];

const CONFIG_TOOLS = [
  { key: 'OrderMappingScreen', title: 'Order Mapping', icon: 'dashboard_5', iconColor: AppColors.lineBlue, group: GROUP.LINEMAPPING },
  { key: 'OrderContinuityMappingScreen', title: 'Continuity Mapping', icon: 'dashboard_6', iconColor: AppColors.lineGreen, group: GROUP.CONTINUITY },
  { key: 'InputListScreen', title: 'Input', icon: 'dashboard_8', iconColor: AppColors.linePurple, group: GROUP.INPUTMODULE },
  { key: 'device_swapping', title: 'Device Swapping', icon: 'dashboard_9', iconColor: AppColors.warning, group: GROUP.DEVICESWAPPING },
  { key: 'DeviceMachineMappingScreen', title: 'Device & Machine Mapping', icon: 'dashboard_10', iconColor: AppColors.lineBlue, group: GROUP.DEVICEMAPPING },
];

export default function DashboardScreen({ navigation, route }) {
  const { moderateScale: ms, moderateVerticalScale: mvs, fontScale: fs, isLargeScreen } = useResponsive();
  const [loggingOut, setLoggingOut] = useState(false);
  const { canView, loading: permissionsLoading, refreshPermissions } = usePermissions();
  const {
    user: routeUser,
    zoneIds: rawZoneIds = EMPTY_ARRAY,
    lineIds: rawLineIds = EMPTY_ARRAY,
    zoneNames: rawZoneNames = EMPTY_ARRAY,
    lineNames: rawLineNames = EMPTY_ARRAY,
  } = route?.params ?? {};
  const zoneIds = Array.isArray(rawZoneIds) ? rawZoneIds : [];
  const lineIds = Array.isArray(rawLineIds) ? rawLineIds : [];
  const zoneNames = Array.isArray(rawZoneNames) ? rawZoneNames : [];
  const lineNames = Array.isArray(rawLineNames) ? rawLineNames : [];

  const [checkinData, setCheckinData] = useState({ zoneIds, lineIds, zoneNames, lineNames });
  const [shiftData, setShiftData] = useState(null);
  const [user, setUser] = useState(routeUser ?? null);
  const loggedOutRef = useRef(false);
  const loggingOutRef = useRef(false);
  const [output,setOutput] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);

  const [settingsType, setSettingsType] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(false);

  const inspector = {
    initials: getInitials(user?.employee_name || user?.name),
    name: user?.employee_name || user?.name || 'Rajan Kumar',
    empId: user?.employee_code ?? 'EMP-500445',
    role: user?.role_name ?? 'QC Inspector',
    shift: shiftData?.shift_name ?? ' - ',
    shiftTime: shiftData?.shift_time ?? '- ',
  };

  useEffect(() => {
  (async () => {
    const shouldShow = await consumeShowWelcomeFlag();
    if (shouldShow) setShowWelcome(true);
  })();
}, []);
  useEffect(() => {
    clearSelectedLineId();
    fetchSettings();
  }, []);

 /*useEffect(() => {
  NotificationService.init();
}, []);

  useEffect(() => {
  NotificationService.showNotification({
    title: 'Dashboard Loaded',
    body: `Welcome back, ${inspector.name}`,
    data: { screen: 'Dashboard' },
  });
}, []); */
  useEffect(() => {
    clearSlotDetails();
  }, []);

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const payload = await getSettingList();
      if (payload?.success && payload?.data?.length > 0) {
       
        const rawType = payload.data[0]?.type;
        const type = rawType != null ? Number(rawType) : null;
        setSettingsType(Number.isNaN(type) ? null : type);
        setOutput(payload.data[0].output);
      } else {
        setSettingsType(null);
        setOutput(0);
      }
    } catch (e) {
      console.log('Settings Error:', e?.message);
      setSettingsType(null);
      setOutput(0);
    } finally {
      setSettingsLoading(false);
    }
  }, []); 
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const shift = await getShiftData();
         if (!cancelled && shift) setShiftData(shift);
      } catch (e) {
        console.warn('Could not read saved shift data on mount:', e.message);
      }
    })();
    return () => { cancelled = true; };
  }, []);
 
  useEffect(() => {
    if (rawZoneIds.length || rawLineIds.length) return; // route params already win
    let cancelled = false;
    (async () => {
      try {
        const [savedZoneIds, savedZoneNames, savedLineIds, savedLineNames] = await Promise.all([
          getZoneIds(),
          getZoneNames(),
          getLineIds(),
          getLineNames(),
        ]);
        if (!cancelled && (savedZoneIds.length || savedLineIds.length)) {
          setCheckinData((prev) => ({
            ...prev,
            zoneIds: savedZoneIds,
            lineIds: savedLineIds,
            zoneNames: savedZoneNames,
            lineNames: savedLineNames,
          }));
        }
      } catch (e) {
        console.warn('Could not read saved zone/line data on mount:', e.message);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (rawZoneIds.length || rawLineIds.length || rawZoneNames.length || rawLineNames.length) {
      setCheckinData({
        zoneIds: rawZoneIds,
        lineIds: rawLineIds,
        zoneNames: rawZoneNames,
        lineNames: rawLineNames,
      });
    }
   }, [rawZoneIds, rawLineIds, rawZoneNames, rawLineNames]);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      clearEscalationDateFilter();
      (async () => { 
        if (loggedOutRef.current || loggingOutRef.current) return;

        const token = await getToken();
 
        const checkInPromise = token ? submitCheckIn({ force: true }) : Promise.resolve(null);

         try {
          const savedUser = await getUser();
          if (!cancelled && savedUser) setUser(savedUser);
        } catch (e) {
          console.warn('Could not refresh user data:', e.message);
        }

        try {
          if (!rawZoneIds.length && !rawLineIds.length) {
            const [savedZoneIds, savedZoneNames, savedLineIds, savedLineNames] = await Promise.all([
              getZoneIds(),
              getZoneNames(),
              getLineIds(),
              getLineNames(),
            ]);
            if (!cancelled && (savedZoneIds.length || savedLineIds.length)) {
              setCheckinData({
                zoneIds: savedZoneIds,
                lineIds: savedLineIds,
                zoneNames: savedZoneNames,
                lineNames: savedLineNames,
              });
            }
          }
        } catch (e) {
          console.warn('Could not refresh checkin data:', e.message);
        }

        try {
          const shift = await getShiftData();
          if (!cancelled && shift) setShiftData(shift);
        } catch (e) {
          console.warn('Could not read shift data:', e.message);
        }

        if (cancelled) return;
 
        if (!token) {
          loggedOutRef.current = true;
          return;
        }

       try {
  const result = await checkInPromise;
  if (cancelled || loggedOutRef.current || loggingOutRef.current) return;

  if (result.success && result.data) { 
    setCheckinData((prev) => ({
      ...prev,
      lineIds: (Array.isArray(result.data.line_id) && result.data.line_id.length)
        ? result.data.line_id
        : prev.lineIds,
      lineNames: (Array.isArray(result.data.line_names) && result.data.line_names.length)
        ? result.data.line_names
        : prev.lineNames,
    }));
 
    try {
      const freshShift = await getShiftData();
      if (!cancelled && freshShift) setShiftData(freshShift);
    } catch (e) {
      console.warn('Could not refresh shift data after check-in:', e.message);
    }
  } else if (!result.success && !result.fromCache) {
    const noShift =
      result.status === 404 ||
      (typeof result.message === 'string' &&
        result.message.toLowerCase().includes('shift not found'));

    const noPermission =
      result.status === 403 ||
      (typeof result.message === 'string' &&
        result.message.toLowerCase().includes('do not have permission'));

    if (noShift) {
      showAlert('error', 'No Shift Found', 'No shift is assigned to your check-in. You will be logged out.', {
        icon: 'error-outline',
        buttons: [{ text: 'OK', onPress: () => performLogout() }],
      });
      return;
    }

    if (noPermission) {
      showAlert('error', 'Access Denied', 'You do not have permission to check in on the mobile app. You will be logged out.', {
        icon: 'error-outline',
        buttons: [{ text: 'OK', onPress: () => performLogout() }],
      });
      return;
    }
  }
} catch (e) {
  console.log('Check-in on Dashboard load error:', e.message);
}
        if (cancelled || loggedOutRef.current || loggingOutRef.current) return;

        try {
          await refreshPermissions();
        } catch (e) {
          console.warn('Could not refresh permissions on Dashboard load:', e.message);
        }
      })();

      return () => {
        cancelled = true;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [rawZoneIds, rawLineIds]),
  );

  const zoneSummary = formatZoneLineLabel(checkinData.zoneNames, checkinData.lineNames);
 
  const visibleMainOps = MAIN_OPERATIONS.filter((item) => {
    const hasPermission = !item.group || canView(item.group);

    const allowedSettingsTypes = SETTINGS_GATED_KEYS[item.key];
    if (allowedSettingsTypes) {
      const hasSettingsAccess = settingsType != null && allowedSettingsTypes.includes(settingsType);
      return hasPermission && hasSettingsAccess;
    }

    return hasPermission;
  });
  const visibleConfigTools = CONFIG_TOOLS.filter((item) => !item.group || canView(item.group));

  const openChangeZone = () => {
    navigation.navigate('CheckIn', {
      user,
      isChangeZone: true,
      currentZoneIds: checkinData.zoneIds,
      currentLineIds: checkinData.lineIds,
    });
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        showAlert('confirm', 'Exit App', 'Are you sure you want to exit?', {
          buttons: [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Exit', onPress: () => BackHandler.exitApp() },
          ],
        });
        return true;
      };

      const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
      return () => subscription.remove();
    }, []),
  );

  const navigateToLogin = () => {
    if (!loggedOutRef.current) loggedOutRef.current = true;

    let root = navigation;
    while (root.getParent()) {
      root = root.getParent();
    }
    root.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const performLogout = async () => {
    if (loggingOutRef.current) return;
    loggingOutRef.current = true;

    try {
      setLoggingOut(true);
      loggedOutRef.current = true;

      await logoutUser();
      await clearAllSession();
      await refreshPermissions();
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      setLoggingOut(false);
      navigateToLogin();
    }
  };
  const aboutUS = () =>{
     navigation.navigate('AboutUsScreen');
  }
  const handleLogout = () => {
    showAlert('confirm', 'Log Out', 'Are you sure you want to log out?', {
      icon: 'logout',
      buttons: [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            showAlert('success', 'Success', 'Logged out successfully.');
            await performLogout();
          },
        },
      ],
    });
  };

  return (
    <View style={GlobalStyles.container.safe}>
     <WelcomeToast
      visible={showWelcome}
      name={inspector.name}
      onHide={() => setShowWelcome(false)}
    />
      <StatusBar barStyle="light-content" backgroundColor={TEAL} translucent={true} />

      <View style={GlobalStyles.container.headerWrap}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={GlobalStyles.container.headerTopRow}>
            <View style={GlobalStyles.container.zoneOuter}>
              <Pressable
                onPress={openChangeZone}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={({ pressed }) => [GlobalStyles.container.zoneSelector, pressed && { opacity: 0.85 }]}
              >
                <Ionicons name="location-outline" size={isLargeScreen ? ms(20) : ms(15)} color={AppColors.onPrimary} />
                <Text style={[GlobalStyles.text.changeZoneText, isLargeScreen && TabletDashboardStyles.changeZoneText]}>
                  Change Zone
                </Text>
                <Ionicons name="chevron-down" size={isLargeScreen ? ms(20) : ms(16)} color={AppColors.onPrimary} />
              </Pressable>
              <Text
                style={[GlobalStyles.text.zoneSummaryText, isLargeScreen && TabletDashboardStyles.zoneSummaryText]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {zoneSummary}
              </Text>
            </View>
            <View style={GlobalStyles.container.headerIconsRow}>
            {/*notifications-outline */}
              <Pressable
              onPress={aboutUS}
                style={[GlobalStyles.button.headerIconButton, isLargeScreen && TabletDashboardStyles.headerIconButton]}
              > 
                <Ionicons name="information-circle-outline" size={isLargeScreen ? ms(22) : ms(17)} color={AppColors.onPrimary} />
              </Pressable>
              <Pressable
                style={[
                  GlobalStyles.button.headerIconButtonProfile,
                  isLargeScreen && TabletDashboardStyles.headerIconButtonProfile,
                  { marginLeft: ms(8) },
                ]}
                onPress={handleLogout}
              >
                <Ionicons name="person-outline" size={isLargeScreen ? ms(22) : ms(17)} color={AppColors.onPrimary} />
              </Pressable>
            </View>
          </View>
        </SafeAreaView>

        {/* TABLET: inspectionCardOuter gets a max-width + centered layout
            on large screens only. Mobile style is unchanged. */}
        <View
          style={[
            GlobalStyles.container.inspectionCardOuter,
            isLargeScreen && TabletDashboardStyles.inspectionCardOuter,
          ]}
        >
          <View
            style={[
              GlobalStyles.container.inspectorCard,
              isLargeScreen && TabletDashboardStyles.inspectorCard,
            ]}
          >
            <View style={[GlobalStyles.button.avatar, isLargeScreen && TabletDashboardStyles.avatar]}>
              <Text
                style={[
                  GlobalStyles.text.avatarText,
                  isLargeScreen && TabletDashboardStyles.avatarText,
                ]}
              >
                {inspector.initials}
              </Text>
            </View>
            <View style={GlobalStyles.container.inspectorInfo}>
              <View style={GlobalStyles.container.inspectorNameRow}>
                <Text
                  style={[
                    GlobalStyles.text.inspectorName,
                    isLargeScreen && TabletDashboardStyles.inspectorName,
                  ]}
                  numberOfLines={1}
                >
                  {inspector.name}
                </Text>
                <View style={[GlobalStyles.text.empBadge, isLargeScreen && TabletDashboardStyles.empBadge]}>
                  <Text
                    style={[GlobalStyles.text.empBadgeText, isLargeScreen && TabletDashboardStyles.empBadgeText]}
                    numberOfLines={1}
                  >
                    {inspector.empId}
                  </Text>
                </View>
              </View>
              <Text
                style={[
                  GlobalStyles.text.inspectorRole,
                  isLargeScreen && TabletDashboardStyles.inspectorRole,
                ]}
                numberOfLines={1}
              >
                {inspector.role}
              </Text>
            </View>
          </View>

          <View style={[GlobalStyles.container.shiftPill, isLargeScreen && TabletDashboardStyles.shiftPill]}>
            <View style={GlobalStyles.container.shiftItem}>
              <Ionicons name="sunny-outline" size={isLargeScreen ? ms(13) : ms(10)} color={AppColors.primary} />
              <Text style={[GlobalStyles.text.shiftText, isLargeScreen && TabletDashboardStyles.shiftText]}>
                {inspector.shift}
              </Text>
            </View>
            <View style={GlobalStyles.container.shiftDivider} />
            <View style={GlobalStyles.container.shiftItem}>
              <Ionicons name="time-outline" size={isLargeScreen ? ms(13) : ms(10)} color={AppColors.primary} />
              <Text style={[GlobalStyles.text.shiftText, isLargeScreen && TabletDashboardStyles.shiftText]}>
                {inspector.shiftTime}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={GlobalStyles.container.scrollContent_dash}
      >
        {/* TABLET: body gets a centered max-width container on large
            screens only. Mobile style is unchanged. */}
        <View style={[GlobalStyles.container.body, isLargeScreen && TabletDashboardStyles.body]}>
          {visibleMainOps.length > 0 && (
            <View style={GlobalStyles.container.mainOpsSection}>
              <Text
                style={[
                  GlobalStyles.text.sectionLabel_dash,
                  isLargeScreen && TabletDashboardStyles.sectionLabel_dash,
                ]}
              >
                MAIN OPERATIONS
              </Text>
              <View style={GlobalStyles.container.mainOpsGrid}>
                {visibleMainOps.map((item) => (
                  <Pressable
                    key={item.key}
                    style={({ pressed }) => [
                      GlobalStyles.container.mainOpCard,
                      isLargeScreen && TabletDashboardStyles.mainOpCard,
                      pressed && { opacity: 0.9 },
                    ]}
                    onPress={() =>
                      navigation.navigate(item.key, {
                        user,
                        zoneIds: checkinData.zoneIds,
                        lineIds: checkinData.lineIds,
                        zoneNames: checkinData.zoneNames,
                        lineNames: checkinData.lineNames,
                        settingstype:settingsType,
                        output:output
                      })
                    }
                  >
                    <View
                      style={[
                        GlobalStyles.container.mainOpIconWrap,
                        { backgroundColor: item.iconBg },
                        isLargeScreen && TabletDashboardStyles.mainOpIconWrap,
                      ]}
                    >
                      <Icon name={item.icon} size={isLargeScreen ? ms(30) : ms(20)} />
                    </View>
                    <Text
                      style={[
                        GlobalStyles.text.mainOpTitle,
                        isLargeScreen && TabletDashboardStyles.mainOpTitle,
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Text
                      style={[
                        GlobalStyles.text.mainOpSubtitle,
                        isLargeScreen && TabletDashboardStyles.mainOpSubtitle,
                      ]}
                      numberOfLines={2}
                    >
                      {item.subtitle}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {visibleConfigTools.length > 0 && (
            <View style={GlobalStyles.container.configSection}>
              <Text
                style={[
                  GlobalStyles.text.sectionLabel_dash,
                  isLargeScreen && TabletDashboardStyles.sectionLabel_dash,
                ]}
              >
                CONFIGURATION & TOOLS
              </Text>
              <View style={GlobalStyles.container.configGrid}>
                {visibleConfigTools.map((item) => (
                  <Pressable
                    key={item.key}
                    style={({ pressed }) => [
                      GlobalStyles.container.configCard,
                      isLargeScreen && TabletDashboardStyles.configCard,
                      pressed && { opacity: 0.9 },
                    ]}
                    onPress={() =>
                      navigation.navigate(item.key, {
                        user,
                        zoneIds: checkinData.zoneIds,
                        lineIds: checkinData.lineIds,
                        zoneNames: checkinData.zoneNames,
                        lineNames: checkinData.lineNames,
                      })
                    }
                  >
                    <Text
                      style={[
                        GlobalStyles.text.configTitle,
                        isLargeScreen && TabletDashboardStyles.configTitle,
                      ]}
                    >
                      {item.title}
                    </Text>
                    <Icon
                      name={item.icon}
                      size={isLargeScreen ? ms(26) : ms(18)}
                      style={GlobalStyles.text.configIcon}
                    />
                  </Pressable>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}