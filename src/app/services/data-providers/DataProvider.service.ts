import { Injectable, signal } from '@angular/core';
import { DataProvider } from '@services/data-providers/interfaces/DataProvider';
import SQLiteDataProvider from '@services/data-providers/SQLiteDataProvider';
import { environment } from '@envs/environment';

import LocalStorageProvider from './LocalStorageProvider';
import { Weight } from '@models/types/Weight.type';
import { User } from '@models/types/User.type';
import { Goal } from '@models/types/Goal.type';

@Injectable({ providedIn: 'root' })
/**
 * Servicio que abstrae el proveedor de datos según el entorno (SQLite o LocalStorage).
 * - Inicializa la conexión al proveedor.
 * - Proporciona métodos CRUD para usuarios, pesos y objetivos.
 * - Permite exportar datos en formato CSV.
 *
 * @export
 * @class DataProviderService
 */
export class DataProviderService {
    /**
     * Signal que indica el estado de conexión al proveedor de datos.
     * @private
     * @readonly
     */
    private readonly connectionStatus = signal(false);

    /**
     * Instancia concreta de DataProvider (SQLite o LocalStorage).
     * @private
     * @readonly
     */
    private readonly dataProvider: DataProvider;

    /**
     * Constructor que selecciona el proveedor según el modo producción.
     */
    constructor() {
        this.dataProvider = environment.production
            ? new SQLiteDataProvider()
            : new LocalStorageProvider();
    }

    /**
     * Inicializa la conexión con la base de datos o almacenamiento.
     * Actualiza el connectionStatus.
     * @returns {Promise<boolean>} `true` si la conexión fue exitosa.
     */
    async initialize(): Promise<boolean> {
        const status = await this.dataProvider.initializeConnection();
        this.connectionStatus.set(status);
        return status;
    }

    /**
     * Obtiene todos los registros de peso.
     * @returns {Promise<Weight[]>} Array de objetos Weight.
     */
    getWeights(): Promise<Weight[]> {
        return this.dataProvider.getWeights();
    }

    /**
     * Obtiene el objetivo (goal) del usuario.
     * @returns {Promise<Goal | undefined>} Objeto Goal o `undefined`.
     */
    getGoal(): Promise<Goal | undefined> {
        return this.dataProvider.getGoal();
    }

    /**
     * Obtiene los datos del usuario.
     * @returns {Promise<User | undefined>} Objeto User o `undefined`.
     */
    getUser(): Promise<User | undefined> {
        return this.dataProvider.getUser();
    }

    /**
     * Persiste los datos del usuario.
     * @param {User} user - Objeto User a guardar.
     * @returns {Promise<boolean>} `true` si la operación fue exitosa.
     */
    async setUser(user: User): Promise<boolean> {
        return this.dataProvider.setUser(user);
    }

    /**
     * Añade un nuevo registro de peso.
     * @param {Weight} weight - Objeto Weight a añadir.
     * @returns {Promise<boolean>} `true` si la operación fue exitosa.
     */
    async addWeight(weight: Weight): Promise<boolean> {
        return this.dataProvider.addWeight(weight);
    }

    /**
     * Elimina un registro de peso por su identificador.
     * @param {number} id - Identificador del registro a eliminar.
     * @returns {Promise<boolean>} `true` si la operación fue exitosa.
     */
    async deleteWeight(id: number): Promise<boolean> {
        return this.dataProvider.deleteWeight(id);
    }

    /**
     * Actualiza un registro de peso existente.
     * @param {Weight} weight - Objeto Weight con los datos actualizados.
     * @returns {Promise<boolean>} `true` si la operación fue exitosa.
     */
    async updateWeight(weight: Weight): Promise<boolean> {
        return this.dataProvider.updateWeight(weight);
    }

    /**
     * Exporta datos en formato CSV usando el proveedor.
     * @param {string} csv - Cadena con contenido CSV.
     * @returns {Promise<void>} Promise que se resuelve tras la exportación.
     */
    exportDataCSV(csv: string): Promise<void> {
        return this.dataProvider.exportDataCSV(csv);
    }
}
