import { NextRequest, NextResponse } from "next/server";
import { fetchVentas, addVenta } from '../../../services/ventasService';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const filters = {
        sucursalId: searchParams.get('sucursalId'),
        mes: searchParams.get('mes'),
        colaboradorId: searchParams.get('colaboradorId')
    };

    try {
        const ventas = await fetchVentas(filters);
        return NextResponse.json(ventas);
    } catch (error) {
        console.error('Error en GET /api/ventas:', error);
        return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const result = await addVenta(body);
        return NextResponse.json({ message: 'Venta registrada con éxito', ventaId: result.ventaId }, { status: 201 });
    } catch (error) {
        console.error('Error en POST /api/ventas:', error);
        
        if (error instanceof Error && error.message === 'Faltan datos para registrar la venta.') {
            return NextResponse.json({ message: error.message }, { status: 400 });
        }
        
        const errorMessage = error instanceof Error ? error.message : 'Error desconocido.';
        return NextResponse.json({ message: errorMessage }, { status: 500 });
    }
}
