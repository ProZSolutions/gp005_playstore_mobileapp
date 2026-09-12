// src/components/AppInput.jsx
import React, { useState, forwardRef } from 'react';
import {
  StyleSheet, View, TextInput as RNInput,
  TouchableOpacity, Platform, Text,
} from 'react-native';
import { AppColors } from '../theme/theme'; 
import { useResponsive } from '../utils/responsive';

export const AppInput = forwardRef(function AppInput(
  {
    label,
    value,
    onChangeText,
    placeholder,
    secureTextEntry = false,
    keyboardType    = 'default',
    returnKeyType,
    error,
    hint,
    disabled   = false,
    multiline  = false,
    numberOfLines = 1,
    maxLength,
    showCharCount = false,
    left,
    right,
    containerStyle,
    style,
    onSubmitEditing,
    nextInputRef,
    onTabPress,
    ...rest
  },
  ref,
) {
  const [focused,    setFocused]    = useState(false);
  const [pwVisible,  setPwVisible]  = useState(false);
 
  const { isLargeScreen, moderateScale, fontScale } = useResponsive();

  const borderColor = error
    ? AppColors.error
    : focused
    ? AppColors.primary
    : AppColors.border;

  const labelColor = error
    ? AppColors.error
    : focused
    ? AppColors.primary
    : AppColors.textSecondary;

  const handleKeyPress = (e) => {
    if (e.nativeEvent.key === 'Tab') {
      if (onTabPress) {
        onTabPress(e);
      } else if (nextInputRef?.current) {
        nextInputRef.current.focus();
      }
    }
    rest.onKeyPress?.(e);
  };

  const handleSubmitEditing = (e) => {
    if (nextInputRef?.current) {
      nextInputRef.current.focus();
    }
    onSubmitEditing?.(e);
  };
 
  const dynamicBoxStyle = isLargeScreen
    ? {
        borderRadius:      moderateScale(12),
        paddingHorizontal: moderateScale(18),
        minHeight:         moderateScale(50),
      }
    : null;

  const dynamicInputStyle = isLargeScreen
    ? {
        fontSize:        fontScale(16),
        paddingVertical: Platform.OS === 'ios' ? moderateScale(15) : moderateScale(13),
      }
    : null;

  const dynamicLabelStyle = isLargeScreen
    ? { fontSize: fontScale(14), marginBottom: moderateScale(8) }
    : null;

  const dynamicWrapperStyle = isLargeScreen ? { marginBottom: moderateScale(20) } : null;
  const dynamicSideIconStyle = isLargeScreen ? { marginHorizontal: moderateScale(6) } : null;
  const dynamicShowHideStyle = isLargeScreen ? { fontSize: fontScale(14.5) } : null;
  const dynamicHelperTextStyle = isLargeScreen ? { fontSize: fontScale(15) } : null;

  return (
    <View style={[styles.wrapper, dynamicWrapperStyle, containerStyle]}>
      {label ? (
        <Text style={[styles.label, dynamicLabelStyle, { color: labelColor }]}>
          {label}
        </Text>
      ) : null}

      <View
        style={[
          styles.box,
          dynamicBoxStyle,
          {
            borderColor,
            backgroundColor: disabled ? AppColors.neutral100 : AppColors.surface,
          },
        ]}
      >
        {left ? <View style={[styles.sideIcon, dynamicSideIconStyle]}>{left}</View> : null}

        <RNInput
          ref={ref}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={AppColors.neutral400}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          secureTextEntry={secureTextEntry && !pwVisible}
          editable={!disabled}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : 1}
          maxLength={maxLength}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyPress={handleKeyPress}
          onSubmitEditing={handleSubmitEditing}
          blurOnSubmit={!nextInputRef}
          style={[
            styles.input,
            dynamicInputStyle,
            multiline && {
              minHeight:        numberOfLines * (isLargeScreen ? moderateScale(26) : 22),
              textAlignVertical:'top',
              paddingTop:       Platform.OS === 'ios' ? 14 : 10,
            },
            style,
          ]}
          {...rest}
        />

        {secureTextEntry && !right ? (
          <TouchableOpacity
            onPress={() => setPwVisible(v => !v)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[styles.sideIcon, dynamicSideIconStyle]}
          >
            <Text style={[styles.showHide, dynamicShowHideStyle]}>
              {pwVisible ? 'HIDE' : 'SHOW'}
            </Text>
          </TouchableOpacity>
        ) : right ? (
          <View style={[styles.sideIcon, dynamicSideIconStyle]}>{right}</View>
        ) : null}
      </View>

      <View style={styles.helperRow}>
        {error ? (
          <Text style={[styles.errorText, dynamicHelperTextStyle]}>{error}</Text>
        ) : hint ? (
          <Text style={[styles.hintText, dynamicHelperTextStyle]}>{hint}</Text>
        ) : (
          <View />
        )}
        {showCharCount && maxLength != null ? (
          <Text style={[styles.counter, dynamicHelperTextStyle]}>
            {(value ?? '').length}/{maxLength}
          </Text>
        ) : null}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize:      14,
     letterSpacing: 0.2,
    marginBottom:  6,
    marginLeft:    2,
    fontFamily: 'Inter-ExtraBold'
  },
  box: {
    flexDirection: 'row',
    alignItems:    'center',
    borderWidth:   1.5,
    borderRadius:  10,
    paddingHorizontal: 14,
    minHeight:     40,
    ...Platform.select({
      ios: {
        shadowColor:   '#000',
        shadowOffset:  { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius:  4,
      },
      android: { elevation: 1 },
    }),
  },
  input: {
    flex:          1,
    fontSize:      14,
    fontWeight:    '400',
    color:         '#1A1D23',
    letterSpacing: 0.1,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
  },
  sideIcon:  { marginHorizontal: 4 },
  showHide: {
    fontSize:      13,
    fontWeight:    '600',
    color:         '#1A9E96',
    letterSpacing: 0.6,
  },
  helperRow: {
    flexDirection:  'row',
    justifyContent: 'space-between',
    marginTop:      4,
    paddingHorizontal: 2,
  },
  errorText: { fontSize: 14, color: '#DC2626', flex: 1 },
  hintText:  { fontSize: 14, color: '#9CA3AF', flex: 1 },
  counter:   { fontSize: 14, color: '#9CA3AF' },
});