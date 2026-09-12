import CryptoJS from 'crypto-js';

const SECRET_KEY = 'tls_alpha_secret_key_2026!!!!!!';  

export const encrypt = (data) => {
  return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
};

export const decrypt = (cipherText) => {
  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);
  if (!decrypted) {
    throw new Error('Decryption failed — invalid ciphertext or wrong key');
  }
  return JSON.parse(decrypted);
};