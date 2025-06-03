import { DataProvider } from '@services/data-providers/interfaces/DataProvider';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Weight } from '@models/types/Weight.type';
import { User } from '@models/types/User.type';
import { Goal } from '@models/types/Goal.type';

/**
 * Proveedor de datos basado en SQLite para almacenamiento local.
 * - Gestiona la conexión a la base de datos y la estructura de tablas.
 * - Implementa operaciones CRUD para usuarios, registros de peso y objetivos.
 * - Permite exportar datos en CSV y compartirlos.
 *
 * @export
 * @class SQLiteDataProvider
 * @implements {DataProvider}
 */
export default class SQLiteDataProvider implements DataProvider {
    /** Instancia de conexión SQLite */
    private readonly sqlite = new SQLiteConnection(CapacitorSQLite);
    private db!: SQLiteDBConnection;

    /** Configuración de la base de datos */
    private readonly DB_CONF = {
        name: 'app.db',
        encrypted: false,
        mode: 'no-encryption',
        version: 1,
        readonly: false,
    };

    /**
     * Inicializa la conexión a SQLite, crea tablas si es necesario.
     * @async
     * @returns {Promise<boolean>} true si la conexión se abrió correctamente.
     */
    async initializeConnection(): Promise<boolean> {
        try {
            this.db = await this.sqlite.createConnection(
                this.DB_CONF.name,
                this.DB_CONF.encrypted,
                this.DB_CONF.mode,
                this.DB_CONF.version,
                this.DB_CONF.readonly
            );
            await this.db.open();
            await this.setDBStructure();
            return true;
        } catch (err) {
            this.handleDBError(err);
        }
    }

    /**
     * Crea la estructura de tablas para registros y usuario.
     * @private
     * @async
     */
    private async setDBStructure(): Promise<void> {
        const schema = `
      CREATE TABLE IF NOT EXISTS registers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date INTEGER,
          weight REAL,
          weight_units TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_registers_date ON registers(date);
      CREATE TABLE IF NOT EXISTS user (
          UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT,
          email TEXT UNIQUE,
          age INTEGER,
          height REAL,
          gender TEXT,
          goal_weight REAL,
          goal_units TEXT,
          goal_date INTEGER
      );
    `;
        await this.db.execute(schema);
    }

    /**
     * Maneja errores de la base de datos lanzando alerta.
     * @private
     * @param {*} err - Objeto de error.
     * @throws {Error}
     */
    private handleDBError(err: unknown): never {
        const errorMessage = `❌ Database error: ${err}`;
        alert(errorMessage);
        throw new Error(errorMessage);
    }

    /**
     * Recupera todos los registros de peso ordenados por fecha descendente.
     * @async
     * @returns {Promise<Weight[]>} Array de registros con fecha convertida a Date.
     */
    async getWeights(): Promise<Weight[]> {
        const { values } = await this.db.query(
            'SELECT * FROM registers ORDER BY date DESC'
        );
        return (values ?? []).map((r: Weight) => ({
            id: r.id,
            date: new Date(r.date),
            weight: r.weight,
            weight_units: r.weight_units,
        }));
    }

    /**
     * Inserta un nuevo registro de peso.
     * @async
     * @param {Weight} value - Registro de peso.
     * @returns {Promise<boolean>} true si la inserción fue exitosa.
     */
    async addWeight(value: Weight): Promise<boolean> {
        try {
            await this.db.query(
                `INSERT INTO registers (date, weight, weight_units) VALUES (?, ?, ?)`,
                [value.date.getTime(), value.weight, value.weight_units]
            );
            return true;
        } catch (err) {
            this.handleDBError(err);
        }
    }

    /**
     * Actualiza un registro de peso existente.
     * @async
     * @param {Weight} value - Registro con datos actualizados.
     * @returns {Promise<boolean>} true si la actualización fue exitosa.
     */
    async updateWeight(value: Weight): Promise<boolean> {
        try {
            await this.db.query(
                `UPDATE registers SET date = ?, weight = ?, weight_units = ? WHERE id = ?`,
                [value.date.getTime(), value.weight, value.weight_units, value.id]
            );
            return true;
        } catch (err) {
            this.handleDBError(err);
        }
    }

    /**
     * Elimina un registro de peso por su ID.
     * @async
     * @param {number} id - Identificador del registro.
     * @returns {Promise<boolean>} true si la eliminación fue exitosa.
     */
    async deleteWeight(id: number): Promise<boolean> {
        try {
            await this.db.query(`DELETE FROM registers WHERE id = ?`, [id]);
            return true;
        } catch (err) {
            this.handleDBError(err);
        }
    }

    /**
     * Recupera el objetivo actual basado en el último usuario guardado.
     * @async
     * @returns {Promise<Goal | undefined>} Goal o undefined si no hay usuario.
     */
    async getGoal(): Promise<Goal | undefined> {
        const user = await this.getUser();
        if (!user) return undefined;
        return {
            weight: user.goal_weight,
            weight_units: user.goal_units,
            date: user.goal_date,
        };
    }

    /**
     * Recupera el último usuario registrado.
     * @async
     * @returns {Promise<User | undefined>} User o undefined si no hay registros.
     */
    async getUser(): Promise<User | undefined> {
        const { values } = await this.db.query(
            `SELECT * FROM user WHERE UniqueID = (SELECT MAX(UniqueID) FROM user)`
        );
        if (!values?.length) return undefined;
        const u: User = values[0];
        return {
            name: u.name,
            age: u.age,
            height: u.height,
            gender: u.gender,
            email: u.email,
            goal_weight: u.goal_weight,
            goal_units: u.goal_units,
            goal_date: u.goal_date ? new Date(Number(u.goal_date)) : undefined,
        };
    }

    /**
     * Inserta un nuevo usuario.
     * @async
     * @param {User} value - Datos del usuario.
     * @returns {Promise<boolean>} true si la inserción fue exitosa.
     */
    async setUser(value: User): Promise<boolean> {
        try {
            await this.db.query(
                `INSERT INTO user (name, email, age, height, gender, goal_weight, goal_units, goal_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    value.name,
                    value.email,
                    value.age,
                    value.height,
                    value.gender,
                    value.goal_weight,
                    value.goal_units,
                    value.goal_date?.getTime() ?? null,
                ]
            );
            return true;
        } catch (err) {
            this.handleDBError(err);
        }
    }

    /**
     * Exporta datos CSV a un archivo y lanza el diálogo de compartir.
     * @async
     * @param {string} csv - Contenido CSV.
     */
    async exportDataCSV(csv: string): Promise<void> {
        const fileName = `weights-history-${Date.now()}.csv`;
        await Filesystem.writeFile({
            path: fileName,
            data: csv,
            directory: Directory.Cache,
            encoding: Encoding.UTF8,
        });
        await this.shareCSVFile(fileName);
    }

    /**
     * Comparte el archivo CSV mediante el plugin de compartir.
     * @private
     * @async
     * @param {string} filePath - Nombre del archivo en caché.
     */
    private async shareCSVFile(filePath: string): Promise<void> {
        const { uri } = await Filesystem.getUri({
            directory: Directory.Cache,
            path: filePath,
        });
        await Share.share({ url: uri });
    }
}
