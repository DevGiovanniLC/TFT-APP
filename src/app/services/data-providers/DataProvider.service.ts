import { Injectable, signal } from '@angular/core';
import { DataProvider } from '@services/data-providers/interfaces/DataProvider';
import DBConnection from '@services/data-providers/DBConnection';
import { environment } from '@envs/environment';

import LocalStorageProvider from './LocalStorageProvider';
import { Weight } from '@models/types/Weight';
import { User } from '@models/types/User';
import { Goal } from '@models/types/Goal';

@Injectable({ providedIn: 'root' })
export class DataProviderService {
    connectionStatus = signal(false);
    private dataProvider: DataProvider;

    constructor() {
        this.dataProvider = environment.production
            ? new DBConnection()
            : new LocalStorageProvider();
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
}
