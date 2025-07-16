export interface JWTPayload {
    sub: string;           // ID del colaborador
    rut: string;           // RUT del colaborador
    nombreCompleto: string; // Nombre completo
    email: string;         // Email del colaborador
    sucursalId: number;    // ID de la sucursal
    permisos: object;      // Permisos del usuario
    iat: number;           // Issued at
    exp: number;           // Expiration time
}

export interface LoginCredentials {
    rut: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    token?: string;
    refreshToken?: string;
    user?: {
        id: number;
        rut: string;
        nombreCompleto: string;
        email: string;
        sucursalId: number;
        permisos: object;
    };
    message?: string;
}

export interface ColaboradorAuth {
    id: number;
    rut: string;
    nombreCompleto: string;
    email: string;
    password: string;
    sucursalId: number;
    activo: boolean;
    ultimoLogin?: Date;
    intentosFallidos: number;
    bloqueadoHasta?: Date;
    permisos?: object;
}

export interface AuthenticatedUser {
    id: string;
    rut: string;
    nombreCompleto: string;
    email: string;
    sucursalId: number;
    permisos: object;
}