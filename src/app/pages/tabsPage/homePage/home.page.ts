import { ChangeDetectionStrategy, Component, effect, signal, WritableSignal } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { Weight, WeightUnits } from '@models/types/Weight';
import { WeightGraphic } from '@pages/tabsPage/homePage/components/WeightGraphic/WeightGraphic.component';
import { MainDisplay } from '@pages/tabsPage/homePage/components/MainDisplay/MainDisplay.component';
import { ConfigService } from '@services/Config.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
    selector: 'app-tab1',
    templateUrl: 'Home.page.html',
    standalone: true,
    imports: [IonContent, IonHeader, IonToolbar, IonTitle, WeightGraphic, MainDisplay],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
    goal = toSignal(this.weightTrackerService.getGoal(), { initialValue: null });

    weights = toSignal(this.weightTrackerService.weights$, { initialValue: [] });

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
        this.weightTrackerService.getWeights().subscribe()
    }

    async getGoal() {
        this.weightTrackerService.getGoal().subscribe()
    }

    addWeight($event: Weight) {
        this.weightTrackerService.addWeight($event);
        this.getWeights();
        this.getGoal();
    }
}
