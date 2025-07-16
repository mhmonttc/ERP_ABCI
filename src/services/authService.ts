import { RutValidator } from '../utils/rutValidator';
import { JWTUtils } from '../utils/jwt';
import {
    findColaboradorByRut,
    findColaboradorById,
    validatePassword,
    updateLoginAttempts,
    saveRefreshToken,
    validateRefreshToken,
    revokeRefreshToken,
    revokeAllRefreshTokens,
    cleanExpiredTokens
} from '../repositories/authRepository';
import { LoginCredentials, LoginResponse } from '../types/auth';

export async function authenticateUser(credentials: LoginCredentials): Promise<LoginResponse> {
    const { rut, password } = credentials;
    
    // Validar formato de RUT
    if (!RutValidator.isValidRut(rut)) {
        return {
            success: false,
            message: 'Formato de RUT inválido'
        };
    }
    
    // Limpiar RUT para búsqueda
    const cleanRut = RutValidator.cleanRut(rut);
    
    // Buscar colaborador
    const colaborador = await findColaboradorByRut(cleanRut);
    if (!colaborador) {
        return {
            success: false,
            message: 'Credenciales inválidas'
        };
    }
    
    // Verificar si está activo
    if (!colaborador.activo) {
        return {
            success: false,
            message: 'Cuenta desactivada'
        };
    }
    
    // Verificar si está bloqueado
    if (colaborador.bloqueadoHasta && new Date() < colaborador.bloqueadoHasta) {
        return {
            success: false,
            message: 'Cuenta bloqueada temporalmente'
        };
    }
    
    // Validar contraseña
    const isValidPassword = await validatePassword(password, colaborador.password);
    
    if (!isValidPassword) {
        await updateLoginAttempts(colaborador.id, false);
        return {
            success: false,
            message: 'Credenciales inválidas'
        };
    }
    
    // Actualizar último login
    await updateLoginAttempts(colaborador.id, true);
    
    // Generar tokens
    const tokenPayload = {
        sub: colaborador.id.toString(),
        rut: colaborador.rut,
        nombreCompleto: colaborador.nombreCompleto,
        email: colaborador.email,
        sucursalId: colaborador.sucursalId,
        permisos: colaborador.permisos || {}
    };
    
    const token = JWTUtils.generateToken(tokenPayload);
    const refreshToken = JWTUtils.generateRefreshToken(colaborador.id.toString());
    
    // Guardar refresh token
    await saveRefreshToken(refreshToken, colaborador.id);
    
    return {
        success: true,
        token,
        refreshToken,
        user: {
            id: colaborador.id,
            rut: colaborador.rut,
            nombreCompleto: colaborador.nombreCompleto,
            email: colaborador.email,
            sucursalId: colaborador.sucursalId,
            permisos: colaborador.permisos || {}
        }
    };
}

export async function refreshAuthToken(refreshToken: string): Promise<LoginResponse> {
    // Validar refresh token
    const decoded = JWTUtils.verifyRefreshToken(refreshToken);
    if (!decoded) {
        return {
            success: false,
            message: 'Refresh token inválido'
        };
    }
    
    // Verificar en base de datos
    const colaboradorId = await validateRefreshToken(refreshToken);
    if (!colaboradorId) {
        return {
            success: false,
            message: 'Refresh token revocado o expirado'
        };
    }
    
    // Obtener datos del colaborador
    const colaborador = await findColaboradorById(colaboradorId);
    if (!colaborador || !colaborador.activo) {
        return {
            success: false,
            message: 'Usuario no encontrado o desactivado'
        };
    }
    
    // Generar nuevos tokens
    const tokenPayload = {
        sub: colaborador.id.toString(),
        rut: colaborador.rut,
        nombreCompleto: colaborador.nombreCompleto,
        email: colaborador.email,
        sucursalId: colaborador.sucursalId,
        permisos: colaborador.permisos || {}
    };
    
    const newToken = JWTUtils.generateToken(tokenPayload);
    const newRefreshToken = JWTUtils.generateRefreshToken(colaborador.id.toString());
    
    // Revocar token anterior y guardar nuevo
    await revokeRefreshToken(refreshToken);
    await saveRefreshToken(newRefreshToken, colaborador.id);
    
    return {
        success: true,
        token: newToken,
        refreshToken: newRefreshToken,
        user: {
            id: colaborador.id,
            rut: colaborador.rut,
            nombreCompleto: colaborador.nombreCompleto,
            email: colaborador.email,
            sucursalId: colaborador.sucursalId,
            permisos: colaborador.permisos || {}
        }
    };
}

export async function logoutUser(refreshToken: string): Promise<{ success: boolean }> {
    if (refreshToken) {
        await revokeRefreshToken(refreshToken);
    }
    return { success: true };
}

export async function logoutAllSessions(colaboradorId: number): Promise<{ success: boolean }> {
    await revokeAllRefreshTokens(colaboradorId);
    return { success: true };
}

export async function validateToken(token: string): Promise<{ valid: boolean; user?: any }> {
    const decoded = JWTUtils.verifyToken(token);
    if (!decoded) {
        return { valid: false };
    }
    
    // Verificar que el usuario sigue activo
    const colaborador = await findColaboradorById(parseInt(decoded.sub));
    if (!colaborador || !colaborador.activo) {
        return { valid: false };
    }
    
    return {
        valid: true,
        user: {
            id: decoded.sub,
            rut: decoded.rut,
            nombreCompleto: decoded.nombreCompleto,
            email: decoded.email,
            sucursalId: decoded.sucursalId,
            permisos: decoded.permisos
        }
    };
}

export async function cleanupExpiredTokens(): Promise<void> {
    await cleanExpiredTokens();
}