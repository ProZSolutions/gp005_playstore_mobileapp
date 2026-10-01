import axios from 'axios';
import { getToken, clearAuthData } from '../api/storage/authStorage';
import { ENCRYPTED } from '../config/encryptionConfig';
const BASE_URL = 'https://tlsts.proz.in/api'; 
//const BASE_URL = 'https://tlsqcbk.proz.in/api'; 
//const BASE_URL ='https://qoneapi.proz.in/api';
const TIMEOUT  = 15000;

const apiClient = axios.create({  
  baseURL: BASE_URL,
  timeout: TIMEOUT,
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();

    const setHeader = (key, value) => {
      if (config.headers?.set) config.headers.set(key, value);
      else config.headers[key] = value;
    };

    setHeader('Content-Type', 'application/json');
    setHeader('x-encrypted', ENCRYPTED ? 'true' : 'false');
    if (token) setHeader('Authorization', `Bearer ${token}`);

    return config;
  },
  (error) => Promise.reject(error),
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) { 
      await clearAuthData();
    }
    return Promise.reject(error);
  },
);

export default apiClient;