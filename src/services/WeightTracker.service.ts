import { computed, effect, Injectable, Signal } from '@angular/core';
import Weight from 'src/models/Weight';
import { DataProviderService } from './DataProvider.service';

@Injectable({
    providedIn: 'root',
})
export class WeightTrackerService {
    private weights: Weight[] = [];

    constructor(private dataProvider: DataProviderService) {}

    async getWeights(): Promise<Weight[]> {
        if (this.weights.length === 0) {
            this.weights = await this.dataProvider.getWeights();
        }
        return this.weights;
    }

    isAvailable(): boolean {
        return this.dataProvider.isConnected();
    }
}
