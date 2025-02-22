import { DataProvider } from "src/interfaces/DataProvider";
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from "@capacitor-community/sqlite";

export class DBConnection implements DataProvider {

  private sqlite: SQLiteConnection = new SQLiteConnection(CapacitorSQLite);
  private db!: SQLiteDBConnection;

  static db: DBConnection;

  constructor() {
    if (DBConnection.db) {
      return DBConnection.db;
    }

    DBConnection.db = this;
  }

  async initializeConnection() {
    await customElements.whenDefined('jeep-sqlite');
    const jeepSqliteEl = document.querySelector('jeep-sqlite');

    if (jeepSqliteEl) {
      await jeepSqliteEl.componentOnReady();
    }
    console.log("jeep-sqlite está listo");

    this.db = await this.sqlite.createConnection(
      'app.db',
      false,
      'no-encryption',
      1,
      false
    );
    await this.db.open();

    const schema =
      `CREATE TABLE IF NOT EXISTS registers
    (id INTEGER PRIMARY KEY AUTOINCREMENT, date TEXT,
    weight REAL, weight_units TEXT)`

    await this.db.execute(schema)

    await this.db.run(
      `INSERT INTO registers (date, weight, weight_units) VALUES
      ('2022-01-01', 100, 'kg'),
      ('2022-01-02', 100, 'kg'),
      ('2022-01-03', 100, 'kg'),
      ('2022-01-04', 100, 'kg'),
      ('2022-01-05', 100, 'kg'),`
    );
  }

  async getWeights(): Promise<any> {
    const registers = await this.db.execute('SELECT id, date, weight, weight_units FROM registers');
    return registers;
  }
}
