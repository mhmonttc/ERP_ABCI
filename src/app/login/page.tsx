'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography } from '@mui/material';
import { useAuth } from '../../providers/AuthProvider';
import LoginForm from '../../components/auth/LoginForm';
import Image from 'next/image';

export default function LoginPage() {
    const { login, isAuthenticated, isLoading, error } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (isAuthenticated) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, router]);

    const handleLogin = async (rut: string, password: string) => {
        await login(rut, password);
    };

    if (isLoading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="100vh"
                bgcolor="white"
            >
                <Typography>Cargando...</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'white',
                backgroundImage: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            }}
        >
            <Container maxWidth="sm">
                <Box
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    gap={4}
                >
                    {/* Logo/Imagen referencial */}
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        gap={2}
                    >
                        <Box
                            sx={{
                                width: 120,
                                height: 120,
                                borderRadius: '50%',
                                bgcolor: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                            }}
                        >
                            <Typography
                                variant="h2"
                                color="white"
                                fontWeight="bold"
                            >
                                PA
                            </Typography>
                        </Box>
                        
                        <Typography
                            variant="h4"
                            component="h1"
                            fontWeight="bold"
                            color="text.primary"
                            textAlign="center"
                        >
                            Panel de Administración
                        </Typography>
                        
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            textAlign="center"
                        >
                            Ingresa con tu RUT y contraseña para acceder al sistema
                        </Typography>
                    </Box>

                    {/* Formulario de login */}
                    <LoginForm
                        onSubmit={handleLogin}
                        error={error || undefined}
                        isLoading={isLoading}
                    />

                    {/* Información adicional */}
                    <Box textAlign="center" mt={2}>
                        <Typography variant="body2" color="text.secondary">
                            © 2025 Panel de Administración. Todos los derechos reservados.
                        </Typography>
                    </Box>
                </Box>
            </Container>
        </Box>
    );
}