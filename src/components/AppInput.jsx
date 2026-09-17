// src/components/AppInput.jsx
import React, { useState, forwardRef } from 'react';
import {
  StyleSheet, View, TextInput as RNInput,
  TouchableOpacity, Platform, Text,
} from 'react-native';
import { AppColors } from '../theme/theme';
import { useResponsive } from '../utils/responsive';
import { useOrientation } from '../hooks/useOrientation';

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
  const { isLandscape } = useOrientation();

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

  // Tablet-portrait sizing (unchanged) — only applied when NOT landscape,
  // so a tablet rotated sideways doesn't get these tall portrait values.
  const applyLarge = isLargeScreen && !isLandscape;

  const dynamicBoxStyle = applyLarge
    ? {
        borderRadius:      moderateScale(12),
        paddingHorizontal: moderateScale(18),
        minHeight:         moderateScale(50),
      }
    : isLandscape
    ? styles.boxLandscape
    : null;

  const dynamicInputStyle = applyLarge
    ? {
        fontSize:        fontScale(16),
        paddingVertical: Platform.OS === 'ios' ? moderateScale(15) : moderateScale(13),
      }
    : isLandscape
    ? styles.inputLandscape
    : null;

  const dynamicLabelStyle = applyLarge
    ? { fontSize: fontScale(14), marginBottom: moderateScale(8) }
    : isLandscape
    ? styles.labelLandscape
    : null;

  const dynamicWrapperStyle = applyLarge
    ? { marginBottom: moderateScale(20) }
    : isLandscape
    ? styles.wrapperLandscape
    : null;

  const dynamicSideIconStyle = applyLarge
    ? { marginHorizontal: moderateScale(6) }
    : null;

  const dynamicShowHideStyle = applyLarge
    ? { fontSize: fontScale(14.5) }
    : isLandscape
    ? styles.showHideLandscape
    : null;

  const dynamicHelperTextStyle = applyLarge
    ? { fontSize: fontScale(15) }
    : isLandscape
    ? styles.helperTextLandscape
    : null;

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
              minHeight:        numberOfLines * (applyLarge ? moderateScale(26) : isLandscape ? 18 : 22),
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

  // ── Landscape-only overrides ─────────────────────────────────────────
  // Kept separate from the base styles above so portrait is byte-for-byte
  // unchanged — these are only merged in when isLandscape is true, for
  // BOTH phones and tablets, to keep each field's vertical footprint
  // small in a short viewport.
  wrapperLandscape: {
    marginBottom: 8,
  },
  boxLandscape: {
    minHeight: 34,
    paddingHorizontal: 12,
  },
  inputLandscape: {
    fontSize: 13,
    paddingVertical: Platform.OS === 'ios' ? 7 : 5,
  },
  labelLandscape: {
    fontSize: 12,
    marginBottom: 3,
  },
  showHideLandscape: {
    fontSize: 11.5,
  },
  helperTextLandscape: {
    fontSize: 12,
  },
});