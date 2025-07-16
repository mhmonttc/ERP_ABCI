'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthenticatedUser } from '../types/auth';
import { RutValidator } from '../utils/rutValidator';

interface AuthContextType {
    user: AuthenticatedUser | null;
    login: (rut: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    isLoading: boolean;
    error: string | null;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthenticatedUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            validateToken(token);
        } else {
            setIsLoading(false);
        }
    }, []);

    const validateToken = async (token: string) => {
        try {
            const response = await fetch('/api/auth/validate', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
            }
        } catch (error) {
            console.error('Error validating token:', error);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (rut: string, password: string) => {
        setIsLoading(true);
        setError(null);

        try {
            // Validar formato de RUT
            if (!RutValidator.isValidRut(rut)) {
                throw new Error('Formato de RUT inválido');
            }

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ rut, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al iniciar sesión');
            }

            const data = await response.json();
            
            // Guardar tokens en localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);
            
            setUser(data.user);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Error desconocido');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await fetch('/api/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ refreshToken }),
                });
            }
        } catch (error) {
            console.error('Error during logout:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setUser(null);
            setError(null);
            setIsLoading(false);
        }
    };

    const value = {
        user,
        login,
        logout,
        isLoading,
        error,
        isAuthenticated: !!user,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}