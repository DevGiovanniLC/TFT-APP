import { ChangeDetectionStrategy, Component, effect, signal, WritableSignal } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { Weight, WeightUnits } from '@models/types/Weight';
import { WeightGraphic } from '@pages/tabsPage/homePage/components/WeightGraphic/WeightGraphic.component';
import { MainDisplay } from '@pages/tabsPage/homePage/components/MainDisplay/MainDisplay.component';
import { ConfigService } from '@services/Config.service';

@Component({
    selector: 'app-tab1',
    templateUrl: 'Home.page.html',
    standalone: true,
    imports: [IonContent, IonHeader, IonToolbar, IonTitle, WeightGraphic, MainDisplay],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
    weights: WritableSignal<Weight[]> = signal<Weight[]>([]);
    goal: WritableSignal<Weight> = signal<Weight>({ date: new Date(NaN), weight: 0, weight_units: WeightUnits.KG });

    constructor(
        private readonly weightTrackerService: WeightTrackerService,
        private readonly config: ConfigService
    ) {
        effect(() => {
            if (this.weightTrackerService.isAvailable()) {
                this.config.subscribe()();
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
        this.weightTrackerService.addWeight($event);
        this.getWeights();
        this.getGoal();
    }
}
