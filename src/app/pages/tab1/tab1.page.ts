import { ChangeDetectorRef, Component, effect, signal, WritableSignal } from '@angular/core';

import { IonButton } from '@ionic/angular/standalone';
import { WeightTrackerService } from '@services/WeightTracker.service';
import Weight from '@models/Weight';
import { WeightGraphic } from '@components/WeightGraphic/WeightGraphic.component';

@Component({
    selector: 'app-tab1',
    templateUrl: 'tab1.page.html',
    styleUrls: ['tab1.page.scss'],
    imports: [IonButton, WeightGraphic],
})
export class Tab1Page {
    weights: WritableSignal<Weight[]> = signal<Weight[]>([]);

    constructor(private weightTrackerService: WeightTrackerService) {
        effect(() => {
            if (this.weightTrackerService.isAvailable()) {
                this.getWeights();
            }
        });
    }

    async getWeights() {
        this.weights.set(await this.weightTrackerService.getWeights());
    }
}
