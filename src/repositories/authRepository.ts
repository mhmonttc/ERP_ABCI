import sql from 'mssql';
import bcrypt from 'bcryptjs';
import { getConnection } from '../app/db/mssql';
import { LoginCredentials, ColaboradorAuth } from '../types/auth';

export async function findColaboradorByRut(rut: string): Promise<ColaboradorAuth | null> {
    const pool = await getConnection();
    const result = await pool.request()
        .input('rut', sql.NVarChar, rut)
        .query(`
            SELECT c.*, p.menus as permisos
            FROM Colaboradores c
            LEFT JOIN Permisos p ON c.id = p.colaboradorId
            WHERE c.rut = @rut
        `);
    
    const colaborador = result.recordset[0];
    if (!colaborador) return null;
    
    return {
        ...colaborador,
        permisos: colaborador.permisos ? JSON.parse(colaborador.permisos) : {}
    };
}

export async function findColaboradorById(id: number): Promise<ColaboradorAuth | null> {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query(`
            SELECT c.*, p.menus as permisos
            FROM Colaboradores c
            LEFT JOIN Permisos p ON c.id = p.colaboradorId
            WHERE c.id = @id
        `);
    
    const colaborador = result.recordset[0];
    if (!colaborador) return null;
    
    return {
        ...colaborador,
        permisos: colaborador.permisos ? JSON.parse(colaborador.permisos) : {}
    };
}

export async function validatePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export async function updateLoginAttempts(colaboradorId: number, success: boolean): Promise<void> {
    const pool = await getConnection();
    
    if (success) {
        await pool.request()
            .input('colaboradorId', sql.Int, colaboradorId)
            .query(`
                UPDATE Colaboradores 
                SET ultimoLogin = GETDATE(), 
                    intentosFallidos = 0, 
                    bloqueadoHasta = NULL
                WHERE id = @colaboradorId
            `);
    } else {
        await pool.request()
            .input('colaboradorId', sql.Int, colaboradorId)
            .query(`
                UPDATE Colaboradores 
                SET intentosFallidos = intentosFallidos + 1,
                    bloqueadoHasta = CASE 
                        WHEN intentosFallidos + 1 >= 5 THEN DATEADD(MINUTE, 30, GETDATE())
                        ELSE bloqueadoHasta
                    END
                WHERE id = @colaboradorId
            `);
    }
}

export async function saveRefreshToken(token: string, colaboradorId: number): Promise<void> {
    const pool = await getConnection();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 días
    
    await pool.request()
        .input('token', sql.NVarChar, token)
        .input('colaboradorId', sql.Int, colaboradorId)
        .input('expiresAt', sql.DateTime, expiresAt)
        .query(`
            INSERT INTO RefreshTokens (token, colaboradorId, expiresAt)
            VALUES (@token, @colaboradorId, @expiresAt)
        `);
}

export async function validateRefreshToken(token: string): Promise<number | null> {
    const pool = await getConnection();
    const result = await pool.request()
        .input('token', sql.NVarChar, token)
        .query(`
            SELECT colaboradorId 
            FROM RefreshTokens 
            WHERE token = @token 
            AND expiresAt > GETDATE() 
            AND isRevoked = 0
        `);
    
    return result.recordset[0]?.colaboradorId || null;
}

export async function revokeRefreshToken(token: string): Promise<void> {
    const pool = await getConnection();
    await pool.request()
        .input('token', sql.NVarChar, token)
        .query(`
            UPDATE RefreshTokens 
            SET isRevoked = 1 
            WHERE token = @token
        `);
}

export async function revokeAllRefreshTokens(colaboradorId: number): Promise<void> {
    const pool = await getConnection();
    await pool.request()
        .input('colaboradorId', sql.Int, colaboradorId)
        .query(`
            UPDATE RefreshTokens 
            SET isRevoked = 1 
            WHERE colaboradorId = @colaboradorId
        `);
}

export async function cleanExpiredTokens(): Promise<void> {
    const pool = await getConnection();
    await pool.request()
        .query(`
            DELETE FROM RefreshTokens 
            WHERE expiresAt < GETDATE() OR isRevoked = 1
        `);
}