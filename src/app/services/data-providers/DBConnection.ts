import { DataProvider } from '@services/data-providers/interfaces/DataProvider';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
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

        await this.db.open().catch((err) => {
            this.throwDBError(err)
            return false;
        });

        await this.setBDStructure().catch((err) => {
            this.throwDBError(err)
            return false;
        });

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
            gender TEXT,
            goal_weight REAL,
            goal_units TEXT,
            goal_date INTEGER
        );
        `;

        return await this.db.execute(schema);
    }

    private throwDBError(err: any) {
        const errorMessage = `❌ Database error: ${err}`
        alert(errorMessage);
        throw new Error(errorMessage);
    }


    async getWeights(): Promise<Weight[]> {
        const registers = await this.db.query('SELECT * FROM registers ORDER BY date DESC');

        const weights: Weight[] = registers.values?.map((r: Weight) => ({
            id: r.id,
            date: new Date(r.date),
            weight: r.weight,
            weight_units: r.weight_units,
        })) as Weight[];

        return weights;
    }

    addWeight(value: Weight): boolean {
        this.db
            .query(`
            INSERT INTO registers (date, weight, weight_units) VALUES
            (?, ?, ?)`,
                [value.date.getTime(), value.weight, value.weight_units]
            )
            .catch((err) => {
                this.throwDBError(err)
                return false;
            });

        return true;
    }

    updateWeight(value: Weight): boolean {
        this.db
            .query(`
                UPDATE registers SET date = ?, weight = ?, weight_units = ? WHERE id = ?
                `,
                [value.date.getTime(), value.weight, value.weight_units, value.id]
            )
            .catch((err) => {
                this.throwDBError(err)
                return false;
            });
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
            .catch((err) => {
                this.throwDBError(err)
                return false;
            });

        return true;
    }

    async getGoal(): Promise<Goal | undefined> {
        const user = await this.getUser();

        if (!user) return undefined;

        const goal: Goal = {
            date: user.goal_date,
            weight: user.goal_weight,
            weight_units: user.goal_units,
        };

        return goal;
    }

    async getUser(): Promise<User | undefined> {
        const data = await this.db.query(`
            SELECT * FROM user WHERE UniqueID = (SELECT MAX(UniqueID) FROM user)
            `);


        if (!data.values || data.values.length === 0) return undefined

        const user: User = {
            name: data.values[0].name,
            age: data.values[0].age,
            height: data.values[0].height,
            gender: data.values[0].gender,
            email: data.values[0].email,
            goal_weight: data.values[0].goal_weight,
            goal_units: data.values[0].goal_units,
            goal_date: data.values[0].goal_date ? new Date(Number(data.values[0].goal_date)) : undefined,
        };

        return user;
    }


    setUser(value: User): boolean {
        this.db
            .query(
                `
                INSERT INTO user (name, email, age, height, gender, goal_weight, goal_units, goal_date) VALUES
                (?, ?, ?, ?, ?, ?, ?, ?)
                `,
                [value.name, value.email, value.age, value.height, value.gender, value.goal_weight, value.goal_units, value.goal_date?.getTime()]
            )
            .catch((err) => {
                this.throwDBError(err)
                return false;
            });

        return true;
    }

    async exportDataCSV(csv: string) {
        const fileName = `weights-history-${Date.now()}.csv`;

        await Filesystem.writeFile({
            path: fileName,
            data: csv,
            directory: Directory.Documents,
            encoding: Encoding.UTF8,
        });
        await this.shareCSVFile(fileName);

    }

    private async shareCSVFile(filePath: string) {

        const fileUri = await Filesystem.getUri({
            directory: Directory.Documents,
            path: filePath,
        });

        await Share.share({
            url: fileUri.uri,
        });

    }
}
