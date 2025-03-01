import { Injectable } from '@angular/core';
import { Weight } from 'src/models/Weight';
import { DataProviderService } from './DataProvider.service';

@Injectable({
    providedIn: 'root',
})
export class WeightTrackerService {
    private weights: Weight[] = [];

    constructor(private dataProvider: DataProviderService) { }

    async getWeights(): Promise<Weight[]> {
        if (this.weights.length === 0) {
            this.weights = await this.dataProvider.getWeights();
        }

        // Convierte las fechas a Date
        this.weights = this.weights.map(weight => {
            weight.date = new Date(weight.date);
            return weight;
        });

        // Ordena las fechas de forma ascendente
        this.weights.sort((a, b) => b.date.getTime() - a.date.getTime());

        return this.weights;
    }

    async getGoal(): Promise<Weight> {
        return await this.dataProvider.getGoal();
    }

    isAvailable(): boolean {
        return this.dataProvider.isConnected();
    }
}
