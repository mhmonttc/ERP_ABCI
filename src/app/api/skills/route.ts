import { NextRequest, NextResponse } from "next/server";
import { fetchSkills, addSkill } from '../../../services/skillsService';

export async function GET() {
  try {
    const skills = await fetchSkills();
    return NextResponse.json(skills);
  } catch (error) {
    console.error('Error en GET /api/skills:', error);
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const skill = await addSkill(body);
    return NextResponse.json(skill, { status: 201 });
  } catch (error) {
    console.error('Error en POST /api/skills:', error);
    
    if (error instanceof Error && error.message === 'El nombre es obligatorio') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ error: 'Error interno del servidor', details: String(error) }, { status: 500 });
  }
}
