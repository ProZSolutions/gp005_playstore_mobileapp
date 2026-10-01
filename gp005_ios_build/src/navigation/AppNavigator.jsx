import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  getAuthSession,
  getCheckInData,
  getZoneIds,
  getZoneNames,
  getLineNames,
} from '../api/storage/authStorage';
import { AppColors } from '../theme/theme';
import { PermissionsProvider } from '../context/PermissionsContext';

// ── Screens ──────────────────────────────────────────────────────────────────
import LoginScreen from '../screens/LoginScreen';
 import CheckInScreen from '../screens/CheckInScreen';
  import TLSLineScreen from '../screens/TLSLineScreen';
import ProcessAuditScreen from '../screens/ProcessAuditScreen';
import DashboardScreen from '../screens/DashboardScreen';
import TLSAuditScreen from '../screens/TLSAuditScreen';
import ProductAuditScreen from '../screens/ProductAuditScreen';
//--- Order Mapping ---------------
import OrderMappingScreen from '../screens/OrderMapping/OrderMappingScreen';
import OperationListScreen from '../screens/OrderMapping/OperationListScreen';
import ManageOperationScreen from '../screens/OrderMapping/ManageOperationScreen';
//---DeviceMachine Mapping -----------
import DeviceMachineMappingScreen from '../screens/DeviceMachineMap/DeviceMachineMappingScreen';
import DeviceMappingFlowScreen from '../screens/DeviceMachineMap/DeviceMappingFlowScreen';
//----- TLS Issue ----------
import DefectInformation from '../screens/TLSIssue/Defectinformationscreen';
import CapInformation from '../screens/TLSIssue/Capinformationscreen';
import TLSIssueTracker from '../screens/TLSIssue/Tlsissuetrackerscreen';
//-----QC Verification  -------------
import QCVerification from '../screens/QCVerification/QCVerificationScreen';
import QCDefectInformation from '../screens/QCVerification/QCDefectInformation';
import QCCapinformation from '../screens/QCVerification/QCCapinformationscreen';

//------Input Module ------
import InputListScreen from '../screens/InputModule/InputListScreen';
import InputInformationScreen from '../screens/InputModule/InputInformationScreen';
import Inputreturnscreen from '../screens/InputModule/Inputreturnscreen';

//-------Rework Screen--------
import ReworkListScreen from '../screens/Rework/ReworkListScreen';
import ReworkDetailsScreen from '../screens/Rework/ReworkDetailsScreen';
import OperationDetailsScreen from '../screens/Rework/OperationDetailsScreen';

//------Rejection Screen -------------
import RejectionListScreen from '../screens/Rejection/RejectionListScreen';
import RejectionDetailsScreen from '../screens/Rejection/RejectionDetailsScreen';
import RejectionOperationDetailsScreen from '../screens/Rejection/RejectionOperationDetailsScreen';
// ------ Rework Tracker Screen ----------
import ReworkTrackerDetailsScreen from '../screens/ReworkTracker/ReworkTrackerDetailsScreen';
import ReworkTrackerList from '../screens/ReworkTracker/ReworkTrackerList';
// ------ Rejection Tracker Screen ----------
import RejectionTrackerDetailsScreen from '../screens/RejectionTracker/RejectionTrackerDetailsScreen';
import RejectionTrackerList from '../screens/RejectionTracker/RejectionTrackerList';
///branch selection 
import BranchSelectionScreen from '../screens/BranchSelectionScreen';

//-----------AQL Audit Screen ----------
import AQLAuditList from '../screens/AQLAudit/AQLAuditList';
import AQLAuditDetailsScreen from '../screens/AQLAudit/AQLAuditDetailsScreen';
import AQLOrderDetailsScreen from '../screens/AQLAudit/AQLOrderDetailsScreen';
//-----------Checking Screen ---------
import CheckingList from '../screens/Checking/CheckingList';
import CheckingDetails from '../screens/Checking/CheckingDetails';
//----------Escalation Screen -----------
import EscalationList from '../screens/Escalation/EscalationList';
import EscalationDetails from '../screens/Escalation/EscalationDetails';

//-------Continuity Screen-----
import OrderContinuityMappingScreen from '../screens/ContinetyMapping/OrderContinuityMappingScreen';
//-------- Device Swapping ----------
import TLSDeviceMappingScreen from '../screens/DeviceSwapping/TLSDeviceMappingScreen';
import TLSDeviceSwapReviewScreen from '../screens/DeviceSwapping/TLSDeviceSwapReviewScreen';

//Report
import ReportDetails from '../screens/Report/ReportDetails';
import ReportListScreen from '../screens/Report/ReportListScreen';

//--about us
import AboutUsScreen from '../screens/AboutUsScreen';

import { AllComponents } from '../screens/AllComponents';
import NoNetworkModal from '../components/NoNetworkModal';


const Stack = createNativeStackNavigator();

export function AppNavigator({ toggleTheme, isDark }) {
  const [initialRoute, setInitialRoute] = useState(null);
  const [bootParams, setBootParams] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const session = await getAuthSession();

        if (!session.isLoggedIn) {
          setInitialRoute('Login');
          return;
        }

        const checkin = await getCheckInData();

        if (checkin) {
          // Auth + check-in both already saved → skip straight to Dashboard.
          const [zoneIds, zoneNames, lineNames] = await Promise.all([
            getZoneIds(),
            getZoneNames(),
            getLineNames(),
          ]);

          setBootParams({
            user: session.user,
            zoneIds,
            zoneNames,
            lineIds: checkin.line_id ?? [],
            lineNames,
          });
          setInitialRoute('Dashboard');
        } else {
          // Logged in but no check-in yet → let them go through the normal
          // Login → zone/line selection → CheckIn flow.
          setInitialRoute('Login');
        }
      } catch (e) {
        setInitialRoute('Login');
      }
    };

    bootstrap();
  }, []);

  if (!initialRoute) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={AppColors.primary} />
      </View>
    );
  }

  return (
    
    <PermissionsProvider>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          initialParams={{ toggleTheme, isDark }}
        />
        
         
        <Stack.Screen
          name="CheckIn"
          component={CheckInScreen}
          options={{
            animation: 'slide_from_bottom',
            gestureDirection: 'vertical',
            presentation: 'modal',
          }}
          initialParams={{ toggleTheme, isDark }}
        />
        <Stack.Screen
          name="TLSLineScreen"
          component={TLSLineScreen}
          initialParams={{ toggleTheme, isDark }}
        />
        <Stack.Screen
          name="AllComponents"
          component={AllComponents}
          initialParams={{ toggleTheme, isDark }}
        />
        <Stack.Screen
          name="ProcessAuditScreen"
          component={ProcessAuditScreen}
          initialParams={{ toggleTheme, isDark }}
        />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          initialParams={
            initialRoute === 'Dashboard'
              ? { toggleTheme, isDark, ...bootParams }
              : { toggleTheme, isDark }
          }
        />
        <Stack.Screen
          name="TLSAuditScreen"
          component={TLSAuditScreen}
          initialParams={{ toggleTheme, isDark }}
        />
        <Stack.Screen
          name="ProductAuditScreen"
          component={ProductAuditScreen}
          initialParams={{ toggleTheme, isDark }}
        />
        <Stack.Screen
          name="OrderMappingScreen"
          component={OrderMappingScreen}
          initialParams={{ toggleTheme, isDark }}
        />
        <Stack.Screen
          name="OperationListScreen"
          component={OperationListScreen}
          initialParams={{ toggleTheme, isDark }}
        />
        <Stack.Screen
          name="TLSDeviceSwapReviewScreen"
          component={TLSDeviceSwapReviewScreen}
          initialParams={{ toggleTheme, isDark }}
        />
        <Stack.Screen
          name="AboutUsScreen"
          component={AboutUsScreen}
          initialParams={{ toggleTheme, isDark }}
        />
        <Stack.Screen
          name="ManageOperationScreen"
          component={ManageOperationScreen}
          initialParams={{ toggleTheme, isDark }}
        />
        <Stack.Screen
          name="DeviceMachineMappingScreen"
          component={DeviceMachineMappingScreen}
          initialParams={{ toggleTheme, isDark }}
        />
        <Stack.Screen
          name="DeviceMappingFlowScreen"
          component={DeviceMappingFlowScreen}
          initialParams={{ toggleTheme, isDark }}
        />
        <Stack.Screen
          name="DefectInformation"
          component={DefectInformation}
          initialParams={{ toggleTheme, isDark }}
        />
        <Stack.Screen
          name="CapInformation"
          component={CapInformation}
          initialParams={{ toggleTheme, isDark }}
        />
        <Stack.Screen
          name="TLSIssueTracker"
          component={TLSIssueTracker}
          initialParams={{ toggleTheme, isDark }}
        />


          <Stack.Screen
          name="QCVerification"
          component={QCVerification}
          initialParams={{ toggleTheme, isDark }}
        />
        <Stack.Screen
          name="QCDefectInformation"
          component={QCDefectInformation}
          initialParams={{ toggleTheme, isDark }}
        />
        <Stack.Screen
          name="QCCapinformation"
          component={QCCapinformation}
          initialParams={{ toggleTheme, isDark }}
        />
        <Stack.Screen
        name="InputListScreen"
        component={InputListScreen}
        initialParams={{toggleTheme,isDark}} />
        <Stack.Screen
        name="InputInformationScreen"
        component={InputInformationScreen} 
        initialParams={{toggleTheme,isDark}} /> 
        <Stack.Screen
        name="Inputreturnscreen"
        component={Inputreturnscreen} 
        initialParams={{toggleTheme,isDark}} /> 
          
        <Stack.Screen
        name="ReworkListScreen"
        component={ReworkListScreen} 
        initialParams={{toggleTheme,isDark}} /> 
        <Stack.Screen
        name="ReworkDetailsScreen"
        component={ReworkDetailsScreen} 
        initialParams={{toggleTheme,isDark}} /> 
        <Stack.Screen
        name="OperationDetailsScreen"
        component={OperationDetailsScreen} 
        initialParams={{toggleTheme,isDark}} /> 
        <Stack.Screen
        name="TLSDeviceMappingScreen"
        component={TLSDeviceMappingScreen}
        initialParams={{toggleTheme,isDark}}/>


        <Stack.Screen
        name="RejectionDetailsScreen"
        component={RejectionDetailsScreen} 
        initialParams={{toggleTheme,isDark}} /> 
        <Stack.Screen
        name="RejectionListScreen"
        component={RejectionListScreen} 
        initialParams={{toggleTheme,isDark}} /> 
        <Stack.Screen
        name="RejectionOperationDetailsScreen"
        component={RejectionOperationDetailsScreen} 
        initialParams={{toggleTheme,isDark}} /> 
        

        <Stack.Screen
        name="ReworkTrackerList"
        component={ReworkTrackerList} 
        initialParams={{toggleTheme,isDark}} /> 
        <Stack.Screen
        name="ReworkTrackerDetailsScreen"
        component={ReworkTrackerDetailsScreen} 
        initialParams={{toggleTheme,isDark}} /> 
 
        <Stack.Screen
          name="RejectionTrackerList"
          component={RejectionTrackerList} 
          initialParams={{toggleTheme,isDark}} /> 
        <Stack.Screen
          name="RejectionTrackerDetailsScreen"
          component={RejectionTrackerDetailsScreen} 
          initialParams={{toggleTheme,isDark}} /> 

          <Stack.Screen
          name='BranchSelectionScreen'
          component={BranchSelectionScreen}
          initialParams={{toggleTheme,isDark}} />

          <Stack.Screen
          name="AQLAuditList"
          component={AQLAuditList}
          initialParams={{toggleTheme,isDark}} />
          <Stack.Screen
          name="AQLAuditDetailsScreen"
          component={AQLAuditDetailsScreen}
          initialParams={{toggleTheme,isDark}} />
          <Stack.Screen
          name="AQLOrderDetailsScreen"
          component={AQLOrderDetailsScreen}
          initialParams={{toggleTheme,isDark}} />
          <Stack.Screen
          name="CheckingList"
          component={CheckingList}
          initialParams={{toggleTheme,isDark}} />
         <Stack.Screen
          name="CheckingDetails"
          component={CheckingDetails}
          initialParams={{toggleTheme,isDark}} />  
          <Stack.Screen
          name="EscalationList"
          component={EscalationList}
          initialParams={{toggleTheme,isDark}} />
          <Stack.Screen
          name="EscalationDetails"
          component={EscalationDetails}
          initialParams={{toggleTheme,isDark}} />
          <Stack.Screen
          name="OrderContinuityMappingScreen"
          component={OrderContinuityMappingScreen}
           initialParams={{toggleTheme,isDark}} />
            <Stack.Screen
          name="ReportDetails"
          component={ReportDetails}
           initialParams={{toggleTheme,isDark}} />
            <Stack.Screen
          name="ReportListScreen"
          component={ReportListScreen}
           initialParams={{toggleTheme,isDark}} />



      </Stack.Navigator>
      <NoNetworkModal />
    </PermissionsProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: AppColors.background,
  },
});