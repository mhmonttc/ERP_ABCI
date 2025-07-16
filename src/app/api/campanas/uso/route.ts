import { NextResponse } from 'next/server';
import { fetchUsoCampanas } from '../../../../services/campanasService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sucursalId = searchParams.get('sucursalId');
    const usoCampanas = await fetchUsoCampanas(sucursalId);
    return NextResponse.json(usoCampanas);
  } catch (error) {
    console.error('Error al obtener el uso de campañas:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
