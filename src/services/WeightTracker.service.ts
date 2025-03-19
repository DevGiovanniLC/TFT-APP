import { Injectable, signal, WritableSignal } from '@angular/core';
import { emptyWeight, Weight } from '@models/types/Weight';
import { DataProviderService } from './data-providers/DataProvider.service';

@Injectable({
    providedIn: 'root',
})
export class WeightTrackerService {
    private weights: WritableSignal<Weight[]> = signal<Weight[]>([]);

    constructor(private dataProvider: DataProviderService) {}

    async getWeights(): Promise<Weight[]> {

        this.weights.set(await this.dataProvider.getWeights());

        // Convierte las fechas a Date y ordena la lista
        this.weights.update((weights) => weights.map((weight) => {
                weight.date = new Date(weight.date);
                return weight;
            }).sort((a, b) => a.date.getTime() - b.date.getTime())
        );

        return this.weights();
    }

    async getActualWeight(): Promise<Weight> {
        return await this.getWeights().then((weights) => weights[weights.length - 1]);
    }

    async getGoal(): Promise<Weight> {
        const goal = await this.dataProvider.getGoal();
        if (!!goal) goal.date = new Date(goal?.date);
        return goal;
    }

    setNewWeight(value: Weight){
        this.weights.update((weights) => [...weights, value]);
        return this.dataProvider.setNewWeight(value)
    }

    isAvailable(): boolean {
        return this.dataProvider.isConnected();
    }
}
