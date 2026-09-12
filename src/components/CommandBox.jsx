    // src/components/AppInput.jsx
    import React, { useState } from 'react';
    import {
    StyleSheet, View, TextInput as RNInput,
    TouchableOpacity, Platform, Text,
    } from 'react-native';
    import { AppColors } from '../theme/theme';
    
    export function AppInput({
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
    ...rest
    }) {
    const [focused,    setFocused]    = useState(false);
    const [pwVisible,  setPwVisible]  = useState(false);

    const borderColor =  
        AppColors.textInverse
        ;

    const labelColor =  
        AppColors.textPrimary ;

    return (
        <View style={[styles.wrapper, containerStyle]}>
        {/* Label above the box — matches screenshot exactly */}
        {label ? (
            <Text style={[styles.label, { color: labelColor }]}>{label}</Text>
        ) : null}

        <View
            style={[
            styles.box,
            {
                borderColor,
                backgroundColor: borderColor,
            },
            ]}
        >
            {left ? <View style={styles.sideIcon}>{left}</View> : null}

            <RNInput
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
            style={[
                styles.input,
                multiline && {
                minHeight:        numberOfLines * 22,
                textAlignVertical:'top',
                paddingTop:       Platform.OS === 'ios' ? 14 : 10,
                },
                style,
            ]}
            {...rest}
            />

            {/* Right slot: show/hide toggle OR custom right node */}
            {secureTextEntry && !right ? (
            <TouchableOpacity
                onPress={() => setPwVisible(v => !v)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.sideIcon}
            >
                <Text style={styles.showHide}>
                {pwVisible ? 'HIDE' : 'SHOW'}
                </Text>
            </TouchableOpacity>
            ) : right ? (
            <View style={styles.sideIcon}>{right}</View>
            ) : null}
        </View>

        <View style={styles.helperRow}>
            {error ? (
            <Text style={styles.errorText}>{error}</Text>
            ) : hint ? (
            <Text style={styles.hintText}>{hint}</Text>
            ) : (
            <View />
            )}
            {showCharCount && maxLength != null ? (
            <Text style={styles.counter}>
                {(value ?? '').length}/{maxLength}
            </Text>
            ) : null}
        </View>
        </View>
    );
    }

    const styles = StyleSheet.create({
    wrapper: {
        marginBottom: 14,
    },
    label: {
        fontSize:      15,
        fontWeight:    '500',
        letterSpacing: 0.2,
        marginBottom:  6,
        marginLeft:    16,
        marginTop:10
    },
    box: {
        flexDirection: 'row',
        alignItems:    'center',
        borderRadius:  10,
        paddingHorizontal: 14,
        minHeight:     40,
        
    },
    input: {
        flex:          1,
        fontSize:      15,
        fontWeight:    '400',
        color:         '#1A1D23',
        letterSpacing: 0.1,
        paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    },
    sideIcon:  { marginHorizontal: 4 },
    showHide: {
        fontSize:      11,
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
    errorText: { fontSize: 12, color: '#DC2626', flex: 1 },
    hintText:  { fontSize: 12, color: '#9CA3AF', flex: 1 },
    counter:   { fontSize: 11, color: '#9CA3AF',marginBottom:5,marginRight:5 },
    });
