import { DataProvider } from '@services/data-providers/interfaces/DataProvider';
import * as Papa from 'papaparse';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Weight } from '@models/types/Weight';
import { User } from '@models/types/User';
import { Goal } from '@models/types/Goal';

export default class DBConnection implements DataProvider {
    private readonly sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
    private db!: SQLiteDBConnection;

    private readonly BDConf = {
        name: 'app.db',
        encrypted: false,
        mode: 'no-encryption',
        version: 1,
        readonly: false,
    };

    async initializeConnection() {
        this.db = await this.sqlite.createConnection(
            this.BDConf.name,
            this.BDConf.encrypted,
            this.BDConf.mode,
            this.BDConf.version,
            this.BDConf.readonly
        );

        await this.db.open().catch((err) => alert(err));

        await this.setBDStructure().catch((err) => alert(err));

        return true;
    }
    private async setBDStructure() {
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
            goal_weight REAL,
            goal_units TEXT,
            goal_date TEXT
        );
        `;

        return await this.db.execute(schema);
    }


    async getWeights(): Promise<Weight[]> {
        const registers = await this.db.query('SELECT * FROM registers ORDER BY date DESC');
        return registers.values?.map((r: Weight) => ({
            id: r.id,
            date: new Date(r.date),
            weight: r.weight,
            weight_units: r.weight_units,
        })) as Weight[];
    }

    addWeight(value: Weight): boolean {
        this.db
            .query(
                `
            INSERT INTO registers (date, weight, weight_units) VALUES
            (?, ?, ?)
            `,
                [value.date.getTime(), value.weight, value.weight_units]
            )
            .catch((err) => alert(err));
        return true;
    }

    updateWeight(value: Weight): boolean {
        this.db
            .query(
                `
                UPDATE registers SET date = ?, weight = ?, weight_units = ? WHERE id = ?
                `,
                [value.date.getTime(), value.weight, value.weight_units, value.id]
            )
            .catch((err) => alert(err));
        return true;
    }

    deleteWeight(id: number): boolean {
        this.db
            .query(
                `
                DELETE FROM registers WHERE id = ?
                `,
                [id]
            )
            .catch((err) => alert(err));

        return true;
    }

    generateWeightId(): number {
        this.db
            .query(
                `
                SELECT MAX(id) as maxId FROM registers
                `
            )
            .then((result) => {
                if (result?.values?.length === 0) return 1;
                if (result?.values == undefined) return 1;

                return result.values[0].maxId + 1;
            })
            .catch((err) => alert(err));
        return 0;
    }

    async getGoal(): Promise<Goal> {
        const user = await this.db
            .query(
                `
                SELECT * FROM user WHERE UniqueID = (SELECT MAX(UniqueID) FROM user)
                `
            )
            .catch((err) => alert(err));

        if (user?.values?.length === 0) throw new Error('No goal found');
        if (user?.values == undefined) throw new Error('No goal found');

        const goal: Goal = {
            date: user.values[0].goal_date,
            weight: user.values[0].goal_weight,
            weight_units: user.values[0].goal_units,
        };

        return goal;
    }

    async getUser(): Promise<User> {
        const user = await this.db.query(`
            SELECT * FROM user WHERE UniqueID = (SELECT MAX(UniqueID) FROM user)
            `);

        if (user?.values == undefined) throw new Error('No goal found');

        return user.values[0];
    }


    setUser(value: User): boolean {
        this.db
            .query(
                `
                INSERT INTO user (name, email, age, height, goal_weight, goal_units, goal_date) VALUES
                (?, ?, ?, ?, ?, ?, ?)
                `,
                [value.name, value.email, value.age, value.height, value.goal_weight, value.goal_units, value.goal_date]
            )
            .catch((err) => alert(err));

        return true;
    }

    async exportDataCSV(): Promise<void> {
        const csv = Papa.unparse(await this.getWeights());

        const fileName = `weights-history-${Date.now()}.csv`;

        try {
            await Filesystem.writeFile({
                path: fileName,
                data: csv,
                directory: Directory.Documents,
                encoding: Encoding.UTF8,
            });

            console.log('✅ CSV guardado correctamente:', fileName);
        } catch (err) {
            console.error('❌ Error al guardar CSV:', err);
        }
    }
}
