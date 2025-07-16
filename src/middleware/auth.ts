import { NextRequest, NextResponse } from 'next/server';
import { JWTUtils } from '../utils/jwt';
import { AuthenticatedUser } from '../types/auth';

export interface AuthenticatedRequest extends NextRequest {
    user?: AuthenticatedUser;
}

export function withAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
    return async (req: NextRequest): Promise<NextResponse> => {
        const authHeader = req.headers.get('Authorization');
        
        if (!authHeader) {
            return NextResponse.json(
                { error: 'Token de autorización requerido' },
                { status: 401 }
            );
        }
        
        const token = JWTUtils.getTokenFromHeader(authHeader);
        if (!token) {
            return NextResponse.json(
                { error: 'Formato de token inválido' },
                { status: 401 }
            );
        }
        
        const decoded = JWTUtils.verifyToken(token);
        if (!decoded) {
            return NextResponse.json(
                { error: 'Token inválido o expirado' },
                { status: 401 }
            );
        }
        
        // Agregar información del usuario a la request
        (req as AuthenticatedRequest).user = {
            id: decoded.sub,
            rut: decoded.rut,
            nombreCompleto: decoded.nombreCompleto,
            email: decoded.email,
            sucursalId: decoded.sucursalId,
            permisos: decoded.permisos
        };
        
        return handler(req as AuthenticatedRequest);
    };
}

export function withPermission(permission: string) {
    return function(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
        return withAuth(async (req: AuthenticatedRequest) => {
            const userPermissions = req.user?.permisos as any;
            
            if (!userPermissions || !userPermissions[permission]) {
                return NextResponse.json(
                    { error: 'Permisos insuficientes' },
                    { status: 403 }
                );
            }
            
            return handler(req);
        });
    };
}

export function withRole(role: string) {
    return function(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
        return withAuth(async (req: AuthenticatedRequest) => {
            const userPermissions = req.user?.permisos as any;
            
            if (!userPermissions || !userPermissions.roles || !userPermissions.roles.includes(role)) {
                return NextResponse.json(
                    { error: 'Rol insuficiente' },
                    { status: 403 }
                );
            }
            
            return handler(req);
        });
    };
}

export function withSucursal(sucursalId?: number) {
    return function(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
        return withAuth(async (req: AuthenticatedRequest) => {
            const userSucursalId = req.user?.sucursalId;
            
            if (sucursalId && userSucursalId !== sucursalId) {
                return NextResponse.json(
                    { error: 'Acceso denegado a esta sucursal' },
                    { status: 403 }
                );
            }
            
            return handler(req);
        });
    };
}

export function optionalAuth(handler: (req: AuthenticatedRequest) => Promise<NextResponse>) {
    return async (req: NextRequest): Promise<NextResponse> => {
        const authHeader = req.headers.get('Authorization');
        
        if (authHeader) {
            const token = JWTUtils.getTokenFromHeader(authHeader);
            if (token) {
                const decoded = JWTUtils.verifyToken(token);
                if (decoded) {
                    (req as AuthenticatedRequest).user = {
                        id: decoded.sub,
                        rut: decoded.rut,
                        nombreCompleto: decoded.nombreCompleto,
                        email: decoded.email,
                        sucursalId: decoded.sucursalId,
                        permisos: decoded.permisos
                    };
                }
            }
        }
        
        return handler(req as AuthenticatedRequest);
    };
}