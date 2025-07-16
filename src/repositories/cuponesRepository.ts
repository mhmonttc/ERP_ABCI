import sql from 'mssql';
import { getConnection } from '../app/db/mssql';

export async function getCupones() {
    const pool = await getConnection();
    const result = await pool.request().query("SELECT * FROM Cupones");
    return result.recordset || [];
}

export async function createCupon(cuponData: any) {
    const pool = await getConnection();
    const { nombre, textoCupon, montoDescuento, limiteUsoTotal, clienteId } = cuponData;

    const result = await pool.request()
        .input('nombre', sql.NVarChar, nombre)
        .input('textoCupon', sql.NVarChar, textoCupon)
        .input('montoDescuento', sql.Decimal(10, 2), montoDescuento)
        .input('limiteUsoTotal', sql.Int, limiteUsoTotal)
        .input('clienteId', sql.Int, clienteId || null)
        .query(`
            INSERT INTO Cupones (nombre, textoCupon, montoDescuento, limiteUsoTotal, clienteId)
            OUTPUT INSERTED.*
            VALUES (@nombre, @textoCupon, @montoDescuento, @limiteUsoTotal, @clienteId)
        `);

    return result.recordset[0];
}

export async function getCuponById(id: string) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query("SELECT * FROM Cupones WHERE id = @id");
    return result.recordset[0] || null;
}

export async function updateCupon(id: string, cuponData: any) {
    const pool = await getConnection();
    const { nombre, textoCupon, montoDescuento, limiteUsoTotal, clienteId } = cuponData;

    const result = await pool.request()
        .input('id', sql.Int, id)
        .input('nombre', sql.NVarChar, nombre)
        .input('textoCupon', sql.NVarChar, textoCupon)
        .input('montoDescuento', sql.Decimal(10, 2), montoDescuento)
        .input('limiteUsoTotal', sql.Int, limiteUsoTotal)
        .input('clienteId', sql.Int, clienteId || null)
        .query(`
            UPDATE Cupones
            SET nombre = @nombre,
                textoCupon = @textoCupon,
                montoDescuento = @montoDescuento,
                limiteUsoTotal = @limiteUsoTotal,
                clienteId = @clienteId
            WHERE id = @id;
        `);
    return result.rowsAffected[0] > 0;
}

export async function deleteCupon(id: string) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('id', sql.Int, id)
        .query("DELETE FROM Cupones WHERE id = @id");
    return result.rowsAffected[0] > 0;
}

export async function getUsoCupones(sucursalId: string | null) {
    const pool = await getConnection();
    let query = '';
    let requestBuilder = pool.request();

    if (sucursalId && sucursalId !== 'all') {
        requestBuilder.input('sucursalId', sql.Int, Number(sucursalId));
        query = `
            SELECT
                c.id AS idCupon,
                c.nombre AS nombreCupon,
                c.textoCupon AS textoCupon,
                c.montoDescuento AS montoDescuento,
                COUNT(a.id) AS usos,
                SUM(a.montoDescuento) AS montoTotalDescontado,
                MAX(a.fecha) AS ultimaFechaUso
            FROM
                cupones c
            JOIN
                agendamientos a ON c.textoCupon = a.cuponAplicado
            WHERE
                a.cuponAplicado IS NOT NULL AND a.cuponAplicado != ''
                AND a.sucursalId = @sucursalId
            GROUP BY
                c.id, c.nombre, c.textoCupon, c.montoDescuento
            ORDER BY
                usos DESC;
        `;
    } else {
        query = `
            SELECT
                c.id AS idCupon,
                c.nombre AS nombreCupon,
                c.textoCupon AS textoCupon,
                c.montoDescuento AS montoDescuento,
                COUNT(a.id) AS usos,
                SUM(a.montoDescuento) AS montoTotalDescontado,
                MAX(a.fecha) AS ultimaFechaUso,
                s.nombre AS sucursalNombre
            FROM
                cupones c
            JOIN
                agendamientos a ON c.textoCupon = a.cuponAplicado
            LEFT JOIN
                sucursales s ON a.sucursalId = s.id
            WHERE
                a.cuponAplicado IS NOT NULL AND a.cuponAplicado != ''
            GROUP BY
                c.id, c.nombre, c.textoCupon, c.montoDescuento, s.nombre
            ORDER BY
                usos DESC;
        `;
    }

    const result = await requestBuilder.query(query);
    return result.recordset;
}

export async function validateCupon(couponCode: string, cartDetails: any) {
    const pool = await getConnection();

    const result = await pool.request()
        .input('couponCode', sql.NVarChar, couponCode)
        .query('SELECT * FROM cupones WHERE textoCupon = @couponCode');

    const cupon = result.recordset[0];

    if (!cupon) {
        return { isValid: false, message: 'Cupón no encontrado.' };
    }

    let reglas = [];
    try {
        reglas = cupon.reglas ? JSON.parse(cupon.reglas) : [];
    } catch (e) {
        console.error("Error al parsear reglas del cupón:", e);
        throw new Error('Error interno: reglas de cupón inválidas.');
    }
    
    let allRulesMet = true;
    
    for (const regla of reglas) {
        const { campo, operador, valor } = regla;
        const cartValue = cartDetails[campo]; 

        if (cartValue === undefined || cartValue === null) { 
            allRulesMet = false;
            break;
        }

        let parsedValor: any = valor;
        
        if (['montoCompra', 'clienteId', 'montoDescuento', 'limiteUsoTotal'].includes(campo)) { 
            parsedValor = Number(valor);
            if (isNaN(parsedValor)) { 
                allRulesMet = false;
                break;
            }
        }

        switch (operador) {
            case '=':
                if (cartValue != parsedValor) allRulesMet = false;
                break;
            case '>':
                if (cartValue <= parsedValor) allRulesMet = false;
                break;
            case '<':
                if (cartValue >= parsedValor) allRulesMet = false;
                break;
            case 'contiene':
                if (!String(cartValue).includes(String(parsedValor))) allRulesMet = false;
                break;
            default:
                allRulesMet = false;
        }
        
        if (!allRulesMet) break;
    }

    if (allRulesMet) {
        const discountAmount = cupon.montoDescuento || 5000; 
        return { isValid: true, discount: discountAmount, message: 'Cupón aplicado con éxito.' };
    } else {
        return { isValid: false, message: 'El cupón no es válido para esta compra.' };
    }
}