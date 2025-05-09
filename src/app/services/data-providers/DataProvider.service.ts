import { Injectable, signal } from '@angular/core';
import { DataProvider } from '@services/data-providers/interfaces/DataProvider';
import DBConnection from '@services/data-providers/DBConnection';
import { environment } from '@envs/environment';

import LocalStorageProvider from './LocalStorageProvider';
import { Weight } from '@models/types/Weight';
import { User } from '@models/types/User';
import { Goal } from '@models/types/Goal';

@Injectable({
    providedIn: 'root',
})
export class DataProviderService {

    connectionStatus = signal(false);

    private dataProvider!: DataProvider;

    constructor() {}

    async initialize() {
        if (environment.production) {
            this.dataProvider = new DBConnection();
        } else {
            this.dataProvider = new LocalStorageProvider();
        }

        await this.dataProvider.initializeConnection();
        this.connectionStatus.set(true);
    }

    async getWeights(): Promise<Weight[]> {
        return await this.dataProvider.getWeights();
    }

    async getGoal(): Promise<Goal> {
        return await this.dataProvider.getGoal();
    }

    async getUser(): Promise<User | null> {
        return await this.dataProvider.getUser();
    }

    setUser(user: User) {
        return this.dataProvider.setUser(user);
    }

    addWeight(value: Weight) {
        return this.dataProvider.addWeight(value);
    }

    deleteWeight(id: number) {
        return this.dataProvider.deleteWeight(id);
    }

    updateWeight(value: Weight) {
        return this.dataProvider.updateWeight(value);
    }

    generateWeightId(): number {
        return this.dataProvider.generateWeightId();
    }

    exportDataCSV(csv: string) {
        return this.dataProvider.exportDataCSV(csv);
    }
}
