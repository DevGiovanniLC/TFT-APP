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
 * - Permite exportar datos en formato CSV en base al dispositivo.
 *
 * @export
 * @class DataProviderService
 */
export class DataProviderService {
    private readonly connectionStatus = signal(false);

    private readonly dataProvider: DataProvider;

    constructor() {
        this.dataProvider = environment.production ? new SQLiteDataProvider() : new LocalStorageProvider();
    }

    async initialize(): Promise<boolean> {
        const status = await this.dataProvider.initializeConnection();
        this.connectionStatus.set(status);
        return status;
    }

    getWeights(): Promise<Weight[]> {
        return this.dataProvider.getWeights();
    }

    getGoal(): Promise<Goal | undefined> {
        return this.dataProvider.getGoal();
    }

    getUser(): Promise<User | undefined> {
        return this.dataProvider.getUser();
    }

    async setUser(user: User): Promise<boolean> {
        return this.dataProvider.setUser(user);
    }

    async addWeight(weight: Weight): Promise<boolean> {
        return this.dataProvider.addWeight(weight);
    }

    async deleteWeight(id: number): Promise<boolean> {
        return this.dataProvider.deleteWeight(id);
    }

    async updateWeight(weight: Weight): Promise<boolean> {
        return this.dataProvider.updateWeight(weight);
    }

    exportDataCSV(csv: string): Promise<void> {
        return this.dataProvider.exportDataCSV(csv);
    }

    shareImage(image: Blob, title?: string, text?: string): Promise<void> {
        return this.dataProvider.shareImage(image, title, text);
    }
}
