'use client';

import { Box, Typography, Button, Container, Card, CardContent } from '@mui/material';
import { useAuth } from '../../providers/AuthProvider';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { user, logout } = useAuth();
    const router = useRouter();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
                <Typography variant="h3" component="h1" fontWeight="bold">
                    Panel de Administración
                </Typography>
                <Button variant="outlined" color="primary" onClick={handleLogout}>
                    Cerrar Sesión
                </Button>
            </Box>

            <Box display="flex" flexDirection="column" gap={3}>
                <Box display="flex" gap={3} flexWrap="wrap">
                    <Card sx={{ flex: 1, minWidth: 300 }}>
                        <CardContent>
                            <Typography variant="h5" component="h2" gutterBottom>
                                Bienvenido
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Has iniciado sesión correctamente en el sistema.
                            </Typography>
                        </CardContent>
                    </Card>

                    <Card sx={{ flex: 1, minWidth: 300 }}>
                        <CardContent>
                            <Typography variant="h5" component="h2" gutterBottom>
                                Información del Usuario
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={1}>
                                <strong>Nombre:</strong> {user?.nombreCompleto}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={1}>
                                <strong>RUT:</strong> {user?.rut}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mb={1}>
                                <strong>Email:</strong> {user?.email}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                <strong>Sucursal ID:</strong> {user?.sucursalId}
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>

                <Card>
                    <CardContent>
                        <Typography variant="h5" component="h2" gutterBottom>
                            Rutas Disponibles
                        </Typography>
                        <Typography variant="body1" color="text.secondary" paragraph>
                            Todas las rutas están protegidas por autenticación JWT, excepto:
                        </Typography>
                        <Box component="ul" sx={{ pl: 2 }}>
                            <li>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>/login</strong> - Página de inicio de sesión
                                </Typography>
                            </li>
                            <li>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>/carrito</strong> - Página pública del carrito
                                </Typography>
                            </li>
                        </Box>
                    </CardContent>
                </Card>
            </Box>
        </Container>
    );
}