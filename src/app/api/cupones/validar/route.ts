import { NextResponse } from 'next/server';
import { checkCuponValidity } from '../../../../services/cuponesService';

export async function POST(request: Request) {
  try {
    const { couponCode, cartDetails } = await request.json();
    const validationResult = await checkCuponValidity(couponCode, cartDetails);
    
    if (!validationResult.isValid) {
      const statusCode = validationResult.message === 'Cupón no encontrado.' ? 404 : 400;
      return NextResponse.json(validationResult, { status: statusCode });
    }
    
    return NextResponse.json(validationResult);
  } catch (error) {
    console.error('Error al validar el cupón:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
