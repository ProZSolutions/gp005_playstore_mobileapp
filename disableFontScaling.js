import React from 'react';
import { Text, TextInput } from 'react-native';
 
const originalCreateElement = React.createElement;
 
React.createElement = function (type, props, ...children) {
  if (type === Text || type === TextInput) {
    if (!props || props.allowFontScaling === undefined) {
      props = { ...(props || {}), allowFontScaling: false };
    }
  }
  return originalCreateElement.apply(React, [type, props, ...children]);
};
