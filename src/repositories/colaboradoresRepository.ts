import sql from 'mssql';
import { getConnection } from '../app/db/mssql';
import bcrypt from 'bcryptjs';

export async function getColaboradores() {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT * FROM Colaboradores");
    return result.recordset;
}

export async function createColaborador(colaboradorData: any) {
    const pool = await getConnection();
    const { nombreCompleto, rut, email, password, nacimiento, telefono, sucursal } = colaboradorData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.request()
        .input('nombreCompleto', sql.NVarChar, nombreCompleto)
        .input('rut', sql.NVarChar, rut)
        .input('email', sql.NVarChar, email)
        .input('password', sql.NVarChar, hashedPassword)
        .input('nacimiento', sql.Date, nacimiento)
        .input('telefono', sql.NVarChar, telefono)
        .input('sucursalId', sql.Int, sucursal)
        .query(`INSERT INTO Colaboradores (nombreCompleto, rut, email, password, nacimiento, telefono, sucursalId) OUTPUT INSERTED.* VALUES (@nombreCompleto, @rut, @email, @password, @nacimiento, @telefono, @sucursalId)`);
    return result.recordset[0];
}

export async function updateColaborador(id: string, colaboradorData: any) {
    const pool = await getConnection();
    const { nombreCompleto, rut, email, password, nacimiento, telefono, sucursal, skills } = colaboradorData;
    let hashedPassword = undefined;
    if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
    }
    
    await pool.request()
        .input('id', sql.Int, id)
        .input('nombreCompleto', sql.NVarChar, nombreCompleto)
        .input('rut', sql.NVarChar, rut)
        .input('email', sql.NVarChar, email)
        .input('nacimiento', sql.Date, nacimiento)
        .input('telefono', sql.NVarChar, telefono)
        .input('sucursalId', sql.Int, sucursal)
        .input('password', sql.NVarChar, hashedPassword)
        .query(`UPDATE Colaboradores SET nombreCompleto=@nombreCompleto, rut=@rut, email=@email, nacimiento=@nacimiento, telefono=@telefono, sucursalId=@sucursalId${hashedPassword ? ', password=@password' : ''} WHERE id=@id`);
    
    if (Array.isArray(skills)) {
        await pool.request().input('colaboradorId', sql.Int, id).query('DELETE FROM ColaboradorSkills WHERE colaboradorId=@colaboradorId');
        
        for (const skillId of skills) {
            await pool.request()
                .input('colaboradorId', sql.Int, id)
                .input('skillId', sql.Int, skillId)
                .query('INSERT INTO ColaboradorSkills (colaboradorId, skillId) VALUES (@colaboradorId, @skillId)');
        }
    }
    
    const colabResult = await pool.request().input('id', sql.Int, id).query('SELECT * FROM Colaboradores WHERE id=@id');
    const skillsResult = await pool.request().input('colaboradorId', sql.Int, id).query(`SELECT s.id, s.nombre FROM ColaboradorSkills cs JOIN Skills s ON cs.skillId = s.id WHERE cs.colaboradorId = @colaboradorId`);
    const colaborador = colabResult.recordset[0];
    colaborador.skills = skillsResult.recordset;
    return colaborador;
}

export async function deleteColaborador(id: string) {
    const pool = await getConnection();
    await pool.request().input('id', sql.Int, id).query('DELETE FROM Colaboradores WHERE id=@id');
}

export async function searchColaboradores(sucursalId: string, skillId: string) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('sucursalId', sql.Int, sucursalId)
        .input('skillId', sql.Int, skillId)
        .query(`
            SELECT c.* 
            FROM Colaboradores c
            INNER JOIN ColaboradorSkills cs ON c.id = cs.colaboradorId
            WHERE c.sucursalId = @sucursalId AND cs.skillId = @skillId
        `);
    return result.recordset || [];
}