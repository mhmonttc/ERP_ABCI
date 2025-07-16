import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getConnection } from '@/app/db/mssql';
import sql from 'mssql';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'El correo electrónico y la contraseña son obligatorios.' }, { status: 400 });
    }

    const pool = await getConnection();
    const userResult = await pool.request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM Clientes WHERE email = @email');

    if (userResult.recordset.length === 0) {
      return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
    }

    const user = userResult.recordset[0];
    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      return NextResponse.json({ message: 'Credenciales inválidas.' }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    return NextResponse.json({ message: 'Error en el servidor' }, { status: 500 });
  }
}
