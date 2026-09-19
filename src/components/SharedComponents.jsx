import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { AppColors } from '../theme/theme';
import { ms, mvs, fs } from '../utils/scale';
 import GlobalStyles from '../screens/styles';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

  import Icon from '../components/Icon';

 export function SectionLabel({ label }) {
  return <Text style={GlobalStyles.text.sectionLabel}>{label}</Text>;
}
 export function SectionLabelNew({ label }) {
  return <Text style={GlobalStyles.text.sectionLabelNew}>{label}</Text>;
}

 export function DetailCell({ label, value, colourHex }) {
  return (
    <View style={GlobalStyles.container.detailCell}>
      <Text style={GlobalStyles.text.detailLabel}>{label}</Text>
      <View style={GlobalStyles.text.detailValueRow}>
        {colourHex ? (
          <View style={[GlobalStyles.text.colourDot, { backgroundColor: colourHex }]} />
        ) : null}
        <Text style={GlobalStyles.text.detailValue} numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}
function DetailRow({ label, value, styles, bordered, italic, live, multiline,icon,iconFamily }) {
  const IconComponent = iconFamily === 'feather' ? Feather : Ionicons;
  if (multiline) {
    return (
      <View style={[styles.detailRowMultiline, bordered && styles.detailRowBorder]}>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={[  italic && styles.detailValueItalic]}>
          {value}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.detailRow, bordered && styles.detailRowBorder]}>

      <IconComponent name={icon} size={ms(16)} color={AppColors.primary} /> 
      <Text style={styles.detailLabel} numberOfLines={1}>
        {label}
      </Text>

      {live ? (
        <View style={styles.liveValueRow}>
          <View style={styles.liveDot} />
          <Text style={styles.liveValueText} numberOfLines={1} ellipsizeMode="tail">
            {value}
          </Text>
        </View>
      ) : (
        <Text
          style={[styles.detailValue, italic && styles.detailValueItalic]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {value}
        </Text>
      )}
    </View>
  );
}

 export function OperatorOrderCard({ order, operator, onViewAll,styless,isLandscape,isLargeScreen }) {
  const pickStyle = (largePortrait, largeLandscape, mobilePortrait, mobileLandscape) =>   isLargeScreen ? (isLandscape ? largeLandscape : largePortrait): 
  (isLandscape ? mobileLandscape : mobilePortrait);
 const card_pro = pickStyle(GlobalStyles.container.card_proLarge,GlobalStyles.container.card_proLarge,
  null,GlobalStyles.container.card_pro);
  const sectionHeaderRow = pickStyle(GlobalStyles.container.sectionHeaderRowL,GlobalStyles.container.sectionHeaderRowL,
  null,GlobalStyles.container.sectionHeaderRow);
  const viewAllText = pickStyle(GlobalStyles.text.viewAllTextLarge,GlobalStyles.text.viewAllTextLarge,
  null,GlobalStyles.text.viewAllText);

  const sectionBody = pickStyle(GlobalStyles.container.sectionBodyLarger,GlobalStyles.container.sectionBodyLarger,
  null,GlobalStyles.container.sectionBody);
 


   return (
 <View style={[GlobalStyles.container.card_pro,card_pro]}>
  <View style={[GlobalStyles.container.sectionHeaderRow,sectionHeaderRow]}>
    <SectionLabelNew label="OPERATOR & ORDER DETAILS" style={{paddingTop:0}}/>
    <TouchableOpacity onPress={onViewAll}>
      <Text style={[GlobalStyles.text.viewAllText,viewAllText]}>View all</Text>
    </TouchableOpacity>
  </View>

    <View style={[GlobalStyles.container.sectionBody,sectionBody]}>
          <DetailRow styles={GlobalStyles.container} label="Order No." value={order?.orderrCode ?? '—'} icon='hash' iconFamily='feather' />
          <DetailRow styles={GlobalStyles.container} label="Operation" value={operator?.operation ?? '—'} icon='tool' iconFamily='feather' />
          <DetailRow styles={GlobalStyles.container} label="Colour" value={order?.colour ?? '—'} icon='color-palette-outline' iconFamily='ionicon'  /> 
    </View> 
    </View>
  );
}

export function AuditHeader({ title, step, totalSteps = 2, onCancel, onBack,header,isLandscape,isLargeScreen }) {
  const pickStyle = (largePortrait, largeLandscape, mobilePortrait, mobileLandscape) =>   isLargeScreen ? (isLandscape ? largeLandscape : largePortrait): 
  (isLandscape ? mobileLandscape : mobilePortrait);
 const globalHeader = pickStyle(GlobalStyles.container.headerlarge,GlobalStyles.container.headerlarge,null,GlobalStyles.container.header);
 const onBackSty =pickStyle(localHeaderStyles.compactHeaderL,localHeaderStyles.compactHeaderL,null, localHeaderStyles.compactHeader);
 const compactTopRowL =pickStyle(localHeaderStyles.compactTopRowL,localHeaderStyles.compactTopRowL,null, localHeaderStyles.compactTopRow);
 const headerTopRow =pickStyle(GlobalStyles.container.headerTopRowL,GlobalStyles.container.headerTopRowL,null,GlobalStyles.container.headerTopRow);
 const headerPillLarge =pickStyle(GlobalStyles.container.headerPillL,GlobalStyles.container.headerPillL,null,GlobalStyles.container.headerPill);
 const headerTitle =pickStyle(GlobalStyles.text.headerTitleL,GlobalStyles.text.headerTitleL,null,GlobalStyles.text.headerTitle);
 
 return (
    <View style={[ globalHeader, !onBack && onBackSty]}>
      <View style={[headerTopRow, !onBack && compactTopRowL]}>
       {onBack && (
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center' }}
            onPress={onBack}
            activeOpacity={0.8}
          >
            <View style={GlobalStyles.container.headerPillBack}>
              <Text style={GlobalStyles.text.pillTextBack}>‹</Text>
            </View>

            <Text style={[GlobalStyles.text.pillText, { marginLeft: 8 }]}>
              TLS Audit
            </Text>
          </TouchableOpacity>
        )}

        {header && (
          <TouchableOpacity
            style={{ flexDirection: 'row', alignItems: 'center' }}            
            activeOpacity={0.8}
          >            
            <Text style={[GlobalStyles.text.pillText, { marginLeft: 8 ,fontFamily:'Inter-Bold'}]}>
              TLS Audit
            </Text>
          </TouchableOpacity>
        )}
 
        <TouchableOpacity
          style={headerPillLarge}
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <Text style={GlobalStyles.icon.pillIcon}>✕</Text>
          <Text style={GlobalStyles.text.pillText}>Cancel</Text>
        </TouchableOpacity>
      </View>
 
      <Text style={headerTitle}>{title}</Text>
 
      <View style={GlobalStyles.text.stepDots}>
        {Array.from({ length: totalSteps }).map((_, i) => (
          <View
            key={i}
            style={[GlobalStyles.text.dot, i + 1 === step && GlobalStyles.text.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}
// ─── AuditHeader ─────────────────────────────────────────────────────────────
export function AuditHeaderCommon({ title, step, totalSteps = 2, onCancel, onBack  }) {
  return (
    <View style={GlobalStyles.container.header}>
      <View style={GlobalStyles.container.headerTopRow}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: ms(6) }}>
          {onBack ? (
           <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center' }}
              onPress={onBack}
              activeOpacity={0.8}
          >
            <View style={GlobalStyles.container.headerPill}>
              <Text style={GlobalStyles.text.pillText}>‹  Back</Text>
            </View>
 
        </TouchableOpacity>
          ) : (
            <Text style={GlobalStyles.text.pillText}>TLS Audit</Text>
          )}
        </View>
        <TouchableOpacity
          style={GlobalStyles.container.headerPill}
          onPress={onCancel}
          activeOpacity={0.8}
        >
          <Text style={GlobalStyles.icon.pillIcon}>✕</Text>
          <Text style={GlobalStyles.text.pillText}>Cancel</Text>
        </TouchableOpacity>
      </View>

      <Text style={GlobalStyles.text.headerTitle}>{title}</Text>

      
    </View>
  );
}

// ─── CountBadge ──────────────────────────────────────────────────────────────
export function SeverityBadge({ label, count, color, bg }) {
  return (
    <View style={[GlobalStyles.container.severityBadge, { backgroundColor: bg }]}>
      <Text style={[GlobalStyles.text.severityLabel, { color: AppColors.textSecondary }]}>
        {label}
      </Text>
      <Text style={[GlobalStyles.text.severityCount, { color }]}>{count}</Text>
    </View>
  );
}
const localHeaderStyles = StyleSheet.create({
  compactHeader: {
    paddingTop: Platform.OS === 'android' ? mvs(14) : mvs(10),
  },
  compactHeaderL: {
    paddingTop: Platform.OS === 'android' ? mvs(14) : mvs(10),
  },
  compactTopRow: {
    marginBottom: mvs(6),
  },
  compactTopRowL: {
   },
});
// ─── Shared Styles ────────────────────────────────────────────────────────────


 