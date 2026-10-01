import React from 'react';
import { Text, TextInput } from 'react-native';

const weightToFont = {
  '100': 'Inter-Thin',
  '200': 'Inter-ExtraLight',
  '300': 'Inter-Light',
  '400': 'Inter-Regular',
  normal: 'Inter-Regular',
  '500': 'Inter-Medium',
  '600': 'Inter-SemiBold',
  '700': 'Inter-Bold',
  bold: 'Inter-Bold',
  '800': 'Inter-ExtraBold',
  '900': 'Inter-Black',
};

function flattenStyle(style) {
  if (Array.isArray(style)) {
    return Object.assign({}, ...style.map(flattenStyle));
  }
  return style || {};
}

function resolveFontFamily(style) {
  const flat = flattenStyle(style);
  if (flat.fontFamily) return flat.fontFamily; // respect explicit fontFamily if already set
  const weight = flat.fontWeight ?? '400';
  return weightToFont[weight] || 'Inter-Regular';
}

export function applyGlobalFont() {
  const patch = (Component) => {
    const original = Component.render;
    Component.render = function (...args) {
      const origin = original.call(this, ...args);
      const fontFamily = resolveFontFamily(origin.props.style);
      return React.cloneElement(origin, {
        style: [{ fontFamily }, origin.props.style],
      });
    };
  };

  patch(Text);
  patch(TextInput);
}