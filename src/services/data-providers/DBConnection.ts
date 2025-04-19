import { DataProvider } from '@services/data-providers/interfaces/DataProvider';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Weight } from '@models/types/Weight';
import { User } from '@models/types/User';

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

        // await this.deleteDBStructure().catch((err) => alert(err));

        await this.setBDStructure().catch((err) => alert(err));

        // await this.addUser()
        // .catch(err => alert(err));

        // await this.addWeights()
        // .catch(err => alert(err));

        return true;
    }

    async getUser(): Promise<User> {
        const user = await this.db.query(`
            SELECT * FROM user WHERE UniqueID = (SELECT MAX(UniqueID) FROM user)
        `);

        if (user?.values == undefined) throw new Error('No goal found');

        return user.values[0];
    }

    async getWeights(): Promise<Weight[]> {
        const registers = await this.db.query('SELECT * FROM registers');
        return registers.values as Weight[];
    }

    updateWeight(value: Weight): boolean {
        this.db
            .query(
                `
            UPDATE registers SET date = ?, weight = ?, weight_units = ? WHERE id = ?
        `,
                [value.date, value.weight, value.weight_units, value.id]
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

    async getGoal(): Promise<Weight> {
        const user = await this.db
            .query(
                `
            SELECT * FROM user WHERE UniqueID = (SELECT MAX(UniqueID) FROM user)
        `
            )
            .catch((err) => alert(err));

        if (user?.values?.length === 0) throw new Error('No goal found');
        if (user?.values == undefined) throw new Error('No goal found');

        return {
            id: 0,
            date: user.values[0].goal_date,
            weight: user.values[0].goal_weight,
            weight_units: user.values[0].goal_units,
        };
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

    addWeight(value: Weight): boolean {
        this.db
            .query(
                `
            INSERT INTO registers (date, weight, weight_units) VALUES
            (?, ?, ?)
            `,
                [value.date, value.weight, value.weight_units]
            )
            .catch((err) => alert(err));
        return true;
    }

    private async deleteDBStructure() {
        const schema = `
            DROP TABLE IF EXISTS registers;
            DROP TABLE IF EXISTS user;
            `;

        return await this.db.execute(schema);
    }

    private async setBDStructure() {
        const schema = `
            CREATE TABLE IF NOT EXISTS registers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                weight REAL,
                weight_units TEXT
            );

            CREATE TABLE IF NOT EXISTS user (
                UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT UNIQUE,
                age INTEGER,
                height REAL,
                goal_weight,
                goal_units TEXT,
                goal_date TEXT
            );
        `;

        return await this.db.execute(schema);
    }

    private async addWeights() {
        const data = [
            ['2025-01-04', 96.0],
            ['2025-01-11', 95.6],
            ['2025-01-18', 95.3],
            ['2025-01-25', 95.1],
            ['2025-02-01', 94.8],
            ['2025-02-08', 94.5],
            ['2025-02-15', 94.2],
            ['2025-02-22', 94.0],
            ['2025-03-01', 93.8],
            ['2025-03-08', 93.5],
            ['2025-03-15', 93.2],
            ['2025-03-22', 93.0],
        ];

        for (const [date, weight] of data) {
            await this.db.query(`INSERT INTO registers (date, weight, weight_units) VALUES (?, ?, ?)`, [
                date,
                weight,
                'kg',
            ]);
        }
    }

    private async addUser() {
        return await this.db.query(
            `
        INSERT INTO user (name, email, age, height, goal_weight, goal_units, goal_date) VALUES
        (?, ?, ?, ?, ?, ?, ?)
        `,
            ['John Doe', 'johndoe@gmail.com', 25, 180, 80, 'kg', '2025-12-31']
        );
    }

    private async closeConnection() {
        await this.db.close();
    }
}
