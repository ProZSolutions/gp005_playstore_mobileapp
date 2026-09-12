import React from 'react';
import { icons } from '../assets/icons';

export default function Icon({ name, size = 24, color, ...props }) {
  const SvgIcon = icons[name];

  if (!SvgIcon) return null;

  return (
    <SvgIcon
      width={size}
      height={size}
      {...(color ? { fill: color } : {})}
      {...props}
    />
  );
}