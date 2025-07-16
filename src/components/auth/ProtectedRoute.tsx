'use client';

import { ReactNode } from 'react';
import { useProtectedRoute } from '../../hooks/useProtectedRoute';
import { Box, CircularProgress, Typography } from '@mui/material';

interface ProtectedRouteProps {
    children: ReactNode;
    requiredPermissions?: string[];
    redirectTo?: string;
}

export default function ProtectedRoute({ 
    children, 
    requiredPermissions = [], 
    redirectTo = '/login' 
}: ProtectedRouteProps) {
    const { isAuthenticated, isLoading } = useProtectedRoute({
        requiredPermissions,
        redirectTo
    });

    if (isLoading) {
        return (
            <Box
                display="flex"
                flexDirection="column"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                gap={2}
            >
                <CircularProgress size={40} />
                <Typography variant="body2" color="text.secondary">
                    Verificando autenticación...
                </Typography>
            </Box>
        );
    }

    if (!isAuthenticated) {
        return null; // La redirección se maneja en useProtectedRoute
    }

    return <>{children}</>;
}