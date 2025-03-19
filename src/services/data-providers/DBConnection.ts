import { DataProvider } from 'src/interfaces/DataProvider';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { environment } from 'src/envs/environment';
import { Weight } from '@models/types/Weight';

export default class DBConnection implements DataProvider {
    private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
    private db!: SQLiteDBConnection;

    private readonly BDConf = {
        name: environment.dataBaseName,
        encrypted: false,
        mode: 'no-encryption',
        version: 1,
        readonly: false,
    };

    constructor() {}

    setNewWeight(value: Weight): boolean {
        throw new Error('Method not implemented.');
    }

    getGoal(): Promise<any> {
        throw new Error('Method not implemented.');
    }

    async initializeConnection(callback?: Function) {
        await this.checkJeep();

        this.db = await this.sqlite.createConnection(
            this.BDConf.name,
            this.BDConf.encrypted,
            this.BDConf.mode,
            this.BDConf.version,
            this.BDConf.readonly
        );

        await this.db.open().catch((err) => alert(err));

        await this.setBDStructure().catch((err) => alert(err));

        await this.addDataExamples().catch((err) => alert(err));
    }

    async getWeights(): Promise<any> {
        const registers = await this.db.query('SELECT * FROM registers ORDER BY date ASC');
        return registers.values;
    }

    private async checkJeep() {
        await customElements.whenDefined('jeep-sqlite');
        const jeepSqliteEl = document.querySelector('jeep-sqlite');

        if (jeepSqliteEl) {
            await jeepSqliteEl.componentOnReady();
        }
    }

    private async setBDStructure() {
        const schema = `
        DROP TABLE IF EXISTS registers;

        id INTEGER PRIMARY KEY AUTOINCREMENT,
        CREATE TABLE IF NOT EXISTS registers (
        date TEXT,
        weight REAL,
        weight_units TEXT
    );`;

        return await this.db.execute(schema);
    }

    private async addDataExamples() {
        return await this.db.query(
            `
        INSERT INTO registers (date, weight, weight_units) VALUES
        (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?);
    `,
            [
                '2025-01-01',
                100,
                'Kg',
                '2025-01-02',
                100,
                'Kg',
                '2025-01-03',
                100,
                'Kg',
                '2025-02-04',
                100,
                'Kg',
                '2025-03-05',
                100,
                'Kg',
            ]
        );
    }

    private async closeConnection() {
        await this.db.close();
    }
}
