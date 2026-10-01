import React, { createContext, useContext, useRef } from 'react';
import GlobalAlert from '../components/GlobalAlert';
import { setAlertRef } from '../utils/AlertService'; // 👈 import this

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
  const alertRef = useRef();

  const showAlert = (type, title, message) => {
    alertRef.current?.show(type, title, message);
  };

  return (
    <AlertContext.Provider value={showAlert}>
      {children}
      <GlobalAlert
        ref={(r) => {
          alertRef.current = r;
          setAlertRef(r);          
        }}
      />
    </AlertContext.Provider>
  );
}

export const useAlert = () => useContext(AlertContext);