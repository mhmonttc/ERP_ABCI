import { NextRequest, NextResponse } from "next/server";
import { fetchSucursales, addSucursal } from '../../../services/sucursalesService';

export async function GET() {
  try {
    const sucursales = await fetchSucursales();
    return NextResponse.json(sucursales);
  } catch (error) {
    console.error('Error en GET /api/sucursales:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const sucursal = await addSucursal(body);
    return NextResponse.json(sucursal, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/sucursales:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}
