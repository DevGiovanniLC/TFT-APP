import { Injectable, signal, WritableSignal } from '@angular/core';
import { Weight } from '@models/types/Weight';
import { DataProviderService } from './data-providers/DataProvider.service';

@Injectable({
    providedIn: 'root',
})
export class WeightTrackerService {
    private weights: WritableSignal<Weight[]> = signal<Weight[]>([]);

    constructor(private dataProvider: DataProviderService) {}

    async getWeights(): Promise<Weight[]> {
        this.weights.set(await this.dataProvider.getWeights());

        this.weights.update((weights) =>
            weights
                .map((w) => {
                    w.date = new Date(w.date);
                    return w;
                })
                .sort((a, b) => a.date.getTime() - b.date.getTime())
        );

        return this.weights();
    }

    async getActualWeight(): Promise<Weight> {
        return await this.getWeights().then((weights) => weights[weights.length - 1]);
    }

    async getGoal(): Promise<Weight> {
        const goal = await this.dataProvider.getGoal();
        if (goal) goal.date = new Date(goal?.date);
        return goal;
    }

    addWeight(value: Weight) {
        this.weights.update((weights) => [...weights, value]);
        return this.dataProvider.addWeight(value);
    }

    isAvailable(): boolean {
        return this.dataProvider.isConnected();
    }
}
