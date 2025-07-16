import { NextRequest, NextResponse } from 'next/server';
import { logoutUser } from '../../../../services/authService';

export async function POST(request: NextRequest) {
    try {
        const { refreshToken } = await request.json();
        
        if (refreshToken) {
            await logoutUser(refreshToken);
        }
        
        return NextResponse.json({ message: 'Logout exitoso' });
        
    } catch (error) {
        console.error('Error en logout:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}