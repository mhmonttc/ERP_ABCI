import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '../../../../services/authService';

export async function POST(request: NextRequest) {
    try {
        const { rut, password } = await request.json();
        
        if (!rut || !password) {
            return NextResponse.json(
                { error: 'RUT y contraseña son requeridos' },
                { status: 400 }
            );
        }
        
        const result = await authenticateUser({ rut, password });
        
        if (!result.success) {
            return NextResponse.json(
                { error: result.message },
                { status: 401 }
            );
        }
        
        return NextResponse.json({
            token: result.token,
            refreshToken: result.refreshToken,
            user: result.user
        });
        
    } catch (error) {
        console.error('Error en login:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}