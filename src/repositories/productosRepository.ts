import sql from 'mssql';
import { getConnection } from '../app/db/mssql';

export async function getProductos(code: string | null, sucursalId: string | null) {
    const pool = await getConnection();
    const request = pool.request();
    let query;

    if (code && sucursalId) {
        query = `
            SELECT id, nombre as name, precio as price, codigo as code, stock 
            FROM Productos 
            WHERE codigo = @code AND sucursalId = @sucursalId
        `;
        request.input('code', sql.NVarChar, code);
        request.input('sucursalId', sql.Int, Number(sucursalId));
        const result = await request.query(query);
        return result.recordset[0] || null;

    } else {
        query = `
            SELECT p.id, p.nombre, p.descripcion, p.categoria, p.precio, p.stock, p.sucursalId, p.codigo, p.fechaIngreso,
                   ie.tipo as estado, ie.cantidad as cantidadMovimiento
            FROM Productos p
            LEFT JOIN IngresosEgresos ie ON p.id = ie.productoId AND ie.tipo IN ('disponible', 'bodega', 'dañado', 'servicio tecnico', 'mermado')
        `;
        const result = await request.query(query);
        return result.recordset || [];
    }
}

export async function createProducto(productData: any) {
    const transaction = new sql.Transaction(await getConnection());
    try {
        const { nombre, descripcion, categoria, precio, stock, sucursalId, codigo, fechaIngreso } = productData;

        await transaction.begin();

        const productRequest = new sql.Request(transaction);
        productRequest.input('nombre', sql.NVarChar, nombre);
        productRequest.input('descripcion', sql.NVarChar, descripcion);
        productRequest.input('categoria', sql.NVarChar, categoria);
        productRequest.input('precio', sql.Float, precio);
        productRequest.input('stock', sql.Int, stock);
        productRequest.input('sucursalId', sql.Int, sucursalId);
        productRequest.input('codigo', sql.NVarChar, codigo);
        productRequest.input('fechaIngreso', sql.Date, fechaIngreso);

        const productResult = await productRequest.query(`
            INSERT INTO Productos (nombre, descripcion, categoria, precio, stock, sucursalId, codigo, fechaIngreso) 
            OUTPUT INSERTED.* 
            VALUES (@nombre, @descripcion, @categoria, @precio, @stock, @sucursalId, @codigo, @fechaIngreso)
        `);

        const nuevoProducto = productResult.recordset[0];
        const productoId = nuevoProducto.id;

        const incomeRequest = new sql.Request(transaction);
        incomeRequest.input('sucursalId', sql.Int, sucursalId);
        incomeRequest.input('tipo', sql.NVarChar, 'ingreso');
        incomeRequest.input('motivo', sql.NVarChar, 'ingreso manual');
        incomeRequest.input('productoId', sql.Int, productoId);
        incomeRequest.input('cantidad', sql.Int, stock);
        incomeRequest.input('fecha', sql.Date, fechaIngreso);

        await incomeRequest.query(`
            INSERT INTO IngresosEgresos (sucursalId, tipo, motivo, productoId, cantidad, fecha) 
            VALUES (@sucursalId, @tipo, @motivo, @productoId, @cantidad, @fecha)
        `);

        await transaction.commit();
        return nuevoProducto;

    } catch (error) {
        await transaction.rollback();
        throw error;
    }
}

export async function getProductosBySucursal(sucursalId: string) {
    const pool = await getConnection();
    const result = await pool.request()
        .input('sucursalId', sql.Int, sucursalId)
        .query(`
            SELECT id, nombre, precio, descripcion
            FROM Productos
            WHERE sucursalId = @sucursalId AND stock > 0
        `);
    return result.recordset || [];
}