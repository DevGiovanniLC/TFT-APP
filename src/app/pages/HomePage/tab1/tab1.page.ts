import { ChangeDetectionStrategy, Component, effect, signal, WritableSignal } from '@angular/core';
import { IonContent } from '@ionic/angular/standalone';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { Weight } from '@models/types/Weight';
import { WeightGraphic } from '@pages/HomePage/components/WeightGraphic/WeightGraphic.component';
import { WeightUnits } from '@models/types/Weight';
import { WeightDisplay } from '@components/WeightDisplay/WeightDisplay.component';
import { MainDisplay } from '@pages/HomePage/components/MainDisplay/MainDisplay.component';

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    standalone: true,
    imports: [
        IonContent,
        WeightGraphic, MainDisplay
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
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

    addWeight($event: Weight) {
        this.weightTrackerService.setNewWeight($event)
        this.getWeights();
        this.getGoal();
    }
}
