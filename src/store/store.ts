import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import { setAuthToken } from '../helpers/request';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth']
};

const persistedAuthReducer = persistReducer(persistConfig, authReducer);

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
});

// Escuchar cambios en el estado y actualizar el token
store.subscribe(() => {
  const state = store.getState();
  const token = state.auth?.token;
  if (token) {
    setAuthToken(token);
  }
});

export const persistor = persistStore(store, {}, () => {
  // Este callback se ejecuta cuando la persistencia ha terminado
  const state = store.getState();
  if (state.auth?.token) {
    setAuthToken(state.auth.token);
    console.log('Persistencia completada: Token restaurado');
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;