'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../providers/AuthProvider';

interface UseProtectedRouteOptions {
    redirectTo?: string;
    requiredPermissions?: string[];
}

export function useProtectedRoute(options: UseProtectedRouteOptions = {}) {
    const { isAuthenticated, user, isLoading } = useAuth();
    const router = useRouter();
    const { redirectTo = '/login', requiredPermissions = [] } = options;

    useEffect(() => {
        if (!isLoading) {
            // Si no está autenticado, redirigir al login
            if (!isAuthenticated) {
                router.push(redirectTo);
                return;
            }

            // Si requiere permisos específicos, verificar
            if (requiredPermissions.length > 0 && user) {
                const userPermissions = user.permisos as any;
                const hasPermission = requiredPermissions.some(permission => 
                    userPermissions && userPermissions[permission]
                );
                
                if (!hasPermission) {
                    router.push('/unauthorized');
                    return;
                }
            }
        }
    }, [isAuthenticated, isLoading, user, router, redirectTo, requiredPermissions]);

    return {
        isAuthenticated,
        user,
        isLoading
    };
}