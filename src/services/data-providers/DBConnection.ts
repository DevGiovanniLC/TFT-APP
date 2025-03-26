import { DataProvider } from "src/interfaces/DataProvider";
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from "@capacitor-community/sqlite";
import { environment } from "src/envs/environment";
import { Weight } from "@models/types/Weight";
import { User } from "@models/types/User";

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

        // await this.deleteDBStructure()
        // .catch(err => alert(err));

        // await this.setBDStructure()
        // .catch(err => alert(err));

        // await this.addUser()
        // .catch(err => alert(err));

        // await this.addWeights()
        // .catch(err => alert(err));
    }

    async getUser(): Promise<User> {
        const user = await this.db.query(`
            SELECT * FROM user WHERE UniqueID = (SELECT MAX(UniqueID) FROM user)
        `);

        if (user?.values == undefined) throw new Error('No goal found');

        return user.values[0];
    }

    async getWeights(): Promise<any> {
        const registers = await this.db.query('SELECT * FROM registers');
        return registers.values;
    }

    async getGoal(): Promise<Weight> {
        const user = await this.db.query(`
            SELECT * FROM user WHERE UniqueID = (SELECT MAX(UniqueID) FROM user)
        `);

        if (user?.values?.length === 0) throw new Error('No goal found');
        if (user?.values == undefined) throw new Error('No goal found');

        return {
            date: user.values[0].goal_date,
            weight: user.values[0].goal_weight,
            weight_units: user.values[0].goal_units
        }
    }

    setUser(value: User): boolean {
        this.db.query(`
            INSERT INTO user (name, email, age, height, goal_weight, goal_units, goal_date) VALUES
            (?, ?, ?, ?, ?, ?, ?)
            `, [
            value.name,
            value.email,
            value.age,
            value.height,
            value.goal_weight,
            value.goal_units,
            value.goal_date
        ]);

        return true;
    }

    addWeight(value: Weight): boolean {
        this.db.query(`
            INSERT INTO registers (date, weight, weight_units) VALUES
            (?, ?, ?)
            `, [
            value.date,
            value.weight,
            value.weight_units
        ]);
        return true;
    }



    private async checkJeep() {
        await customElements.whenDefined('jeep-sqlite');
        const jeepSqliteEl = document.querySelector('jeep-sqlite');

        if (jeepSqliteEl) {
            await jeepSqliteEl.componentOnReady();
        }
    }


    private async deleteDBStructure() {
        const schema =
            `
            DROP TABLE IF EXISTS registers;
            DROP TABLE IF EXISTS user;
            `

        return await this.db.execute(schema)
    }

    private async setBDStructure() {
        const schema =
            `

            CREATE TABLE IF NOT EXISTS registers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT,
                weight REAL,
                weight_units TEXT
            );

            CREATE TABLE IF NOT EXISTS user (
                UniqueID INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                age INTEGER CHECK(age > 0),
                height REAL CHECK(height > 0),
                goal_weight REAL CHECK(goal_weight > 0),
                goal_units TEXT CHECK(goal_units IN ('kg', 'lbs')),
                goal_date TEXT -- Formato ISO 8601 (YYYY-MM-DD)
            );
        `

        return await this.db.execute(schema)

    }

    private async addWeights() {
        return await this.db.query(`
        INSERT INTO registers (date, weight, weight_units) VALUES
        (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?), (?, ?, ?);
        `, [
            '2025-01-04', 96, 'kg',
            '2025-01-10', 100, 'kg',
            '2025-02-02', 98, 'kg',
            '2025-02-03', 98, 'kg',
            '2025-03-05', 95, 'kg'
        ]);
    }

    private async addUser() {
        return await this.db.query(`
        INSERT INTO user (name, email, age, height, goal_weight, goal_units, goal_date) VALUES
        (?, ?, ?, ?, ?, ?, ?)
        `, [
            'John Doe',
            'johndoe@gmail.com',
            25,
            180,
            80,
            'kg',
            '2025-12-31'
        ]);
    }

    private async closeConnection() {
        await this.db.close();
    }
}
