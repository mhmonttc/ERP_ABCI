'use client';

import { useState } from 'react';
import { 
    TextField, 
    Button, 
    Box, 
    Typography, 
    Alert,
    CircularProgress,
    Paper
} from '@mui/material';
import { RutValidator } from '../../utils/rutValidator';

interface LoginFormProps {
    onSubmit: (rut: string, password: string) => Promise<void>;
    error?: string;
    isLoading?: boolean;
}

export default function LoginForm({ onSubmit, error, isLoading }: LoginFormProps) {
    const [rut, setRut] = useState('');
    const [password, setPassword] = useState('');
    const [rutError, setRutError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    const handleRutChange = (value: string) => {
        // Limpiar el RUT y formatearlo
        const cleanRut = value.replace(/[^0-9kK]/g, '');
        if (cleanRut.length <= 9) {
            const formattedRut = formatRutAsYouType(cleanRut);
            setRut(formattedRut);
            setRutError('');
        }
    };

    const formatRutAsYouType = (rut: string) => {
        if (rut.length <= 1) return rut;
        if (rut.length <= 8) {
            const body = rut.slice(0, -1);
            const dv = rut.slice(-1);
            return body.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (body.length > 0 ? '-' + dv : dv);
        }
        const body = rut.slice(0, -1);
        const dv = rut.slice(-1);
        return body.replace(/\B(?=(\d{3})+(?!\d))/g, '.') + '-' + dv;
    };

    const validateForm = () => {
        let isValid = true;
        
        // Validar RUT
        if (!rut.trim()) {
            setRutError('El RUT es obligatorio');
            isValid = false;
        } else if (!RutValidator.isValidRut(rut)) {
            setRutError('Formato de RUT inválido');
            isValid = false;
        } else {
            setRutError('');
        }

        // Validar contraseña
        if (!password.trim()) {
            setPasswordError('La contraseña es obligatoria');
            isValid = false;
        } else if (password.length < 3) {
            setPasswordError('La contraseña debe tener al menos 3 caracteres');
            isValid = false;
        } else {
            setPasswordError('');
        }

        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) return;

        try {
            await onSubmit(rut, password);
        } catch (error) {
            // El error se maneja en el componente padre
        }
    };

    return (
        <Paper elevation={3} sx={{ padding: 4, width: '100%', maxWidth: 400 }}>
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <Typography variant="h4" component="h1" gutterBottom textAlign="center" color="primary">
                    Iniciar Sesión
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <TextField
                    fullWidth
                    label="RUT"
                    value={rut}
                    onChange={(e) => handleRutChange(e.target.value)}
                    error={!!rutError}
                    helperText={rutError || 'Ejemplo: 12.345.678-9'}
                    margin="normal"
                    disabled={isLoading}
                    placeholder="12.345.678-9"
                />

                <TextField
                    fullWidth
                    label="Contraseña"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    error={!!passwordError}
                    helperText={passwordError}
                    margin="normal"
                    disabled={isLoading}
                />

                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{ mt: 3, mb: 2, py: 1.5 }}
                >
                    {isLoading ? (
                        <Box display="flex" alignItems="center" gap={1}>
                            <CircularProgress size={20} color="inherit" />
                            Iniciando sesión...
                        </Box>
                    ) : (
                        'Iniciar Sesión'
                    )}
                </Button>

                <Box textAlign="center" mt={2}>
                    <Typography variant="body2" color="text.secondary">
                        Credenciales por defecto:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        RUT: 12.345.678-9 | Contraseña: admin
                    </Typography>
                </Box>
            </Box>
        </Paper>
    );
}