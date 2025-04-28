import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { jwtDecode } from 'jwt-decode';
import type { PayloadAction } from '@reduxjs/toolkit';
import request from '../../helpers/request';
import { extractUserFromToken, isTokenExpired } from '../../utils/jwtUtils';

interface User {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  roles: string[];
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  whatsapp: string;
}

interface GoogleAuthResponse {
  token: string;
  user: User;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null
};

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      // For demo purposes, accept demo credentials
      if (credentials.email === 'demo@shareflow.me' && credentials.password === 'ShareFlow2024!') {
        return {
          token: 'demo-token',
          user: {
            id: 'demo-user',
            username: 'Demo User',
            email: 'demo@shareflow.me',
            isActive: true,
            roles: ['Admin']
          }
        };
      }
      
      try {
        const { data } = await request.post('/Auth/login', {
          email: credentials.email,
          password: credentials.password
        });
        
        // Si data.user no existe, intentamos extraerlo del token JWT
        if (data.token && !data.user) {
          data.user = extractUserFromToken(data.token);
        }
        
        return data;
      } catch (apiError: any) {
        if (apiError.response && apiError.response.data) {
          return rejectWithValue(apiError.response.data.message || 'Error al iniciar sesión');
        }
        throw apiError;
      }
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (credentials: RegisterCredentials, { rejectWithValue }) => {
    try {
      try {
        const { data } = await request.post('/Auth/register', credentials);
        return data;
      } catch (apiError: any) {
        if (apiError.response && apiError.response.data) {
          return rejectWithValue(apiError.response.data.message || 'Error al registrar usuario');
        }
        throw apiError;
      }
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);

export const googleAuth = createAsyncThunk(
  'auth/google',
  async (token: string, { rejectWithValue }) => {
    try {
      try {
        const { data } = await request.post('/Auth/google', { token });
        return data;
      } catch (apiError: any) {
        if (apiError.response && apiError.response.data) {
          return rejectWithValue(apiError.response.data.message || 'Error en autenticación con Google');
        }
        throw apiError;
      }
    } catch (error) {
      return rejectWithValue('Error de conexión');
    }
  }
);

// Acción para verificar la autenticación al cargar la aplicación
export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      let tokenToCheck = auth.token;
      
      // Si no hay token en el state, buscar en localStorage
      if (!tokenToCheck) {
        tokenToCheck = localStorage.getItem('auth_token');
        console.log('checkAuth: Verificando token desde localStorage');
        
        if (!tokenToCheck) {
          return rejectWithValue('No token found');
        }
      }
      
      console.log('checkAuth: Token encontrado, verificando validez');
      
      // Verificar si el token ha expirado
      if (isTokenExpired(tokenToCheck)) {
        localStorage.removeItem('auth_token');
        return rejectWithValue('Token expired');
      }
      
      // Extraer información del usuario desde el token
      const user = extractUserFromToken(tokenToCheck);
      
      if (!user) {
        localStorage.removeItem('auth_token');
        return rejectWithValue('Invalid token format');
      }
      
      return {
        token: tokenToCheck,
        user: user
      };
    } catch (error) {
      console.error('Error al verificar la autenticación:', error);
      // Limpiar localStorage si hay error
      localStorage.removeItem('auth_token');
      return rejectWithValue('Authentication check failed');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('auth_token');
    },
    clearError: (state) => {
      state.error = null;
    },
    refreshToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      try {
        const decoded = jwtDecode<User>(action.payload);
        state.user = decoded;
      } catch (error) {
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
      }
    }
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state, action) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      try {
        const decoded = jwtDecode<User>(action.payload.token);
        state.user = decoded;
      } catch (error) {
        state.error = 'Token inválido';
      }
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Google Auth
    builder.addCase(googleAuth.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(googleAuth.fulfilled, (state, action) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
    });
    builder.addCase(googleAuth.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Check Auth
    builder.addCase(checkAuth.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(checkAuth.fulfilled, (state, action) => {
      state.isLoading = false;
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      if (action.payload.token) {
        state.token = action.payload.token;
      }
      state.isAuthenticated = true;
    });
    builder.addCase(checkAuth.rejected, (state, action) => {
      state.isLoading = false;
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = action.payload as string;
    });
  }
});

export const { logout, clearError, refreshToken } = authSlice.actions;
export default authSlice.reducer;