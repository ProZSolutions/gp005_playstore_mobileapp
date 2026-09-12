let alertRef;

export const setAlertRef = (ref) => {
  alertRef = ref;
};

export const showAlert = (type, title, message, options) => {
  alertRef?.show(type, title, message, options);
};