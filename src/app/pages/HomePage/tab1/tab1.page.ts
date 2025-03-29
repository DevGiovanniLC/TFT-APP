import { ChangeDetectionStrategy, Component, effect, signal, WritableSignal } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { Weight } from '@models/types/Weight';
import { WeightGraphic } from '@pages/HomePage/components/WeightGraphic/WeightGraphic.component';
import { WeightUnits } from '@models/types/Weight';
import { MainDisplay } from '@pages/HomePage/components/MainDisplay/MainDisplay.component';
import { ConfigService } from '@services/Config.service';

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    standalone: true,
    imports: [
        IonContent, IonHeader, IonToolbar, IonTitle,
        WeightGraphic, MainDisplay
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Tab1Page {

    weights: WritableSignal<Weight[]> = signal<Weight[]>([]);
    goal: WritableSignal<Weight> = signal<Weight>({ date: new Date(NaN), weight: 0, weight_units: WeightUnits.KG });

    constructor(private weightTrackerService: WeightTrackerService, private config: ConfigService) {
        effect(() => {

            if (this.weightTrackerService.isAvailable()) {
                this.config.subscribe()()
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
        this.weightTrackerService.addWeight($event as Weight)
        this.getWeights();
        this.getGoal();
    }
}
