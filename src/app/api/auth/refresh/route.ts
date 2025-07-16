import { NextRequest, NextResponse } from 'next/server';
import { refreshAuthToken } from '../../../../services/authService';

export async function POST(request: NextRequest) {
    try {
        const { refreshToken } = await request.json();
        
        if (!refreshToken) {
            return NextResponse.json(
                { error: 'Refresh token requerido' },
                { status: 400 }
            );
        }
        
        const result = await refreshAuthToken(refreshToken);
        
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
        console.error('Error en refresh:', error);
        return NextResponse.json(
            { error: 'Error interno del servidor' },
            { status: 500 }
        );
    }
}