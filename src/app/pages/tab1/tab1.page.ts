import { Component, effect, signal, WritableSignal } from '@angular/core';

import { WeightTrackerService } from '@services/WeightTracker.service';
import { Weight } from '@models/Weight';
import { WeightGraphic } from '@components/WeightGraphic/WeightGraphic.component';
import { WeightUnits } from '@models/Weight';
import { WeightDisplay } from '@components/WeightDisplay/WeightDisplay.component';

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    imports: [WeightGraphic, WeightDisplay],
})
export class Tab1Page {
    weights: WritableSignal<Weight[]> = signal<Weight[]>([]);
    goal: WritableSignal<Weight> = signal<Weight>({ date: new Date(), weight: 0, weight_units: WeightUnits.KG });

    constructor(private weightTrackerService: WeightTrackerService) {
        effect(() => {
            if (this.weightTrackerService.isAvailable()) {
                this.getWeights();
                this.getGoal();
            }
        });
    }

    async getWeights() {
        this.weights.set(await this.weightTrackerService.getWeights());
    }

    async getGoal() {
        this.goal.set(await this.weightTrackerService.getGoal());
    }
}
