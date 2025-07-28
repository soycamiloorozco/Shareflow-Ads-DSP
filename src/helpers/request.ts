import axios from 'axios';
import {constants} from '../config/constants';

export const TIMEOUT_TIME = 100000;
const TOKEN_STORAGE_KEY = 'auth_token';

// Recuperar el token desde localStorage al iniciar
let authToken: string | null = localStorage.getItem(TOKEN_STORAGE_KEY);
if (authToken) {
  console.log('Iniciando aplicación: Token recuperado del localStorage');
}

// Función para establecer el token desde el exterior
export const setAuthToken = (token: string | null) => {
  console.log('setAuthToken:', token ? 'Token recibido' : 'Limpiando token');
  authToken = token;
  
  // También almacenar/eliminar en localStorage para persistencia entre recargas
  if (token) {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    console.log('Token guardado en localStorage');
  } else {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    console.log('Token eliminado de localStorage');
  }
};

const request = axios.create({
  baseURL: constants.api_url,
  timeout: TIMEOUT_TIME,
});

// Interceptor para agregar el token a todas las peticiones
request.interceptors.request.use(async (config: any) => {
  const fullUrl = config.baseURL ? config.baseURL + config.url : config.url;

  if (constants.env === 'dev') {
    console.log(`Making request to: ${fullUrl}`);

    if (config.data) {
      console.log('Request payload:', JSON.stringify(config.data, null, 2));
    }
  }
  
  // Si no hay token en memoria, intentar recuperarlo de localStorage
  if (!authToken) {
    authToken = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (authToken) {
      console.log('Request: Recuperando token desde localStorage');
    }
  }
    
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
    console.log('Request: Usando token para autenticación:', authToken.substring(0, 15) + '...');
  } else {
    console.log('Request: No hay token disponible');
  }

  config.headers.Accept = 'application/json';
  return config;
});

// Interceptor para manejar respuestas
request.interceptors.response.use(
  (response) => {
    if (constants.env === 'dev') {
      //console.log('Response status:', response.status);
      //console.log('Response data:', response.data);
    }
    return response;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

export default request;
