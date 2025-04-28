import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  exp?: number;
  sub?: string;       // Identificador estándar
  name?: string;      // Nombre estándar
  email?: string;     // Email estándar
  [key: string]: any;
}

interface User {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
  roles: string[];
}

/**
 * Decodifica un token JWT y extrae la información del usuario
 * @param token El token JWT a decodificar
 * @returns Un objeto con la información del usuario
 */
export const extractUserFromToken = (token: string): User | null => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    // Intentar encontrar los campos de usuario en diferentes formatos de token
    // Microsoft Identity Claims
    const claimUserID = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    const claimUsername = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
    const claimEmail = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];
    const claimRoles = decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    
    // Propiedades estándar JWT
    const standardId = decoded.sub;
    const standardName = decoded.name;
    const standardEmail = decoded.email;
    
    // Propiedades personalizadas
    const customId = decoded.id || decoded.userId || decoded.user_id;
    const customUsername = decoded.username || decoded.userName || decoded.user_name;
    const customEmail = decoded.email || decoded.mail;
    const customRoles = decoded.roles || decoded.role || decoded.permissions || decoded.claims;
    const customActive = decoded.isActive || decoded.active || decoded.enabled || decoded.IsActive;
    
    // Construir el objeto de usuario con la información disponible
    const userId = claimUserID || standardId || customId || '';
    const username = claimUsername || standardName || customUsername || '';
    const email = claimEmail || standardEmail || customEmail || '';
    
    // Determinar si el usuario está activo
    let isActive = true;  // Asumir activo por defecto
    if (typeof customActive === 'boolean') {
      isActive = customActive;
    } else if (typeof customActive === 'string') {
      isActive = customActive === 'True' || customActive === 'true' || customActive === '1';
    }
    
    // Determinar los roles
    let roles: string[] = [];
    if (claimRoles) {
      roles = Array.isArray(claimRoles) ? claimRoles : [claimRoles];
    } else if (customRoles) {
      roles = Array.isArray(customRoles) ? customRoles : [customRoles];
    }
    
    // Asegurar que tenemos algo en los campos obligatorios
    if (!userId || !username) {
      console.warn('No se pudieron extraer los campos obligatorios del token', { userId, username });
    }
    
    const user = {
      id: userId,
      username,
      email,
      isActive,
      roles
    };
    return user;
  } catch (error) {
    console.error('Error decodificando el token:', error);
    return null;
  }
};

/**
 * Verifica si un token JWT ha expirado
 * @param token El token JWT a verificar
 * @returns true si el token ha expirado, false en caso contrario
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<DecodedToken>(token);
    const currentTime = Date.now() / 1000;
    
    // Si no hay campo exp, asumir que no expira
    if (decoded.exp === undefined) {
      return false;
    }
    
    const isExpired = decoded.exp < currentTime;
    if (isExpired) {
      console.warn(`Token expirado. Expiración: ${new Date(decoded.exp * 1000).toISOString()}, Ahora: ${new Date(currentTime * 1000).toISOString()}`);
    }
    
    return isExpired;
  } catch (error) {
    console.error('Error verificando expiración del token:', error);
    return true; // Si hay un error, asumimos que el token es inválido
  }
}; 