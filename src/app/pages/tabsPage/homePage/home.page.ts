import { ChangeDetectionStrategy, Component, effect } from '@angular/core';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular/standalone';
import { WeightTrackerService } from '@services/WeightTracker.service';
import { Weight } from '@models/types/Weight';
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
    goal = toSignal(this.weightTracker.getGoal(), { initialValue: null });
    weights = toSignal(this.weightTracker.weights$, { initialValue: [] });
    actualWeight = toSignal(this.weightTracker.lastWeight$, { initialValue: null });


    constructor(
        private readonly weightTracker: WeightTrackerService,
        private readonly config: ConfigService
    ) {
        this.weightTracker.updateWeights().subscribe()
        this.weightTracker.updateLastWeight().subscribe()
        this.weightTracker.getGoal().subscribe()
        effect(() => {
            if (this.weightTracker.isAvailable()) {
                this.config.subscribe()();
            }
        });
    }


    addWeight($event: Weight) {
        this.weightTracker.addWeight($event);
        this.weightTracker.updateWeights().subscribe()
        this.weightTracker.updateLastWeight().subscribe()
    }
}
