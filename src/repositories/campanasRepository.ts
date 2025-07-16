import sql from 'mssql';
import { getConnection } from '../app/db/mssql';

interface Regla {
    id: number;
    campo: string;
    operador: string;
    valor: string;
}

interface Campana {
    id: number;
    nombre: string;
    descuento: number;
    sucursalId: number | null;
    fechaInicio: string;
    fechaFin: string;
    reglas: Regla[];
}

export async function getCampanas() {
    const pool = await getConnection();
    const result = await pool.request().query(`
        SELECT 
            c.id, 
            c.nombre, 
            c.descuento,
            c.sucursalId,
            c.fechaInicio,
            c.fechaFin,
            r.id as reglaId,
            r.campo,
            r.operador,
            r.valor
        FROM Campanas c
        LEFT JOIN ReglasCampana r ON c.id = r.campanaId
    `);

    const campanas = result.recordset.reduce((acc: Campana[], row: any) => {
        let campana = acc.find((c: Campana) => c.id === row.id);
        if (!campana) {
            campana = {
                id: row.id,
                nombre: row.nombre,
                descuento: row.descuento,
                sucursalId: row.sucursalId,
                fechaInicio: row.fechaInicio,
                fechaFin: row.fechaFin,
                reglas: []
            };
            acc.push(campana);
        }
        if (row.reglaId) {
            campana.reglas.push({
                id: row.reglaId,
                campo: row.campo,
                operador: row.operador,
                valor: row.valor
            });
        }
        return acc;
    }, [] as Campana[]);

    return campanas;
}

export async function createCampana(campanaData: any) {
    const {
        nombre,
        descuento,
        reglas,
        sucursalId,
        fechaInicio,
        fechaFin,
    } = campanaData;

    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const campanaRequest = new sql.Request(transaction);
        const resultCampana = await campanaRequest
            .input('nombre', sql.NVarChar, nombre)
            .input('descuento', sql.Decimal(5, 2), descuento)
            .input('sucursalId', sql.Int, sucursalId)
            .input('fechaInicio', sql.Date, fechaInicio)
            .input('fechaFin', sql.Date, fechaFin)
            .query(`
                INSERT INTO Campanas (nombre, descuento, sucursalId, fechaInicio, fechaFin)
                OUTPUT INSERTED.id
                VALUES (@nombre, @descuento, @sucursalId, @fechaInicio, @fechaFin);
            `);

        const campanaId = resultCampana.recordset[0].id;
        if (!campanaId) {
            throw new Error('No se pudo crear la campaña.');
        }

        for (const regla of reglas) {
            const reglaRequest = new sql.Request(transaction);
            await reglaRequest
                .input('campo', sql.NVarChar, regla.campo)
                .input('operador', sql.NVarChar, regla.operador)
                .input('valor', sql.NVarChar, regla.valor)
                .input('campanaId', sql.Int, campanaId)
                .query(`
                    INSERT INTO ReglasCampana (campo, operador, valor, campanaId)
                    VALUES (@campo, @operador, @valor, @campanaId);
                `);
        }

        await transaction.commit();

        return { id: campanaId, nombre, descuento, reglas, sucursalId, fechaInicio, fechaFin };

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

export async function deleteCampana(id: string) {
    const pool = await getConnection();
    const transaction = new sql.Transaction(pool);

    try {
        await transaction.begin();

        const deleteReglasRequest = new sql.Request(transaction);
        await deleteReglasRequest
            .input('campanaId', sql.Int, Number(id))
            .query('DELETE FROM ReglasCampana WHERE campanaId = @campanaId');

        const deleteCampanaRequest = new sql.Request(transaction);
        const result = await deleteCampanaRequest
            .input('id', sql.Int, Number(id))
            .query('DELETE FROM Campanas WHERE id = @id');
        
        if (result.rowsAffected[0] === 0) {
            throw new Error('Campaña no encontrada.');
        }

        await transaction.commit();
        
    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

export async function getUsoCampanas(sucursalId: string | null) {
    const pool = await getConnection();
    let query = '';
    let requestBuilder = pool.request();

    if (sucursalId && sucursalId !== 'all') {
        requestBuilder.input('sucursalId', sql.Int, Number(sucursalId));
        query = `
            SELECT
                ca.nombre AS nombreCampana,
                COUNT(a.id) AS usos,
                SUM(a.montoTotal) AS ingresosGenerados
            FROM
                campanas ca
            JOIN
                agendamientos a ON ca.nombre = a.campanaAplicada
            WHERE
                a.campanaAplicada IS NOT NULL AND a.campanaAplicada != ''
                AND a.sucursalId = @sucursalId
            GROUP BY
                ca.nombre
            ORDER BY
                usos DESC;
        `;
    } else {
        query = `
            SELECT
                ca.nombre AS nombreCampana,
                COUNT(a.id) AS usos,
                SUM(a.montoTotal) AS ingresosGenerados,
                s.nombre AS sucursalNombre
            FROM
                campanas ca
            JOIN
                agendamientos a ON ca.nombre = a.campanaAplicada
            LEFT JOIN
                sucursales s ON a.sucursalId = s.id
            WHERE
                a.campanaAplicada IS NOT NULL AND a.campanaAplicada != ''
            GROUP BY
                ca.nombre, s.nombre
            ORDER BY
                usos DESC;
        `;
    }

    const result = await requestBuilder.query(query);
    return result.recordset;
}