import sql from 'mssql';
import { getConnection } from '../app/db/mssql';

export async function getSkills() {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT * FROM Skills");
    return result.recordset || [];
}

export async function createSkill(skillData: any) {
    const pool = await getConnection();
    const { nombre, visible, habilitado } = skillData;
    
    const result = await pool.request()
        .input('nombre', sql.NVarChar, nombre)
        .input('visible', sql.Bit, visible)
        .input('habilitado', sql.Bit, habilitado)
        .query(`INSERT INTO Skills (nombre, visible, habilitado) OUTPUT INSERTED.* VALUES (@nombre, @visible, @habilitado)`);
    
    return result.recordset[0];
}

export async function updateSkill(id: string, skillData: any) {
    const pool = await getConnection();
    const { nombre, visible, habilitado } = skillData;
    
    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('nombre', sql.NVarChar, nombre)
        .input('visible', sql.Bit, visible)
        .input('habilitado', sql.Bit, habilitado)
        .query(`UPDATE Skills SET nombre=@nombre, visible=@visible, habilitado=@habilitado WHERE id=@id; SELECT * FROM Skills WHERE id=@id`);
    
    return result.recordset[0];
}

export async function deleteSkill(id: string) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM Skills WHERE id=@id');
    
    return result.rowsAffected[0] > 0;
}

export async function getSkillsBySucursal(sucursalId: string) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('sucursalId', sql.Int, sucursalId)
        .query(`
            SELECT DISTINCT s.*
            FROM Skills s
            INNER JOIN ColaboradorSkills cs ON s.id = cs.skillId
            INNER JOIN Colaboradores c ON cs.colaboradorId = c.id
            WHERE c.sucursalId = @sucursalId AND s.visible = 1
        `);
    
    return result.recordset || [];
}