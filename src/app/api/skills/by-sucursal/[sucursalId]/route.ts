import { NextRequest, NextResponse } from "next/server";
import { fetchSkillsBySucursal } from '../../../../../services/skillsService';

export async function GET(req: NextRequest, { params }: { params: { sucursalId: string } }) {
  try {
    const { sucursalId } = params;
    const skills = await fetchSkillsBySucursal(sucursalId);
    return NextResponse.json(skills);
  } catch (error) {
    console.error('Error en GET /api/skills/by-sucursal:', error);
    
    if (error instanceof Error && error.message === 'sucursalId is required') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}
