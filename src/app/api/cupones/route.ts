import { NextRequest, NextResponse } from "next/server";
import { fetchCupones, addCupon } from '../../../services/cuponesService';

export async function GET() {
  try {
    const cupones = await fetchCupones();
    return NextResponse.json(cupones);
  } catch (error) {
    console.error('Error en GET /api/cupones:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nuevoCupon = await addCupon(body);
    return NextResponse.json(nuevoCupon, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/cupones:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}
