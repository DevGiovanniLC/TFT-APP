import { Injectable, signal } from '@angular/core';
import { DataProvider } from 'src/interfaces/DataProvider';
import DBConnection from '@services/data-providers/DBConnection';
import JSONProvider from './JSONProvider';

import LocalStorageProvider from './LocalStorageProvider';
import { Weight} from '@models/Weight';

@Injectable({
    providedIn: 'root',
})
export class DataProviderService {
    connectionStatus = signal(false);

    private dataProvider!: DataProvider;

    constructor() {}

    async initialize() {
        //this.dataProvider = new DBConnection();
        this.dataProvider = new JSONProvider();
        await this.dataProvider.initializeConnection();
        this.connectionStatus.set(true);
    }

    async getWeights(): Promise<Weight[]> {
        return await this.dataProvider.getWeights();
    }

    async getGoal(): Promise<Weight> {
        return await this.dataProvider.getGoal();
    }

    setNewWeight(value: Weight){
        return this.dataProvider.setNewWeight(value)
    }

    isConnected(): boolean {
        return this.connectionStatus();
    }
}
