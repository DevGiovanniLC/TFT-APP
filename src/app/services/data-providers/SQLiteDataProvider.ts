import { DataProvider } from '@services/data-providers/interfaces/DataProvider';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Weight } from '@models/types/Weight.type';
import { User } from '@models/types/User.type';
import { Goal } from '@models/types/Goal.type';

export default class SQLiteDataProvider implements DataProvider {
    private readonly sqlite = new SQLiteConnection(CapacitorSQLite);
    private db!: SQLiteDBConnection;

    private readonly DB_CONF = {
        name: 'app.db',
        encrypted: false,
        mode: 'no-encryption',
        version: 1,
        readonly: false,
    };

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

    private handleDBError(err: unknown): never {
        const errorMessage = `❌ Database error: ${err}`;
        alert(errorMessage);
        throw new Error(errorMessage);
    }

    async getWeights(): Promise<Weight[]> {
        const { values } = await this.db.query('SELECT * FROM registers ORDER BY date DESC');
        return (values ?? []).map((r: Weight) => ({
            id: r.id,
            date: new Date(r.date),
            weight: r.weight,
            weight_units: r.weight_units,
        }));
    }

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

    async deleteWeight(id: number): Promise<boolean> {
        try {
            await this.db.query(
                `DELETE FROM registers WHERE id = ?`,
                [id]
            );
            return true;
        } catch (err) {
            this.handleDBError(err);
        }
    }

    async getGoal(): Promise<Goal | undefined> {
        const user = await this.getUser();
        if (!user) return undefined;
        return {
            date: user.goal_date,
            weight: user.goal_weight,
            weight_units: user.goal_units,
        };
    }

    async getUser(): Promise<User | undefined> {
        const { values } = await this.db.query(
            `SELECT * FROM user WHERE UniqueID = (SELECT MAX(UniqueID) FROM user)`
        );
        if (!values?.length) return undefined;
        const user = values[0];
        return {
            name: user.name,
            age: user.age,
            height: user.height,
            gender: user.gender,
            email: user.email,
            goal_weight: user.goal_weight,
            goal_units: user.goal_units,
            goal_date: user.goal_date ? new Date(Number(user.goal_date)) : undefined,
        };
    }

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

    private async shareCSVFile(filePath: string): Promise<void> {
        const { uri } = await Filesystem.getUri({
            directory: Directory.Cache,
            path: filePath,
        });
        await Share.share({ url: uri });
    }
}
