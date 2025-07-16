import { NextRequest, NextResponse } from "next/server";
import { findColaboradores } from '../../../../services/colaboradoresService';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sucursalId = searchParams.get('sucursalId');
    const skillId = searchParams.get('skillId');

    if (!sucursalId || !skillId) {
      return NextResponse.json({ error: 'sucursalId and skillId are required' }, { status: 400 });
    }

    const colaboradores = await findColaboradores(sucursalId, skillId);
    return NextResponse.json(colaboradores);
  } catch (error) {
    console.error('Error en GET /api/colaboradores/search:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}
