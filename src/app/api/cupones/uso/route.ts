import { NextResponse } from 'next/server';
import { fetchUsoCupones } from '../../../../services/cuponesService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sucursalId = searchParams.get('sucursalId');
    const usoCupones = await fetchUsoCupones(sucursalId);
    return NextResponse.json(usoCupones);
  } catch (error) {
    console.error('Error al obtener el uso de campañas:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
