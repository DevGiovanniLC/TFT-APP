import { Injectable, signal } from '@angular/core';
import { DataProvider } from '@services/data-providers/interfaces/DataProvider';
import DBConnection from '@services/data-providers/DBConnection';
import { environment } from '@envs/environment';

import LocalStorageProvider from './LocalStorageProvider';
import { Weight } from '@models/types/Weight';
import { User } from '@models/types/User';

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

    async getGoal(): Promise<Weight> {
        return await this.dataProvider.getGoal();
    }

    async getUser(): Promise<User> {
        return await this.dataProvider.getUser();
    }

    setUser(user: User) {
        return this.dataProvider.setUser(user);
    }

    addWeight(value: Weight) {
        return this.dataProvider.addWeight(value);
    }

    isConnected(): boolean {
        return this.connectionStatus();
    }
}
