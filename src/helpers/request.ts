import axios from 'axios';
import {constants} from '../config/constants';
//import {store} from '@app/redux/store';

export const TIMEOUT_TIME = 100000;

const request = axios.create({
  baseURL: constants.api_url,
  timeout: TIMEOUT_TIME,
});

if (constants.env === 'dev') {
  request.interceptors.request.use(async (config: any) => {
    const fullUrl = config.baseURL ? config.baseURL + config.url : config.url;

    console.log(`Making request to: ${fullUrl}`);

    if (config.data) {
      console.log('Request payload:', JSON.stringify(config.data, null, 2));
    }

    // const state = store.getState();
    //const token = state.initLoad.userData?.token;
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjAwMDAwMDAwLTAwMDAtMDAwMC0wMDAwLTAwMDAwMDAwMDEwMCIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL25hbWUiOiJhZG1pbiIsImh0dHA6Ly9zY2hlbWFzLnhtbHNvYXAub3JnL3dzLzIwMDUvMDUvaWRlbnRpdHkvY2xhaW1zL2VtYWlsYWRkcmVzcyI6ImFkbWluQGV4YW1wbGUuY29tIiwiSXNBY3RpdmUiOiJUcnVlIiwiaHR0cDovL3NjaGVtYXMubWljcm9zb2Z0LmNvbS93cy8yMDA4LzA2L2lkZW50aXR5L2NsYWltcy9yb2xlIjoiQWRtaW4iLCJleHAiOjE3NDU2ODg4OTcsImlzcyI6InNoYXJlZmxvdyIsImF1ZCI6InNoYXJlZmxvd191c2VycyJ9.EA96Q2TgKUdKWklWZOwbP6dpkLvNPGfgEffxEEnY6NA'

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });
}

request.interceptors.request.use(async (config: any) => {
  config.headers.Accept = 'application/json';
  return config;
});

export default request;
