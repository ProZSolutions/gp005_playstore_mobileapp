import React, { forwardRef, useImperativeHandle, useState } from 'react';
import CustomAlert from './CustomAlert';
import { AppColors } from '../theme/theme';

const GlobalAlert = forwardRef((props, ref) => {
  const [alert, setAlert] = useState({
    visible: false,
    type: 'success',
    title: '',
    message: '',
    icon: undefined,
    buttons: undefined,
    primaryColor: AppColors.primary,
  });

  useImperativeHandle(ref, () => ({
    // existing simple call: show('error', 'Title', 'Message')
    // extended call:        show('confirm', 'Title', 'Message', { icon: 'logout', buttons: [...] })
    show: (type, title, message, options = {}) => {
      setAlert({
        visible: true,
        type,
        title,
        message,
        icon: options.icon,
        buttons: options.buttons,
        // Falls back to AppColors.primary unless a specific call passes
        // its own primaryColor in options.
        primaryColor: options.primaryColor ?? AppColors.primary,
      });
    },
  }));

  return (
    <CustomAlert
      {...alert}
      onClose={() => setAlert((prev) => ({ ...prev, visible: false }))}
    />
  );
});

export default GlobalAlert;