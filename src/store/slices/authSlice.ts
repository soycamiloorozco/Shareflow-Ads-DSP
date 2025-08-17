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


interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  phone: string;
}

interface ForgotPasswordCredentials {
  email: string;
}

interface ResetPasswordCredentials {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

interface ChangePasswordCredentials {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface UpdateProfileData {
  fullName?: string;
  username?: string;
  email?: string;
  phone?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  website?: string;
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
        console.log('Using demo credentials, returning demo user');
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
      
      console.log('Making API request to:', '/Auth/login');
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
      console.error('Login API error:', apiError);
      
      if (apiError.response && apiError.response.data) {
        return rejectWithValue(apiError.response.data.message || 'Error al iniciar sesión');
      }
      
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

export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (credentials: ForgotPasswordCredentials, { rejectWithValue }) => {
    try {
      const { data } = await request.post('/auth/forgot-password', {
        email: credentials.email
      });
      return data;
    } catch (apiError: any) {
      console.error('Forgot password API error:', apiError);
      
      if (apiError.response && apiError.response.data) {
        return rejectWithValue(apiError.response.data.message || 'Error al enviar correo de recuperación');
      }
      
      return rejectWithValue('Error de conexión');
    }
  }
);

export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (credentials: ResetPasswordCredentials, { rejectWithValue }) => {
    try {
      const { data } = await request.post('/auth/reset-password', {
        token: credentials.token,
        newPassword: credentials.newPassword,
        confirmPassword: credentials.confirmPassword
      });
      return data;
    } catch (apiError: any) {
      console.error('Reset password API error:', apiError);
      
      if (apiError.response && apiError.response.data) {
        return rejectWithValue(apiError.response.data.message || 'Error al restablecer contraseña');
      }
      
      return rejectWithValue('Error de conexión');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: UpdateProfileData, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      
      if (!auth.token || !auth.user) {
        return rejectWithValue('No authenticated user found');
      }

      // For demo purposes, simulate API call
      if (auth.user.email === 'demo@shareflow.me') {
        console.log('Demo mode: Updating profile with data:', profileData);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return {
          ...auth.user,
          ...profileData,
          // Ensure we keep required fields
          id: auth.user.id,
          email: profileData.email || auth.user.email,
          username: profileData.username || auth.user.username,
          isActive: auth.user.isActive,
          roles: auth.user.roles
        };
      }

      // Real API call
      console.log('Making API request to update profile:', profileData);
      const { data } = await request.put('/Auth/profile', profileData);
      
      return data.user;
    } catch (apiError: any) {
      console.error('Update profile API error:', apiError);
      
      if (apiError.response && apiError.response.data) {
        return rejectWithValue(apiError.response.data.message || 'Error al actualizar perfil');
      }
      
      return rejectWithValue('Error de conexión');
    }
  }
);

export const updatePassword = createAsyncThunk(
  'auth/updatePassword',
  async (passwordData: ChangePasswordCredentials, { getState, rejectWithValue }) => {
    try {
      const { auth } = getState() as { auth: AuthState };
      
      if (!auth.token || !auth.user) {
        return rejectWithValue('No authenticated user found');
      }

      // For demo purposes, simulate API call
      if (auth.user.email === 'demo@shareflow.me') {
        console.log('Demo mode: Updating password');
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
      }

      // Real API call
      console.log('Making API request to update password');
      await request.put('/Auth/password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      return { success: true };
    } catch (apiError: any) {
      console.error('Update password API error:', apiError);
      
      if (apiError.response && apiError.response.data) {
        return rejectWithValue(apiError.response.data.message || 'Error al cambiar contraseña');
      }
      
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
    },
    updateUserInfo: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
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

    // Forgot Password
    builder.addCase(forgotPassword.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(forgotPassword.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(forgotPassword.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Reset Password
    builder.addCase(resetPassword.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(resetPassword.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update Profile
    builder.addCase(updateProfile.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateProfile.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload;
      state.error = null;
    });
    builder.addCase(updateProfile.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Update Password
    builder.addCase(updatePassword.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updatePassword.fulfilled, (state) => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(updatePassword.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  }
});

export const { logout, clearError, refreshToken, updateUserInfo } = authSlice.actions;
export default authSlice.reducer;