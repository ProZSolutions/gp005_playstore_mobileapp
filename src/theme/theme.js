import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';

 export const AppColors = {
  // Brand
  primary:               '#0D939D',
  primaryDark:           '#0c848d',
  primaryDarkLTh:           '#034e53',
  primaryLight:          '#E8F8F7',
  primaryContainer:      '#CCF0EE',
  onPrimary:             '#FFFFFF',
  onPrimaryContainer:    '#003D3A',
  onProfBg:'#138A96',
  onProfOuter:'#0F6F78',
  shadowClr:'#000',
    step:    '#1b7975',
    lineHighligher:'rgba(0, 0, 0, 0.50)',

  lightBlue:              '#86c9ce',
  secondaryBlue:          '#65FBF6',
  cardBlue :              '#CEFFFC',
  initial:                '#CEFFFC',
  transparentBG:          '#86c9ce',
  defectBG:'#E6F6F5',
  // Surfaces
  background:            '#F5F6FA',
  surface:               '#FFFFFF',
  surfaceVariant:        '#F0F2F5',
  onBackground:          '#1A1D23',
  onSurface:             '#1A1D23',
  onSurfaceVariant:      '#6B7280',
  onSurfaceDisabled:     '#9CA3AF',

  // Secondary / neutral
  secondary:             '#2D3748',
  secondaryContainer:    '#EDF2F7',
  onSecondary:           '#FFFFFF',

  // Semantic
  aqlclrLight:          '#05966914',
  qcclrLight:           '#0284C714',
  aqlcclr:              '#966914',
  qcclr:                '#84C714',
  error:                '#D32F2F',
  errorLight :          '#D32F2F',
  erNewLight:           '#D32F2F',
  err:                  '#f76a6a',
  rejectLight:          '#f44646',
  errrLight:              '#f5eaea',
  errorContainer:        '#eed6d6',
  onError:               '#FFFFFF',
  onErrorContainer:      '#D32F2F',
  success:               '#16A34A',
  Blue:                  '#46037d',
  successLight:          '#00A63E1A',
  BlueLight:                   '#46037D0D',

  warning:               '#F59E0B',
  warningLight:          '#F59E0B1A',
  purpleLight:            '#0284C714' ,
  orgLight:             '#F59E0B14',
  info:                  '#2563EB',
  infoLight:             '#E7000B1A',

  // Line-status badge colours (screenshot)
  lineGreen:             '#16A34A',
  lineBlue:              '#2563EB',
  lineRed:               '#D32F2F',
  lineBlack:             '#1A1D23',
  lineOrange:            '#F59E0B',
  linePurple:            '#7C3AED',
  lineErr:                '#D32F2F',
  lineRej:                '#84C714',

  // Borders / dividers
  border:                '#E5E7EB',
  borderFocus:           '#1A9E96',
  divider:               '#F0F2F5',
  outline:               '#D1D5DB',

  // Text
  textPrimary:           '#1A1D23',
  textSecondary:         '#656666',
  textTertiary:          '#9CA3AF',
  textInverse:           '#FFFFFF',
  labrlcolo :             '#979999',

  // Neutral scale
  neutral100:            '#F3F4F6',
  neutral200:            '#E5E7EB',
  neutral300:            '#D1D5DB',
  neutral400:            '#9CA3AF',
  neutral500:            '#6B7280',
  neutral600:            '#4B5563',
  neutral700:            '#374151',
  neutral800:            '#1F2937',
  neutral900:            '#111827',

  white:                 '#FFFFFF',
  black:                 '#000000',
  transparent:           'transparent',
  scrim:                 'rgba(0,0,0,0.45)',
  chipDefectBg:     '#f8ebc3',
  chipDefectBorder: '#F59E0B',
  chipDefectText:   '#F59E0B',

  chipCapBg:        '#fae29d',
  chipCapBorder:    '#F59E0B',
  chipCapText:      '#F59E0B',

  warningBg: '#F4C430',      // pale yellow fill
  warningBorder: '#F4C430',  // amber border
  warningIcon: '#F59E0B',    // amber-brown icon
  warningText: '#F59E0B',    // amber-brown text
};

// ─── Light Theme (Paper MD3) ────────────────────────────────────────────────
export const lightTheme = {
  ...MD3LightTheme,
  roundness: 3,           // 3 × 4 = 12 px — matches rounded inputs in screenshot
  colors: {
    ...MD3LightTheme.colors,
    primary:               AppColors.primary,
    primaryContainer:      AppColors.primaryContainer,
    onPrimary:             AppColors.onPrimary,
    onPrimaryContainer:    AppColors.onPrimaryContainer,
    secondary:             AppColors.secondary,
    secondaryContainer:    AppColors.secondaryContainer,
    onSecondary:           AppColors.onSecondary,
    onSecondaryContainer:  AppColors.onSecondaryContainer,
    error:                 AppColors.error,
    errorContainer:        AppColors.errorContainer,
    onError:               AppColors.onError,
    onErrorContainer:      AppColors.onErrorContainer,
    background:            AppColors.background,
    surface:               AppColors.surface,
    surfaceVariant:        AppColors.surfaceVariant,
    onBackground:          AppColors.onBackground,
    onSurface:             AppColors.onSurface,
    onSurfaceVariant:      AppColors.onSurfaceVariant,
    outline:               AppColors.outline,
    outlineVariant:        AppColors.border,
  },
};

// ─── Dark Theme ─────────────────────────────────────────────────────────────
export const darkTheme = {
  ...MD3DarkTheme,
  roundness: 3,
  colors: {
    ...MD3DarkTheme.colors,
    primary:               '#26C6BC',
    primaryContainer:      '#0D4F4C',
    onPrimary:             '#FFFFFF',
    onPrimaryContainer:    '#A7F3F0',
    secondary:             '#94A3B8',
    error:                 '#D32F2F',
    errorContainer:        '#D32F2F',
    onError:               '#FFFFFF',
    background:            '#0F1117',
    surface:               '#1A1D23',
    surfaceVariant:        '#242830',
    onBackground:          '#F9FAFB',
    onSurface:             '#F9FAFB',
    outline:               '#374151',
    outlineVariant:        '#2D3748',
  },
};