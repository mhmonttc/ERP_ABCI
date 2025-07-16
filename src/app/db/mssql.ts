import sql from 'mssql';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const config: sql.config = {
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  server: process.env.DB_SERVER || '',
  database: process.env.DB_NAME || '',
  options: {
    encrypt: true,
    trustServerCertificate: false, 
  },
};

let pool: sql.ConnectionPool | null = null;

export async function getConnection() {
  try {
    if (!pool) {
      
      console.log('Intentando conectar a SQL Server con:', {
        user: config.user,
        server: config.server,
        database: config.database,
        password: config.password ? '***' : '(vacío)',
      });
      if (!config.user || !config.password || !config.server || !config.database) {
        console.warn('ADVERTENCIA: Alguna variable de entorno para la conexión SQL está vacía:', {
          user: config.user,
          password: config.password ? '***' : '(vacío)',
          server: config.server,
          database: config.database,
        });
      }
      pool = await sql.connect(config);
      console.log('Conexión a SQL Server exitosa');
    }
    return pool;
  } catch (error: any) {
    console.error('Error al conectar a SQL Server:', error);
    throw error;
  }
}
