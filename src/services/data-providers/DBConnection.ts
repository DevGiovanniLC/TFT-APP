import { DataProvider } from "src/interfaces/DataProvider";
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from "@capacitor-community/sqlite";
import { environment } from "src/envs/environment";
import { Weight } from "@models/types/Weight";

export default class DBConnection implements DataProvider {
    private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
    private db!: SQLiteDBConnection;

    private readonly BDConf = {
        name: environment.dataBaseName,
        encrypted: false,
        mode: 'no-encryption',
        version: 1,
        readonly: false
    }

    constructor() { }
    getGoal(): Promise<Weight> {
        throw new Error("Method not implemented.");
    }
    setNewWeight(value: Weight): boolean {
        throw new Error("Method not implemented.");
    }

    async initializeConnection(callback?: Function) {
        await this.checkJeep();

        this.db = await this.sqlite.createConnection(
            this.BDConf.name,
            this.BDConf.encrypted,
            this.BDConf.mode,
            this.BDConf.version,
            this.BDConf.readonly
        )

        await this.db.open()
            .catch(err => alert(err));

        await this.setBDStructure()
            .catch(err => alert(err));

        await this.addDataExamples()
            .catch(err => alert(err));
    }

    async getWeights(): Promise<any> {
        const registers = await this.db.query('SELECT * FROM registers');
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
        const schema =
            `
                DROP TABLE IF EXISTS registers;

                CREATE TABLE IF NOT EXISTS registers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                weight REAL,
                weight_units TEXT
            );`

        return await this.db.execute(schema)

    }

    private async addDataExamples() {
        return await this.db.query(`
        INSERT INTO registers (date, weight, weight_units) VALUES
        (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?);
        `, [
                '2025-01-10', 100, 'kg',
                '2025-02-02', 98, 'kg',
                '2025-03-03', 98, 'kg',
                '2025-04-04', 96, 'kg',
                '2025-04-05', 95, 'kg'
            ]);
    }

    private async closeConnection() {
        await this.db.close();
    }
}
